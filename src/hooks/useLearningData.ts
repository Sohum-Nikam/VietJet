/**
 * Custom React Hooks for Learning Data Management
 * Provides reactive state management and caching for learning content
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Subject, UserCategory } from '@/types/learning';
import LearningAPIService, {
  GradeInfo,
  SubjectWithModules,
  ModuleWithLessons,
  AdaptiveLesson,
  GeneratedQuiz,
  QuizSubmissionResult
} from '@/services/learningAPI';

// Custom hook for grades data
export const useGrades = () => {
  const [grades, setGrades] = useState<GradeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);
        const gradesData = await LearningAPIService.getAvailableGrades();
        setGrades(gradesData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch grades');
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  return { grades, loading, error };
};

// Custom hook for subjects data
export const useSubjects = (grade: number | null) => {
  const [subjects, setSubjects] = useState<SubjectWithModules[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (grade === null) {
      setSubjects([]);
      return;
    }

    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const subjectsData = await LearningAPIService.getSubjectsForGrade(grade);
        setSubjects(subjectsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch subjects');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [grade]);

  return { subjects, loading, error };
};

// Custom hook for modules data
export const useModules = (grade: number | null, subject: Subject | null) => {
  const [modules, setModules] = useState<ModuleWithLessons[]>([]);
  const [subjectTheme, setSubjectTheme] = useState<string>('#6B46C1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (grade === null || subject === null) {
      setModules([]);
      return;
    }

    const fetchModules = async () => {
      try {
        setLoading(true);
        const { modules: modulesData, subjectTheme: theme } = await LearningAPIService.getModulesForSubject(grade, subject);
        setModules(modulesData);
        setSubjectTheme(theme);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch modules');
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [grade, subject]);

  return { modules, subjectTheme, loading, error };
};

// Custom hook for adaptive lesson data
export const useAdaptiveLesson = (lessonId: string | null, userCategory: UserCategory) => {
  const [lesson, setLesson] = useState<AdaptiveLesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLesson = useCallback(async () => {
    if (!lessonId) {
      setLesson(null);
      return;
    }

    try {
      setLoading(true);
      const lessonData = await LearningAPIService.getAdaptiveLesson(lessonId, userCategory);
      setLesson(lessonData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch lesson');
    } finally {
      setLoading(false);
    }
  }, [lessonId, userCategory]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  return { lesson, loading, error, refetch: fetchLesson };
};

// Custom hook for quiz generation and management
export const useQuiz = (lessonId: string | null, userCategory: UserCategory) => {
  const [quiz, setQuiz] = useState<GeneratedQuiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, {
    selectedOptionId: string;
    timeSpentSeconds: number;
    hintsUsed: number;
  }>>({});
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizSubmissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate quiz
  const generateQuiz = useCallback(async (customQuestionCount?: number) => {
    if (!lessonId) return;

    try {
      setError(null);
      const quizData = await LearningAPIService.generateQuiz(lessonId, userCategory, customQuestionCount);
      setQuiz(quizData);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setQuizStartTime(Date.now());
      setQuestionStartTime(Date.now());
      setResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quiz');
    }
  }, [lessonId, userCategory]);

  // Answer question
  const answerQuestion = useCallback((questionId: string, selectedOptionId: string, hintsUsed: number = 0) => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        selectedOptionId,
        timeSpentSeconds: timeSpent,
        hintsUsed
      }
    }));

    // Move to next question
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
    }
  }, [quiz, currentQuestionIndex, questionStartTime]);

  // Submit quiz
  const submitQuiz = useCallback(async () => {
    if (!quiz || !lessonId || !quizStartTime) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const totalTimeSeconds = Math.floor((Date.now() - quizStartTime) / 1000);
      const totalHintsUsed = Object.values(answers).reduce((sum, answer) => sum + answer.hintsUsed, 0);

      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        ...answer
      }));

      const submissionResult = await LearningAPIService.submitQuiz(
        quiz.quizId,
        lessonId,
        userCategory,
        answersArray,
        totalTimeSeconds,
        totalHintsUsed
      );

      setResult(submissionResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  }, [quiz, lessonId, userCategory, answers, quizStartTime]);

  // Reset quiz
  const resetQuiz = useCallback(() => {
    setQuiz(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setQuizStartTime(null);
    setQuestionStartTime(Date.now());
    setResult(null);
    setError(null);
  }, []);

  // Computed values
  const currentQuestion = quiz?.questions[currentQuestionIndex] || null;
  const progress = quiz ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0;
  const isQuizComplete = quiz ? Object.keys(answers).length === quiz.questions.length : false;
  const canSubmit = isQuizComplete && !isSubmitting;

  return {
    quiz,
    currentQuestion,
    currentQuestionIndex,
    progress,
    answers,
    result,
    isSubmitting,
    isQuizComplete,
    canSubmit,
    error,
    generateQuiz,
    answerQuestion,
    submitQuiz,
    resetQuiz
  };
};

// Custom hook for learning progress management
export const useLearningProgress = (userId: string) => {
  const [progress, setProgress] = useState({
    currentGrade: null as number | null,
    completedLessons: [] as string[],
    completedModules: [] as string[],
    totalXp: 0,
    badges: [] as Array<{id: string; title: string; description: string; iconUrl: string}>,
    streaks: { daily: 0, weekly: 0 }
  });

  const updateProgress = useCallback(async (updates: Partial<typeof progress>) => {
    try {
      const newProgress = { ...progress, ...updates };
      setProgress(newProgress);
      await LearningAPIService.updateProgress(userId, updates);
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  }, [progress, userId]);

  const addCompletedLesson = useCallback(async (lessonId: string, xpEarned: number = 50) => {
    if (!progress.completedLessons.includes(lessonId)) {
      await updateProgress({
        completedLessons: [...progress.completedLessons, lessonId],
        totalXp: progress.totalXp + xpEarned
      });
    }
  }, [progress, updateProgress]);

  const addCompletedModule = useCallback(async (moduleId: string, xpEarned: number = 200) => {
    if (!progress.completedModules.includes(moduleId)) {
      await updateProgress({
        completedModules: [...progress.completedModules, moduleId],
        totalXp: progress.totalXp + xpEarned
      });
    }
  }, [progress, updateProgress]);

  return {
    progress,
    updateProgress,
    addCompletedLesson,
    addCompletedModule
  };
};

// Custom hook for theme management
export const useSubjectTheme = (subject: Subject | null) => {
  const themeColors = useMemo(() => ({
    'Maths': { primary: '#6B46C1', secondary: '#9333EA', light: '#EDE9FE' },
    'Science': { primary: '#0BC5EA', secondary: '#06B6D4', light: '#E0F7FA' },
    'Geography': { primary: '#8B5E3C', secondary: '#A16207', light: '#FEF3C7' },
    'EVS': { primary: '#22C55E', secondary: '#16A34A', light: '#D1FAE5' }
  }), []);

  const currentTheme = useMemo(() => {
    if (!subject || !themeColors[subject]) {
      return {
        primary: '#10B981',
        secondary: '#059669',
        light: '#D1FAE5',
        gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
      };
    }

    const colors = themeColors[subject];
    return {
      ...colors,
      gradient: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
    };
  }, [subject, themeColors]);

  return currentTheme;
};

// Error boundary hook for graceful error handling
export const useErrorBoundary = () => {
  const [error, setError] = useState<Error | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const captureError = useCallback((error: Error) => {
    console.error('Learning app error:', error);
    setError(error);
  }, []);

  return { error, resetError, captureError };
};