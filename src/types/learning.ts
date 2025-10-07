export type UserCategory = 'Builder' | 'Explorer' | 'Innovator';

export type Subject = 'Maths' | 'Science' | 'Geography' | 'EVS';

export interface SubjectTheme {
  primary: string;
  secondary: string;
  light: string;
  dark: string;
  gradient: string;
  icon: string;
  lottieUrl?: string;
}

export interface Grade {
  id: number;
  label: string;
  description: string;
  ageRange: string;
}

export interface Module {
  id: string;
  title: string;
  subject: Subject;
  grade: number;
  description: string;
  objectives: string[];
  durationMin: number;
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  thumbnailUrl: string;
  skillTags: string[];
  lessons: Lesson[];
  isUnlocked: boolean;
  completionPercentage: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  durationSec: number;
  transcripts: {
    builder: string;
    explorer: string;
    innovator: string;
  };
  transcriptTimestamps: TranscriptTimestamp[];
  quizMeta: QuizMetadata;
  xpReward: number;
  isCompleted: boolean;
  isUnlocked: boolean;
}

export interface TranscriptTimestamp {
  startSec: number;
  endSec?: number;
  text: string;
  highlight?: boolean;
  keyPoint?: boolean;
}

export interface QuizMetadata {
  skillTags: string[];
  questionCounts: {
    builder: number;
    explorer: number;
    innovator: number;
  };
  allowedHints: {
    builder: boolean;
    explorer: boolean;
    innovator: boolean;
  };
  timeLimit?: {
    builder?: number;
    explorer?: number;
    innovator?: number;
  };
  adaptiveBehavior: {
    easyFallback: boolean;
    challengeBonus: boolean;
    retryEnabled: boolean;
  };
}

export interface LearningProgress {
  userId: string;
  currentGrade: number;
  userCategory: UserCategory;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  badges: Badge[];
  completedModules: string[];
  completedLessons: string[];
  weeklyGoals: WeeklyGoal[];
  practiceMode: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconUrl: string;
  unlockedAt: string;
  xpValue: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface WeeklyGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  completed: boolean;
  xpReward: number;
}

export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isFullscreen: boolean;
  isPictureInPicture: boolean;
  isLoading: boolean;
  hasError: boolean;
}

export interface TranscriptSettings {
  fontSize: 'small' | 'medium' | 'large';
  isExpanded: boolean;
  ttsEnabled: boolean;
  highlightCurrent: boolean;
  showTimestamps: boolean;
}

export interface AnimationConfig {
  pageTransition: {
    duration: number;
    ease: string;
  };
  cardHover: {
    scale: number;
    rotateX: number;
    rotateY: number;
  };
  carousel: {
    parallaxStrength: number;
    centerScale: number;
    sideScale: number;
  };
  stagger: {
    delay: number;
    duration: number;
  };
}

export interface LearningPageProps {
  initialGrade?: number;
  userCategory: UserCategory;
  progress: LearningProgress;
  onGradeSelect: (grade: number) => void;
  onModuleComplete: (moduleId: string) => void;
  onLessonComplete: (lessonId: string) => void;
}