import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

// 主题钩子，简化主题使用
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}