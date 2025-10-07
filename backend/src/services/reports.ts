import { config } from '@/config';
import { logger } from '@/utils/logger';
import { llmService } from '@/services/llm';
import { scoringService, ScoringResult } from '@/services/scoring';
import {
  Report,
  QuizSubmission,
  UserProfile,
  Question,
  Lesson,
  LLMReportPrompt,
  ScoreBreakdown,
  QuestionBreakdown,
  Opportunity,
} from '@/types';

export interface CertificateMetadata {
  eligible: boolean;
  type?: 'completion' | 'achievement' | 'mastery';
  criteria?: string;
  validUntil?: string;
  certificateId?: string;
}

export class ReportService {
  /**
   * Generate comprehensive personalized report
   */
  async generateReport(
    submission: QuizSubmission,
    userProfile: UserProfile,
    questions: Question[],
    recommendedLessons: Lesson[]
  ): Promise<Report> {
    try {
      logger.info('Generating report', { 
        userId: submission.userId,
        submissionId: 'quiz-submission'
      });

      // Calculate scores and analysis
      const scoringResult = await scoringService.calculateScores(submission, questions);

      // Generate AI-powered content
      const llmContent = await this.generateLLMContent(
        userProfile,
        scoringResult,
        submission
      );

      // Generate certificate metadata
      const certificate = this.generateCertificateMetadata(
        scoringResult.scores,
        userProfile
      );

      // Get Lottie animation references
      const lottieRefs = this.getLottieReferences(scoringResult.scores.category);

      const report: Report = {
        id: this.generateReportId(),
        userSummary: {
          name: userProfile.username,
          age: userProfile.age,
          ageGroup: userProfile.ageGroup,
          avatar: userProfile.avatarId,
        },
        scores: scoringResult.scores,
        strengths: scoringResult.strengths,
        opportunities: scoringResult.opportunities,
        questionBreakdown: scoringResult.questionBreakdown,
        gamificationRewards: scoringResult.gamificationRewards,
        lessonPlan: recommendedLessons,
        certificate,
        lottieRefs,
        generatedAt: new Date().toISOString(),
      };

      logger.info('Report generated successfully', {
        userId: submission.userId,
        reportId: report.id,
        category: scoringResult.scores.category,
        score: scoringResult.scores.percentageScore,
      });

      return report;
    } catch (error) {
      logger.error('Failed to generate report', error);
      throw new Error('Report generation failed');
    }
  }

  /**
   * Generate AI-powered content for the report
   */
  private async generateLLMContent(
    userProfile: UserProfile,
    scoringResult: ScoringResult,
    submission: QuizSubmission
  ): Promise<{
    childMessage: string;
    parentMessage: string;
    recommendedLessons: Array<{ title: string; objective: string; duration: number }>;
  }> {
    const llmPrompt: LLMReportPrompt = {
      userProfile: {
        name: userProfile.username,
        age: userProfile.age,
        ageGroup: userProfile.ageGroup,
      },
      scores: scoringResult.scores,
      strengths: scoringResult.strengths.map(s => s.skillTag),
      opportunities: scoringResult.opportunities.map(o => o.skillTag),
      questionHistory: scoringResult.questionBreakdown,
    };

    return await llmService.generateReportContent(llmPrompt);
  }

  /**
   * Generate certificate metadata based on performance
   */
  private generateCertificateMetadata(
    scores: ScoreBreakdown,
    userProfile: UserProfile
  ): CertificateMetadata {
    const { percentageScore, category } = scores;

    // Determine certificate eligibility
    let eligible = false;
    let type: 'completion' | 'achievement' | 'mastery' | undefined;
    let criteria = '';

    if (percentageScore >= 90) {
      eligible = true;
      type = 'mastery';
      criteria = 'Achieved 90%+ mastery level';
    } else if (percentageScore >= 80) {
      eligible = true;
      type = 'achievement';
      criteria = 'Achieved 80%+ achievement level';
    } else if (percentageScore >= 60) {
      eligible = true;
      type = 'completion';
      criteria = 'Successfully completed assessment';
    }

    const certificate: CertificateMetadata = {
      eligible,
    };

    if (eligible && type) {
      certificate.type = type;
      certificate.criteria = criteria;
      certificate.certificateId = this.generateCertificateId(userProfile, type);
      certificate.validUntil = this.calculateCertificateExpiry();
    }

    return certificate;
  }

  /**
   * Get Lottie animation references based on category
   */
  private getLottieReferences(category: string) {
    return {
      confetti: config.lottieRefs.confetti,
      brainGauge: config.lottieRefs.brainGauge,
      categoryAnimation: config.lottieRefs.categoryAnimations[category as keyof typeof config.lottieRefs.categoryAnimations],
    };
  }

