# Vietnam Quiz Backend API Documentation

## Overview

The Vietnam Quiz Backend is an AI-powered educational assessment system that provides personalized learning experiences for children aged 5-18. It features adaptive questioning, intelligent scoring, personalized reporting, and lesson recommendations.

## Base URL
```
http://localhost:3001
```

## Authentication

All API endpoints (except health checks and auth) require authentication via JWT Bearer token:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Health Check

#### GET /health
Get basic health status of the API.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z",
  "uptime": 3600,
  "environment": "development",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "redis": "connected",
    "openai": "available"
  }
}
```

#### GET /health/detailed
Get detailed health information including performance metrics.

### Authentication

#### POST /auth/login
User authentication endpoint.

#### POST /auth/register
User registration endpoint.

#### POST /auth/refresh
Token refresh endpoint.

### Questions API

#### GET /api/questions
Get randomized questions for a quiz session.

**Query Parameters:**
- `ageGroup` (required): "5-10", "10-15", or "15-18"
- `count` (optional): Number of questions (default: 25, max: 25)
- `mode` (optional): "practice" or "diagnostic" (default: "diagnostic")
- `difficulty` (optional): "easy", "medium", or "hard"
- `topics` (optional): Comma-separated list of topics
- `seed` (optional): Random seed for consistent question sets

**Example Request:**
```
GET /api/questions?ageGroup=10-15&count=10&difficulty=medium
```

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "q-10-001-uuid",
        "questionId": "q-10-001",
        "ageGroup": "10-15",
        "topic": "Math",
        "text": "What is 12 × 8?",
        "options": [
          {"id": "a", "text": "84"},
          {"id": "b", "text": "96"},
          {"id": "c", "text": "104"},
          {"id": "d", "text": "88"}
        ],
        "explanation": "12 × 8 = 96. Excellent multiplication skills!",
        "cognitiveSkillTags": ["numerical-reasoning"],
        "difficulty": "medium"
      }
    ],
    "metadata": {
      "totalCount": 10,
      "ageGroup": "10-15",
      "mode": "diagnostic",
      "generatedAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

#### POST /api/questions/generate
Generate new questions using AI (Admin only).

**Request Body:**
```json
{
  "ageGroup": "10-15",
  "topic": "Mathematics",
  "cognitiveSkillTag": "numerical-reasoning",
  "difficulty": "medium",
  "count": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [...],
    "metadata": {
      "count": 3,
      "generatedAt": "2024-01-01T00:00:00Z",
      "topic": "Mathematics",
      "ageGroup": "10-15"
    }
  }
}
```

#### GET /api/questions/:id
Get a specific question by ID.

#### GET /api/questions/analytics/summary
Get question analytics summary (Admin only).

### Quiz Submission API

#### POST /api/quiz/submit
Submit completed quiz for scoring and analysis.

**Request Body:**
```json
{
  "userId": "user-uuid",
  "answers": [
    {
      "questionId": "q-10-001",
      "selectedOptionId": "b",
      "responseTimeMs": 15000
    }
  ],
  "startedAt": "2024-01-01T00:00:00Z",
  "finishedAt": "2024-01-01T00:15:00Z",
  "mode": "diagnostic"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "quizAttemptId": "attempt-uuid",
    "scores": {
      "rawScore": 17,
      "totalQuestions": 25,
      "percentageScore": 68.0,
      "compositeScore": 71.5,
      "speedScore": 75.2,
      "consistencyScore": 68.8,
      "category": "Explorer"
    },
    "reportId": "report-uuid"
  }
}
```

### Reports API

#### GET /api/reports/:reportId
Get comprehensive personalized report.

**Response:**
```json
{
  "success": true,
  "data": {
    "userSummary": {
      "name": "Aarav",
      "age": 11,
      "ageGroup": "10-15",
      "avatar": "avatar-fox"
    },
    "scores": {
      "rawScore": 17,
      "totalQuestions": 25,
      "percentageScore": 68.0,
      "compositeScore": 71.5,
      "category": "Explorer"
    },
    "strengths": [
      {
        "skillTag": "numerical-reasoning",
        "score": 85,
        "examples": ["Solved math problems accurately"],
        "description": "Strong mathematical thinking abilities"
      }
    ],
    "opportunities": [
      {
        "skillTag": "time-management",
        "score": 45,
        "description": "Could improve time management skills",
        "recommendedLessonIds": ["L-TIME-001"],
        "priority": "medium"
      }
    ],
    "questionBreakdown": [...],
    "gamificationRewards": {
      "xp": 340,
      "badges": ["First Quiz", "Explorer Level 1"],
      "achievements": ["Quiz Starter"],
      "streaks": {"daily": 1}
    },
    "lessonPlan": [...],
    "certificate": {
      "eligible": true,
      "type": "completion",
      "criteria": "Successfully completed assessment"
    },
    "lottieRefs": {
      "confetti": "https://assets.lottiefiles.com/confetti.json",
      "brainGauge": "https://assets.lottiefiles.com/gauge.json",
      "categoryAnimation": "https://assets.lottiefiles.com/explorer.json"
    },
    "generatedAt": "2024-01-01T00:15:30Z"
  }
}
```

### Lessons API

#### GET /api/lessons/recommend
Get personalized lesson recommendations.

**Query Parameters:**
- `userId` (required): User UUID
- `reportId` (optional): Report UUID for context
- `ageGroup` (optional): Override age group
- `skillTags` (optional): Comma-separated skill tags
- `difficulty` (optional): Preferred difficulty
- `maxResults` (optional): Maximum lessons to return (default: 8)

**Response:**
```json
{
  "success": true,
  "data": {
    "lessons": [
      {
        "id": "L-MATH-001",
        "lessonId": "L-MATH-001",
        "title": "Quick Math Sprints",
        "description": "Improve speed with basic arithmetic operations",
        "skillTags": ["numerical-reasoning", "time-management"],
        "ageGroup": "10-15",
        "durationMinutes": 12,
        "difficulty": "easy",
        "format": "interactive",
        "learningObjectives": ["Master basic arithmetic", "Improve calculation speed"]
      }
    ],
    "metadata": {
      "totalRecommendations": 8,
      "basedOnSkills": ["time-management", "attention-to-detail"],
      "generatedAt": "2024-01-01T00:16:00Z"
    }
  }
}
```

### Analytics API

#### POST /api/analytics/events
Track analytics events.

**Request Body:**
```json
{
  "eventType": "quiz_completed",
  "userId": "user-uuid",
  "sessionId": "session-uuid",
  "metadata": {
    "score": 68,
    "duration": 900,
    "category": "Explorer"
  }
}
```

#### GET /api/analytics/summary
Get analytics summary (Admin only).

## LLM Prompt Templates

### Question Generation Template

```
You are an educational psychologist writing age-appropriate multiple-choice questions for children.

