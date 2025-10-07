'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Subject, UserCategory } from '@/types/learning';
import { subjectThemes } from '@/config/learningTheme';
import { useAdaptiveLesson } from '@/hooks/useLearningData';
import { QuizSubmissionResult } from '@/services/learningAPI';
import QuizModal from './QuizModal';

interface LessonPageProps {
  subject: Subject;
  moduleId: string;
  lessonId: string;
  userCategory: UserCategory;
  onBack: () => void;
  onTakeQuiz: () => void;
}

// Fallback lesson data for when API is unavailable
const getFallbackLesson = (subject: Subject, moduleId: string, lessonId: string, userCategory: UserCategory) => {
  return {
    id: lessonId,
    title: "Introduction to Variables",
    description: "Learn what variables are and how to use them",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    durationSec: 420,
    transcript: {
      text: userCategory === 'Builder' 
        ? "Welcome to our lesson on variables! A variable is like a special box that can hold different numbers. Think of it like a treasure chest - you can put different treasures inside it! For example, if we have a variable called 'x', we can put the number 3 inside it. So x = 3. Now, if we want to add 2 to our variable, we write x + 2. Since x = 3, that means 3 + 2 = 5!"
        : userCategory === 'Explorer'
        ? "A variable is a symbol that represents a number. For example, if x = 3, then x + 2 = 5. Variables help us write math expressions and solve equations. When you see a letter like x, y, or z in math, that's usually a variable."
        : "Variable = symbol representing a number. Example: x = 3, therefore x + 2 = 5. Variables enable algebraic expressions and equation solving. Key concept: substitution - replace variable with its value.",
      highlights: ["variables", "equations", "substitution"],
      inlineActivities: [],
      categoryFeatures: userCategory === 'Builder' ? {
        keyPoints: ["Variables are like boxes that hold numbers", "Replace the variable with its value to solve", "Practice makes perfect!"]
      } : userCategory === 'Innovator' ? {
        challenges: ["Try solving: If 3x + 5 = 14, what is x?"]
      } : userCategory === 'Explorer' ? {
        keyPoints: ["Variables are symbols for numbers", "Practice substitution to solve equations"],
        practiceQuestions: [
          { question: "If x = 5, what is x + 3?", answer: "8" },
          { question: "If y = 10, what is y - 4?", answer: "6" }
        ]
      } : undefined
    },
    quizMeta: {
      questionCount: userCategory === 'Builder' ? 22 : userCategory === 'Explorer' ? 15 : 12,
      skillTags: ['algebra', 'symbolic-reasoning'],
      hintPolicy: userCategory === 'Builder' || userCategory === 'Explorer' ? 'allowed' : 'disabled',
      passingScore: 70
    }
  };
};

const LessonPage: React.FC<LessonPageProps> = ({
  subject,
  moduleId,
  lessonId,
  userCategory,
  onBack,
  onTakeQuiz
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTranscript, setShowTranscript] = useState(true);
  const [fontSize, setFontSize] = useState('text-base');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const theme = subjectThemes[subject];
  
  // Use the adaptive lesson hook
  const { lesson, loading: lessonLoading, error: lessonError } = useAdaptiveLesson(lessonId, userCategory);
  
  // Fallback lesson for when API is unavailable
  const fallbackLesson = getFallbackLesson(subject, moduleId, lessonId, userCategory);
  const currentLesson = lesson || fallbackLesson;

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const speakTranscript = () => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(currentLesson.transcript.text);
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  useEffect(() => {
    return () => speechSynthesis.cancel();
  }, []);

  const handleTakeQuiz = () => {
    setShowQuizModal(true);
  };

  const handleCloseQuiz = () => {
    setShowQuizModal(false);
  };

  const handleQuizComplete = (result: QuizSubmissionResult) => {
    // This would typically update user progress
    console.log('Quiz completed with result:', result);
    // You could trigger animations, update XP, unlock achievements, etc.
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Modules
            </button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">{currentLesson.title}</h1>
              <p className="text-gray-600 capitalize">{subject} • {formatTime(currentLesson.durationSec)}</p>
              {lessonLoading && <p className="text-sm text-gray-500">Loading adaptive content...</p>}
              {lessonError && <p className="text-sm text-amber-600">Using offline content</p>}
            </div>

            <button
              onClick={handleTakeQuiz}
              className="px-6 py-2 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: theme.primary }}
            >
              Take Quiz
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Section */}
          <div className="lg:col-span-2">
            <motion.div
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative bg-black aspect-video">
                <video
                  ref={videoRef}
                  className="w-full h-full"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  controls
                >
                  <source src={currentLesson.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </motion.div>
          </div>

          {/* Transcript Section */}
          <div className="lg:col-span-1">
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Transcript</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFontSize(fontSize === 'text-sm' ? 'text-base' : fontSize === 'text-base' ? 'text-lg' : 'text-sm')}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                    aria-label="Change font size"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </button>
                  <button
                    onClick={speakTranscript}
                    className={`p-2 rounded-lg transition-colors ${isSpeaking ? 'bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    aria-label={isSpeaking ? 'Stop reading' : 'Read aloud'}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      {isSpeaking ? (
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.814L4.414 13.414A1 1 0 014 12.828V7.172a1 1 0 01.414-.814l3.969-3.5zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12c0-2.21-.896-4.21-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 12a5.983 5.983 0 01-.757 2.829 1 1 0 01-1.415-1.415A3.987 3.987 0 0013 12a3.987 3.987 0 00-.172-1.414 1 1 0 010-1.415z" clipRule="evenodd" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className={`${fontSize} text-gray-700 leading-relaxed space-y-3`}>
                <p>{currentLesson.transcript.text}</p>
                
                {/* Transcript highlights */}
                {currentLesson.transcript.highlights && currentLesson.transcript.highlights.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {currentLesson.transcript.highlights.map((highlight, index) => (
                      <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm font-medium">
                        {highlight}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Category-specific features */}
              {currentLesson.transcript.categoryFeatures?.keyPoints && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Key Points:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {currentLesson.transcript.categoryFeatures.keyPoints.map((point, index) => (
                      <li key={index}>• {point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {currentLesson.transcript.categoryFeatures?.practiceQuestions && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">🔍 Practice Questions:</h4>
                  <div className="space-y-2">
                    {currentLesson.transcript.categoryFeatures.practiceQuestions.map((qa, index) => (
                      <details key={index} className="text-sm text-green-800">
                        <summary className="cursor-pointer font-medium hover:text-green-900">
                          {qa.question}
                        </summary>
                        <p className="mt-1 pl-4 text-green-700">{qa.answer}</p>
                      </details>
                    ))}
                  </div>
                </div>
              )}

              {currentLesson.transcript.categoryFeatures?.challenges && (
                <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">🚀 Challenges:</h4>
                  <div className="space-y-2">
                    {currentLesson.transcript.categoryFeatures.challenges.map((challenge, index) => (
                      <p key={index} className="text-sm text-purple-800">
                        {challenge}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      <QuizModal
        isOpen={showQuizModal}
        onClose={handleCloseQuiz}
        lessonId={lessonId}
        userCategory={userCategory}
        subjectTheme={theme.primary}
        onQuizComplete={handleQuizComplete}
      />
    </div>
  );
};

export default LessonPage;