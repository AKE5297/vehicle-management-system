import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { mockService } from '../../services/mockService';
import { MaintenanceRecord, Part } from '../../types';
import ImageUploader from '../../components/ui/ImageUploader';
import { cn } from '../../lib/utils';

// Maintenance form component for creating new maintenance records
const MaintenanceForm = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'photos', or 'settlement'
  
  // Form data state
  const [formData, setFormData] = useState({
    vehicleId: '',
    vehicleLicensePlate: '',
    type: 'maintenance' as 'maintenance' | 'accident' | 'breakdown',
    entryTime: new Date().toISOString(),
    exitTime: '',
    parts: [{ id: '1', name: '', quantity: 1, price: '', photo: '' }],
    laborCost: '',
    totalCost: '',
    notes: '',
    photos: [] as string[]
  });
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Calculate total cost when parts or labor cost changes
    if (name === 'laborCost' || name === 'price') {
      calculateTotalCost();
    }
  };
  
  // Handle part changes
  const handlePartChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newParts = [...formData.parts];
    
    // Update the specific field of the part
    newParts[index] = { 
      ...newParts[index], 
      [name]: name === 'quantity' ? Number(value) : value 
    };
    
    setFormData(prev => ({ ...prev, parts: newParts }));
    calculateTotalCost();
  };
  
  // Calculate total cost (parts + labor)
  const calculateTotalCost = () => {
    // Calculate parts cost
    const partsCost = formData.parts.reduce((sum, part) => {
      return sum + (Number(part.quantity) * Number(part.price || 0));
    }, 0);
    
    // Calculate total cost
    const laborCost = Number(formData.laborCost || 0);
    const totalCost = partsCost + laborCost;
    
    setFormData(prev => ({
      ...prev,
      totalCost: totalCost.toFixed(2)
    }));
  };
  
  // Add new part to maintenance record
  const addPart = () => {
    const newId = (parseInt(formData.parts[formData.parts.length - 1].id) + 1).toString();
    setFormData(prev => ({
      ...prev,
      parts: [...prev.parts, { id: newId, name: '', quantity: 1, price: '', photo: '' }]
    }));
  };
  
  // Remove part from maintenance record
  const removePart = (index: number) => {
    if (formData.parts.length <= 1) return; // Keep at least one part
    
    const newParts = formData.parts.filter((_, i) => i !== index);
    
    // Recalculate total cost
    const totalCost = newParts.reduce((sum, part) => {
      return sum + (Number(part.quantity) * Number(part.price || 0));
    }, 0);
    
    setFormData(prev => ({
      ...prev,
      parts: newParts,
      totalCost: totalCost.toFixed(2)
    }));
  };
  
  // Handle photo upload for maintenance process
  const handlePhotosUpload = (urls: string[]) => {
    setFormData(prev => ({ ...prev, photos: urls }));
  };
  
  // Handle part photo upload
  const handlePartPhotoUpload = (index: number, urls: string[]) => {
    if (urls.length > 0) {
      const newParts = [...formData.parts];
      newParts[index] = { ...newParts[index], photo: urls[0] };
      setFormData(prev => ({ ...prev, parts: newParts }));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.vehicleLicensePlate.trim()) {
      toast.error('车牌信息不能为空');
      return;
    }
    
    if (formData.parts.some(part => !part.name.trim() || !part.price)) {
      toast.error('请填写所有配件的名称和价格');
      return;
    }
    
    if (!formData.laborCost) {
      toast.error('请填写工时费用');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Create new maintenance record
      const maintenanceData: Partial<MaintenanceRecord> = {
        ...formData,
        parts: formData.parts.map(part => ({
          ...part,
          quantity: Number(part.quantity),
          price: Number(part.price)
        })),
        laborCost: Number(formData.laborCost),
        totalCost: Number(formData.totalCost),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Simulate API call with mock service
      console.log('Creating new maintenance record:', maintenanceData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('维修记录创建成功');
      navigate('/maintenance');
    } catch (error) {
      console.error('Error creating maintenance record:', error);
      toast.error('创建维修记录失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">创建维修工单</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">登记新的车辆维修信息，包括维修类型、配件和过程照片</p>
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
                  activeTab === 'info'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('info')}
              >
                <i className="fa-solid fa-wrench mr-2"></i>维修信息
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
                <i className="fa-solid fa-camera mr-2"></i>过程照片
              </button>
              <button
                type="button"
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'settlement'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('settlement')}
              >
                <i className="fa-solid fa-file-alt mr-2"></i>结算信息
              </button>
            </div>
          </div>
          
          {/* Form content */}
          <div className="p-6 space-y-6">
            {activeTab === 'info' && (
              <>
                {/* Basic information section */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">基本信息</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Vehicle license plate */}
                    <div>
                      <label htmlFor="vehicleLicensePlate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        车牌号 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fa-solid fa-car text-gray-400"></i>
                        </div>
                        <input
                          type="text"
                          id="vehicleLicensePlate"
                          name="vehicleLicensePlate"
                          value={formData.vehicleLicensePlate}
                          onChange={handleChange}
                          placeholder="例如: 京A12345"
                          className="w-full pl-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                          required
                        />
                      </div>
                    </div>
                    
                    {/* Maintenance type */}
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        维修类型 <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                        required
                      >
                        <option value="maintenance">保养</option>
                        <option value="accident">事故维修</option>
                        <option value="breakdown">故障维修</option>
                      </select>
                    </div>
                    
                    {/* Entry time */}
                    <div>
                      <label htmlFor="entryTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        进厂时间 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fa-solid fa-clock text-gray-400"></i>
                        </div>
                        <input
                          type="datetime-local"
                          id="entryTime"
                          name="entryTime"
                          value={formData.entryTime.slice(0, 16)}
                          onChange={handleChange}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                          required
                        />
                      </div>
                    </div>
                    
                    {/* Exit time (optional for new records) */}
                    <div>
                      <label htmlFor="exitTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        预计离厂时间
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fa-solid fa-clock text-gray-400"></i>
                        </div>
                        <input
                          type="datetime-local"
                          id="exitTime"
                          name="exitTime"
                          value={formData.exitTime ? formData.exitTime.slice(0, 16) : ''}
                          onChange={handleChange}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Parts information section */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">配件信息</h2>
                  
                  <div className="space-y-4">
                    {/* Parts header */}
                    <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 text-sm font-medium text-gray-500 dark:text-gray-400 rounded-t-lg">
                      <div className="col-span-4">配件名称</div>
                      <div className="col-span-2 text-center">数量</div>
                      <div className="col-span-2 text-center">单价(元)</div>
                      <div className="col-span-3 text-center">配件照片</div>
                      <div className="col-span-1 text-center">操作</div>
                    </div>
                    
                    {/* Parts list */}
                    <div className="divide-y dark:divide-gray-700">
                      {formData.parts.map((part, index) => (
                        <div key={part.id} className="grid grid-cols-12 gap-4 px-4 py-3 items-center">
                          <div className="col-span-4">
                            <input
                              type="text"
                              name="name"
                              value={part.name}
                              onChange={(e) => handlePartChange(index, e)}
                              placeholder="输入配件名称"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200 text-sm"
                              required
                            />
                          </div>
                          
                          <div className="col-span-2">
                            <input
                              type="number"
                              name="quantity"
                              value={part.quantity}
                              onChange={(e) => handlePartChange(index, e)}
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200 text-sm text-center"
                              required
                            />
                          </div>
                          
                          <div className="col-span-2">
                            <input
                              type="number"
                              name="price"
                              value={part.price}
                              onChange={(e) => handlePartChange(index, e)}
                              step="0.01"
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200 text-sm text-center"
                              required
                            />
                          </div>
                          
                          <div className="col-span-3">
                            <ImageUploader
                              maxFiles={1}
                              multiple={false}
                              initialImages={part.photo ? [part.photo] : []}
                              onUpload={(urls) => handlePartPhotoUpload(index, urls)}
                              buttonText="上传照片"
                              maxSize={500}
                              compact={true}
                            />
                          </div>
                          
                          <div className="col-span-1 text-center">
                            <button
                              type="button"
                              onClick={() => removePart(index)}
                              disabled={formData.parts.length <= 1}
                              className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Add part button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={addPart}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <i className="fa-solid fa-plus-circle mr-2"></i>
                        添加配件
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {activeTab === 'photos' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">维修过程照片</h2>
                
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                    <h3 className="font-medium text-blue-800 dark:text-blue-300 flex items-center">
                      <i className="fa-solid fa-info-circle mr-2"></i>
                      照片拍摄指南
                    </h3>
                    <ul className="text-sm text-blue-700 dark:text-blue-400 mt-2 space-y-1">
                      <li className="flex items-start">
                        <i className="fa-solid fa-check-circle mt-1 mr-2"></i>
                        <span>拍摄维修前、维修中和维修后的对比照片</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fa-solid fa-check-circle mt-1 mr-2"></i>
                        <span>拍摄关键部件和维修细节，确保清晰可辨</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fa-solid fa-check-circle mt-1 mr-2"></i>
                        <span>每张照片请添加简要说明，记录维修步骤</span>
                      </li>
                    </ul>
                  </div>
                  
                  <ImageUploader
                    maxFiles={5}
                    initialImages={formData.photos}
                    onUpload={handlePhotosUpload}
                    buttonText="上传维修照片"
                    maxSize={1024}
                    helpText="支持JPG、PNG格式，记录维修过程的关键步骤"
                    withDescription={true}
                  />
                  
                  {formData.photos.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">已上传照片</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {formData.photos.map((photo, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={photo}
                              alt={`维修过程 ${index + 1}`}
                              className="w-full h-40 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                 const newPhotos = formData.photos.filter((_, i) => i !== index);
                                setFormData(prev => ({ ...prev, photos: newPhotos }));
                              }}
                              className="absolute top-2 right-2 bg-white/80 dark:bg-gray-800/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white dark:hover:bg-gray-800"
                            >
                              <i className="fa-solid fa-trash text-red-500"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'settlement' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">结算信息</h2>
                
                <div className="space-y-6">
                  {/* Labor cost section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="laborCost" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        工时费(元) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="laborCost"
                        name="laborCost"
                        value={formData.laborCost}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="totalCost" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        总费用(元) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="totalCost"
                        name="totalCost"
                        value={formData.totalCost}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 dark:border-gray-600"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Cost breakdown */}
                  <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">费用明细</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">配件费用:</span>
                        <span className="font-medium">
                          ¥{formData.parts.reduce((sum, part) => sum + (Number(part.quantity) * Number(part.price || 0)), 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">工时费用:</span>
                        <span className="font-medium">¥{Number(formData.laborCost || 0).toFixed(2)}</span>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-600 my-2 pt-2 flex justify-between font-medium">
                        <span>总计:</span>
                        <span className="text-lg text-blue-600 dark:text-blue-400">¥{formData.totalCost || '0.00'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Payment method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      支付方式
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <label className="flex flex-col items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors duration-200">
                        <i className="fa-solid fa-credit-card text-2xl mb-2 text-gray-500 dark:text-gray-400"></i>
                        <span className="text-sm">银行卡</span>
                      </label>
                      <label className="flex flex-col items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors duration-200">
                        <i className="fa-solid fa-mobile-alt text-2xl mb-2 text-gray-500 dark:text-gray-400"></i>
                        <span className="text-sm">移动支付</span>
                      </label>
                      <label className="flex flex-col items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors duration-200">
                        <i className="fa-solid fa-file-invoice text-2xl mb-2 text-gray-500 dark:text-gray-400"></i>
                        <span className="text-sm">挂账</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Notes section */}
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      维修备注
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={4}
                      placeholder="输入维修相关备注信息..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                    ></textarea>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Form actions */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-800 flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => navigate('/maintenance')}
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
                '创建维修工单'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceForm;