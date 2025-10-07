import express from 'express';
import { ContentGenerationService } from '../services/contentGeneration';
import { Lesson, QuizMeta, Module } from '../models/Content';
import { authMiddleware, rateLimitMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { ScoringService } from '../services/scoring';
import { logger } from '../utils/logger';

const router = express.Router();
const contentService = new ContentGenerationService();
const scoringService = new ScoringService();

router.use(authMiddleware);
router.use(rateLimitMiddleware);

/**
 * POST /api/quiz/generate
 * Generate adaptive quiz for lesson
 */
router.post('/generate', validateRequest({
  body: {
    lessonId: { type: 'string', required: true },
    userCategory: { type: 'string', enum: ['builder', 'explorer', 'innovator'], required: true },
    numQuestions: { type: 'number', min: 5, max: 50, required: false },
    seed: { type: 'string', required: false }
  }
}), async (req, res) => {
  try {
    const { lessonId, userCategory, numQuestions, seed } = req.body;

    // Get lesson and module info
    const lesson = await Lesson.findOne({ id: lessonId, isActive: true }).lean();
    if (!lesson) {
      return res.status(404).json({ success: false, error: 'Lesson not found' });
    }

    const module = await Module.findOne({ id: lesson.moduleId }).lean();
    if (!module) {
      return res.status(404).json({ success: false, error: 'Module not found' });
    }

    const quizMeta = await QuizMeta.findOne({ id: lesson.quizMetaId, isActive: true }).lean();
    if (!quizMeta) {
      return res.status(404).json({ success: false, error: 'Quiz metadata not found' });
    }

    // Determine question count
    const questionCount = numQuestions || quizMeta.questionCountByCategory[userCategory];

    // Generate quiz
    const quiz = await contentService.generateQuiz({
      lessonId,
      userCategory,
      grade: module.grade,
      lessonTitle: lesson.title,
      skillTags: lesson.skillTags,
      difficulty: module.difficulty,
      count: questionCount,
      seed: seed || undefined
    });

    // Add metadata from quiz config
    quiz.metadata.timeLimit = quizMeta.timeLimitMinutes?.[userCategory];
    quiz.metadata.passingScore = quizMeta.passingScore[userCategory];
    quiz.metadata.allowedHints = quizMeta.hintPolicy[userCategory];

    res.json({
      success: true,
      data: quiz
    });

    logger.info('Quiz generated', {
      quizId: quiz.quizId,
      lessonId,
      userCategory,
      questionCount,
      userId: req.user?.id
    });

  } catch (error) {
    logger.error('Error generating quiz', { error, body: req.body });
    res.status(500).json({ success: false, error: 'Failed to generate quiz' });
  }
});

/**
 * POST /api/quiz/submit
 * Submit quiz answers and get results
 */
router.post('/submit', validateRequest({
  body: {
    quizId: { type: 'string', required: true },
    lessonId: { type: 'string', required: true },
    userCategory: { type: 'string', enum: ['builder', 'explorer', 'innovator'], required: true },
    answers: { type: 'array', required: true },
    timeSpentSeconds: { type: 'number', min: 0, required: false },
    hintsUsed: { type: 'number', min: 0, required: false }
  }
}), async (req, res) => {
  try {
    const { quizId, lessonId, userCategory, answers, timeSpentSeconds, hintsUsed } = req.body;

    // Validate lesson exists
    const lesson = await Lesson.findOne({ id: lessonId, isActive: true }).lean();
    if (!lesson) {
      return res.status(404).json({ success: false, error: 'Lesson not found' });
    }

    const module = await Module.findOne({ id: lesson.moduleId }).lean();
    if (!module) {
      return res.status(404).json({ success: false, error: 'Module not found' });
    }

    // Calculate score using scoring service
    const scoreResult = await scoringService.calculateQuizScore({
      quizId,
      lessonId,
      userCategory,
      answers,
      timeSpentSeconds: timeSpentSeconds || 0,
      hintsUsed: hintsUsed || 0
    });

    // Generate personalized feedback
    const feedback = await contentService.generateQuizFeedback(
      {
        score: scoreResult.totalScore,
        percent: scoreResult.percentage,
        questionBreakdown: scoreResult.questionBreakdown
      },
      userCategory,
      lesson.title
    );

    // Calculate XP and badges
    const xpReward = scoringService.calculateXPReward({
      baseScore: scoreResult.totalScore,
      questionCount: answers.length,
      difficulty: module.difficulty,
      userCategory,
      timeBonus: scoreResult.timeBonus || 0,
      streakMultiplier: scoreResult.streakMultiplier || 1
    });

    const badges = await scoringService.checkBadgeEligibility({
      userId: req.user?.id,
      scoreResult,
      lessonId,
      moduleId: module.id
    });

    // Prepare response
    const response = {
      quizId,
      results: {
        score: scoreResult.totalScore,
        percentage: scoreResult.percentage,
        passed: scoreResult.percentage >= (scoreResult.passingScore || 70),
        questionBreakdown: scoreResult.questionBreakdown,
        timeSpentSeconds,
        hintsUsed
      },
      rewards: {
        xpEarned: xpReward,
        badges: badges,
        streakBonus: scoreResult.streakMultiplier > 1
      },
      feedback: {
        message: feedback.feedback,
        improvementTips: feedback.improvementTips,
        recommendedLessons: feedback.recommendedLessons
      },
      nextSteps: {
        retryAllowed: scoreResult.percentage < 70,
        nextLesson: null, // TODO: Implement recommendation logic
        practiceMode: userCategory === 'builder' && scoreResult.percentage < 80
      }
    };

    res.json({
      success: true,
      data: response
    });

    // Log completion for analytics
    logger.info('Quiz completed', {
      quizId,
      lessonId,
      userId: req.user?.id,
      score: scoreResult.totalScore,
      percentage: scoreResult.percentage,
      userCategory,
      timeSpent: timeSpentSeconds
    });

  } catch (error) {
    logger.error('Error submitting quiz', { error, body: req.body });
    res.status(500).json({ success: false, error: 'Failed to process quiz submission' });
  }
});

/**
 * GET /api/quiz/history/:userId
 * Get quiz history for user
 */
router.get('/history/:userId', validateRequest({
  params: { userId: { type: 'string' } },
  query: {
    limit: { type: 'number', min: 1, max: 100, default: 20 },
    offset: { type: 'number', min: 0, default: 0 }
  }
}), async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit, offset } = req.query;

    // TODO: Implement quiz history retrieval from user progress service
    // This would typically query a UserQuizAttempts collection

    res.json({
      success: true,
      data: {
        quizzes: [],
        totalCount: 0,
        hasMore: false
      }
    });
  } catch (error) {
    logger.error('Error fetching quiz history', { error, userId: req.params.userId });
    res.status(500).json({ success: false, error: 'Failed to fetch quiz history' });
  }
});

export default router;