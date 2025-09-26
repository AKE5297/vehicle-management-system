import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { localDataService } from '../../services/localDataService';
import { cn } from '../../lib/utils';

// 备份历史管理页面
const BackupHistory = () => {
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null);
  
  // 获取备份历史
  useEffect(() => {
    loadBackupHistory();
  }, []);
  
  // 加载备份历史
  const loadBackupHistory = () => {
    setLoading(true);
    try {
      const backupHistory = localDataService.getBackupHistory();
      setBackups(backupHistory);
    } catch (error) {
      console.error('加载备份历史失败:', error);
      toast.error('加载备份历史失败');
      setBackups([]);
    } finally {
      setLoading(false);
    }
  };
  
  // 恢复备份
  const handleRestoreBackup = (backupId: string) => {
    if (window.confirm('确定要从备份恢复数据吗？这将覆盖当前所有数据！')) {
      setLoading(true);
      try {
        const success = localDataService.restoreFromBackup(backupId);
        if (success) {
          toast.success('数据恢复成功，请刷新页面查看更新后的数据');
        } else {
          toast.error('数据恢复失败，请重试');
        }
      } catch (error) {
        console.error('恢复备份失败:', error);
        toast.error('数据恢复失败，请重试');
      } finally {
        setLoading(false);
      }
    }
  };
  
  // 导出备份
  const handleExportBackup = (backupId: string) => {
    try {
      localDataService.exportBackup(backupId);
      toast.success('备份文件导出成功');
    } catch (error) {
      console.error('导出备份失败:', error);
      toast.error('导出备份失败，请重试');
    }
  };
  
  // 删除备份
  const handleDeleteBackup = (backupId: string) => {
    if (window.confirm('确定要删除这个备份吗？删除后无法恢复。')) {
      try {
        const success = localDataService.deleteBackup(backupId);
        if (success) {
          toast.success('备份删除成功');
          loadBackupHistory(); // 重新加载备份历史
        } else {
          toast.error('备份删除失败，请重试');
        }
      } catch (error) {
        console.error('删除备份失败:', error);
        toast.error('备份删除失败，请重试');
      }
    }
  };
  
  // 格式化日期
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
  
  // 格式化文件大小
  const formatSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  };
  
  // 选择备份
  const handleSelectBackup = (backupId: string) => {
    setSelectedBackupId(selectedBackupId === backupId ? null : backupId);
  };
  
  // 手动创建备份
  const handleCreateBackup = () => {
    setLoading(true);
    try {
      localDataService.performBackup();
      toast.success('备份创建成功');
      loadBackupHistory();
    } catch (error) {
      console.error('创建备份失败:', error);
      toast.error('创建备份失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 导入备份文件
  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLoading(true);
      try {
        localDataService.importData(file).then(success => {
          if (success) {
            toast.success('数据导入成功，请刷新页面查看更新后的数据');
          } else {
            toast.error('数据导入失败，请检查文件格式');
          }
        }).catch(error => {
          console.error('导入数据失败:', error);
          toast.error('数据导入失败: ' + error.message);
        }).finally(() => {
          setLoading(false);
          // 重置文件输入
          event.target.value = '';
        });
      } catch (error) {
        console.error('导入数据失败:', error);
        toast.error('数据导入失败，请检查文件格式');
        setLoading(false);
        event.target.value = '';
      }
    }
  };
  
  return (
    <div className="space-y-6">
      {/* 页面标题和操作按钮 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">备份管理</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">管理系统备份、恢复数据和导出导入</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleCreateBackup}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                创建中...
              </>
            ) : (
              <>
                <i className="fa-solid fa-database mr-2"></i>
                创建备份
              </>
            )}
          </button>
          
          <label className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200 cursor-pointer">
            <i className="fa-solid fa-upload mr-2"></i>
            导入备份
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>
      
      {/* 备份统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">备份统计</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">备份总数</span>
              <span className="font-medium">{backups.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">最近备份</span>
              <span className="font-medium">
                {backups.length > 0 
                  ? formatDate(backups[0].date) 
                  : '暂无备份'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">占用空间</span>
              <span className="font-medium">
                {formatSize(backups.reduce((total, backup) => total + (backup.size || 0), 0))}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">备份存储说明</h3>
          <div className="prose dark:prose-invert max-w-none">
            <ul className="space-y-2">
              <li className="flex items-start">
                <i className="fa-solid fa-info-circle text-blue-500 mt-1 mr-2"></i>
                <span>所有备份数据存储在本地浏览器存储中，请定期导出重要备份</span>
              </li>
              <li className="flex items-start">
                <i className="fa-solid fa-exclamation-triangle text-amber-500 mt-1 mr-2"></i>
                <span>清除浏览器数据可能会导致备份丢失，建议定期导出备份文件</span>
              </li>
              <li className="flex items-start">
                <i className="fa-solid fa-check-circle text-green-500 mt-1 mr-2"></i>
                <span>系统会根据设置自动备份数据，您也可以手动创建备份</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* 备份历史列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          // 加载状态
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">加载备份历史中...</p>
          </div>
        ) : backups.length === 0 ? (
          // 空状态
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
              <i className="fa-solid fa-database text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">暂无备份数据</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              还没有创建任何备份。点击"创建备份"按钮开始备份您的数据。
            </p>
            <button
              onClick={handleCreateBackup}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
            >
              <i className="fa-solid fa-plus mr-2"></i>
              创建第一个备份
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">备份日期</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">数据大小</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">版本</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {backups.map((backup) => (
                  <tr 
                    key={backup.id} 
                    className={cn(
                      "hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer",
                      selectedBackupId === backup.id && "bg-blue-50 dark:bg-blue-900/20"
                    )}
                    onClick={() => handleSelectBackup(backup.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(backup.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {backup.size ? formatSize(backup.size) : '未知'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {backup.data?.version || '1.0.0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportBackup(backup.id);
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
                        >
                          <i className="fa-solid fa-download"></i>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestoreBackup(backup.id);
                          }}
                          className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors duration-200"
                        >
                          <i className="fa-solid fa-rotate-right"></i>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBackup(backup.id);
                          }}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-200"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackupHistory;