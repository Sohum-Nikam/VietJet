import { config } from '@/config';
import { logger } from '@/utils/logger';
import {
  Lesson,
  AgeGroup,
  Difficulty,
  LessonFormat,
  Category,
  RecommendLessonsRequest,
  Opportunity,
  UserProfile,
} from '@/types';

export interface LessonRecommendationCriteria {
  ageGroup: AgeGroup;
  category: Category;
  skillGaps: string[];
  learningStyle: string;
  difficultyPreference: Difficulty;
  timeAvailable?: number;
  previousLessons?: string[];
}

export interface RecommendationScore {
  lessonId: string;
  score: number;
  reasons: string[];
  priority: 'high' | 'medium' | 'low';
}

export class LessonRecommendationService {
  private lessonDatabase: Lesson[] = [];

  constructor() {
    this.initializeLessonDatabase();
  }

  /**
   * Get personalized lesson recommendations
   */
  async recommendLessons(request: RecommendLessonsRequest): Promise<Lesson[]> {
    try {
      logger.info('Generating lesson recommendations', {
        userId: request.userId,
        ageGroup: request.ageGroup,
        skillTags: request.skillTags,
        maxResults: request.maxResults,
      });

      // Filter lessons by basic criteria
      const filteredLessons = this.filterBasicCriteria(request);

      // Score and rank lessons
      const scoredLessons = this.scoreLessons(filteredLessons, request);

      // Sort by score and return top results
      const recommendations = scoredLessons
        .sort((a, b) => b.score - a.score)
        .slice(0, request.maxResults)
        .map(scored => this.findLessonById(scored.lessonId))
        .filter((lesson): lesson is Lesson => lesson !== undefined);

      logger.info('Lesson recommendations generated', {
        userId: request.userId,
        recommendedCount: recommendations.length,
        topLessonIds: recommendations.slice(0, 3).map(l => l.lessonId),
      });

      return recommendations;
    } catch (error) {
      logger.error('Failed to generate lesson recommendations', error);
      throw new Error('Lesson recommendation failed');
    }
  }

  /**
   * Get recommendations based on quiz results and opportunities
   */
  async recommendForOpportunities(
    opportunities: Opportunity[],
    userProfile: UserProfile,
    category: Category,
    maxResults: number = 8
  ): Promise<Lesson[]> {
    const skillTags = opportunities.map(opp => opp.skillTag);
    
    const request: RecommendLessonsRequest = {
      userId: userProfile.userId,
      ageGroup: userProfile.ageGroup,
      skillTags,
      difficulty: this.getDifficultyForCategory(category),
      maxResults,
    };

    return this.recommendLessons(request);
  }

  /**
   * Get adaptive lesson sequence for continuous learning
   */
  async getAdaptiveLessonSequence(
    userProfile: UserProfile,
    completedLessons: string[],
    targetSkills: string[],
    sequenceLength: number = 5
  ): Promise<Lesson[]> {
    try {
      // Find lessons that build on completed ones
      const availableLessons = this.lessonDatabase.filter(lesson => 
        lesson.ageGroup === userProfile.ageGroup &&
        !completedLessons.includes(lesson.lessonId) &&
        lesson.skillTags.some(tag => targetSkills.includes(tag))
      );

      // Create learning pathway with progressive difficulty
      const sequence: Lesson[] = [];
      let currentDifficulty: Difficulty = 'easy';
      
      for (let i = 0; i < sequenceLength; i++) {
        const candidates = availableLessons.filter(lesson => 
          lesson.difficulty === currentDifficulty &&
          !sequence.some(selected => selected.lessonId === lesson.lessonId)
        );

        if (candidates.length > 0) {
          // Select lesson with best skill coverage
          const bestLesson = this.selectBestLessonForSequence(candidates, targetSkills, sequence);
          if (bestLesson) {
            sequence.push(bestLesson);
          }
        }

        // Progress difficulty every 2 lessons
        if (i % 2 === 1) {
          currentDifficulty = this.getNextDifficulty(currentDifficulty);
        }
      }

      logger.info('Adaptive lesson sequence generated', {
        userId: userProfile.userId,
        sequenceLength: sequence.length,
        targetSkills,
      });

      return sequence;
    } catch (error) {
      logger.error('Failed to generate adaptive lesson sequence', error);
      throw new Error('Adaptive sequence generation failed');
    }
  }

