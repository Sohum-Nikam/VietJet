import { Schema, model, Document } from 'mongoose';

// Subject Schema
export interface ISubject extends Document {
  id: string;
  name: string;
  themeColor: string;
  iconRef: string;
  lottieRef: string;
  description: string;
  availableGrades: number[];
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  themeColor: { type: String, required: true },
  iconRef: { type: String, required: true },
  lottieRef: { type: String },
  description: { type: String },
  availableGrades: [{ type: Number }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Module Schema
export interface IModule extends Document {
  id: string;
  subjectId: string;
  grade: number;
  title: string;
  objectives: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  durationMin: number;
  xpReward: number;
  thumbnailUrl: string;
  lessonIds: string[];
  skillTags: string[];
  isActive: boolean;
  completionOrder: number;
  prerequisites: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ModuleSchema = new Schema<IModule>({
  id: { type: String, required: true, unique: true },
  subjectId: { type: String, required: true, ref: 'Subject' },
  grade: { type: Number, required: true, min: 0, max: 12 },
  title: { type: String, required: true },
  objectives: [{ type: String }],
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  durationMin: { type: Number, required: true, min: 1 },
  xpReward: { type: Number, required: true, min: 0 },
  thumbnailUrl: { type: String },
  lessonIds: [{ type: String }],
  skillTags: [{ type: String }],
  isActive: { type: Boolean, default: true },
  completionOrder: { type: Number, default: 0 },
  prerequisites: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Lesson Schema
export interface ILesson extends Document {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  videoUrl: string;
  durationSec: number;
  transcriptBase: string; // Canonical teacher-level transcript
  timestamps: Array<{
    startSec: number;
    endSec?: number;
    text: string;
    keyPoint?: boolean;
  }>;
  resourceLinks: Array<{
    title: string;
    url: string;
    type: 'video' | 'pdf' | 'interactive' | 'external';
  }>;
  quizMetaId: string;
  skillTags: string[];
  isActive: boolean;
  completionOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>({
  id: { type: String, required: true, unique: true },
  moduleId: { type: String, required: true, ref: 'Module' },
  title: { type: String, required: true },
  description: { type: String },
  videoUrl: { type: String, required: true },
  durationSec: { type: Number, required: true, min: 1 },
  transcriptBase: { type: String, required: true },
  timestamps: [{
    startSec: { type: Number, required: true },
    endSec: Number,
    text: { type: String, required: true },
    keyPoint: { type: Boolean, default: false }
  }],
  resourceLinks: [{
    title: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['video', 'pdf', 'interactive', 'external'], default: 'external' }
  }],
  quizMetaId: { type: String, required: true },
  skillTags: [{ type: String }],
  isActive: { type: Boolean, default: true },
  completionOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Quiz Metadata Schema
export interface IQuizMeta extends Document {
  id: string;
  lessonId: string;
  skillTags: string[];
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  questionCountByCategory: {
    builder: number;
    explorer: number;
    innovator: number;
  };
  hintPolicy: {
    builder: boolean;
    explorer: boolean;
    innovator: boolean;
  };
  timeLimitMinutes?: {
    builder?: number;
    explorer?: number;
    innovator?: number;
  };
  passingScore: {
    builder: number;
    explorer: number;
    innovator: number;
  };
  adaptiveBehavior: {
    easyFallback: boolean;
    challengeBonus: boolean;
    retryEnabled: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuizMetaSchema = new Schema<IQuizMeta>({
  id: { type: String, required: true, unique: true },
  lessonId: { type: String, required: true, ref: 'Lesson' },
  skillTags: [{ type: String }],
  difficultyDistribution: {
    easy: { type: Number, required: true, min: 0 },
    medium: { type: Number, required: true, min: 0 },
    hard: { type: Number, required: true, min: 0 }
  },
  questionCountByCategory: {
    builder: { type: Number, required: true, min: 5, max: 50 },
    explorer: { type: Number, required: true, min: 5, max: 30 },
    innovator: { type: Number, required: true, min: 5, max: 25 }
  },
  hintPolicy: {
    builder: { type: Boolean, default: true },
    explorer: { type: Boolean, default: true },
    innovator: { type: Boolean, default: false }
  },
  timeLimitMinutes: {
    builder: Number,
    explorer: Number,
    innovator: Number
  },
  passingScore: {
    builder: { type: Number, default: 60 },
    explorer: { type: Number, default: 70 },
    innovator: { type: Number, default: 75 }
  },
  adaptiveBehavior: {
    easyFallback: { type: Boolean, default: true },
    challengeBonus: { type: Boolean, default: true },
    retryEnabled: { type: Boolean, default: true }
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Question Bank Schema
export interface IQuestion extends Document {
  id: string;
  lessonId: string;
  text: string;
  type: 'mcq' | 'short-answer' | 'drag-drop' | 'true-false';
  options?: Array<{
    id: string;
    text: string;
  }>;
  correctAnswer: string | string[]; // For MCQ: optionId, for others: correct text/values
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  skillTags: string[];
  distractorRationale?: string;
  categoryAdaptations?: {
    builder?: { simplifiedText?: string; hint?: string };
    explorer?: { hint?: string };
    innovator?: { advancedContext?: string };
  };
  isGenerated: boolean; // true if LLM-generated, false if manually curated
  qualityScore?: number;
  usageStats: {
    timesUsed: number;
    correctAnswers: number;
    averageTimeSeconds: number;
  };
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  id: { type: String, required: true, unique: true },
  lessonId: { type: String, required: true, ref: 'Lesson' },
  text: { type: String, required: true },
  type: { type: String, enum: ['mcq', 'short-answer', 'drag-drop', 'true-false'], default: 'mcq' },
  options: [{
    id: { type: String, required: true },
    text: { type: String, required: true }
  }],
  correctAnswer: { type: Schema.Types.Mixed, required: true },
  explanation: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  skillTags: [{ type: String }],
  distractorRationale: String,
  categoryAdaptations: {
    builder: {
      simplifiedText: String,
      hint: String
    },
    explorer: {
      hint: String
    },
    innovator: {
      advancedContext: String
    }
  },
  isGenerated: { type: Boolean, default: false },
  qualityScore: { type: Number, min: 0, max: 100 },
  usageStats: {
    timesUsed: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    averageTimeSeconds: { type: Number, default: 0 }
  },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, default: 'system' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Generated Content Cache Schema
export interface IGeneratedContent extends Document {
  contentType: 'transcript' | 'quiz' | 'question';
  contentId: string; // lessonId for transcript, quizId for quiz, etc.
  userCategory: 'builder' | 'explorer' | 'innovator';
  parameters: Record<string, any>; // Original generation parameters
  content: Record<string, any>; // Generated content
  seed?: string; // For reproducibility
  qualityScore?: number;
  expiresAt: Date;
  createdAt: Date;
}

const GeneratedContentSchema = new Schema<IGeneratedContent>({
  contentType: { type: String, enum: ['transcript', 'quiz', 'question'], required: true },
  contentId: { type: String, required: true },
  userCategory: { type: String, enum: ['builder', 'explorer', 'innovator'], required: true },
  parameters: { type: Schema.Types.Mixed, required: true },
  content: { type: Schema.Types.Mixed, required: true },
  seed: String,
  qualityScore: { type: Number, min: 0, max: 100 },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create compound indexes for efficient queries
SubjectSchema.index({ name: 1, availableGrades: 1 });
ModuleSchema.index({ subjectId: 1, grade: 1, completionOrder: 1 });
ModuleSchema.index({ skillTags: 1, difficulty: 1 });
LessonSchema.index({ moduleId: 1, completionOrder: 1 });
LessonSchema.index({ skillTags: 1 });
QuizMetaSchema.index({ lessonId: 1 });
QuestionSchema.index({ lessonId: 1, difficulty: 1, skillTags: 1 });
QuestionSchema.index({ isGenerated: 1, qualityScore: -1 });
GeneratedContentSchema.index({ contentType: 1, contentId: 1, userCategory: 1 });
GeneratedContentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Subject = model<ISubject>('Subject', SubjectSchema);
export const Module = model<IModule>('Module', ModuleSchema);
export const Lesson = model<ILesson>('Lesson', LessonSchema);
export const QuizMeta = model<IQuizMeta>('QuizMeta', QuizMetaSchema);
export const Question = model<IQuestion>('Question', QuestionSchema);
export const GeneratedContent = model<IGeneratedContent>('GeneratedContent', GeneratedContentSchema);