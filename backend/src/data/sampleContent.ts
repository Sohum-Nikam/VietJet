import { Subject, Module, Lesson, QuizMeta, Question } from '../models/Content';
import { logger } from '../utils/logger';

/**
 * Sample data for content engine testing and demonstration
 * This data follows the memory knowledge about subject theme colors and adaptive content
 */

export const SAMPLE_SUBJECTS = [
  {
    id: 'MATH',
    name: 'Maths',
    themeColor: '#6B46C1', // Purple theme as per memory
    iconRef: '🧮',
    lottieRef: 'https://assets2.lottiefiles.com/packages/lf20_math_numbers.json',
    description: 'Numbers, patterns, and problem solving!',
    availableGrades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  },
  {
    id: 'SCI',
    name: 'Science', 
    themeColor: '#0BC5EA', // Teal theme as per memory
    iconRef: '🧪',
    lottieRef: 'https://assets2.lottiefiles.com/packages/lf20_science_lab.json',
    description: 'Discover how the world works!',
    availableGrades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  },
  {
    id: 'GEO',
    name: 'Geography',
    themeColor: '#8B5E3C', // Brown theme as per memory  
    iconRef: '🌍',
    lottieRef: 'https://assets2.lottiefiles.com/packages/lf20_earth_globe.json',
    description: 'Explore our amazing planet!',
    availableGrades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  },
  {
    id: 'EVS',
    name: 'EVS',
    themeColor: '#22C55E', // Green theme as per memory
    iconRef: '🌱',
    lottieRef: 'https://assets2.lottiefiles.com/packages/lf20_nature_plant.json', 
    description: 'Care for our environment!',
    availableGrades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  }
];

export const SAMPLE_MODULES = [
  {
    id: 'MATH-G4-ALG',
    subjectId: 'MATH',
    grade: 4,
    title: 'Algebra Basics',
    objectives: [
      'Understand what variables are',
      'Solve simple equations',
      'Apply algebra to word problems'
    ],
    difficulty: 'medium' as const,
    durationMin: 45,
    xpReward: 120,
    thumbnailUrl: 'https://cdn.example.com/thumbnails/algebra.jpg',
    lessonIds: ['MATH-G4-ALG-L1', 'MATH-G4-ALG-L2', 'MATH-G4-ALG-L3'],
    skillTags: ['algebra', 'variables', 'equations'],
    isActive: true,
    completionOrder: 1,
    prerequisites: []
  },
  {
    id: 'MATH-G4-GEO',  
    subjectId: 'MATH',
    grade: 4,
    title: 'Geometry Fundamentals',
    objectives: [
      'Identify 2D and 3D shapes',
      'Measure angles and lengths', 
      'Calculate area and perimeter'
    ],
    difficulty: 'easy' as const,
    durationMin: 35,
    xpReward: 100,
    thumbnailUrl: 'https://cdn.example.com/thumbnails/geometry.jpg',
    lessonIds: ['MATH-G4-GEO-L1', 'MATH-G4-GEO-L2'],
    skillTags: ['geometry', 'shapes', 'measurement'],
    isActive: true,
    completionOrder: 2,
    prerequisites: []
  }
];

export const SAMPLE_LESSONS = [
  {
    id: 'MATH-G4-ALG-L1',
    moduleId: 'MATH-G4-ALG',
    title: 'What is a Variable?',
    description: 'Learn the basic concept of variables in mathematics',
    videoUrl: 'https://cdn.example.com/videos/math/g4/alg/l1.mp4',
    durationSec: 420,
    transcriptBase: `A variable is a symbol used to represent numbers in mathematics. Think of it like a box that can hold different values. For example, the letter 'x' is commonly used as a variable. If x equals 3, then when we see x + 2, we can substitute 3 for x to get 3 + 2 = 5. Variables help us write general formulas and solve problems. They're like placeholders that make math more flexible and powerful. We use letters like x, y, and z, but any letter can be a variable.`,
    timestamps: [
      { startSec: 0, text: 'Welcome to variables!', keyPoint: true },
      { startSec: 15, text: 'What is a variable?', keyPoint: true },
      { startSec: 45, text: 'Variables as boxes', keyPoint: false },
      { startSec: 120, text: 'Substitution example', keyPoint: true },
      { startSec: 180, text: 'Common variable letters', keyPoint: false },
      { startSec: 240, text: 'Why variables are useful', keyPoint: true }
    ],
    resourceLinks: [
      {
        title: 'Interactive Variables Game',
        url: 'https://example.com/variables-game',
        type: 'interactive' as const
      },
      {
        title: 'Variables Worksheet PDF',
        url: 'https://example.com/variables.pdf', 
        type: 'pdf' as const
      }
    ],
    quizMetaId: 'QM-MATH-G4-ALG-L1',
    skillTags: ['algebra', 'variables', 'substitution'],
    isActive: true,
    completionOrder: 1
  }
];

