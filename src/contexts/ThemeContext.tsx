import { createContext, ReactNode, useContext } from 'react';
import { useTheme } from '../hooks/useTheme';

type ThemeContextType = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
  neutralColor: string;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, toggleTheme, isDark } = useTheme();
  
  // Define theme colors based on current mode
  const themeColors = {
    light: {
      primaryColor: 'bg-blue-600',
      secondaryColor: 'bg-indigo-600',
      neutralColor: 'bg-gray-100',
    },
    dark: {
      primaryColor: 'bg-blue-500',
      secondaryColor: 'bg-indigo-500',
      neutralColor: 'bg-gray-800',
    }
  };
  
  const currentColors = theme === 'light' ? themeColors.light : themeColors.dark;

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      isDark,
      primaryColor: currentColors.primaryColor,
      secondaryColor: currentColors.secondaryColor,
      neutralColor: currentColors.neutralColor
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}