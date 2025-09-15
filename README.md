# 车辆管理系统 - Vehicle Management System

一个基于 React、TypeScript 和 Node.js 的现代化车辆管理系统，支持车辆信息管理、维修记录、发票管理和数据导出等功能。

## 功能特性

- 🚗 **车辆管理**: 支持添加、编辑、删除和查看车辆信息
- 🛠️ **维修记录**: 记录维修工单、配件信息和维修过程
- 🧾 **发票管理**: 管理车辆服务相关发票，支持OCR识别
- 📊 **数据分析**: 提供车辆统计和服务分析
- 💾 **数据导出**: 支持导出Excel、CSV和JSON格式数据
- 🔒 **用户权限**: 支持不同角色的用户权限管理
- 🌓 **主题切换**: 支持明暗主题，提升用户体验
- 📱 **响应式设计**: 适配桌面和移动设备

## 技术栈

- **前端**: React 18+、TypeScript、Tailwind CSS、React Router
- **后端**: Node.js、Express、MongoDB
- **工具**: Vite、ESLint、Prettier

## 目录结构

```
├── src/                # 前端源码
│   ├── components/     # 通用组件
│   ├── contexts/       # 上下文管理
│   ├── hooks/          # 自定义钩子
│   ├── pages/          # 页面组件
│   ├── services/       # 服务层
│   ├── types/          # 类型定义
│   └── App.tsx         # 应用入口
├── server.js           # 后端服务器
├── package.json        # 项目依赖
└── README.md           # 项目说明
```

## 部署教程

### 1. 本地部署

#### 前置条件
- Node.js 16+
- npm/pnpm/yarn
- MongoDB

#### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/AKE5297/vehicle-management-system.git
cd vehicle-management-system
```

2. 安装依赖
```bash
pnpm install
```

3. 创建环境变量文件 `.env`
```env
# MongoDB 连接字符串
MONGODB_URI=mongodb://localhost:27017/vehicle-management

# JWT 密钥
JWT_SECRET=your-secret-key

# 上传目录
UPLOAD_DIR=uploads

# 端口
PORT=5000
```

4. 创建照片目录
```bash
mkdir uploads
mkdir -p uploads/vehicle_photos uploads/entry_photos uploads/exit_photos uploads/maintenance_photos uploads/invoice_photos uploads/part_photos uploads/note_photos
```

5. 运行项目
```bash
pnpm dev  # 开发模式
# 或
pnpm build && pnpm start  # 生产模式
```

### 2. NAS 部署 (群晖 Synology / 飞牛 OS)

#### 群晖 Synology

1. **安装 Docker 套件**
   - 在 DSM 控制台中打开 "套件中心"
   - 搜索并安装 "Docker" 套件

2. **创建项目目录**
   - 在 File Station 中创建目录结构：`/volume1/docker/vehicle-management/`
   - 在该目录下创建 `uploads` 和 `mongodb-data` 子目录

3. **准备配置文件**
   - 在 `vehicle-management` 目录下创建 `docker-compose.yml` 文件，内容如下：
```yaml
version: '3.8'

services:
  app:
    image: node:18-alpine
    container_name: vehicle-management-app
    working_dir: /app
    ports:
      - "3000:3000"
      - "5000:5000"
    volumes:
      - ./:/app
      - ./uploads:/app/uploads
    environment:
      - MONGODB_URI=mongodb://db:27017/vehicle-management
      - JWT_SECRET=your-secret-key
      - UPLOAD_DIR=/app/uploads
      - PORT=5000
    depends_on:
      - db
    command: sh -c "git clone https://github.com/AKE5297/vehicle-management-system.git /app && cd /app && npm install -g pnpm && pnpm install && pnpm build && pnpm start"
    
  db:
    image: mongo:latest
    container_name: vehicle-management-db
    volumes:
      - ./mongodb-data:/data/db
    ports:
      - "27017:27017"
    restart: always
