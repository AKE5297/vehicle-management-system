import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from './components/layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import VehicleList from './pages/vehicles/VehicleList';
import VehicleForm from './pages/vehicles/VehicleForm';
import VehicleDetail from './pages/vehicles/VehicleDetail';
import InvoiceList from './pages/invoices/InvoiceList';
import InvoiceForm from './pages/invoices/InvoiceForm';
import MaintenanceList from './pages/maintenance/MaintenanceList';
import InvoiceDetail from './pages/invoices/InvoiceDetail';
import MaintenanceForm from './pages/maintenance/MaintenanceForm';
import MaintenanceDetail from './pages/maintenance/MaintenanceDetail';
import DataManagement from './pages/data-management/DataManagement';
import SystemSettings from './pages/system/SystemSettings';
import UserManagement from './pages/system/UserManagement';
import UserForm from './pages/system/UserForm';
import ProtectedRoute from './components/ProtectedRoute';

// 路由配置
const router = createBrowserRouter([
  // 登录路由
  {
    path: '/login',
    element: <Login />
  },
  
  // 受保护的主路由
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      // 首页
      {
        path: '/',
        element: <Home />
      },
      
      // 车辆管理
      {
        path: 'vehicles',
        element: <VehicleList />
      },
      {
        path: 'vehicles/new',
        element: <VehicleForm />
      },
      {
        path: 'vehicles/:id',
        element: <VehicleDetail />
      },
      {
        path: 'vehicles/:id/edit',
        element: <VehicleForm />
      },
      
      // 发票管理
      {
        path: 'invoices',
        element: <InvoiceList />
      },
      {
        path: 'invoices/new',
        element: <InvoiceForm />
      },
      {
        path: 'invoices/:id',
        element: <InvoiceDetail />
      },
      {
        path: 'invoices/:id/edit',
        element: <InvoiceForm />
      },
      
      // 维修记录
      {
        path: 'maintenance',
        element: <MaintenanceList />
      },
      {
        path: 'maintenance/new',
        element: <MaintenanceForm />
      },
      {
        path: 'maintenance/:id',
        element: <MaintenanceDetail />
      },
      {
        path: 'maintenance/:id/edit',
        element: <MaintenanceForm />
      },
      
       // 数据管理
      {
        path: 'data-management',
        element: <DataManagement />
      },
      
      // 系统设置 - 只有管理员可以访问
      {
        path: 'system/settings',
        element: (
          <ProtectedRoute requiredRole="admin">
            <SystemSettings />
          </ProtectedRoute>
        )
      },
      
      // 用户管理 - 只有管理员可以访问
      {
        path: 'system/users',
        element: (
          <ProtectedRoute requiredRole="admin">
            <UserManagement />
          </ProtectedRoute>
        )
      },
      {
        path: 'system/users/new',
        element: <UserForm />
      },
      {
        path: 'system/users/:id/edit',
        element: <UserForm />
      }
    ]
  },
  
  // 404重定向
  {
    path: '*',
    element: <Navigate to="/login" replace />
  }
]);

export default router;