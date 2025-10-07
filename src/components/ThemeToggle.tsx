import { useTheme } from '@/contexts/ThemeContext';
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full hover-lift"
      title={`Switch to ${theme === 'green' ? 'blue' : 'green'} theme`}
    >
      <Palette className="h-5 w-5" />
    </Button>
  );
};
