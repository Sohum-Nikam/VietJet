import { z } from 'zod';

// Age group enum
export const AgeGroupSchema = z.enum(['5-10', '10-15', '15-18']);
export type AgeGroup = z.infer<typeof AgeGroupSchema>;

// User category enum
export const CategorySchema = z.enum(['Builder', 'Explorer', 'Innovator']);
export type Category = z.infer<typeof CategorySchema>;

// Difficulty enum
export const DifficultySchema = z.enum(['easy', 'medium', 'hard']);
export type Difficulty = z.infer<typeof DifficultySchema>;

// Lesson format enum
export const LessonFormatSchema = z.enum(['video', 'interactive', 'text', 'game']);
export type LessonFormat = z.infer<typeof LessonFormatSchema>;

// Quiz mode enum
export const QuizModeSchema = z.enum(['practice', 'diagnostic']);
export type QuizMode = z.infer<typeof QuizModeSchema>;

// Base schemas
export const UUIDSchema = z.string().uuid();
export const TimestampSchema = z.string().datetime();

// Question Option Schema
export const QuestionOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1).max(200),
  image: z.string().url().optional(),
});

// Question Schema
export const QuestionSchema = z.object({
  id: UUIDSchema,
  questionId: z.string(),
  ageGroup: AgeGroupSchema,
  topic: z.string().min(1),
  text: z.string().min(1).max(500),
  options: z.array(QuestionOptionSchema).min(2).max(6),
  correctOptionId: z.string(),
  explanation: z.string().min(1).max(1000),
  mediaUrls: z.array(z.string().url()).default([]),
  cognitiveSkillTags: z.array(z.string()).default([]),
  difficulty: DifficultySchema,
  isActive: z.boolean().default(true),
  createdBy: z.string().default('system'),
  createdAt: TimestampSchema.optional(),
});

// User Profile Schema
export const UserProfileSchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,
  username: z.string().min(1).max(50),
  age: z.number().int().min(5).max(18),
  ageGroup: AgeGroupSchema,
  gender: z.string().optional(),
  parentEmail: z.string().email().optional(),
  avatarId: z.string().default('avatar-1'),
  xp: z.number().int().min(0).default(0),
  badges: z.array(z.string()).default([]),
  createdAt: TimestampSchema.optional(),
  updatedAt: TimestampSchema.optional(),
});

// Answer Schema
export const AnswerSchema = z.object({
  questionId: z.string(),
  selectedOptionId: z.string(),
  responseTimeMs: z.number().int().min(0),
  isCorrect: z.boolean().optional(),
});

// Quiz Submission Schema
export const QuizSubmissionSchema = z.object({
  userId: UUIDSchema,
  quizId: z.string().optional(),
  answers: z.array(AnswerSchema).min(1),
  startedAt: TimestampSchema,
  finishedAt: TimestampSchema,
  mode: QuizModeSchema.default('diagnostic'),
});

// Score Breakdown Schema
export const ScoreBreakdownSchema = z.object({
  rawScore: z.number().int().min(0),
  totalQuestions: z.number().int().min(1),
  percentageScore: z.number().min(0).max(100),
  compositeScore: z.number().min(0).max(100).optional(),
  speedScore: z.number().min(0).max(100).optional(),
  consistencyScore: z.number().min(0).max(100).optional(),
  category: CategorySchema,
});

// Question Breakdown Schema
export const QuestionBreakdownSchema = z.object({
  id: z.string(),
  questionText: z.string(),
  selectedOptionId: z.string(),
  correctOptionId: z.string(),
  isCorrect: z.boolean(),
  timeSpentMs: z.number().int().min(0),
  explanation: z.string(),
  cognitiveSkillTags: z.array(z.string()),
});

// Gamification Rewards Schema
export const GamificationRewardsSchema = z.object({
  xp: z.number().int().min(0),
  badges: z.array(z.string()),
  achievements: z.array(z.string()).default([]),
  streaks: z.record(z.string(), z.number()).default({}),
});

// Strength Schema
export const StrengthSchema = z.object({
  skillTag: z.string(),
  score: z.number().min(0).max(100),
  examples: z.array(z.string()),
  description: z.string(),
});

// Opportunity Schema
export const OpportunitySchema = z.object({
  skillTag: z.string(),
  score: z.number().min(0).max(100),
  description: z.string(),
  recommendedLessonIds: z.array(z.string()),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
});

// Lesson Schema
export const LessonSchema = z.object({
  id: UUIDSchema,
  lessonId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  skillTags: z.array(z.string()).default([]),
  ageGroup: AgeGroupSchema,
  durationMinutes: z.number().int().min(1).max(120),
  difficulty: DifficultySchema,
  format: LessonFormatSchema,
  contentRef: z.string().optional(),
  learningObjectives: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  createdAt: TimestampSchema.optional(),
});