  /**
   * Get lesson analytics and effectiveness metrics
   */
  async getLessonAnalytics(lessonId: string): Promise<{
    completionRate: number;
    averageScore: number;
    skillImprovement: Record<string, number>;
    userFeedback: number;
    difficulty: Difficulty;
    estimatedEffectiveness: number;
  }> {
    // Mock analytics - in production, this would query actual usage data
    return {
      completionRate: 0.85,
      averageScore: 78.5,
      skillImprovement: {
        'numerical-reasoning': 15.2,
        'problem-solving': 12.8,
        'logical-thinking': 18.1,
      },
      userFeedback: 4.3,
      difficulty: 'medium',
      estimatedEffectiveness: 0.82,
    };
  }

  /**
   * Private helper methods
   */
  private filterBasicCriteria(request: RecommendLessonsRequest): Lesson[] {
    return this.lessonDatabase.filter(lesson => {
      // Age group filter
      if (request.ageGroup && lesson.ageGroup !== request.ageGroup) {
        return false;
      }

      // Difficulty filter
      if (request.difficulty && lesson.difficulty !== request.difficulty) {
        return false;
      }

      // Skill tags filter
      if (request.skillTags && request.skillTags.length > 0) {
        const hasMatchingSkill = lesson.skillTags.some(tag => 
          request.skillTags!.includes(tag)
        );
        if (!hasMatchingSkill) {
          return false;
        }
      }

      // Active status
      return lesson.isActive;
    });
  }

  private scoreLessons(lessons: Lesson[], request: RecommendLessonsRequest): RecommendationScore[] {
    return lessons.map(lesson => {
      let score = 0;
      const reasons: string[] = [];

      // Skill relevance scoring
      if (request.skillTags) {
        const matchingSkills = lesson.skillTags.filter(tag => 
          request.skillTags!.includes(tag)
        );
        const skillRelevanceScore = (matchingSkills.length / request.skillTags.length) * 40;
        score += skillRelevanceScore;
        
        if (skillRelevanceScore > 20) {
          reasons.push(`Targets ${matchingSkills.length} of your focus areas`);
        }
      }

      // Duration preference scoring
      const idealDuration = this.getIdealDurationForAge(request.ageGroup || '10-15');
      const durationScore = Math.max(0, 20 - Math.abs(lesson.durationMinutes - idealDuration));
      score += durationScore;

      if (lesson.durationMinutes <= idealDuration + 5) {
        reasons.push('Perfect duration for your age group');
      }

      // Format preference scoring
      const formatScore = this.getFormatScore(lesson.format, request.ageGroup || '10-15');
      score += formatScore;

      if (formatScore > 15) {
        reasons.push(`${lesson.format} format matches your learning style`);
      }

      // Difficulty appropriateness
      const difficultyScore = this.getDifficultyScore(lesson.difficulty, request.difficulty);
      score += difficultyScore;

      // Learning objectives quality
      const objectivesScore = Math.min(lesson.learningObjectives.length * 2, 10);
      score += objectivesScore;

      // Determine priority
      let priority: 'high' | 'medium' | 'low' = 'medium';
      if (score >= 80) priority = 'high';
      else if (score < 50) priority = 'low';

      return {
        lessonId: lesson.lessonId,
        score,
        reasons,
        priority,
      };
    });
  }

  private getIdealDurationForAge(ageGroup: AgeGroup): number {
    const durationMap = {
      '5-10': 15,
      '10-15': 20,
      '15-18': 25,
    };
    return durationMap[ageGroup];
  }

