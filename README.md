# 车辆管理系统 (Vehicle Management System)

一个功能完整的车辆管理系统，支持车辆信息管理、维修记录跟踪、发票管理等核心功能，适用于汽车维修店、车队管理等场景。

## 🚀 功能特点

- **车辆管理**：完整的车辆信息录入、查询、修改和删除功能
- **维修记录**：跟踪和管理车辆维修、保养和事故记录
- **发票管理**：生成、查看和管理车辆相关的发票
- **用户权限**：支持管理员和普通用户权限管理
- **数据导出**：支持多种格式（JSON、CSV、Excel、PDF）数据导出
- **数据备份**：自动和手动数据备份与恢复功能
- **响应式设计**：适配桌面和移动设备的响应式界面
- **暗黑模式**：支持明亮和暗黑两种显示模式

## 📸 界面截图

*（界面截图将在后续更新中添加）*

## 🚀 快速开始

### 环境要求

- Node.js 16+
- npm/pnpm/yarn
- MongoDB（可选，默认使用本地存储模拟数据）

### 安装步骤

```bash
# 克隆项目仓库
git clone https://github.com/AKE5297/vehicle-management-system.git

# 进入项目目录
cd vehicle-management-system

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

系统默认使用管理员账户登录：
- 用户名: admin
- 密码: admin123

## 🔧 部署指南

<details>
<summary>📥 本地部署</summary>

### 方法一：使用 npm/pnpm/yarn

```bash
# 安装依赖
pnpm install

# 构建项目
pnpm build

# 启动服务
pnpm start
```

服务启动后，访问 `http://localhost:3000` 即可使用系统。

### 方法二：使用 Docker Compose

```bash
# 克隆项目
git clone https://github.com/AKE5297/vehicle-management-system.git
cd vehicle-management-system

# 使用 Docker Compose 启动
docker-compose up -d
```

服务启动后，访问 `http://localhost:3000` 即可使用系统。

</details>

<details>
<summary>📦 NAS部署（群晖、飞牛OS等）</summary>

### 群晖 NAS 部署步骤

1. 确保您的群晖 NAS 已安装 Docker 套件
2. 打开 Docker 套件，进入"注册表"搜索 `node` 和 `mongo` 镜像并下载
3. 进入"文件服务"，创建一个共享文件夹（如：`vehicle-management`）
4. 在共享文件夹内创建 `docker-compose.yml` 文件，内容如下：

```yaml
version: '3.8'

services:
  app:
    image: node:18-alpine
    container_name: vehicle-management-app
    working_dir: /app
    ports:
      - "3000:5000"  # 直接将容器5000端口映射到主机3000端口，简化访问
    volumes:
      - ./app:/app  # 映射到您的项目目录
      - node_modules:/app/node_modules  # 避免本地node_modules与容器冲突
      - ./uploads:/app/uploads  # 确保上传目录正确挂载
    environment:
      - MONGODB_URI=mongodb://admin:password@db:27017/vehicle-management?authSource=admin
      - JWT_SECRET=your-secret-key
      - UPLOAD_DIR=/app/uploads
      - PORT=5000
    depends_on:
      - db
    # 优化构建命令，先检查文件是否存在，然后安装依赖
    command: sh -c "echo '查看当前目录内容...' && ls -la && echo '检查package.json是否存在...' && if [ -f /app/package.json ]; then apk add --no-cache git && npm install -g pnpm && pnpm install && pnpm build && pnpm start; else echo '错误: 未找到package.json文件，检查卷挂载配置'; ls -la /; fi"
    
  db:
    image: mongo:latest
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
    container_name: vehicle-management-db
    volumes:
      - ./mongodb-data:/data/db
    ports:
      - "27017:27017"
    restart: always
    
volumes:
  node_modules:  # 创建named volume避免卷挂载冲突
```

5. 使用 SSH 连接到您的群晖 NAS，进入共享文件夹目录：

```bash
cd /volume1/vehicle-management
```

6. 克隆项目代码：

```bash
git clone https://github.com/AKE5297/vehicle-management-system.git app
```

7. 启动服务：

```bash
docker-compose up -d
```

8. 访问 `http://您的NAS_IP:3000` 即可使用系统

### 飞牛OS 部署步骤

1. 登录飞牛OS管理界面
2. 打开 Docker 应用，进入"镜像"标签页，搜索并下载 `node:18-alpine` 和 `mongo:latest` 镜像
3. 进入"容器"标签页，点击"创建容器"，选择 `node:18-alpine` 镜像
4. 设置容器名称为 `vehicle-management-app`
5. 在"网络"设置中，映射端口 3000 到主机的 3000 端口
6. 在"存储"设置中，添加以下卷映射：
   - 主机路径：`/mnt/data/vehicle-management/app`，容器路径：`/app`
   - 主机路径：`/mnt/data/vehicle-management/uploads`，容器路径：`/app/uploads`
   - 卷名：`node_modules`，容器路径：`/app/node_modules`
7. 在"环境变量"设置中，添加以下环境变量：
   - `MONGODB_URI=mongodb://admin:password@db:27017/vehicle-management?authSource=admin`
   - `JWT_SECRET=your-secret-key`
   - `UPLOAD_DIR=/app/uploads`
   - `PORT=5000`
8. 在"命令"设置中，输入：`sh -c "apk add --no-cache git && git clone https://github.com/AKE5297/vehicle-management-system.git /app && cd /app && npm install -g pnpm && pnpm install && pnpm build && pnpm start"`
9. 同理，创建 MongoDB 容器，设置相应的环境变量和卷映射
10. 点击"创建"按钮启动容器
11. 访问 `http://您的飞牛OS_IP:3000` 即可使用系统

</details>

<details>
<summary>🖥️ 服务器部署</summary>

### 方法一：直接部署

1. 在您的服务器上安装 Node.js 和 npm/pnpm
2. 克隆项目仓库：

```bash
git clone https://github.com/AKE5297/vehicle-management-system.git
cd vehicle-management-system
```

3. 安装依赖：

```bash
pnpm install
```

4. 构建项目：

```bash
pnpm build
```

5. 使用 PM2 或其他进程管理器运行应用：

```bash
npm install -g pm2
pm2 start "pnpm start" --name vehicle-management-system
```

6. 配置反向代理（以 Nginx 为例）：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 方法二：使用 Docker 部署

1. 在服务器上安装 Docker 和 Docker Compose
2. 创建项目目录：

```bash
mkdir vehicle-management-system
cd vehicle-management-system
```

3. 创建 `docker-compose.yml` 文件，内容与前面的 NAS 部署部分相同
4. 克隆项目代码：

```bash
git clone https://github.com/AKE5297/vehicle-management-system.git app
```

5. 启动服务：

```bash
docker-compose up -d
```

6. 配置反向代理（可选，如果需要使用域名访问）

</details>

<details>
<summary>☁️ Cloudflare Pages 部署</summary>

Cloudflare Pages 提供了简单的静态网站部署方案，特别适合前端应用。

