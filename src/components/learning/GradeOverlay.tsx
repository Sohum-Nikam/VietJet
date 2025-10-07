'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grade } from '@/types/learning';
import { grades, animationConfig } from '@/config/learningTheme';

interface GradeOverlayProps {
  isVisible: boolean;
  onGradeSelect: (grade: number) => void;
  onClose: () => void;
  userAge?: number;
  requireParentConfirm?: boolean;
}

export const GradeOverlay: React.FC<GradeOverlayProps> = ({
  isVisible,
  onGradeSelect,
  onClose,
  userAge = 10,
  requireParentConfirm = false
}) => {
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [showParentConfirm, setShowParentConfirm] = useState(false);
  const [hoveredGrade, setHoveredGrade] = useState<number | null>(null);

  const handleGradeClick = (gradeId: number) => {
    setSelectedGrade(gradeId);
    
    // Show parent confirmation if user is under 10 or if required
    if ((userAge < 10 || requireParentConfirm) && !showParentConfirm) {
      setShowParentConfirm(true);
    } else {
      confirmGradeSelection(gradeId);
    }
  };

  const confirmGradeSelection = (gradeId: number) => {
    onGradeSelect(gradeId);
    onClose();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isVisible) return;
      
      if (event.key === 'Escape') {
        setShowParentConfirm(false);
        setSelectedGrade(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  const overlayVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.95
    } as const,
    visible: { 
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4
      }
    } as const,
    exit: { 
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.3
      }
    } as const
  };

  const cardVariants = {
    hidden: { 
      opacity: 0,
      y: 20,
      rotateX: -10
    } as const,
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        delay: index * 0.05,
        duration: 0.4
      }
    }),
    hover: {
      scale: animationConfig.cardHover.scale,
      rotateX: animationConfig.cardHover.rotateX,
      rotateY: animationConfig.cardHover.rotateY,
      transition: {
        duration: 0.2
      }
    } as const,
    tap: {
      scale: 0.98,
      rotateX: 8,
      transition: {
        duration: 0.1
      }
    } as const
  };

  const parentConfirmVariants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
      y: 20
    } as const,
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    } as const
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          aria-labelledby="grade-overlay-title"
          role="dialog"
          aria-modal="true"
        >
          {/* Main Content */}
          <div className="w-full max-w-6xl mx-auto px-6 py-8">
            <div className="mb-6">
              <button
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                onClick={onClose}
                aria-label="Go back"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            </div>
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 
                id="grade-overlay-title"
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              >
                Please select your grade to begin
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Pick the grade you are studying in to get grade-specific lessons and activities.
              </p>
            </motion.div>

            {/* Grade Grid */}
            <motion.div 
              className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 max-w-5xl mx-auto"
              initial="hidden"
              animate="visible"
            >
              {grades.map((grade, index) => (
                <motion.button
                  key={grade.id}
                  className={`
                    relative p-6 md:p-8 rounded-2xl border-2 transition-all duration-200 
                    focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2
                    ${selectedGrade === grade.id 
                      ? 'border-green-500 bg-green-50 text-green-900' 
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }
                  `}
                  variants={cardVariants}
                  custom={index}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => handleGradeClick(grade.id)}
                  onMouseEnter={() => setHoveredGrade(grade.id)}
                  onMouseLeave={() => setHoveredGrade(null)}
                  onFocus={() => setHoveredGrade(grade.id)}
                  onBlur={() => setHoveredGrade(null)}
                  aria-label={`Select ${grade.label} grade for ages ${grade.ageRange}`}
                  style={{
                    perspective: '1000px',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold mb-2">
                      {grade.label}
                    </div>
                    <div className="text-sm text-gray-500 mb-1">
                      {grade.description}
                    </div>
                    <div className="text-xs text-gray-400">
                      Ages {grade.ageRange}
                    </div>
                  </div>

                  {/* Bounce indicator for hovered/selected cards */}
                  <AnimatePresence>
                    {(hoveredGrade === grade.id || selectedGrade === grade.id) && (
                      <motion.div
                        className="absolute -top-2 -right-2"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ 
                          type: 'spring', 
                          stiffness: 500, 
                          damping: 15 
                        }}
                      >
                        <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">
                          ✓
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </motion.div>

            {/* Parent Confirmation Modal */}
            <AnimatePresence>
              {showParentConfirm && selectedGrade !== null && (
                <motion.div
                  className="fixed inset-0 z-60 flex items-center justify-center bg-black/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
                    variants={parentConfirmVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-4">👨‍👩‍👧‍👦</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Parent Confirmation
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Is {grades.find(g => g.id === selectedGrade)?.label} grade correct for your child?
                      </p>
                      <div className="flex gap-3">
                        <button
                          className="flex-1 py-3 px-4 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/50"
                          onClick={() => confirmGradeSelection(selectedGrade)}
                        >
                          Yes, Continue
                        </button>
                        <button
                          className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500/50"
                          onClick={() => {
                            setShowParentConfirm(false);
                            setSelectedGrade(null);
                          }}
                        >
                          Go Back
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Instructions */}
            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <p className="text-sm text-gray-500">
                You can change your grade anytime from the settings menu.
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GradeOverlay;