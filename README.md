# 车辆管理系统

## 项目简介

车辆管理系统是一款专为汽车维修、保养和保险服务行业设计的现代化管理工具，旨在帮助企业高效管理车辆信息、维修记录、发票和客户数据。

## 功能特点

- **车辆信息管理**：完整记录车辆基本信息、服务历史和状态追踪
- **维修保养管理**：详细记录维修过程、使用配件和工时费用
- **发票管理**：自动生成、管理和追踪各类服务发票
- **用户权限控制**：支持多级用户权限管理，保障数据安全
- **数据导出功能**：支持导出多种格式的数据报告（JSON、CSV、Excel）
- **自动数据备份**：定期自动备份系统数据，防止数据丢失
- **响应式设计**：适配各种设备屏幕，提供流畅的用户体验

## 系统架构

- **前端技术栈**：React 18+、TypeScript、Tailwind CSS
- **数据存储**：本地数据存储 + MongoDB（可选）
- **部署方式**：支持本地部署、Docker部署、云端部署

## 快速开始

### 安装前提

- Node.js 18+
- npm/yarn/pnpm
- MongoDB（可选，默认使用本地存储）

### 本地开发

1. 克隆项目仓库

```bash
git clone https://github.com/AKE5297/vehicle-management-system.git
cd vehicle-management-system
```

2. 安装依赖

```bash
# 使用 npm
npm install

# 或使用 pnpm
pnpm install
```

3. 启动开发服务器

```bash
npm run dev
# 或
pnpm dev
```

4. 访问系统
   打开浏览器，访问 http://localhost:5173

## 部署方式

<details>
<summary>本地部署</summary>

### 本地部署

1. 克隆项目仓库

```bash
git clone https://github.com/AKE5297/vehicle-management-system.git
cd vehicle-management-system
```

2. 安装依赖并构建

```bash
# 使用 npm
npm install
npm run build

# 或使用 pnpm
pnpm install
pnpm build
```

3. 启动应用

```bash
npm run preview
# 或
pnpm preview
```

4. 访问系统
   打开浏览器，访问 http://localhost:4173
</details>

<details>
<summary>Docker 部署</summary>

### Docker 部署

1. 确保已安装 Docker 和 Docker Compose
2. 克隆项目仓库

```bash
git clone https://github.com/AKE5297/vehicle-management-system.git
cd vehicle-management-system
```

3. 使用 Docker Compose 启动应用

```bash
docker-compose up -d
```

4. 访问系统
   打开浏览器，访问 http://localhost:3001

**docker-compose.yml 文件说明：**

```yaml
version: '3.8'

services:
  app:
    image: node:18-alpine  # 使用 Node.js 18 Alpine 镜像
    container_name: vehicle-management-app  # 容器名称
    working_dir: /app  # 工作目录
    ports:
      - "3001:3000"  # 端口映射：主机端口:容器端口
      - "5001:5000"  # API 服务端口映射
    volumes:
      - ./:/app  # 将当前目录挂载到容器的 /app 目录
      - ./uploads:/app/uploads  # 挂载上传目录
    environment:
      - MONGODB_URI=mongodb://admin:password@db:27017/vehicle-management?authSource=admin  # MongoDB 连接字符串
      - JWT_SECRET=your-secret-key  # JWT 密钥
      - UPLOAD_DIR=/app/uploads  # 上传目录配置
      - PORT=5000  # API 服务端口
    depends_on:
      - db  # 依赖 MongoDB 服务
    command: sh -c "npm install -g pnpm && pnpm install && pnpm build && pnpm start"  # 启动命令，安装依赖并构建运行

  db:
    image: mongo:latest  # 使用最新版 MongoDB 镜像
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin  # MongoDB 管理员用户名
      - MONGO_INITDB_ROOT_PASSWORD=password  # MongoDB 管理员密码
    container_name: vehicle-management-db  # MongoDB 容器名称
    volumes:
      - ./mongodb-data:/data/db  # 挂载数据目录，持久化存储
    ports:
      - "27017:27017"  # MongoDB 端口映射
    restart: always  # 自动重启
```
</details>

<details>
<summary>NAS 部署（群辉、飞牛OS等）</summary>

### NAS 部署

1. 在 NAS 上安装 Docker 套件
2. 打开 Docker 套件，创建新的容器
3. 配置容器参数：
   - 镜像：node:18-alpine
   - 端口映射：3001->3000, 5001->5000
   - 卷映射：
     - 本地路径:目标路径，例如 `/volume1/docker/vehicle-management-system:/app`
     - 本地路径:目标路径，例如 `/volume1/docker/vehicle-management-system/uploads:/app/uploads`
     - 本地路径:目标路径，例如 `/volume1/docker/vehicle-management-system/mongodb-data:/data/db`
   - 环境变量：
     - MONGODB_URI=mongodb://admin:password@localhost:27017/vehicle-management?authSource=admin
     - JWT_SECRET=your-secret-key
     - UPLOAD_DIR=/app/uploads
     - PORT=5000
4. 启动容器
5. 访问系统：http://[NAS IP]:3001

**注意：** 如果您的 NAS 支持 Docker Compose，可以直接使用项目中的 docker-compose.yml 文件进行部署。
</details>

<details>
<summary>服务器部署</summary>

### 服务器部署

1. 准备一台 VPS 或云服务器（推荐配置：2GB RAM，2核 CPU）
2. 安装 Node.js 18+ 和 MongoDB（可选）
3. 克隆项目仓库

