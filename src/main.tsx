import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from 'sonner';
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from './contexts/ThemeContext';

// 设置页面标题为存储的网站名称
const savedSettings = localStorage.getItem('siteSettings');
if (savedSettings) {
  try {
    const parsedSettings = JSON.parse(savedSettings);
    if (parsedSettings.siteName) {
      document.title = parsedSettings.siteName;
    }
  } catch (error) {
    console.error('Error parsing site settings:', error);
  }
}

// 确保主题提供者正确包裹整个应用
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
      <Toaster />
    </ThemeProvider>
  </StrictMode>
)