'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Module, Subject, UserCategory } from '@/types/learning';
import { subjectThemes } from '@/config/learningTheme';

interface ModuleBoardProps {
  subject: Subject;
  grade: number;
  userCategory: UserCategory;
  onModuleSelect: (moduleId: string) => void;
  onBack: () => void;
}

// Simple module interface for display
interface SimpleModule {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  durationMin: number;
  xpReward: number;
  description: string;
  objectives: string[];
}

// Sample module data - in production this would come from an API
const getSampleModules = (subject: Subject, grade: number): SimpleModule[] => {
  const baseModules = {
    Maths: [
      { id: 'MATH-G4-ALG', title: 'Algebra Basics', difficulty: 'medium' as const, durationMin: 45, xpReward: 120, description: 'Learn about variables and basic equations', objectives: ['Understand what variables are', 'Solve simple equations', 'Apply algebra to word problems'] },
      { id: 'MATH-G4-GEO', title: 'Geometry Fundamentals', difficulty: 'easy' as const, durationMin: 35, xpReward: 100, description: 'Explore shapes, angles, and measurements', objectives: ['Identify 2D and 3D shapes', 'Measure angles and lengths', 'Calculate area and perimeter'] },
      { id: 'MATH-G4-DEC', title: 'Decimals & Fractions', difficulty: 'medium' as const, durationMin: 50, xpReward: 140, description: 'Master decimal and fraction operations', objectives: ['Convert between decimals and fractions', 'Add and subtract decimals', 'Compare fraction sizes'] },
      { id: 'MATH-G4-TIME', title: 'Time & Measurement', difficulty: 'easy' as const, durationMin: 30, xpReward: 90, description: 'Learn time telling and unit conversions', objectives: ['Read analog and digital clocks', 'Convert between time units', 'Solve time word problems'] },
    ],
    Science: [
      { id: 'SCI-G4-MATTER', title: 'States of Matter', difficulty: 'medium' as const, durationMin: 40, xpReward: 110, description: 'Explore solids, liquids, and gases', objectives: ['Identify the three states of matter', 'Understand state changes', 'Observe matter in everyday life'] },
      { id: 'SCI-G4-FORCES', title: 'Forces & Motion', difficulty: 'medium' as const, durationMin: 45, xpReward: 125, description: 'Discover how things move and what makes them stop', objectives: ['Define force and motion', 'Identify push and pull forces', 'Explore friction and gravity'] },
      { id: 'SCI-G4-PLANTS', title: 'Plant Life Cycles', difficulty: 'easy' as const, durationMin: 35, xpReward: 95, description: 'Learn how plants grow and reproduce', objectives: ['Identify plant parts', 'Understand photosynthesis', 'Track plant life cycles'] },
    ],
    Geography: [
      { id: 'GEO-G4-MAPS', title: 'Reading Maps', difficulty: 'medium' as const, durationMin: 40, xpReward: 115, description: 'Navigate the world using maps and compasses', objectives: ['Read map symbols and legends', 'Use compass directions', 'Calculate distances on maps'] },
      { id: 'GEO-G4-LANDFORMS', title: 'Landforms & Features', difficulty: 'easy' as const, durationMin: 35, xpReward: 100, description: 'Explore mountains, rivers, and other land features', objectives: ['Identify major landforms', 'Understand erosion and weathering', 'Locate famous geographical features'] },
    ],
    EVS: [
      { id: 'EVS-G4-WATER', title: 'Water Cycle', difficulty: 'medium' as const, durationMin: 40, xpReward: 120, description: 'Follow water as it moves through Earth\'s systems', objectives: ['Understand evaporation and condensation', 'Track precipitation patterns', 'Conserve water resources'] },
      { id: 'EVS-G4-ECOSYS', title: 'Ecosystems', difficulty: 'medium' as const, durationMin: 45, xpReward: 130, description: 'Discover how living things depend on each other', objectives: ['Identify ecosystem components', 'Understand food chains', 'Explore habitat relationships'] },
    ]
  };

  return baseModules[subject] || [];
};

const ModuleBoard: React.FC<ModuleBoardProps> = ({
  subject,
  grade,
  userCategory,
  onModuleSelect,
  onBack
}) => {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const theme = subjectThemes[subject];
  const modules = getSampleModules(subject, grade);

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4 }
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleModuleClick = (moduleId: string) => {
    setSelectedModule(moduleId);
    // Add a small delay for the selection animation
    setTimeout(() => {
      onModuleSelect(moduleId);
      // Redirect to coming soon placeholder for all modules
      window.location.href = '/coming-soon';
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white">
      {/* Header */}
      <div 
        className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200"
        style={{ borderBottomColor: `${theme.primary}20` }}
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Go back to subject selection"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Subjects
            </button>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 capitalize">
                {subject} - Grade {grade}
              </h1>
              <p className="text-gray-600 mt-1">Choose a module to begin learning</p>
            </div>

            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Module Grid */}
      <motion.div
        className="max-w-7xl mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
              className={`relative bg-white rounded-2xl shadow-lg cursor-pointer overflow-hidden group ${
                selectedModule === module.id ? 'ring-2' : ''
              }`}
              style={{ 
                borderColor: selectedModule === module.id ? theme.primary : 'transparent'
              }}
              onClick={() => handleModuleClick(module.id)}
            >
              {/* Module Thumbnail */}
              <div 
                className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden"
                style={{ 
                  background: `linear-gradient(135deg, ${theme.primary}15, ${theme.primary}05)` 
                }}
              >
                {/* Placeholder for module thumbnail */}
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: theme.primary }}
                >
                  {subject === 'Maths' && '∑'}
                  {subject === 'Science' && '🧪'}
                  {subject === 'Geography' && '🗺️'}
                  {subject === 'EVS' && '🌿'}
                </div>
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </div>

              {/* Module Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                    {module.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                    {module.difficulty}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {module.description}
                </p>

                {/* Module Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {module.durationMin}min
                  </div>
                  <div 
                    className="flex items-center gap-1 font-medium"
                    style={{ color: theme.primary }}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                    {module.xpReward} XP
                  </div>
                </div>

                {/* Objectives */}
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-700">You'll learn:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {module.objectives.slice(0, 2).map((objective, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span 
                          className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: theme.primary }}
                        />
                        {objective}
                      </li>
                    ))}
                    {module.objectives.length > 2 && (
                      <li className="text-gray-400">+{module.objectives.length - 2} more...</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Selection indicator */}
              {selectedModule === module.id && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div 
                    className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {modules.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Coming Soon!
            </h3>
            <p className="text-gray-500">
              Modules for {subject} Grade {grade} are being prepared.
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Adaptive encouragement based on user category */}
      <div className="fixed bottom-6 right-6 z-10">
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-4 max-w-sm"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <div className="flex items-start gap-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
              style={{ backgroundColor: theme.primary }}
            >
              ✨
            </div>
            <div>
              <p className="text-sm text-gray-700 font-medium">
                {userCategory === 'Builder' && "Take your time exploring each module. You've got this! 🌟"}
                {userCategory === 'Explorer' && "Ready to learn something new? Pick a module that excites you! 🚀"}
                {userCategory === 'Innovator' && "Challenge yourself with a new module. Let's push your limits! ⚡"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ModuleBoard;