```bash
git clone https://github.com/AKE5297/vehicle-management-system.git
cd vehicle-management-system
```

4. 安装依赖并构建

```bash
npm install
npm run build
```

5. 使用 PM2 管理进程

```bash
npm install -g pm2
pm2 start npm --name "vehicle-management" -- run preview
```

6. 配置反向代理（使用 Nginx）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:4173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

7. 重启 Nginx

```bash
sudo systemctl restart nginx
```

8. 访问系统：http://your-domain.com
</details>

<details>
<summary>GitHub Pages 部署</summary>

### GitHub Pages 部署

1. 确保项目已经推送到 GitHub 仓库
2. 修改 `vite.config.ts` 文件，添加 base 路径：

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/vehicle-management-system/' // 替换为你的仓库名称
})
```

3. 创建 GitHub Actions 工作流文件 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build
        run: npm run build
        
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

4. 提交更改并推送到 GitHub
5. 在 GitHub 仓库设置中启用 GitHub Pages，选择 `gh-pages` 分支
6. 等待部署完成，访问系统：https://[username].github.io/vehicle-management-system
</details>

<details>
<summary>Cloudflare Pages 部署</summary>

### Cloudflare Pages 部署

1. 登录 Cloudflare 账户
2. 点击 "Pages"，然后点击 "Create a project"
3. 连接 GitHub 仓库，选择 vehicle-management-system 仓库
4. 配置构建参数：
   - Framework preset: React
   - Build command: npm run build
   - Build output directory: dist
   - Root directory: /
5. 点击 "Save and Deploy"
6. 部署完成后，访问系统：https://[project-name].pages.dev

**注意：** 使用 Cloudflare Pages 部署时，由于是纯前端应用，所有数据将存储在浏览器的本地存储中，不支持 MongoDB 功能。
</details>

<details>
<summary>Cloudflare Workers 部署</summary>

### Cloudflare Workers 部署

1. 登录 Cloudflare 账户
2. 安装 Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

3. 在项目根目录创建 `wrangler.toml` 文件：

```toml
name = "vehicle-management-system"
type = "static"
account_id = "your-account-id"
zone_id = "your-zone-id"
workers_dev = true

[site]
bucket = "./dist"
```

4. 构建项目

```bash
npm run build
```

5. 部署到 Cloudflare Workers

```bash
wrangler publish
```

6. 访问系统：https://vehicle-management-system.[your-subdomain].workers.dev
</details>

## MongoDB 教程

<details>
<summary>MongoDB 安装与配置</summary>

### MongoDB 安装与配置

#### 本地安装 MongoDB

1. 访问 [MongoDB 官网下载中心](https://www.mongodb.com/try/download/community)，下载适合您操作系统的安装包
2. 按照安装向导完成安装
3. 启动 MongoDB 服务

#### Docker 方式安装 MongoDB

```bash
docker run -d --name mongo -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo
```

#### 配置 MongoDB 连接

在项目的 `.env` 文件中配置 MongoDB 连接字符串：

```
VITE_MONGODB_URI=mongodb://admin:password@localhost:27017/vehicle-management?authSource=admin
```

#### MongoDB 备份与恢复

备份数据库：

```bash
mongodump --uri="mongodb://admin:password@localhost:27017/vehicle-management?authSource=admin" --out=./mongo-backup
```

恢复数据库：

```bash
mongorestore --uri="mongodb://admin:password@localhost:27017/vehicle-management?authSource=admin" ./mongo-backup
```
</details>

## 界面截图

<!-- 预留界面截图位置，后期会添加 -->

## 使用说明

### 登录系统

系统默认提供两个用户账户：

- 管理员账户：
  - 用户名：admin
  - 密码：admin123
- 普通用户账户：
  - 用户名：user1
  - 密码：user123

### 主要功能模块

1. **车辆管理**：添加、编辑、删除和查看车辆信息
2. **维修管理**：记录和管理车辆维修保养记录
3. **发票管理**：生成和管理服务发票
4. **数据管理**：备份、恢复和导出系统数据
5. **系统设置**：用户管理、系统配置等

## 支付方式

<div style="display: flex; justify-content: center; gap: 20px; margin: 20px 0;">
  <div style="text-align: center;">
    <h3>微信支付</h3>
    <img src="https://github.com/user-attachments/assets/1d3bae2a-4f7b-437b-9e79-d3fdfb80af75" alt="微信支付" style="width: 200px; height: 200px;">
  </div>
  <div style="text-align: center;">
    <h3>支付宝</h3>
    <img src="https://github.com/user-attachments/assets/ce03a5fe-d2f5-4ff4-b8eb-e611aab43f95" alt="支付宝" style="width: 200px; height: 200px;">
  </div>
</div>

## 常见问题

1. **端口占用问题**：
   - 如果启动时提示端口被占用，可以修改 docker-compose.yml 文件中的端口映射，例如将 3001:3000 改为 3002:3000
   - 或者停止占用端口的其他应用程序

2. **数据同步问题**：
   - 系统会自动在本地存储数据，确保即使离线也能使用
   - 如果需要同步到 MongoDB，可以配置正确的连接字符串

3. **备份恢复问题**：
   - 系统支持自动备份和手动备份功能
   - 备份文件存储在浏览器的本地存储中，可以导出保存

## 支持项目

如果您觉得这个项目对您有帮助，请考虑支持我们的开发工作。您的支持将帮助我们持续改进和维护这个项目。

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 版权信息

© 2025 车辆管理系统 - 版权所有