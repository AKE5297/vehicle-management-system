import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from 'fs';

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 连接MongoDB数据库
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicle-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB连接成功'))
.catch(err => console.error('MongoDB连接失败:', err));

// 用户模型
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'user'] },
  permissions: [String],
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 车辆模型
const VehicleSchema = new mongoose.Schema({
  licensePlate: { type: String, required: true, unique: true },
  vehicleType: { type: String, required: true, enum: ['sedan', 'suv', 'truck', 'other'] },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  vin: String,
  photos: [String],
  entryTime: { type: Date, required: true },
  exitTime: Date,
  status: { type: String, required: true, enum: ['in', 'out'] },
  entryPhoto: String,
  exitPhoto: String,
  serviceType: { type: String, enum: ['maintenance', 'insurance', null] },
  notes: [{
    id: String,
    content: String,
    photo: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 维修记录模型
const MaintenanceRecordSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  type: { type: String, required: true, enum: ['maintenance', 'accident', 'breakdown'] },
  entryTime: { type: Date, required: true },
  exitTime: Date,
  parts: [{
    id: String,
    name: String,
    quantity: Number,
    price: Number,
    photo: String
  }],
  laborCost: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  status: { type: String, required: true, enum: ['pending', 'in-progress', 'completed', 'cancelled'] },
  photos: [String],
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 发票模型
const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  type: { type: String, required: true, enum: ['vat', 'maintenance'] },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  vehicleLicensePlate: { type: String, required: true },
  items: [{
    id: String,
    description: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  photo: String,
  status: { type: String, required: true, enum: ['pending', 'paid', 'cancelled'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 系统日志模型
const SystemLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  action: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: String, required: true },
  details: Object,
  ipAddress: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// 创建模型
const User = mongoose.model('User', UserSchema);
const Vehicle = mongoose.model('Vehicle', VehicleSchema);
const MaintenanceRecord = mongoose.model('MaintenanceRecord', MaintenanceRecordSchema);const Invoice = mongoose.model('Invoice', InvoiceSchema);
const SystemLog = mongoose.model('SystemLog', SystemLogSchema);

// 认证中间件
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: '未提供认证令牌' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: '无效的认证令牌' });
  }
};

// API路由 - 认证
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 查找用户
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: '用户名或密码不正确' });
    }
    
    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: '用户名或密码不正确' });
    }
    
    // 更新最后登录时间
    user.lastLogin = new Date();
    await user.save();
    
    // 生成JWT令牌
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // 创建日志
    await SystemLog.create({
      userId: user._id,
      action: 'login',
      entityType: 'user',
      entityId: user._id,
      details: { success: true },
      ipAddress: req.ip
    });
    
    // 返回用户信息（不含密码）和令牌
    const userWithoutPassword = { ...user.toObject() };
    delete userWithoutPassword.password;
    
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// API路由 - 车辆管理
app.get('/api/vehicles', authMiddleware, async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (error) {
    console.error('获取车辆列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

app.get('/api/vehicles/:id', authMiddleware, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: '未找到车辆' });
    }
    res.json(vehicle);
  } catch (error) {
    console.error('获取车辆详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

app.post('/api/vehicles', authMiddleware, async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    
    // 创建日志
    await SystemLog.create({
      userId: req.user.id,
      action: 'create',
      entityType: 'vehicle',
      entityId: vehicle._id,
      details: vehicle.toObject(),
      ipAddress: req.ip
    });
    
    res.status(201).json(vehicle);
  } catch (error) {
    console.error('创建车辆错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

app.put('/api/vehicles/:id', authMiddleware, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vehicle) {
      return res.status(404).json({ message: '未找到车辆' });
    }
    
    // 创建日志
    await SystemLog.create({
      userId: req.user.id,
      action: 'update',
      entityType: 'vehicle',
      entityId: vehicle._id,
      details: req.body,
      ipAddress: req.ip
    });
    
    res.json(vehicle);
  } catch (error) {
    console.error('更新车辆错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

app.delete('/api/vehicles/:id', authMiddleware, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: '未找到车辆' });
    }
    
    // 创建日志
    await SystemLog.create({
      userId: req.user.id,
      action: 'delete',
      entityType: 'vehicle',
      entityId: req.params.id,
      details: {},
      ipAddress: req.ip
    });
    
    res.json({ message: '车辆删除成功' });
  } catch (error) {
    console.error('删除车辆错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// API路由 - 维修记录
app.get('/api/maintenance', authMiddleware, async (req, res) => {
  try {
    const records = await MaintenanceRecord.find().populate('vehicleId');
    res.json(records);
  } catch (error) {
    console.error('获取维修记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

app.get('/api/maintenance/:id', authMiddleware, async (req, res) => {
  try {
    const record = await MaintenanceRecord.findById(req.params.id).populate('vehicleId');
    if (!record) {
      return res.status(404).json({ message: '未找到维修记录' });
    }
    res.json(record);
  } catch (error) {
    console.error('获取维修记录详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

app.post('/api/maintenance', authMiddleware, async (req, res) => {
  try {
    const record = new MaintenanceRecord(req.body);
    await record.save();
    
    // 创建日志
    await SystemLog.create({
      userId: req.user.id,
      action: 'create',
      entityType: 'maintenance',
      entityId: record._id,
      details: record.toObject(),
      ipAddress: req.ip
    });
    
    res.status(201).json(record);
  } catch (error) {
    console.error('创建维修记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// API路由 - 发票管理
app.get('/api/invoices', authMiddleware, async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('vehicleId');
    res.json(invoices);
  } catch (error) {
    console.error('获取发票列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

app.get('/api/invoices/:id', authMiddleware, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('vehicleId');
    if (!invoice) {
      return res.status(404).json({ message: '未找到发票' });
    }
    res.json(invoice);
  } catch (error) {
    console.error('获取发票详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

app.post('/api/invoices', authMiddleware, async (req, res) => {
  try {
    const invoice = new Invoice(req.body);
    await invoice.save();
    
    // 创建日志
    await SystemLog.create({
      userId: req.user.id,
      action: 'create',
      entityType: 'invoice',
      entityId: invoice._id,
      details: invoice.toObject(),
      ipAddress: req.ip
    });
    
    res.status(201).json(invoice);
  } catch (error) {
    console.error('创建发票错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// API路由 - 用户管理
app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    // 只有管理员可以查看所有用户
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '没有权限' });
    }
    
    const users = await User.find();
    // 移除密码信息
    const usersWithoutPassword = users.map(user => {
      const userObj = user.toObject();
      delete userObj.password;
      return userObj;
    });
    
    res.json(usersWithoutPassword);
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

app.post('/api/users', authMiddleware, async (req, res) => {
  try {
    // 只有管理员可以创建用户
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '没有权限' });
    }
    
    // 检查用户是否已存在
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }
    
    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    
    // 创建新用户
    const user = new User({
      ...req.body,
      password: hashedPassword
    });
    
    await user.save();
    
    // 创建日志
    await SystemLog.create({
      userId: req.user.id,
      action: 'create',
      entityType: 'user',
      entityId: user._id,
      details: { username: user.username },
      ipAddress: req.ip
    });
    
    // 移除密码信息
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('创建用户错误:', error);res.status(500).json({ message: '服务器错误' });
  }
});

  // 文件上传处理
  app.post('/api/upload', authMiddleware, async (req, res) => {
    try {
      // 在实际应用中，应该使用multer或其他文件上传中间件处理文件上传
      // 这里我们模拟文件上传的处理过程
      
      const { directory, filename, type, base64Data, additionalInfo } = req.body;
      
      // 验证必要的参数
      if (!directory || !filename || !base64Data) {
        return res.status(400).json({ message: '缺少必要的上传参数' });
      }
      
      // 生成时间戳用于文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      
      // 构建文件名：时间_车牌_车辆ID_目录类型.扩展名
      let baseFileName = timestamp;
      
      // 如果提供了车牌号，添加到文件名
      if (additionalInfo?.licensePlate) {
        baseFileName = `${timestamp}_${additionalInfo.licensePlate.replace(/\s/g, '')}`;
      }
      
      // 如果提供了车辆ID，添加到文件名
      if (additionalInfo?.vehicleId) {
        baseFileName = `${baseFileName}_${additionalInfo.vehicleId}`;
      }
      
      // 添加目录类型
      baseFileName = `${baseFileName}_${directory}`;
      
      // 生成唯一的文件名
      const extension = filename.split('.').pop() || 'jpg';
      const uniqueFilename = `${baseFileName}.${extension}`;
      
      // 构建完整的目录路径：主目录/子目录/文件名
      const fullPath = `${process.env.UPLOAD_DIR || 'uploads'}/${directory}/${uniqueFilename}`;
      
      // 创建目录（如果不存在）
      const directoryPath = `${process.env.UPLOAD_DIR || 'uploads'}/${directory}`;
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
        console.log(`创建目录: ${directoryPath}`);
      }
      
      // 在实际应用中，这里应该将base64数据转换为文件并保存到指定目录
      // 这里我们只返回一个模拟的URL，但包含真实的路径信息
      const photoUrl = `https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=${encodeURIComponent(type || 'vehicle')}&directory=${encodeURIComponent(fullPath)}`;
      
      // 记录文件上传日志
      await SystemLog.create({
        userId: req.user.id,
        action: 'upload',
        entityType: 'file',
        entityId: uniqueFilename,
        details: { directory, type, fullPath, additionalInfo },
        ipAddress: req.ip
      });
      
      // 打印上传信息到控制台
      console.log(`照片已上传: ${fullPath}`);
      console.log(`文件命名格式: ${uniqueFilename}`);
      console.log(`存储目录: ${directory}`);
      
      res.json({ url: photoUrl, filename: uniqueFilename, directory: fullPath });
    } catch (error) {
      console.error('文件上传错误:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  });

// 数据导出功能
app.get('/api/export/:format', authMiddleware, async (req, res) => {
  try {
    // 在真实应用中，这里应该生成实际的导出文件
    // 这里仅作为示例，返回一个模拟的URL
    
    const { format } = req.params;
    const { type } = req.query;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const exportUrl = `https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Data%20export%20file%20${format}&type=${type || 'all'}&timestamp=${timestamp}`;
    
    // 创建日志
    await SystemLog.create({
      userId: req.user.id,
      action: 'export',
      entityType: 'data',
      entityId: 'bulk',
      details: { format, type },
      ipAddress: req.ip
    });
    
    res.json({ url: exportUrl });
  } catch (error) {
    console.error('数据导出错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 服务器启动
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  
  // 初始化管理员账户（如果不存在）
  initAdminUser();
});

// 初始化管理员账户
async function initAdminUser() {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await User.create({
        username: 'admin',
        password: hashedPassword,
        name: '系统管理员',
        role: 'admin',
        permissions: ['all']
      });
      
      console.log('管理员账户已创建: 用户名: admin, 密码: admin123');
    }
  } catch (error) {
    console.error('初始化管理员账户错误:', error);
  }
}