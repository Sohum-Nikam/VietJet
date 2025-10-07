import 'dotenv/config';
import { z } from 'zod';

// Environment validation schema
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().int().min(1).max(65535)).default('3001'),
  
  // Database
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  // OpenAI
  OPENAI_API_KEY: z.string(),
  OPENAI_MODEL: z.string().default('gpt-4'),
  
  // Redis
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  
  // Security
  CORS_ORIGINS: z.string().transform(origins => origins.split(',')),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().int()).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).pipe(z.number().int()).default('100'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // Content Generation
  MAX_QUESTIONS_PER_REQUEST: z.string().transform(Number).pipe(z.number().int()).default('25'),
  QUESTION_GENERATION_RATE_LIMIT: z.string().transform(Number).pipe(z.number().int()).default('10'),
  LLM_REQUEST_TIMEOUT: z.string().transform(Number).pipe(z.number().int()).default('30000'),
  
  // File Upload
  MAX_FILE_SIZE: z.string().transform(Number).pipe(z.number().int()).default('5242880'),
  UPLOAD_PATH: z.string().default('./uploads'),
  
  // Analytics
  ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('true'),
  ANALYTICS_BATCH_SIZE: z.string().transform(Number).pipe(z.number().int()).default('100'),
});

// Validate and export configuration
const env = EnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || '3001',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  CORS_ORIGINS: process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000',
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || '900000',
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || '100',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  MAX_QUESTIONS_PER_REQUEST: process.env.MAX_QUESTIONS_PER_REQUEST || '25',
  QUESTION_GENERATION_RATE_LIMIT: process.env.QUESTION_GENERATION_RATE_LIMIT || '10',
  LLM_REQUEST_TIMEOUT: process.env.LLM_REQUEST_TIMEOUT || '30000',
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '5242880',
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
  ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS || 'true',
  ANALYTICS_BATCH_SIZE: process.env.ANALYTICS_BATCH_SIZE || '100',
});

export const config = {
  // Server
  env: env.NODE_ENV,
  port: env.PORT,
  
  // Database
  supabase: {
    url: env.SUPABASE_URL,
    anonKey: env.SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  },
  
  // Authentication
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  
  // AI/ML
  openai: {
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL,
    timeout: env.LLM_REQUEST_TIMEOUT,
  },
  
  // Cache
  redis: {
    url: env.REDIS_URL,
  },
  
  // Security
  cors: {
    origins: env.CORS_ORIGINS,
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
  
  // Logging
  logging: {
    level: env.LOG_LEVEL,
  },
  
  // Content
  content: {
    maxQuestionsPerRequest: env.MAX_QUESTIONS_PER_REQUEST,
    questionGenerationRateLimit: env.QUESTION_GENERATION_RATE_LIMIT,
  },
  
  // Upload
  upload: {
    maxFileSize: env.MAX_FILE_SIZE,
    path: env.UPLOAD_PATH,
  },
  
  // Analytics
  analytics: {
    enabled: env.ENABLE_ANALYTICS,
    batchSize: env.ANALYTICS_BATCH_SIZE,
  },
  
  // Scoring thresholds
  scoring: {
    categories: {
      innovator: 80,
      explorer: 50,
    },
    weights: {
      percentage: 0.7,
      speed: 0.2,
      consistency: 0.1,
    },
    expectedResponseTimes: {
      '5-10': {
        easy: 15000,
        medium: 25000,
        hard: 35000,
      },
      '10-15': {
        easy: 12000,
        medium: 20000,
        hard: 30000,
      },
      '15-18': {
        easy: 10000,
        medium: 18000,
        hard: 25000,
      },
    },
  },
  
  // Cognitive skills mapping
  cognitiveSkills: {
    categories: [
      'pattern-recognition',
      'numerical-reasoning',
      'spatial-awareness',
      'logical-thinking',
      'verbal-comprehension',
      'attention-to-detail',
      'problem-solving',
      'creative-thinking',
      'memory-recall',
      'time-management',
      'empathy',
      'teamwork',
      'leadership',
      'adaptability',
    ],
    ageGroups: {
      '5-10': [
        'pattern-recognition',
        'numerical-reasoning',
        'spatial-awareness',
        'memory-recall',
        'creative-thinking',
        'empathy',
      ],
      '10-15': [
        'pattern-recognition',
        'numerical-reasoning',
        'logical-thinking',
        'problem-solving',
        'attention-to-detail',
        'verbal-comprehension',
        'teamwork',
        'adaptability',
      ],
      '15-18': [
        'logical-thinking',
        'problem-solving',
        'verbal-comprehension',
        'creative-thinking',
        'time-management',
        'leadership',
        'adaptability',
        'attention-to-detail',
      ],
    },
  },
  
  // Lottie animation references
  lottieRefs: {
    confetti: 'https://assets9.lottiefiles.com/packages/lf20_obhph3sh.json',
    brainGauge: 'https://assets9.lottiefiles.com/packages/lf20_dmw2lkzr.json',
    categoryAnimations: {
      Builder: 'https://assets9.lottiefiles.com/packages/lf20_builder.json',
      Explorer: 'https://assets9.lottiefiles.com/packages/lf20_explorer.json',
      Innovator: 'https://assets9.lottiefiles.com/packages/lf20_innovator.json',
    },
  },
} as const;

export type Config = typeof config;