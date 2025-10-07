import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'green' | 'blue';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('green');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'blue') {
      root.classList.add('theme-blue');
    } else {
      root.classList.remove('theme-blue');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'green' ? 'blue' : 'green');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
