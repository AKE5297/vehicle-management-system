import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/authContext';
import { cn } from '../../lib/utils';
import { useTheme } from '@/hooks/useTheme';

// Main layout component for authenticated users
const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Navigation items for the sidebar
  const navItems = [
    { label: '首页', path: '/', icon: 'fa-home' },
    { label: '车辆管理', path: '/vehicles', icon: 'fa-car' },
    { label: '发票管理', path: '/invoices', icon: 'fa-file-invoice-dollar' },
    { label: '维修记录', path: '/maintenance', icon: 'fa-tools' },
    { label: '数据管理', path: '/data-management', icon: 'fa-database' },
    { label: '系统设置', path: '/system/settings', icon: 'fa-cog' },
    { label: '用户管理', path: '/system/users', icon: 'fa-users' },
  ];
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white dark:bg-gray-800 shadow-md transition-all duration-300 ease-in-out z-10 transform hover:shadow-lg",
          sidebarOpen ? "w-64 translate-x-0" : "w-20 -translate-x-0",
          "hidden md:block border-r border-gray-200 dark:border-gray-700"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b dark:border-gray-700">
          <div className={cn("flex items-center space-x-2", !sidebarOpen && "justify-center w-full")}>
            <i className="fa-solid fa-car-side text-blue-600 text-xl"></i>
            {sidebarOpen && <h1 className="text-lg font-bold text-gray-800 dark:text-white">车辆管理系统</h1>}
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
          >
            <i className={`fa-solid ${sidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
          </button>
        </div>
        
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
      
      {/* Mobile sidebar toggle button */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-110 active:scale-95"
          aria-label="Toggle sidebar"
        >
          <i className="fa-solid fa-bars text-xl"></i>
        </button>
      </div>
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 md:hidden"
              >
                <i className="fa-solid fa-bars"></i>
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Theme toggle button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
              </button>
              
              {/* User menu */}
              <div className="relative group">
                <button className="flex items-center space-x-2 focus:outline-none">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <i className="fa-solid fa-user"></i>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:inline-block">管理员</span>
                  <i className="fa-solid fa-chevron-down text-xs text-gray-500 dark:text-gray-400"></i>
                </button>
                
                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right group-hover:scale-100 scale-95">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <i className="fa-solid fa-sign-out-alt mr-2 w-5 text-center"></i>
                    退出登录
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-6 transition-colors duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;