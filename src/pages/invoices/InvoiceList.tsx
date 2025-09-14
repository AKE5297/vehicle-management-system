import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockService } from '../../services/mockService';
import { Invoice } from '../../types';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import Button from '../../components/ui/Button';

// Invoice list page with complete CRUD operations
const InvoiceList = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  // Fetch invoices data
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await mockService.getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('获取发票列表失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchInvoices();
  }, []);
  
  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.vehicleLicensePlate.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle invoice deletion
  const handleDeleteInvoice = async (invoiceId: string, invoiceNumber: string) => {
    if (window.confirm(`确定要删除发票 ${invoiceNumber} 吗?`)) {
      try {
        await mockService.deleteInvoice(invoiceId);
        toast.success(`发票 ${invoiceNumber} 已删除`);
        fetchInvoices(); // Refresh the invoice list
      } catch (error) {
        console.error('Error deleting invoice:', error);
        toast.error('删除发票失败，请重试');
      }
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">发票管理</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">查看和管理所有发票记录</p>
        </div>
        
        <Link
          to="/invoices/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
        >
          <i className="fa-solid fa-plus mr-2"></i>
          添加新发票
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
            placeholder="搜索发票编号或车牌号..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
          />
        </div>
      </div>
      
      {/* Invoices table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          // Loading state
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">加载发票数据中...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          // Empty state
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
              <i className="fa-solid fa-file-invoice-dollar text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">暂无发票数据</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              没有找到发票记录。请添加新发票或调整搜索条件。
            </p>
            <Link
              to="/invoices/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
            >
              <i className="fa-solid fa-plus mr-2"></i>
              添加新发票
            </Link>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm font-medium text-gray-500 dark:text-gray-400">
              <div className="col-span-2">发票编号</div>
              <div className="col-span-2">日期</div>
              <div className="col-span-2">车牌号</div>
              <div className="col-span-2">金额(元)</div>
              <div className="col-span-2">类型</div>
              <div className="col-span-2 text-right">操作</div>
            </div>
            
            {/* Table rows */}
            <div className="divide-y dark:divide-gray-700">
              {filteredInvoices.map((invoice) => (
                <div 
                  key={invoice.id} 
                  className="group relative"
                >
                  {/* Mobile view */}
                  <div className="md:hidden p-4 border-b dark:border-gray-700 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</div>
                      <span className={cn(
                        "text-xs font-medium px-2.5 py-0.5 rounded-full",
                        invoice.status === 'paid' 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                          : invoice.status === 'pending'
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      )}>
                        {invoice.status === 'paid' ? '已支付' : invoice.status === 'pending' ? '待支付' : '已取消'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-2 text-sm mb-3">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">日期:</span> {new Date(invoice.date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">车牌号:</span> {invoice.vehicleLicensePlate}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">金额:</span> ¥{invoice.amount.toFixed(2)}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">类型:</span> {invoice.type === 'vat' ? '增值税发票' : '维修结算单'}
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="edit"
                        size="sm"
                        icon="fa-edit"
                        onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
                      >
                        编辑
                      </Button>
                      <Button
                        variant="delete"
                        size="sm"
                        icon="fa-trash"
                        onClick={() => handleDeleteInvoice(invoice.id, invoice.invoiceNumber)}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                  
                  {/* Desktop view */}
                  <div className="hidden md:flex items-center px-6 py-4">
                    <div className="col-span-2 font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</div>
                    <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400">{new Date(invoice.date).toLocaleDateString()}</div>
                    <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400">{invoice.vehicleLicensePlate}</div>
                    <div className="col-span-2 font-medium text-gray-900 dark:text-white">¥{invoice.amount.toFixed(2)}</div>
                    <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400">
                      {invoice.type === 'vat' ? '增值税发票' : '维修结算单'}
                    </div>
                    <div className="col-span-2 flex justify-end space-x-3">
                      <Button
                        variant="view"
                        size="sm"
                        icon="fa-eye"
                        onClick={() => navigate(`/invoices/${invoice.id}`)}
                      >
                        查看
                      </Button>
                      <Button
                        variant="edit"
                        size="sm"
                        icon="fa-pen"
                        onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
                      >
                        编辑
                      </Button>
                      <Button
                        variant="delete"
                        size="sm"
                        icon="fa-trash"
                        onClick={() => handleDeleteInvoice(invoice.id, invoice.invoiceNumber)}
                      >
                        删除
                      </Button>
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

export default InvoiceList;