import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy, Star, Sparkles, Download, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/types/quiz';
import confetti from 'canvas-confetti';
import badgeTrophy from '@/assets/badge-trophy.png';
import badgeStar from '@/assets/badge-star.png';
import avatar1 from '@/assets/avatar-1.png';
import avatar2 from '@/assets/avatar-2.png';
import avatar3 from '@/assets/avatar-3.png';
import avatar4 from '@/assets/avatar-4.png';

const avatarMap: Record<string, string> = {
  '1': avatar1,
  '2': avatar2,
  '3': avatar3,
  '4': avatar4,
};

const Results = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  type SimpleResult = {
    score: number;
    correctAnswers: number;
    percentage: number;
    category: 'Builder' | 'Explorer' | 'Innovator';
  };
  const [result, setResult] = useState<SimpleResult | null>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    const savedResult = localStorage.getItem('quizResult');

    if (!savedProfile || !savedResult) {
      navigate('/');
      return;
    }

    setProfile(JSON.parse(savedProfile));
    setResult(JSON.parse(savedResult));

    // Celebration confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 250);
  }, [navigate]);

  if (!profile || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const categoryInfo = {
    Innovator: {
      title: '🚀 Innovator',
      description: 'You\'re a creative problem-solver who loves to explore new ideas!',
      color: 'from-purple-500 to-pink-500',
      badge: badgeTrophy,
    },
    Explorer: {
      title: '🌟 Explorer',
      description: 'You\'re curious and eager to discover new things!',
      color: 'from-blue-500 to-cyan-500',
      badge: badgeStar,
    },
    Builder: {
      title: '🏗️ Builder',
      description: 'You\'re developing your skills and building a strong foundation!',
      color: 'from-green-500 to-emerald-500',
      badge: badgeStar,
    },
  };

  const info = categoryInfo[result.category as keyof typeof categoryInfo];

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero section with avatar and category */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          {/* Avatar with badge */}
          <div className="relative inline-block">
            <motion.img
              src={avatarMap[profile.avatarId]}
              alt="Your avatar"
              className="w-32 h-32 rounded-full ring-8 ring-primary/20"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            />
            <motion.img
              src={info.badge}
              alt="Achievement badge"
              className="absolute -bottom-2 -right-2 w-16 h-16"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, type: "spring" }}
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold">
              Congratulations, {profile.username}!
            </h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`inline-block px-6 py-3 rounded-2xl text-2xl font-bold text-white bg-gradient-to-r ${info.color}`}
            >
              {info.title}
            </motion.div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {info.description}
            </p>
          </div>
        </motion.div>

        {/* Score breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid md:grid-cols-3 gap-4"
        >
          <div className="bg-card rounded-2xl p-6 shadow-game text-center">
            <Trophy className="h-8 w-8 text-accent mx-auto mb-2" />
            <div className="text-3xl font-bold text-primary">{result.score}</div>
            <div className="text-sm text-muted-foreground">Total Score</div>
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-game text-center">
            <Star className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-3xl font-bold text-primary">{result.correctAnswers}</div>
            <div className="text-sm text-muted-foreground">Correct Answers</div>
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-game text-center">
            <Sparkles className="h-8 w-8 text-success mx-auto mb-2" />
            <div className="text-3xl font-bold text-primary">{Math.round(result.percentage)}%</div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </div>
        </motion.div>

        {/* Strengths & Opportunities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <div className="bg-success/10 border-2 border-success rounded-2xl p-6 space-y-3">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">💪</span>
              Your Strengths
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-success">✓</span>
                <span>Great problem-solving skills</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">✓</span>
                <span>Strong logical thinking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">✓</span>
                <span>Quick pattern recognition</span>
              </li>
            </ul>
          </div>

          <div className="bg-primary/10 border-2 border-primary rounded-2xl p-6 space-y-3">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Keep Practicing
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary">→</span>
                <span>Mathematical operations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">→</span>
                <span>Reading comprehension</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">→</span>
                <span>Creative thinking</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Personalized lesson plan CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-gradient-to-r from-primary to-primary-glow rounded-3xl p-8 text-center text-primary-foreground"
        >
          <h3 className="text-2xl font-bold mb-2">Your Personalized Learning Path</h3>
          <p className="mb-6 opacity-90">
            Based on your results, we've created a custom learning journey just for you!
          </p>
          <div className="grid md:grid-cols-4 gap-3 mb-6">
            {['Math Adventures', 'Science Quest', 'Reading Challenge', 'Creative Lab'].map((lesson) => (
              <div key={lesson} className="bg-white/20 backdrop-blur rounded-xl p-4">
                <div className="text-3xl mb-2">📚</div>
                <div className="font-medium text-sm">{lesson}</div>
              </div>
            ))}
          </div>
          <Button
            size="lg"
            variant="secondary"
            className="btn-game"
            onClick={() => navigate('/learning?gradeSelect=1')}
          >
            Start Learning Journey
          </Button>
        </motion.div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 btn-game"
            disabled
          >
            <Download className="h-5 w-5 mr-2" />
            Download Certificate
          </Button>
          <Button
            size="lg"
            onClick={() => navigate('/')}
            className="flex-1 btn-game bg-gradient-to-r from-primary to-primary-glow"
          >
            <Home className="h-5 w-5 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;
