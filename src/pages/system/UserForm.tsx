import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockService } from '../../services/mockService';
import { User } from '../../types';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

// User form component for creating and editing users
const UserForm = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // Form state
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'user' as 'admin' | 'user',
    permissions: [] as string[]
  });
  
  // Permission options
  const permissionOptions = [
    { id: 'vehicle:read', name: '查看车辆' },
    { id: 'vehicle:create', name: '创建车辆' },
    { id: 'vehicle:update', name: '编辑车辆' },
    { id: 'vehicle:delete', name: '删除车辆' },
    { id: 'invoice:read', name: '查看发票' },
    { id: 'invoice:create', name: '创建发票' },
    { id: 'invoice:update', name: '编辑发票' },
    { id: 'invoice:delete', name: '删除发票' },
    { id: 'maintenance:read', name: '查看维修记录' },
    { id: 'maintenance:create', name: '创建维修记录' },
    { id: 'maintenance:update', name: '编辑维修记录' },
    { id: 'maintenance:delete', name: '删除维修记录' },
    { id: 'user:read', name: '查看用户' },
    { id: 'user:create', name: '创建用户' },
    { id: 'user:update', name: '编辑用户' },
    { id: 'user:delete', name: '删除用户' },
    { id: 'system:settings', name: '系统设置' },
    { id: 'data:export', name: '数据导出' }
  ];
  
  // Fetch user data for edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchUser = async () => {
        try {
          setLoading(true);
          // In a real application, we would fetch the user data
          // For this mock, we'll simulate it
          const users = await mockService.getUsers();
          const user = users.find(u => u.id === id);
          
          if (user) {
            setFormData({
              username: user.username,
              password: '', // Don't pre-fill password for security
              name: user.name,
              role: user.role,
              permissions: user.permissions || []
            });
          } else {
            toast.error('未找到用户信息');
            navigate('/system/users');
          }
        } catch (error) {
          console.error('Error fetching user:', error);
          toast.error('获取用户信息失败');
          navigate('/system/users');
        } finally {
          setLoading(false);
        }
      };
      
      fetchUser();
    }
  }, [id, isEditMode, navigate]);
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Special handling for role change
    if (name === 'role') {
      // Admin gets all permissions
      if (value === 'admin') {
        setFormData(prev => ({
          ...prev,
          role: 'admin',
          permissions: permissionOptions.map(option => option.id)
        }));
      }
    }
  };
  
  // Handle permission toggle
  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => {
      const permissions = prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId];
        
      return { ...prev, permissions };
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.username.trim()) {
      toast.error('用户名不能为空');
      return;
    }
    
    if (!formData.name.trim()) {
      toast.error('姓名不能为空');
      return;
    }
    
    if (!isEditMode && !formData.password.trim()) {
      toast.error('密码不能为空');
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (isEditMode && id) {
        // Update existing user
        await mockService.updateUser(id, formData);
        toast.success('用户信息更新成功');
      } else {
        // Create new user
        await mockService.createUser(formData);
        toast.success('新用户添加成功');
      }
      
      navigate('/system/users');
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('保存用户信息失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">加载用户信息中...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {isEditMode ? '编辑用户' : '添加新用户'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {isEditMode ? '修改用户的基本信息和权限设置' : '创建新用户并设置权限'}
        </p>
      </div>
      
      {/* Form card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                用户名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="输入用户名"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                required
                disabled={isEditMode} // Username cannot be changed
              />
              {isEditMode && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">用户名不可修改</p>
              )}
            </div>
            
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                密码 {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={isEditMode ? "留空则不修改密码" : "输入密码"}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                {...(!isEditMode && { required: true })}
              />
            </div>
            
            {/* Full name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="输入姓名"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                required
              />
            </div>
            
            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                用户角色 <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                required
              >
                <option value="user">普通用户</option>
                <option value="admin">管理员</option>
              </select>
            </div>
          </div>
          
          {/* Permissions section */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              权限设置
            </h2>
            
            {formData.role === 'admin' ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  管理员拥有系统所有权限，无需单独设置
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {permissionOptions.map(permission => (
                  <label key={permission.id} className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(permission.id)}
                      onChange={() => handlePermissionToggle(permission.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-700"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">{permission.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          
          {/* Form actions */}
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/system/users')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  保存中...
                </>
              ) : (
                isEditMode ? '更新用户' : '创建用户'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;