import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockService } from '../../services/mockService';
import { Vehicle } from '../../types';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';

// Vehicle list page with search, filter and pagination
const VehicleList = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterService, setFilterService] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [vehiclesPerPage] = useState(10);
  
  // Handle vehicle deletion
  const handleDeleteVehicle = async (vehicleId: string, licensePlate: string) => {
    if (window.confirm(`确定要删除车辆 ${licensePlate} 吗?`)) {
      try {
        await mockService.deleteVehicle(vehicleId);
        toast.success(`车辆 ${licensePlate} 已删除`);
        fetchVehicles(); // Refresh vehicle list
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        toast.error('删除车辆失败，请重试');
      }
    }
  };
  
  // Fetch vehicles data
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await mockService.getVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('获取车辆列表失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchVehicles();
  }, []);
  
  // Filter vehicles based on search and filters
  const filteredVehicles = vehicles.filter(vehicle => {
    // Search term filter (matches license plate, brand, model)
    const matchesSearch = 
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = 
      filterStatus === 'all' || 
      vehicle.status === filterStatus;
    
    // Service type filter
    const matchesService = 
      filterService === 'all' || 
      vehicle.serviceType === filterService;
    
    return matchesSearch && matchesStatus && matchesService;
  });
  
  // Pagination logic
  const indexOfLastVehicle = currentPage * vehiclesPerPage;
  const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage;
  const currentVehicles = filteredVehicles.slice(indexOfFirstVehicle, indexOfLastVehicle);
  const totalPages = Math.ceil(filteredVehicles.length / vehiclesPerPage);
  
  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };
  
  // Format vehicle type for display
  const formatVehicleType = (type: string) => {
    switch (type) {
      case 'sedan': return '轿车';
      case 'suv': return 'SUV';
      case 'truck': return '货车';
      default: return type;
    }
  };
  
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
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">车辆管理</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">管理所有车辆信息、进出场记录和服务状态</p>
        </div>
        
        <Link
          to="/vehicles/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
        >
          <i className="fa-solid fa-plus mr-2"></i>
          添加新车辆
        </Link>
      </div>
      
      {/* Search and filter section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fa-solid fa-search text-gray-400"></i>
            </div>
            <input
              type="text"
              placeholder="搜索车牌号、品牌或车型..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
            />
          </div>
          
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1); // Reset to first page on filter change
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
          >
            <option value="all">所有状态</option>
            <option value="in">在场车辆</option>
            <option value="out">已离场车辆</option>
          </select>
          
          {/* Service type filter */}
          <select
            value={filterService}
            onChange={(e) => {
              setFilterService(e.target.value);
              setCurrentPage(1); // Reset to first page on filter change
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
          >
            <option value="all">所有服务类型</option>
            <option value="maintenance">维修服务</option>
            <option value="insurance">保险理赔</option>
          </select>
        </div>
      </div>
      
      {/* Vehicles table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          // Loading state
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">加载车辆数据中...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          // Empty state
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
              <i className="fa-solid fa-car-side text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">暂无车辆数据</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              没有找到符合当前筛选条件的车辆。请尝试调整搜索条件或添加新车辆。
            </p>
            <Link
              to="/vehicles/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
            >
              <i className="fa-solid fa-plus mr-2"></i>
              添加新车辆
            </Link>
          </div>
        ) : (
          <>
             {/* Table header */}
            <div className="hidden md:grid grid-cols-12 gap-0 px-6 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm font-medium text-gray-500 dark:text-gray-400 data-table">
              <div className="col-span-1 data-table-cell">ID</div>
              <div className="col-span-2 data-table-cell">车牌号</div>
              <div className="col-span-2 data-table-cell">车辆信息</div>
              <div className="col-span-2 data-table-cell">进出场状态</div>
              <div className="col-span-2 data-table-cell">服务类型</div>
              <div className="col-span-1 data-table-cell">停留时间</div>
              <div className="col-span-2 data-table-cell text-right">操作</div>
            </div>
            
            {/* Table rows */}
            <div className="divide-y dark:divide-gray-700">
              {currentVehicles.map((vehicle) => (
                <div 
                  key={vehicle.id} 
                  className="group relative"
                >
                  {/* Mobile view */}
                  <div className="md:hidden p-4 border-b dark:border-gray-700 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-gray-900 dark:text-white">{vehicle.licensePlate}</div>
                      <span className={cn(
                        "text-xs font-medium px-2.5 py-0.5 rounded-full",
                        vehicle.status === 'in' 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      )}>
                        {vehicle.status === 'in' ? '在场' : '已离场'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-2 text-sm mb-3">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">品牌型号:</span> {vehicle.brand} {vehicle.model}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">类型:</span> {formatVehicleType(vehicle.vehicleType)}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">进场时间:</span> {formatDate(vehicle.entryTime)}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">服务类型:</span> 
                        {vehicle.serviceType === 'maintenance' ? '维修' : 
                         vehicle.serviceType === 'insurance' ? '保险理赔' : '未指定'}
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                       <div className="flex space-x-2">
                         <Link to={`/vehicles/${vehicle.id}`}>
                           <Button variant="view" size="sm" icon="fa-eye">
                             查看
                           </Button>
                         </Link>
                         
                         <Link to={`/vehicles/${vehicle.id}/edit`}>
                           <Button variant="edit" size="sm" icon="fa-pen">
                             编辑
                           </Button>
                         </Link>
                         
                         <Button
                           variant="delete"
                           size="sm"
                           icon="fa-trash"
                           onClick={() => handleDeleteVehicle(vehicle.id, vehicle.licensePlate)}
                         >
                           删除
                         </Button>
                       </div>
                    </div>
                  </div>
                  
                  {/* Desktop view */}
                   <div className="hidden md:grid grid-cols-12 items-center px-6 py-4 divide-y dark:divide-gray-700">
                    <div className="col-span-1 data-table-cell">{vehicle.id.substring(0, 8)}</div>
                    
                     <div className="col-span-2 data-table-cell">{vehicle.licensePlate}</div>
                    
                    <div className="col-span-2 data-table-cell">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {vehicle.brand} {vehicle.model}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatVehicleType(vehicle.vehicleType)}
                      </div>
                    </div>
                    
                    <div className="col-span-2 data-table-cell">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {vehicle.status === 'in' ? '在场' : '已离场'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {vehicle.status === 'in' 
                          ? `进场: ${formatDate(vehicle.entryTime)}` 
                          : `离场: ${formatDate(vehicle.exitTime || '')}`}
                      </div>
                    </div>
                    
                    <div className="col-span-2 data-table-cell">
                      <div className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mx-auto",
                        vehicle.serviceType === 'maintenance' 
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" 
                          : vehicle.serviceType === 'insurance'
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      )}>
                        {vehicle.serviceType === 'maintenance' ? '维修服务' : 
                         vehicle.serviceType === 'insurance' ? '保险理赔' : '未指定'}
                      </div>
                    </div>
                    
                    <div className="col-span-1 data-table-cell">
                      {calculateDuration(vehicle.entryTime, vehicle.exitTime)}
                    </div>
                    
                    <div className="col-span-2 data-table-cell flex justify-end space-x-2">
                      <Link to={`/vehicles/${vehicle.id}`}>
                        <Button variant="view" size="sm" icon="fa-eye">
                          查看
                        </Button>
                      </Link>
                      
                      <Link to={`/vehicles/${vehicle.id}/edit`}>
                        <Button variant="edit" size="sm" icon="fa-pen">
                          编辑
                        </Button>
                      </Link>
                      
                      <Button
                        variant="delete"
                        size="sm"
                        icon="fa-trash"
                        onClick={() => handleDeleteVehicle(vehicle.id, vehicle.licensePlate)}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                  </div>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t dark:border-gray-700 flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  显示 {indexOfFirstVehicle + 1} 到 {Math.min(indexOfLastVehicle, filteredVehicles.length)} 条，共 {filteredVehicles.length} 条
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="fa-solid fa-chevron-left text-xs"></i>
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => {
                    // Show first page, last page, current page and pages around current
                    if (i === 0 || i === totalPages - 1 || Math.abs(i + 1 - currentPage) <= 1) {
                      return (
                        <button
                          key={i}
                          onClick={() => handlePageChange(i + 1)}
                          className={cn(
                            "px-3 py-1 rounded-lg transition duration-200",
                            currentPage === i + 1
                              ? "bg-blue-600 text-white border border-blue-600"
                              : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                          )}
                        >
                          {i + 1}
                        </button>
                      );
                    } 
                    // Show ellipsis for gaps between pages
                    else if (i === 1 || i === totalPages - 2) {
                      return <span key={i} className="px-2 text-gray-400">...</span>;
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="fa-solid fa-chevron-right text-xs"></i>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VehicleList;