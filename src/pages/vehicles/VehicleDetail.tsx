import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockService } from '../../services/mockService';
import { Vehicle } from '../../types';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

// Vehicle detail component for viewing individual vehicle information
const VehicleDetail = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch vehicle details
  const fetchVehicle = async () => {
    if (!id) {
      toast.error('无效的车辆ID');
      navigate('/vehicles');
      return;
    }
    
    try {
      setLoading(true);
      const data = await mockService.getVehicleById(id);
      
      if (data) {
        setVehicle(data);
      } else {
        toast.error('未找到车辆信息');
        navigate('/vehicles');
      }
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
      toast.error('获取车辆详情失败');
      navigate('/vehicles');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchVehicle();
  }, [id, navigate]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Calculate stay duration
  const calculateDuration = (entryTime: string, exitTime?: string) => {
    const entry = new Date(entryTime);
    const exit = exitTime ? new Date(exitTime) : new Date();
    
    const diffMs = exit.getTime() - entry.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}天${diffHours}小时`;
    } else {
      return `${diffHours}小时`;
    }
  };
  
  // Format vehicle type for display
  const formatVehicleType = (type: string) => {
    switch (type) {
      case 'sedan': return '轿车';
      case 'suv': return 'SUV';
      case 'truck': return '货车';
      default: return '其他';
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">加载车辆详情中...</p>
      </div>
    );
  }
  
  if (!vehicle) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      {/* Page header with back button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{vehicle.licensePlate}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {vehicle.brand} {vehicle.model} · {formatVehicleType(vehicle.vehicleType)}
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/vehicles')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>返回列表
          </button>
          
          <button
            onClick={() => navigate(`/vehicles/${vehicle.id}/edit`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow"
          >
            <i className="fa-solid fa-edit mr-2"></i>编辑车辆
          </button>
        </div>
      </div>
      
      {/* Vehicle status badge */}
      <div className="flex items-center">
        <span className={cn(
          "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
          vehicle.status === 'in'
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
        )}>
          <i className={`fa-solid ${vehicle.status === 'in' ? 'fa-circle text-xs mr-1.5' : 'fa-circle text-xs mr-1.5'}`}></i>
          {vehicle.status === 'in' ? '在场中' : '已离场'}
        </span>
        
        {vehicle.serviceType && (
          <span className={cn(
            "ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
            vehicle.serviceType === 'maintenance'
              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
          )}>
            <i className={`fa-solid ${vehicle.serviceType === 'maintenance' ? 'fa-wrench mr-1.5' : 'fa-file-invoice mr-1.5'}`}></i>
            {vehicle.serviceType === 'maintenance' ? '维修服务' : '保险理赔'}
          </span>
        )}
      </div>
      
      {/* Vehicle images gallery */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">车辆照片</h2>
          
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehicle.photos && vehicle.photos.length > 0 ? (
                vehicle.photos.map((photo, index) => (
                  <div key={index} className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 aspect-video">
                    <img
                      src={photo}
                      alt={`${vehicle.licensePlate} - 照片 ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        // 图片加载失败时显示默认图标
                        const target = e.target as HTMLImageElement;
                        target.src = "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Car%20placeholder%20image&sign=046ca8763b5b7acb3a4ab7a4d8df730b";
                      }}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                  <i className="fa-solid fa-image text-4xl mb-2"></i>
                  <p>暂无车辆照片</p>
                </div>
              )}
          </div>
        </div>
      </div>
      
      {/* Vehicle information cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">基本信息</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">车牌号</p>
                  <p className="font-medium">{vehicle.licensePlate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">品牌</p>
                  <p className="font-medium">{vehicle.brand}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">车型</p>
                  <p className="font-medium">{vehicle.model}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">车辆类型</p>
                  <p className="font-medium">{formatVehicleType(vehicle.vehicleType)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">VIN码</p>
                  <p className="font-medium text-sm truncate">{vehicle.vin || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">停留时间</p>
                  <p className="font-medium">{calculateDuration(vehicle.entryTime, vehicle.exitTime)}</p>
                </div>
              </div>
              
              {vehicle.vin && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">完整VIN码</p>
                  <p className="font-mono text-sm bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">{vehicle.vin}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Time information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">时间记录</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">进场时间</p>
                <p className="font-medium">{formatDate(vehicle.entryTime)}</p>
                
                {vehicle.entryPhoto && (
                  <div className="mt-2 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 max-w-xs">
                    <img
                      src={vehicle.entryPhoto}
                      alt="进场照片"
                      className="w-full h-auto"
                    />
                  </div>
                )}
              </div>
              
              {vehicle.status === 'out' && vehicle.exitTime && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">离场时间</p>
                  <p className="font-medium">{formatDate(vehicle.exitTime)}</p>
                  
                  {vehicle.exitPhoto && (
                    <div className="mt-2 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 max-w-xs">
                      <img
                        src={vehicle.exitPhoto}
                        alt="离场照片"
                        className="w-full h-auto"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Notes section */}
      {vehicle.notes && vehicle.notes.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">备注信息</h2>
            
            <div className="space-y-4">
              {vehicle.notes.map(note => (
                <div key={note.id} className="border-l-4 border-blue-500 pl-4 py-1">
                  <p className="text-gray-900 dark:text-white">{note.content}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDate(note.createdAt)}</p>
                  
                  {note.photo && (
                    <div className="mt-2 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 max-w-xs">
                      <img
                        src={note.photo}
                        alt="备注照片"
                        className="w-full h-auto"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDetail;