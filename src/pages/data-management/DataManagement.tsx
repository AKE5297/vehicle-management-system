import { useState } from 'react';
import { toast } from 'sonner';
import { mockService } from '../../services/mockService';
import { cn } from '../../lib/utils';

// Data export options
const exportOptions = [
  { id: 'vehicles', name: '车辆数据', description: '导出所有车辆基本信息和状态' },
  { id: 'maintenance', name: '维修记录', description: '导出所有维修工单和配件信息' },
  { id: 'invoices', name: '发票数据', description: '导出所有发票记录和金额统计' },
  { id: 'all', name: '全部数据', description: '导出系统中所有数据' }
];

// File format options
const formatOptions = [
  { id: 'excel', name: 'Excel (.xlsx)', icon: 'fa-file-excel' },
  { id: 'csv', name: 'CSV (.csv)', icon: 'fa-file-csv' },
  { id: 'json', name: 'JSON (.json)', icon: 'fa-file-code' }
];

// Date range presets
const dateRangePresets = [
  { id: 'today', name: '今天' },
  { id: 'yesterday', name: '昨天' },
  { id: '7days', name: '过去7天' },
  { id: '30days', name: '过去30天' },
  { id: 'thisMonth', name: '本月' },
  { id: 'lastMonth', name: '上月' },
  { id: 'custom', name: '自定义' }
];

// Data management and export page
const DataManagement = () => {
  const [selectedData, setSelectedData] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('excel');
  const [selectedDateRange, setSelectedDateRange] = useState('30days');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [exporting, setExporting] = useState(false);
  const [exportHistory, setExportHistory] = useState([
    { id: '1', type: '全部数据', format: 'Excel', date: '2025-09-05', status: 'success' },
    { id: '2', type: '维修记录', format: 'CSV', date: '2025-09-03', status: 'success' },
    { id: '3', type: '车辆数据', format: 'Excel', date: '2025-08-28', status: 'failed' }
  ]);

  // Handle date range change
  const handleDateRangeChange = (presetId: string) => {
    setSelectedDateRange(presetId);
    
    // Auto-fill custom dates for common presets
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    
    switch(presetId) {
      case 'today':
        setCustomDateRange({
          startDate: today.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        });
        break;
      case 'yesterday':
        setCustomDateRange({
          startDate: yesterday.toISOString().split('T')[0],
          endDate: yesterday.toISOString().split('T')[0]
        });
        break;
      case '7days':
        setCustomDateRange({
          startDate: sevenDaysAgo.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        });
        break;
      case '30days':
        setCustomDateRange({
          startDate: thirtyDaysAgo.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        });
        break;
      case 'thisMonth':
        setCustomDateRange({
          startDate: firstDayOfMonth.toISOString().split('T')[0],
          endDate: lastDayOfMonth.toISOString().split('T')[0]
        });
        break;
      case 'lastMonth':
        setCustomDateRange({
          startDate: firstDayOfLastMonth.toISOString().split('T')[0],
          endDate: lastDayOfLastMonth.toISOString().split('T')[0]
        });
        break;
      default:
        // Custom range - leave dates as they are
        break;
    }
  };

  // Handle custom date change
  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomDateRange(prev => ({ ...prev, [name]: value }));
  };

  // Handle export data
  const handleExport = async () => {
    // Validation
    if (selectedDateRange === 'custom' && (!customDateRange.startDate || !customDateRange.endDate)) {
      toast.error('请选择完整的日期范围');
      return;
    }

    setExporting(true);

    try {
      // Get export name and format
      const exportType = exportOptions.find(opt => opt.id === selectedData)?.name || '数据';
      const formatInfo = formatOptions.find(opt => opt.id === selectedFormat);
      
      // Call mock service to export data
      const exportUrl = await mockService.exportData(
        selectedFormat as 'excel' | 'csv' | 'json',
        { 
          type: selectedData,
          startDate: customDateRange.startDate,
          endDate: customDateRange.endDate
        }
      );

      // Create download link
      const link = document.createElement('a');
      link.href = exportUrl;
      link.download = `${exportType}_${new Date().toISOString().split('T')[0]}.${selectedFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update export history
      setExportHistory(prev => [
        { 
          id: Date.now().toString(), 
          type: exportType, 
          format: formatInfo?.name.split(' ')[0] || '文件', 
          date: new Date().toISOString().split('T')[0], 
          status: 'success' 
        },
        ...prev
      ]);

      toast.success(`成功导出${exportType}数据`);
    } catch (error) {
      toast.error('数据导出失败，请重试');
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  // Initialize date range on component mount
  useState(() => {
    handleDateRangeChange('30days');
  }, []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">数据管理</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">导出和管理系统数据，支持多种格式和日期范围筛选</p>
      </div>

      {/* Export options card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">数据导出</h2>

          <div className="space-y-6">
            {/* Data type selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                选择导出数据类型
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {exportOptions.map(option => (
                  <div 
                    key={option.id}
                    className={cn(
                      "border rounded-lg p-4 cursor-pointer transition-all duration-200",
                      selectedData === option.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                    onClick={() => setSelectedData(option.id)}
                  >
                    <div className="font-medium text-gray-900 dark:text-white mb-1">{option.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{option.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* File format selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                选择文件格式
              </label>
              <div className="grid grid-cols-3 gap-3">
                {formatOptions.map(option => (
                  <div 
                    key={option.id}
                    className={cn(
                      "border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 text-center",
                      selectedFormat === option.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                    onClick={() => setSelectedFormat(option.id)}
                  >
                    <i className={`fa-solid ${option.icon} text-2xl mb-2 text-gray-600 dark:text-gray-300`}></i>
                    <div className="font-medium text-sm">{option.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Date range selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                选择日期范围
              </label>

              {/* Date presets */}
              <div className="flex flex-wrap gap-2 mb-4">
                {dateRangePresets.map(preset => (
                  <button
                    key={preset.id}
                    className={cn(
                      "px-3 py-1 text-sm rounded-full transition-colors duration-200",
                      selectedDateRange === preset.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                    )}
                    onClick={() => handleDateRangeChange(preset.id)}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>

              {/* Custom date range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    开始日期
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={customDateRange.startDate}
                    onChange={handleCustomDateChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    结束日期
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={customDateRange.endDate}
                    onChange={handleCustomDateChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Export button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {exporting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    导出中...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-download mr-2"></i>
                    开始导出
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Export history */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">导出历史</h2>

          {exportHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">导出类型</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">文件格式</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">导出日期</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">状态</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {exportHistory.map(record => (
                    <tr key={record.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{record.type}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{record.format}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{record.date}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={cn(
                          "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                          record.status === 'success'
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        )}>
                          {record.status === 'success' ? '成功' : '失败'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400">
                        {record.status === 'success' ? (
                          <button className="hover:text-blue-800 dark:hover:text-blue-300 flex items-center">
                            <i className="fa-solid fa-download mr-1"></i> 下载
                          </button>
                        ) : (
                          <button className="hover:text-blue-800 dark:hover:text-blue-300 flex items-center">
                            <i className="fa-solid fa-redo mr-1"></i> 重试
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <i className="fa-solid fa-clock-rotate-left text-2xl mb-2"></i>
              <p>暂无导出记录</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataManagement;