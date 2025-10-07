import { config } from '@/config';
import { logger } from '@/utils/logger';
import {
  Answer,
  Question,
  QuizSubmission,
  ScoreBreakdown,
  Category,
  AgeGroup,
  Strength,
  Opportunity,
  GamificationRewards,
  QuestionBreakdown,
} from '@/types';

export interface ScoringResult {
  scores: ScoreBreakdown;
  strengths: Strength[];
  opportunities: Opportunity[];
  questionBreakdown: QuestionBreakdown[];
  gamificationRewards: GamificationRewards;
}

export class ScoringService {
  /**
   * Calculate comprehensive scores for a quiz submission
   */
  async calculateScores(
    submission: QuizSubmission,
    questions: Question[]
  ): Promise<ScoringResult> {
    try {
      // Create question lookup for efficient access
      const questionMap = new Map(questions.map(q => [q.questionId, q]));
      
      // Calculate basic scores
      const basicScores = this.calculateBasicScores(submission, questionMap);
      
      // Calculate advanced metrics
      const speedScore = this.calculateSpeedScore(submission, questionMap);
      const consistencyScore = this.calculateConsistencyScore(submission);
      const compositeScore = this.calculateCompositeScore(basicScores, speedScore, consistencyScore);
      
      // Determine category
      const category = this.determineCategory(basicScores.percentageScore);
      
      // Analyze cognitive skills
      const skillAnalysis = this.analyzeCognitiveSkills(submission, questionMap);
      
      // Generate question breakdown
      const questionBreakdown = this.generateQuestionBreakdown(submission, questionMap);
      
      // Calculate gamification rewards
      const gamificationRewards = this.calculateGamificationRewards(
        basicScores,
        category,
        submission,
        skillAnalysis
      );

      const scores: ScoreBreakdown = {
        rawScore: basicScores.rawScore,
        totalQuestions: basicScores.totalQuestions,
        percentageScore: basicScores.percentageScore,
        compositeScore,
        speedScore,
        consistencyScore,
        category,
      };

      logger.info('Scores calculated successfully', {
        userId: submission.userId,
        category,
        percentageScore: basicScores.percentageScore,
        compositeScore,
      });

      return {
        scores,
        strengths: skillAnalysis.strengths,
        opportunities: skillAnalysis.opportunities,
        questionBreakdown,
        gamificationRewards,
      };
    } catch (error) {
      logger.error('Failed to calculate scores', error);
      throw new Error('Score calculation failed');
    }
  }

  /**
   * Calculate basic raw and percentage scores
   */
  private calculateBasicScores(
    submission: QuizSubmission,
    questionMap: Map<string, Question>
  ): { rawScore: number; totalQuestions: number; percentageScore: number } {
    let correctAnswers = 0;
    const totalQuestions = submission.answers.length;

    for (const answer of submission.answers) {
      const question = questionMap.get(answer.questionId);
      if (question && answer.selectedOptionId === question.correctOptionId) {
        correctAnswers++;
      }
    }

    const percentageScore = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    return {
      rawScore: correctAnswers,
      totalQuestions,
      percentageScore: Math.round(percentageScore * 100) / 100, // Round to 2 decimal places
    };
  }

  /**
   * Calculate speed score based on response times
   */
  private calculateSpeedScore(
    submission: QuizSubmission,
    questionMap: Map<string, Question>
  ): number {
    const ageGroup = this.determineAgeGroup(submission);
    const expectedTimes = config.scoring.expectedResponseTimes[ageGroup];
    
    let totalSpeedScore = 0;
    let validAnswers = 0;

    for (const answer of submission.answers) {
      const question = questionMap.get(answer.questionId);
      if (!question) continue;

      const expectedTime = expectedTimes[question.difficulty];
      const actualTime = answer.responseTimeMs;
      
      // Calculate speed score (faster = higher score, but not penalize thoughtful answers)
      let speedRatio = expectedTime / Math.max(actualTime, expectedTime * 0.3);
      speedRatio = Math.min(speedRatio, 2); // Cap at 2x speed bonus
      
      const speedScore = Math.min(100, speedRatio * 50); // Convert to 0-100 scale
      
      totalSpeedScore += speedScore;
      validAnswers++;
    }

    return validAnswers > 0 ? totalSpeedScore / validAnswers : 50; // Default to 50 if no valid answers
  }

