import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockService } from '../../services/mockService';
import { Invoice } from '../../types';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { useThemeContext } from '../../contexts/ThemeContext';

// Invoice list page with search, filter and pagination
const InvoiceList: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useThemeContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [invoicesPerPage] = useState(10);
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

  // Filter invoices based on search and filters
  const filteredInvoices = invoices.filter(invoice => {
    // Search term filter (matches invoice number, vehicle license plate)
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.vehicleLicensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.amount.toString().includes(searchTerm);
    
    // Status filter
    const matchesStatus = 
      filterStatus === 'all' || 
      invoice.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const indexOfLastInvoice = currentPage * invoicesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);
  const totalPages = Math.ceil(filteredInvoices.length / invoicesPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Handle invoice deletion
  const handleDeleteInvoice = async (invoiceId: string, invoiceNumber: string) => {
    if (window.confirm(`确定要删除发票 ${invoiceNumber} 吗?`)) {
      try {
        await mockService.deleteInvoice(invoiceId);
        toast.success(`发票 ${invoiceNumber} 已删除`);
        fetchInvoices(); // Refresh invoice list
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
          <p className="text-gray-500 dark:text-gray-400 mt-1">查看和管理所有发票信息、结算状态和详细记录</p>
        </div>
        
        <Link
          to="/invoices/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <i className="fa-solid fa-plus mr-2"></i>
          添加新发票
        </Link>
      </div>
      
      {/* Search and filter section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fa-solid fa-search text-gray-400"></i>
            </div>
            <input
              type="text"
              placeholder="搜索发票编号、车牌号或金额..."
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
            <option value="all" className={filterStatus === 'all' ? 'bg-blue-100 dark:bg-blue-900 font-medium' : ''}>所有状态</option>
            <option value="pending" className={filterStatus === 'pending' ? 'bg-blue-100 dark:bg-blue-900 font-medium' : ''}>待支付</option>
            <option value="paid" className={filterStatus === 'paid' ? 'bg-blue-100 dark:bg-blue-900 font-medium' : ''}>已支付</option>
            <option value="cancelled" className={filterStatus === 'cancelled' ? 'bg-blue-100 dark:bg-blue-900 font-medium' : ''}>已取消</option>
          </select>
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
              没有找到符合当前筛选条件的发票。请尝试调整搜索条件或添加新发票。
            </p>
            <Link
              to="/invoices/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <i className="fa-solid fa-plus mr-2"></i>
              添加新发票
            </Link>
          </div>
        ) : (
          <>
             {/* Table header */}
             <div className="hidden md:grid grid-cols-12 gap-0 px-6 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm font-semibold text-gray-500 dark:text-gray-200 data-table">
               <div className="col-span-3 data-table-cell">发票编号</div>
               <div className="col-span-2 data-table-cell">日期</div>
               <div className="col-span-2 data-table-cell">车牌号</div>
               <div className="col-span-2 data-table-cell">金额(元)</div>
               <div className="col-span-1 data-table-cell">类型</div>
               <div className="col-span-2 data-table-cell text-right">操作</div>
            </div>
            
            {/* Table rows */}
            <div className="divide-y dark:divide-gray-700">
              {currentInvoices.map((invoice) => (
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
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                        : invoice.status === 'pending'
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200")}>
                        {invoice.status === 'paid' ? '已支付' : invoice.status === 'pending' ? '待支付' : '已取消'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-2 text-sm mb-3">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">日期:</span> {formatDate(invoice.date)}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">车牌号:</span> {invoice.vehicleLicensePlate}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">金额:</span> ¥{invoice.amount.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
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
                  
                  {/* Desktop view */}
                  <div className="hidden md:grid grid-cols-12 items-center px-6 py-4 divide-y dark:divide-gray-700">
                    <div className="col-span-3 data-table-cell">
                      {invoice.invoiceNumber}
                    </div>
                    <div className="col-span-2 data-table-cell">
                      {formatDate(invoice.date)}
                    </div>
                    <div className="col-span-2 data-table-cell">
                      {invoice.vehicleLicensePlate}
                    </div>
                    <div className="col-span-2 data-table-cell">
                      ¥{invoice.amount.toFixed(2)}
                    </div>
                    <div className="col-span-1 data-table-cell">
                      {invoice.type === 'vat' ? '增值税发票' : '维修结算单'}
                    </div>
                    <div className="col-span-2 data-table-cell flex justify-end space-x-3">
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
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t dark:border-gray-700 flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  显示 {indexOfFirstInvoice + 1} 到 {Math.min(indexOfLastInvoice, filteredInvoices.length)} 条，共 {filteredInvoices.length} 条
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

export default InvoiceList;