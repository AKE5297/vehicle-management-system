import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/authContext';
import { useThemeContext } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';

// 主布局组件，管理主题和导航
const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme, toggleTheme } = useThemeContext();
  const { isAuthenticated, logout, isAdmin, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // 处理退出登录
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // 根据用户角色生成侧边栏导航项
  const navItems = [
    { label: '首页', path: '/', icon: 'fa-home' },
    { label: '车辆管理', path: '/vehicles', icon: 'fa-car' },
    { label: '发票管理', path: '/invoices', icon: 'fa-file-invoice-dollar' },
    { label: '维修记录', path: '/maintenance', icon: 'fa-tools' },
    { label: '数据管理', path: '/data-management', icon: 'fa-database' },
    // 只有管理员可以看到系统管理相关菜单
    ...(isAdmin ? [
      { label: '系统设置', path: '/system/settings', icon: 'fa-cog' },
      { label: '用户管理', path: '/system/users', icon: 'fa-users' },
    ] : [])
  ];
  
  return (
    <div className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'dark' : ''}`}>
      {/* 侧边栏 */}
      <aside 
        className={cn(
          "shadow-md transition-all duration-300 ease-in-out z-10 transform hover:shadow-lg",
          sidebarOpen ? "w-64 translate-x-0" : "w-20 -translate-x-0",
          "hidden md:block border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        )}
      >
        {/* 侧边栏头部 */}
        <div className="flex items-center justify-between h-16 px-4 border-b dark:border-gray-700">
          <div className={cn("flex items-center space-x-2", !sidebarOpen && "justify-center w-full")}>
            {/* 网站Logo */}
            <div className="relative">
              {localStorage.getItem('siteSettings') && JSON.parse(localStorage.getItem('siteSettings') || '{}').logo ? (
                <img 
                  src={JSON.parse(localStorage.getItem('siteSettings') || '{}').logo} 
                  alt="网站Logo" 
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <i className="fa-solid fa-car-side text-blue-600 text-xl"></i>
              )}
            </div>
            {/* 网站名称 */}
            {sidebarOpen && (
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                {localStorage.getItem('siteSettings') ? JSON.parse(localStorage.getItem('siteSettings') || '{}').siteName : '车辆管理系统'}
              </h1>
            )}
          </div>
          {/* 侧边栏折叠按钮 */}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
            aria-label={sidebarOpen ? '收起侧边栏' : '展开侧边栏'}
          >
            <i className={`fa-solid ${sidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
          </button>
        </div>
        
        {/* 侧边栏导航 */}
        <nav className="p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                    "hover:bg-gray-100 dark:hover:bg-gray-700",
                    "text-gray-700 dark:text-gray-300",
                    "group"
                  )}
                  aria-label={item.label}
                >
                  <i className={`fa-solid ${item.icon} w-6 text-center`}></i>
                  {sidebarOpen && (
                    <span className="ml-3">{item.label}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      
      {/* 移动端侧边栏切换按钮 */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-110 active:scale-95"
          aria-label="切换侧边栏"
        >
          <i className="fa-solid fa-bars text-xl"></i>
        </button>
      </div>
      
      {/* 移动端侧边栏遮罩 */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}
      
      {/* 主内容区域 */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* 页面头部 */}
        <header className="shadow-sm z-10 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 md:hidden"
                aria-label="切换侧边栏"
              >
                <i className="fa-solid fa-bars"></i>
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* 主题切换按钮 */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-all duration-200"
                aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
              >
                <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
              </button>
              
              {/* 用户菜单 */}
              <div className="relative group">
                <button 
                  className="flex items-center space-x-2 focus:outline-none"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <i className="fa-solid fa-user"></i>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:inline-block">
                      {currentUser?.name || (isAdmin ? '管理员' : '普通用户')}
                    </span>
                    <i className="fa-solid fa-chevron-down text-xs text-gray-500 dark:text-gray-400"></i>
                  </button>
                
                {/* 下拉菜单 */}
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right group-hover:scale-100 scale-95 bg-white dark:bg-gray-700">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <i className="fa-solid fa-sign-out-alt mr-2 w-5 text-center"></i>
                    退出登录
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* 页面内容 */}
         <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
           <Outlet />
         </main>
      </div>
    </div>
  );
};

export default MainLayout;