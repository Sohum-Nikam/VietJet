import { config } from '@/config';
import { logger } from '@/utils/logger';
import {
  Question,
  LLMQuestionPrompt,
  LLMReportPrompt,
  AgeGroup,
  Difficulty,
} from '@/types';

export interface LLMQuestionResponse {
  text: string;
  options: Array<{
    id: string;
    text: string;
  }>;
  correctOptionId: string;
  explanation: string;
  difficulty: Difficulty;
  cognitiveSkillTags: string[];
}

export interface LLMReportResponse {
  childMessage: string;
  parentMessage: string;
  recommendedLessons: Array<{
    title: string;
    objective: string;
    duration: number;
  }>;
}

export class LLMService {
  private apiKey: string;
  private model: string;
  private timeout: number;

  constructor() {
    this.apiKey = config.openai.apiKey;
    this.model = config.openai.model;
    this.timeout = config.openai.timeout;
  }

  // LLM Prompt Template for Question Generation
  private getQuestionGenerationPrompt(params: LLMQuestionPrompt): string {
    return `You are an educational psychologist writing age-appropriate multiple-choice questions for children.

TASK: Create 1 MCQ for age group ${params.ageGroup} that measures ${params.cognitiveSkillTag}.

REQUIREMENTS:
- Age group: ${params.ageGroup}
- Topic: ${params.topic}
- Cognitive skill: ${params.cognitiveSkillTag}
- Difficulty: ${params.difficulty}
- Language: ${params.language}
- Cultural context: ${params.culturalContext}

CONSTRAINTS:
- Use simple, age-appropriate vocabulary
- Question text: maximum 20 words
- 4 multiple choice options
- Exactly one correct answer
- No cultural bias or sensitive topics
- No ambiguous language
- Include plausible distractors for the age group

OUTPUT FORMAT (JSON):
{
  "text": "Question text here",
  "options": [
    {"id": "a", "text": "Option 1"},
    {"id": "b", "text": "Option 2"},
    {"id": "c", "text": "Option 3"},
    {"id": "d", "text": "Option 4"}
  ],
  "correctOptionId": "a",
  "explanation": "Clear explanation why the answer is correct",
  "difficulty": "${params.difficulty}",
  "cognitiveSkillTags": ["${params.cognitiveSkillTag}"]
}

Generate the question now:`;
  }

  // LLM Prompt Template for Report Generation
  private getReportGenerationPrompt(params: LLMReportPrompt): string {
    return `You are a child-friendly educational coach creating personalized feedback.

INPUT DATA:
- Student: ${params.userProfile.name}, age ${params.userProfile.age} (${params.userProfile.ageGroup})
- Score: ${params.scores.percentageScore}% (${params.scores.rawScore}/${params.scores.totalQuestions})
- Category: ${params.scores.category}
- Strengths: ${params.strengths.join(', ')}
- Areas for improvement: ${params.opportunities.join(', ')}

TASK: Generate encouraging, age-appropriate feedback

OUTPUT FORMAT (JSON):
{
  "childMessage": "25-40 word encouraging message directly to the child",
  "parentMessage": "Parent-facing paragraph describing the child's category and performance",
  "recommendedLessons": [
    {
      "title": "Lesson title",
      "objective": "One-line learning objective",
      "duration": 15
    }
  ]
}

GUIDELINES:
- Child message: enthusiastic, positive, growth-focused
- Parent message: informative, constructive, supportive
- 3 recommended lessons targeting improvement areas
- Use age-appropriate language and concepts

Generate the feedback now:`;
  }

  async generateQuestion(params: LLMQuestionPrompt): Promise<LLMQuestionResponse> {
    try {
      const prompt = this.getQuestionGenerationPrompt(params);
      
      // Mock OpenAI API response for development
      // In production, this would make actual API call
      const mockResponse: LLMQuestionResponse = {
        text: this.generateMockQuestion(params),
        options: [
          { id: 'a', text: 'Option A' },
          { id: 'b', text: 'Option B' },
          { id: 'c', text: 'Option C' },
          { id: 'd', text: 'Option D' },
        ],
        correctOptionId: 'a',
        explanation: `This tests ${params.cognitiveSkillTag} skills appropriate for age ${params.ageGroup}.`,
        difficulty: params.difficulty,
        cognitiveSkillTags: [params.cognitiveSkillTag],
      };

      logger.info('Generated question via LLM', { 
        ageGroup: params.ageGroup, 
        topic: params.topic,
        difficulty: params.difficulty,
      });

      return mockResponse;
    } catch (error) {
      logger.error('Failed to generate question', error);
      throw new Error('Question generation failed');
    }
  }

