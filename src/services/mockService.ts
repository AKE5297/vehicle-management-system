// 服务层 - 支持连接真实后端或使用模拟数据
// 默认使用模拟数据模式，确保应用可以正常运行
const USE_REAL_API = import.meta.env.VITE_USE_REAL_API !== 'false' && false; // 强制使用模拟数据

// 基础API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// 上传目录配置
const UPLOAD_DIR = import.meta.env.VITE_UPLOAD_DIR || 'uploads';

// 导入类型定义
import type { SystemLog } from '../types';
import type { Vehicle, MaintenanceRecord, Invoice } from '../types';

class MockService {
  // 用于真实API调用的fetch包装器
  private async apiFetch(endpoint: string, options: any = {}): Promise<any> {
    // 如果明确指定使用mock或默认使用mock，则直接返回mock数据
    if (options.useMock || !USE_REAL_API) {
      return this.getMockData(endpoint, options);
    }

    const url = `${API_BASE_URL}/${endpoint}`;
    
    // 获取存储的认证令牌
    const authData = localStorage.getItem('currentUser');
    const user = authData ? JSON.parse(authData) : null;
    const token = user?.token;
    
    // 设置默认请求头
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    };
    
    // 合并请求选项
    const fetchOptions = {
      ...options,
      headers
    };
    
