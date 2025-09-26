import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/authContext';
import { toast } from 'sonner';
import { mockService } from '../services/mockService';
import { useTheme } from '../hooks/useTheme';

// 登录页面组件
const Login = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const { setIsAuthenticated, setCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  
  // 从导航状态获取重定向路径
  const from = location.state?.from?.pathname || '/';
  
  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 基本验证
    if (!username || !password) {
      toast.error('请输入用户名和密码');
      return;
    }
    
    setLoading(true);
    
    try {
      // 使用模拟服务进行登录
      const user = await mockService.login(username, password, {useMock: true});
      
      if (user) {
        // 设置认证状态
        setIsAuthenticated(true);
        setCurrentUser(user);
        
        // 保存用户数据到本地存储
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // 如果用户有令牌，单独存储
        if (user.token) {
          localStorage.setItem('authToken', user.token);
        }
        
        // 显示成功消息
        toast.success(`欢迎回来，${user.name || user.username}`);
        
        // 重定向到登录前的页面或首页
        navigate(from, { replace: true });
      } else {
        // 显示无效凭据错误
        toast.error('用户名或密码不正确，请重试');
      }
    } catch (error) {
      // 显示登录失败错误
      toast.error('登录失败，请稍后重试');
      console.error('Login error:', error);
    } finally {
      // 确保无论如何都会设置loading为false
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };
  
  // 初始化检查
  useEffect(() => {
    // 检查是否已有用户数据
    const checkInitialization = async () => {
      try {
        const users = await mockService.getUsers();
        if (users.length === 0) {
          console.log('初始化模拟数据...');
        }
      } catch (error) {
        console.error('初始化检查失败:', error);
      }
    };
    
    checkInitialization();
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 transform hover:shadow-2xl">
          <div className="p-6 md:p-8">
            <div className="text-center mb-8">
              {/* 网站Logo和名称 */}
              <div className="flex flex-col items-center">
                {localStorage.getItem('siteSettings') && JSON.parse(localStorage.getItem('siteSettings') || '{}').logo ? (
                  <div className="mb-4">
                    <img 
                      src={JSON.parse(localStorage.getItem('siteSettings') || '{}').logo} 
                      alt="网站Logo" 
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                    <i className="fa-solid fa-car-side text-white text-2xl"></i>
                  </div>
                )}
                <h2 className="text-2xl font-bold">
                  {localStorage.getItem('siteSettings') ? JSON.parse(localStorage.getItem('siteSettings') || '{}').siteName : '车辆管理系统'}
                </h2>
                <p className="mt-2">请登录您的账户</p>
              </div>
            </div>
            
            {/* 登录表单 */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-1">
                  用户名
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fa-solid fa-user"></i>
                  </div>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                    placeholder="输入用户名"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  密码
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fa-solid fa-lock"></i>
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
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
            
             {/* 账号信息请查看README.md文件 */}
          </div>
          
          {/* 页脚 */}
          <div className={`p-4 text-center text-sm bg-gray-50 dark:bg-gray-700`}>
            <p>© 2025 车辆管理系统 - 版权所有</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;