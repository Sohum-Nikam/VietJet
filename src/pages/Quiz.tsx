import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { QuestionCard } from '@/components/QuestionCard';
import { ProgressGameboard } from '@/components/ProgressGameboard';
import { sampleQuestions, getQuestionsByAge } from '@/data/sampleQuestions';
import { UserProfile, Question } from '@/types/quiz';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Quiz = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);

  useEffect(() => {
    // Load profile
    const savedProfile = localStorage.getItem('userProfile');
    if (!savedProfile) {
      navigate('/profile');
      return;
    }

    const userProfile: UserProfile = JSON.parse(savedProfile);
    setProfile(userProfile);

    // Load questions based on age group
    const ageQuestions = getQuestionsByAge(userProfile.ageGroup);
    setQuestions(ageQuestions);
  }, [navigate]);

  const handleAnswer = (isCorrect: boolean) => {
    const newAnswers = [...answers, isCorrect];
    setAnswers(newAnswers);
    
    if (isCorrect) {
      setScore(score + 10);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz complete - calculate results and navigate
      const finalScore = isCorrect ? score + 10 : score;
      const totalQuestions = questions.length;
      const percentage = (newAnswers.filter(a => a).length / totalQuestions) * 100;
      
      let category: 'Builder' | 'Explorer' | 'Innovator';
      if (percentage >= 80) category = 'Innovator';
      else if (percentage >= 50) category = 'Explorer';
      else category = 'Builder';

      const result = {
        score: finalScore,
        totalQuestions,
        percentage,
        category,
        correctAnswers: newAnswers.filter(a => a).length,
      };

      localStorage.setItem('quizResult', JSON.stringify(result));
      navigate('/results');
    }
  };

  if (!profile || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/profile')}
            className="hover-lift"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Exit Quiz
          </Button>
          <div className="text-sm text-muted-foreground">
            Hello, <span className="font-bold text-foreground">{profile.username}</span>! 👋
          </div>
        </div>

        {/* Progress Gameboard */}
        <ProgressGameboard
          current={currentQuestion + 1}
          total={questions.length}
          score={score}
        />

        {/* Question */}
        <AnimatePresence mode="wait">
          <QuestionCard
            key={currentQuestion}
            question={questions[currentQuestion]}
            onAnswer={handleAnswer}
            questionNumber={currentQuestion + 1}
            totalQuestions={questions.length}
          />
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Quiz;
