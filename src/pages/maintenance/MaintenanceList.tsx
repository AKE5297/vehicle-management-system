import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockService } from '../../services/mockService';
import { MaintenanceRecord } from '../../types';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import Button from '../../components/ui/Button';

// Maintenance list page with complete CRUD operations
const MaintenanceList = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  // Fetch maintenance records
  const fetchMaintenanceRecords = async () => {
    try {
      setLoading(true);
      const data = await mockService.getMaintenanceRecords();
      setMaintenanceRecords(data);
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
      toast.error('获取维修记录失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchMaintenanceRecords();
  }, []);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Handle maintenance record deletion
  const handleDeleteRecord = async (recordId: string) => {
    if (window.confirm(`确定要删除维修工单 #${recordId} 吗?`)) {
      try {
        await mockService.deleteMaintenanceRecord(recordId);
        toast.success(`维修工单 #${recordId} 已删除`);
        fetchMaintenanceRecords(); // Refresh the list
      } catch (error) {
        console.error('Error deleting maintenance record:', error);
        toast.error('删除维修记录失败，请重试');
      }
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">维修记录</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">查看和管理所有维修工单记录</p>
        </div>
        
        <Link
          to="/maintenance/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
        >
          <i className="fa-solid fa-plus mr-2"></i>
          创建维修单
        </Link>
      </div>
      
      {/* Search bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fa-solid fa-search text-gray-400"></i>
          </div>
          <input
            type="text"
            placeholder="搜索维修记录..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
          />
        </div>
      </div>
      
      {/* Maintenance records table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          // Loading state
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">加载维修记录中...</p>
          </div>
        ) : maintenanceRecords.length === 0 ? (
          // Empty state
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
              <i className="fa-solid fa-tools text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">暂无维修记录</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              没有找到维修记录。请创建新的维修工单。
            </p>
            <Link
              to="/maintenance/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
            >
              <i className="fa-solid fa-plus mr-2"></i>
              创建维修单
            </Link>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm font-medium text-gray-500 dark:text-gray-400">
              <div className="col-span-2">工单编号</div>
              <div className="col-span-2">车辆信息</div>
              <div className="col-span-2">进厂时间</div>
              <div className="col-span-2">出厂时间</div>
              <div className="col-span-2">维修类型</div>
              <div className="col-span-2 text-right">操作</div>
            </div>
            
            {/* Table rows */}
            <div className="divide-y dark:divide-gray-700">
              {maintenanceRecords.map((record) => (
                <div 
                  key={record.id} 
                  className="group relative"
                >
                  {/* Mobile view */}
                  <div className="md:hidden p-4 border-b dark:border-gray-700 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-gray-900 dark:text-white">工单 #{record.id}</div>
                      <span className={cn(
                        "text-xs font-medium px-2.5 py-0.5 rounded-full",
                        record.status === 'completed' 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                          : record.status === 'pending'
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      )}>
                        {record.status === 'completed' ? '已完成' : record.status === 'pending' ? '待处理' : '处理中'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-2 text-sm mb-3">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">进厂时间:</span> {formatDate(record.entryTime)}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">维修类型:</span> {record.type === 'maintenance' ? '常规保养' : record.type === 'accident' ? '事故维修' : '故障维修'}
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="edit"
                        size="sm"
                        icon="fa-edit"
                        onClick={() => navigate(`/maintenance/${record.id}/edit`)}
                      >
                        编辑
                      </Button>
                      <Button
                        variant="delete"
                        size="sm"
                        icon="fa-trash"
                        onClick={() => handleDeleteRecord(record.id)}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                  
                  {/* Desktop view */}
                  <div className="hidden md:flex items-center px-6 py-4">
                    <div className="col-span-2 font-medium text-gray-900 dark:text-white">工单 #{record.id}</div>
                    <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400">车辆 #{record.vehicleId}</div>
                    <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400">{formatDate(record.entryTime)}</div>
                    <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400">{record.exitTime ? formatDate(record.exitTime) : '-'}</div>
                    <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400">
                      {record.type === 'maintenance' ? '常规保养' : record.type === 'accident' ? '事故维修' : '故障维修'}
                    </div>
                     <div className="col-span-2 flex justify-end space-x-3">
                      <button
                        onClick={() => navigate(`/maintenance/${record.id}`)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200"
                      >
                        <i className="fa-solid fa-eye mr-1.5"></i> 查看
                      </button>
                      <button
                        onClick={() => navigate(`/maintenance/${record.id}/edit`)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition duration-200"
                      >
                        <i className="fa-solid fa-pen mr-1.5"></i> 编辑
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-800/30 transition duration-200"
                      >
                        <i className="fa-solid fa-trash mr-1.5"></i> 删除
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
}

export default MaintenanceList;