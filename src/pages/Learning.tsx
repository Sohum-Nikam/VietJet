import React, { useState } from 'react';
import { LearningPage } from '@/components/learning/LearningPage';
import { UserCategory, LearningProgress } from '@/types/learning';

const Learning: React.FC = () => {
  // Mock user data - in a real app this would come from authentication/user context
  const [userCategory] = useState<UserCategory>('Builder');
  const [progress, setProgress] = useState<LearningProgress>({
    userId: 'demo-user',
    currentGrade: 3,
    userCategory: 'Builder',
    totalXp: 450,
    currentStreak: 7,
    longestStreak: 15,
    badges: [
      {
        id: 'first-lesson',
        title: 'First Steps',
        description: 'Completed your first lesson',
        iconUrl: '',
        unlockedAt: new Date().toISOString(),
        xpValue: 50,
        rarity: 'common' as const
      }
    ],
    completedModules: ['module-1'],
    completedLessons: ['lesson-1', 'lesson-2'],
    weeklyGoals: [
      {
        id: 'weekly-1',
        title: 'Complete 5 lessons',
        description: 'Complete 5 lessons this week',
        targetValue: 5,
        currentValue: 2,
        unit: 'lessons',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        xpReward: 100
      }
    ],
    practiceMode: false
  });

  const handleProgressUpdate = (updates: Partial<LearningProgress>) => {
    setProgress(prev => ({ ...prev, ...updates }));
  };

  return (
    <LearningPage
      userCategory={userCategory}
      progress={progress}
      onProgressUpdate={handleProgressUpdate}
    />
  );
};

export default Learning;