# 车辆管理系统

## 项目简介
这是一个基于React + TypeScript的车辆管理系统，用于管理车辆信息、进出场记录、维修记录和发票信息等。系统支持照片上传和管理，帮助用户更好地跟踪和记录车辆状态。

## 技术栈
- 前端：React 18+、TypeScript、Tailwind CSS
- 后端：Node.js、Express、MongoDB
- 其他：React Router、recharts、sonner

## 项目结构
```
├── .gitignore
├── .npmrc
├── README.md
├── index.html
├── package.json
├── pnpm-lock.yaml
├── postcss.config.js
├── server.js
├── src
│   ├── App.tsx
│   ├── components
│   │   ├── Empty.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── layouts
│   │   │   └── MainLayout.tsx
│   │   └── ui
│   │       ├── Button.tsx
│   │       └── ImageUploader.tsx
│   ├── contexts
│   │   ├── ThemeContext.tsx
│   │   └── authContext.ts
│   ├── hooks
│   │   └── useTheme.ts
│   ├── index.css
│   ├── invoices
│   │   └── InvoiceForm.tsx
│   ├── lib
│   │   └── utils.ts
│   ├── main.tsx
│   ├── maintenance
│   │   └── MaintenanceForm.tsx
│   ├── pages
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── data-management
│   │   │   └── DataManagement.tsx
│   │   ├── invoices
│   │   │   ├── InvoiceDetail.tsx
│   │   │   ├── InvoiceForm.tsx
│   │   │   └── InvoiceList.tsx
│   │   ├── maintenance
│   │   │   ├── MaintenanceDetail.tsx
│   │   │   ├── MaintenanceForm.tsx
│   │   │   └── MaintenanceList.tsx
│   │   ├── system
│   │   │   ├── SystemSettings.tsx
│   │   │   ├── UserForm.tsx
│   │   │   └── UserManagement.tsx
│   │   └── vehicles
│   │       ├── VehicleDetail.tsx
│   │       ├── VehicleForm.tsx
│   │       └── VehicleList.tsx
│   ├── routes.tsx
│   ├── services
│   │   ├── mockService.ts
│   │   └── photoService.ts
│   ├── types
│   │   └── index.ts
│   └── vite-env.d.ts
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 安装和运行步骤

### 步骤1：安装依赖
```bash
# 使用pnpm（推荐）
pnpm install

# 或使用npm
npm install

# 或使用yarn
yarn install
```

### 步骤2：创建.env文件
在项目根目录创建.env文件，并添加以下配置：
```env
# 服务器配置
PORT=5000

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/vehicle-management

# JWT配置
JWT_SECRET=your-secret-key

# 文件上传配置
UPLOAD_DIR=uploads

# 前端API配置
VITE_API_BASE_URL=http://localhost:5000/api
VITE_USE_REAL_API=true
```

### 步骤3：创建照片上传目录
项目需要手动创建照片存储目录，因为这些目录不会自动生成：
```bash
# 在项目根目录执行以下命令
mkdir -p uploads/vehicle_photos
mkdir -p uploads/entry_photos
mkdir -p uploads/exit_photos
mkdir -p uploads/maintenance_photos
mkdir -p uploads/invoice_photos
mkdir -p uploads/part_photos
mkdir -p uploads/note_photos
```

### 步骤4：运行项目
```bash
# 同时运行前端和后端
pnpm dev

# 或分别运行
# 前端
pnpm dev:client

# 后端
pnpm dev:server
```

### 步骤5：访问系统
打开浏览器，访问以下地址：
- 前端：http://localhost:3000
- 后端API：http://localhost:5000/api

### 步骤6：登录系统
使用默认管理员账户登录：
- 用户名：admin
- 密码：admin123

## 照片存储机制说明

### 照片目录结构
系统使用以下目录结构存储不同类型的照片：
- `uploads/vehicle_photos` - 车辆照片
- `uploads/entry_photos` - 进场照片
- `uploads/exit_photos` - 离场照片
- `uploads/maintenance_photos` - 维修照片
- `uploads/invoice_photos` - 发票照片
- `uploads/part_photos` - 配件照片
- `uploads/note_photos` - 备注照片

### 照片命名规则
照片文件名格式为：`时间戳_车牌号_车辆ID_目录类型.扩展名`
- 时间戳：格式为YYYY-MM-DDTHH-mm-ss
- 车牌号：去掉空格的车牌号
- 车辆ID：系统中的车辆唯一标识
- 目录类型：对应上述的目录名称
- 扩展名：原始文件的扩展名

### 照片上传流程
1. 用户通过界面上传照片
2. 系统在`photoService.ts`中处理照片，生成唯一文件名
3. 照片通过服务器API上传到服务器
4. 服务器保存照片到对应目录，并返回访问URL
5. URL存储在数据库中供后续访问

## 功能模块

### 1. 车辆管理
- 添加、编辑、删除车辆信息
- 记录车辆进出场时间和状态
- 上传和管理车辆照片

### 2. 维修管理
- 创建和管理维修工单
- 记录更换配件和工时费用
- 上传维修过程照片

### 3. 发票管理
- 创建和管理发票
- 支持OCR识别（模拟功能）
- 上传发票照片

### 4. 用户管理
- 管理员和普通用户角色
- 权限控制
- 用户账户管理

## 常见问题解决

### 问题：照片上传后显示不正常
**解决方法**：
1. 确保已正确创建所有照片目录
2. 检查照片文件是否成功上传到服务器
3. 确认数据库中存储的照片URL是否正确

### 问题：无法访问uploads文件夹
**解决方法**：
1. 确认目录权限设置正确，服务器进程有读写权限
2. 检查.env文件中的UPLOAD_DIR配置是否正确
3. 重启服务器和前端应用

## 注意事项
1. 首次运行前必须创建照片上传目录（步骤3）
2. 确保MongoDB服务已启动
3. 生产环境中请修改JWT_SECRET为安全的密钥
4. 系统支持深色/浅色主题切换
5. 默认情况下，照片上传功能会使用模拟服务，请确保VITE_USE_REAL_API设置正确