import { useState } from 'react';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/authContext';
import { mockService } from '../services/mockService';
import { toast } from 'sonner';
import { useTheme } from '../hooks/useTheme';

// Login page component
const Login = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const { setIsAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!username || !password) {
      toast.error('请输入用户名和密码');
      return;
    }
    
    setLoading(true);
    
    try {
      // Attempt login through mock service
      const user = await mockService.login(username, password);
      
      if (user) {
        // Set authentication state
        setIsAuthenticated(true);
        
        // Store user data in localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Show success message
        toast.success('登录成功，欢迎回来！');
        
        // Redirect to dashboard
        navigate('/');
      } else {
        // Show error message for invalid credentials
        toast.error('用户名或密码不正确，请重试');
      }
    } catch (error) {
      // Show error message for login failure
      toast.error('登录失败，请稍后重试');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 transform hover:shadow-2xl`}>
          <div className="p-6 md:p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-car-side text-white text-2xl"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">车辆管理系统</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">请登录您的账户</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  用户名
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fa-solid fa-user text-gray-400"></i>
                  </div>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                    placeholder="输入用户名"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  密码
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fa-solid fa-lock text-gray-400"></i>
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                    placeholder="输入密码"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                  loading 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    登录中...
                  </>
                ) : (
                  '登录系统'
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>演示账号: admin / admin123</p>
              <p className="mt-1">普通用户: user1 / user123</p>
            </div>
          </div>
          
          <div className={`p-4 text-center text-sm ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
            <p>© 2025 车辆管理系统 - 版权所有</p>
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400 animate-fade-in">
          <p>使用先进的车辆管理解决方案，提升您的工作效率</p>
        </div>
      </div>
    </div>
  );
};

export default Login;