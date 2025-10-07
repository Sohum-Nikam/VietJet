/**
 * API Documentation for Content Engine & Personalization Backend
 * 
 * This backend provides AI-powered adaptive learning content including:
 * - Grade and subject-specific modules and lessons
 * - Adaptive transcripts based on learner category
 * - Dynamic quiz generation with personalization
 * - Scoring and progress tracking
 */

## Authentication

All API endpoints require JWT authentication:

```
Authorization: Bearer <jwt_token>
```

For underage users, parental consent flag is required in the JWT payload.

## Base URL

```
https://api.learningsystem.com/api
```

## Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

## API Endpoints

### Learning Content APIs

#### GET /learning/grades
Returns available grade levels.

**Response:**
```json
{
  "success": true,
  "data": {
    "grades": [
      {
        "id": 0,
        "label": "K", 
        "description": "Kindergarten",
        "ageRange": "5-6"
      },
      {
        "id": 4,
        "label": "4th",
        "description": "Fourth Grade", 
        "ageRange": "9-10"
      }
    ]
  }
}
```

#### GET /learning/subjects
Returns all available subjects with theme metadata.

**Response:**
```json
{
  "success": true,
  "data": {
    "subjects": [
      {
        "id": "MATH",
        "name": "Maths",
        "themeColor": "#6B46C1",
        "iconRef": "🧮", 
        "lottieRef": "https://assets.lottie.com/math.json",
        "description": "Numbers, patterns, and problem solving!",
        "availableGrades": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
      }
    ]
  }
}
```

#### GET /learning/:grade/subjects
Returns subjects available for a specific grade with module summaries.

**Parameters:**
- `grade` (path): Grade level (0-12)

**Response:**
```json
{
  "success": true,
  "data": {
    "grade": 4,
    "subjects": [
      {
        "id": "MATH",
        "name": "Maths",
        "themeColor": "#6B46C1",
        "moduleCount": 7,
        "totalXP": 840,
        "totalDuration": 315
      }
    ]
  }
}
```

#### GET /learning/:grade/:subject/modules
Returns detailed modules and lesson metadata for grade and subject.

**Parameters:**
- `grade` (path): Grade level (0-12)
- `subject` (path): Subject name (Maths|Science|Geography|EVS)

**Response:**
```json
{
  "success": true,
  "data": {
    "grade": 4,
    "subject": "Maths", 
    "subjectTheme": "#6B46C1",
    "modules": [
      {
        "id": "MATH-G4-ALG",
        "title": "Algebra Basics",
        "objectives": [
          "Understand what variables are",
          "Solve simple equations"
        ],
        "difficulty": "medium",
        "durationMin": 45,
        "xpReward": 120,
        "thumbnailUrl": "https://cdn.example.com/algebra.jpg",
        "lessonCount": 5,
        "lessons": [
          {
            "id": "L1", 
            "title": "What is a Variable?",
            "description": "Learn the basics of variables",
            "durationSec": 420
          }
        ]
      }
    ]
  }
}
```

### Lesson APIs

#### GET /lesson/:lessonId?userCategory=builder
Returns lesson with adaptive transcript based on user category.

**Parameters:**
- `lessonId` (path): Unique lesson identifier
- `userCategory` (query): builder|explorer|innovator

**Response:**
```json
{
  "success": true,
  "data": {
    "lessonId": "L1",
    "moduleId": "MATH-G4-ALG", 
    "title": "What is a Variable?",
    "description": "Introduction to algebraic variables",
    "videoUrl": "https://cdn.example.com/videos/l1.mp4",
    "durationSec": 420,
    "transcript": {
      "text": "[00:00] Hello class! [00:10] A variable is like a special box that holds numbers...",
      "highlights": [
        "variable = symbol", 
        "x + 2 = 5 when x = 3"
      ],
      "inlineActivities": [
        {
          "timeSec": 60,
          "activity": "Try: if x = 2, what is x + 4?",
          "answer": "6"
        }
      ],
      "categoryFeatures": {
        "keyPoints": ["Variables represent numbers", "Substitution solves equations"],
        "practiceQuestions": [
          {
            "question": "If y = 5, what is y + 3?",
            "answer": "8"
          }
        ]
      }
    },
    "timestamps": [
      {"startSec": 0, "text": "Introduction", "keyPoint": true},
      {"startSec": 30, "text": "Definition of variables"}
    ],
    "resourceLinks": [
      {
        "title": "Interactive Variables Game", 
        "url": "https://example.com/game",
        "type": "interactive"
      }
    ],
    "quizMeta": {
      "questionCount": 22,
      "skillTags": ["algebra", "symbolic-reasoning"],
      "hintPolicy": "hintsAllowed",
      "timeLimit": null,
      "passingScore": 60
    }
  }
}
```

