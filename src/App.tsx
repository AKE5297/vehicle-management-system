import { RouterProvider } from "react-router-dom";
import router from './routes';
import { useState, useEffect } from "react";
import { AuthContext } from './contexts/authContext';
import { initDataSync } from './services/localDataService';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // 检查认证状态
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setIsAuthenticated(true);
        setCurrentUser(user);
      } catch (error) {
        console.error('解析用户数据失败:', error);
        localStorage.removeItem('currentUser');
      }
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
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  };
  
  // 检查是否为管理员
  const isAdmin = currentUser?.role === 'admin';
  
  // 检查是否有特定权限
  const hasPermission = (permission: string) => {
    // 管理员拥有所有权限
    if (isAdmin) return true;
    
    // 检查用户是否有指定权限
    return currentUser?.permissions?.includes(permission) || false;
  };
  
  // 提供认证上下文
  return (
    <AuthContext.Provider
      value={{ 
        isAuthenticated, 
        setIsAuthenticated, 
        currentUser,
        setCurrentUser,
        isAdmin,
        logout,
        hasPermission
      }}
    >
      <RouterProvider router={router} />
    </AuthContext.Provider>
  );
}
