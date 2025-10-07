export interface QuizOption {
  id: string;
  text: string;
  image?: string;
}

export interface Question {
  id: string;
  ageGroup: '5-10' | '10-15' | '15-18';
  category: string;
  text: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
  media?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface UserProfile {
  username: string;
  age: number;
  ageGroup: '5-10' | '10-15' | '15-18';
  gender?: string;
  parentEmail?: string;
  avatarId: string;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  category: 'Builder' | 'Explorer' | 'Innovator';
  strengths: string[];
  opportunities: string[];
  percentile?: number;
}
