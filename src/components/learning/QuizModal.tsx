'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, HelpCircle, CheckCircle, AlertCircle, Trophy } from 'lucide-react';
import { UserCategory } from '@/types/learning';
import { useQuiz } from '@/hooks/useLearningData';
import { QuizSubmissionResult } from '@/services/learningAPI';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  userCategory: UserCategory;
  subjectTheme: string;
  onQuizComplete?: (result: QuizSubmissionResult) => void;
}

const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  lessonId,
  userCategory,
  subjectTheme,
  onQuizComplete
}) => {
  const {
    quiz,
    currentQuestion,
    currentQuestionIndex,
    progress,
    answers,
    result,
    isSubmitting,
    isQuizComplete,
    canSubmit,
    error,
    generateQuiz,
    answerQuestion,
    submitQuiz,
    resetQuiz
  } = useQuiz(lessonId, userCategory);

  const [selectedOption, setSelectedOption] = useState<string>('');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questionTimer, setQuestionTimer] = useState(0);

  // Timer for current question
  useEffect(() => {
    if (!currentQuestion || showExplanation) return;

    const timer = setInterval(() => {
      setQuestionTimer(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, showExplanation]);

  // Reset states when question changes
  useEffect(() => {
    setSelectedOption('');
    setShowHint(false);
    setShowExplanation(false);
    setQuestionTimer(0);
  }, [currentQuestionIndex]);

  // Initialize quiz when modal opens
  useEffect(() => {
    if (isOpen && !quiz && !result) {
      generateQuiz();
    }
  }, [isOpen, quiz, result, generateQuiz]);

  // Handle quiz completion callback
  useEffect(() => {
    if (result && onQuizComplete) {
      onQuizComplete(result);
    }
  }, [result, onQuizComplete]);

  const handleOptionSelect = (optionId: string) => {
    if (showExplanation) return;
    setSelectedOption(optionId);
  };

  const handleAnswerSubmit = () => {
    if (!currentQuestion || !selectedOption || showExplanation) return;

    // Show explanation first
    setShowExplanation(true);

    // Submit answer after showing explanation
    setTimeout(() => {
      answerQuestion(currentQuestion.id, selectedOption, hintsUsed);
      setHintsUsed(0);
    }, 2000);
  };

  const handleUseHint = () => {
    if (!quiz?.metadata.allowedHints || showHint || showExplanation) return;
    setShowHint(true);
    setHintsUsed(prev => prev + 1);
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
  };

  const handleFinishQuiz = async () => {
    if (!canSubmit) return;
    await submitQuiz();
  };

  const handleCloseModal = () => {
    resetQuiz();
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getOptionStatus = (optionId: string) => {
    if (!showExplanation) return 'default';
    if (optionId === currentQuestion?.correctOptionId) return 'correct';
    if (optionId === selectedOption && optionId !== currentQuestion?.correctOptionId) return 'incorrect';
    return 'disabled';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleCloseModal}
      >
        <motion.div
          className="w-full max-w-4xl mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Quiz Header */}
          <div 
            className="px-6 py-4 text-white relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${subjectTheme} 0%, ${subjectTheme}CC 100%)` }}
          >
            <div className="flex items-center justify-between relative z-10">
              <div>
                <h2 className="text-2xl font-bold">
                  {result ? 'Quiz Complete!' : quiz ? `Question ${currentQuestionIndex + 1} of ${quiz.questions.length}` : 'Loading Quiz...'}
                </h2>
                {quiz && !result && (
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{formatTime(questionTimer)}</span>
                    </div>
                    {quiz.metadata.allowedHints && (
                      <div className="flex items-center gap-1">
                        <HelpCircle className="w-4 h-4" />
                        <span className="text-sm">Hints: {hintsUsed}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Progress Bar */}
            {quiz && !result && (
              <div className="mt-4 relative z-10">
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full bg-white/20" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/10" />
            </div>
          </div>

          {/* Quiz Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {!quiz && !result && !error && (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-gray-300 border-t-4 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: subjectTheme }} />
                <p className="text-gray-600">Generating your personalized quiz...</p>
              </div>
            )}

            {/* Quiz Results */}
            {result && (
              <motion.div
                className="text-center py-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="mb-6">
                  {result.results.passed ? (
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                      <Trophy className="w-10 h-10 text-green-600" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
                      <AlertCircle className="w-10 h-10 text-yellow-600" />
                    </div>
                  )}
                  
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    {Math.round(result.results.percentage)}%
                  </h3>
                  <p className="text-lg text-gray-600 mb-4">
                    {result.feedback.message}
                  </p>
                </div>

                {/* Results Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-2xl font-bold" style={{ color: subjectTheme }}>
                      {result.results.score}/{result.results.questionBreakdown.length}
                    </div>
                    <div className="text-sm text-gray-600">Correct</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-2xl font-bold" style={{ color: subjectTheme }}>
                      {result.rewards.xpEarned}
                    </div>
                    <div className="text-sm text-gray-600">XP Earned</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-2xl font-bold" style={{ color: subjectTheme }}>
                      {formatTime(result.results.timeSpentSeconds)}
                    </div>
                    <div className="text-sm text-gray-600">Time</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-2xl font-bold" style={{ color: subjectTheme }}>
                      {result.results.hintsUsed}
                    </div>
                    <div className="text-sm text-gray-600">Hints Used</div>
                  </div>
                </div>

                {/* Improvement Tips */}
                {result.feedback.improvementTips.length > 0 && (
                  <div className="mb-6 text-left">
                    <h4 className="font-semibold mb-2">💡 Tips for improvement:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {result.feedback.improvementTips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: subjectTheme }} />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center">
                  {result.nextSteps.retryAllowed && (
                    <button
                      onClick={() => {
                        resetQuiz();
                        generateQuiz();
                      }}
                      className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                    >
                      Retry Quiz
                    </button>
                  )}
                  <button
                    onClick={handleCloseModal}
                    className="px-6 py-3 rounded-xl text-white font-medium transition-colors"
                    style={{ backgroundColor: subjectTheme }}
                  >
                    Continue Learning
                  </button>
                </div>
              </motion.div>
            )}

            {/* Current Question */}
            {currentQuestion && !result && (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Question Text */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {currentQuestion.text}
                  </h3>
                  
                  {/* Hint */}
                  {showHint && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl"
                    >
                      <div className="flex items-start gap-2">
                        <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">Hint:</p>
                          <p className="text-sm text-blue-700">
                            {userCategory === 'Builder' ? 'Take your time and think step by step. Look for key words in the question.' :
                             userCategory === 'Explorer' ? 'Consider what you learned in the lesson. What concept does this question test?' :
                             'Apply the principles you learned. Think about the underlying concept.'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Answer Options */}
                <div className="grid gap-3">
                  {currentQuestion.options.map((option) => {
                    const status = getOptionStatus(option.id);
                    return (
                      <motion.button
                        key={option.id}
                        onClick={() => handleOptionSelect(option.id)}
                        disabled={showExplanation}
                        className={`p-4 rounded-xl border-2 text-left font-medium transition-all ${
                          selectedOption === option.id
                            ? status === 'correct'
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : status === 'incorrect'
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : `border-blue-500 bg-blue-50 text-blue-700`
                            : status === 'correct' && showExplanation
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                        }`}
                        whileHover={!showExplanation ? { scale: 1.02 } : {}}
                        whileTap={!showExplanation ? { scale: 0.98 } : {}}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                              selectedOption === option.id || (status === 'correct' && showExplanation)
                                ? 'border-current bg-current text-white'
                                : 'border-gray-300'
                            }`}
                          >
                            {selectedOption === option.id || (status === 'correct' && showExplanation) ? (
                              status === 'correct' || (selectedOption === option.id && status !== 'incorrect') ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <X className="w-4 h-4" />
                              )
                            ) : (
                              option.id.toUpperCase()
                            )}
                          </div>
                          <span>{option.text}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-gray-50 rounded-xl border-l-4"
                    style={{ borderLeftColor: subjectTheme }}
                  >
                    <h4 className="font-semibold mb-2">Explanation:</h4>
                    <p className="text-gray-700">{currentQuestion.explanation}</p>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4">
                  <div>
                    {quiz?.metadata.allowedHints && !showHint && !showExplanation && (
                      <button
                        onClick={handleUseHint}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                      >
                        <HelpCircle className="w-4 h-4" />
                        Use Hint
                      </button>
                    )}
                  </div>

                  <div className="flex gap-3">
                    {!showExplanation ? (
                      <button
                        onClick={handleAnswerSubmit}
                        disabled={!selectedOption}
                        className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                          selectedOption
                            ? 'text-white'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        style={{ 
                          backgroundColor: selectedOption ? subjectTheme : undefined 
                        }}
                      >
                        Submit Answer
                      </button>
                    ) : (
                      <>
                        {currentQuestionIndex < (quiz?.questions.length ?? 0) - 1 ? (
                          <button
                            onClick={handleNextQuestion}
                            className="px-6 py-3 rounded-xl text-white font-medium transition-colors"
                            style={{ backgroundColor: subjectTheme }}
                          >
                            Next Question
                          </button>
                        ) : (
                          <button
                            onClick={handleFinishQuiz}
                            disabled={isSubmitting}
                            className="px-6 py-3 rounded-xl text-white font-medium transition-colors flex items-center gap-2"
                            style={{ backgroundColor: subjectTheme }}
                          >
                            {isSubmitting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              'Finish Quiz'
                            )}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuizModal;