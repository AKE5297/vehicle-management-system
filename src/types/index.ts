export interface Vehicle {
  id: string;
  licensePlate: string;
  vehicleType: 'sedan' | 'suv' | 'truck' | 'other';
  brand: string;
  model: string;
  vin?: string;
  photos: string[];
  entryTime: string;
  exitTime?: string;
  status: 'in' | 'out';
  entryPhoto?: string;
  exitPhoto?: string;
  serviceType: 'maintenance' | 'insurance' | null;
  maintenanceRecords?: MaintenanceRecord[];
  insuranceRecords?: InsuranceRecord[];
  notes: Note[];
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: 'maintenance' | 'accident' | 'breakdown';
  entryTime: string;
  exitTime?: string;
  parts: Part[];
  laborCost: number;
  totalCost: number;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  photos: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsuranceRecord {
  id: string;
  vehicleId: string;
  claimNumber: string;
  accidentDate: string;
  description: string;
  damagePhotos: string[];
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  estimatedCost: number;
  actualCost?: number;
  insuranceCompany: string;
  createdAt: string;
  updatedAt: string;
}

export interface Part {
  id: string;
  name: string;
  quantity: number;
  price: number;
  photo?: string;
  barcode?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  type: 'vat' | 'maintenance';
  vehicleId: string;
  vehicleLicensePlate: string;
  items: InvoiceItem[];
  photo: string;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Note {
  id: string;
  content: string;
  photo?: string;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
  permissions: string[];
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, any>;
  ipAddress: string;
  timestamp: string;
}