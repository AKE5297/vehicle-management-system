import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { mockService } from '../../services/mockService';
import { Invoice } from '../../types';
import ImageUploader from '../../components/ui/ImageUploader';
import { cn } from '../../lib/utils';
import { photoService } from '../../services/photoService';

// Invoice form component for creating and editing invoices
const InvoiceForm = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(!!id); // Load if editing
  const [activeTab, setActiveTab] = useState('invoice'); // 'invoice' or 'ocr'
  const isEditMode = !!id;
  
  // Form data state
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    date: new Date().toISOString(),
    amount: '',
    type: 'vat' as 'vat' | 'maintenance',
    vehicleId: '',
    vehicleLicensePlate: '',
    items: [{ id: '1', description: '', quantity: 1, unitPrice: '', totalPrice: '' }],
    photo: ''
  });
  
  // Fetch invoice data for edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchInvoice = async () => {
        try {
          setLoading(true);
          const invoice = await mockService.getInvoiceById(id);
          
          if (invoice) {
            // Format invoice data for form
            setFormData({
              invoiceNumber: invoice.invoiceNumber,
              date: invoice.date,
              amount: invoice.amount.toString(),
              type: invoice.type,
              vehicleId: invoice.vehicleId,
              vehicleLicensePlate: invoice.vehicleLicensePlate,
              items: invoice.items.map(item => ({
                id: item.id,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice.toString(),
                totalPrice: item.totalPrice.toString()
              })),
              photo: invoice.photo
            });
          } else {
            toast.error('未找到发票信息');
            navigate('/invoices');
          }
        } catch (error) {
          console.error('Error fetching invoice:', error);
          toast.error('获取发票信息失败');
          navigate('/invoices');
        } finally {
          setLoading(false);
        }
      };
      
      fetchInvoice();
    }
  }, [id, isEditMode, navigate]);
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle item changes
  const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    
    // Update the specific field of the item
    newItems[index] = { 
      ...newItems[index], 
      [name]: name === 'quantity' || name === 'unitPrice' ? Number(value) : value 
    };
    
    // Calculate total price if both quantity and unitPrice are provided
    if (name === 'quantity' || name === 'unitPrice') {
      const quantity = newItems[index].quantity || 0;
      const unitPrice = newItems[index].unitPrice || 0;
      newItems[index] = {
        ...newItems[index],
        totalPrice: (quantity * unitPrice).toFixed(2)
      };
      
      // Calculate total amount
      const totalAmount = newItems.reduce((sum, item) => {
        return sum + Number(item.totalPrice || 0);
      }, 0);
      
      setFormData(prev => ({
        ...prev,
        items: newItems,
        amount: totalAmount.toFixed(2)
      }));
    } else {
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };
  
  // Add new item to invoice
  const addItem = () => {
    const newId = (parseInt(formData.items[formData.items.length - 1].id) + 1).toString();
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: newId, description: '', quantity: 1, unitPrice: '', totalPrice: '' }]
    }));
  };
  
  // Remove item from invoice
  const removeItem = (index: number) => {
    if (formData.items.length <= 1) return; // Keep at least one item
    
    const newItems = formData.items.filter((_, i) => i !== index);
    
    // Recalculate total amount
    const totalAmount = newItems.reduce((sum, item) => {
      return sum + Number(item.totalPrice || 0);
    }, 0);
    
    setFormData(prev => ({
      ...prev,
      items: newItems,
      amount: totalAmount.toFixed(2)
    }));
  };
  
  // 使用照片服务保存照片到指定目录
  const savePhotoToDirectory = async (file: string, directory: string): Promise<string> => {
    // 调用photoService保存照片，并传入车牌号等附加信息
    return photoService.savePhoto(file, directory, {
      licensePlate: formData.vehicleLicensePlate
    });
  };
  
  // Handle photo upload
  const handlePhotoUpload = async (urls: string[]) => {
    if (urls.length > 0) {
      try {
        // 直接使用上传器返回的URL，因为已经通过photoService处理过了
        setFormData(prev => ({ ...prev, photo: urls[0] }));
        toast.success('发票照片上传成功');
      } catch (error) {
        console.error('Error setting invoice photo:', error);
        toast.error('发票照片处理失败，请重试');
      }
    }
  };
  
  // Handle OCR photo upload and processing
  const handleOcrUpload = async (urls: string[]) => {
    if (urls.length > 0) {
      // Simulate OCR processing
      setSubmitting(true);
      setTimeout(() => {
        // Mock OCR results
        const mockResults = {
          invoiceNumber: `FP-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          date: new Date().toISOString(),
          amount: (Math.random() * 1000 + 100).toFixed(2),
          vehicleLicensePlate: '京A' + Math.floor(Math.random() * 100000).toString().padStart(5, '0'),
          items: [
            { id: '1', description: '维修费', quantity: 1, unitPrice: (Math.random() * 500 + 100).toFixed(2), totalPrice: '' },
            { id: '2', description: '零件费', quantity: 1, unitPrice: (Math.random() * 300 + 50).toFixed(2), totalPrice: '' }
          ]
        };
        
        // Calculate total prices
        mockResults.items.forEach(item => {
          item.totalPrice = (parseFloat(item.quantity.toString()) * parseFloat(item.unitPrice)).toFixed(2);
        });
        
        // Update form data with OCR results
        setFormData(prev => ({
          ...prev,
          ...mockResults,
          photo: urls[0]
        }));
        
        // Switch back to invoice tab
        setActiveTab('invoice');
        setSubmitting(false);
        
        // Show success message
        toast.success('OCR识别成功，已自动填充表单');
      }, 2000);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.invoiceNumber.trim()) {
      toast.error('发票编号不能为空');
      return;
    }
    
    if (!formData.vehicleLicensePlate.trim()) {
      toast.error('车牌信息不能为空');
      return;
    }
    
    if (!formData.photo) {
      toast.error('请上传发票照片');
      return;
    }
    
    // Validate all items
    const invalidItems = formData.items.filter(item => 
      !item.description.trim() || !item.unitPrice
    );
    
    if (invalidItems.length > 0) {
      toast.error('请填写所有项目的描述和单价');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Prepare invoice data
      const invoiceData: Partial<Invoice> = {
        ...formData,
        amount: Number(formData.amount),
        items: formData.items.map(item => ({
          id: item.id,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice)
        })),
        updatedAt: new Date().toISOString()
      };
      
      if (isEditMode && id) {
        // Update existing invoice
        await mockService.updateInvoice(id, invoiceData);
        toast.success('发票更新成功');
      } else {
        // Create new invoice
        invoiceData.status = 'pending';
        invoiceData.createdAt = new Date().toISOString();
        await mockService.createInvoice(invoiceData as Invoice);
        toast.success('发票创建成功');
      }
      
      navigate('/invoices');
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error(isEditMode ? '更新发票失败，请重试' : '创建发票失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">加载发票信息中...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {isEditMode ? '编辑发票' : '添加新发票'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {isEditMode ? '修改发票信息' : '登记新发票信息，支持OCR识别和手动录入'}
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
                  activeTab === 'invoice'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('invoice')}
                disabled={isEditMode} // OCR only for new invoices
              >
                <i className="fa-solid fa-file-invoice mr-2"></i>发票信息
              </button>
              <button
                type="button"
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'ocr'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('ocr')}
                disabled={isEditMode} // OCR only for new invoices
              >
                <i className="fa-solid fa-camera mr-2"></i>OCR识别
              </button>
            </div>
          </div>
          
          {/* Form content */}
          <div className="p-6 space-y-6">
            {activeTab === 'invoice' && (
              <>
                {/* Invoice basic information */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">基本信息</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Invoice number */}
                    <div>
                      <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        发票编号 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="invoiceNumber"
                        name="invoiceNumber"
                        value={formData.invoiceNumber}
                        onChange={handleChange}
                        placeholder="例如: FP-20250907-001"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                        required
                        disabled={isEditMode} // Invoice number cannot be changed
                      />
                      {isEditMode && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">发票编号不可修改</p>
                      )}
                    </div>
                    
                    {/* Invoice date */}
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        发票日期 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date.split('T')[0]}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                        required
                      />
                    </div>
                    
                    {/* Invoice type */}
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        发票类型 <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                        required
                      >
                        <option value="vat">增值税发票</option>
                        <option value="maintenance">维修结算单</option>
                      </select>
                    </div>
                    
                    {/* Total amount */}
                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        总金额(元) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                        required
                        readOnly
                      />
                    </div>
                    
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
                  </div>
                </div>
                
                {/* Invoice items section */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">发票项目</h2>
                  
                  <div className="space-y-4">
                    {/* Items header */}
                    <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 text-sm font-medium text-gray-500 dark:text-gray-400 rounded-t-lg">
                      <div className="col-span-5">项目描述</div>
                      <div className="col-span-2 text-center">数量</div>
                      <div className="col-span-2 text-center">单价(元)</div>
                      <div className="col-span-2 text-center">金额(元)</div>
                      <div className="col-span-1 text-center">操作</div>
                    </div>
                    
                    {/* Items list */}
                    <div className="divide-y dark:divide-gray-700">
                      {formData.items.map((item, index) => (
                        <div key={item.id} className="grid grid-cols-12 gap-4 px-4 py-3 items-center">
                          <div className="col-span-5">
                            <input
                              type="text"
                              name="description"
                              value={item.description}
                              onChange={(e) => handleItemChange(index, e)}
                              placeholder="输入项目描述"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200 text-sm"
                              required
                            />
                          </div>
                          
                          <div className="col-span-2">
                            <input
                              type="number"
                              name="quantity"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, e)}
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200 text-sm text-center"
                              required
                            />
                          </div>
                          
                          <div className="col-span-2">
                            <input
                              type="number"
                              name="unitPrice"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(index, e)}
                              step="0.01"
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200 text-sm text-center"
                              required
                            />
                          </div>
                          
                          <div className="col-span-2">
                            <input
                              type="text"
                              name="totalPrice"
                              value={item.totalPrice}
                              readOnly
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 dark:border-gray-600 text-sm text-center"
                            />
                          </div>
                          
                          <div className="col-span-1 text-center">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              disabled={formData.items.length <= 1}
                              className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Add item button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={addItem}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <i className="fa-solid fa-plus-circle mr-2"></i>
                        添加项目
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Invoice photo upload */}
                <div className="mt-6"><h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">发票照片</h2>
                  
                   <ImageUploader
                      maxFiles={1}
                      multiple={false}
                      initialImages={formData.photo ? [formData.photo] : []}
                      onUpload={handlePhotoUpload}
                      buttonText="上传发票照片"
                      maxSize={500} // 限制500KB
                      helpText="支持JPG、PNG格式，文件大小不超过500KB"
                      directoryType="INVOICE_PHOTOS"
                      additionalInfo={{
                        licensePlate: formData.vehicleLicensePlate
                      }}
                    />
                </div>
              </>
            )}
            
            {activeTab === 'ocr' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">OCR发票识别</h2>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                  <h3 className="font-medium text-blue-800 dark:text-blue-300 flex items-center">
                    <i className="fa-solid fa-info-circle mr-2"></i>
                    OCR识别功能
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                    通过上传发票照片，系统将自动识别发票信息并填充到表单中，提高录入效率。
                  </p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      上传发票照片
                    </label>
                    <ImageUploader
                      maxFiles={1}
                      multiple={false}
                      buttonText="选择发票照片"
                      maxSize={2000} // 2MB limit for better OCR accuracy
                      helpText="支持JPG、PNG格式，建议拍摄清晰的发票照片"
                      onUpload={handleOcrUpload}
                    />
                  </div>
                  
                  <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">识别说明</h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-start">
                        <i className="fa-solid fa-check-circle text-green-500 mt-1 mr-2"></i>
                        <span>请拍摄清晰的发票照片，确保文字清晰可见</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fa-solid fa-check-circle text-green-500 mt-1 mr-2"></i>
                        <span>支持增值税专用发票、普通发票和机动车销售统一发票</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fa-solid fa-check-circle text-green-500 mt-1 mr-2"></i>

                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Form actions */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-800 flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => navigate('/invoices')}
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
              ) : isEditMode ? (
                '更新发票'
              ) : (
                '保存发票'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InvoiceForm;