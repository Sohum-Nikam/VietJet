import { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Question } from '@/types/quiz';
import confetti from 'canvas-confetti';

interface QuestionCardProps {
  question: Question;
  onAnswer: (isCorrect: boolean) => void;
  questionNumber: number;
  totalQuestions: number;
}

export const QuestionCard = ({ 
  question, 
  onAnswer, 
  questionNumber, 
  totalQuestions 
}: QuestionCardProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(question.text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleOptionSelect = (optionId: string) => {
    if (showFeedback) return;
    
    setSelectedOption(optionId);
    setShowFeedback(true);
    
    const isCorrect = optionId === question.correctOptionId;
    
    if (isCorrect) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7'],
      });
    }
    
    setTimeout(() => {
      onAnswer(isCorrect);
      setSelectedOption(null);
      setShowFeedback(false);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Question {questionNumber} of {totalQuestions}</span>
        <span className="font-medium">{question.category}</span>
      </div>

      {/* Question text */}
      <div className="bg-card rounded-2xl p-6 shadow-game">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-bold">{question.text}</h2>
          <Button
            variant="outline"
            size="icon"
            onClick={handleSpeak}
            className="shrink-0 rounded-full hover-scale"
            title="Read question aloud"
          >
            <Volume2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Options */}
      <div className="grid gap-3">
        {question.options.map((option, index) => {
          const isSelected = selectedOption === option.id;
          const isCorrect = option.id === question.correctOptionId;
          const showCorrect = showFeedback && isCorrect;
          const showIncorrect = showFeedback && isSelected && !isCorrect;

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleOptionSelect(option.id)}
              disabled={showFeedback}
              className={`
                quiz-option text-left flex items-center gap-4 p-6
                ${isSelected && !showFeedback ? 'selected' : ''}
                ${showCorrect ? 'correct' : ''}
                ${showIncorrect ? 'incorrect' : ''}
              `}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                font-bold text-lg shrink-0
                ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}
              `}>
                {String.fromCharCode(65 + index)}
              </div>
              <span className="text-lg font-medium flex-1">{option.text}</span>
              {showCorrect && (
                <CheckCircle className="h-8 w-8 text-success shrink-0" />
              )}
              {showIncorrect && (
                <XCircle className="h-8 w-8 text-error shrink-0" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Explanation feedback */}
      {showFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`
            p-4 rounded-xl ${
              selectedOption === question.correctOptionId
                ? 'bg-success/10 border-2 border-success'
                : 'bg-error/10 border-2 border-error'
            }
          `}
        >
          <p className="text-sm font-medium">{question.explanation}</p>
        </motion.div>
      )}
    </motion.div>
  );
};
