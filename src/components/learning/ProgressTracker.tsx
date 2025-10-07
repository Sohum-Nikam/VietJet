'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Target, Calendar, Award } from 'lucide-react';
import { UserCategory } from '@/types/learning';

interface ProgressData {
  currentGrade: number;
  totalXp: number;
  completedLessons: string[];
  completedModules: string[];
  badges: Array<{
    id: string;
    title: string;
    description: string;
    iconUrl?: string;
  }>;
  streaks: {
    daily: number;
    weekly: number;
  };
}

interface ProgressTrackerProps {
  userCategory: UserCategory;
  progress: ProgressData;
  subjectTheme: string;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  userCategory,
  progress,
  subjectTheme
}) => {
  const getXpLevelInfo = (xp: number) => {
    const level = Math.floor(xp / 500) + 1;
    const currentLevelXp = xp % 500;
    const nextLevelXp = 500;
    const progressPercent = (currentLevelXp / nextLevelXp) * 100;
    
    return { level, currentLevelXp, nextLevelXp, progressPercent };
  };

  const { level, currentLevelXp, nextLevelXp, progressPercent } = getXpLevelInfo(progress.totalXp);

  const getCategoryIcon = () => {
    switch (userCategory) {
      case 'Builder': return '🏗️';
      case 'Explorer': return '🧭';
      case 'Innovator': return '🚀';
      default: return '⭐';
    }
  };

  const getCategoryColor = () => {
    switch (userCategory) {
      case 'Builder': return '#10B981';
      case 'Explorer': return '#3B82F6';
      case 'Innovator': return '#8B5CF6';
      default: return subjectTheme;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold"
            style={{ backgroundColor: getCategoryColor() }}
          >
            {getCategoryIcon()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Learning Progress</h3>
            <p className="text-gray-600">{userCategory} • Grade {progress.currentGrade}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: subjectTheme }}>
            Level {level}
          </div>
          <div className="text-sm text-gray-500">{progress.totalXp.toLocaleString()} XP</div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progress to Level {level + 1}</span>
          <span className="font-medium" style={{ color: subjectTheme }}>
            {currentLevelXp}/{nextLevelXp} XP
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: subjectTheme }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Lessons</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {progress.completedLessons.length}
          </div>
          <div className="text-xs text-blue-700">Completed</div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Modules</span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            {progress.completedModules.length}
          </div>
          <div className="text-xs text-green-700">Completed</div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">Daily Streak</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {progress.streaks.daily}
          </div>
          <div className="text-xs text-orange-700">
            {progress.streaks.daily === 1 ? 'Day' : 'Days'}
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Badges</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {progress.badges.length}
          </div>
          <div className="text-xs text-purple-700">Earned</div>
        </motion.div>
      </div>

      {/* Recent Badges */}
      {progress.badges.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Star className="w-4 h-4" style={{ color: subjectTheme }} />
            Recent Achievements
          </h4>
          <div className="space-y-2">
            {progress.badges.slice(0, 3).map((badge, index) => (
              <motion.div
                key={badge.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                  style={{ backgroundColor: subjectTheme }}
                >
                  🏆
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">{badge.title}</div>
                  <div className="text-xs text-gray-600">{badge.description}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Motivational Message */}
      <motion.div
        className="p-4 rounded-xl border-2 border-dashed"
        style={{ borderColor: `${subjectTheme}40`, backgroundColor: `${subjectTheme}05` }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-start gap-3">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: subjectTheme }}
          >
            💪
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800 mb-1">
              {userCategory === 'Builder' && "You're building a strong foundation! Keep up the great work! 🌟"}
              {userCategory === 'Explorer' && "Your curiosity is paying off! Keep exploring new topics! 🔍"}
              {userCategory === 'Innovator' && "Your innovative thinking is impressive! Challenge yourself more! 💡"}
            </p>
            <p className="text-xs text-gray-600">
              {progress.streaks.daily > 0 
                ? `You're on a ${progress.streaks.daily}-day streak! 🔥`
                : "Start your learning streak today! 🚀"
              }
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProgressTracker;