import { Request, Response } from '@/middleware/errorHandler';
import { AuthenticatedRequest } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { GetQuestionsRequestSchema, GenerateQuestionRequestSchema } from '@/types';
import { sampleQuestions, getRandomQuestions } from '@/data/sampleQuestions';
import { llmService } from '@/services/llm';

// Simple router-like interface
export interface Router {
  get: (path: string, handler: (req: Request, res: Response) => void) => void;
  post: (path: string, handler: (req: Request, res: Response) => void) => void;
  put: (path: string, handler: (req: Request, res: Response) => void) => void;
  delete: (path: string, handler: (req: Request, res: Response) => void) => void;
}

const router: Router = {
  get: (path: string, handler: (req: Request, res: Response) => void) => {
    // Router implementation
  },
  post: (path: string, handler: (req: Request, res: Response) => void) => {
    // Router implementation
  },
  put: (path: string, handler: (req: Request, res: Response) => void) => {
    // Router implementation
  },
  delete: (path: string, handler: (req: Request, res: Response) => void) => {
    // Router implementation
  },
};

/**
 * GET /api/questions
 * Get randomized questions for quiz
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Parse and validate query parameters
    const query = GetQuestionsRequestSchema.parse({
      ageGroup: req.query?.ageGroup || '10-15',
      count: parseInt(req.query?.count as string || '25'),
      mode: req.query?.mode || 'diagnostic',
      seed: req.query?.seed,
      difficulty: req.query?.difficulty,
      topics: req.query?.topics ? (req.query.topics as string).split(',') : undefined,
    });

    logger.info('Fetching questions', {
      userId: req.user?.id,
      ageGroup: query.ageGroup,
      count: query.count,
      mode: query.mode,
    });

    // Get randomized questions based on criteria
    let questions = getRandomQuestions(query.count, query.ageGroup, query.difficulty);

    // Filter by topics if specified
    if (query.topics && query.topics.length > 0) {
      questions = questions.filter(q => 
        query.topics!.some(topic => 
          q.topic.toLowerCase().includes(topic.toLowerCase()) ||
          q.cognitiveSkillTags.some(tag => tag.includes(topic.toLowerCase()))
        )
      );
    }

    // Ensure we have enough questions
    if (questions.length < query.count) {
      logger.warn('Not enough questions available', {
        requested: query.count,
        available: questions.length,
        ageGroup: query.ageGroup,
      });
    }

    // Remove correct answers from response for security
    const questionsForClient = questions.map(q => ({
      ...q,
      correctOptionId: undefined, // Hide correct answer
    }));

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
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch questions' },
    });
  }
});

/**
 * POST /api/questions/generate
 * Generate new questions using LLM
 */
router.post('/generate', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Validate request body
    const generateRequest = GenerateQuestionRequestSchema.parse(req.body);

    logger.info('Generating questions with LLM', {
      userId: req.user?.id,
      ageGroup: generateRequest.ageGroup,
      topic: generateRequest.topic,
      count: generateRequest.count,
    });

    // Check user permissions (admin only for generation)
    if (req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: { message: 'Insufficient permissions for question generation' },
      });
      return;
    }

    const generatedQuestions = [];

    // Generate requested number of questions
    for (let i = 0; i < generateRequest.count; i++) {
      const llmQuestion = await llmService.generateQuestion({
        ageGroup: generateRequest.ageGroup,
        topic: generateRequest.topic,
        cognitiveSkillTag: generateRequest.cognitiveSkillTag,
        difficulty: generateRequest.difficulty,
        culturalContext: 'global',
        language: 'english',
      });

      // Convert LLM response to Question format
      const question = {
        id: `generated-${Date.now()}-${i}`,
        questionId: `gen-${generateRequest.topic.toLowerCase()}-${Date.now()}-${i}`,
        ageGroup: generateRequest.ageGroup,
        topic: generateRequest.topic,
        text: llmQuestion.text,
        options: llmQuestion.options,
        correctOptionId: llmQuestion.correctOptionId,
        explanation: llmQuestion.explanation,
        mediaUrls: [],
        cognitiveSkillTags: llmQuestion.cognitiveSkillTags,
        difficulty: llmQuestion.difficulty,
        isActive: true,
        createdBy: `user-${req.user?.id}`,
        createdAt: new Date().toISOString(),
      };

      generatedQuestions.push(question);
    }

    res.status(201).json({
      success: true,
      data: {
        questions: generatedQuestions,
        metadata: {
          count: generatedQuestions.length,
          generatedAt: new Date().toISOString(),
          topic: generateRequest.topic,
          ageGroup: generateRequest.ageGroup,
        },
      },
    });
  } catch (error) {
    logger.error('Failed to generate questions', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to generate questions' },
    });
  }
});

/**
 * GET /api/questions/:id
 * Get specific question by ID
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const questionId = req.params?.id;
    
    if (!questionId) {
      res.status(400).json({
        success: false,
        error: { message: 'Question ID is required' },
      });
      return;
    }

    const question = sampleQuestions.find(q => q.questionId === questionId);

    if (!question) {
      res.status(404).json({
        success: false,
        error: { message: 'Question not found' },
      });
      return;
    }

    // Remove correct answer for non-admin users
    const questionForClient = req.user?.role === 'admin' 
      ? question 
      : { ...question, correctOptionId: undefined };

    res.status(200).json({
      success: true,
      data: { question: questionForClient },
    });
  } catch (error) {
    logger.error('Failed to fetch question', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch question' },
    });
  }
});

/**
 * GET /api/questions/analytics/summary
 * Get question analytics summary
 */
router.get('/analytics/summary', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check admin permissions
    if (req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: { message: 'Insufficient permissions' },
      });
      return;
    }

    // Generate analytics summary
    const summary = {
      totalQuestions: sampleQuestions.length,
      byAgeGroup: {
        '5-10': sampleQuestions.filter(q => q.ageGroup === '5-10').length,
        '10-15': sampleQuestions.filter(q => q.ageGroup === '10-15').length,
        '15-18': sampleQuestions.filter(q => q.ageGroup === '15-18').length,
      },
      byDifficulty: {
        easy: sampleQuestions.filter(q => q.difficulty === 'easy').length,
        medium: sampleQuestions.filter(q => q.difficulty === 'medium').length,
        hard: sampleQuestions.filter(q => q.difficulty === 'hard').length,
      },
      bySkill: sampleQuestions.reduce((acc, q) => {
        q.cognitiveSkillTags.forEach(skill => {
          acc[skill] = (acc[skill] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      mostCommonTopics: [...new Set(sampleQuestions.map(q => q.topic))],
      activeQuestions: sampleQuestions.filter(q => q.isActive).length,
      generatedAt: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      data: { summary },
    });
  } catch (error) {
    logger.error('Failed to get analytics summary', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get analytics summary' },
    });
  }
});

export default router;