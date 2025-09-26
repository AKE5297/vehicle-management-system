import { useState, useEffect } from 'react';
import { useThemeContext } from '../../contexts/ThemeContext';
import { toast } from 'sonner';

// 系统设置页面
const SystemSettings = () => {
  // 获取主题
  const { theme, toggleTheme } = useThemeContext();
  
  // 设置状态
  const [settings, setSettings] = useState({
    siteName: '车辆管理系统',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    notifications: true,
    dataBackup: 'daily' as 'daily' | 'weekly' | 'monthly',
    maxBackups: 30,
    backupEnabled: true,
    logo: ''
  });// 从本地存储加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('siteSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prev => ({ 
          ...prev, 
          siteName: parsedSettings.siteName || prev.siteName,
          logo: parsedSettings.logo || prev.logo
        }));
        // 立即应用网站名称
        if (parsedSettings.siteName) {
          document.title = parsedSettings.siteName;
        }
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  }, []);
  
  // 处理设置变更
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };
  
  // 处理Logo上传
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 验证文件类型
    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
      toast.error('仅支持JPG和PNG格式的图片');
      return;
    }
    
    // 验证文件大小（2MB限制）
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast.error('图片大小不能超过2MB');
      return;
    }
    
    // 读取文件并显示预览
    const reader = new FileReader();
    reader.onload = function(e) {
      const imageUrl = e.target?.result as string;
      setSettings(prev => ({ ...prev, logo: imageUrl }));
    };
    reader.readAsDataURL(file);
  };
  
  // 删除Logo
  const handleRemoveLogo = () => {
    setSettings(prev => ({ ...prev, logo: '' }));
  };
  
  // 保存设置
  const handleSaveSettings = () => {
    // 保存设置到本地存储
    localStorage.setItem('siteSettings', JSON.stringify({
      siteName: settings.siteName,
      logo: settings.logo,
      updatedAt: new Date().toISOString()
    }));
    
    // 保存到系统设置中
    localStorage.setItem('systemSettings', JSON.stringify(settings));
    
    // 如果更改了网站名称，更新应用标题
    if (document.title !== settings.siteName) {
      document.title = settings.siteName;
    }
    
    // 显示成功消息
    toast.success('设置保存成功');
    
    // 应用设置（广播通知其他组件）
    const event = new CustomEvent('siteSettingsChanged', { detail: settings });
    window.dispatchEvent(event);
  };
  
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold">系统设置</h1>
        <p className="text-sm mt-1">配置系统参数和偏好设置</p>
      </div>
      
      {/* 设置卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 基本设置卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">基本设置</h2>
            
            <div className="space-y-4">
              {/* 网站名称 */}
              <div>
                <label htmlFor="siteName" className="block text-sm font-medium mb-1">
                  网站名称
                </label>
                <input
                  type="text"
                  id="siteName"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  placeholder="输入网站名称"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
              
              {/* 网站Logo上传 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  网站Logo
                </label>
                <div className="mt-2">
                  {settings.logo ? (
                    <div className="relative group">
                      <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                        <img 
                          src={settings.logo} 
                          alt="网站Logo" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute top-2 right-2 bg-white/80 dark:bg-gray-800/80 p-1.5 rounded-full opacity-0 group-hover:opacity-100"
                      >
                        <i className="fa-solid fa-trash text-red-500"></i>
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500">
                      <input
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label htmlFor="logo-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center justify-center py-6">
                          <i className="fa-solid fa-cloud-upload-alt text-2xl mb-2"></i>
                          <span className="text-sm">点击上传Logo图片</span>
                          <p className="text-xs mt-1">支持PNG、JPG格式，最大2MB</p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 主题模式切换 */}
              <div>
                <label className="block text-sm font-medium mb-1">
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
                  >
                    <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-xl`}></i>
                  </button>
                  <div>
                    <p className="text-sm font-medium">{theme === 'dark' ? '深色模式' : '浅色模式'}</p>
                    <p className="text-xs mt-1">当前主题模式</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 通知和备份设置 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">高级设置</h2>
            
            <div className="space-y-4">
              {/* 通知开关 */}
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium">
                      启用通知
                    </label>
                    <p className="text-xs mt-0.5">
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
                      className="absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in transform translate-x-0 checked:translate-x-4 checked:border-blue-600"
                    />
                    <label
                      htmlFor="notifications"
                      className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer checked:bg-blue-600"
                    ></label>
                  </div>
                </div>
              </div>
              
              {/* 数据备份频率 */}
              <div>
                <label htmlFor="dataBackup" className="block text-sm font-medium mb-1">
                  数据备份频率
                </label>
                <select
                  id="dataBackup"
                  name="dataBackup"
                  value={settings.dataBackup}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  <option value="daily">每日</option>
                  <option value="weekly">每周</option>
                  <option value="monthly">每月</option>
                </select>
              </div>
              
              {/* 最大备份数量 */}
              <div>
                <label htmlFor="maxBackups" className="block text-sm font-medium mb-1">
                  最大备份数量
                </label>
                <input
                  type="number"
                  id="maxBackups"
                  name="maxBackups"
                  value={settings.maxBackups}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
              
              {/* 备份开关 */}
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium">
                      自动备份
                    </label>
                    <p className="text-xs mt-0.5">
                      启用定时自动备份功能
                    </p>
                  </div>
                  <div className="relative inline-block w-10 align-middle select-none">
                    <input
                      type="checkbox"
                      name="backupEnabled"
                      id="backupEnabled"
                      checked={settings.backupEnabled}
                      onChange={handleChange}
                      className="absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in transform translate-x-0 checked:translate-x-4 checked:border-blue-600"
                    />
                    <label
                      htmlFor="backupEnabled"
                      className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer checked:bg-blue-600"
                    ></label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 保存按钮 */}
      <div className="flex justify-end">
        <button
          type="button"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
          onClick={handleSaveSettings}
        >
          <i className="fa-solid fa-save mr-2"></i>
          保存设置
        </button>
      </div>
    </div>
  );
};

export default SystemSettings;