import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AgeCarouselProps {
  selected: number;
  onSelect: (age: number) => void;
}

const ages = Array.from({ length: 14 }, (_, i) => i + 5); // Ages 5-18

export const AgeCarousel = ({ selected, onSelect }: AgeCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(ages.indexOf(selected) || 0);

  const handlePrev = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : ages.length - 1;
    setCurrentIndex(newIndex);
    onSelect(ages[newIndex]);
  };

  const handleNext = () => {
    const newIndex = currentIndex < ages.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    onSelect(ages[newIndex]);
  };

  const visibleAges = [
    ages[(currentIndex - 1 + ages.length) % ages.length],
    ages[currentIndex],
    ages[(currentIndex + 1) % ages.length],
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-center">How old are you?</h3>
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrev}
          className="rounded-full hover-scale"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <div className="flex items-center gap-2 h-32">
          {visibleAges.map((age, index) => (
            <motion.div
              key={`${age}-${index}`}
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{
                scale: index === 1 ? 1.2 : 0.8,
                opacity: index === 1 ? 1 : 0.5,
              }}
              className={`
                w-20 h-20 rounded-2xl flex items-center justify-center
                font-bold text-3xl transition-all duration-300
                ${index === 1 
                  ? 'bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-game-lg' 
                  : 'bg-secondary text-secondary-foreground'
                }
              `}
            >
              {age}
            </motion.div>
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          className="rounded-full hover-scale"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
      <p className="text-center text-muted-foreground">
        Tap the arrows to spin and pick your age!
      </p>
    </div>
  );
};
