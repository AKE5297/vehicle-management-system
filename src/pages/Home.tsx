import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { mockService } from '../services/mockService';
import { Vehicle } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';

// Dashboard home page
const Home = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    vehiclesIn: 0,
    vehiclesOut: 0,
    maintenanceCount: 0,
    insuranceCount: 0
  });
  
  // Sample data for charts
  const monthlyData = [
    { name: '1月', 维修车辆: 12, 保险理赔: 5 },
    { name: '2月', 维修车辆: 19, 保险理赔: 8 },
    { name: '3月', 维修车辆: 15, 保险理赔: 6 },
    { name: '4月', 维修车辆: 28, 保险理赔: 12 },
    { name: '5月', 维修车辆: 22, 保险理赔: 9 },
    { name: '6月', 维修车辆: 30, 保险理赔: 15 },
    { name: '7月', 维修车辆: 35, 保险理赔: 18 },
    { name: '8月', 维修车辆: 28, 保险理赔: 14 },
    { name: '9月', 维修车辆: 15, 保险理赔: 7 },
  ];
  
  // Action buttons for quick access
  const quickActions = [
    { 
      title: '添加车辆', 
      icon: 'fa-plus-circle', 
      color: 'bg-blue-600', 
      path: '/vehicles/new' 
    },
    { 
      title: '录入发票', 
      icon: 'fa-file-invoice-dollar', 
      color: 'bg-green-600', 
      path: '/invoices/new' 
    },
    { 
      title: '创建维修单', 
      icon: 'fa-tools', 
      color: 'bg-purple-600', 
      path: '/maintenance/new' 
    },
    { 
      title: '数据导出', 
      icon: 'fa-download', 
      color: 'bg-amber-600', 
      path: '/data-management' 
    },
  ];
  
  // Fetch vehicle data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const vehiclesData = await mockService.getVehicles();
        setVehicles(vehiclesData);
        
        // Calculate statistics
        const totalVehicles = vehiclesData.length;
        const vehiclesIn = vehiclesData.filter(v => v.status === 'in').length;
        const vehiclesOut = vehiclesData.filter(v => v.status === 'out').length;
        const maintenanceCount = vehiclesData.filter(v => v.serviceType === 'maintenance').length;
        const insuranceCount = vehiclesData.filter(v => v.serviceType === 'insurance').length;
        
        setStats({
          totalVehicles,
          vehiclesIn,
          vehiclesOut,
          maintenanceCount,
          insuranceCount
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Stats cards data
  const statsCards = [
    { 
      title: '总车辆数', 
      value: stats.totalVehicles, 
      icon: 'fa-car', 
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' 
    },
    { 
      title: '在场车辆', 
      value: stats.vehiclesIn, 
      icon: 'fa-warehouse', 
      color: 'text-green-600 bg-green-50 dark:bg-green-900/30' 
    },
    { 
      title: '已离场车辆', 
      value: stats.vehiclesOut, 
      icon: 'fa-sign-out-alt', 
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' 
    },
    { 
      title: '维修车辆', 
      value: stats.maintenanceCount, 
      icon: 'fa-tools', 
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30' 
    },
    { 
      title: '保险理赔', 
      value: stats.insuranceCount, 
      icon: 'fa-file-invoice', 
      color: 'text-red-600 bg-red-50 dark:bg-red-900/30' 
    },
  ];
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">仪表盘</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">欢迎使用车辆管理系统，查看最新数据和快速操作</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className={cn(
                `${action.color} hover:opacity-90 text-white px-4 py-2 rounded-lg flex items-center transition duration-200 transform hover:scale-105`,
                'shadow-md hover:shadow-lg'
              )}
            >
              <i className={`fa-solid ${action.icon} mr-2`}></i>
              <span>{action.title}</span>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Statistics cards */}
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
             {statsCards.map((card, index) => (
               <motion.div 
                 key={index}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: index * 0.1 }}
                 className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
               >
                 <div className="p-4">
                   <div className="flex items-start justify-between">
                     <div>
                       <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                         {card.title}
                       </div>
                       <div className="text-2xl font-bold mt-1 text-gray-800 dark:text-white">
                         {card.value}
                       </div>
                     </div>
                     <div className={cn("p-3 rounded-full", card.color)}>
                       <i className={`fa-solid ${card.icon} text-xl`}></i>
                     </div>
                   </div>
                 </div>
               </motion.div>
             ))}
           </div>
      
      {/* Charts and recent vehicles section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
         {/* Activity chart */}
         <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg">
           <div className="p-4">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-semibold text-gray-800 dark:text-white text-lg">
                 月度车辆服务统计
               </h3>
               <div className="text-sm text-gray-500 dark:text-gray-400">过去9个月</div>
             </div>
             
             <div className="h-80">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart
                   data={monthlyData}
                   margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                 >
                   <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                   <XAxis dataKey="name" stroke="#9ca3af" />
                   <YAxis stroke="#9ca3af" />
                   <Tooltip 
                     contentStyle={{ 
                       backgroundColor: 'white', 
                       border: '1px solid #e5e7eb',
                       borderRadius: '8px',
                       boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                     }} 
                   />
                   <Bar dataKey="维修车辆" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                   <Bar dataKey="保险理赔" fill="#ef4444" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </div>
         </div>
         
         {/* Recent vehicles */}
         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg">
           <div className="p-4">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-semibold text-gray-800 dark:text-white text-lg">
                 最近车辆
               </h3>
               <Link 
                 to="/vehicles" 
                 className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
               >
                 查看全部
               </Link>
             </div>
             
             {loading ? (
               <div className="flex flex-col gap-4">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="animate-pulse flex items-center gap-3">
                     <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                     <div className="flex-1 space-y-2">
                       <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                       <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                     </div>
                   </div>
                 ))}
               </div>
             ) : vehicles.length > 0 ? (
               <div className="space-y-4">
                 {vehicles.slice(0, 3).map(vehicle => (
                   <Link
                     key={vehicle.id}
                     to={`/vehicles/${vehicle.id}`}
                     className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                   >
                     <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                       {vehicle.photos && vehicle.photos.length > 0 ? (
                         <img 
                           src={vehicle.photos[0]} 
                           alt={vehicle.brand} 
                           className="w-full h-full object-cover"
                         />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-400">
                           <i className="fa-solid fa-car text-xl"></i>
                         </div>
                       )}
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="font-medium text-gray-800 dark:text-white truncate">
                         {vehicle.licensePlate} - {vehicle.brand} {vehicle.model}
                       </div>
                       <div className="text-sm text-gray-500 dark:text-gray-400">
                         {vehicle.status === 'in' ? (
                           <span className="text-green-600 dark:text-green-400 flex items-center">
                             <i className="fa-solid fa-circle text-xs mr-1"></i> 在场中
                           </span>
                         ) : (
                           <span className="text-gray-500 dark:text-gray-400">
                             已离场
                           </span>
                         )}
                       </div>
                     </div>
                   </Link>
                 ))}
               </div>
             ) : (
               <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                 <i className="fa-solid fa-car-side text-4xl mb-2"></i>
                 <p>暂无车辆数据</p>
                 <Link
                   to="/vehicles/new"
                   className="inline-block mt-3 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                 >
                   添加新车辆
                 </Link>
               </div>
             )}
           </div>
         </div>
      </div>
      
      {/* Quick access section */}
       <div>
         <h3 className="font-semibold mb-4 text-gray-800 dark:text-white text-lg">
           快速功能导航
         </h3>
         
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {quickActions.map((action, index) => (
             <Link
               key={index}
               to={action.path}
               className="flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 hover:shadow-lg group"
             >
               <div className={`p-3 rounded-full ${action.color} text-white mb-2 group-hover:scale-110 transition-transform duration-200`}>
                 <i className={`fa-solid ${action.icon} text-xl`}></i>
               </div>
               <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.title}</span>
             </Link>
           ))}
         </div>
       </div>
    </div>
  );
};

export default Home;