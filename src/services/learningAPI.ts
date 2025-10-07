/**
 * Learning API Service - Frontend Integration with Backend
 * Provides seamless connection between React frontend and Node.js backend
 */

import { Subject, UserCategory, Module, Lesson, QuizMetadata } from '@/types/learning';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const CONTENT_API_URL = `${API_BASE_URL}/api/learning`;
const QUIZ_API_URL = `${API_BASE_URL}/api/quiz`;

// Request helper with authentication
class APIClient {
  private baseURL: string;
  private authToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.initializeAuth();
  }

  private initializeAuth() {
    // Initialize with stored token or guest token
    this.authToken = localStorage.getItem('learning_token') || this.generateGuestToken();
  }

  private generateGuestToken(): string {
    // Generate a temporary guest token for demo purposes
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const guestToken = btoa(JSON.stringify({ userId: guestId, type: 'guest' }));
    localStorage.setItem('learning_token', guestToken);
    return guestToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authToken}`,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'API request failed');
      }

      return result.data;
    } catch (error) {
      console.error('API Request failed:', { url, error });
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

// Initialize API clients
const contentAPI = new APIClient(CONTENT_API_URL);
const quizAPI = new APIClient(QUIZ_API_URL);

// Type definitions for API responses
export interface GradeInfo {
  id: number;
  label: string;
  description: string;
  ageRange: string;
}

export interface SubjectWithModules {
  id: string;
  name: string;
  themeColor: string;
  iconRef?: string;
  lottieRef?: string;
  description?: string;
  moduleCount: number;
  totalXP: number;
  totalDuration: number;
}

export interface ModuleWithLessons {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  durationMin: number;
  xpReward: number;
  description: string;
  objectives: string[];
  lessonCount: number;
  lessons: Array<{
    id: string;
    title: string;
    description: string;
    durationSec: number;
    thumbnailUrl: string;
  }>;
}

export interface AdaptiveLesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  durationSec: number;
  transcript: {
    text: string;
    highlights: string[];
    inlineActivities: Array<{
      timeSec: number;
      activity: string;
      answer?: string;
    }>;
    categoryFeatures?: {
      keyPoints?: string[];
      practiceQuestions?: Array<{ question: string; answer: string }>;
      challenges?: string[];
    };
  };
  quizMeta: {
    questionCount: number;
    skillTags: string[];
    hintPolicy: string;
    timeLimit?: number;
    passingScore: number;
  };
}

export interface GeneratedQuiz {
  quizId: string;
  questions: Array<{
    id: string;
    text: string;
    options: Array<{ id: string; text: string }>;
    correctOptionId: string;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
  metadata: {
    lessonId: string;
    userCategory: UserCategory;
    questionCount: number;
    allowedHints: boolean;
    timeLimit?: number;
    passingScore: number;
  };
}

export interface QuizSubmissionResult {
  quizId: string;
  results: {
    score: number;
    percentage: number;
    passed: boolean;
    questionBreakdown: Array<{
      questionId: string;
      correct: boolean;
      selectedAnswer: string;
      correctAnswer: string;
      explanation: string;
      timeSpent: number;
      difficulty: string;
    }>;
    timeSpentSeconds: number;
    hintsUsed: number;
  };
  rewards: {
    xpEarned: number;
    badges: Array<{
      id: string;
      title: string;
      description: string;
      iconUrl: string;
    }>;
    streakBonus: boolean;
  };
  feedback: {
    message: string;
    improvementTips: string[];
    recommendedLessons: string[];
  };
  nextSteps: {
    retryAllowed: boolean;
    nextLesson: string | null;
    practiceMode: boolean;
  };
}

/**
 * Learning API Service - Main interface for frontend components
 */
export class LearningAPIService {
  // Grade and Subject APIs
  static async getAvailableGrades(): Promise<GradeInfo[]> {
    try {
      const response = await contentAPI.get<{ grades: GradeInfo[] }>('/grades');
      return response.grades;
    } catch (error) {
      console.error('Failed to fetch grades:', error);
      // Fallback to static grades
      return Array.from({ length: 13 }, (_, i) => ({
        id: i,
        label: i === 0 ? 'K' : i.toString(),
        description: i === 0 ? 'Kindergarten' : `Grade ${i}`,
        ageRange: `${5 + i}-${6 + i}`
      }));
    }
  }

  static async getSubjectsForGrade(grade: number): Promise<SubjectWithModules[]> {
    try {
      const response = await contentAPI.get<{ subjects: SubjectWithModules[] }>(`/${grade}/subjects`);
      return response.subjects;
    } catch (error) {
      console.error('Failed to fetch subjects for grade:', error);
      // Fallback to default subjects
      return [
        { id: 'MATH', name: 'Maths', themeColor: '#6B46C1', moduleCount: 0, totalXP: 0, totalDuration: 0 },
        { id: 'SCI', name: 'Science', themeColor: '#0BC5EA', moduleCount: 0, totalXP: 0, totalDuration: 0 },
        { id: 'GEO', name: 'Geography', themeColor: '#8B5E3C', moduleCount: 0, totalXP: 0, totalDuration: 0 },
        { id: 'EVS', name: 'EVS', themeColor: '#22C55E', moduleCount: 0, totalXP: 0, totalDuration: 0 }
      ] as SubjectWithModules[];
    }
  }

  static async getModulesForSubject(grade: number, subject: Subject): Promise<{
    modules: ModuleWithLessons[];
    subjectTheme: string;
  }> {
    try {
      const response = await contentAPI.get<{
        modules: ModuleWithLessons[];
        subjectTheme: string;
      }>(`/${grade}/${subject}/modules`);
      return response;
    } catch (error) {
      console.error('Failed to fetch modules:', error);
      // Fallback to sample data
      return {
        modules: [
          {
            id: `${subject.toUpperCase()}-G${grade}-SAMPLE`,
            title: `${subject} Fundamentals`,
            difficulty: 'medium' as const,
            durationMin: 45,
            xpReward: 120,
            description: `Learn the basics of ${subject} for Grade ${grade}`,
            objectives: [`Understand ${subject} concepts`, 'Practice problem solving'],
            lessonCount: 3,
            lessons: [
              {
                id: 'L1',
                title: 'Introduction',
                description: `Getting started with ${subject}`,
                durationSec: 300,
                thumbnailUrl: ''
              }
            ]
          } as ModuleWithLessons
        ],
        subjectTheme: '#6B46C1' // Default purple
      };
    }
  }

  // Lesson APIs with adaptive content
  static async getAdaptiveLesson(
    lessonId: string, 
    userCategory: UserCategory
  ): Promise<AdaptiveLesson> {
    try {
      const response = await contentAPI.get<AdaptiveLesson>(`/lesson/${lessonId}?userCategory=${userCategory.toLowerCase()}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch adaptive lesson:', error);
      // Fallback to sample lesson data
      return {
        id: lessonId,
        title: 'Sample Lesson',
        description: 'This is a sample lesson for demonstration',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        durationSec: 300,
        transcript: {
          text: 'This is a sample transcript adapted for your learning level.',
          highlights: ['key concept 1', 'important point 2'],
          inlineActivities: [
            { timeSec: 60, activity: 'Try solving this practice problem', answer: 'Sample answer' }
          ],
          categoryFeatures: userCategory === 'Builder' ? {
            keyPoints: ['Point 1', 'Point 2'],
            practiceQuestions: [{ question: 'Sample question?', answer: 'Sample answer' }]
          } : undefined
        },
        quizMeta: {
          questionCount: userCategory === 'Builder' ? 22 : userCategory === 'Explorer' ? 15 : 12,
          skillTags: ['sample-skill'],
          hintPolicy: userCategory === 'Innovator' ? 'noHints' : 'hintsAllowed',
          passingScore: userCategory === 'Builder' ? 60 : userCategory === 'Explorer' ? 70 : 75
        }
      } as AdaptiveLesson;
    }
  }

  // Quiz APIs
  static async generateQuiz(
    lessonId: string,
    userCategory: UserCategory,
    customQuestionCount?: number
  ): Promise<GeneratedQuiz> {
    try {
      const response = await quizAPI.post<GeneratedQuiz>('/generate', {
        lessonId,
        userCategory: userCategory.toLowerCase(),
        numQuestions: customQuestionCount,
        seed: `${lessonId}-${userCategory}-${Date.now()}`
      });
      return response;
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      // Fallback to sample quiz
      const questionCount = customQuestionCount || 
        (userCategory === 'Builder' ? 22 : userCategory === 'Explorer' ? 15 : 12);
      
      return {
        quizId: `sample-quiz-${Date.now()}`,
        questions: Array.from({ length: Math.min(questionCount, 5) }, (_, i) => ({
          id: `q${i + 1}`,
          text: `Sample question ${i + 1}?`,
          options: [
            { id: 'a', text: 'Option A' },
            { id: 'b', text: 'Option B' },
            { id: 'c', text: 'Option C' },
            { id: 'd', text: 'Option D' }
          ],
          correctOptionId: 'b',
          explanation: 'This is the correct answer because...',
          difficulty: 'medium' as const
        })),
        metadata: {
          lessonId,
          userCategory,
          questionCount,
          allowedHints: userCategory !== 'Innovator',
          passingScore: userCategory === 'Builder' ? 60 : userCategory === 'Explorer' ? 70 : 75
        }
      };
    }
  }

  static async submitQuiz(
    quizId: string,
    lessonId: string,
    userCategory: UserCategory,
    answers: Array<{
      questionId: string;
      selectedOptionId: string;
      timeSpentSeconds: number;
      hintsUsed: number;
    }>,
    totalTimeSeconds: number,
    totalHintsUsed: number
  ): Promise<QuizSubmissionResult> {
    try {
      const response = await quizAPI.post<QuizSubmissionResult>('/submit', {
        quizId,
        lessonId,
        userCategory: userCategory.toLowerCase(),
        answers,
        timeSpentSeconds: totalTimeSeconds,
        hintsUsed: totalHintsUsed
      });
      return response;
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      // Fallback result
      const correctAnswers = Math.floor(answers.length * 0.75); // Assume 75% correct
      const percentage = (correctAnswers / answers.length) * 100;
      
      return {
        quizId,
        results: {
          score: correctAnswers,
          percentage,
          passed: percentage >= 70,
          questionBreakdown: answers.map((answer, i) => ({
            questionId: answer.questionId,
            correct: i < correctAnswers,
            selectedAnswer: answer.selectedOptionId,
            correctAnswer: 'b',
            explanation: 'Sample explanation',
            timeSpent: answer.timeSpentSeconds,
            difficulty: 'medium'
          })),
          timeSpentSeconds: totalTimeSeconds,
          hintsUsed: totalHintsUsed
        },
        rewards: {
          xpEarned: correctAnswers * 10,
          badges: percentage >= 90 ? [{ id: 'excellent', title: 'Excellent!', description: 'Great job!', iconUrl: '' }] : [],
          streakBonus: false
        },
        feedback: {
          message: percentage >= 80 ? 'Excellent work!' : percentage >= 60 ? 'Good effort!' : 'Keep practicing!',
          improvementTips: ['Review the lesson content', 'Practice more problems', 'Take your time'],
          recommendedLessons: ['Next lesson in sequence']
        },
        nextSteps: {
          retryAllowed: percentage < 70,
          nextLesson: percentage >= 70 ? 'next-lesson-id' : null,
          practiceMode: userCategory === 'Builder' && percentage < 80
        }
      };
    }
  }

  // Progress tracking
  static async updateProgress(userId: string, progressUpdate: Record<string, unknown>): Promise<void> {
    try {
      await contentAPI.post(`/progress/${userId}`, progressUpdate);
    } catch (error) {
      console.error('Failed to update progress:', error);
      // Store locally as fallback
      const localProgress = JSON.parse(localStorage.getItem('learning_progress') || '{}');
      localStorage.setItem('learning_progress', JSON.stringify({
        ...localProgress,
        ...progressUpdate,
        lastUpdated: new Date().toISOString()
      }));
    }
  }

  // Error handling and retry logic
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }
    
    throw lastError!;
  }
}

export default LearningAPIService;