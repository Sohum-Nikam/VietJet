'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Subject, UserCategory, LearningProgress } from '@/types/learning';
import { subjectThemes } from '@/config/learningTheme';
import GradeOverlay from './GradeOverlay';
import SubjectCarousel from './SubjectCarousel';
import ModuleBoard from './ModuleBoard';
import LessonPage from './LessonPage';
import ProgressTracker from './ProgressTracker';
import { useGrades, useSubjects, useModules, useLearningProgress, useSubjectTheme } from '@/hooks/useLearningData';
import LearningAPIService from '@/services/learningAPI';

interface LearningPageProps {
  userCategory: UserCategory;
  progress: LearningProgress;
  onProgressUpdate: (progress: Partial<LearningProgress>) => void;
}

type ViewState = 'grade-selection' | 'subject-selection' | 'module-board' | 'lesson-view';

export const LearningPage: React.FC<LearningPageProps> = ({
  userCategory,
  progress,
  onProgressUpdate
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const [currentView, setCurrentView] = useState<ViewState>('grade-selection');
  const [selectedGrade, setSelectedGrade] = useState<number | null>(
    progress.currentGrade || null
  );
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Initialize view based on URL params and progress
  useEffect(() => {
    const grade = searchParams.get('grade');
    const subject = searchParams.get('subject') as Subject;
    const module = searchParams.get('module');
    const lesson = searchParams.get('lesson');
    const forceGradeSelect = searchParams.get('gradeSelect');

    if (forceGradeSelect) {
      setCurrentView('grade-selection');
      setSelectedGrade(null);
    } else if (grade) {
      setSelectedGrade(parseInt(grade));
      setCurrentView(subject ? 'module-board' : 'subject-selection');
    } else if (progress.currentGrade) {
      setSelectedGrade(progress.currentGrade);
      setCurrentView('subject-selection');
    } else {
      setCurrentView('grade-selection');
    }

    if (subject) setSelectedSubject(subject);
    if (module) setSelectedModule(module);
    if (lesson) setSelectedLesson(lesson);
  }, [location.search, progress.currentGrade]);

  const handleGradeSelect = (grade: number) => {
    setSelectedGrade(grade);
    setCurrentView('subject-selection');
    
    // Update URL
    const params = new URLSearchParams(location.search);
    params.set('grade', grade.toString());
    navigate(`/learning?${params.toString()}`, { replace: true });
    
    // Update progress
    onProgressUpdate({
      currentGrade: grade
    });
  };

  const handleSubjectSelect = (subject: Subject) => {
    setIsTransitioning(true);
    setSelectedSubject(subject);
    
    // Animate transition to module board
    setTimeout(() => {
      setCurrentView('module-board');
      setIsTransitioning(false);
      
      // Update URL
      const params = new URLSearchParams(location.search);
      params.set('subject', subject);
      navigate(`/learning?${params.toString()}`, { replace: true });
    }, 800);
  };

  const handleModuleSelect = (moduleId: string) => {
    setSelectedModule(moduleId);
    
    // Update URL
    const params = new URLSearchParams(location.search);
    params.set('module', moduleId);
    navigate(`/learning?${params.toString()}`, { replace: true });
  };

  const handleLessonSelect = (lessonId: string) => {
    setSelectedLesson(lessonId);
    setCurrentView('lesson-view');
    
    // Update URL
    const params = new URLSearchParams(location.search);
    params.set('lesson', lessonId);
    navigate(`/learning?${params.toString()}`, { replace: true });
  };

  const handleBackNavigation = () => {
    if (currentView === 'lesson-view') {
      setCurrentView('module-board');
      setSelectedLesson(null);
      
      // Remove lesson from URL
      const params = new URLSearchParams(location.search);
      params.delete('lesson');
      navigate(`/learning?${params.toString()}`, { replace: true });
    } else if (currentView === 'module-board') {
      setCurrentView('subject-selection');
      setSelectedSubject(null);
      setSelectedModule(null);
      
      // Remove subject and module from URL
      const params = new URLSearchParams(location.search);
      params.delete('subject');
      params.delete('module');
      navigate(`/learning?${params.toString()}`, { replace: true });
    } else if (currentView === 'subject-selection') {
      setCurrentView('grade-selection');
      setSelectedGrade(null);
      
      // Remove grade from URL
      const params = new URLSearchParams(location.search);
      params.delete('grade');
      navigate('/learning', { replace: true });
    }
  };

  const handleLessonComplete = (lessonId: string) => {
    // Update progress
    const updatedProgress = {
      ...progress,
      completedLessons: [...progress.completedLessons, lessonId],
      totalXp: progress.totalXp + 50, // Base XP per lesson
    };
    
    onProgressUpdate(updatedProgress);
  };

  const handleModuleComplete = (moduleId: string) => {
    // Update progress
    const updatedProgress = {
      ...progress,
      completedModules: [...progress.completedModules, moduleId],
      totalXp: progress.totalXp + 200, // Bonus XP for module completion
    };
    
    onProgressUpdate(updatedProgress);
  };

  // Get current theme based on selected subject
  const currentTheme = selectedSubject ? subjectThemes[selectedSubject] : {
    primary: '#10B981',
    secondary: '#059669', 
    light: '#D1FAE5',
    dark: '#047857',
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    icon: '🎓'
  };

  // Page transition variants
  const pageVariants = {
    initial: { 
      opacity: 0,
      scale: 0.95,
      y: 20
    },
    animate: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    },
    exit: { 
      opacity: 0,
      scale: 1.05,
      y: -20,
      transition: {
        duration: 0.3
      }
    }
  };

  // Subject expansion animation
  const subjectExpandVariants = {
    initial: {
      scale: 1,
      borderRadius: '16px'
    },
    expanding: {
      scale: 20,
      borderRadius: '0px',
      transition: {
        duration: 0.8
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 relative overflow-hidden">
      {/* Dynamic background based on current subject */}
      <motion.div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          background: currentTheme.gradient,
        }}
        animate={{
          opacity: selectedSubject ? 0.1 : 0.05,
        }}
        transition={{ duration: 0.8 }}
      />

      {/* Main Content Container */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {/* Grade Selection Overlay */}
          {currentView === 'grade-selection' && (
            <GradeOverlay
              isVisible={true}
              onGradeSelect={handleGradeSelect}
              onClose={() => {}}
              userAge={12} // Would come from user profile
              requireParentConfirm={false}
            />
          )}

          {/* Subject Selection View */}
          {currentView === 'subject-selection' && selectedGrade !== null && (
            <motion.div
              key="subject-selection"
              className="container mx-auto px-6 py-12"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                  {/* Back Button */}
                  <motion.button
                    className="mb-8 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    onClick={handleBackNavigation}
                    whileHover={{ x: -4 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to grade selection
                  </motion.button>

                  {/* Grade Display */}
                  <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
                      Grade {selectedGrade} Learning Path
                    </div>
                  </motion.div>

                  {/* Subject Carousel */}
                  <SubjectCarousel
                    selectedSubject={selectedSubject || undefined}
                    onSubjectSelect={handleSubjectSelect}
                  />
                </div>

                {/* Progress Tracker Sidebar */}
                <motion.div
                  className="lg:col-span-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <ProgressTracker
                    userCategory={userCategory}
                    progress={{
                      currentGrade: selectedGrade,
                      totalXp: progress.totalXp,
                      completedLessons: progress.completedLessons,
                      completedModules: progress.completedModules,
                      badges: progress.badges,
                      streaks: {
                        daily: progress.currentStreak,
                        weekly: Math.floor(progress.currentStreak / 7)
                      }
                    }}
                    subjectTheme={currentTheme.primary}
                  />
                </motion.div>
              </div>

              {/* Subject Transition Animation */}
              <AnimatePresence>
                {isTransitioning && selectedSubject && (
                  <motion.div
                    className="fixed inset-0 z-50"
                    style={{
                      background: subjectThemes[selectedSubject].gradient,
                    }}
                    variants={subjectExpandVariants}
                    initial="initial"
                    animate="expanding"
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Module Board View */}
          {currentView === 'module-board' && selectedSubject && selectedGrade !== null && (
            <motion.div
              key="module-board"
              className="min-h-screen"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.light} 0%, white 50%)`
              }}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <ModuleBoard
                subject={selectedSubject}
                grade={selectedGrade}
                userCategory={userCategory}
                onModuleSelect={handleModuleSelect}
                onBack={handleBackNavigation}
              />
            </motion.div>
          )}

          {/* Lesson View */}
          {currentView === 'lesson-view' && selectedLesson && selectedModule && selectedSubject && (
            <motion.div
              key="lesson-view"
              className="min-h-screen"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <LessonPage
                lessonId={selectedLesson}
                moduleId={selectedModule}
                subject={selectedSubject}
                userCategory={userCategory}
                onBack={handleBackNavigation}
                onTakeQuiz={() => handleLessonComplete(selectedLesson)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Progress Indicator */}
      {selectedGrade !== null && (
        <motion.div
          className="fixed top-6 right-6 z-40"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="font-medium">Grade {selectedGrade}</span>
              <div className="text-gray-500">|</div>
              <span className="text-orange-600 font-medium">{progress.totalXp} XP</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LearningPage;