TASK: Create 1 MCQ for age group {ageGroup} that measures {cognitiveSkillTag}.

REQUIREMENTS:
- Age group: {ageGroup}
- Topic: {topic}
- Cognitive skill: {cognitiveSkillTag}
- Difficulty: {difficulty}
- Language: {language}
- Cultural context: {culturalContext}

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
  "difficulty": "{difficulty}",
  "cognitiveSkillTags": ["{cognitiveSkillTag}"]
}
```

### Report Generation Template

```
You are a child-friendly educational coach creating personalized feedback.

INPUT DATA:
- Student: {name}, age {age} ({ageGroup})
- Score: {percentageScore}% ({rawScore}/{totalQuestions})
- Category: {category}
- Strengths: {strengths}
- Areas for improvement: {opportunities}

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
```

## Sample Report JSON

```json
{
  "userSummary": {"name":"Aarav","age":11,"ageGroup":"10-15","avatar":"avatar-fox"},
  "scores": {"rawScore":17,"totalQuestions":25,"percentageScore":68,"compositeScore":71,"category":"Explorer"},
  "strengths":["Numerical Reasoning","Pattern Recognition","Empathy"],
  "opportunities":["Time Management","Attention to Detail","Vocabulary"],
  "questionBreakdown":[
    {"id":"q-10-005","correct":true,"timeMs":12000,"explanation":"..."},
    {"id":"q-10-006","correct":false,"timeMs":23000,"explanation":"..."}
  ],
  "lessonPlan":[
    {"id":"L-101","title":"Quick Math Sprints","durationMin":12,"objective":"Improve speed with basic arithmetic","format":"interactive"}
  ],
  "gamificationRewards":{"xp":340,"badges":["First Quiz","5-Streak"]},
  "lottieRefs":{"confetti":"https://.../confetti.json","brainGauge":"https://.../gauge.json"}
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

Common HTTP status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Rate Limits

- General API: 100 requests per 15 minutes
- Question Generation: 10 requests per hour (admin only)
- Analytics Events: 1000 events per hour

## Security & Privacy

- All data is encrypted in transit (HTTPS)
- Personal data is anonymized in analytics
- COPPA compliance for users under 13
- Parent consent required for data collection
- Data retention: User data deleted after 2 years of inactivity

## A/B Testing

The system supports A/B testing for:
- Question difficulty adaptation
- Scoring thresholds
- Lesson recommendation algorithms
- Report content generation

Test flags can be set in user profiles or passed as query parameters.