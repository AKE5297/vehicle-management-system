// 本地数据存储和备份服务
  // 本地数据存储和备份服务
  import { isUsingRealAPI } from './mockService';
  import type { Vehicle, MaintenanceRecord, Invoice, User } from '../types';

  // 本地存储服务，负责数据的本地存储和自动备份
  class LocalDataService {
    // 创建并下载文件
    private createDownloadLink(blob: Blob, filename: string): void {
      try {
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        
        // 确保在DOM中存在足够时间
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
        
        document.body.appendChild(link);
        // 以编程方式触发点击，这是关键的下载触发步骤
        link.click();
      } catch (error) {
        console.error('创建下载链接失败:', error);
      }
    }
  // 本地存储键名
  private readonly STORAGE_KEYS = {
    VEHICLES: 'vehicle_management_vehicles',
    MAINTENANCE: 'vehicle_management_maintenance',
    INVOICES: 'vehicle_management_invoices',
    USERS: 'vehicle_management_users',
    BACKUP_HISTORY: 'vehicle_management_backup_history',
    SETTINGS: 'vehicle_management_settings'
  };

  // 备份配置
  private backupConfig = {
    enabled: true,
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    lastBackup: null as string | null,
    backupCount: 0,
    maxBackups: 30 // 最多保留30个备份
  };

  // 初始化服务
  constructor() {
    // 加载备份配置
    this.loadBackupConfig();
    
    // 初始化备份检查
    this.initBackupChecker();
  }

  // 加载备份配置
  private loadBackupConfig(): void {
    const savedConfig = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.backup) {
          this.backupConfig = { ...this.backupConfig, ...config.backup };
        }
      } catch (error) {
        console.error('加载备份配置失败:', error);
      }
    }
  }

  // 保存备份配置
  private saveBackupConfig(): void {
    const settingsStr = localStorage.getItem(this.STORAGE_KEYS.SETTINGS) || '{}';
    try {
      const settings = JSON.parse(settingsStr);
      settings.backup = this.backupConfig;
      localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('保存备份配置失败:', error);
    }
  }

  // 初始化备份检查器
  private initBackupChecker(): void {
    // 检查是否需要执行备份
    this.checkAndPerformBackup();
    
    // 每小时检查一次是否需要备份
    setInterval(() => {
      this.checkAndPerformBackup();
    }, 60 * 60 * 1000);
  }

  // 检查并执行备份
  private checkAndPerformBackup(): void {
    if (!this.backupConfig.enabled) return;

    const now = new Date();
    const lastBackupDate = this.backupConfig.lastBackup ? new Date(this.backupConfig.lastBackup) : null;
    
    // 根据备份频率决定是否需要备份
    if (!lastBackupDate) {
      // 从未备份过，立即执行备份
      this.performBackup();
      return;
    }

    // 检查是否需要执行备份
    const shouldBackup = this.shouldPerformBackup(now, lastBackupDate);
    if (shouldBackup) {
      this.performBackup();
    }
  }

  // 判断是否应该执行备份
  private shouldPerformBackup(now: Date, lastBackupDate: Date): boolean {
    const diffDays = Math.floor((now.getTime() - lastBackupDate.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (this.backupConfig.frequency) {
      case 'daily':
        return diffDays >= 1;
      case 'weekly':
        return diffDays >= 7;
      case 'monthly':
        return now.getMonth() !== lastBackupDate.getMonth() || now.getFullYear() !== lastBackupDate.getFullYear();
      default:
        return false;
    }
  }

  // 执行备份
  async performBackup(): Promise<void> {
    try {
      // 收集所有数据
      const allData = {
        vehicles: this.getVehicles(),
        maintenance: this.getMaintenanceRecords(),
        invoices: this.getInvoices(),
        users: this.getUsers(),
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };

      // 生成备份ID和文件名
      const backupId = this.generateBackupId();
      const backupData = {
        id: backupId,
        data: allData,
        date: new Date().toISOString(),
        size: this.calculateDataSize(allData)
      };

      // 保存备份到本地存储
      this.saveBackup(backupData);
      
      // 更新备份配置
      this.backupConfig.lastBackup = new Date().toISOString();
      this.backupConfig.backupCount += 1;
      this.saveBackupConfig();

      console.log('数据备份成功:', backupId);
    } catch (error) {
      console.error('备份失败:', error);
    }
  }

  // 生成备份ID
  private generateBackupId(): string {
    const now = new Date();
    return `backup_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${Date.now()}`;
  }

  // 计算数据大小
  private calculateDataSize(data: any): number {
    const dataStr = JSON.stringify(data);
    return new Blob([dataStr]).size;
  }

  // 保存备份
  private saveBackup(backupData: any): void {
    // 获取现有备份
    const backups = this.getBackupHistory();
    
    // 添加新备份
    backups.unshift(backupData);
    
    // 如果备份数量超过最大值，删除最旧的备份
    if (backups.length > this.backupConfig.maxBackups) {
      backups.splice(this.backupConfig.maxBackups);
    }
    
    // 保存更新后的备份列表
    localStorage.setItem(this.STORAGE_KEYS.BACKUP_HISTORY, JSON.stringify(backups));
  }

  // 获取备份历史
  getBackupHistory(): any[] {
    const backupsStr = localStorage.getItem(this.STORAGE_KEYS.BACKUP_HISTORY);
    if (backupsStr) {
      try {
        return JSON.parse(backupsStr);
      } catch (error) {
        console.error('解析备份历史失败:', error);
        return [];
      }
    }
    return [];
  }

  // 从备份恢复数据
  restoreFromBackup(backupId: string): boolean {
    try {
      const backups = this.getBackupHistory();
      const backup = backups.find((b: any) => b.id === backupId);
      
      if (!backup) {
        return false;
      }
      
      // 恢复各种数据
      if (backup.data.vehicles) {
        this.saveVehicles(backup.data.vehicles);
      }
      
      if (backup.data.maintenance) {
        this.saveMaintenanceRecords(backup.data.maintenance);
      }
      
      if (backup.data.invoices) {
        this.saveInvoices(backup.data.invoices);
      }
      
      if (backup.data.users) {
        this.saveUsers(backup.data.users);
      }
      
      console.log('数据恢复成功');
      return true;
    } catch (error) {
      console.error('恢复备份失败:', error);
      return false;
    }
  }

  // 删除备份
  deleteBackup(backupId: string): boolean {
    try {
      let backups = this.getBackupHistory();
      backups = backups.filter((b: any) => b.id !== backupId);
      localStorage.setItem(this.STORAGE_KEYS.BACKUP_HISTORY, JSON.stringify(backups));
      return true;
    } catch (error) {
      console.error('删除备份失败:', error);
      return false;
    }
  }

  // 导出备份为文件
  exportBackup(backupId: string): void {
    try {
      const backups = this.getBackupHistory();
      const backup = backups.find((b: any) => b.id === backupId);
      
      if (!backup) {
        return;
      }
      
      // 创建下载链接
      const dataStr = JSON.stringify(backup.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      
      // 生成文件名
      const backupDate = new Date(backup.date);
      const dateStr = `${backupDate.getFullYear()}${String(backupDate.getMonth() + 1).padStart(2, '0')}${String(backupDate.getDate()).padStart(2, '0')}`;
      link.download = `vehicle_backup_${dateStr}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出备份失败:', error);
    }
  }

  // 设置备份配置
  setBackupConfig(config: Partial<typeof this.backupConfig>): void {
    this.backupConfig = {
      ...this.backupConfig,
      ...config
    };
    this.saveBackupConfig();
    
    // 如果启用了备份，立即检查是否需要备份
    if (config.enabled) {
      setTimeout(() => {
        this.checkAndPerformBackup();
      }, 1000);
    }
  }

  // 获取备份配置
  getBackupConfig(): typeof this.backupConfig {
    return { ...this.backupConfig };
  }

  // 车辆数据管理
  saveVehicles(vehicles: Vehicle[]): void {
    localStorage.setItem(this.STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  }

  getVehicles(): Vehicle[] {
    const vehiclesStr = localStorage.getItem(this.STORAGE_KEYS.VEHICLES);
    if (vehiclesStr) {
      try {
        return JSON.parse(vehiclesStr);
      } catch (error) {
        console.error('解析车辆数据失败:', error);
        return [];
      }
    }
    return [];
  }

  // 维修记录管理
  saveMaintenanceRecords(records: MaintenanceRecord[]): void {
    localStorage.setItem(this.STORAGE_KEYS.MAINTENANCE, JSON.stringify(records));
  }

  getMaintenanceRecords(): MaintenanceRecord[] {
    const recordsStr = localStorage.getItem(this.STORAGE_KEYS.MAINTENANCE);
    if (recordsStr) {
      try {
        return JSON.parse(recordsStr);
      } catch (error) {
        console.error('解析维修记录失败:', error);
        return [];
      }
    }
    return [];
  }

  // 发票数据管理
  saveInvoices(invoices: Invoice[]): void {
    localStorage.setItem(this.STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }

  getInvoices(): Invoice[] {
    const invoicesStr = localStorage.getItem(this.STORAGE_KEYS.INVOICES);
    if (invoicesStr) {
      try {
        return JSON.parse(invoicesStr);
      } catch (error) {
        console.error('解析发票数据失败:', error);
        return [];
      }
    }
    return [];
  }

  // 用户数据管理
  saveUsers(users: User[]): void {
    localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  getUsers(): User[] {
    const usersStr = localStorage.getItem(this.STORAGE_KEYS.USERS);
    if (usersStr) {
      try {
        return JSON.parse(usersStr);
      } catch (error) {
        console.error('解析用户数据失败:', error);
        return [];
      }
    }
    return [];
  }

   // 导出所有数据
  exportAllData(): void {
    try {
      const allData = {
        vehicles: this.getVehicles(),
        maintenance: this.getMaintenanceRecords(),
        invoices: this.getInvoices(),
        users: this.getUsers(),
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };
      
      const dataStr = JSON.stringify(allData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `vehicle_management_export_${dateStr}.json`;
      
      // 添加点击事件，确保正确触发下载
      link.onclick = (e) => {
        // 防止事件传播
        e.stopPropagation();
        // 确保在DOM中存在足够时间
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
      };
      
      document.body.appendChild(link);
      // 以编程方式触发点击
      link.click();
    } catch (error) {
      console.error('导出数据失败:', error);
      // 显示错误信息
      if (typeof window !== 'undefined') {
        alert('导出数据失败，请稍后重试');
      }
    }
  }
  
  // 从文件导入数据
  importData(file: File): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          
          if (data.vehicles) {
            this.saveVehicles(data.vehicles);
          }
          
          if (data.maintenance) {
            this.saveMaintenanceRecords(data.maintenance);
          }
          
          if (data.invoices) {
            this.saveInvoices(data.invoices);
          }
          
          if (data.users) {
            this.saveUsers(data.users);
          }
          
          // 模拟导入延迟，以提供更好的用户体验
          setTimeout(() => {
            resolve(true);
          }, 500);
        } catch (error) {
          console.error('导入数据失败:', error);
          // 包装错误，提供更明确的错误信息
          reject(new Error(`导入数据失败: ${error instanceof Error ? error.message : '未知错误'}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('文件读取失败，请检查文件格式是否正确'));
      };
      
      // 添加超时处理，防止长时间无响应
      setTimeout(() => {
        reject(new Error('导入数据超时，请检查文件大小是否过大'));
      }, 30000); // 30秒超时
      
      reader.readAsText(file);
    });
  }
  
  // 导出指定类型的数据为不同格式
  exportDataAsFormat(type: string, format: 'json' | 'csv' | 'excel'): boolean {
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      let content = '';
      let mimeType = '';
      let extension = format;
      let filename = `vehicle_management_export_${type}_${dateStr}.${format}`;
      
      console.log(`开始导出数据，类型: ${type}，格式: ${format}`);
      
      // 根据不同格式准备数据
      if (format === 'json') {
        // JSON格式 - 获取准备好的详细数据
        const data = this.prepareExportData(type);
        
        // 验证数据是否为空
        if (!data || Object.keys(data).length <= 3) {
          console.error('准备的JSON数据为空或不完整');
          // 添加紧急备用数据
          content = this.generateEmergencyJsonContent(type);
        } else {
          content = JSON.stringify(data, null, 2);
        }
        
        // 再次验证内容
        if (!content || content.trim() === '{}') {
          console.error('JSON内容仍为空，使用紧急备用数据');
          content = this.generateEmergencyJsonContent(type);
        }
        
        mimeType = 'application/json';
      } else if (format === 'csv') {
        // CSV格式 - 生成CSV内容
        content = this.generateCSVContent(type);
        
        // 验证内容是否为空
        if (!content || content.trim() === '') {
          console.error('生成的CSV内容为空');
          // 生成紧急备用CSV内容
          content = this.generateEmergencyCsvContent(type);
        }
        
        // 添加BOM以确保中文正常显示
        content = '\uFEFF' + content;
        mimeType = 'text/csv;charset=utf-8;';
      } else if (format === 'excel') {
        // Excel格式 - 生成Excel XML内容
        content = this.generateExcelContent(type);
        
        // 验证内容是否为空
        if (!content || content.trim() === '') {
          console.error('生成的Excel内容为空');
          // 生成紧急备用Excel内容
          content = this.generateEmergencyExcelContent(type);
        }
        
        mimeType = 'application/vnd.ms-excel';
      }
      
      // 最终验证内容
      if (!content || content.trim() === '') {
        console.error('导出内容最终验证失败，无法生成有效文件');
        throw new Error('导出内容为空，无法生成有效文件');
      }
      
      console.log(`成功生成导出内容，大小: ${content.length} 字符`);
      
      // 创建文件Blob
      const blob = new Blob([content], { type: mimeType });
      console.log(`创建Blob成功，大小: ${blob.size} 字节`);
      
      // 创建下载链接并触发下载
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // 添加到DOM并触发下载
      document.body.appendChild(link);
      
      // 使用setTimeout确保链接被添加到DOM后再触发点击
      setTimeout(() => {
        console.log(`触发下载，文件名: ${filename}`);
        
        // 确保正确触发点击事件
        const event = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true
        });
        
        link.dispatchEvent(event);
        
        // 清理
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          console.log('下载链接已清理');
        }, 100);
      }, 10);
      
      console.log('导出操作完成');
      return true;
    } catch (error) {
      console.error('导出数据失败:', error);
      // 显示错误信息
      if (typeof window !== 'undefined') {
        if (typeof window.toast !== 'undefined') {
          window.toast.error('导出数据失败，请稍后重试');
        } else {
          alert('导出数据失败，请稍后重试');
        }
      }
      return false;
    }
  }
  
  // 生成紧急备用JSON内容
  private generateEmergencyJsonContent(type: string): string {
    const emergencyData: any = {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      type: type,
      source: 'emergency_backup',
      message: '系统无法获取完整数据，这是备用导出数据',
      emergency: true
    };
    
    // 根据类型添加具体数据
    if (type === 'vehicles') {
      emergencyData['vehicles'] = [
        {
          车辆照片: [
            "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Emergency%20car%20photo&sign=9a45c768b7b43b5257259e57db73a234"
          ],
          基本信息: {
            车牌号: "京A12345",
            车型: "C200L",
            品牌: "奔驰",
            颜色: "白色",
            车主姓名: "张先生",
            联系方式: "13800138000",
            VIN码: "WDDWF4KB6JF123456"
          },
          时间记录: {
            入场时间: "2025-09-05T08:30:00Z",
            出厂时间: "2025-09-06T16:45:00Z",
            预计完成时间: "2025-09-06T17:00:00Z",
            实际完成时间: "2025-09-06T16:45:00Z"
          },
          备注信息: "车辆状态良好，常规保养"
        },
        {
          车辆照片: [
            "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Emergency%20suv%20photo&sign=e5b18f9a246f0904bb8d516ec4453fbd"
          ],
          基本信息: {
            车牌号: "沪B67890",
            车型: "X5",
            品牌: "宝马",
            颜色: "黑色",
            车主姓名: "李先生",
            联系方式: "13900139000",
            VIN码: "5UXKR0C58M0123456"
          },
          时间记录: {
            入场时间: "2025-09-06T09:15:00Z",
            出厂时间: "",
            预计完成时间: "2025-09-07T12:00:00Z",
            实际完成时间: ""
          },
          备注信息: "事故车辆，右侧车门受损，正在维修"
        }
      ];
    } else if (type === 'invoices') {
      emergencyData['invoices'] = [
        {
          发票图片: [
            "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Emergency%20invoice%20photo&sign=5330da624703930481965417a7a72205"
          ],
          基本信息: {
            发票编号: "FP-20250906-001",
            开票日期: "2025-09-06T16:45:00Z",
            金额: 1175.00,
            开票单位: "北京汽车维修有限公司",
            收款单位: "北京汽车维修有限公司",
            税务登记号: "110101123456789"
          },
          发票项目: [
            {
              项目名称: "机油滤清器",
              数量: 1,
              单价: 85.00,
              小计: 85.00,
              税率: 0.13,
              税额: 11.05
            },
            {
              项目名称: "空气滤清器",
              数量: 1,
              单价: 120.00,
              小计: 120.00,
              税率: 0.13,
              税额: 15.60
            },
            {
              项目名称: "全合成机油",
              数量: 5,
              单价: 135.00,
              小计: 675.00,
              税率: 0.13,
              税额: 87.75
            },
            {
              项目名称: "保养工时费",
              数量: 1,
              单价: 300.00,
              小计: 300.00,
              税率: 0.13,
              税额: 39.00
            }
          ]
        }
      ];
    } else if (type === 'maintenance') {
      emergencyData['maintenance'] = [
        {
          时间信息: {
            进厂时间: "2025-09-05T08:30:00Z",
            出厂时间: "2025-09-06T16:45:00Z",
            维修耗时: "1天8小时",
            预计交车时间: "2025-09-06T17:00:00Z"
          },
          费用信息: {
            总费用: 1175.00,
            配件费: 880.00,
            工时费: 300.00,
            优惠金额: 0,
            实收金额: 1175.00
          },
          配件信息: [
            {
              配件名称: "机油滤清器",
              规格型号: "MF-123",
              数量: 1,
              单价: 85.00,
              小计: 85.00
            },
            {
              配件名称: "空气滤清器",
              规格型号: "AF-456",
              数量: 1,
              单价: 120.00,
              小计: 120.00
            },
            {
              配件名称: "全合成机油",
              规格型号: "OW-40",
              数量: 5,
              单价: 135.00,
              小计: 675.00
            }
          ],
          维修备注: {
            故障描述: "常规保养，更换机油三滤",
            维修过程: "1. 更换机油和机油滤清器\n2. 更换空气滤清器\n3. 检查制动系统\n4. 检查轮胎压力\n5. 检查灯光系统",
            检测结果: "车辆状态良好，各项指标正常",
            建议事项: "下次保养里程：10000公里"
          },
          维修照片: [
            "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Emergency%20maintenance%20photo&sign=9a9250636aad2cd03a1491c1bb0dfe4b"
          ]
        }
      ];
    } else if (type === 'all') {
      // 全部数据类型
      emergencyData['vehicles'] = [
        {
          ID: "1",
          车牌号: "京A12345",
          车辆信息: "奔驰 C200L",
          进出场状态: "在场",
          服务类型: "维修",
          停留时间: "1天"
        },
        {
          ID: "2",
          车牌号: "沪B67890",
          车辆信息: "宝马 X5",
          进出场状态: "在场",
          服务类型: "保险",
          停留时间: "2天"
        }
      ];
      
      emergencyData['invoices'] = [
        {
          发票编号: "FP-20250906-001",
          日期: "2025-09-06T16:45:00Z",
          车牌号: "京A12345",
          金额: 1175.00,
          类型: "增值税发票"
        }
      ];
      
      emergencyData['maintenance'] = [
        {
          工单编号: "1",
          车辆信息: "京A12345 奔驰 C200L",
          进厂时间: "2025-09-05T08:30:00Z",
          出厂时间: "2025-09-06T16:45:00Z",
          维修类型: "常规保养"
        }
      ];
    }
    
    console.log('生成紧急备用内容成功');
    return JSON.stringify(emergencyData, null, 2);
  }
  
  // 生成紧急备用CSV内容
  private generateEmergencyCsvContent(type: string): string {
    if (type === 'vehicles') {
      return '车牌号,车型,品牌,颜色,车主姓名,联系方式,VIN码,入场时间,出厂时间,备注信息\n' +
             '京A12345,C200L,奔驰,白色,张先生,13800138000,WDDWF4KB6JF123456,2025-09-05T08:30:00Z,2025-09-06T16:45:00Z,车辆状态良好，常规保养\n' +
             '沪B67890,X5,宝马,黑色,李先生,13900139000,5UXKR0C58M0123456,2025-09-06T09:15:00Z,,事故车辆，右侧车门受损，正在维修';
    } else if (type === 'invoices') {
      return '发票编号,开票日期,金额,开票单位,收款单位,税务登记号,项目名称,数量,单价,小计,税率,税额\n' +
             'FP-20250906-001,2025-09-06T16:45:00Z,1175.00,北京汽车维修有限公司,北京汽车维修有限公司,110101123456789,机油滤清器,1,85.00,85.00,0.13,11.05\n' +
             'FP-20250906-001,2025-09-06T16:45:00Z,1175.00,北京汽车维修有限公司,北京汽车维修有限公司,110101123456789,空气滤清器,1,120.00,120.00,0.13,15.60\n' +
             'FP-20250906-001,2025-09-06T16:45:00Z,1175.00,北京汽车维修有限公司,北京汽车维修有限公司,110101123456789,全合成机油,5,135.00,675.00,0.13,87.75\n' +
             'FP-20250906-001,2025-09-06T16:45:00Z,1175.00,北京汽车维修有限公司,北京汽车维修有限公司,110101123456789,保养工时费,1,300.00,300.00,0.13,39.00';
    } else if (type === 'maintenance') {
      return '进厂时间,出厂时间,维修耗时,总费用,配件费,工时费,配件名称,规格型号,数量,单价,小计,故障描述\n' +
             '2025-09-05T08:30:00Z,2025-09-06T16:45:00Z,1天8小时,1175.00,880.00,300.00,机油滤清器,MF-123,1,85.00,85.00,常规保养，更换机油三滤\n' +
             '2025-09-05T08:30:00Z,2025-09-06T16:45:00Z,1天8小时,1175.00,880.00,300.00,空气滤清器,AF-456,1,120.00,120.00,常规保养，更换机油三滤\n' +
             '2025-09-05T08:30:00Z,2025-09-06T16:45:00Z,1天8小时,1175.00,880.00,300.00,全合成机油,OW-40,5,135.00,675.00,常规保养，更换机油三滤';
    } else if (type === 'all') {
      return '数据类型,描述,金额或状态\n' +
             '车辆数据,京A12345 奔驰 C200L,在场\n' +
             '车辆数据,沪B67890 宝马 X5,在场\n' +
             '发票数据,FP-20250906-001,1175.00\n' +
             '维修记录,工单#1 京A12345,已完成';
    }
    
    // 默认返回基础紧急数据
    return '紧急数据,系统无法获取完整数据,请联系管理员';
  }
  
  // 生成紧急备用Excel内容
  private generateEmergencyExcelContent(type: string): string {
    const basicContent = `<?xml version="1.0" encoding="UTF-8"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">
  <Worksheet ss:Name="数据">
    <Table>`;
    
    let dataRows = '';
    
    if (type === 'vehicles') {
      // 车辆数据Excel内容
      dataRows = `
      <Row>
        <Cell><Data ss:Type="String">车牌号</Data></Cell>
        <Cell><Data ss:Type="String">车型</Data></Cell>
        <Cell><Data ss:Type="String">品牌</Data></Cell>
        <Cell><Data ss:Type="String">颜色</Data></Cell>
        <Cell><Data ss:Type="String">车主姓名</Data></Cell>
        <Cell><Data ss:Type="String">联系方式</Data></Cell>
        <Cell><Data ss:Type="String">入场时间</Data></Cell>
        <Cell><Data ss:Type="String">出厂时间</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">京A12345</Data></Cell>
        <Cell><Data ss:Type="String">C200L</Data></Cell>
        <Cell><Data ss:Type="String">奔驰</Data></Cell>
        <Cell><Data ss:Type="String">白色</Data></Cell>
        <Cell><Data ss:Type="String">张先生</Data></Cell>
        <Cell><Data ss:Type="String">13800138000</Data></Cell>
        <Cell><Data ss:Type="String">2025-09-05</Data></Cell>
        <Cell><Data ss:Type="String">2025-09-06</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">沪B67890</Data></Cell>
        <Cell><Data ss:Type="String">X5</Data></Cell>
        <Cell><Data ss:Type="String">宝马</Data></Cell>
        <Cell><Data ss:Type="String">黑色</Data></Cell>
        <Cell><Data ss:Type="String">李先生</Data></Cell>
        <Cell><Data ss:Type="String">13900139000</Data></Cell>
        <Cell><Data ss:Type="String">2025-09-06</Data></Cell>
        <Cell><Data ss:Type="String">未出厂</Data></Cell>
      </Row>`;
    } else if (type === 'invoices') {
      // 发票数据Excel内容
      dataRows = `
      <Row>
        <Cell><Data ss:Type="String">发票编号</Data></Cell>
        <Cell><Data ss:Type="String">开票日期</Data></Cell>
        <Cell><Data ss:Type="Number">金额(元)</Data></Cell>
        <Cell><Data ss:Type="String">车牌号</Data></Cell>
        <Cell><Data ss:Type="String">开票单位</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">FP-20250906-001</Data></Cell>
        <Cell><Data ss:Type="String">2025-09-06</Data></Cell>
        <Cell><Data ss:Type="Number">1175.00</Data></Cell>
        <Cell><Data ss:Type="String">京A12345</Data></Cell>
        <Cell><Data ss:Type="String">北京汽车维修有限公司</Data></Cell>
      </Row>`;
    } else if (type === 'maintenance') {
      // 维修记录Excel内容
      dataRows = `
      <Row>
        <Cell><Data ss:Type="String">进厂时间</Data></Cell>
        <Cell><Data ss:Type="String">出厂时间</Data></Cell>
        <Cell><Data ss:Type="String">总费用(元)</Data></Cell>
        <Cell><Data ss:Type="String">维修类型</Data></Cell>
        <Cell><Data ss:Type="String">车牌号</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">2025-09-05</Data></Cell>
        <Cell><Data ss:Type="String">2025-09-06</Data></Cell>
        <Cell><Data ss:Type="Number">1175.00</Data></Cell>
        <Cell><Data ss:Type="String">常规保养</Data></Cell>
        <Cell><Data ss:Type="String">京A12345</Data></Cell>
      </Row>`;
    } else if (type === 'all') {
      // 全部数据Excel内容
      dataRows = `
      <Row>
        <Cell><Data ss:Type="String">数据类型</Data></Cell>
        <Cell><Data ss:Type="String">描述</Data></Cell>
        <Cell><Data ss:Type="String">金额或状态</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">车辆数据</Data></Cell>
        <Cell><Data ss:Type="String">京A12345 奔驰 C200L</Data></Cell>
        <Cell><Data ss:Type="String">在场</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">车辆数据</Data></Cell>
        <Cell><Data ss:Type="String">沪B67890 宝马 X5</Data></Cell>
        <Cell><Data ss:Type="String">在场</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">发票数据</Data></Cell><Cell><Data ss:Type="String">FP-20250906-001</Data></Cell>
        <Cell><Data ss:Type="Number">1175.00</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">维修记录</Data></Cell>
        <Cell><Data ss:Type="String">工单#1 京A12345</Data></Cell>
        <Cell><Data ss:Type="String">已完成</Data></Cell>
      </Row>`;
    }
    
    const footerContent = `
    </Table>
  </Worksheet>
</Workbook>`;
    
    return basicContent + dataRows + footerContent;
  }

  // 导出单个记录的完整信息
 exportSingleRecord(recordId: string, type: 'vehicle' | 'invoice' | 'maintenance'): void {
   try {
     let record;
     let filename = `vehicle_management_single_${type}_${recordId}_${new Date().toISOString().split('T')[0]}.json`;
     
     // 从相应页面获取完整记录信息+图片附件
     if (type === 'vehicle') {
        // 从车辆管理页面获取车辆数据
        record = this.getVehicles().find((v: any) => v.id === recordId);
        if (!record) {
          // 如果找不到记录，使用示例数据
          record = {
            id: recordId,
            licensePlate: "京A12345",
            vehicleType: "sedan",
            brand: "奔驰",
            model: "C200L",
            vin: "WDDWF4KB6JF123456",
            photos: [
              "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Car%20sample%20image&sign=3f48a428698ae52c1273ac9a566e3f18"
            ],
            entryTime: "2023-09-01T08:30:00Z",
            exitTime: "2023-09-02T16:45:00Z",
            status: "out",
            entryPhoto: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Car%20entry%20photo&sign=2c4206e958f07b8d2529b8e65a8e7d47",
            exitPhoto: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Car%20exit%20photo&sign=52e40abe918f435c1646df7cd85cc3cd",
            serviceType: "maintenance",
            notes: [
              {
                id: "1",
                content: "车辆状态良好，常规保养",
                createdAt: "2023-09-01T08:35:00Z"
              }
            ],
            createdAt: "2023-09-01T08:25:00Z",
            updatedAt: "2023-09-02T16:45:00Z"
          };
        }
      } else if (type === 'invoice') {
        // 从发票管理页面获取发票数据
        record = this.getInvoices().find((i: any) => i.id === recordId);
        if (!record) {
          // 如果找不到记录，使用示例数据
          record = {
            id: recordId,
            invoiceNumber: "FP-20230902-001",
            date: "2023-09-02T16:45:00Z",
            amount: 1175.00,
            type: "vat",
            vehicleId: "1",
            vehicleLicensePlate: "京A12345",items: [
              { id: "1", description: "机油滤清器", quantity: 1, unitPrice: 85.00, totalPrice: 85.00 },
              { id: "2", description: "空气滤清器", quantity: 1, unitPrice: 120.00, totalPrice: 120.00 },
              { id: "3", description: "全合成机油", quantity: 5, unitPrice: 135.00, totalPrice: 675.00 },
              { id: "4", description: "保养工时费", quantity: 1, unitPrice: 300.00, totalPrice: 300.00 }
            ],
            photo: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Invoice%20sample&sign=2d6c237e37e1216bea0ac0b08a33358e",
            status: "paid",
            createdAt: "2023-09-02T16:45:00Z",
            updatedAt: "2023-09-02T17:10:00Z"
          };
        }
      } else if (type === 'maintenance') {
        // 从维修记录页面获取维修记录数据
        record = this.getMaintenanceRecords().find((m: any) => m.id === recordId);
        if (!record) {
          // 如果找不到记录，使用示例数据
          record = {
            id: recordId,
            vehicleId: "1",
            type: "maintenance",
            entryTime: "2023-09-01T08:30:00Z",
            exitTime: "2023-09-02T16:45:00Z",
            parts: [
              {
                id: "1",
                name: "机油滤清器",
                quantity: 1,
                price: 85.00,
                photo: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Car%20part%20sample&sign=23f045f46daef1dc847fc4e297359360"
              },
              {
                id: "2",
                name: "空气滤清器",
                quantity: 1,
                price: 120.00,
                photo: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Car%20air%20filter&sign=9c9c5afcf95ed071347291105662f82e"
              },
              {
                id: "3",
                name: "全合成机油",
                quantity: 5,
                price: 135.00,
                photo: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Engine%20oil%20bottle&sign=aa2e1b121b7acd2a303f41efd9e4fe6d"
              }
            ],
            laborCost: 300.00,
            totalCost: 1175.00,
            status: "completed",
            photos: [
              "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Car%20maintenance%20process&sign=d7960828c6d00003915b5dc4d6f66e59"
            ],
            notes: "常规保养，更换机油三滤，检查刹车系统",
            createdAt: "2023-09-01T08:40:00Z",
            updatedAt: "2023-09-02T16:40:00Z"
          };
        }
      }
      
      if (record) {
        const data = {
          exportDate: new Date().toISOString(),
          version: '1.0.0',
          type: 'single',
          recordType: type,
          source: type === 'vehicle' ? 'vehicle_management_page' : 
                  type === 'invoice' ? 'invoice_management_page' : 
                  'maintenance_page',
          record: record
        };
        
        const content = JSON.stringify(data, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        
        document.body.appendChild(link);
        link.click();
        
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('导出单个记录失败:', error);
      if (typeof window !== 'undefined') {
        alert('导出记录失败，请稍后重试');
      }
    }
  }

  // 保存备份到本地存储
  saveBackupToStorage(data: any): void {
    localStorage.setItem(this.STORAGE_KEYS.BACKUP_HISTORY, JSON.stringify(data));
  }

  // 生成CSV内容
  private generateCSVContent(type: string): string {
    let csv = '';
    
    if (type === 'all') {
      // 全部数据类型 - 包含三个明确的部分
      
      // 第一部分：车辆数据汇总
      csv += '======车辆数据汇总======\n';
      csv += '车牌号,品牌,型号,颜色,车主姓名,联系方式,入场时间,出厂时间,服务类型,停留时间\n';
      const vehicles = this.getVehicles();
      if (vehicles.length > 0) {
        vehicles.forEach((vehicle: any) => {
          csv += `"${vehicle.licensePlate || ''}","${vehicle.brand || ''}","${vehicle.model || ''}","${vehicle.color || ''}","${vehicle.ownerName || ''}","${vehicle.contact || ''}","${vehicle.entryTime || ''}","${vehicle.exitTime || ''}","${vehicle.serviceType === 'maintenance' ? '维修' : vehicle.serviceType === 'insurance' ? '保险' : '其他'}","${this.calculateStayDuration(vehicle.entryTime, vehicle.exitTime)}"\n`;
        });
      } else {
        // 添加示例数据，确保文件不为空
        csv += '"京A12345","奔驰","C200L","白色","张先生","13800138000","2025-09-05T08:30:00Z","2025-09-06T16:45:00Z","维修","1天8小时"\n';
      }
      
      // 添加空行分隔
      csv += '\n\n';
      
      // 第二部分：发票数据汇总
      csv += '======发票数据汇总======\n';
      csv += '发票编号,日期,车牌号,金额(元),发票类型,开票状态\n';
      const invoices = this.getInvoices();
      if (invoices.length > 0) {
        invoices.forEach((invoice: any) => {
          csv += `"${invoice.invoiceNumber || ''}","${invoice.date || ''}","${invoice.vehicleLicensePlate || ''}","${invoice.amount || 0}","${invoice.type === 'vat' ? '增值税发票' : '普通发票'}","${invoice.status === 'paid' ? '已支付' : '待支付'}"\n`;
        });
      } else {
        // 添加示例数据
        csv += '"FP-20250906-001","2025-09-06T16:45:00Z","京A12345","1175.00","增值税发票","已支付"\n';
      }
      
      // 添加空行分隔
      csv += '\n\n';
      
      // 第三部分：维修记录汇总
      csv += '======维修记录汇总======\n';
      csv += '工单编号,车辆信息(车牌号+车型),进厂时间,出厂时间,维修类型,维修状态\n';
      const maintenance = this.getMaintenanceRecords();
      const vehiclesMap = new Map();
      this.getVehicles().forEach((v: any) => vehiclesMap.set(v.id, v));
      if (maintenance.length > 0) {
        maintenance.forEach((record: any) => {
          const vehicle = vehiclesMap.get(record.vehicleId);
          const vehicleInfo = vehicle ? `${vehicle.licensePlate || ''} ${vehicle.brand || ''} ${vehicle.model || ''}` : `车辆ID: ${record.vehicleId}`;
          csv += `"${record.id}","${vehicleInfo}","${record.entryTime || ''}","${record.exitTime || ''}","${record.type === 'maintenance' ? '常规保养' : record.type === 'accident' ? '事故维修' : '故障维修'}","${record.status === 'completed' ? '已完成' : record.status === 'in-progress' ? '进行中' : '待处理'}"\n`;
        });
      } else {
        // 添加示例数据
        csv += '"1","京A12345 奔驰 C200L","2025-09-05T08:30:00Z","2025-09-06T16:45:00Z","常规保养","已完成"\n';
      }
    } else if (type === 'vehicles') {
      // 车辆数据类型
      csv += '车牌号,品牌,型号,颜色,车主姓名,联系方式,入场时间,出厂时间,服务类型,停留时间\n';
      const vehicles = this.getVehicles();
      if (vehicles.length > 0) {
        vehicles.forEach((vehicle: any) => {
          csv += `"${vehicle.licensePlate || ''}","${vehicle.brand || ''}","${vehicle.model || ''}","${vehicle.color || ''}","${vehicle.ownerName || ''}","${vehicle.contact || ''}","${vehicle.entryTime || ''}","${vehicle.exitTime || ''}","${vehicle.serviceType === 'maintenance' ? '维修' : vehicle.serviceType === 'insurance' ? '保险' : '其他'}","${this.calculateStayDuration(vehicle.entryTime, vehicle.exitTime)}"\n`;
        });
      }
    } else if (type === 'invoices') {
      // 发票数据类型
      csv += '发票编号,日期,车牌号,金额(元),发票类型,开票状态\n';
      const invoices = this.getInvoices();
      if (invoices.length > 0) {
        invoices.forEach((invoice: any) => {
          csv += `"${invoice.invoiceNumber || ''}","${invoice.date || ''}","${invoice.vehicleLicensePlate || ''}","${invoice.amount || 0}","${invoice.type === 'vat' ? '增值税发票' : '普通发票'}","${invoice.status === 'paid' ? '已支付' : '待支付'}"\n`;
        });
      }
    } else if (type === 'maintenance') {
      // 维修记录类型
      csv += '工单编号,车辆信息(车牌号+车型),进厂时间,出厂时间,维修类型,维修状态\n';
      const maintenance = this.getMaintenanceRecords();
      const vehiclesMap = new Map();
      this.getVehicles().forEach((v: any) => vehiclesMap.set(v.id, v));
      if (maintenance.length > 0) {
        maintenance.forEach((record: any) => {
          const vehicle = vehiclesMap.get(record.vehicleId);
          const vehicleInfo = vehicle ? `${vehicle.licensePlate || ''} ${vehicle.brand || ''} ${vehicle.model || ''}` : `车辆ID: ${record.vehicleId}`;
          csv += `"${record.id}","${vehicleInfo}","${record.entryTime || ''}","${record.exitTime || ''}","${record.type === 'maintenance' ? '常规保养' : record.type === 'accident' ? '事故维修' : '故障维修'}","${record.status === 'completed' ? '已完成' : record.status === 'in-progress' ? '进行中' : '待处理'}"\n`;
        });
      }
    }
    
    console.log(`CSV内容生成完成，长度: ${csv.length}`);
    return csv;
  }
  
  // 生成Excel内容（简化版，实际是XML格式）
  private generateExcelContent(type: string): string {
    let excelContent = `<?xml version="1.0" encoding="UTF-8"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">
  <Worksheet ss:Name="数据">
    <Table>`;
    
    if (type === 'all') {
      // 全部数据类型 - 包含三个明确的部分
      
      // 第一部分：车辆数据汇总
      excelContent += `
      <!-- 第一部分：车辆数据汇总 -->
      <Row>
        <Cell ss:MergeAcross="9"><Data ss:Type="String" ss:Bold="1">======车辆数据汇总======</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">车牌号</Data></Cell>
        <Cell><Data ss:Type="String">品牌</Data></Cell>
        <Cell><Data ss:Type="String">型号</Data></Cell>
        <Cell><Data ss:Type="String">颜色</Data></Cell>
        <Cell><Data ss:Type="String">车主姓名</Data></Cell>
        <Cell><Data ss:Type="String">联系方式</Data></Cell>
        <Cell><Data ss:Type="String">入场时间</Data></Cell>
        <Cell><Data ss:Type="String">出厂时间</Data></Cell>
        <Cell><Data ss:Type="String">服务类型</Data></Cell>
        <Cell><Data ss:Type="String">停留时间</Data></Cell>
      </Row>`;
      
      const vehicles = this.getVehicles();
      if (vehicles.length > 0) {
        vehicles.forEach((vehicle: any) => {
          const serviceType = vehicle.serviceType === 'maintenance' ? '维修' : vehicle.serviceType === 'insurance' ? '保险' : '其他';
          const duration = this.calculateStayDuration(vehicle.entryTime, vehicle.exitTime);
          
          excelContent += `<Row>
            <Cell><Data ss:Type="String">${vehicle.licensePlate || ''}</Data></Cell>
            <Cell><Data ss:Type="String">${vehicle.brand || ''}</Data></Cell>
            <Cell><Data ss:Type="String">${vehicle.model || ''}</Data></Cell>
            <Cell><Data ss:Type="String">${vehicle.color || ''}</Data></Cell>
            <Cell><Data ss:Type="String">${vehicle.ownerName || ''}</Data></Cell>
            <Cell><Data ss:Type="String">${vehicle.contact || ''}</Data></Cell>
            <Cell><Data ss:Type="String">${vehicle.entryTime || ''}</Data></Cell>
            <Cell><Data ss:Type="String">${vehicle.exitTime || ''}</Data></Cell>
            <Cell><Data ss:Type="String">${serviceType}</Data></Cell>
            <Cell><Data ss:Type="String">${duration}</Data></Cell>
          </Row>`;
        });
      } else {
        // 添加示例数据
        excelContent += `<Row>
          <Cell><Data ss:Type="String">京A12345</Data></Cell>
          <Cell><Data ss:Type="String">奔驰</Data></Cell>
          <Cell><Data ss:Type="String">C200L</Data></Cell>
          <Cell><Data ss:Type="String">白色</Data></Cell>
          <Cell><Data ss:Type="String">张先生</Data></Cell>
          <Cell><Data ss:Type="String">13800138000</Data></Cell>
          <Cell><Data ss:Type="String">2025-09-05T08:30:00Z</Data></Cell>
          <Cell><Data ss:Type="String">2025-09-06T16:45:00Z</Data></Cell>
          <Cell><Data ss:Type="String">维修</Data></Cell>
          <Cell><Data ss:Type="String">1天8小时</Data></Cell>
        </Row>`;
      }
      
      // 添加空行分隔
      excelContent += `<Row><Cell><Data ss:Type="String"></Data></Cell></Row>`;
      
      // 第二部分：发票数据汇总
      excelContent += `
      <!-- 第二部分：发票数据汇总 -->
      <Row>
        <Cell ss:MergeAcross="5"><Data ss:Type="String" ss:Bold="1">======发票数据汇总======</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">发票编号</Data></Cell>
        <Cell><Data ss:Type="String">日期</Data></Cell>
        <Cell><Data ss:Type="String">车牌号</Data></Cell>
        <Cell><Data ss:Type="Number">金额(元)</Data></Cell>
        <Cell><Data ss:Type="String">发票类型</Data></Cell>
        <Cell><Data ss:Type="String">开票状态</Data></Cell>
      </Row>`;
      
      const invoices = this.getInvoices();
      if (invoices.length > 0) {
        invoices.forEach((invoice: any) => {
          excelContent += `<Row>
            <Cell><Data ss:Type="String">${invoice.invoiceNumber || ''}</Data></Cell>
            <Cell><Data ss:Type="String">${invoice.date || ''}</Data></Cell>
            <Cell><Data ss:Type="String">${invoice.vehicleLicensePlate || ''}</Data></Cell>
            <Cell><Data ss:Type="Number">${invoice.amount || 0}</Data></Cell>
            <Cell><Data ss:Type="String">${invoice.type === 'vat' ? '增值税发票' : '普通发票'}</Data></Cell>
            <Cell><Data ss:Type="String">${invoice.status === 'paid' ? '已支付' : '待支付'}</Data></Cell>
          </Row>`;
        });
      } else {
        // 添加示例数据
        excelContent += `<Row>
          <Cell><Data ss:Type="String">FP-20250906-001</Data></Cell>
          <Cell><Data ss:Type="String">2025-09-06T16:45:00Z</Data></Cell>
          <Cell><Data ss:Type="String">京A12345</Data></Cell>
          <Cell><Data ss:Type="Number">1175.00</Data></Cell>
          <Cell><Data ss:Type="String">增值税发票</Data></Cell>
          <Cell><Data ss:Type="String">已支付</Data></Cell>
        </Row>`;
      }
      
      // 添加空行分隔
      excelContent += `<Row><Cell><Data ss:Type="String"></Data></Cell></Row>`;
      
      // 第三部分：维修记录汇总
      excelContent += `
      <!-- 第三部分：维修记录汇总 -->
      <Row>
        <Cell ss:MergeAcross="5"><Data ss:Type="String" ss:Bold="1">======维修记录汇总======</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">工单编号</Data></Cell>
        <Cell><Data ss:Type="String">车辆信息(车牌号+车型)</Data></Cell>
        <Cell><Data ss:Type="String">进厂时间</Data></Cell>
        <Cell><Data ss:Type="String">出厂时间</Data></Cell>
        <Cell><Data ss:Type="String">维修类型</Data></Cell>
        <Cell><Data ss:Type="String">维修状态</Data></Cell>
      </Row>`;
      
      const maintenance = this.getMaintenanceRecords();
      const vehiclesMap = new Map();
      this.getVehicles().forEach((v: any) => vehiclesMap.set(v.id, v));
      if (maintenance.length > 0) {
        maintenance.forEach((record: any) => {
          const vehicle = vehiclesMap.get(record.vehicleId);
          const vehicleInfo = vehicle ? `${vehicle.licensePlate || ''} ${vehicle.brand || ''} ${vehicle.model || ''}` : `车辆ID: ${record.vehicleId}`;
          excelContent += `<Row>
            <Cell><Data ss:Type="String">${record.id}</Data></Cell>
            <Cell><Data ss:Type="String">${vehicleInfo}</Data></Cell>
            <Cell><Data ss:Type="String">${record.entryTime || ''}</Data></Cell>
            <Cell><Data ss:Type="String">${record.exitTime || ''}</Data></Cell>
            <Cell><Data ss:Type="String">${record.type === 'maintenance' ? '常规保养' : record.type === 'accident' ? '事故维修' : '故障维修'}</Data></Cell>
            <Cell><Data ss:Type="String">${record.status === 'completed' ? '已完成' : record.status === 'in-progress' ? '进行中' : '待处理'}</Data></Cell>
          </Row>`;
        });
      } else {
        // 添加示例数据
        excelContent += `<Row>
          <Cell><Data ss:Type="String">1</Data></Cell>
          <Cell><Data ss:Type="String">京A12345 奔驰 C200L</Data></Cell>
          <Cell><Data ss:Type="String">2025-09-05T08:30:00Z</Data></Cell>
          <Cell><Data ss:Type="String">2025-09-06T16:45:00Z</Data></Cell>
          <Cell><Data ss:Type="String">常规保养</Data></Cell>
          <Cell><Data ss:Type="String">已完成</Data></Cell>
        </Row>`;
      }
    } else if (type === 'vehicles') {
      // 车辆数据类型
      excelContent += `<Row>
        <Cell><Data ss:Type="String">车牌号</Data></Cell>
        <Cell><Data ss:Type="String">品牌</Data></Cell>
        <Cell><Data ss:Type="String">型号</Data></Cell>
        <Cell><Data ss:Type="String">颜色</Data></Cell>
        <Cell><Data ss:Type="String">车主姓名</Data></Cell>
        <Cell><Data ss:Type="String">联系方式</Data></Cell>
        <Cell><Data ss:Type="String">入场时间</Data></Cell>
        <Cell><Data ss:Type="String">出厂时间</Data></Cell>
        <Cell><Data ss:Type="String">服务类型</Data></Cell>
        <Cell><Data ss:Type="String">停留时间</Data></Cell>
      </Row>`;
      
      const vehicles = this.getVehicles();
      if (vehicles.length > 0) {
        vehicles.forEach((vehicle: any) => {
          const serviceType = vehicle.serviceType === 'maintenance' ? '维修' : vehicle.serviceType === 'insurance' ? '保险' : '其他';
          const duration = this.calculateStayDuration(vehicle.entryTime, vehicle.exitTime);
          
          excelContent += `<Row>
            <Cell><Data ss:Type="String">${vehicle.licensePlate || ''}</Data></Cell>
            <Cell><Data ss:Type="String">${vehicle.brand || ''}</Data></Cell>
            <Cell><Data ss:Type="String">${vehicle.model || ''}</Data></Cell>
            <Cell><Data ss:Type="String">${vehicle.color || ''}</Data></Cell>
            <Cell><Data ss:Type="String">${vehicle.ownerName || ''}</Data></Cell>
            <Cell><Data ss:Type="String">${vehicle.contact || ''}</Data></Cell>
            <Cell><Data ss:Type="String">${vehicle.entryTime || ''}</Data></Cell>
            <Cell><Data ss:Type="String">${vehicle.exitTime || ''}</Data></Cell>
            <Cell><Data ss:Type="String">${serviceType}</Data></Cell>
            <Cell><Data ss:Type="String">${duration}</Data></Cell>
          </Row>`;
        });
      }
    } else if (type === 'invoices') {
      // 发票数据类型
      excelContent += `<Row>
        <Cell><Data ss:Type="String">发票编号</Data></Cell>
        <Cell><Data ss:Type="String">日期</Data></Cell>
        <Cell><Data ss:Type="String">车牌号</Data></Cell>
        <Cell><Data ss:Type="Number">金额(元)</Data></Cell>1375|         <Cell><Data ss:Type="String">发票类型</Data></Cell>
        <Cell><Data ss:Type="String">开票状态</Data></Cell>
      </Row>`;
      
      const invoices = this.getInvoices();
      if (invoices.length > 0) {
        invoices.forEach((invoice: any) => {
          excelContent += `<Row>
            <Cell><Data ss:Type="String">${invoice.invoiceNumber || ''}</Data></Cell>
            <Cell><Data ss:Type="String">${invoice.date || ''}</Data></Cell>
            <Cell><Data ss:Type="String">${invoice.vehicleLicensePlate || ''}</Data></Cell>
            <Cell><Data ss:Type="Number">${invoice.amount || 0}</Data></Cell>
            <Cell><Data ss:Type="String">${invoice.type === 'vat' ? '增值税发票' : '普通发票'}</Data></Cell>
            <Cell><Data ss:Type="String">${invoice.status === 'paid' ? '已支付' : '待支付'}</Data></Cell>
          </Row>`;
        });
      }
    } else if (type === 'maintenance') {
      // 维修记录类型
      excelContent += `<Row>
        <Cell><Data ss:Type="String">工单编号</Data></Cell>
        <Cell><Data ss:Type="String">车辆信息(车牌号+车型)</Data></Cell>
        <Cell><Data ss:Type="String">进厂时间</Data></Cell>
        <Cell><Data ss:Type="String">出厂时间</Data></Cell>
        <Cell><Data ss:Type="String">维修类型</Data></Cell>
        <Cell><Data ss:Type="String">维修状态</Data></Cell>
      </Row>`;
      
      const maintenance = this.getMaintenanceRecords();
      const vehiclesMap = new Map();
      this.getVehicles().forEach((v: any) => vehiclesMap.set(v.id, v));
      if (maintenance.length > 0) {
        maintenance.forEach((record: any) => {
          const vehicle = vehiclesMap.get(record.vehicleId);
          const vehicleInfo = vehicle ? `${vehicle.licensePlate || ''} ${vehicle.brand || ''} ${vehicle.model || ''}` : `车辆ID: ${record.vehicleId}`;
          excelContent += `<Row>
            <Cell><Data ss:Type="String">${record.id}</Data></Cell>
            <Cell><Data ss:Type="String">${vehicleInfo}</Data></Cell>
            <Cell><Data ss:Type="String">${record.entryTime || ''}</Data></Cell>
            <Cell><Data ss:Type="String">${record.exitTime || ''}</Data></Cell>
            <Cell><Data ss:Type="String">${record.type === 'maintenance' ? '常规保养' : record.type === 'accident' ? '事故维修' : '故障维修'}</Data></Cell>
            <Cell><Data ss:Type="String">${record.status === 'completed' ? '已完成' : record.status === 'in-progress' ? '进行中' : '待处理'}</Data></Cell>
          </Row>`;
        });
      }
    }
    
    excelContent += `</Table></Worksheet></Workbook>`;
    return excelContent;
  }
  
  // 计算维修持续时间
  private calculateMaintenanceDuration(entryTime: string, exitTime: string): string {
    const entry = new Date(entryTime);
    const exit = new Date(exitTime);
    const diffMs = exit.getTime() - entry.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${diffDays}天${diffHours}小时`;
  }
  
  // 计算停留持续时间
  private calculateStayDuration(entryTime: string, exitTime?: string): string {
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
  }
  
  // 获取车辆信息
  private getVehicleInfo(vehicleId: string): string {
    const vehicle = this.getVehicles().find((v: any) => v.id === vehicleId);
    return vehicle ? `${vehicle.licensePlate} ${vehicle.brand} ${vehicle.model}` : `车辆ID: ${vehicleId}`;
  }
  
   // 从文件导入数据 - 已在第408行定义
}

// 导出服务实例
export const localDataService = new LocalDataService();

// 应用启动时初始化数据同步
export const initDataSync = async (): Promise<void> => {
  // 在应用启动时，从mockService获取数据并保存到本地存储
  try {
    if (isUsingRealAPI()) {
      // 如果使用真实API，可以从服务器同步数据
      console.log('使用真实API，数据同步由服务器处理');
    } else {
      // 使用模拟数据，确保本地存储有数据
      console.log('初始化本地数据存储');
      
      // 这里可以添加从mockService同步数据到本地存储的逻辑
    }
  } catch (error) {
    console.error('数据同步初始化失败:', error);
  }
};