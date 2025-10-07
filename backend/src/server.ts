import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { GetQuestionsRequestSchema, GenerateQuestionRequestSchema, RecommendLessonsRequestSchema, SubmitQuizRequestSchema, Question } from '@/types';
import { sampleQuestions, getRandomQuestions } from '@/data/sampleQuestions';
import { llmService } from '@/services/llm';
import { scoringService } from '@/services/scoring';
import { reportService } from '@/services/reports';
import { lessonRecommendationService } from '@/services/lessons';

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
  origin: config.cors.origins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Logging middleware
if (config.env !== 'test') {
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
    version: '1.0.0'
  });
});

// Learning API endpoints
app.get('/api/learning/grades', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, label: 'Grade 1', description: 'Ages 5-6', ageRange: '5-6' },
      { id: 2, label: 'Grade 2', description: 'Ages 6-7', ageRange: '6-7' },
      { id: 3, label: 'Grade 3', description: 'Ages 7-8', ageRange: '7-8' },
      { id: 4, label: 'Grade 4', description: 'Ages 8-9', ageRange: '8-9' },
      { id: 5, label: 'Grade 5', description: 'Ages 9-10', ageRange: '9-10' }
    ]
  });
});

app.get('/api/learning/subjects/:grade', (req, res) => {
  const grade = parseInt(req.params.grade);
  res.json({
    success: true,
    data: [
      {
        id: 'maths',
        name: 'Maths',
        themeColor: '#6B46C1',
        moduleCount: 8,
        totalXP: 2400,
        totalDuration: 480
      },
      {
        id: 'science',
        name: 'Science',
        themeColor: '#0BC5EA',
        moduleCount: 6,
        totalXP: 1800,
        totalDuration: 360
      },
      {
        id: 'geography',
        name: 'Geography',
        themeColor: '#8B5E3C',
        moduleCount: 5,
        totalXP: 1500,
        totalDuration: 300
      },
      {
        id: 'evs',
        name: 'EVS',
        themeColor: '#22C55E',
        moduleCount: 7,
        totalXP: 2100,
        totalDuration: 420
      }
    ]
  });
});

app.get('/api/learning/modules/:grade/:subject', (req, res) => {
  const { grade, subject } = req.params;
  res.json({
    success: true,
    data: {
      modules: [
        {
          id: 'module-1',
          title: 'Introduction to Variables',
          difficulty: 'easy' as const,
          durationMin: 45,
          xpReward: 200,
          description: 'Learn the basics of variables in mathematics',
          objectives: ['Understand what variables are', 'Practice basic substitution'],
          lessonCount: 3,
          lessons: [
            {
              id: 'lesson-1',
              title: 'What are Variables?',
              description: 'Introduction to mathematical variables',
              durationSec: 900,
              thumbnailUrl: ''
            }
          ]
        }
      ],
      subjectTheme: subject === 'maths' ? '#6B46C1' : subject === 'science' ? '#0BC5EA' : subject === 'geography' ? '#8B5E3C' : '#22C55E'
    }
  });
});

app.get('/api/learning/lesson/:lessonId', (req, res) => {
  const { lessonId } = req.params;
  const userCategory = req.query.userCategory as string || 'Builder';
  
  res.json({
    success: true,
    data: {
      id: lessonId,
      title: 'Introduction to Variables',
      description: 'Learn what variables are and how to use them',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      durationSec: 420,
      transcript: {
        text: userCategory === 'Builder'
          ? 'Welcome to our lesson on variables! A variable is like a special box that can hold different numbers. Think of it like a treasure chest - you can put different treasures inside it!'
          : userCategory === 'Explorer'
          ? 'A variable is a symbol that represents a number. For example, if x = 3, then x + 2 = 5. Variables help us write math expressions and solve equations.'
          : 'Variable = symbol representing a number. Example: x = 3, therefore x + 2 = 5. Variables enable algebraic expressions and equation solving.',
        highlights: ['variables', 'equations', 'substitution'],
        inlineActivities: [],
        categoryFeatures: userCategory === 'Builder' ? {
          keyPoints: ['Variables are like boxes that hold numbers', 'Replace the variable with its value to solve']
        } : userCategory === 'Innovator' ? {
          challenges: ['Try solving: If 3x + 5 = 14, what is x?']
        } : {
          practiceQuestions: [
            { question: 'If x = 5, what is x + 3?', answer: '8' }
          ]
        }
      },
      quizMeta: {
        questionCount: userCategory === 'Builder' ? 22 : userCategory === 'Explorer' ? 15 : 12,
        skillTags: ['algebra', 'symbolic-reasoning'],
        hintPolicy: userCategory === 'Builder' || userCategory === 'Explorer' ? 'allowed' : 'disabled',
        passingScore: 70
      }
    }
  });
});

app.post('/api/quiz/generate', (req, res) => {
  const { lessonId, userCategory } = req.body;
  
  res.json({
    success: true,
    data: {
      quizId: `quiz_${Date.now()}`,
      questions: [
        {
          id: 'q1',
          text: 'If x = 5, what is the value of x + 3?',
          options: [
            { id: 'a', text: '5' },
            { id: 'b', text: '8' },
            { id: 'c', text: '3' },
            { id: 'd', text: '15' }
          ],
          correctOptionId: 'b',
          explanation: 'When x = 5, we substitute 5 for x: 5 + 3 = 8',
          difficulty: 'easy' as const
        }
      ],
      metadata: {
        lessonId,
        userCategory,
        questionCount: 1,
        allowedHints: userCategory !== 'Innovator',
        passingScore: 70
      }
    }
  });
});

