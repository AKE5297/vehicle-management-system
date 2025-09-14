# 车辆管理系统

一个现代化的车辆管理系统，提供全面的车辆信息管理、维修记录跟踪、发票管理和数据导出功能。

## 🚀 技术栈

- **前端框架**: React 18+
- **编程语言**: TypeScript
- **构建工具**: Vite
- **样式框架**: Tailwind CSS
- **路由**: React Router DOM
- **图标库**: Font Awesome
- **数据可视化**: Recharts
- **状态管理**: React Context API
- **UI组件库**: 自定义组件
- **表单验证**: Zod
- **动画效果**: Framer Motion
- **通知提示**: Sonner

## ✨ 功能特点

### 车辆管理
- 车辆信息的添加、编辑、查看和删除
- 车辆进出场状态管理
- 车辆照片上传和管理
- 车辆服务类型标记（维修/保险）

### 维修记录管理
- 维修工单的创建和跟踪
- 维修配件管理
- 维修照片记录
- 工时和费用计算

### 发票管理
- 发票信息录入和管理
- 发票照片上传
- 发票OCR识别（模拟）
- 发票状态跟踪

### 数据管理
- 多格式数据导出（Excel、CSV、JSON）
- 按日期范围筛选数据
- 导出历史记录

### 用户系统
- 管理员和普通用户权限分离
- 用户账户管理
- 细粒度权限控制

### 系统特性
- 深色/浅色主题切换
- 响应式设计，支持移动端和桌面端
- 完整的表单验证
- 美观的UI设计和流畅的动画效果
- 模拟数据支持离线使用

## 🛠️ 安装和运行

### 前提条件
- Node.js 18+
- npm、pnpm或yarn包管理器

### 安装步骤

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

应用将在 http://localhost:3000 启动

### 构建生产版本
```bash
pnpm build
```

构建后的文件将位于 `dist` 目录

## 🚢 部署指南

### 本地部署
可以使用任何静态文件服务器部署构建后的应用：

```bash
# 使用 serve 工具
npx serve -s dist
```

### NAS部署
1. 构建生产版本 (`pnpm build`)
2. 将 `dist` 目录中的所有文件复制到您的NAS上的Web服务器目录
3. 配置NAS的Web服务器以提供静态文件访问

### 服务器部署
1. 构建生产版本 (`pnpm build`)
2. 将 `dist` 目录中的内容部署到您的Web服务器（如Nginx、Apache等）
3. 配置Web服务器以正确处理单页应用路由

Nginx示例配置：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/vehicle-management-system/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### GitHub Pages + Cloudflare Pages 部署

1. **GitHub 仓库设置**
   - 将代码推送到您的GitHub仓库

2. **Cloudflare Pages 部署**
   - 登录Cloudflare并导航到"Pages"
   - 点击"连接Git"并选择您的GitHub仓库
   - 在构建设置中：
     - 框架预设：Vite
     - 构建命令：`pnpm install --no-frozen-lockfile && pnpm run build`
     - 构建输出目录：`dist`
   - 点击"保存并部署"

> 注意：由于依赖版本可能存在差异，Cloudflare Pages构建时使用了`--no-frozen-lockfile`参数以避免锁文件版本冲突

## 📋 使用说明

### 默认账户
系统包含两个默认账户用于演示：
- 管理员账户：用户名 `admin`，密码 `admin123`
- 普通用户账户：用户名 `user1`，密码 `user123`

### 主要功能使用

#### 车辆管理
1. 从侧边栏导航到"车辆管理"
2. 点击"添加新车辆"按钮创建新车辆记录
3. 填写车辆信息，上传照片
4. 可随时编辑或删除现有车辆记录

#### 维修记录
1. 从侧边栏导航到"维修记录"
2. 点击"创建维修单"开始记录新的维修任务
3. 添加维修配件和工时信息
4. 上传维修过程照片

#### 发票管理
1. 从侧边栏导航到"发票管理"
2. 点击"添加新发票"录入发票信息
3. 可选择手动录入或使用OCR识别功能
4. 上传发票照片并记录项目明细

#### 数据导出
1. 从侧边栏导航到"数据管理"
2. 选择要导出的数据类型和文件格式
3. 设置日期范围筛选条件
4. 点击"开始导出"下载数据文件

## 📚 开发指南

### 项目结构
```
src/
├── components/          # 通用组件
│   ├── layouts/         # 布局组件
│   └── ui/              # UI组件
├── contexts/            # React Context
├── hooks/               # 自定义hooks
├── lib/                 # 工具函数
├── pages/               # 页面组件
├── services/            # 服务层（API调用、数据处理）
├── types/               # TypeScript类型定义
├── App.tsx              # 应用入口
├── index.css            # 全局样式
├── main.tsx             # 渲染入口
└── routes.tsx           # 路由配置
```

### 开发规范
- 组件遵循单一职责原则
- 使用TypeScript确保类型安全
- 使用Tailwind CSS进行样式设计
- 状态管理使用React Context API
- 服务层与UI分离

## 📝 许可证

MIT License

## 📞 联系信息

如有任何问题或建议，请联系项目维护者。

© 2025 车辆管理系统 - 版权所有