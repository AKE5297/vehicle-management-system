# 车辆管理系统
一个功能完善的车辆管理系统，支持车辆信息管理、进出场记录、维修记录和发票管理等功能。

## 功能特点
- 🔑 用户认证与权限管理
- 🚗 车辆信息管理（添加、编辑、删除、查看）
- 📷 照片上传与管理（车辆照片、进出场照片、维修照片、发票照片）
- ⚙️ 维修工单管理
- 💰 发票管理
- 📊 数据统计与导出
- 🌙 深色/浅色主题切换
- 📱 响应式设计，支持移动端访问

## 技术栈
- **前端**: React 18 + TypeScript + Tailwind CSS
- **后端**: Node.js + Express + MongoDB
- **状态管理**: Context API
- **路由**: React Router
- **UI组件**: 自定义组件 + Font Awesome 图标
- **构建工具**: Vite

## 安装指南

### 前提条件
- Node.js 18+
- npm/yarn/pnpm
- MongoDB

### 前端安装
1. 克隆仓库
```bash
git clone https://github.com/your-username/vehicle-management-system.git
cd vehicle-management-system
```

2. 安装依赖
```bash
pnpm install
```

3. 启动开发服务器
```bash
pnpm dev
```

### 后端安装
1. 确保MongoDB已启动
2. 修改环境变量配置
   - 复制 `.env.example` 到 `.env`
   - 修改 `.env` 中的配置参数

3. 启动后端服务器
```bash
pnpm dev:server
```

## 照片存储管理
系统实现了完整的照片文件存储管理功能，按照不同类型将照片存储在不同的目录中：

### 存储结构
1. **主目录**: `src/uploads/` - 所有照片的根目录
2. **子目录**: 根据照片类型分为不同文件夹
   - 车辆照片: `uploads/vehicle_photos/`
   - 进场照片: `uploads/entry_photos/`
   - 离场照片: `uploads/exit_photos/`  
   - 维修照片: `uploads/maintenance_photos/`
   - 发票照片: `uploads/invoice_photos/`
   - 配件照片: `uploads/part_photos/`
   - 备注照片: `uploads/note_photos/`

### 文件命名格式
照片文件按照时间加车牌的格式命名：`时间戳_车牌号_车辆ID_目录类型.扩展名`
- 时间戳格式: YYYY-MM-DDTHH-mm-ss
- 例如: `2025-09-14T20-54-56_京A12345_1_vehicle_photos.jpg`

## 使用指南

### 1. 用户登录
系统默认提供两个用户账户：
- 管理员账户: `admin` / `admin123`
- 普通用户账户: `user1` / `user123`

### 2. 添加新车辆
- 点击"添加新车辆"按钮
- 填写车辆基本信息（车牌号、品牌、型号等）
- 上传车辆照片（支持多张）
- 上传进场照片（带时间水印）
- 保存车辆信息

### 3. 管理维修工单
- 导航到"维修记录"页面
- 点击"创建维修单"
- 填写维修信息、配件清单和费用
- 上传维修过程照片

### 4. 管理发票
- 导航到"发票管理"页面
- 点击"添加新发票"
- 填写发票信息和项目明细
- 上传发票照片

## 真实后端服务配置
系统支持切换使用模拟数据或真实后端服务：

1. 创建 `.env` 文件，添加以下配置：
```env
# 使用真实后端服务
VITE_USE_REAL_API=true

# 后端API地址
VITE_API_BASE_URL=http://localhost:5000/api

# MongoDB连接地址
MONGODB_URI=mongodb://localhost:27017/vehicle-management

# JWT密钥
JWT_SECRET=your-secret-key

# 上传目录配置
UPLOAD_DIR=uploads
```

2. 启动后端服务
```bash
pnpm dev:server
```

3. 启动前端服务
```bash
pnpm dev:client
```

## 数据导出
系统支持将车辆、维修和发票数据导出为多种格式（Excel、CSV、JSON），可通过"数据管理"页面操作。

## 系统日志
系统自动记录关键操作日志，包括用户登录、数据创建、修改和删除等操作。

## License
MIT