import { Subject, SubjectTheme, Grade, AnimationConfig } from '@/types/learning';

// Subject-specific themes
export const subjectThemes: Record<Subject, SubjectTheme> = {
  Maths: {
    primary: '#6B46C1', // Purple
    secondary: '#9333EA',
    light: '#EDE9FE',
    dark: '#4C1D95',
    gradient: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 100%)',
    icon: '🧮',
    lottieUrl: 'https://assets2.lottiefiles.com/packages/lf20_math_numbers.json'
  },
  Science: {
    primary: '#0BC5EA', // Teal/Blue
    secondary: '#06B6D4',
    light: '#E0F7FA',
    dark: '#0E7490',
    gradient: 'linear-gradient(135deg, #0BC5EA 0%, #06B6D4 100%)',
    icon: '🧪',
    lottieUrl: 'https://assets2.lottiefiles.com/packages/lf20_science_lab.json'
  },
  Geography: {
    primary: '#8B5E3C', // Earthy Brown/Olive
    secondary: '#A16207',
    light: '#FEF3C7',
    dark: '#92400E',
    gradient: 'linear-gradient(135deg, #8B5E3C 0%, #A16207 100%)',
    icon: '🌍',
    lottieUrl: 'https://assets2.lottiefiles.com/packages/lf20_earth_globe.json'
  },
  EVS: {
    primary: '#22C55E', // Green
    secondary: '#16A34A',
    light: '#D1FAE5',
    dark: '#15803D',
    gradient: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
    icon: '🌱',
    lottieUrl: 'https://assets2.lottiefiles.com/packages/lf20_nature_plant.json'
  }
};

// Grade configuration (K-12)
export const grades: Grade[] = [
  { id: 0, label: 'K', description: 'Kindergarten', ageRange: '5-6' },
  { id: 1, label: '1st', description: 'First Grade', ageRange: '6-7' },
  { id: 2, label: '2nd', description: 'Second Grade', ageRange: '7-8' },
  { id: 3, label: '3rd', description: 'Third Grade', ageRange: '8-9' },
  { id: 4, label: '4th', description: 'Fourth Grade', ageRange: '9-10' },
  { id: 5, label: '5th', description: 'Fifth Grade', ageRange: '10-11' },
  { id: 6, label: '6th', description: 'Sixth Grade', ageRange: '11-12' },
  { id: 7, label: '7th', description: 'Seventh Grade', ageRange: '12-13' },
  { id: 8, label: '8th', description: 'Eighth Grade', ageRange: '13-14' },
  { id: 9, label: '9th', description: 'Ninth Grade', ageRange: '14-15' },
  { id: 10, label: '10th', description: 'Tenth Grade', ageRange: '15-16' },
  { id: 11, label: '11th', description: 'Eleventh Grade', ageRange: '16-17' },
  { id: 12, label: '12th', description: 'Twelfth Grade', ageRange: '17-18' }
];

// Animation configuration
export const animationConfig: AnimationConfig = {
  pageTransition: {
    duration: 0.8,
    ease: 'easeInOut'
  },
  cardHover: {
    scale: 1.05,
    rotateX: 5,
    rotateY: 5
  },
  carousel: {
    parallaxStrength: 0.3,
    centerScale: 1.1,
    sideScale: 0.85
  },
  stagger: {
    delay: 0.1,
    duration: 0.5
  }
};

// Lottie animation URLs
export const lottieAnimations = {
  avatarWalking: 'https://assets2.lottiefiles.com/packages/lf20_avatar_walk.json',
  rewardChest: 'https://assets2.lottiefiles.com/packages/lf20_treasure_chest.json',
  confetti: 'https://assets2.lottiefiles.com/packages/lf20_confetti_celebration.json',
  progressGauge: 'https://assets2.lottiefiles.com/packages/lf20_progress_circle.json',
  starBurst: 'https://assets2.lottiefiles.com/packages/lf20_star_burst.json',
  bookFlip: 'https://assets2.lottiefiles.com/packages/lf20_book_pages.json',
  lightBulb: 'https://assets2.lottiefiles.com/packages/lf20_idea_bulb.json',
  checkmark: 'https://assets2.lottiefiles.com/packages/lf20_success_check.json'
};

// Subject taglines and descriptions
export const subjectInfo = {
  Maths: {
    tagline: 'Numbers, patterns, and problem solving!',
    description: 'Explore the magical world of mathematics with fun activities and games.',
    modules: {
      4: ['Algebra Basics', 'Geometry Fun', 'Decimals & Fractions', 'Shapes & Patterns', 'Time & Measurement', 'Word Problems', 'Money Math']
    }
  },
  Science: {
    tagline: 'Discover how the world works!',
    description: 'Conduct virtual experiments and learn about the amazing world of science.',
    modules: {
      4: ['Living Things', 'Simple Machines', 'Weather & Climate', 'Matter & Materials', 'Energy & Motion', 'Earth & Space', 'Human Body']
    }
  },
  Geography: {
    tagline: 'Explore our amazing planet!',
    description: 'Journey across continents and discover different cultures and landscapes.',
    modules: {
      4: ['World Continents', 'Landforms & Features', 'Countries & Capitals', 'Rivers & Mountains', 'Climate Zones', 'Natural Resources', 'Maps & Directions']
    }
  },
  EVS: {
    tagline: 'Care for our environment!',
    description: 'Learn how to protect nature and live sustainably on our planet.',
    modules: {
      4: ['Plants & Animals', 'Water Cycle', 'Pollution & Solutions', 'Recycling & Waste', 'Food Chains', 'Conservation', 'Eco-Systems']
    }
  }
};

// Accessibility settings
export const accessibilityConfig = {
  fontSize: {
    small: '14px',
    medium: '16px',
    large: '20px',
    xlarge: '24px'
  },
  contrast: {
    normal: 1,
    high: 1.5,
    highest: 2
  },
  motion: {
    reduced: false,
    normal: true
  },
  keyboard: {
    focusRing: '2px solid #3B82F6',
    skipLinks: true
  }
};

// Gamification settings
export const gamificationConfig = {
  xpPerLesson: 50,
  xpPerModule: 200,
  streakMultiplier: 1.2,
  badges: {
    firstLesson: { xp: 25, icon: '🎯' },
    weekStreak: { xp: 100, icon: '🔥' },
    moduleComplete: { xp: 200, icon: '🏆' },
    perfectQuiz: { xp: 150, icon: '⭐' }
  }
};

// Helper function to get current theme
export const getCurrentTheme = (subject?: Subject) => {
  if (!subject) {
    return {
      primary: '#10B981', // Default green
      secondary: '#059669',
      light: '#D1FAE5',
      dark: '#047857'
    };
  }
  return subjectThemes[subject];
};

// Helper function to get subject modules for grade
export const getSubjectModules = (subject: Subject, grade: number): string[] => {
  return subjectInfo[subject].modules[grade as keyof typeof subjectInfo[typeof subject]['modules']] || [];
};