```

4. **通过 SSH 连接到 NAS**
   - 打开 DSM 控制面板，启用 SSH 服务
   - 使用终端连接：`ssh admin@your-nas-ip`

5. **启动服务**
   ```bash
   cd /volume1/docker/vehicle-management
   docker-compose up -d
   ```

6. **配置照片目录权限**
   ```bash
   chmod -R 777 ./uploads
   ```

7. **访问系统**
   - 打开浏览器，访问 `http://your-nas-ip:3000`

#### 飞牛 OS (FeiNiu OS)

1. **安装容器管理应用**
   - 在飞牛 OS 应用商店中搜索并安装 "Docker 管理器"

2. **创建项目目录**
   - 在 "文件管理" 中创建 `vehicle-management` 目录

3. **使用 Docker Compose 部署**
   - 创建与群晖相同的 `docker-compose.yml` 文件
   - 通过 Docker 管理器导入并启动

4. **设置开机自启**
   - 在容器设置中启用 "开机自启" 选项

### 3. Linux 服务器部署

#### 前置条件
- Ubuntu/Debian/CentOS 服务器
- Node.js 16+
- Docker (推荐) 或 MongoDB 服务

#### Docker 部署

1. **安装 Docker 和 Docker Compose**
   ```bash
   # Ubuntu/Debian
   apt update && apt install docker.io docker-compose -y
   
   # CentOS
   yum install docker docker-compose -y
   systemctl start docker
   systemctl enable docker
   ```

2. **创建项目目录**
   ```bash
   mkdir -p /opt/vehicle-management
   cd /opt/vehicle-management
   ```

3. **创建 docker-compose.yml**
   ```yaml
   version: '3.8'
   
   services:
     app:
       image: node:18-alpine
       container_name: vehicle-management-app
       working_dir: /app
       ports:
         - "80:3000"  # 直接使用80端口
         - "5000:5000"
       volumes:
         - ./:/app
         - ./uploads:/app/uploads
       environment:
         - MONGODB_URI=mongodb://db:27017/vehicle-management
         - JWT_SECRET=your-secret-key
         - UPLOAD_DIR=/app/uploads
         - PORT=5000
       depends_on:
         - db
       restart: unless-stopped
       command: sh -c "git clone https://github.com/AKE5297/vehicle-management-system.git /app && cd /app && npm install -g pnpm && pnpm install && pnpm build && pnpm start"
       
     db:
       image: mongo:latest
       container_name: vehicle-management-db
       volumes:
         - ./mongodb-data:/data/db
       restart: unless-stopped
   ```

4. **启动服务**
   ```bash
   docker-compose up -d
   ```

5. **配置防火墙**
   ```bash
   # Ubuntu/Debian
   ufw allow 80
   ufw allow 443
   
   # CentOS
   firewall-cmd --permanent --add-port=80/tcp
   firewall-cmd --permanent --add-port=443/tcp
   firewall-cmd --reload
   ```

#### 手动部署 (无 Docker)

1. **安装依赖**
   ```bash
   apt update
   apt install nodejs npm mongodb -y
   npm install -g pnpm
   ```

2. **配置 MongoDB**
   ```bash
   systemctl start mongodb
   systemctl enable mongodb
   ```

3. **克隆项目**
   ```bash
   git clone https://github.com/AKE5297/vehicle-management-system.git /opt/vehicle-management
   cd /opt/vehicle-management
   ```

4. **安装项目依赖**
   ```bash
   pnpm install
   ```

5. **创建环境变量**
   ```bash
   echo 'MONGODB_URI=mongodb://localhost:27017/vehicle-management' >> .env
   echo 'JWT_SECRET=your-secret-key' >> .env
   echo 'UPLOAD_DIR=uploads' >> .env
   echo 'PORT=5000' >> .env
   ```

6. **创建照片目录**
   ```bash
   mkdir -p uploads/vehicle_photos uploads/entry_photos uploads/exit_photos uploads/maintenance_photos uploads/invoice_photos uploads/part_photos uploads/note_photos
   chmod -R 777 uploads
   ```

7. **构建项目**
   ```bash
   pnpm build
   ```

8. **使用 PM2 管理进程**
   ```bash
   npm install -g pm2
   pm2 start pnpm --name "vehicle-management" -- start
   pm2 startup
   pm2 save
   ```

