import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockService } from '../../services/mockService';
import { Vehicle } from '../../types';
import { toast } from 'sonner';
import ImageUploader from '../../components/ui/ImageUploader';
import { cn } from '../../lib/utils';
import { photoService } from '../../services/photoService';

// Vehicle form component for creating and editing vehicles
const VehicleForm = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // Form state
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'photos', 'service'
  
   // 使用照片服务保存照片到指定目录
  const savePhotoToDirectory = async (file: string, directory: string): Promise<string> => {
    // 调用photoService保存照片，并传入车牌号等附加信息
    return photoService.savePhoto(file, directory, {
      licensePlate: formData.licensePlate,
      vehicleId: formData.id || undefined
    });
  };
  
  // Form data state
  const [formData, setFormData] = useState({
    licensePlate: '',
    vehicleType: 'sedan' as 'sedan' | 'suv' | 'truck' | 'other',
    brand: '',
    model: '',
    vin: '',
    photos: [] as string[],
    entryTime: new Date().toISOString(),
    exitTime: '',
    status: 'in' as 'in' | 'out',
    entryPhoto: '',
    exitPhoto: '',
    serviceType: null as 'maintenance' | 'insurance' | null,
    notes: [] as { id: string; content: string; photo?: string }[]
  });
  
  // Custom brand input state (when "Other" is selected)
  const [customBrand, setCustomBrand] = useState('');
  
  // Vehicle brands data
  const vehicleBrands = [
    '奔驰', '宝马', '奥迪', '大众', '丰田', '本田', '日产', '福特', 
    '别克', '雪佛兰', '现代', '起亚', '吉利', '长城', '比亚迪', '奇瑞', 
    '长安', '哈弗', '传祺', '领克', 'Other'
  ];
  
  // Vehicle types data
  const vehicleTypes = [
    { value: 'sedan', label: '轿车' },
    { value: 'suv', label: 'SUV' },
    { value: 'truck', label: '货车' },
    { value: 'other', label: '其他' }
  ];
  
  // Fetch vehicle data for edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchVehicle = async () => {
        try {
          const vehicle = await mockService.getVehicleById(id);
          if (vehicle) {
            setFormData({
              licensePlate: vehicle.licensePlate,
              vehicleType: vehicle.vehicleType,
              brand: vehicle.brand,
              model: vehicle.model,
              vin: vehicle.vin || '',
              photos: vehicle.photos,
              entryTime: vehicle.entryTime,
              exitTime: vehicle.exitTime || '',
              status: vehicle.status,
              entryPhoto: vehicle.entryPhoto || '',
              exitPhoto: vehicle.exitPhoto || '',
              serviceType: vehicle.serviceType,
              notes: vehicle.notes || []
            });
            
            // Set custom brand if needed
            if (!vehicleBrands.includes(vehicle.brand)) {
              setCustomBrand(vehicle.brand);
            }
          } else {
            toast.error('未找到车辆信息');
            navigate('/vehicles');
          }
        } catch (error) {
          console.error('Error fetching vehicle:', error);
          toast.error('获取车辆信息失败');
          navigate('/vehicles');
        } finally {
          setLoading(false);
        }
      };
      
      fetchVehicle();
    }
  }, [id, isEditMode, navigate]);
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Special handling for brand selection
    if (name === 'brand') {
      setFormData(prev => ({ ...prev, brand: value }));
      
      // If "Other" is selected, focus on custom brand input
      if (value === 'Other') {
        setTimeout(() => {
          const customBrandInput = document.getElementById('customBrand');
          customBrandInput?.focus();
        }, 0);
      } else {
        setCustomBrand('');
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle custom brand input
  const handleCustomBrandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomBrand(value);
    setFormData(prev => ({ ...prev, brand: value }));
  };
  
  // Handle service type change
  const handleServiceTypeChange = (value: 'maintenance' | 'insurance' | null) => {
    setFormData(prev => ({ ...prev, serviceType: value }));
  };
  
   // Handle photo uploads
  const handlePhotosUpload = async (urls: string[]) => {
    try {
      console.log('接收到上传的照片URLs:', urls);
      
      // 验证URL有效性
      const validUrls = [];
      for (const url of urls) {
        try {
          // 检查URL格式是否有效
          new URL(url);
          validUrls.push(url);
        } catch (e) {
          console.error('无效的图片URL:', url);
        }
      }
      
      // 更新表单数据
      setFormData(prev => ({ ...prev, photos: validUrls }));
      toast.success(`成功上传${validUrls.length}张车辆照片`);
      
      // 如果有无效的URL，显示警告
      if (validUrls.length < urls.length) {
        toast.warning(`有${urls.length - validUrls.length}张图片URL无效，已自动过滤`);
      }
    } catch (error) {
      console.error('Error setting photos:', error);
      toast.error('照片处理失败，请重试');
    }
  }
  
  // Handle entry photo upload
  const handleEntryPhotoUpload = async (urls: string[]) => {
    if (urls.length > 0) {
      try {
        // 直接使用上传器返回的URL，因为已经通过photoService处理过了
        setFormData(prev => ({ ...prev, entryPhoto: urls[0] }));
        toast.success('进场照片上传成功');
      } catch (error) {
        console.error('Error setting entry photo:', error);
        toast.error('进场照片处理失败，请重试');
      }
    }
  }
  
  // Handle exit photo upload
  const handleExitPhotoUpload = async (urls: string[]) => {
    if (urls.length > 0) {
      try {
        // 直接使用上传器返回的URL，因为已经通过photoService处理过了
        setFormData(prev => ({ ...prev, exitPhoto: urls[0] }));
        toast.success('离场照片上传成功');
      } catch (error) {
        console.error('Error setting exit photo:', error);
        toast.error('离场照片处理失败，请重试');
      }
    }
  }
  
   // Handle service record photo upload
  const handlePartPhotoUpload = async (index: number, urls: string[]) => {
    if (urls.length > 0) {
      try {
        // 创建目录结构（如果不存在）
        photoService.createDirectoryStructure();
        
        // 使用photoService保存照片
        const directory = photoService.getDirectory('PART_PHOTOS');
        const formattedUrl = await photoService.savePhoto(urls[0], directory, {
          licensePlate: formData.licensePlate,
          vehicleId: formData.id || undefined
        });
        
        // 这里我们暂时使用一个空操作，因为服务记录的存储结构需要根据实际需求设计
        console.log('Service record photo uploaded:', formattedUrl);
        toast.success('服务记录照片上传成功');
      } catch (error) {
        console.error('Error uploading service record photo:', error);
        toast.error('服务记录照片上传失败，请重试');
      }
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.licensePlate.trim()) {
      toast.error('车牌号不能为空');
      return;
    }
    
    if (!formData.brand.trim()) {
      toast.error('请选择或输入车辆品牌');
      return;
    }
    
    if (!formData.model.trim()) {
      toast.error('车型不能为空');
      return;
    }
    
    if (formData.status === 'out' && !formData.exitTime) {
      toast.error('离场车辆必须填写离场时间');
      return;
    }
    
    // 检查照片是否已上传
    if (formData.photos.length === 0) {
      toast.error('请至少上传一张车辆照片');
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (isEditMode && id) {
        // Update existing vehicle
        const updatedVehicle = await mockService.updateVehicle(id, formData);
        if (updatedVehicle) {
          toast.success('车辆信息更新成功');
        } else {
          toast.error('更新车辆信息失败');
        }
      } else {
        // Create new vehicle
        await mockService.createVehicle(formData);
        toast.success('新车辆添加成功');
      }
      
      navigate('/vehicles');
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast.error('保存车辆信息失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Format date to ISO string for input
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format to YYYY-MM-DDTHH:MM
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">加载车辆信息中...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {isEditMode ? '编辑车辆' : '添加新车辆'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {isEditMode ? '修改车辆的基本信息和服务记录' : '登记新车辆的基本信息和进出场记录'}
        </p>
      </div>
      
      {/* Form card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit}>
          {/* Form tabs */}
          <div className="border-b dark:border-gray-700">
            <div className="flex overflow-x-auto scrollbar-hide">
              <button
                type="button"
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'basic'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('basic')}
              >
                <i className="fa-solid fa-info-circle mr-2"></i>基本信息
              </button>
              <button
                type="button"
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'photos'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('photos')}
              >
                <i className="fa-solid fa-camera mr-2"></i>照片管理
              </button>
              <button
                type="button"
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'service'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('service')}
              >
                <i className="fa-solid fa-file-alt mr-2"></i>服务记录
              </button>
            </div>
          </div>
          
          {/* Form content */}
          <div className="p-6 space-y-6">
            {activeTab === 'basic' && (
              <>
                {/* Basic information section */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">基本信息</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* License plate (primary key) */}
                    <div>
                      <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        车牌号 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="licensePlate"
                        name="licensePlate"
                        value={formData.licensePlate}
                        onChange={handleChange}
                        placeholder="例如: 京A12345"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                        required
                        disabled={isEditMode} // Can't edit primary key
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">车牌号为唯一标识，不可修改</p>
                    </div>
                    
                    {/* Vehicle type */}
                    <div>
                      <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        车型 <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="vehicleType"
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                        required
                      >
                        {vehicleTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Brand selection */}
                    <div>
                      <label htmlFor="brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        品牌 <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="brand"
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                        required
                      >
                        {vehicleBrands.map(brand => (
                          <option key={brand} value={brand}>
                            {brand}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Custom brand input (shown when "Other" is selected) */}
                    {(formData.brand === 'Other' || (customBrand && formData.brand === customBrand)) && (
                      <div>
                        <label htmlFor="customBrand" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          自定义品牌 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="customBrand"
                          value={customBrand}
                          onChange={handleCustomBrandChange}
                          placeholder="请输入品牌名称"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                          required
                        />
                      </div>
                    )}
                    
                    {/* Model */}
                    <div>
                      <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        车型 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="model"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        placeholder="例如: C200L, X5, 卡罗拉"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                        required
                      />
                    </div>
                    
                    {/* VIN */}
                    <div>
                      <label htmlFor="vin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        车辆VIN码 (可选)
                      </label>
                      <input
                        type="text"
                        id="vin"
                        name="vin"
                        value={formData.vin}
                        onChange={handleChange}
                        placeholder="17位车辆识别码"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">17位车辆识别代码，可用于查询车辆详细信息</p>
                    </div>
                  </div>
                </div>
                
                {/* Time management section */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">时间管理</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Entry time */}
                    <div>
                      <label htmlFor="entryTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        进场时间 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fa-solid fa-clock text-gray-400"></i>
                        </div>
                        <input
                          type="datetime-local"
                          id="entryTime"
                          name="entryTime"
                          value={formatDateForInput(formData.entryTime)}
                          onChange={handleChange}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                          required
                        />
                      </div>
                    </div>
                    
                    {/* Exit time */}
                    <div>
                      <label htmlFor="exitTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        离场时间 {formData.status === 'out' && <span className="text-red-500">*</span>}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fa-solid fa-clock text-gray-400"></i>
                        </div>
                        <input
                          type="datetime-local"
                          id="exitTime"
                          name="exitTime"
                          value={formData.exitTime ? formatDateForInput(formData.exitTime) : ''}
                          onChange={handleChange}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                          disabled={formData.status === 'in'}
                        />
                      </div>
                    </div>
                    
                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        车辆状态 <span className="text-red-500">*</span>
                      </label>
                      <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="status"
                            value="in"
                            checked={formData.status === 'in'}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-700"
                          />
                          <span className="ml-2 text-gray-700 dark:text-gray-300">在场</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="status"
                            value="out"
                            checked={formData.status === 'out'}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-700"
                          />
                          <span className="ml-2 text-gray-700 dark:text-gray-300">已离场</span>
                        </label>
                      </div>
                    </div>
                    
                    {/* Service type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        服务类型
                      </label>
                      <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="serviceType"
                            value="maintenance"
                            checked={formData.serviceType === 'maintenance'}
                            onChange={() => handleServiceTypeChange('maintenance')}
                            className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-700"
                          />
                          <span className="ml-2 text-gray-700 dark:text-gray-300">维修服务</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="serviceType"
                            value="insurance"
                            checked={formData.serviceType === 'insurance'}
                            onChange={() => handleServiceTypeChange('insurance')}
                            className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-700"
                          />
                          <span className="ml-2 text-gray-700 dark:text-gray-300">保险理赔</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="serviceType"
                            value="none"
                            checked={formData.serviceType === null}
                            onChange={() => handleServiceTypeChange(null)}
                            className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-700"
                          />
                          <span className="ml-2 text-gray-700 dark:text-gray-300">无</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {activeTab === 'photos' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">车辆照片</h2>
                
                <div className="space-y-6">
                  {/* Vehicle photos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      车辆照片 (支持多张，自动压缩至1080P)
                    </label>
                     <ImageUploader
                       maxFiles={20}
                       initialImages={formData.photos}
                       onUpload={handlePhotosUpload}
                       buttonText="上传车辆照片"
                       additionalInfo={{
                         licensePlate: formData.licensePlate,
                         vehicleId: formData.id || undefined
                       }}
                     />
                  </div>
                  
                  {/* Entry photo with watermark */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      进场状态照片 (带时间水印)
                    </label>
                     <ImageUploader
                       maxFiles={1}
                       multiple={false}
                       initialImages={formData.entryPhoto ? [formData.entryPhoto] : []}
                       onUpload={handleEntryPhotoUpload}
                       buttonText="上传进场照片"
                       watermarkText={`进场_${formData.licensePlate}_${new Date().toLocaleString()}`}
                       additionalInfo={{
                         licensePlate: formData.licensePlate,
                         vehicleId: formData.id || undefined
                       }}
                     />
                  </div>
                  
                  {/* Exit photo with watermark (only if status is "out") */}
                  {formData.status === 'out' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        离场状态照片 (带时间水印)
                      </label>
                         <ImageUploader
                           maxFiles={1}
                           multiple={false}
                           initialImages={formData.exitPhoto ? [formData.exitPhoto] : []}
                           onUpload={handleExitPhotoUpload}
                           buttonText="上传离场照片"
                           watermarkText={`离场_${formData.licensePlate}_${new Date().toLocaleString()}`}
                           additionalInfo={{
                             licensePlate: formData.licensePlate,
                             vehicleId: formData.id || undefined
                           }}
                         />
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'service' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">服务记录</h2>
                
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-800 dark:text-blue-300 flex items-center">
                      <i className="fa-solid fa-info-circle mr-2"></i>
                      服务记录信息
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                      此处记录车辆的维修、保养和保险等服务信息。点击相关服务类型添加详细记录。
                    </p>
                  </div>
                  
                  {formData.serviceType === 'maintenance' && (
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                        <i className="fa-solid fa-wrench text-purple-600 dark:text-purple-400 mr-2"></i>
                        维修服务记录
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            维修项目描述
                          </label>
                          <textarea
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition duration-200"
                            rows={3}
                            placeholder="请描述维修项目内容、更换的零部件等信息..."
                          ></textarea>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            维修照片
                          </label>
                             <ImageUploader
                              maxFiles={10}
                              buttonText="上传维修照片"
                              helpText="上传维修过程或结果照片"
                              onUpload={async (urls) => {
                                if (urls.length > 0) {
                                  try {
                                    // 创建目录结构（如果不存在）
                                    photoService.createDirectoryStructure();
                                    
                                    // 保存服务记录照片
                                    const directory = photoService.getDirectory('MAINTENANCE_PHOTOS');
                                    const formattedUrl = await photoService.savePhoto(urls[0], directory, {
                                      licensePlate: formData.licensePlate,
                                      vehicleId: formData.id || undefined
                                    });
                                    toast.success('服务记录照片上传成功');
                                    console.log('Service photo saved:', formattedUrl);
                                  } catch (error) {
                                    console.error('Error saving service photo:', error);
                                    toast.error('服务记录照片保存失败，请重试');
                                  }
                                }
                              }}
                            />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {formData.serviceType === 'insurance' && (
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                        <i className="fa-solid fa-file-invoice text-red-600 dark:text-red-400 mr-2"></i>
                        保险理赔记录
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            事故描述
                          </label>
                          <textarea
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition duration-200"
                            rows={3}
                            placeholder="请描述事故原因、损失情况等信息..."
                          ></textarea>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            保险单号
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition duration-200"
                            placeholder="输入保险单号"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            事故照片
                          </label>
                             <ImageUploader
                              maxFiles={10}
                              buttonText="上传事故照片"
                              helpText="上传事故现场和车辆损失照片"
                              onUpload={async (urls) => {
                                if (urls.length > 0) {
                                  try {
                                    // 创建目录结构（如果不存在）
                                    photoService.createDirectoryStructure();
                                    
                                    // 保存事故照片
                                    const directory = photoService.getDirectory('NOTE_PHOTOS');
                                    const formattedUrl = await photoService.savePhoto(urls[0], directory, {
                                      licensePlate: formData.licensePlate,
                                      vehicleId: formData.id || undefined
                                    });
                                    toast.success('事故照片上传成功');
                                    console.log('Accident photo saved:', formattedUrl);
                                  } catch (error) {
                                    console.error('Error saving accident photo:', error);
                                    toast.error('事故照片保存失败，请重试');
                                  }
                                }
                              }}
                            />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!formData.serviceType && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                        <i className="fa-solid fa-file-alt text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">暂无服务记录</h3>
                      <p className="max-w-md mx-auto">
                        请在基本信息中选择服务类型，以添加相应的服务记录
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Form actions */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/vehicles')}
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
                isEditMode ? '更新车辆' : '添加车辆'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VehicleForm;