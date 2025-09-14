import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      return savedTheme;
    }
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(theme);
    
    // Save theme preference
    localStorage.setItem('theme', theme);
    
    // Dispatch event for components to react to theme changes
    const event = new CustomEvent('themeChange', { detail: { theme } });
    window.dispatchEvent(event);
  }, [theme]);

  // Toggle theme with animation
  const toggleTheme = () => {
    // Add transition class
    document.documentElement.classList.add('transition-colors', 'duration-300');
    
    // Toggle theme
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    
    // Remove transition class after animation completes
    setTimeout(() => {
      document.documentElement.classList.remove('transition-colors', 'duration-300');
    }, 300);
  };

  return {
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  };
}