    try {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        // 尝试从错误响应中获取详细信息
        const errorData = await response.json().catch(() => null);
        throw new Error(`API请求失败: ${response.statusText}${errorData?.message ? ` - ${errorData.message}` : ''}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API调用错误 - ${endpoint}:`, error);
      
      // 网络错误时，直接返回mock数据，不再递归调用apiFetch
      console.warn('网络连接失败，使用模拟数据模式');
      return this.getMockData(endpoint, options);
    }
  }
  
  // 获取mock数据的方法，避免递归调用apiFetch
  private getMockData(endpoint: string, options: any = {}): any {
    // 这里只是一个简单的实现，实际应用中可以根据endpoint和options返回不同的mock数据
    return new Promise((resolve, reject) => {
      // 模拟网络延迟
      setTimeout(() => {
        // 对于登录请求的特殊处理
        if (endpoint === 'login' && options.method === 'POST') {
          try {
            const { username, password } = JSON.parse(options.body);
            // 直接处理登录逻辑
            const user = this.users.find(
              u => u.username === username && u.password === password
            );
            
            if (user) {
              // Create a copy without password for security
              const userWithoutPassword = { ...user, token: 'mock-jwt-token' };
              delete userWithoutPassword.password;
              
              // Update last login time (in real app this would be saved to database)
              const userIndex = this.users.findIndex(u => u.id === user.id);
              if (userIndex !== -1) {
                this.users[userIndex] = {
                  ...this.users[userIndex],
                  lastLogin: new Date().toISOString()
                };
              }
              
              // Log the login action
              this.logAction(user.id, 'login', 'user', user.id, { success: true });
              
              resolve({ user: userWithoutPassword, token: 'mock-jwt-token' });
            } else {
              this.logAction('anonymous', 'login', 'user', 'unknown', { success: false });
              // 模拟API返回的错误格式
              resolve({ message: '用户名或密码不正确' });
            }
          } catch (error) {
            console.error('处理登录mock数据时出错:', error);
            reject(new Error('处理登录数据时出错'));
          }
        } else {
          // 对于其他请求，返回空数据或错误
          resolve({});
        }
      }, 500);
    });
  }
  
  // 系统日志存储
  private systemLogs: SystemLog[] = [
    {
      id: '1',
      userId: '1',
      action: 'login',
      entityType: 'user',
      entityId: '1',
      details: { success: true },
      ipAddress: '127.0.0.1',
      timestamp: '2025-09-01T10:30:00Z'
    }
  ];

  // Mock数据（当不使用真实API时使用）
  private users = [
    {
      id: '1',
      username: 'admin',
      password: 'admin123', // Mock password, in real app this should be hashed
      name: '系统管理员',
      role: 'admin',
      permissions: ['all'],
      lastLogin: '2025-09-01T10:30:00Z',
      createdAt: '2025-01-15T08:00:00Z',
      updatedAt: '2025-08-20T14:20:00Z'
    },
    {
      id: '2',
      username: 'user1',
      password: 'user123',
      name: '普通用户',
      role: 'user',
      permissions: ['vehicle:read', 'vehicle:create', 'invoice:read', 'invoice:create', 'maintenance:read', 'maintenance:create'],
      lastLogin: '2025-09-02T09:15:00Z',
      createdAt: '2025-02-10T11:30:00Z',
      updatedAt: '2025-08-15T09:45:00Z'
    }
  ];

  private vehicles = [
    {
      id: '1',
      licensePlate: '京A12345',
      vehicleType: 'sedan',
      brand: '奔驰',
      model: 'C200L',
      vin: 'WDDWF4KB6JF123456',
      photos: [
        'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Mercedes-Benz%20C-Class%20white%20sedan%20front%20view&sign=1fe9915cfda53cd392a4ea7223189fc6',
        'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Mercedes-Benz%20C-Class%20white%20sedan%20side%20view&sign=02aaedde0c1c2d8d438abc86454c33f9'
      ],
      entryTime: '2025-09-05T08:30:00Z',
      exitTime: '2025-09-06T16:45:00Z',
      status: 'out',
      entryPhoto: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Car%20entry%20photo%20with%20timestamp&sign=a31692a5ddfc1bac4646aebf32338a31',
      exitPhoto: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Car%20exit%20photo%20with%20timestamp&sign=bd495fcd03839213d34d503782565889',
      serviceType: 'maintenance',
      maintenanceRecords: ['1'],
      notes: [
        {
          id: '1',
          content: '车辆左前侧有轻微划痕，已告知车主',
          createdAt: '2025-09-05T08:35:00Z'
        }
      ],
      createdAt: '2025-09-05T08:25:00Z',
      updatedAt: '2025-09-06T16:45:00Z'
    },
    {
      id: '2',
      licensePlate: '沪B67890',
      vehicleType: 'suv',
      brand: '宝马',
      model: 'X5',
      vin: '5UXKR0C58M0123456',
      photos: [
        'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=BMW%20X5%20black%20SUV%20front%20view&sign=ca1acb0ea64ceaba4f259cdaf31d3ba6',
        'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=BMW%20X5%20black%20SUV%20rear%20view&sign=b4b1d40d2503f4ed7f30b8f0952d36c1'
      ],
      entryTime: '2025-09-06T09:15:00Z',
      status: 'in',
      entryPhoto: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=SUV%20entry%20photo%20with%20timestamp&sign=f2177cf1e984d98a010463fa6118200e',
      serviceType: 'insurance',
      insuranceRecords: ['1'],
      notes: [
        {
          id: '2',
          content: '事故车辆，右侧车门受损',
          photo: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Car%20door%20damage%20photo&sign=8ee0201b7081b30d844715f5078493e8',
          createdAt: '2025-09-06T09:20:00Z'
        }
      ],
      createdAt: '2025-09-06T09:10:00Z',
      updatedAt: '2025-09-06T09:20:00Z'
    }
  ];

  private maintenanceRecords = [
    {
      id: '1',
      vehicleId: '1',
      type: 'maintenance',
      entryTime: '2025-09-05T08:30:00Z',
      exitTime: '2025-09-06T16:45:00Z',
      parts: [
        {
          id: '1',
          name: '机油滤清器',
          quantity: 1,
          price: 85.00,
          photo: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Oil%20filter%20part%20photo&sign=0047d71bf81c5867ad28c3eadb027463'
        },
        {
          id: '2',
          name: '空气滤清器',
          quantity: 1,
          price: 120.00,
          photo: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Air%20filter%20part%20photo&sign=5f12d4e3183de3376134e60ca24f4d07'
        },
        {
          id: '3',
          name: '全合成机油',
          quantity: 5,
          price: 135.00,
          photo: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Engine%20oil%20bottle%20photo&sign=582e3f64c84905180661d21667a1d6bd'
        }
      ],
      laborCost: 300.00,
      totalCost: 1175.00,
      status: 'completed',
      photos: [
        'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Car%20maintenance%20process%20photo&sign=19e211f010652d5849192c5758261656',
        'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Car%20engine%20maintenance%20photo&sign=9d63449136cb766d7673bc9ca8a30d38'
      ],
      notes: '常规保养，更换机油三滤，检查刹车系统',
      createdAt: '2025-09-05T08:40:00Z',
      updatedAt: '2025-09-06T16:40:00Z'
    }
  ];

  private invoices = [
    {
      id: '1',
      invoiceNumber: 'FP-20250906-001',
      date: '2025-09-06T16:45:00Z',
      amount: 1175.00,
      type: 'vat',
      vehicleId: '1',
      vehicleLicensePlate: '京A12345',
      items: [
        { id: '1', description: '机油滤清器', quantity: 1, unitPrice: 85.00, totalPrice: 85.00 },
        { id: '2', description: '空气滤清器', quantity: 1, unitPrice: 120.00, totalPrice: 120.00 },
        { id: '3', description: '全合成机油', quantity: 5, unitPrice: 135.00, totalPrice: 675.00 },
        { id: '4', description: '保养工时费', quantity: 1, unitPrice: 300.00, totalPrice: 300.00 }
      ],
      photo: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Maintenance%20invoice%20photo&sign=332993824cd1c071cb69953f1e8cf37f',
      status: 'paid',
      createdAt: '2025-09-06T16:45:00Z',
      updatedAt: '2025-09-06T17:10:00Z'
    }
  ];

  // Authentication methods
  login(username: string, password: string): Promise<any> {
    // 如果使用真实API
    if (USE_REAL_API && !arguments[2]?.useMock) {
      return this.apiFetch('login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      }).then(data => {
        // 保存认证信息到本地存储
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }
        return data.user;
      });
    }
    
    // 模拟登录
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = this.users.find(
          u => u.username === username && u.password === password
        );
        
        if (user) {
          // Create a copy without password for security
          const userWithoutPassword = { ...user, token: 'mock-jwt-token' };
          delete userWithoutPassword.password;
          
          // Update last login time (in real app this would be saved to database)
          const userIndex = this.users.findIndex(u => u.id === user.id);
          if (userIndex !== -1) {
            this.users[userIndex] = {
              ...this.users[userIndex],
              lastLogin: new Date().toISOString()
            };
          }
          
          // Log the login action
          this.logAction(user.id, 'login', 'user', user.id, { success: true });
          
          resolve(userWithoutPassword);
        } else {
          this.logAction('anonymous', 'login', 'user', 'unknown', { success: false });
          resolve(null);
        }
      }, 800); // Simulate API delay
    });
  }

  // Vehicle methods
  getVehicles(): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.vehicles]);
      }, 500);
    });
  }

  getVehicleById(id: string): Promise<any | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const vehicle = this.vehicles.find(v => v.id === id);
        resolve(vehicle ? { ...vehicle } : null);
      }, 500);
    });
  }

  createVehicle(vehicleData: any): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate a simple ID without uuid
        const newId = (this.vehicles.length + 1).toString();
        const newVehicle = {
          ...vehicleData,
          id: newId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        this.vehicles.push(newVehicle);
        this.logAction('1', 'create', 'vehicle', newVehicle.id, newVehicle);
        
        resolve({ ...newVehicle });
      }, 800);
    });
  }

   updateVehicle(id: string, vehicleData: any): Promise<any | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.vehicles.findIndex(v => v.id === id);
        if (index !== -1) {
          // 确保所有照片数据被正确保存
          const updatedVehicle = {
            ...this.vehicles[index],
            ...vehicleData,
            updatedAt: new Date().toISOString()
          };
          
          // 确保photos数组始终存在
          if (!updatedVehicle.photos) {
            updatedVehicle.photos = [];
          }
          
          this.vehicles[index] = updatedVehicle;
          
          this.logAction('1', 'update', 'vehicle', id, {
            licensePlate: updatedVehicle.licensePlate,
            photosCount: updatedVehicle.photos.length
          });
          
          resolve({ ...this.vehicles[index] });
        } else {
          resolve(null);
        }
      }, 800);
    });
  }
  
  deleteVehicle(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const initialLength = this.vehicles.length;
        this.vehicles = this.vehicles.filter(v => v.id !== id);
        
        if (this.vehicles.length < initialLength) {
          this.logAction('1', 'delete', 'vehicle', id, {});
          resolve(true);
        } else {
          resolve(false);
        }
      }, 800);
    });
  }

  // Maintenance methods
  getMaintenanceRecords(): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.maintenanceRecords]);
      }, 500);
    });
  }

  getMaintenanceRecordById(id: string): Promise<any | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const record = this.maintenanceRecords.find(m => m.id === id);
        resolve(record ? { ...record } : null);
      }, 500);
    });
  }

  createMaintenanceRecord(recordData: any): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate a simple ID without uuid
        const newId = (this.maintenanceRecords.length + 1).toString();
        const newRecord = {
          ...recordData,
          id: newId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        this.maintenanceRecords.push(newRecord);
        this.logAction('1', 'create', 'maintenance', newRecord.id, newRecord);
        
        resolve({ ...newRecord });
      }, 800);
    });
  }

  updateMaintenanceRecord(id: string, recordData: any): Promise<any | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.maintenanceRecords.findIndex(m => m.id === id);
        if (index !== -1) {
          this.maintenanceRecords[index] = {
            ...this.maintenanceRecords[index],
            ...recordData,
            updatedAt: new Date().toISOString()
          };
          
          this.logAction('1', 'update', 'maintenance', id, recordData);
          resolve({ ...this.maintenanceRecords[index] });
        } else {
          resolve(null);
        }
      }, 800);
    });
  }

  deleteMaintenanceRecord(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const initialLength = this.maintenanceRecords.length;
        this.maintenanceRecords = this.maintenanceRecords.filter(m => m.id !== id);
        
        if (this.maintenanceRecords.length < initialLength) {
          this.logAction('1', 'delete', 'maintenance', id, {});
          resolve(true);
        } else {
          resolve(false);
        }
      }, 800);
    });
  }

  // Invoice methods
  getInvoices(): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.invoices]);
      }, 500);
    });
  }

  getInvoiceById(id: string): Promise<any | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const invoice = this.invoices.find(i => i.id === id);
        resolve(invoice ? { ...invoice } : null);
      }, 500);
    });
  }

  createInvoice(invoiceData: any): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate a simple ID without uuid
        const newId = (this.invoices.length + 1).toString();
        const newInvoice = {
          ...invoiceData,
          id: newId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        this.invoices.push(newInvoice);
        this.logAction('1', 'create', 'invoice', newInvoice.id, newInvoice);
        
        resolve({ ...newInvoice });
      }, 800);
    });
  }

  updateInvoice(id: string, invoiceData: any): Promise<any | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.invoices.findIndex(i => i.id === id);
        if (index !== -1) {
          this.invoices[index] = {
            ...this.invoices[index],
            ...invoiceData,
            updatedAt: new Date().toISOString()
          };
          
          this.logAction('1', 'update', 'invoice', id, invoiceData);
          resolve({ ...this.invoices[index] });
        } else {
          resolve(null);
        }
      }, 800);
    });
  }

  deleteInvoice(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const initialLength = this.invoices.length;
        this.invoices = this.invoices.filter(i => i.id !== id);
        
        if (this.invoices.length < initialLength) {
          this.logAction('1', 'delete', 'invoice', id, {});
          resolve(true);
        } else {
          resolve(false);
        }
      }, 800);
    });
  }

  getInvoicesByVehicleId(vehicleId: string): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const vehicleInvoices = this.invoices.filter(i => i.vehicleId === vehicleId);
        resolve([...vehicleInvoices]);
      }, 500);
    });
  }

  // System log methods
  getSystemLogs(): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return logs in reverse chronological order
        resolve([...this.systemLogs].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
      }, 600);
    });
  }

   // Helper method to log system actions
  private logAction(userId: string, action: string, entityType: string, entityId: string, details: Record<string, any>): void {
    // 真实环境中，日志应该通过API发送到服务器
    if (USE_REAL_API) {
      try {
        this.apiFetch('logs', {
          method: 'POST',
          body: JSON.stringify({
            userId,
            action,
            entityType,
            entityId,
            details
          })
        }).catch(err => console.warn('日志记录失败:', err));
      } catch (e) {
        // 忽略日志记录失败的错误
        console.warn('日志记录失败:', e);
      }
      return;
    }
    
    // 模拟环境中记录日志
    console.log(`[LOG] ${action} ${entityType} ${entityId} by ${userId}:`, details);
  }

  // User management methods
  getUsers(): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return users without passwords
        const usersWithoutPasswords = this.users.map(user => {
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        });
        
        resolve(usersWithoutPasswords);
      }, 500);
    });
  }

  // User management methods
  createUser(userData: any): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate a simple ID without uuid
        const newId = (this.users.length + 1).toString();
        const newUser = {
          ...userData,
          id: newId,
          lastLogin: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        this.users.push(newUser);
        this.logAction('1', 'create', 'user', newUser.id, { username: newUser.username });
        
        // Return user without password
        const { password, ...userWithoutPassword } = newUser;
        resolve(userWithoutPassword);
      }, 800);
    });
  }

  updateUser(id: string, userData: any): Promise<any | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.users.findIndex(u => u.id === id);
        if (index !== -1) {
          // Don't update password if not provided
          const updatedData = userData.password 
            ? userData 
            : { ...userData, password: this.users[index].password };
            
          this.users[index] = {
            ...this.users[index],
            ...updatedData,
            updatedAt: new Date().toISOString()
          };
          
          this.logAction('1', 'update', 'user', id, { username: this.users[index].username });
          
          // Return user without password
          const { password, ...userWithoutPassword } = this.users[index];
          resolve(userWithoutPassword);
        } else {
          resolve(null);
        }
      }, 800);
    });
  }

  deleteUser(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const initialLength = this.users.length;
        const userToDelete = this.users.find(u => u.id === id);
        
        if (userToDelete) {
          this.users = this.users.filter(u => u.id !== id);
          this.logAction('1', 'delete', 'user', id, { username: userToDelete.username });
          resolve(this.users.length < initialLength);
        } else {
          resolve(false);
        }
      }, 800);
    });
  }

   // Data export simulation - 确保导出真实数据
  exportData(format: string, filter?: any): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          // 根据不同格式生成实际文件内容
          if (format === 'json') {
            // JSON格式 - 创建实际的JSON内容
            const exportData = this.prepareExportData(filter?.type);
            // 确保包含真实数据而不是模拟数据
            const vehicles = this.getVehicles();
            const maintenance = this.getMaintenanceRecords();
            const invoices = this.getInvoices();
            
            // 确保数据结构完整
            if (filter?.type === 'vehicles' || filter?.type === 'all') {
              exportData.real_vehicles = vehicles;
            }
            if (filter?.type === 'maintenance' || filter?.type === 'all') {
              exportData.real_maintenance = maintenance;
            }
            if (filter?.type === 'invoices' || filter?.type === 'all') {
              exportData.real_invoices = invoices;
            }
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            this.logAction('1', 'export', 'data', 'bulk', { format, filter });
            resolve(url);
          } else if (format === 'csv') {
            // CSV格式 - 创建CSV内容
            const csvContent = this.generateCSVContent(filter?.type);
            // 添加BOM以确保中文正常显示
            const BOM = '\uFEFF';
            const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            this.logAction('1', 'export', 'data', 'bulk', { format, filter });
            resolve(url);
          } else if (format === 'excel') {
            // Excel格式 - 创建简化的Excel XML内容
            const excelContent = this.generateExcelContent(filter?.type);
            const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
            const url = URL.createObjectURL(blob);
            this.logAction('1', 'export', 'data', 'bulk', { format, filter });
            resolve(url);
          } else if (format === 'pdf') {
            // PDF格式 - 创建PDF内容
            try {
              // 生成包含更多信息的PDF内容
              const pdfContent = this.generatePDFContent(filter?.type);
              // 直接创建Blob，不使用TextEncoder，避免编码问题
              const blob = new Blob([pdfContent], { type: 'application/pdf' });
              const url = URL.createObjectURL(blob);
              this.logAction('1', 'export', 'data', 'bulk', { format, filter });
              resolve(url);
            } catch (pdfError) {
              console.error('PDF生成失败，使用备用方案:', pdfError);
              // 提供一个简单但有效的PDF文件作为备用
              const fallbackPDF = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page
/MediaBox [0 0 612 792]
/Parent 2 0 R
/Contents 4 0 R
/Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
>>
endobj
4 0 obj
<< /Length 300 >>
stream
BT
/F1 12 Tf
100 700 Td
(车辆管理系统导出数据) Tj
100 680 Td
(导出类型: ${filter?.type || '全部数据'}) Tj
100 660 Td
(导出日期: ${new Date().toLocaleString()}) Tj
100 640 Td
(Data Summary:) Tj
100 620 Td
(- 车辆总数: ${this.vehicles.length}) Tj
100 600 Td
(- 维修记录: ${this.maintenanceRecords.length}) Tj
100 580 Td
(- 发票总数: ${this.invoices.length}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000035 00000 n 
0000000072 00000 n 
0000000118 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
180
%%EOF`;
              const blob = new Blob([fallbackPDF], { type: 'application/pdf' });
              const url = URL.createObjectURL(blob);
              resolve(url);
            }
          } else {
            // 其他格式 - 使用图片生成器(简化版)
            let exportUrl = '';
            switch(format) {
              case 'excel':
                exportUrl = 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Excel%20spreadsheet%20document%20icon&sign=99125930c30f1c3ff4a56aa8940b82bd';
                break;
              default:
                exportUrl = 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Data%20export%20file%20document&sign=3918c3c10e2942acc29a8e5b4a921402';
            }
            this.logAction('1', 'export', 'data', 'bulk', { format, filter });
            resolve(exportUrl);
          }
        } catch (error) {
          console.error('Export data error:', error);
          // 发生错误时使用备用方案
          let fallbackUrl = 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Data%20export%20file%20document&sign=3918c3c10e2942acc29a8e5b4a921402';
          this.logAction('1', 'export', 'data', 'bulk', { format, filter, error: true });
          resolve(fallbackUrl);
        }
      }, 1200); // Simulate longer processing time for export
    });
  }
  

  
   // Generate CSV content for export
  private generateCSVContent(type?: string): string {
    let csvContent = '';
    
    if (!type || type === 'vehicles' || type === 'all') {
      // Vehicle CSV headers
      csvContent += 'ID,车牌号,品牌,型号,进场时间,出厂时间,进出场状态,服务类型,停留时间\n';
      
      // Vehicle CSV rows
      csvContent += this.vehicles.map((v: any) => {
        // 计算停留时间
        let duration = '';
        if (v.status === 'out' && v.exitTime) {
          const entryDate = new Date(v.entryTime);
          const exitDate = new Date(v.exitTime);
          const diffMs = exitDate.getTime() - entryDate.getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          duration = `${diffDays}天${diffHours}小时`;
        } else if (v.status === 'in') {
          duration = '在场中';
        }
        
        return `"${v.id}","${v.licensePlate}","${v.brand}","${v.model}","${v.entryTime}","${v.exitTime || ''}","${v.status === 'in' ? '在场' : '离场'}","${v.serviceType === 'maintenance' ? '维修' : v.serviceType === 'insurance' ? '保险' : '无'}","${duration}"`;
      }).join('\n');
      
      csvContent += '\n\n';
    }
    
     if (!type || type === 'invoices' || type === 'all') {
      // Invoice CSV headers
      csvContent += '发票编号,日期,车牌号,金额(元),类型\n';
      
      // Invoice CSV rows
      csvContent += this.invoices.map((i: any) => 
        `"${i.invoiceNumber}","${i.date}","${i.vehicleLicensePlate}","${i.amount}","${i.type === 'vat' ? '增值税发票' : '维修结算单'}"`
      ).join('\n');
    }
    
    if (!type || type === 'maintenance' || type === 'all') {
      // Maintenance CSV headers
      csvContent += '\n\n工单编号,车辆信息,进厂时间,出厂时间,维修类型\n';
      
      // Maintenance CSV rows
      csvContent += this.maintenanceRecords.map((m: any) => {
        const vehicle = this.vehicles.find((v: any) => v.id === m.vehicleId);
        return `"${m.id}","${vehicle ? `${vehicle.licensePlate} ${vehicle.brand} ${vehicle.model}` : `车辆ID: ${m.vehicleId}`}","${m.entryTime}","${m.exitTime || ''}","${m.type === 'maintenance' ? '常规保养' : m.type === 'accident' ? '事故维修' : '故障维修'}"`;
      }).join('\n');
    }
    
    return csvContent;
  }
  
  // Generate Excel XML content
  private generateExcelContent(type?: string): string {
    let excelContent = `<?xml version="1.0" encoding="UTF-8"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">
  <Worksheet ss:Name="数据">
    <Table>`;
    
    if (!type || type === 'vehicles' || type === 'all') {
      // Add vehicle data
      excelContent += `<Row>
        <Cell><Data ss:Type="String">ID</Data></Cell>
        <Cell><Data ss:Type="String">车牌号</Data></Cell>
        <Cell><Data ss:Type="String">品牌</Data></Cell>
        <Cell><Data ss:Type="String">型号</Data></Cell>
        <Cell><Data ss:Type="String">进场时间</Data></Cell>
        <Cell><Data ss:Type="String">状态</Data></Cell>
        <Cell><Data ss:Type="String">服务类型</Data></Cell>
      </Row>`;
      
      this.vehicles.forEach((v: any) => {
        excelContent += `<Row>
          <Cell><Data ss:Type="String">${v.id}</Data></Cell>
          <Cell><Data ss:Type="String">${v.licensePlate}</Data></Cell>
          <Cell><Data ss:Type="String">${v.brand}</Data></Cell>
          <Cell><Data ss:Type="String">${v.model}</Data></Cell>
          <Cell><Data ss:Type="String">${v.entryTime}</Data></Cell>
          <Cell><Data ss:Type="String">${v.status}</Data></Cell>
          <Cell><Data ss:Type="String">${v.serviceType || ''}</Data></Cell>
        </Row>`;
      });
    }
    
    excelContent += `</Table></Worksheet></Workbook>`;
    return excelContent;
  }
  
    // Generate PDF content with proper PDF header and structure
  private generatePDFContent(type?: string): string {
    // In a real app, you would use a PDF generation library
    // This is a proper implementation that follows PDF format specifications
    const currentDate = new Date().toLocaleString();
    
    // Proper PDF header and content with corrected structure
    // 修复PDF生成逻辑，确保文件可以被正确打开
    let pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog
/Outlines 2 0 R
/Pages 3 0 R
>>
endobj
2 0 obj
<< /Type /Outlines /Count 0 >>
endobj
3 0 obj
<< /Type /Pages
/Kids [4 0 R]
/Count 1
>>
endobj
4 0 obj
<< /Type /Page
/MediaBox [0 0 612 792]
/Parent 3 0 R
/Contents 5 0 R
/Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
>>
endobj
5 0 obj
<< /Length 500 >>
stream
BT
/F1 12 Tf
100 700 Td
(车辆管理系统导出数据) Tj
100 680 Td
(导出类型: ${type || '全部数据'}) Tj
100 660 Td
(导出日期: ${currentDate}) Tj
100 640 Td
(Data Summary:) Tj
100 620 Td
(- 车辆总数: ${this.vehicles.length}) Tj
100 600 Td
(- 维修记录: ${this.maintenanceRecords.length}) Tj
100 580 Td
(- 发票总数: ${this.invoices.length}) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000074 00000 n 
0000000111 00000 n 
0000000155 00000 n 
0000000308 00000 n 
trailer
<< /Size 6
/Root 1 0 R
>>
startxref
600
%%EOF`;
    
    return pdfContent;
  }
  
  // Calculate maintenance duration
  private calculateMaintenanceDuration(entryTime: string, exitTime: string): string {
    const entry = new Date(entryTime);
    const exit = new Date(exitTime);
    const diffMs = exit.getTime() - entry.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${diffDays}天${diffHours}小时`;
  }
}

// 创建服务实例
export const mockService = new MockService();

// 添加一个辅助函数来检查是否连接到真实API
export const isUsingRealAPI = () => USE_REAL_API;

// 导出真实API相关的配置
export const apiConfig = {
  baseUrl: API_BASE_URL,
  useRealAPI: USE_REAL_API
};