// Report Schema
export const ReportSchema = z.object({
  id: UUIDSchema,
  userSummary: z.object({
    name: z.string(),
    age: z.number().int(),
    ageGroup: AgeGroupSchema,
    avatar: z.string(),
  }),
  scores: ScoreBreakdownSchema,
  strengths: z.array(StrengthSchema),
  opportunities: z.array(OpportunitySchema),
  questionBreakdown: z.array(QuestionBreakdownSchema),
  gamificationRewards: GamificationRewardsSchema,
  lessonPlan: z.array(LessonSchema),
  certificate: z.object({
    eligible: z.boolean(),
    type: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  }),
  lottieRefs: z.object({
    confetti: z.string().url().optional(),
    brainGauge: z.string().url().optional(),
    categoryAnimation: z.string().url().optional(),
  }),
  generatedAt: TimestampSchema,
});

// Quiz Attempt Schema
export const QuizAttemptSchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,
  questions: z.array(z.string()),
  answers: z.array(AnswerSchema),
  startedAt: TimestampSchema,
  finishedAt: TimestampSchema,
  rawScore: z.number().int().min(0),
  percentageScore: z.number().min(0).max(100),
  compositeScore: z.number().min(0).max(100).optional(),
  category: CategorySchema,
  speedScore: z.number().min(0).max(100).optional(),
  consistencyScore: z.number().min(0).max(100).optional(),
  strengths: z.array(z.string()).default([]),
  opportunities: z.array(z.string()).default([]),
  gamificationRewards: GamificationRewardsSchema.optional(),
  reportId: UUIDSchema.optional(),
  createdAt: TimestampSchema.optional(),
});

// API Request/Response Schemas
export const GetQuestionsRequestSchema = z.object({
  ageGroup: AgeGroupSchema,
  count: z.number().int().min(1).max(25).default(25),
  mode: QuizModeSchema.default('diagnostic'),
  seed: z.string().optional(),
  difficulty: DifficultySchema.optional(),
  topics: z.array(z.string()).optional(),
});

export const SubmitQuizRequestSchema = QuizSubmissionSchema;

export const GenerateQuestionRequestSchema = z.object({
  ageGroup: AgeGroupSchema,
  topic: z.string(),
  cognitiveSkillTag: z.string(),
  difficulty: DifficultySchema,
  count: z.number().int().min(1).max(5).default(1),
});

export const RecommendLessonsRequestSchema = z.object({
  userId: UUIDSchema,
  reportId: UUIDSchema.optional(),
  ageGroup: AgeGroupSchema.optional(),
  skillTags: z.array(z.string()).optional(),
  difficulty: DifficultySchema.optional(),
  maxResults: z.number().int().min(1).max(20).default(8),
});

// LLM Prompt Schemas
export const LLMQuestionPromptSchema = z.object({
  ageGroup: AgeGroupSchema,
  topic: z.string(),
  cognitiveSkillTag: z.string(),
  difficulty: DifficultySchema,
  culturalContext: z.string().default('global'),
  language: z.string().default('english'),
});

export const LLMReportPromptSchema = z.object({
  userProfile: z.object({
    name: z.string(),
    age: z.number(),
    ageGroup: AgeGroupSchema,
  }),
  scores: ScoreBreakdownSchema,
  strengths: z.array(z.string()),
  opportunities: z.array(z.string()),
  questionHistory: z.array(QuestionBreakdownSchema).optional(),
});

// Analytics Schema
export const AnalyticsEventSchema = z.object({
  eventType: z.enum(['quiz_started', 'quiz_completed', 'lesson_accessed', 'question_answered']),
  userId: UUIDSchema,
  sessionId: z.string(),
  metadata: z.record(z.string(), z.any()),
  timestamp: TimestampSchema,
});

// Type exports
export type QuestionOption = z.infer<typeof QuestionOptionSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type Answer = z.infer<typeof AnswerSchema>;
export type QuizSubmission = z.infer<typeof QuizSubmissionSchema>;
export type ScoreBreakdown = z.infer<typeof ScoreBreakdownSchema>;
export type QuestionBreakdown = z.infer<typeof QuestionBreakdownSchema>;
export type GamificationRewards = z.infer<typeof GamificationRewardsSchema>;
export type Strength = z.infer<typeof StrengthSchema>;
export type Opportunity = z.infer<typeof OpportunitySchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type Report = z.infer<typeof ReportSchema>;
export type QuizAttempt = z.infer<typeof QuizAttemptSchema>;
export type GetQuestionsRequest = z.infer<typeof GetQuestionsRequestSchema>;
export type SubmitQuizRequest = z.infer<typeof SubmitQuizRequestSchema>;
export type GenerateQuestionRequest = z.infer<typeof GenerateQuestionRequestSchema>;
export type RecommendLessonsRequest = z.infer<typeof RecommendLessonsRequestSchema>;
export type LLMQuestionPrompt = z.infer<typeof LLMQuestionPromptSchema>;
export type LLMReportPrompt = z.infer<typeof LLMReportPromptSchema>;
export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;