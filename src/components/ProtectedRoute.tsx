import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/authContext';

// 受保护路由组件，增加了角色和权限检查
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
  requiredPermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requiredPermission
}) => {
  const { isAuthenticated, isAdmin, hasPermission } = useContext(AuthContext);
  const location = useLocation();
  
  // 检查是否已认证
  if (!isAuthenticated) {
    // 如果未认证，重定向到登录页面，并保存当前位置以便登录后返回
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // 检查是否要求管理员角色
  if (requiredRole === 'admin' && !isAdmin) {
    // 非管理员试图访问管理员页面，重定向到首页
    return <Navigate to="/" replace />;
  }
  
  // 检查是否要求特定权限
  if (requiredPermission && !hasPermission(requiredPermission)) {
    // 没有所需权限，重定向到首页
    return <Navigate to="/" replace />;
  }
  
  // 已认证并且满足角色/权限要求，渲染受保护内容
  return <>{children}</>;
};

export default ProtectedRoute;