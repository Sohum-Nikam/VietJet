'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Subject } from '@/types/learning';
import { subjectThemes, subjectInfo, animationConfig } from '@/config/learningTheme';

interface SubjectCarouselProps {
  selectedSubject?: Subject;
  onSubjectSelect: (subject: Subject) => void;
  className?: string;
}

export const SubjectCarousel: React.FC<SubjectCarouselProps> = ({
  selectedSubject,
  onSubjectSelect,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  
  const subjects: Subject[] = ['Maths', 'Science', 'Geography', 'EVS'];
  
  // Parallax effect for background
  const backgroundX = useTransform(x, [-100, 100], [20, -20]);
  
  const nextSubject = () => {
    setCurrentIndex((prev) => (prev + 1) % subjects.length);
  };
  
  const prevSubject = () => {
    setCurrentIndex((prev) => (prev - 1 + subjects.length) % subjects.length);
  };

  const handleSubjectClick = (subject: Subject, index: number) => {
    if (index === currentIndex) {
      // If clicking the center card, select the subject
      onSubjectSelect(subject);
    } else {
      // If clicking a side card, make it the center card
      setCurrentIndex(index);
    }
  };

  // Auto-play functionality (optional)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging && !selectedSubject) {
        nextSubject();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isDragging, selectedSubject]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        prevSubject();
      } else if (event.key === 'ArrowRight') {
        nextSubject();
      } else if (event.key === 'Enter' && currentIndex !== null) {
        onSubjectSelect(subjects[currentIndex]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, subjects]);

  const cardVariants = {
    center: {
      scale: animationConfig.carousel.centerScale,
      zIndex: 3,
      opacity: 1,
      filter: 'brightness(1)',
      transition: {
        duration: 0.4
      }
    } as const,
    side: {
      scale: animationConfig.carousel.sideScale,
      zIndex: 1,
      opacity: 0.7,
      filter: 'brightness(0.8)',
      transition: {
        duration: 0.4
      }
    } as const,
    far: {
      scale: 0.7,
      zIndex: 0,
      opacity: 0.4,
      filter: 'brightness(0.6)',
      transition: {
        duration: 0.4
      }
    } as const
  };

  const getCardVariant = (index: number) => {
    const distance = Math.abs(index - currentIndex);
    if (distance === 0) return 'center';
    if (distance === 1) return 'side';
    return 'far';
  };

  const getCardPosition = (index: number) => {
    const distance = index - currentIndex;
    return distance * 280; // Card width + gap
  };

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* Background with parallax effect */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={{
          background: `linear-gradient(135deg, ${subjectThemes[subjects[currentIndex]]?.light} 0%, ${subjectThemes[subjects[currentIndex]]?.primary}20 100%)`,
          x: backgroundX
        }}
      />

      {/* Section Title */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Start Learning
          <motion.span
            className="block w-32 h-1 mx-auto mt-4 rounded-full"
            style={{
              background: subjectThemes[subjects[currentIndex]]?.gradient
            }}
            layoutId="title-underline"
          />
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Choose a subject to explore exciting lessons and activities designed just for you!
        </p>
      </motion.div>

      {/* Carousel Container */}
      <div className="relative h-96 flex items-center justify-center">
        {/* Navigation Buttons */}
        <button
          className="absolute left-4 z-10 p-3 bg-white/80 hover:bg-white rounded-full shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          onClick={prevSubject}
          aria-label="Previous subject"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          className="absolute right-4 z-10 p-3 bg-white/80 hover:bg-white rounded-full shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          onClick={nextSubject}
          aria-label="Next subject"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Carousel Cards */}
        <motion.div
          ref={containerRef}
          className="relative w-full h-full flex items-center justify-center"
          drag="x"
          dragConstraints={{ left: -100, right: 100 }}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          style={{ x }}
        >
          {subjects.map((subject, index) => {
            const theme = subjectThemes[subject];
            const info = subjectInfo[subject];
            
            return (
              <motion.div
                key={subject}
                className="absolute cursor-pointer"
                variants={cardVariants}
                animate={getCardVariant(index)}
                style={{
                  x: getCardPosition(index)
                }}
                onClick={() => handleSubjectClick(subject, index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleSubjectClick(subject, index);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Select ${subject} subject: ${info.tagline}`}
              >
                <div
                  className="w-64 h-80 rounded-2xl p-6 shadow-xl transform transition-all duration-300 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-offset-2"
                  style={{
                    background: theme.gradient
                  }}
                >
                  <div className="text-white h-full flex flex-col">
                    {/* Subject Icon */}
                    <div className="text-center mb-6">
                      <div className="text-6xl mb-4">{theme.icon}</div>
                      <h3 className="text-2xl font-bold">{subject}</h3>
                    </div>

                    {/* Subject Info */}
                    <div className="flex-1 text-center">
                      <p className="text-lg font-medium mb-4 opacity-90">
                        {info.tagline}
                      </p>
                      <p className="text-sm opacity-75 line-clamp-3">
                        {info.description}
                      </p>
                    </div>

                    {/* Lottie Animation Container (if available) */}
                    {theme.lottieUrl && (
                      <div className="h-16 flex items-center justify-center opacity-80">
                        {/* Lottie animation would go here */}
                        <div className="text-2xl animate-bounce">
                          {subject === 'Maths' && '📊'}
                          {subject === 'Science' && '⚗️'}
                          {subject === 'Geography' && '🌍'}
                          {subject === 'EVS' && '🌱'}
                        </div>
                      </div>
                    )}

                    {/* Action Hint */}
                    {index === currentIndex && (
                      <motion.div
                        className="text-center text-sm font-medium opacity-90"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        Click to explore →
                      </motion.div>
                    )}
                  </div>

                  {/* Shimmer Effect for Center Card */}
                  {index === currentIndex && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        backgroundSize: '200% 100%'
                      }}
                      animate={{
                        backgroundPosition: ['200% 0', '-200% 0']
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Carousel Indicators */}
      <div className="flex justify-center mt-8 space-x-2">
        {subjects.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              index === currentIndex
                ? 'bg-gray-700 scale-125'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to ${subjects[index]} subject`}
            style={{
              backgroundColor: index === currentIndex ? subjectThemes[subjects[index]].primary : undefined
            }}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md mx-auto mt-6 h-1 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            backgroundColor: subjectThemes[subjects[currentIndex]].primary,
            width: `${((currentIndex + 1) / subjects.length) * 100}%`
          }}
          layoutId="progress-bar"
        />
      </div>
    </div>
  );
};

export default SubjectCarousel;