  async generateReportContent(params: LLMReportPrompt): Promise<LLMReportResponse> {
    try {
      const prompt = this.getReportGenerationPrompt(params);
      
      // Mock response for development
      const mockResponse: LLMReportResponse = {
        childMessage: this.generateChildMessage(params),
        parentMessage: this.generateParentMessage(params),
        recommendedLessons: this.generateRecommendedLessons(params),
      };

      logger.info('Generated report content via LLM', { 
        userId: params.userProfile.name,
        category: params.scores.category,
        score: params.scores.percentageScore,
      });

      return mockResponse;
    } catch (error) {
      logger.error('Failed to generate report content', error);
      throw new Error('Report generation failed');
    }
  }

  private generateMockQuestion(params: LLMQuestionPrompt): string {
    const questionTemplates = {
      'pattern-recognition': {
        '5-10': 'What comes next in this pattern: 🔴 🔵 🔴 🔵 ___?',
        '10-15': 'Complete the sequence: 2, 4, 8, 16, ___?',
        '15-18': 'Find the pattern: 1, 4, 9, 16, ___?',
      },
      'numerical-reasoning': {
        '5-10': 'If you have 3 apples and get 2 more, how many do you have?',
        '10-15': 'What is 25% of 80?',
        '15-18': 'Solve for x: 2x + 5 = 17',
      },
      'logical-thinking': {
        '5-10': 'Which animal can fly?',
        '10-15': 'If all birds can fly and penguins are birds, what can we conclude?',
        '15-18': 'If A implies B and B implies C, what can we conclude about A and C?',
      },
    };

    const categoryQuestions = questionTemplates[params.cognitiveSkillTag as keyof typeof questionTemplates];
    if (categoryQuestions) {
      return categoryQuestions[params.ageGroup] || `${params.topic} question for ${params.ageGroup}`;
    }

    return `${params.topic} question testing ${params.cognitiveSkillTag} for age ${params.ageGroup}`;
  }

  private generateChildMessage(params: LLMReportPrompt): string {
    const messages = {
      'Builder': `Great work, ${params.userProfile.name}! You're building strong foundations. Keep practicing and you'll get even better!`,
      'Explorer': `Awesome job exploring new ideas, ${params.userProfile.name}! You're curious and learning lots. Keep discovering!`,
      'Innovator': `Incredible thinking, ${params.userProfile.name}! You're innovative and creative. Keep pushing boundaries and creating amazing solutions!`,
    };

    return messages[params.scores.category] || `Well done, ${params.userProfile.name}! Keep learning and growing!`;
  }

  private generateParentMessage(params: LLMReportPrompt): string {
    const categoryDescriptions = {
      'Builder': 'shows strong foundational skills and benefits from structured learning approaches',
      'Explorer': 'demonstrates curiosity and adaptability, thriving with diverse learning experiences',
      'Innovator': 'exhibits advanced problem-solving skills and creative thinking abilities',
    };

    const description = categoryDescriptions[params.scores.category];
    return `${params.userProfile.name} scored ${params.scores.percentageScore}% and is categorized as an ${params.scores.category}. This means they ${description}. Focus on ${params.opportunities.join(', ')} while building on their strengths in ${params.strengths.join(', ')}.`;
  }

  private generateRecommendedLessons(params: LLMReportPrompt): Array<{title: string; objective: string; duration: number}> {
    const lessonTemplates = {
      'time-management': { title: 'Quick Time Tactics', objective: 'Learn to manage time effectively', duration: 15 },
      'attention-to-detail': { title: 'Detail Detective', objective: 'Improve focus and attention skills', duration: 20 },
      'numerical-reasoning': { title: 'Number Ninja', objective: 'Strengthen math problem-solving', duration: 18 },
      'pattern-recognition': { title: 'Pattern Master', objective: 'Enhance pattern recognition abilities', duration: 12 },
      'logical-thinking': { title: 'Logic Puzzles', objective: 'Develop logical reasoning skills', duration: 25 },
    };

    return params.opportunities.slice(0, 3).map(opportunity => {
      const template = lessonTemplates[opportunity as keyof typeof lessonTemplates];
      return template || {
        title: `${opportunity} Workshop`,
        objective: `Improve ${opportunity} skills`,
        duration: 15,
      };
    });
  }
}

export const llmService = new LLMService();