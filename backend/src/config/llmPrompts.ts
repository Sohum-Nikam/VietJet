// LLM Prompt Templates for Content Generation

export const TRANSCRIPT_ADAPTATION_PROMPT = `You are an educational content specialist. Adapt the following lesson transcript for the specified learner category.

INPUT:
- Original Transcript: "{transcriptBase}"
- Target Category: {targetCategory}
- Grade Level: {grade}
- Lesson Title: "{lessonTitle}"
- Max Words: {maxWords}

ADAPTATION RULES:
{adaptationRules}

CONSTRAINTS:
- Use age-appropriate vocabulary for Grade {grade}
- Include timestamp markers in format [MM:SS]
- No sensitive content or cultural bias
- Maintain educational accuracy
- Focus on key learning objectives

OUTPUT FORMAT (Valid JSON only):
{
  "transcript": "Adapted transcript with [00:10] timestamp markers throughout...",
  "highlights": ["key phrase 1", "key phrase 2", "key phrase 3"],
  "inlineActivities": [
    {
      "timeSec": 60,
      "activity": "Practice question or exercise",
      "answer": "Expected answer or solution"
    }
  ],
  "categoryFeatures": {
    // Category-specific additions based on learner type
  }
}

Generate the adapted transcript now:`;

export const QUESTION_GENERATION_PROMPT = `You are an educational question author. Generate high-quality multiple-choice questions for the specified parameters.

INPUT:
- Grade Level: {grade}
- Lesson Title: "{lessonTitle}"
- Skill Tags: {skillTags}
- Difficulty Level: {difficulty}
- Question Count: {count}
- Target Learner: {userCategory}

QUESTION REQUIREMENTS:
- Age-appropriate for Grade {grade}
- Unambiguous with single correct answer
- {categoryGuidance}
- Question text ≤ 25 words for readability
- Exactly 4 plausible options per question
- Include educational explanations

DIFFICULTY GUIDELINES:
- Easy: Basic recall and simple application
- Medium: Application and analysis of concepts
- Hard: Synthesis and evaluation of ideas

OUTPUT FORMAT (Valid JSON Array only):
[
  {
    "id": "q1",
    "text": "Clear, concise question text?",
    "options": [
      {"id": "a", "text": "Option A"},
      {"id": "b", "text": "Option B"},
      {"id": "c", "text": "Option C"},
      {"id": "d", "text": "Option D"}
    ],
    "correctOptionId": "b",
    "explanation": "Clear explanation of why this answer is correct and others are wrong",
    "difficulty": "{difficulty}",
    "distractorRationale": "Brief explanation of why wrong answers are plausible distractors"
  }
]

Generate {count} questions now:`;

export const QUIZ_FEEDBACK_PROMPT = `You are an encouraging educational mentor. Generate personalized feedback for a student's quiz performance.

INPUT:
- Quiz Score: {score}/{totalQuestions} ({percentage}%)
- Student Category: {userCategory}
- Lesson Title: "{lessonTitle}"
- Areas of Strength: {strengths}
- Areas for Improvement: {improvements}

TONE REQUIREMENTS:
- Encouraging and supportive
- Age-appropriate language
- Actionable and specific
- Growth-mindset focused

OUTPUT FORMAT (Valid JSON only):
{
  "feedback": "20-40 word encouraging message acknowledging effort and highlighting progress",
  "improvementTips": [
    "Specific, actionable tip 1",
    "Specific, actionable tip 2", 
    "Specific, actionable tip 3"
  ],
  "recommendedLessons": [
    "Related lesson or topic 1",
    "Related lesson or topic 2"
  ],
  "motivationalNote": "Brief encouraging note for continued learning"
}

Generate personalized feedback now:`;

export const LESSON_RECOMMENDATION_PROMPT = `You are an adaptive learning system. Recommend the next best lessons based on student performance and learning path.

INPUT:
- Student Category: {userCategory}
- Completed Lessons: {completedLessons}
- Current Grade: {grade}
- Subject: {subject}
- Recent Performance: {recentScores}
- Learning Objectives: {objectives}

RECOMMENDATION CRITERIA:
- Prerequisite completion
- Difficulty progression
- Skill gap analysis
- Interest maintenance
- Optimal challenge level

OUTPUT FORMAT (Valid JSON only):
{
  "primaryRecommendation": {
    "lessonId": "LESSON_ID",
    "title": "Lesson Title",
    "rationale": "Why this lesson is recommended next"
  },
  "alternativeOptions": [
    {
      "lessonId": "ALT_LESSON_ID",
      "title": "Alternative Lesson Title", 
      "rationale": "Alternative learning path rationale"
    }
  ],
  "reviewSuggestions": [
    "Topic or lesson to review for reinforcement"
  ]
}

Generate learning recommendations now:`;

// Validation patterns for LLM outputs
export const OUTPUT_VALIDATION = {
  transcript: {
    required: ['transcript', 'highlights', 'inlineActivities'],
    types: {
      transcript: 'string',
      highlights: 'array',
      inlineActivities: 'array'
    }
  },
  questions: {
    required: ['id', 'text', 'options', 'correctOptionId', 'explanation'],
    types: {
      id: 'string',
      text: 'string', 
      options: 'array',
      correctOptionId: 'string',
      explanation: 'string'
    }
  },
  feedback: {
    required: ['feedback', 'improvementTips', 'recommendedLessons'],
    types: {
      feedback: 'string',
      improvementTips: 'array',
      recommendedLessons: 'array'
    }
  }
};

// Content safety filters
export const SAFETY_FILTERS = {
  flaggedWords: [
    'inappropriate', 'harmful', 'dangerous', 'violent',
    'discriminatory', 'offensive', 'explicit'
  ],
  
  requiredElements: {
    transcript: ['educational', 'learning', 'understand'],
    question: ['?', 'answer', 'correct']
  },

  maxWordLimits: {
    builder: 450,
    explorer: 250, 
    innovator: 120
  }
};

// Category-specific adaptation rules
export const CATEGORY_ADAPTATIONS = {
  builder: {
    style: 'expand with simple language, step-by-step examples, 2 inline practice tasks with answers',
    readingLevel: 'CEFR A1-A2',
    features: ['keyPoints', 'practiceQuestions', 'visualCues'],
    questionStyle: 'simpler wordings, scaffolded distractors, clear single concept per question'
  },
  
  explorer: {
    style: 'balanced content, 1 practice task, moderate detail',
    readingLevel: 'CEFR B1', 
    features: ['practiceQuestions', 'summaries'],
    questionStyle: 'balanced complexity, moderate conceptual depth'
  },
  
  innovator: {
    style: 'concise bullet summary (5-8 bullets) plus 1 challenge',
    readingLevel: 'CEFR B2+',
    features: ['challenges', 'deepDive', 'connections'],
    questionStyle: 'multi-step conceptual problems, advanced reasoning required'
  }
};

export default {
  TRANSCRIPT_ADAPTATION_PROMPT,
  QUESTION_GENERATION_PROMPT,
  QUIZ_FEEDBACK_PROMPT,
  LESSON_RECOMMENDATION_PROMPT,
  OUTPUT_VALIDATION,
  SAFETY_FILTERS,
  CATEGORY_ADAPTATIONS
};