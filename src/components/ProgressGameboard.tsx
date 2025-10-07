import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';

interface ProgressGameboardProps {
  current: number;
  total: number;
  score: number;
}

export const ProgressGameboard = ({ current, total, score }: ProgressGameboardProps) => {
  const progress = (current / total) * 100;
  const planets = Array.from({ length: Math.min(total, 10) }, (_, i) => i);

  return (
    <div className="w-full space-y-4">
      {/* Score display */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          <span className="text-muted-foreground">Score: </span>
          <span className="text-2xl font-bold text-primary">{score}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {current} / {total} Questions
        </div>
      </div>

      {/* Progress bar with planets */}
      <div className="relative h-16 bg-secondary rounded-full overflow-visible">
        {/* Progress fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow"
        />

        {/* Planet markers */}
        <div className="absolute inset-0 flex items-center justify-between px-2">
          {planets.map((_, index) => {
            const planetProgress = ((index + 1) / total) * 100;
            const isPassed = progress >= planetProgress;
            
            return (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${isPassed ? 'bg-accent text-accent-foreground' : 'bg-card border-2 border-border'}
                  transition-all duration-300
                `}
              >
                <span className="text-xs font-bold">{index + 1}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Rocket indicator */}
        <motion.div
          initial={{ left: '0%' }}
          animate={{ left: `${Math.min(progress, 95)}%` }}
          transition={{ duration: 0.5 }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ 
              y: [0, -5, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Rocket className="h-8 w-8 text-primary drop-shadow-lg" />
          </motion.div>
        </motion.div>
      </div>

      {/* XP Bar */}
      <div className="xp-bar">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(score / (total * 10)) * 100}%` }}
          className="xp-bar-fill"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-foreground">
            {score} XP
          </span>
        </div>
      </div>
    </div>
  );
};
