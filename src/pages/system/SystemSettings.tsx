import { useState, useEffect } from 'react';
import { useThemeContext } from '../../contexts/ThemeContext';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';

// System settings page
const SystemSettings = () => {
  // Basic settings state
  const { theme, toggleTheme, isDark } = useThemeContext();
  const [themeLoaded, setThemeLoaded] = useState(false);
  // Load theme state on mount
  useEffect(() => {
    setThemeLoaded(true);
    
    // Listen for theme changes from outside settings
    const handleThemeChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.theme) {
        setThemeLoaded(false);
        setTimeout(() => setThemeLoaded(true), 0);
      }
    };
    
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, [theme]);
  
  // Settings state
  const [settings, setSettings] = useState({
    siteName: '车辆管理系统',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    notifications: true,
    dataBackup: 'daily' as 'daily' | 'weekly' | 'monthly'
  });
  
  // Sync theme state with settings
  useEffect(() => {
    setSettings(prev => ({ ...prev, theme }));
  }, [theme]);
  
  // Handle theme toggle
  const handleThemeToggle = () => {
    toggleTheme();
  };
  
  // Handle setting changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">系统设置</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">配置系统参数和偏好设置</p>
      </div>
      
      {/* Settings cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">基本设置</h2>
            
            <div className="space-y-4">
              {/* Site name */}
              <div>
                <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  系统名称
                </label>
                <input
                  type="text"
                  id="siteName"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                />
              </div>
              
              {/* Theme mode */}
              <div>
                <label htmlFor="theme" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  主题模式
                </label>
               <div className="flex items-center space-x-4">
                  <button
                    onClick={toggleTheme}
                    className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
                      theme === 'dark' 
                        ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    aria-label={theme === 'dark' ? '切换至浅色模式' : '切换至深色模式'}
                    disabled={!themeLoaded}
                  >
                    <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-xl`}></i>
                  </button>
                  <div>
                    <p className="text-sm font-medium">{theme === 'dark' ? '深色模式' : '浅色模式'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">当前主题模式</p>
                  </div>
                </div>
              </div>
              
              {/* Date format */}
              <div>
                <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  日期格式
                </label>
                <select
                  id="dateFormat"
                  name="dateFormat"
                  value={settings.dateFormat}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                >
                  <option value="YYYY-MM-DD">2025-09-07</option>
                  <option value="MM/DD/YYYY">09/07/2025</option>
                  <option value="DD/MM/YYYY">07/09/2025</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Notifications settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">通知设置</h2>
            
            <div className="space-y-4">
              {/* Notifications toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    启用通知
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    接收系统事件和提醒通知
                  </p>
                </div>
                <div className="relative inline-block w-10 align-middle select-none">
                  <input
                    type="checkbox"
                    name="notifications"
                    id="notifications"
                    checked={settings.notifications}
                    onChange={handleChange}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in transform translate-x-0 checked:translate-x-4 checked:border-blue-600"
                  />
                  <label
                    htmlFor="notifications"
                    className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer checked:bg-blue-600"
                  ></label>
                </div>
              </div>
              
              {/* Data backup frequency */}
              <div>
                <label htmlFor="dataBackup" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  数据备份频率
                </label>
                <select
                  id="dataBackup"
                  name="dataBackup"
                  value={settings.dataBackup}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                >
                  <option value="daily">每日</option>
                  <option value="weekly">每周</option>
                  <option value="monthly">每月</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Save button */}
      <div className="flex justify-end">
        <button
          type="button"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
        >
          <i className="fa-solid fa-save mr-2"></i>
          保存设置
        </button>
      </div>
    </div>
  );
};

export default SystemSettings;