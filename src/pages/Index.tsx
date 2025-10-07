import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Brain, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import heroRocket from '@/assets/hero-rocket.png';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">BrainQuest</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <ThemeToggle />
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 pt-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6 text-center md:text-left"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="inline-block"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium">
                <Sparkles className="h-4 w-4" />
                <span>Discover Your Learning Superpower!</span>
              </div>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Ready for a
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-glow animate-pulse-glow">
                Brain Adventure?
              </span>
            </h1>

            <p className="text-xl text-muted-foreground">
              Take our fun quiz to find out if you're a <strong>Builder</strong>, 
              <strong> Explorer</strong>, or <strong>Innovator</strong>! 
              Unlock personalized learning paths designed just for you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button
                size="lg"
                onClick={() => navigate('/learning')}
                className="btn-game text-lg bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow"
              >
                <Rocket className="h-5 w-5 mr-2" />
                Start Your Quest
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/auth')}
                className="btn-game text-lg"
              >
                Sign In
              </Button>
            </div>

            {/* Feature badges */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-4">
              {['25 Fun Questions', 'Instant Results', 'Personalized Path'].map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium"
                >
                  ✓ {feature}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <motion.img
              src={heroRocket}
              alt="Friendly rocket ship in space"
              className="w-full h-auto drop-shadow-2xl"
              animate={{
                y: [0, -20, 0],
                rotate: [0, 2, -2, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* Floating decorative elements */}
            <motion.div
              animate={{
                y: [0, -30, 0],
                x: [0, 10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-10 right-10 text-6xl"
            >
              ⭐
            </motion.div>
            <motion.div
              animate={{
                y: [0, 20, 0],
                x: [0, -10, 0],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="absolute bottom-20 left-10 text-5xl"
            >
              🌟
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Made with ❤️ for curious young minds</p>
      </footer>
    </div>
  );
};

export default Index;