  private getFormatScore(format: LessonFormat, ageGroup: AgeGroup): number {
    const preferences = {
      '5-10': { game: 20, interactive: 18, video: 15, text: 5 },
      '10-15': { interactive: 20, game: 18, video: 15, text: 10 },
      '15-18': { interactive: 18, video: 17, text: 15, game: 12 },
    };
    
    return preferences[ageGroup][format] || 10;
  }

  private getDifficultyScore(lessonDifficulty: Difficulty, requestedDifficulty?: Difficulty): number {
    if (!requestedDifficulty) return 15; // Neutral score

    const difficultyOrder = ['easy', 'medium', 'hard'];
    const lessonIndex = difficultyOrder.indexOf(lessonDifficulty);
    const requestedIndex = difficultyOrder.indexOf(requestedDifficulty);
    
    const difference = Math.abs(lessonIndex - requestedIndex);
    return Math.max(0, 20 - (difference * 10));
  }

  private getDifficultyForCategory(category: Category): Difficulty {
    const difficultyMap = {
      'Builder': 'easy' as Difficulty,
      'Explorer': 'medium' as Difficulty,
      'Innovator': 'hard' as Difficulty,
    };
    return difficultyMap[category];
  }

  private selectBestLessonForSequence(
    candidates: Lesson[],
    targetSkills: string[],
    currentSequence: Lesson[]
  ): Lesson | undefined {
    if (candidates.length === 0) return undefined;

    // Score candidates based on skill coverage and sequence flow
    const scored = candidates.map(lesson => {
      let score = 0;
      
      // Skill coverage
      const skillCoverage = lesson.skillTags.filter(tag => targetSkills.includes(tag)).length;
      score += skillCoverage * 10;
      
      // Avoid skill repetition in sequence
      const alreadyCoveredSkills = currentSequence.flatMap(l => l.skillTags);
      const newSkills = lesson.skillTags.filter(tag => !alreadyCoveredSkills.includes(tag));
      score += newSkills.length * 5;
      
      return { lesson, score };
    });

    // Return lesson with highest score
    const best = scored.reduce((best, current) => 
      current.score > best.score ? current : best
    );
    
    return best.lesson;
  }

  private getNextDifficulty(current: Difficulty): Difficulty {
    const progression = { easy: 'medium', medium: 'hard', hard: 'hard' } as const;
    return progression[current];
  }

  private findLessonById(lessonId: string): Lesson | undefined {
    return this.lessonDatabase.find(lesson => lesson.lessonId === lessonId);
  }

  /**
   * Initialize lesson database with sample lessons
   */
  private initializeLessonDatabase(): void {
    this.lessonDatabase = [
      // Math/Numerical Reasoning Lessons
      {
        id: 'L-MATH-001',
        lessonId: 'L-MATH-001',
        title: 'Quick Math Sprints',
        description: 'Improve speed with basic arithmetic operations',
        skillTags: ['numerical-reasoning', 'time-management'],
        ageGroup: '10-15',
        durationMinutes: 12,
        difficulty: 'easy',
        format: 'interactive',
        learningObjectives: ['Master basic arithmetic', 'Improve calculation speed'],
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'L-MATH-002',
        lessonId: 'L-MATH-002',
        title: 'Word Problem Detective',
        description: 'Solve real-world math problems step by step',
        skillTags: ['numerical-reasoning', 'problem-solving', 'logical-thinking'],
        ageGroup: '10-15',
        durationMinutes: 18,
        difficulty: 'medium',
        format: 'interactive',
        learningObjectives: ['Understand word problems', 'Apply math to real situations'],
        isActive: true,
        createdAt: new Date().toISOString(),
      },

      // Pattern Recognition Lessons
      {
        id: 'L-PATTERN-001',
        lessonId: 'L-PATTERN-001',
        title: 'Pattern Master',
        description: 'Recognize and complete visual and numerical patterns',
        skillTags: ['pattern-recognition', 'logical-thinking'],
        ageGroup: '5-10',
        durationMinutes: 15,
        difficulty: 'easy',
        format: 'game',
        learningObjectives: ['Identify simple patterns', 'Predict next elements'],
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'L-PATTERN-002',
        lessonId: 'L-PATTERN-002',
        title: 'Advanced Pattern Puzzles',
        description: 'Tackle complex pattern sequences and relationships',
        skillTags: ['pattern-recognition', 'logical-thinking', 'problem-solving'],
        ageGroup: '15-18',
        durationMinutes: 25,
        difficulty: 'hard',
        format: 'interactive',
        learningObjectives: ['Master complex patterns', 'Analyze pattern relationships'],
        isActive: true,
        createdAt: new Date().toISOString(),
      },

      // Focus & Attention Lessons
      {
        id: 'L-FOCUS-001',
        lessonId: 'L-FOCUS-001',
        title: 'Detail Detective',
        description: 'Improve focus and attention to detail skills',
        skillTags: ['attention-to-detail', 'memory-recall'],
        ageGroup: '10-15',
        durationMinutes: 20,
        difficulty: 'medium',
        format: 'interactive',
        learningObjectives: ['Enhance focus skills', 'Notice important details'],
        isActive: true,
        createdAt: new Date().toISOString(),
      },

      // Time Management Lessons
      {
        id: 'L-TIME-001',
        lessonId: 'L-TIME-001',
        title: 'Quick Time Tactics',
        description: 'Learn effective time management strategies',
        skillTags: ['time-management', 'attention-to-detail'],
        ageGroup: '10-15',
        durationMinutes: 15,
        difficulty: 'easy',
        format: 'video',
        learningObjectives: ['Manage time effectively', 'Prioritize tasks'],
        isActive: true,
        createdAt: new Date().toISOString(),
      },

      // Logic & Problem Solving
      {
        id: 'L-LOGIC-001',
        lessonId: 'L-LOGIC-001',
        title: 'Logic Puzzles',
        description: 'Develop logical reasoning through engaging puzzles',
        skillTags: ['logical-thinking', 'problem-solving'],
        ageGroup: '15-18',
        durationMinutes: 30,
        difficulty: 'hard',
        format: 'interactive',
        learningObjectives: ['Master logical reasoning', 'Solve complex puzzles'],
        isActive: true,
        createdAt: new Date().toISOString(),
      },

      // Creative & Innovative Thinking
      {
        id: 'L-CREATIVE-001',
        lessonId: 'L-CREATIVE-001',
        title: 'Creative Thinking Workshop',
        description: 'Unlock your creative potential and innovative ideas',
        skillTags: ['creative-thinking', 'problem-solving'],
        ageGroup: '15-18',
        durationMinutes: 35,
        difficulty: 'medium',
        format: 'interactive',
        learningObjectives: ['Think creatively', 'Generate innovative solutions'],
        isActive: true,
        createdAt: new Date().toISOString(),
      },

      // Social Skills
      {
        id: 'L-SOCIAL-001',
        lessonId: 'L-SOCIAL-001',
        title: 'Teamwork Champions',
        description: 'Learn effective teamwork and collaboration skills',
        skillTags: ['teamwork', 'empathy', 'leadership'],
        ageGroup: '10-15',
        durationMinutes: 22,
        difficulty: 'medium',
        format: 'video',
        learningObjectives: ['Work effectively in teams', 'Show empathy and understanding'],
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];

    logger.info('Lesson database initialized', { 
      totalLessons: this.lessonDatabase.length,
      ageGroups: [...new Set(this.lessonDatabase.map(l => l.ageGroup))],
      skills: [...new Set(this.lessonDatabase.flatMap(l => l.skillTags))],
    });
  }
}

export const lessonRecommendationService = new LessonRecommendationService();