### 4. GitHub Pages 部署

GitHub Pages 仅支持静态网站部署，此项目包含后端服务，因此需要使用 Vercel、Netlify 等支持全栈应用的平台，或者只部署前端部分并连接到远程后端。

#### 前端部署 + 远程后端

1. **构建前端**
   ```bash
   pnpm build:client
   ```

2. **配置 API 地址**
   - 在 `src/services/mockService.ts` 中修改 `API_BASE_URL` 为您的后端服务地址

3. **部署到 GitHub Pages**
   ```bash
   npm install -g gh-pages
   gh-pages -d dist/static
   ```

4. **设置自定义域名 (可选)**
   - 在 GitHub 仓库设置中配置自定义域名

### 5. Cloudflare Pages 部署

Cloudflare Pages 支持静态网站和部分无服务器功能，但对于完整的全栈应用，您需要将后端部署到其他服务。下面是前端部署到 Cloudflare Pages 的方法：

#### 前端部署 + 远程后端

1. **登录 Cloudflare 账户**
   - 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 选择 "Pages" 选项卡

2. **创建新项目**
   - 连接您的 GitHub 仓库：https://github.com/AKE5297/vehicle-management-system
   - 配置构建设置：
     - 构建命令: `pnpm build:client`
     - 构建输出目录: `dist/static`
     - 环境变量:
       - `NODE_VERSION`: 18
       - `VITE_API_BASE_URL`: `https://your-backend-api.com/api`
       - `VITE_USE_REAL_API`: `true`

3. **部署**
   - 点击 "Save and Deploy" 开始部署过程

4. **配置自定义域名 (可选)**
   - 在 Pages 设置中配置自定义域名

#### 配置远程后端

由于 Cloudflare Pages 主要用于静态内容部署，您需要将后端部署到其他支持 Node.js 的平台，如:

- Cloudflare Workers
- Vercel Serverless Functions
- AWS Lambda
- Google Cloud Functions
- 自建服务器

在前端部署完成后，确保在 Cloudflare Pages 设置中正确配置了 `VITE_API_BASE_URL` 环境变量，指向您的后端服务地址。

### 6. 使用 docker-compose.yml 一键部署

如果您的环境已安装 Docker 和 Docker Compose，可以直接使用项目根目录下的 `docker-compose.yml` 文件进行一键部署：

1. **创建项目目录**
   ```bash
   mkdir vehicle-management && cd vehicle-management
   ```

2. **创建 docker-compose.yml 文件**
   ```bash
   nano docker-compose.yml
   ```
   复制项目根目录中的 docker-compose.yml 内容并保存

3. **启动服务**
   ```bash
   docker-compose up -d
   ```

4. **等待部署完成**
   - 首次启动时需要拉取代码和依赖，时间会稍长
   - 可以通过 `docker logs vehicle-management-app` 查看部署进度

5. **访问系统**
   - 打开浏览器，访问 `http://localhost:3000`

## 默认账户

系统启动后，会自动创建默认管理员账户：
- 用户名: `admin`
- 密码: `admin123`

请登录后及时修改密码。

## 照片文件存储结构

系统使用以下目录结构存储不同类型的照片：

```
uploads/
├── vehicle_photos/      # 车辆基本照片
├── entry_photos/        # 车辆进场照片
├── exit_photos/         # 车辆离场照片
├── maintenance_photos/  # 维修过程照片
├── invoice_photos/      # 发票照片
├── part_photos/         # 配件照片
└── note_photos/         # 备注照片
```

文件名格式：`时间戳_车牌号_车辆ID_目录类型.扩展名`

## 常见问题

1. **照片上传后不显示**
   - 检查上传目录权限是否正确设置
   - 确认照片存储路径配置正确

2. **数据库连接失败**
   - 检查 MongoDB 服务是否运行
   - 验证连接字符串是否正确

3. **部署到子路径后路由问题**
   - 在 Vite 配置中设置 `base` 选项
   - 调整 React Router 路由配置

## License

MIT