### Quiz APIs

#### POST /quiz/generate
Generates adaptive quiz for a lesson.

**Request Body:**
```json
{
  "lessonId": "L1",
  "userCategory": "builder",
  "numQuestions": 20,
  "seed": "optional-reproducible-seed"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "quizId": "QZ-20251006-abc123",
    "questions": [
      {
        "id": "q1",
        "text": "If x = 3, what is x + 2?",
        "options": [
          {"id": "a", "text": "4"},
          {"id": "b", "text": "5"}, 
          {"id": "c", "text": "6"},
          {"id": "d", "text": "7"}
        ],
        "correctOptionId": "b",
        "explanation": "When x = 3, we substitute: 3 + 2 = 5",
        "difficulty": "easy",
        "distractorRationale": "Common errors include forgetting substitution or arithmetic mistakes"
      }
    ],
    "metadata": {
      "lessonId": "L1",
      "userCategory": "builder",
      "questionCount": 20,
      "allowedHints": true,
      "timeLimit": null,
      "passingScore": 60,
      "difficultyDistribution": {
        "easy": 12,
        "medium": 6, 
        "hard": 2
      }
    }
  }
}
```

#### POST /quiz/submit
Submits quiz answers and returns detailed results.

**Request Body:**
```json
{
  "quizId": "QZ-20251006-abc123",
  "lessonId": "L1", 
  "userCategory": "builder",
  "answers": [
    {
      "questionId": "q1",
      "selectedOptionId": "b",
      "timeSpentSeconds": 15,
      "hintsUsed": 0
    }
  ],
  "timeSpentSeconds": 480,
  "hintsUsed": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "quizId": "QZ-20251006-abc123",
    "results": {
      "score": 18,
      "percentage": 90,
      "passed": true,
      "questionBreakdown": [
        {
          "questionId": "q1",
          "correct": true,
          "selectedAnswer": "b",
          "correctAnswer": "b", 
          "explanation": "Correct! 3 + 2 = 5",
          "timeSpent": 15,
          "difficulty": "easy"
        }
      ],
      "timeSpentSeconds": 480,
      "hintsUsed": 3
    },
    "rewards": {
      "xpEarned": 180,
      "badges": [
        {
          "id": "first-quiz",
          "title": "Quiz Starter", 
          "description": "Completed first quiz!",
          "iconUrl": "https://cdn.example.com/badge1.png"
        }
      ],
      "streakBonus": false
    },
    "feedback": {
      "message": "Excellent work! You really understand variables well.",
      "improvementTips": [
        "Practice more substitution problems",
        "Try solving equations with different variables", 
        "Review the video sections on complex examples"
      ],
      "recommendedLessons": [
        "Solving Simple Equations",
        "Variables in Word Problems"
      ]
    },
    "nextSteps": {
      "retryAllowed": false,
      "nextLesson": "L2-equations", 
      "practiceMode": false
    }
  }
}
```

### Recommendation APIs

#### GET /recommendations/:userId
Returns personalized learning recommendations.

**Parameters:**
- `userId` (path): User identifier
- `limit` (query): Max recommendations (default: 5)
- `subject` (query): Filter by subject (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "type": "next-lesson",
        "lessonId": "L2",
        "title": "Solving Simple Equations",
        "rationale": "Builds on variable concepts you've mastered",
        "confidence": 0.95,
        "estimatedDuration": 25
      },
      {
        "type": "review", 
        "lessonId": "L1",
        "title": "What is a Variable? (Review)",
        "rationale": "Reinforce foundational concepts",
        "confidence": 0.80
      }
    ],
    "learningPath": {
      "currentModule": "MATH-G4-ALG",
      "completionPercent": 20,
      "nextMilestone": "Complete Algebra Basics"
    }
  }
}
```

## Rate Limits

- 100 requests per minute per user
- 10 quiz generations per hour per user  
- 50 lesson requests per hour per user

## Content Caching

Generated content is cached with the following TTLs:
- Adaptive transcripts: 72 hours
- Generated quizzes: 24 hours
- Lesson recommendations: 1 hour

## Security & Privacy

- All endpoints require JWT authentication
- COPPA/GDPR compliant data handling
- Parental consent required for users under 13
- PII is encrypted at rest and in transit
- Content moderation on all LLM outputs

## Monitoring & Analytics

All API calls are logged with:
- User demographics (anonymized)
- Performance metrics
- Content effectiveness scores
- A/B test group assignments

## Content Safety Pipeline

Generated content goes through:
1. LLM output validation
2. Safety keyword filtering  
3. Educational accuracy checks
4. Age-appropriateness review
5. Cultural sensitivity screening