export const SAMPLE_QUIZ_METAS = [
  {
    id: 'QM-MATH-G4-ALG-L1',
    lessonId: 'MATH-G4-ALG-L1', 
    skillTags: ['algebra', 'variables', 'substitution'],
    difficultyDistribution: {
      easy: 12,
      medium: 8, 
      hard: 2
    },
    questionCountByCategory: {
      builder: 22, // More questions for detailed practice
      explorer: 15, // Balanced approach 
      innovator: 12 // Fewer, more challenging questions
    },
    hintPolicy: {
      builder: true,  // Hints allowed for builders
      explorer: true, // Hints allowed for explorers
      innovator: false // No hints for innovators (challenge mode)
    },
    timeLimitMinutes: {
      builder: undefined, // No time pressure
      explorer: 20,
      innovator: 15
    },
    passingScore: {
      builder: 60,
      explorer: 70, 
      innovator: 75
    },
    adaptiveBehavior: {
      easyFallback: true,
      challengeBonus: true,
      retryEnabled: true
    },
    isActive: true
  }
];

export const SAMPLE_QUESTIONS = [
  // Easy questions for builders
  {
    id: 'Q-MATH-ALG-001',
    lessonId: 'MATH-G4-ALG-L1',
    text: 'What letter is commonly used as a variable?',
    type: 'mcq' as const,
    options: [
      { id: 'a', text: 'x' },
      { id: 'b', text: '5' },
      { id: 'c', text: '+' }, 
      { id: 'd', text: '=' }
    ],
    correctAnswer: 'a',
    explanation: 'The letter x is the most commonly used variable in mathematics.',
    difficulty: 'easy' as const,
    skillTags: ['variables', 'notation'],
    distractorRationale: 'Numbers and symbols are not variables - variables are letters that represent numbers.',
    categoryAdaptations: {
      builder: {
        simplifiedText: 'Which one is a variable?',
        hint: 'Variables are letters, not numbers or symbols.'
      },
      explorer: {
        hint: 'Think about what represents an unknown number.'
      },
      innovator: {
        advancedContext: 'Variables can be any letter, but x is conventional.'
      }
    },
    isGenerated: false,
    qualityScore: 85,
    usageStats: {
      timesUsed: 150,
      correctAnswers: 128,
      averageTimeSeconds: 12
    },
    isActive: true,
    createdBy: 'content-team'
  },
  {
    id: 'Q-MATH-ALG-002', 
    lessonId: 'MATH-G4-ALG-L1',
    text: 'If x = 4, what is x + 3?',
    type: 'mcq' as const,
    options: [
      { id: 'a', text: '3' },
      { id: 'b', text: '4' },
      { id: 'c', text: '7' },
      { id: 'd', text: '12' }
    ],
    correctAnswer: 'c',
    explanation: 'When x = 4, we substitute: x + 3 becomes 4 + 3 = 7.',
    difficulty: 'easy' as const,
    skillTags: ['substitution', 'arithmetic'],
    distractorRationale: 'Common mistakes include forgetting to substitute or arithmetic errors.',
    categoryAdaptations: {
      builder: {
        simplifiedText: 'x = 4. Find x + 3.',
        hint: 'Replace x with 4, then add 3.'
      },
      explorer: {
        hint: 'Substitute the value of x into the expression.'
      }
    },
    isGenerated: false,
    qualityScore: 92,
    usageStats: {
      timesUsed: 200,
      correctAnswers: 165,
      averageTimeSeconds: 18
    },
    isActive: true,
    createdBy: 'content-team'
  },
  // Medium difficulty question
  {
    id: 'Q-MATH-ALG-003',
    lessonId: 'MATH-G4-ALG-L1', 
    text: 'If y = 6 and z = 2, what is y - z + 1?',
    type: 'mcq' as const,
    options: [
      { id: 'a', text: '3' },
      { id: 'b', text: '5' },
      { id: 'c', text: '7' },
      { id: 'd', text: '9' }
    ],
    correctAnswer: 'b',
    explanation: 'Substitute y = 6 and z = 2: (6 - 2) + 1 = 4 + 1 = 5.',
    difficulty: 'medium' as const,
    skillTags: ['substitution', 'order-of-operations'],
    distractorRationale: 'Students might forget order of operations or make substitution errors.',
    categoryAdaptations: {
      builder: {
        hint: 'Replace y with 6 and z with 2, then calculate step by step.'
      },
      innovator: {
        advancedContext: 'This tests multiple variable substitution and order of operations.'
      }
    },
    isGenerated: false,
    qualityScore: 88,
    usageStats: {
      timesUsed: 180,
      correctAnswers: 135,
      averageTimeSeconds: 25
    },
    isActive: true,
    createdBy: 'content-team'
  }
];