  /**
   * Generate analytics summary for A/B testing and improvements
   */
  async generateAnalyticsSummary(report: Report): Promise<{
    categoryDistribution: Record<string, number>;
    averageScore: number;
    commonStrengths: string[];
    commonOpportunities: string[];
    completionTime: number;
  }> {
    // This would typically aggregate data from multiple reports
    // For now, return single report analysis
    return {
      categoryDistribution: { [report.scores.category]: 1 },
      averageScore: report.scores.percentageScore,
      commonStrengths: report.strengths.map(s => s.skillTag),
      commonOpportunities: report.opportunities.map(o => o.skillTag),
      completionTime: this.calculateCompletionTime(report.questionBreakdown),
    };
  }

  /**
   * Generate insights for educators/parents
   */
  async generateEducatorInsights(report: Report): Promise<{
    learningStyle: string;
    recommendedActivities: string[];
    parentGuidance: string[];
    nextSteps: string[];
  }> {
    const { category, percentageScore } = report.scores;
    const strengths = report.strengths.map(s => s.skillTag);
    const opportunities = report.opportunities.map(o => o.skillTag);

    return {
      learningStyle: this.determineLearningStyle(category, strengths),
      recommendedActivities: this.getRecommendedActivities(category, opportunities),
      parentGuidance: this.getParentGuidance(category, percentageScore),
      nextSteps: this.getNextSteps(report.opportunities, report.lessonPlan),
    };
  }

  /**
   * Helper methods
   */
  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCertificateId(userProfile: UserProfile, type: string): string {
    const timestamp = Date.now();
    const userHash = userProfile.username.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `CERT_${type.toUpperCase()}_${userHash}_${timestamp}`;
  }

  private calculateCertificateExpiry(): string {
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1); // Valid for 1 year
    return expiryDate.toISOString();
  }

  private calculateCompletionTime(questionBreakdown: QuestionBreakdown[]): number {
    return questionBreakdown.reduce((total, q) => total + q.timeSpentMs, 0);
  }

  private determineLearningStyle(category: string, strengths: string[]): string {
    const styleMap = {
      'Builder': 'Structured, step-by-step learning with clear foundations',
      'Explorer': 'Diverse, interactive learning with variety and exploration',
      'Innovator': 'Challenge-based learning with creative problem-solving opportunities',
    };

    return styleMap[category as keyof typeof styleMap] || 'Adaptive learning approach';
  }

  private getRecommendedActivities(category: string, opportunities: string[]): string[] {
    const activityMap = {
      'Builder': [
        'Practice with guided tutorials',
        'Complete structured worksheets',
        'Follow step-by-step problem solutions',
      ],
      'Explorer': [
        'Try different learning games',
        'Explore various topic areas',
        'Engage in group learning activities',
      ],
      'Innovator': [
        'Tackle complex challenges',
        'Create original projects',
        'Lead peer learning sessions',
      ],
    };

    const baseActivities = activityMap[category as keyof typeof activityMap] || [];
    
    // Add opportunity-specific activities
    const opportunityActivities = opportunities.map(opp => 
      `Focus on ${opp.replace('-', ' ')} practice`
    );

    return [...baseActivities, ...opportunityActivities];
  }

  private getParentGuidance(category: string, score: number): string[] {
    const baseGuidance = [
      'Celebrate effort and progress, not just results',
      'Provide regular encouragement and support',
      'Create a positive learning environment at home',
    ];

    if (score >= 80) {
      baseGuidance.push('Challenge with advanced materials');
      baseGuidance.push('Encourage mentoring of peers');
    } else if (score >= 60) {
      baseGuidance.push('Focus on consistent practice');
      baseGuidance.push('Identify and build on strengths');
    } else {
      baseGuidance.push('Provide extra support and patience');
      baseGuidance.push('Break learning into smaller, manageable chunks');
    }

    return baseGuidance;
  }

  private getNextSteps(opportunities: Opportunity[], lessons: Lesson[]): string[] {
    const steps = [
      'Complete recommended lesson modules',
      'Practice identified skill areas regularly',
      'Track progress through regular assessments',
    ];

    if (opportunities.length > 0) {
      steps.push(`Focus on improving: ${opportunities.map(o => o.skillTag).join(', ')}`);
    }

    if (lessons.length > 0) {
      steps.push(`Start with: ${lessons[0]?.title || 'first recommended lesson'}`);
    }

    return steps;
  }
}

export const reportService = new ReportService();