1. 访问 [Cloudflare 控制台](https://dash.cloudflare.com/) 并登录
2. 在左侧导航栏中，点击"Pages"
3. 点击"创建项目"按钮
4. 选择"连接到 Git"选项
5. 选择您的 Git 提供商（GitHub、GitLab 或 Bitbucket）
6. 找到并选择 `vehicle-management-system` 仓库
7. 在"构建设置"部分，配置以下选项：
   - 构建命令：`pnpm build:client`
   - 构建输出目录：`dist/static`
   - 根目录：`/`
8. 点击"保存并部署"按钮
9. Cloudflare Pages 将自动构建和部署您的应用
10. 部署完成后，您将获得一个 Cloudflare 提供的域名，可以通过该域名访问您的应用

注意：Cloudflare Pages 仅支持静态网站部署，如果需要后端 API 功能，您可能需要结合 Cloudflare Workers 或其他服务来处理 API 请求。

</details>

<details>
<summary>⚙️ Cloudflare Workers 部署</summary>

Cloudflare Workers 可以用于处理 API 请求和部署轻量级后端服务。

1. 安装 Wrangler CLI：

```bash
npm install -g wrangler
```

2. 登录到您的 Cloudflare 账户：

```bash
wrangler login
```

3. 初始化一个新的 Workers 项目：

```bash
wrangler init vehicle-management-api
```

4. 编辑 `wrangler.toml` 文件，配置您的 Workers 设置
5. 创建或修改 `index.ts` 文件，实现所需的 API 功能
6. 部署您的 Workers 服务：

```bash
wrangler publish
```

7. 更新前端应用的 API 基础 URL 指向您的 Workers URL

注意：Cloudflare Workers 主要用于处理 API 请求，对于完整的车辆管理系统，您可能需要结合 Cloudflare Pages 部署前端，Cloudflare Workers 处理 API，以及一个外部数据库服务。

</details>

## 🐳 Docker Compose 配置详解

以下是 `docker-compose.yml` 文件中每条命令的用处和意义：

```yaml
version: '3.8'  # 指定 Docker Compose 文件格式版本

services:  # 定义服务
  app:  # 应用服务名称
    image: node:18-alpine  # 使用 Node.js 18 Alpine 镜像，轻量级且包含基本功能
    container_name: vehicle-management-app  # 容器名称
    working_dir: /app  # 设置容器内的工作目录
    ports:  # 端口映射，主机端口:容器端口
      - "3000:5000"  # 将容器的 5000 端口映射到主机的 3000 端口，方便访问
    volumes:  # 数据卷挂载
      - ./app:/app  # 将主机的当前目录映射到容器的 /app 目录，实现代码同步
      - node_modules:/app/node_modules  # 创建命名卷存储 node_modules，避免与本地冲突
      - ./uploads:/app/uploads  # 映射上传目录，确保上传的文件持久化存储
    environment:  # 环境变量配置
      - MONGODB_URI=mongodb://admin:password@db:27017/vehicle-management?authSource=admin  # MongoDB 连接字符串
      - JWT_SECRET=your-secret-key  # JWT 加密密钥
      - UPLOAD_DIR=/app/uploads  # 上传目录路径
      - PORT=5000  # 应用运行端口
    depends_on:  # 依赖关系，确保 db 服务先启动
      - db
    command: sh -c "echo '查看当前目录内容...' && ls -la && echo '检查package.json是否存在...' && if [ -f /app/package.json ]; then apk add --no-cache git && npm install -g pnpm && pnpm install && pnpm build && pnpm start; else echo '错误: 未找到package.json文件，检查卷挂载配置'; ls -la /; fi"  # 容器启动命令，安装依赖并启动服务
    
  db:  # 数据库服务名称
    image: mongo:latest  # 使用最新版本的 MongoDB 镜像
    environment:  # 数据库环境变量
      - MONGO_INITDB_ROOT_USERNAME=admin  # MongoDB 管理员用户名
      - MONGO_INITDB_ROOT_PASSWORD=password  # MongoDB 管理员密码
    container_name: vehicle-management-db  # 数据库容器名称
    volumes:  # 数据持久化
      - ./mongodb-data:/data/db  # 将数据库数据映射到主机，确保数据持久化
    ports:  # 数据库端口映射
      - "27017:27017"  # MongoDB 默认端口
    restart: always  # 容器退出时自动重启
    
volumes:  # 定义命名卷
  node_modules:  # 创建 node_modules 命名卷，避免卷挂载冲突
```

### Docker Compose 部署说明

1. 确保您的系统已安装 Docker 和 Docker Compose
2. 克隆项目代码：

```bash
git clone https://github.com/AKE5297/vehicle-management-system.git
cd vehicle-management-system
```

3. 启动服务：

```bash
docker-compose up -d
```

4. 停止服务：

```bash
docker-compose down
```

5. 查看服务状态：

```bash
docker-compose ps
```

6. 查看应用日志：

```bash
docker logs vehicle-management-app
```

## 📊 MongoDB 使用指南

<details>
<summary>📋 基本操作</summary>

### 连接到 MongoDB

使用 MongoDB 客户端连接到数据库：

```bash
mongo "mongodb://admin:password@localhost:27017/vehicle-management?authSource=admin"
```

### 创建数据库和集合

系统会自动创建所需的数据库和集合，但如果需要手动创建：

```javascript
// 创建数据库
use vehicle-management;

// 创建集合
db.createCollection("vehicles");
db.createCollection("maintenance_records");
db.createCollection("invoices");
db.createCollection("users");
db.createCollection("system_logs");
```

### 查询数据

```javascript
// 查询所有车辆
db.vehicles.find();

// 查询特定车辆
db.vehicles.find({ licensePlate: "京A12345" });

// 分页查询
db.vehicles.find().skip(0).limit(10);
```

### 更新数据

```javascript
// 更新车辆信息
db.vehicles.updateOne(
  { _id: ObjectId("车辆ID") },
  { $set: { brand: "新品牌", updatedAt: new Date() } }
);
```

### 删除数据

```javascript
// 删除车辆
db.vehicles.deleteOne({ _id: ObjectId("车辆ID") });

// 清空集合
db.vehicles.deleteMany({});
```

</details>

<details>
<summary>🔧 数据备份与恢复</summary>

### 备份数据库

```bash
# 备份所有数据库
mongodump --uri="mongodb://admin:password@localhost:27017" --out=/path/to/backup/directory

# 备份特定数据库
mongodump --uri="mongodb://admin:password@localhost:27017/vehicle-management" --out=/path/to/backup/directory
```

### 恢复数据库

```bash
# 恢复所有数据库
mongorestore --uri="mongodb://admin:password@localhost:27017" /path/to/backup/directory

# 恢复特定数据库
mongorestore --uri="mongodb://admin:password@localhost:27017/vehicle-management" /path/to/backup/directory/vehicle-management
```

</details>

<details>
<summary>⚙️ 性能优化</summary>

### 创建索引

为常用查询字段创建索引可以提高查询性能：

```javascript
// 为车牌号创建索引
db.vehicles.createIndex({ licensePlate: 1 });

// 为日期字段创建索引
db.maintenance_records.createIndex({ entryTime: -1 });
```

### 监控数据库

使用 MongoDB 自带的监控工具监控数据库性能：

```bash
# 启动 MongoDB 监控界面
mongostat

# 查看数据库状态
db.stats();

# 查看集合统计信息
db.vehicles.stats();
```

</details>

## 📁 项目目录结构

```
vehicle-management-system/
├── src/                # 源代码目录
│   ├── components/     # 公共组件
│   ├── contexts/       # React 上下文
│   ├── hooks/          # 自定义钩子
│   ├── pages/          # 页面组件
│   ├── services/       # 服务层
│   ├── types/          # 类型定义
│   ├── App.tsx         # 应用主组件
│   └── main.tsx        # 入口文件
├── public/             # 静态资源
├── .gitignore          # Git 忽略文件
├── docker-compose.yml  # Docker Compose 配置
├── package.json        # 项目依赖配置
└── README.md           # 项目说明文档
```

## 🛠️ 开发指南

### 开发环境设置

```bash
# 克隆项目
git clone https://github.com/AKE5297/vehicle-management-system.git
cd vehicle-management-system

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 构建和部署

```bash
# 构建项目
pnpm build

# 运行生产服务器
pnpm start
```

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 React 最佳实践
- 使用 Tailwind CSS 进行样式设计

## 🤝 贡献指南

1. Fork 项目仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🎯 支持项目

如果您觉得这个项目对您有帮助，请考虑支持我们！

<div style="display: flex; gap: 20px; justify-content: center; align-items: center; margin: 20px 0;">
  <div style="text-align: center;">
    <p style="margin-bottom: 8px; font-weight: bold;">支付宝</p>
    <img src="https://github.com/user-attachments/assets/ce03a5fe-d2f5-4ff4-b8eb-e611aab43f95" alt="支付宝收款码" style="width: 180px; height: 180px;">
  </div>
  <div style="text-align: center;">
    <p style="margin-bottom: 8px; font-weight: bold;">微信</p>
    <img src="https://github.com/user-attachments/assets/1d3bae2a-4f7b-437b-9e79-d3fdfb80af75" alt="微信收款码" style="width: 180px; height: 180px;">
  </div>
</div>

## ❓ 常见问题

<details>
<summary>📌 登录问题</summary>

- 默认管理员账户：用户名 `admin`，密码 `admin123`
- 如果忘记密码，可以通过修改数据库中的用户密码记录进行重置
- 登录失败时，请检查网络连接和服务器状态

</details>

<details>
<summary>📌 数据导入导出</summary>

- 系统支持多种格式的数据导入导出功能
- 在"数据管理"页面可以执行数据备份和恢复操作
- 导出的数据包含所有车辆、维修记录和发票信息

</details>

<details>
<summary>📌 图片上传问题</summary>

- 系统支持常见图片格式（JPG、PNG、GIF 等）的上传
- 单张图片大小限制为 10MB
- 上传的图片存储在服务器的 `uploads` 目录

</details>

<details>
<summary>📌 Docker 相关问题</summary>

- 如果遇到 `git: not found` 错误，可以通过修改 `docker-compose.yml` 中的命令，在容器启动时自动安装 git
- 如果无法访问应用，请检查端口映射和防火墙设置
- 如果数据库连接失败，请检查 MongoDB 服务状态和连接字符串配置

</details>

## 📝 更新日志

### 版本 1.0.0 (2025-09-10)

- 初始版本发布
- 实现车辆管理、维修记录、发票管理等核心功能
- 支持数据导入导出、用户权限管理等功能
- 提供 Docker 部署支持