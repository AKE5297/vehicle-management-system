import { RouterProvider } from "react-router-dom";
import router from './routes';
import { useState, useEffect } from "react";
import { AuthContext } from './contexts/authContext';
import { initDataSync } from './services/localDataService';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // 检查认证状态
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setIsAuthenticated(true);
    }
    
    // 初始化数据同步
    initDataSync().catch(error => {
      console.error('数据同步初始化失败:', error);
    });
    
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
    
    // 监听设置变化事件
    const handleSettingsChange = () => {
      const updatedSettings = localStorage.getItem('siteSettings');
      if (updatedSettings) {
        try {
          const parsedSettings = JSON.parse(updatedSettings);
          if (parsedSettings.siteName) {
            document.title = parsedSettings.siteName;
          }
        } catch (error) {
          console.error('Error parsing updated site settings:', error);
        }
      }
    };
    
    window.addEventListener('siteSettingsChanged', handleSettingsChange);
    return () => window.removeEventListener('siteSettingsChanged', handleSettingsChange);
  }, []);
  
  // 退出登录处理
  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  };
  
  // 提供认证上下文
  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, logout }}
    >
      <RouterProvider router={router} />
    </AuthContext.Provider>
  );
}
