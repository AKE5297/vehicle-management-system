import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from './components/layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import VehicleList from './pages/vehicles/VehicleList';
import VehicleDetail from './pages/vehicles/VehicleDetail';
import VehicleForm from './pages/vehicles/VehicleForm';
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

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/',
        element: <Home />
      },
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
      {
        path: 'data-management',
        element: <DataManagement />
      },
      {
        path: 'system/settings',
        element: <SystemSettings />
      },
      {
        path: 'system/users',
        element: <UserManagement />
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
  {
    path: '/runtime/',
    element: <Navigate to="/" replace />
  }
]);

export default router;