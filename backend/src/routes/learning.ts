import express from 'express';
import { ContentGenerationService } from '../services/contentGeneration';
import { Subject, Module, Lesson, QuizMeta } from '../models/Content';
import { authMiddleware, rateLimitMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { logger } from '../utils/logger';

const router = express.Router();
const contentService = new ContentGenerationService();

// Apply authentication and rate limiting to all routes
router.use(authMiddleware);
router.use(rateLimitMiddleware);

/**
 * GET /api/learning/grades
 * Returns available grades
 */
router.get('/grades', async (req, res) => {
  try {
    const grades = Array.from({ length: 13 }, (_, i) => ({
      id: i,
      label: i === 0 ? 'K' : i.toString(),
      description: i === 0 ? 'Kindergarten' : `Grade ${i}`,
      ageRange: `${5 + i}-${6 + i}`
    }));

    res.json({
      success: true,
      data: { grades }
    });
  } catch (error) {
    logger.error('Error fetching grades', { error });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/learning/subjects
 * Returns subject list and theme metadata
 */
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await Subject.find({ isActive: true })
      .select('id name themeColor iconRef lottieRef description availableGrades')
      .lean();

    res.json({
      success: true,
      data: { subjects }
    });
  } catch (error) {
    logger.error('Error fetching subjects', { error });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/learning/:grade/subjects
 * Returns subjects + module summaries for specific grade
 */
router.get('/:grade/subjects', validateRequest({
  params: { grade: { type: 'number', min: 0, max: 12 } }
}), async (req, res) => {
  try {
    const { grade } = req.params;
    const gradeNum = parseInt(grade);

    // Get subjects available for this grade
    const subjects = await Subject.find({
      isActive: true,
      availableGrades: gradeNum
    }).lean();

    // Get module summaries for each subject
    const subjectsWithModules = await Promise.all(
      subjects.map(async (subject) => {
        const modules = await Module.find({
          subjectId: subject.id,
          grade: gradeNum,
          isActive: true
        })
        .select('id title durationMin xpReward thumbnailUrl difficulty')
        .sort({ completionOrder: 1 })
        .lean();

        return {
          ...subject,
          moduleCount: modules.length,
          totalXP: modules.reduce((sum, m) => sum + m.xpReward, 0),
          totalDuration: modules.reduce((sum, m) => sum + m.durationMin, 0)
        };
      })
    );

    res.json({
      success: true,
      data: {
        grade: gradeNum,
        subjects: subjectsWithModules
      }
    });
  } catch (error) {
    logger.error('Error fetching subjects for grade', { error, grade: req.params.grade });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/learning/:grade/:subject/modules
 * Returns modules and lesson metadata for grade and subject
 */
router.get('/:grade/:subject/modules', validateRequest({
  params: {
    grade: { type: 'number', min: 0, max: 12 },
    subject: { type: 'string', enum: ['Maths', 'Science', 'Geography', 'EVS'] }
  }
}), async (req, res) => {
  try {
    const { grade, subject } = req.params;
    const gradeNum = parseInt(grade);

    // Get subject info
    const subjectInfo = await Subject.findOne({ name: subject, isActive: true }).lean();
    if (!subjectInfo) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    // Get modules for this grade and subject
    const modules = await Module.find({
      subjectId: subjectInfo.id,
      grade: gradeNum,
      isActive: true
    })
    .sort({ completionOrder: 1 })
    .lean();

    // Enrich modules with lesson summaries
    const modulesWithLessons = await Promise.all(
      modules.map(async (module) => {
        const lessons = await Lesson.find({
          moduleId: module.id,
          isActive: true
        })
        .select('id title description durationSec thumbnailUrl skillTags')
        .sort({ completionOrder: 1 })
        .lean();

        return {
          ...module,
          lessonCount: lessons.length,
          lessons: lessons.map(lesson => ({
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            durationSec: lesson.durationSec,
            thumbnailUrl: lesson.thumbnailUrl
          }))
        };
      })
    );

    res.json({
      success: true,
      data: {
        grade: gradeNum,
        subject: subject,
        subjectTheme: subjectInfo.themeColor,
        modules: modulesWithLessons
      }
    });
  } catch (error) {
    logger.error('Error fetching modules', { error, grade: req.params.grade, subject: req.params.subject });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/lesson/:lessonId
 * Returns lesson metadata + category-specific transcript
 */
router.get('/lesson/:lessonId', validateRequest({
  params: { lessonId: { type: 'string' } },
  query: { userCategory: { type: 'string', enum: ['builder', 'explorer', 'innovator'] } }
}), async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { userCategory } = req.query as { userCategory: 'builder' | 'explorer' | 'innovator' };

    // Get lesson data
    const lesson = await Lesson.findOne({ id: lessonId, isActive: true }).lean();
    if (!lesson) {
      return res.status(404).json({ success: false, error: 'Lesson not found' });
    }

    // Get quiz metadata
    const quizMeta = await QuizMeta.findOne({ id: lesson.quizMetaId, isActive: true }).lean();

    // Get module info for grade context
    const module = await Module.findOne({ id: lesson.moduleId }).lean();
    if (!module) {
      return res.status(404).json({ success: false, error: 'Module not found' });
    }

    // Generate adaptive transcript
    const adaptedTranscript = await contentService.getAdaptiveTranscript({
      transcriptBase: lesson.transcriptBase,
      targetCategory: userCategory,
      grade: module.grade,
      lessonTitle: lesson.title
    });

    // Format response
    const response = {
      lessonId: lesson.id,
      moduleId: lesson.moduleId,
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.videoUrl,
      durationSec: lesson.durationSec,
      transcript: {
        text: adaptedTranscript.transcript,
        highlights: adaptedTranscript.highlights,
        inlineActivities: adaptedTranscript.inlineActivities,
        categoryFeatures: adaptedTranscript.categoryFeatures
      },
      timestamps: lesson.timestamps,
      resourceLinks: lesson.resourceLinks,
      quizMeta: quizMeta ? {
        questionCount: quizMeta.questionCountByCategory[userCategory],
        skillTags: quizMeta.skillTags,
        hintPolicy: quizMeta.hintPolicy[userCategory] ? 'hintsAllowed' : 'noHints',
        timeLimit: quizMeta.timeLimitMinutes?.[userCategory],
        passingScore: quizMeta.passingScore[userCategory]
      } : null
    };

    res.json({
      success: true,
      data: response
    });

    // Log usage for analytics
    logger.info('Lesson accessed', {
      lessonId,
      userCategory,
      userId: req.user?.id,
      grade: module.grade
    });

  } catch (error) {
    logger.error('Error fetching lesson', { error, lessonId: req.params.lessonId });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;