import { v4 as uuidv4 } from 'uuid';
import { 
  Vehicle, MaintenanceRecord, Invoice, User, 
  InsuranceRecord, Part, Note, SystemLog 
} from '../types';

// Mock data service for the vehicle management system
class MockService {
  // Data keys for localStorage
  private readonly STORAGE_KEYS = {
    USERS: 'vehicle_management_users',
    VEHICLES: 'vehicle_management_vehicles',
    MAINTENANCE: 'vehicle_management_maintenance',
    INVOICES: 'vehicle_management_invoices',
    INSURANCE: 'vehicle_management_insurance',
    SYSTEM_LOGS: 'vehicle_management_system_logs'
  };

  // Mock users data
  private users: User[] = [
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

  // Mock vehicles data
  private vehicles: Vehicle[] = [
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

  // Mock maintenance records
  private maintenanceRecords: MaintenanceRecord[] = [
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

  // Mock insurance records
  private insuranceRecords: InsuranceRecord[] = [
    {
      id: '1',
      vehicleId: '2',
      claimNumber: 'INS-2025-0906-1234',
      accidentDate: '2025-09-05T18:45:00Z',
      description: '车辆停放时被剐蹭，导致右侧车门和翼子板受损',
      damagePhotos: [
        'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Car%20door%20scratch%20damage%20photo&sign=a9a9191b19a09d04b15a9d61b32520e0',
        'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Car%20fender%20damage%20photo&sign=559703aba5e67f9c21cd4529e9bcc4da'
      ],
      status: 'pending',
      estimatedCost: 5800.00,
      insuranceCompany: '平安保险',
      createdAt: '2025-09-06T09:25:00Z',
      updatedAt: '2025-09-06T09:25:00Z'
    }
  ];

  // Mock invoices
  private invoices: Invoice[] = [
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

  // Mock system logs
  private systemLogs: SystemLog[] = [
    {
      id: '1',
      userId: '1',
      action: 'login',
      entityType: 'user',
      entityId: '1',
      details: { success: true },
      ipAddress: '192.168.1.100',
      timestamp: '2025-09-07T08:15:30Z'
    },
    {
      id: '2',
      userId: '1',
      action: 'create',
      entityType: 'vehicle',
      entityId: '2',
      details: { licensePlate: '沪B67890', brand: '宝马', model: 'X5' },
      ipAddress: '192.168.1.100',
      timestamp: '2025-09-06T09:10:00Z'
    },
    {
      id: '3',
      userId: '1',
      action: 'update',
      entityType: 'vehicle',
      entityId: '1',
      details: { status: 'out', exitTime: '2025-09-06T16:45:00Z' },
      ipAddress: '192.168.1.100',
      timestamp: '2025-09-06T16:45:00Z'
    }
  ];

  // Authentication methods
  login(username: string, password: string): Promise<User | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = this.users.find(
          u => u.username === username && u.password === password
        );
        
        if (user) {
          // Create a copy without password for security
          const userWithoutPassword = { ...user };
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
  getVehicles(): Promise<Vehicle[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.vehicles]);
      }, 500);
    });
  }

  getVehicleById(id: string): Promise<Vehicle | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const vehicle = this.vehicles.find(v => v.id === id);
        resolve(vehicle ? { ...vehicle } : null);
      }, 500);
    });
  }

  createVehicle(vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newVehicle: Vehicle = {
          ...vehicleData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        this.vehicles.push(newVehicle);
        this.logAction('1', 'create', 'vehicle', newVehicle.id, newVehicle);
        
        resolve({ ...newVehicle });
      }, 800);
    });
  }

   updateVehicle(id: string, vehicleData: Partial<Vehicle>): Promise<Vehicle | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.vehicles.findIndex(v => v.id === id);
        if (index !== -1) {
          this.vehicles[index] = {
            ...this.vehicles[index],
            ...vehicleData,
            updatedAt: new Date().toISOString()
          };
          
          this.logAction('1', 'update', 'vehicle', id, vehicleData);
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
  getMaintenanceRecords(): Promise<MaintenanceRecord[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.maintenanceRecords]);
      }, 500);
    });
  }

  getMaintenanceRecordById(id: string): Promise<MaintenanceRecord | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const record = this.maintenanceRecords.find(m => m.id === id);
        resolve(record ? { ...record } : null);
      }, 500);
    });
  }

  createMaintenanceRecord(recordData: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceRecord> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRecord: MaintenanceRecord = {
          ...recordData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        this.maintenanceRecords.push(newRecord);
        this.logAction('1', 'create', 'maintenance', newRecord.id, newRecord);
        
        resolve({ ...newRecord });
      }, 800);
    });
  }

  updateMaintenanceRecord(id: string, recordData: Partial<MaintenanceRecord>): Promise<MaintenanceRecord | null> {
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
  getInvoices(): Promise<Invoice[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.invoices]);
      }, 500);
    });
  }

  getInvoiceById(id: string): Promise<Invoice | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const invoice = this.invoices.find(i => i.id === id);
        resolve(invoice ? { ...invoice } : null);
      }, 500);
    });
  }

  createInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newInvoice: Invoice = {
          ...invoiceData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        this.invoices.push(newInvoice);
        this.logAction('1', 'create', 'invoice', newInvoice.id, newInvoice);
        
        resolve({ ...newInvoice });
      }, 800);
    });
  }

  updateInvoice(id: string, invoiceData: Partial<Invoice>): Promise<Invoice | null> {
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

  getInvoicesByVehicleId(vehicleId: string): Promise<Invoice[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const vehicleInvoices = this.invoices.filter(i => i.vehicleId === vehicleId);
        resolve([...vehicleInvoices]);
      }, 500);
    });
  }

  // System log methods
  getSystemLogs(): Promise<SystemLog[]> {
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
    const newLog: SystemLog = {
      id: uuidv4(),
      userId,
      action,
      entityType,
      entityId,
      details,
      ipAddress: '192.168.1.100', // In real app this would be the client's IP
      timestamp: new Date().toISOString()
    };
    
    this.systemLogs.push(newLog);
    
    // Keep only last 1000 logs (in real app this would be handled by database)
    if (this.systemLogs.length > 1000) {
      this.systemLogs.shift();
    }
  }

   // User management methods
  getUsers(): Promise<User[]> {
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
  createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin'>): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser: User = {
          ...userData,
          id: uuidv4(),
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

  updateUser(id: string, userData: Partial<User>): Promise<User | null> {
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
  exportData(format: 'excel' | 'csv' | 'json', filter?: any): Promise<string> {
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

export const mockService = new MockService();