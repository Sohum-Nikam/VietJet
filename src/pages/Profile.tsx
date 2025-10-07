import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AvatarPicker } from '@/components/AvatarPicker';
import { AgeCarousel } from '@/components/AgeCarousel';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/types/quiz';

const Profile = () => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    username: '',
    age: 10,
    avatarId: '1',
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step === 1 && !profile.username) {
      toast({
        title: "Oops!",
        description: "Please enter your name to continue.",
        variant: "destructive",
      });
      return;
    }
    
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Determine age group
      const age = profile.age || 10;
      const ageGroup: '5-10' | '10-15' | '15-18' = 
        age <= 10 ? '5-10' : age <= 15 ? '10-15' : '15-18';
      
      const completeProfile: UserProfile = {
        ...profile as UserProfile,
        ageGroup,
      };
      
      // Store profile and navigate to quiz
      localStorage.setItem('userProfile', JSON.stringify(completeProfile));
      
      toast({
        title: "Profile Complete! 🎉",
        description: "Get ready for your brain adventure!",
      });
      
      navigate('/quiz');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Header with progress */}
        <div className="mb-8 space-y-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="hover-lift"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-primary to-primary-glow"
              />
            </div>
          </div>
        </div>

        {/* Profile Form Card */}
        <div className="bg-card rounded-3xl p-8 shadow-game-lg space-y-8">
          {/* Step 1: Username */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <Star className="h-12 w-12 text-primary mx-auto animate-pulse-glow" />
                <h2 className="text-3xl font-bold">What's your name?</h2>
                <p className="text-muted-foreground">
                  This is how we'll cheer you on!
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-lg">Your Name</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your awesome name"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  className="h-14 text-lg rounded-xl"
                  autoFocus
                />
              </div>
            </motion.div>
          )}

          {/* Step 2: Age */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <AgeCarousel
                selected={profile.age || 10}
                onSelect={(age) => setProfile({ ...profile, age })}
              />
            </motion.div>
          )}

          {/* Step 3: Avatar */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <AvatarPicker
                selected={profile.avatarId || '1'}
                onSelect={(avatarId) => setProfile({ ...profile, avatarId })}
              />
              
              {/* Optional fields */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Label htmlFor="parentEmail" className="text-sm text-muted-foreground">
                    Parent Email (Optional)
                  </Label>
                  <Input
                    id="parentEmail"
                    type="email"
                    placeholder="parent@email.com"
                    value={profile.parentEmail || ''}
                    onChange={(e) => setProfile({ ...profile, parentEmail: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 h-12 btn-game"
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 h-12 btn-game bg-gradient-to-r from-primary to-primary-glow"
            >
              {step === totalSteps ? 'Start Quiz!' : 'Next'}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