/**
 * Seed the database with sample content
 */
export async function seedSampleData(): Promise<void> {
  try {
    logger.info('Starting sample data seeding...');

    // Clear existing data (development only)
    if (process.env.NODE_ENV === 'development') {
      await Promise.all([
        Subject.deleteMany({}),
        Module.deleteMany({}),
        Lesson.deleteMany({}),
        QuizMeta.deleteMany({}),
        Question.deleteMany({})
      ]);
    }

    // Insert sample data
    await Subject.insertMany(SAMPLE_SUBJECTS);
    logger.info(`Inserted ${SAMPLE_SUBJECTS.length} subjects`);

    await Module.insertMany(SAMPLE_MODULES);
    logger.info(`Inserted ${SAMPLE_MODULES.length} modules`);

    await Lesson.insertMany(SAMPLE_LESSONS);
    logger.info(`Inserted ${SAMPLE_LESSONS.length} lessons`);

    await QuizMeta.insertMany(SAMPLE_QUIZ_METAS);
    logger.info(`Inserted ${SAMPLE_QUIZ_METAS.length} quiz metas`);

    await Question.insertMany(SAMPLE_QUESTIONS);
    logger.info(`Inserted ${SAMPLE_QUESTIONS.length} questions`);

    logger.info('Sample data seeding completed successfully');

  } catch (error) {
    logger.error('Failed to seed sample data', { error });
    throw error;
  }
}

/**
 * Get sample lesson with transcript for testing
 */
export function getSampleLessonWithTranscript() {
  return {
    lesson: SAMPLE_LESSONS[0],
    quizMeta: SAMPLE_QUIZ_METAS[0],
    sampleQuestions: SAMPLE_QUESTIONS,
    adaptiveTranscriptExample: {
      builder: {
        transcript: `[00:00] Hello everyone! Today we're going to learn about something super cool called variables! [00:15] A variable is like a special treasure box that can hold different numbers. Imagine you have a box labeled 'x' - you can put the number 3 inside it, or 5, or any number you want! [00:45] Let's try an example together. If our box 'x' has the number 3 inside, and we want to find x + 2, we just take out the 3 and add 2. So 3 + 2 = 5! [01:30] Try this yourself: If x = 4, what is x + 1? Take your time and think about it. The answer is 5 because 4 + 1 = 5! [02:00] Variables are everywhere in math, and they help us solve all kinds of fun problems!`,
        highlights: ['variables are like treasure boxes', 'x + 2 when x = 3 equals 5'],
        inlineActivities: [
          { timeSec: 90, activity: 'If x = 4, what is x + 1?', answer: '5' },
          { timeSec: 150, activity: 'If y = 6, what is y + 3?', answer: '9' }
        ],
        categoryFeatures: {
          keyPoints: [
            'Variables are like boxes that hold numbers',
            'Replace the variable with its value to solve',
            'Any letter can be a variable'
          ],
          practiceQuestions: [
            { question: 'If a = 7, what is a + 2?', answer: '9' },
            { question: 'If b = 5, what is b + 4?', answer: '9' }
          ]
        }
      },
      explorer: {
        transcript: `[00:00] Welcome to our lesson on variables! [00:15] A variable is a symbol that represents a number. We use letters like x, y, and z as variables. [00:45] For example, if x = 3, then x + 2 = 5. We substitute the value 3 for x. [01:20] Variables help us write mathematical expressions and solve equations. They're placeholders for numbers we don't know yet. [02:00] Practice: If y = 8, what is y - 3? The answer is 5.`,
        highlights: ['variable = symbol for number', 'substitution: replace variable with value'],
        inlineActivities: [
          { timeSec: 120, activity: 'If y = 8, what is y - 3?', answer: '5' }
        ],
        categoryFeatures: {
          practiceQuestions: [
            { question: 'If m = 10, what is m ÷ 2?', answer: '5' }
          ]
        }
      },
      innovator: {
        transcript: `[00:00] Variables: symbols representing unknown values. [00:15] • Definition: Letter symbols (x, y, z) representing numbers [00:30] • Substitution: Replace variable with its value [00:45] • Example: x = 3 → x + 2 = 5 [01:00] • Applications: Equations, formulas, problem-solving [01:15] • Advanced: Functions f(x), multiple variables [01:30] Challenge: If 2x + 3 = 11, find x.`,
        highlights: ['substitution principle', 'algebraic manipulation'],
        inlineActivities: [],
        categoryFeatures: {
          challenges: [
            'If 2x + 3 = 11, solve for x. (Answer: x = 4)'
          ]
        }
      }
    }
  };
}