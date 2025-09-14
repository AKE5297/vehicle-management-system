// 服务层 - 支持连接真实后端或使用模拟数据
// 默认使用真实后端服务，可通过环境变量切换到模拟数据
const USE_REAL_API = import.meta.env.VITE_USE_REAL_API !== 'false';

// 基础API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// 上传目录配置
const UPLOAD_DIR = import.meta.env.VITE_UPLOAD_DIR || 'uploads';

// 导入类型定义
import type { SystemLog } from '../types';

class MockService {
  // 用于真实API调用的fetch包装器
  private async apiFetch(endpoint: string, options: any = {}): Promise<any> {
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
      
      // 如果是网络错误，尝试使用模拟数据作为后备
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.warn('网络连接失败，正在切换到模拟数据模式');
        return this.apiFetch(endpoint, { ...options, useMock: true });
      }
      
      throw error;
    }
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

  // Data export simulation
  exportData(format: string, filter?: any): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // In real app this would generate actual file content
        const exportUrl = `https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Data%20export%20file%20icon%20${format}`;
        this.logAction('1', 'export', 'data', 'bulk', { format, filter });
        resolve(exportUrl);
      }, 1200); // Simulate longer processing time for export
    });
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