// ================= AI Content Engine Endpoints =================

// GET /api/questions - fetch randomized questions
app.get('/api/questions', (req, res) => {
  try {
    const query = GetQuestionsRequestSchema.parse({
      ageGroup: (req.query?.ageGroup as string) || '10-15',
      count: parseInt((req.query?.count as string) || '25'),
      mode: (req.query?.mode as string) || 'diagnostic',
      seed: req.query?.seed as string | undefined,
      difficulty: req.query?.difficulty as any,
      topics: req.query?.topics ? (req.query.topics as string).split(',') : undefined,
    });

    let questions = getRandomQuestions(query.count, query.ageGroup, query.difficulty);

    if (query.topics && query.topics.length > 0) {
      questions = questions.filter(q => 
        query.topics!.some(topic => 
          q.topic.toLowerCase().includes(topic.toLowerCase()) ||
          q.cognitiveSkillTags.some(tag => tag.includes(topic.toLowerCase()))
        )
      );
    }

    const questionsForClient = questions.map(q => ({ ...q, correctOptionId: undefined }));

    res.status(200).json({
      success: true,
      data: {
        questions: questionsForClient,
        metadata: {
          totalCount: questions.length,
          ageGroup: query.ageGroup,
          mode: query.mode,
          generatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    logger.error('Failed to fetch questions', error);
    res.status(400).json({ success: false, error: { message: 'Invalid query' } });
  }
});

// POST /api/questions/generate - admin only
app.post('/api/questions/generate', async (req, res) => {
  try {
    const body = GenerateQuestionRequestSchema.parse(req.body);
    // In production check JWT role === admin
    const generated = [] as Question[];
    for (let i = 0; i < body.count; i++) {
      const q = await llmService.generateQuestion({
        ageGroup: body.ageGroup,
        topic: body.topic,
        cognitiveSkillTag: body.cognitiveSkillTag,
        difficulty: body.difficulty,
        culturalContext: 'global',
        language: 'english',
      });
      generated.push({
        id: `generated-${Date.now()}-${i}`,
        questionId: `gen-${body.topic.toLowerCase()}-${Date.now()}-${i}`,
        ageGroup: body.ageGroup,
        topic: body.topic,
        text: q.text,
        options: q.options,
        correctOptionId: q.correctOptionId,
        explanation: q.explanation,
        mediaUrls: [],
        cognitiveSkillTags: q.cognitiveSkillTags,
        difficulty: q.difficulty,
        isActive: true,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
      });
    }
    res.status(201).json({ success: true, data: { questions: generated } });
  } catch (error) {
    logger.error('Failed to generate questions', error);
    res.status(400).json({ success: false, error: { message: 'Invalid request' } });
  }
});

// POST /api/submit - answer submission & scoring → report
app.post('/api/submit', async (req, res) => {
  try {
    const submission = SubmitQuizRequestSchema.parse(req.body);
    const ids = submission.answers.map(a => a.questionId);
    const questions = sampleQuestions.filter(q => ids.includes(q.questionId));
    const { scores, strengths, opportunities, questionBreakdown, gamificationRewards } = await scoringService.calculateScores(submission, questions);

    // Mock user profile
    const userProfile = {
      id: 'profile-uuid',
      userId: submission.userId,
      username: 'Student',
      age: 11,
      ageGroup: '10-15' as const,
      parentEmail: 'parent@example.com',
      avatarId: 'avatar-fox',
      xp: 0,
      badges: [],
    };

    const lessons = await lessonRecommendationService.recommendForOpportunities(opportunities, userProfile as any, scores.category, 8);
    const report = await reportService.generateReport(submission, userProfile as any, questions, lessons);

    res.status(200).json({
      success: true,
      data: {
        resultId: `result_${Date.now()}`,
        scores,
        category: scores.category,
        questionBreakdown,
        gamificationRewards,
        reportId: report.id,
      },
    });
  } catch (error) {
    logger.error('Failed to submit quiz', error);
    res.status(400).json({ success: false, error: { message: 'Invalid submission' } });
  }
});

// GET /api/report/:id - return report (mock via reports route/service)
app.get('/api/report/:id', async (req, res) => {
  try {
    // For now, reuse reports route mock shape
    const reportId = req.params.id;
    res.redirect(`/api/reports/${reportId}`);
  } catch (error) {
    res.status(400).json({ success: false, error: { message: 'Invalid report id' } });
  }
});

// GET /api/lessons/recommend
app.get('/api/lessons/recommend', async (req, res) => {
  try {
    const request = RecommendLessonsRequestSchema.parse({
      userId: req.query.userId,
      reportId: req.query.reportId,
      ageGroup: req.query.ageGroup,
      skillTags: req.query.skillTags ? (req.query.skillTags as string).split(',') : undefined,
      difficulty: req.query.difficulty,
      maxResults: req.query.maxResults ? parseInt(req.query.maxResults as string) : 8,
    });
    const lessons = await lessonRecommendationService.recommendLessons(request);
    res.status(200).json({ success: true, data: { lessons } });
  } catch (error) {
    logger.error('Failed to recommend lessons', error);
    res.status(400).json({ success: false, error: { message: 'Invalid request' } });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: config.env === 'development' ? err.message : 'Something went wrong'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} in ${config.env} mode`);
  logger.info(`📚 Vietnam Quiz Backend API v1.0.0`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;