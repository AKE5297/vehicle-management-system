import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockService } from '../../services/mockService';
import { Invoice } from '../../types';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

// Invoice detail component for viewing invoice information
const InvoiceDetail = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch invoice details
  const fetchInvoice = async () => {
    if (!id) {
      toast.error('无效的发票ID');
      navigate('/invoices');
      return;
    }
    
    try {
      setLoading(true);
      const data = await mockService.getInvoiceById(id);
      
      if (data) {
        setInvoice(data);
      } else {
        toast.error('未找到发票信息');
        navigate('/invoices');
      }
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      toast.error('获取发票详情失败');
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchInvoice();
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
        <p className="text-gray-500 dark:text-gray-400">加载发票详情中...</p>
      </div>
    );
  }
  
  if (!invoice) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      {/* Page header with back button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{invoice.invoiceNumber}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {invoice.vehicleLicensePlate} · {formatDate(invoice.date)}
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/invoices')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>返回列表
          </button>
          
          <button
            onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow"
          >
            <i className="fa-solid fa-edit mr-2"></i>编辑发票
          </button>
        </div>
      </div>
      
      {/* Invoice status badge */}
      <div className="flex items-center">
        <span className={cn(
          "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
          invoice.status === 'paid'
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            : invoice.status === 'pending'
            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
        )}>
          <i className={`fa-solid ${invoice.status === 'paid' ? 'fa-check-circle text-xs mr-1.5' : 'fa-clock text-xs mr-1.5'}`}></i>
          {invoice.status === 'paid' ? '已支付' : invoice.status === 'pending' ? '待支付' : '已取消'}
        </span>
        
        <span className={cn(
          "ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
          invoice.type === 'vat'
            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
        )}>
          {invoice.type === 'vat' ? '增值税发票' : '维修结算单'}
        </span>
      </div>
      
      {/* Invoice image */}
      {invoice.photo && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">发票图片</h2>
            <div className="flex justify-center">
              <img
                src={invoice.photo}
                alt={invoice.invoiceNumber}
                className="max-w-full h-auto rounded-lg shadow-md"
                onError={(e) => {
                  // 图片加载失败时显示默认图标
                  const target = e.target as HTMLImageElement;
                  target.src = "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Invoice%20placeholder%20image&sign=ed5fd980678692d165559aa94c6afa57";
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Invoice information cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">基本信息</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">发票编号</p>
                  <p className="font-medium">{invoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">发票日期</p>
                  <p className="font-medium">{formatDate(invoice.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">车牌号</p>
                  <p className="font-medium">{invoice.vehicleLicensePlate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">总金额</p>
                  <p className="font-medium text-lg text-green-600 dark:text-green-400">¥{invoice.amount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Invoice items */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">发票项目</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">项目描述</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">数量</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">单价</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">金额</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">¥{item.unitPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">¥{item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 dark:text-gray-400 text-right">总计:</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">¥{invoice.amount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;