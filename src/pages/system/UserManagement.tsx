import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockService } from '../../services/mockService';
import { User } from '../../types';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/authContext';

// User management page
const UserManagement = () => {
  const { currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Fetch users on component mount and when users are updated
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await mockService.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Handle user deletion
  const handleDeleteUser = async (userId: string, username: string) => {
    // 不能删除自己
    if (userId === currentUser?.id) {
      toast.error('不能删除当前登录用户');
      return;
    }
    
    if (window.confirm(`确定要删除用户 ${username} 吗?`)) {
      try {
        await mockService.deleteUser(userId);
        toast.success(`用户 ${username} 已删除`);
        fetchUsers(); // Refresh user list
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('删除用户失败');
      }
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Page header with add button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">用户管理</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">管理系统用户账户和权限</p>
        </div>
        
        <button
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
          onClick={() => navigate('/system/users/new')}
        >
          <i className="fa-solid fa-plus mr-2"></i>
          添加新用户
        </button>
      </div>
      
      {/* Users table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          // Loading state
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">加载用户数据中...</p>
          </div>
        ) : users.length === 0 ? (
          // Empty state
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
              <i className="fa-solid fa-users text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">暂无用户数据</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              系统中没有用户记录。请添加新用户。
            </p>
            <button
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => navigate('/system/users/new')}
            >
              <i className="fa-solid fa-plus mr-2"></i>
              添加新用户
            </button>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm font-medium text-gray-500 dark:text-gray-400">
              <div className="col-span-2">用户名</div>
              <div className="col-span-2">姓名</div>
              <div className="col-span-2">角色</div>
              <div className="col-span-3">最后登录</div>
              <div className="col-span-2">状态</div>
              <div className="col-span-1 text-right">操作</div>
            </div>
            
            {/* Table rows */}
            <div className="divide-y dark:divide-gray-700">
              {users.map((user) => (
                <div key={user.id} className="group relative">
                  {/* Desktop view */}
                  <div className="hidden md:flex items-center px-6 py-4">
                    <div className="col-span-2 font-medium text-gray-900 dark:text-white">{user.username}</div>
                    <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400">{user.name}</div>
                    <div className="col-span-2">
                      <span className={cn(
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                        user.role === 'admin'
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      )}>
                        {user.role === 'admin' ? '管理员' : '普通用户'}
                      </span>
                    </div>
                    <div className="col-span-3 text-sm text-gray-500 dark:text-gray-400">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '从未登录'}
                    </div>
                    <div className="col-span-2">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        活跃
                      </span>
                    </div>
                    <div className="col-span-1 text-right flex justify-end space-x-2">
                      <button 
                        className="text-gray-400 hover:text-blue-600 transition-colors duration-200 p-1"
                        onClick={() => navigate(`/system/users/${user.id}/edit`)}
                        aria-label="编辑用户"
                      >
                        <i className="fa-solid fa-edit"></i>
                      </button>
                      <button 
                        className="text-gray-400 hover:text-red-600 transition-colors duration-200 p-1"
                        onClick={() => handleDeleteUser(user.id, user.username)}
                        aria-label="删除用户"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  
                  {/* Mobile view */}
                  <div className="md:hidden p-4 border-b dark:border-gray-700 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-gray-900 dark:text-white">{user.username}</div>
                      <span className={cn(
                        "text-xs font-medium px-2.5 py-0.5 rounded-full",
                        user.role === 'admin'
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      )}>
                        {user.role === 'admin' ? '管理员' : '普通用户'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-2 text-sm mb-3">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">姓名:</span> {user.name}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">状态:</span> 
                        <span className="text-green-600 dark:text-green-400">活跃</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500 dark:text-gray-400">最后登录:</span> 
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '从未登录'}
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button 
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200 p-1"
                        onClick={() => navigate(`/system/users/${user.id}/edit`)}
                      >
                        <i className="fa-solid fa-edit mr-1"></i> 编辑
                      </button>
                      <button 
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-200 p-1"
                        onClick={() => handleDeleteUser(user.id, user.username)}
                      >
                        <i className="fa-solid fa-trash mr-1"></i> 删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserManagement;