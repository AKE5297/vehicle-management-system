import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockService } from '../../services/mockService';
import { MaintenanceRecord } from '../../types';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

// Maintenance detail component for viewing maintenance records
const MaintenanceDetail = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [maintenance, setMaintenance] = useState<MaintenanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch maintenance details
  const fetchMaintenance = async () => {
    if (!id) {
      toast.error('无效的维修记录ID');
      navigate('/maintenance');
      return;
    }
    
    try {
      setLoading(true);
      const data = await mockService.getMaintenanceRecordById(id);
      
      if (data) {
        setMaintenance(data);
      } else {
        toast.error('未找到维修记录信息');
        navigate('/maintenance');
      }
    } catch (error) {
      console.error('Error fetching maintenance details:', error);
      toast.error('获取维修记录详情失败');
      navigate('/maintenance');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchMaintenance();
  }, [id, navigate]);
  
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
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">加载维修记录详情中...</p>
      </div>
    );
  }
  
  if (!maintenance) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      {/* Page header with back button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">维修工单 #{maintenance.id}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            车辆 #{maintenance.vehicleId} · {maintenance.type === 'maintenance' ? '常规保养' : maintenance.type === 'accident' ? '事故维修' : '故障维修'}
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/maintenance')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>返回列表
          </button>
          
          <button
            onClick={() => navigate(`/maintenance/${maintenance.id}/edit`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow"
          >
            <i className="fa-solid fa-edit mr-2"></i>编辑维修单
          </button>
        </div>
      </div>
      
      {/* Maintenance status badge */}
      <div className="flex items-center">
        <span className={cn(
          "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
          maintenance.status === 'completed'
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            : maintenance.status === 'in-progress'
            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            : maintenance.status === 'pending'
            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
        )}>
          {maintenance.status === 'completed' ? '已完成' : 
           maintenance.status === 'in-progress' ? '维修中' : 
           maintenance.status === 'pending' ? '待处理' : '已取消'}
        </span>
        
        <span className={cn(
          "ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
          maintenance.type === 'maintenance'
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            : maintenance.type === 'accident'
            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
        )}>
          {maintenance.type === 'maintenance' ? '常规保养' : 
           maintenance.type === 'accident' ? '事故维修' : '故障维修'}
        </span>
      </div>
      
      {/* Time information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">时间信息</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">进厂时间</p>
                <p className="font-medium">{formatDate(maintenance.entryTime)}</p>
              </div>
              
              {maintenance.exitTime && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">出厂时间</p>
                  <p className="font-medium">{formatDate(maintenance.exitTime!)}</p>
                </div>
              )}
              
              {maintenance.entryTime && maintenance.exitTime && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">维修时长</p>
                  <p className="font-medium">{calculateDuration(maintenance.entryTime, maintenance.exitTime)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Cost information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">费用信息</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">配件费用</p>
                <p className="font-medium">¥{calculatePartsCost().toFixed(2)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">工时费用</p>
                <p className="font-medium">¥{maintenance.laborCost.toFixed(2)}</p>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">总费用</p>
                <p className="font-bold text-lg text-blue-600 dark:text-blue-400">¥{maintenance.totalCost.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Parts information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">配件信息</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">配件名称</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">数量</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">单价</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">金额</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {maintenance.parts.map((part) => (
                  <tr key={part.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{part.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{part.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">¥{part.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">¥{(part.quantity * part.price).toFixed(2)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 dark:text-gray-400 text-right">配件总计:</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">¥{calculatePartsCost().toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Notes section */}
      {maintenance.notes && maintenance.notes.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">维修备注</h2>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-900 dark:text-white">{maintenance.notes}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Photos section */}
      {maintenance.photos && maintenance.photos.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">维修照片</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {maintenance.photos.map((photo, index) => (
                <div key={index} className="rounded-lg overflow-hidden">
                  <img
                    src={photo}
                    alt={`维修照片 ${index + 1}`}
                    className="w-full h-48 object-cover"
                      onError={(e) => {
                        // 图片加载失败时显示默认图标
                        const target = e.target as HTMLImageElement;
                        target.src = "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Maintenance%20placeholder%20image&sign=861e58bf3c43da635839d1762bcce6a6";
                      }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  // Calculate total parts cost
  function calculatePartsCost() {
    return maintenance.parts.reduce((sum, part) => sum + (part.quantity * part.price), 0);
  }
  
  // Calculate duration between entry and exit
  function calculateDuration(entryTime: string, exitTime?: string) {
    if (!exitTime) return "维修中";
    
    const entry = new Date(entryTime);
    const exit = new Date(exitTime);
    const diffMs = exit.getTime() - entry.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}天${diffHours}小时`;
    } else {
      return `${diffHours}小时`;
    }
  }
};

export default MaintenanceDetail;