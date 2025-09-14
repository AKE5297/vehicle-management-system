# 车辆管理系统 - Vehicle Management System

一个现代化的车辆管理系统，提供完整的车辆信息管理、维修记录跟踪、发票管理和数据导出功能，帮助您高效管理车辆相关业务。

## 🚀 功能特性

### 核心功能
- **车辆管理**：完整的车辆信息CRUD操作，包括车牌号、品牌型号、服务类型等
- **维修记录**：详细的维修工单管理，包括配件信息、工时费用和维修照片
- **发票管理**：发票记录与管理，支持照片上传和OCR识别
- **数据导出**：支持多种格式（Excel、CSV、JSON）的数据导出功能
- **用户管理**：多级用户权限控制，包括管理员和普通用户角色

### 用户体验特性
- **响应式设计**：适配桌面端和移动端，提供流畅的跨设备体验
- **深色模式**：支持明暗主题切换，减少长时间使用的视觉疲劳
- **即时通知**：操作反馈和状态提示，提高用户操作感知
- **数据可视化**：直观的图表展示，帮助快速掌握业务数据
- **本地存储**：支持数据本地持久化，确保数据不丢失

## 🛠 技术栈

- **前端框架**: React 18+
- **编程语言**: TypeScript
- **构建工具**: Vite
- **样式框架**: Tailwind CSS
- **路由管理**: React Router DOM
- **数据可视化**: Recharts
- **通知组件**: Sonner
- **唯一ID生成**: UUID
- **类型安全**: Zod (表单验证)

## 📋 环境要求

- Node.js 18+
- npm/pnpm/yarn

## ⚙️ 安装与运行

### 1. 克隆项目

```bash
git clone https://github.com/your-username/vehicle-management-system.git
cd vehicle-management-system
```

### 2. 安装依赖

使用pnpm（推荐）:
```bash
pnpm install
```

或使用npm:
```bash
npm install
```

或使用yarn:
```bash
yarn install
```

### 3. 开发模式运行

```bash
pnpm dev
# 或 npm run dev
# 或 yarn dev
```

项目将在 http://localhost:3000 启动开发服务器

### 4. 构建生产版本

```bash
pnpm build
# 或 npm run build
# 或 yarn build
```

构建后的文件将位于 `dist` 目录

## 🚢 部署指南

### 本地部署

1. 完成构建后，使用任何静态文件服务器托管 `dist` 目录：

```bash
# 使用内置的http-server (如果没有安装: npm install -g http-server)
http-server dist

# 或使用Python的内置服务器
cd dist
python -m http.server 8080
```

### NAS部署

1. 确保NAS已安装Docker或支持静态网站托管
2. 将构建后的`dist`目录复制到NAS的Web服务器目录
3. 配置Web服务器（如Nginx、Apache）指向该目录
4. 通过NAS的IP地址或域名访问系统

### 服务器部署

1. 将构建后的`dist`目录上传到服务器
2. 配置Nginx作为Web服务器:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /path/to/vehicle-management-system/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

3. 重启Nginx服务:
```bash
sudo service nginx restart
```

### Cloudflare Pages部署

1. 在GitHub上创建项目仓库并推送代码
2. 登录Cloudflare，导航到"Pages"
3. 点击"Create a project"并连接您的GitHub仓库
4. 配置构建设置:
   - Framework preset: Vite
   - Build command: `pnpm install --no-frozen-lockfile && pnpm build`
   - Build output directory: `dist`
5. 点击"Save and Deploy"开始部署过程
6. 部署完成后，系统将提供一个Cloudflare Pages子域名访问您的应用

> **注意**: 由于package.json和pnpm-lock.yaml可能存在版本不匹配问题，部署命令中特别添加了`--no-frozen-lockfile`参数以确保构建成功。

## 🔑 登录凭证

系统提供了两个默认账户用于演示：

- **管理员账户**
  - 用户名: `admin`
  - 密码: `admin123`
  
- **普通用户账户**
  - 用户名: `user1`
  - 密码: `user123`

## 📁 项目结构

```
src/
├── components/         # 可复用组件
│   ├── layouts/        # 布局组件
│   └── ui/             # UI组件
├── contexts/           # React上下文
├── hooks/              # 自定义hooks
├── lib/                # 工具函数
├── pages/              # 页面组件
│   ├── vehicles/       # 车辆管理页面
│   ├── invoices/       # 发票管理页面
│   ├── maintenance/    # 维修记录页面
│   └── system/         # 系统设置页面
├── routes.tsx          # 路由配置
├── services/           # 服务层（API调用、Mock数据）
├── types/              # TypeScript类型定义
└── main.tsx            # 应用入口
```

## 🎨 主题定制

系统支持明暗主题切换，主题配置位于`src/contexts/ThemeContext.tsx`文件中。您可以根据需求调整颜色方案和主题行为。

## 📊 数据持久化

系统使用localStorage进行数据本地持久化，确保用户数据在页面刷新或浏览器重启后仍然保留。在实际生产环境中，建议集成后端API实现服务器端数据存储。

## 🔒 安全注意事项

- 本系统为演示目的设计，实际部署时请更换默认登录凭证
- 敏感数据（如密码）应进行加密存储
- 生产环境中建议实现更严格的访问控制和数据验证

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进此项目。在提交PR之前，请确保您的代码符合项目的编码规范。

## 📄 许可证

本项目采用MIT许可证 - 查看LICENSE文件了解详情

## 📞 联系方式

如有任何问题或建议，请通过以下方式联系我们：

- Email: support@example.com
- GitHub: [your-username/vehicle-management-system](https://github.com/your-username/vehicle-management-system)

---

© 2025 车辆管理系统 - 版权所有