  /**
   * Calculate consistency score based on response time variance
   */
  private calculateConsistencyScore(submission: QuizSubmission): number {
    const responseTimes = submission.answers.map(a => a.responseTimeMs);
    
    if (responseTimes.length < 2) return 100;

    const mean = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    const variance = responseTimes.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / responseTimes.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Lower standard deviation = higher consistency
    const coefficientOfVariation = standardDeviation / mean;
    
    // Convert to 0-100 scale (lower CV = higher score)
    return Math.max(0, Math.min(100, 100 - (coefficientOfVariation * 100)));
  }

  /**
   * Calculate composite score using weighted average
   */
  private calculateCompositeScore(
    basicScores: { percentageScore: number },
    speedScore: number,
    consistencyScore: number
  ): number {
    const weights = config.scoring.weights;
    
    const composite = (
      basicScores.percentageScore * weights.percentage +
      speedScore * weights.speed +
      consistencyScore * weights.consistency
    );

    return Math.round(composite * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Determine learner category based on percentage score
   */
  private determineCategory(percentageScore: number): Category {
    const thresholds = config.scoring.categories;
    
    if (percentageScore >= thresholds.innovator) {
      return 'Innovator';
    } else if (percentageScore >= thresholds.explorer) {
      return 'Explorer';
    } else {
      return 'Builder';
    }
  }

  /**
   * Analyze cognitive skills to identify strengths and opportunities
   */
  private analyzeCognitiveSkills(
    submission: QuizSubmission,
    questionMap: Map<string, Question>
  ): { strengths: Strength[]; opportunities: Opportunity[] } {
    const skillScores = new Map<string, { correct: number; total: number }>();

    // Calculate scores per cognitive skill
    for (const answer of submission.answers) {
      const question = questionMap.get(answer.questionId);
      if (!question) continue;

      const isCorrect = answer.selectedOptionId === question.correctOptionId;
      
      for (const skill of question.cognitiveSkillTags) {
        const current = skillScores.get(skill) || { correct: 0, total: 0 };
        skillScores.set(skill, {
          correct: current.correct + (isCorrect ? 1 : 0),
          total: current.total + 1,
        });
      }
    }

    // Convert to percentages and sort
    const skillPercentages = Array.from(skillScores.entries())
      .map(([skill, scores]) => ({
        skill,
        percentage: scores.total > 0 ? (scores.correct / scores.total) * 100 : 0,
        questionCount: scores.total,
      }))
      .filter(item => item.questionCount > 0)
      .sort((a, b) => b.percentage - a.percentage);

    // Identify top 3 strengths (>= 70%)
    const strengths: Strength[] = skillPercentages
      .filter(item => item.percentage >= 70)
      .slice(0, 3)
      .map(item => ({
        skillTag: item.skill,
        score: Math.round(item.percentage),
        examples: this.getSkillExamples(item.skill, true),
        description: this.getSkillDescription(item.skill, true),
      }));

    // Identify opportunities for improvement (< 60%)
    const opportunities: Opportunity[] = skillPercentages
      .filter(item => item.percentage < 60)
      .slice(0, 3)
      .map(item => ({
        skillTag: item.skill,
        score: Math.round(item.percentage),
        description: this.getSkillDescription(item.skill, false),
        recommendedLessonIds: this.getRecommendedLessonIds(item.skill),
        priority: item.percentage < 30 ? 'high' : item.percentage < 50 ? 'medium' : 'low',
      }));

    return { strengths, opportunities };
  }

  /**
   * Generate detailed question breakdown
   */
  private generateQuestionBreakdown(
    submission: QuizSubmission,
    questionMap: Map<string, Question>
  ): QuestionBreakdown[] {
    return submission.answers.map(answer => {
      const question = questionMap.get(answer.questionId);
      const isCorrect = question ? answer.selectedOptionId === question.correctOptionId : false;

      return {
        id: answer.questionId,
        questionText: question?.text || 'Question not found',
        selectedOptionId: answer.selectedOptionId,
        correctOptionId: question?.correctOptionId || '',
        isCorrect,
        timeSpentMs: answer.responseTimeMs,
        explanation: question?.explanation || '',
        cognitiveSkillTags: question?.cognitiveSkillTags || [],
      };
    });
  }

  /**
   * Calculate gamification rewards
   */
  private calculateGamificationRewards(
    basicScores: { rawScore: number; percentageScore: number },
    category: Category,
    submission: QuizSubmission,
    skillAnalysis: { strengths: Strength[]; opportunities: Opportunity[] }
  ): GamificationRewards {
    let xp = 0;
    const badges: string[] = [];
    const achievements: string[] = [];
    const streaks: Record<string, number> = {};

    // Base XP calculation
    xp += basicScores.rawScore * 10; // 10 XP per correct answer
    
    // Bonus XP for performance
    if (basicScores.percentageScore >= 90) {
      xp += 100; // Excellent performance bonus
      badges.push('Perfectionist');
    } else if (basicScores.percentageScore >= 80) {
      xp += 50; // Great performance bonus
      badges.push('High Achiever');
    } else if (basicScores.percentageScore >= 60) {
      xp += 25; // Good performance bonus
      badges.push('Steady Learner');
    }

    // Category-specific badges
    badges.push(`${category} Level 1`);

    // First quiz badge
    badges.push('Quiz Starter');

    // Speed bonuses
    const avgResponseTime = submission.answers.reduce((sum, a) => sum + a.responseTimeMs, 0) / submission.answers.length;
    if (avgResponseTime < 10000) { // Less than 10 seconds average
      badges.push('Speed Demon');
      xp += 30;
    }

    // Skill mastery achievements
    for (const strength of skillAnalysis.strengths) {
      if (strength.score >= 90) {
        achievements.push(`${strength.skillTag} Master`);
        xp += 20;
      }
    }

    // Completion streaks (mock data - would be calculated from user history)
    streaks['daily'] = 1;
    streaks['weekly'] = 1;

    return {
      xp,
      badges,
      achievements,
      streaks,
    };
  }

  /**
   * Helper methods
   */
  private determineAgeGroup(submission: QuizSubmission): AgeGroup {
    // This would typically come from user profile
    // For now, we'll default to '10-15'
    return '10-15';
  }

  private getSkillExamples(skill: string, isStrength: boolean): string[] {
    const examples = {
      'pattern-recognition': isStrength 
        ? ['Quickly identified number sequences', 'Recognized visual patterns'] 
        : ['Practice with sequence puzzles', 'Work on visual pattern games'],
      'numerical-reasoning': isStrength 
        ? ['Solved math problems accurately', 'Quick mental calculations'] 
        : ['Practice basic arithmetic', 'Work on word problems'],
      'logical-thinking': isStrength 
        ? ['Clear logical deductions', 'Strong reasoning skills'] 
        : ['Practice logic puzzles', 'Work on cause-effect relationships'],
    };

    return examples[skill as keyof typeof examples] || [
      isStrength ? 'Strong performance in this area' : 'Room for improvement in this area'
    ];
  }

  private getSkillDescription(skill: string, isStrength: boolean): string {
    const descriptions = {
      'pattern-recognition': isStrength 
        ? 'Excellent at identifying and predicting patterns in sequences and visual arrangements'
        : 'Could benefit from more practice with pattern identification and sequence completion',
      'numerical-reasoning': isStrength 
        ? 'Strong mathematical thinking and problem-solving abilities'
        : 'Could improve mathematical reasoning and computational skills',
      'logical-thinking': isStrength 
        ? 'Demonstrates clear logical reasoning and deductive thinking'
        : 'Could strengthen logical reasoning and critical thinking skills',
    };

    return descriptions[skill as keyof typeof descriptions] || 
      (isStrength ? `Strong ${skill} abilities` : `Room to improve ${skill} skills`);
  }

  private getRecommendedLessonIds(skill: string): string[] {
    const lessonMappings = {
      'pattern-recognition': ['L-PATTERN-001', 'L-PATTERN-002', 'L-PATTERN-003'],
      'numerical-reasoning': ['L-MATH-001', 'L-MATH-002', 'L-MATH-003'],
      'logical-thinking': ['L-LOGIC-001', 'L-LOGIC-002', 'L-LOGIC-003'],
      'time-management': ['L-TIME-001', 'L-TIME-002'],
      'attention-to-detail': ['L-FOCUS-001', 'L-FOCUS-002'],
    };

    return lessonMappings[skill as keyof typeof lessonMappings] || [`L-${skill.toUpperCase()}-001`];
  }
}

export const scoringService = new ScoringService();