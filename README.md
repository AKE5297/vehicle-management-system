# 车辆管理系统

一款功能完备、现代化的车辆管理系统，提供车辆、维修和发票的全流程管理，助力您高效管理车队和维修业务。


✨ 特性

*   **车辆全生命周期管理**：从进场登记到离场跟踪，支持多维信息记录和照片存储
*   **智能维修工单系统**：配件管理、工时计算、费用统计一体化，提升维修效率
*   **发票与财务跟踪**：自动生成和管理发票，支持多种导出格式，便于财务核对
*   **完善的权限控制**：管理员与普通用户角色分离，保障数据安全
*   **数据导出与备份**：支持JSON、CSV、Excel和PDF格式导出，自动和手动备份功能


🚀 快速开始

### 演示账号

- 管理员账号：`admin` / `admin123`
- 普通用户账号：`user1` / `user123`

### 环境要求

- Node.js 16+
- MongoDB
- pnpm 或 npm/yarn

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/AKE5297/vehicle-management-system.git
cd vehicle-management-system

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```


📖 详细文档

<details>
<summary>📁 部署到本地</summary>

### 前提条件

- 安装 [Node.js](https://nodejs.org/) (v16+)
- 安装 [MongoDB](https://www.mongodb.com/try/download/community)
- 安装 [pnpm](https://pnpm.io/installation)

### 步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/AKE5297/vehicle-management-system.git
   cd vehicle-management-system
   ```

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **启动MongoDB服务**
   确保MongoDB服务已启动并运行在默认端口27017

4. **配置环境变量**
   创建 `.env` 文件并添加以下内容：
   ```
   MONGODB_URI=mongodb://localhost:27017/vehicle-management
   JWT_SECRET=your-secret-key
   UPLOAD_DIR=./uploads
   PORT=5000
   ```

5. **启动开发服务器**
   ```bash
   pnpm dev
   ```
   
   前端将运行在 http://localhost:3000，后端API将运行在 http://localhost:5000

6. **构建生产版本**
   ```bash
   pnpm build
   ```

7. **启动生产服务器**
   ```bash
   pnpm start
   ```
</details>

<details>
<summary>🗄️ 部署到NAS（群晖、飞牛OS等）</summary>

### 使用Docker Compose部署

1. **准备工作**
   - 在NAS上安装Docker和Docker Compose
   - 创建一个专用目录用于存放项目数据，例如：`/volume1/docker/vehicle-management`

2. **创建docker-compose.yml文件**
   在项目目录中创建`docker-compose.yml`文件：

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
         - MONGODB_URI=mongodb://admin:password@db:27017/vehicle-management?authSource=admin
         - JWT_SECRET=your-secret-key
         - UPLOAD_DIR=/app/uploads
         - PORT=5000
       depends_on:
         - db
       command: sh -c "git clone https://github.com/AKE5297/vehicle-management-system.git /app && cd /app && npm install -g pnpm && pnpm install && pnpm build && pnpm start"
       
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
   ```

3. **部署项目**
   - 通过SSH或NAS的文件管理器将`docker-compose.yml`文件上传到NAS上的项目目录
   - 打开NAS的终端或使用SSH连接到NAS
   - 导航到项目目录
   - 运行以下命令启动服务：
     ```bash
     docker-compose up -d
     ```

4. **访问系统**
   打开浏览器，访问 `http://NAS_IP:3000` 即可使用车辆管理系统

5. **数据持久化**
   - MongoDB数据将保存在 `./mongodb-data` 目录
   - 上传的图片将保存在 `./uploads` 目录
   - 确保这些目录有适当的权限
</details>

<details>
<summary>🌐 部署到服务器</summary>

### 使用Docker Compose部署

1. **准备工作**
   - 准备一台Linux服务器（推荐Ubuntu 20.04+）
   - 安装Docker和Docker Compose
   - 配置域名（可选）

2. **安装Docker和Docker Compose**
   ```bash
   # 更新系统包
   sudo apt update && sudo apt upgrade -y
   
   # 安装Docker
   sudo apt install docker.io -y
   
   # 安装Docker Compose
   sudo apt install docker-compose -y
   
   # 将当前用户添加到docker组
   sudo usermod -aG docker $USER
   ```

3. **创建项目目录**
   ```bash
   mkdir -p ~/vehicle-management
   cd ~/vehicle-management
   ```

4. **创建docker-compose.yml文件**
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
         - MONGODB_URI=mongodb://admin:password@db:27017/vehicle-management?authSource=admin
         - JWT_SECRET=your-secret-key
         - UPLOAD_DIR=/app/uploads
         - PORT=5000
       depends_on:
         - db
       command: sh -c "git clone https://github.com/AKE5297/vehicle-management-system.git /app && cd /app && npm install -g pnpm && pnpm install && pnpm build && pnpm start"
       
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
   ```

5. **启动服务**
   ```bash
   docker-compose up -d
   ```

6. **配置防火墙**
   ```bash
   sudo ufw allow 3000
   sudo ufw allow 5000
   sudo ufw allow 27017   # 仅在需要远程访问数据库时开放
   sudo ufw reload
   ```

7. **设置Nginx反向代理（可选）**
   ```bash
   # 安装Nginx
   sudo apt install nginx -y
   
   # 创建配置文件
   sudo nano /etc/nginx/sites-available/vehicle-management
   ```

   添加以下内容（替换`your-domain.com`为您的域名）：
   ```
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
       
       location /api {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

   启用配置并重启Nginx：
   ```bash
   sudo ln -s /etc/nginx/sites-available/vehicle-management /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **配置HTTPS（可选）**
   ```bash
   # 安装Certbot
   sudo apt install certbot python3-certbot-nginx -y
   
   # 获取SSL证书
   sudo certbot --nginx -d your-domain.com
   ```
</details>

<details>
<summary>☁️ 部署到Cloudflare Pages</summary>

Cloudflare Pages 是一个用于静态网站托管的平台，非常适合部署我们的前端应用。由于我们的应用还包含后端API，我们需要将前端和后端分开部署。

### 部署前端到Cloudflare Pages

1. **准备工作**
   - 确保您的代码已推送到GitHub仓库
   - 登录到 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 创建一个Cloudflare账号（如果还没有）

2. **创建Cloudflare Pages项目**
   - 在Cloudflare Dashboard中，选择"Pages"
   - 点击"创建项目"按钮
   - 选择"连接到Git"
   - 授权Cloudflare访问您的GitHub账户
   - 选择您的车辆管理系统仓库
   - 点击"开始设置"

3. **配置构建设置**
   - **项目名称**: 输入一个唯一的项目名称
   - **生产分支**: 通常是 `main` 或 `master`
   - **构建命令**: `pnpm build`
   - **构建输出目录**: `dist`
   - **根目录**: 保留为空
   - **环境变量**: 添加以下环境变量
     - `NODE_VERSION`: `18`
     - `MONGODB_URI`: `您的MongoDB连接字符串` (如果前端需要直接连接数据库)

4. **部署项目**
   - 点击"保存并部署"按钮
   - Cloudflare Pages将自动构建并部署您的项目
   - 部署完成后，您将获得一个`*.pages.dev`域名

5. **配置自定义域名（可选）**
   - 在项目设置中，选择"自定义域名"
   - 点击"设置自定义域名"并按照提示添加您的域名

### 部署后端到Cloudflare Workers

对于后端API，我们可以使用Cloudflare Workers或其他服务如Heroku、Vercel等。

#### 部署后端到Cloudflare Workers

1. **准备工作**
   - 安装 [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
   - 登录到Wrangler：`wrangler login`

2. **创建后端项目**
   - 在一个新目录中初始化一个Workers项目：`wrangler init vehicle-management-api`
   - 按照提示配置项目

3. **部署API**
   - 编写您的API代码（可以基于现有的server.js文件）
   - 部署到Cloudflare Workers：`wrangler deploy`

4. **更新前端配置**
   - 在前端代码中，将API基础URL更新为Cloudflare Workers提供的URL
   - 重新构建并部署前端应用
</details>

<details>
<summary>⚙️ Docker Compose配置详解</summary>

下面是对`docker-compose.yml`文件中每条命令的详细解释：

```yaml
version: '3.8'  # 指定Docker Compose文件版本
```

### 应用服务配置

```yaml
services:
  app:
    image: node:18-alpine  # 使用Node.js 18 Alpine镜像，轻量级且适合生产环境
    container_name: vehicle-management-app  # 容器名称
    working_dir: /app  # 容器内的工作目录
    ports:
      - "3000:3000"  # 将容器的3000端口映射到主机的3000端口（前端服务）
      - "5000:5000"  # 将容器的5000端口映射到主机的5000端口（后端API）
    volumes:
      - ./:/app  # 将主机当前目录挂载到容器的/app目录，实现文件同步
      - ./uploads:/app/uploads  # 将主机的uploads目录挂载到容器，实现上传文件持久化
    environment:  # 环境变量配置
      - MONGODB_URI=mongodb://admin:password@db:27017/vehicle-management?authSource=admin  # MongoDB连接字符串
      - JWT_SECRET=your-secret-key  # JWT令牌密钥
      - UPLOAD_DIR=/app/uploads  # 上传目录路径
      - PORT=5000  # 后端服务端口
    depends_on:
      - db  # 依赖于MongoDB服务，确保数据库先启动
    command: sh -c "git clone https://github.com/AKE5297/vehicle-management-system.git /app && cd /app && npm install -g pnpm && pnpm install && pnpm build && pnpm start"  # 容器启动命令，拉取代码并启动应用
```

### MongoDB数据库配置

```yaml
  db:
    image: mongo:latest  # 使用最新版本的MongoDB镜像
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin  # MongoDB管理员用户名
      - MONGO_INITDB_ROOT_PASSWORD=password  # MongoDB管理员密码
    container_name: vehicle-management-db  # MongoDB容器名称
    volumes:
      - ./mongodb-data:/data/db  # 将主机的mongodb-data目录挂载到容器，实现数据持久化
    ports:
      - "27017:27017"  # 将容器的27017端口映射到主机，允许外部访问数据库
    restart: always  # 容器退出时自动重启
```
</details>

<details>
<summary>🗄️ MongoDB使用指南</summary>

### MongoDB基础操作

#### 连接到MongoDB

**使用MongoDB Shell**
```bash
# 连接到本地MongoDB实例
mongo

# 使用认证连接
mongo -u admin -p password --authenticationDatabase admin

# 连接到特定数据库
mongo vehicle-management -u admin -p password --authenticationDatabase admin
```

**使用MongoDB Compass（图形界面工具）**
1. 下载并安装 [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. 创建新连接，填写以下信息：
   - **连接字符串**: `mongodb://admin:password@localhost:27017/vehicle-management?authSource=admin`
   - 或者分别填写：
     - **主机名**: `localhost`
     - **端口**: `27017`
     - **认证数据库**: `admin`
     - **用户名**: `admin`
     - **密码**: `password`
3. 点击"连接"按钮

#### 数据库操作

**查看所有数据库**
```bash
show dbs
```

**切换到车辆管理系统数据库**
```bash
use vehicle-management
```

**查看所有集合（表）**
```bash
show collections
```

**查询数据**
```bash
# 查询所有车辆数据
db.vehicles.find().pretty()

# 查询特定条件的数据
db.vehicles.find({ licensePlate: "京A12345" }).pretty()
```

**插入数据**
```bash
db.vehicles.insertOne({
  licensePlate: "粤B12345",
  brand: "丰田",
  model: "卡罗拉",
  // 其他字段...
})
```

**更新数据**
```bash
db.vehicles.updateOne(
  { licensePlate: "粤B12345" },
  { $set: { brand: "丰田", model: "凯美瑞" } }
)
```

**删除数据**
```bash
db.vehicles.deleteOne({ licensePlate: "粤B12345" })
```

### 备份与恢复

#### 备份数据库

```bash
# 使用mongodump备份
mongodump --db vehicle-management --username admin --password password --authenticationDatabase admin --out /path/to/backup/directory
```

#### 恢复数据库

```bash
# 使用mongorestore恢复
mongorestore --db vehicle-management --username admin --password password --authenticationDatabase admin /path/to/backup/directory/vehicle-management
```

### 常见问题排查

**连接问题**
- 确保MongoDB服务正在运行：`sudo systemctl status mongod`
- 检查防火墙设置：`sudo ufw status`，确保27017端口已开放
- 验证认证信息是否正确

**性能问题**
- 为常用查询字段创建索引：`db.vehicles.createIndex({ licensePlate: 1 })`
- 定期清理不必要的数据
- 考虑增加服务器资源或配置MongoDB副本集

**数据损坏**
- 定期备份数据库
- 使用`mongod --repair`命令修复损坏的数据库
</details>


🤝 如何贡献

我们欢迎社区贡献和反馈！如果您有任何建议或发现问题，请在GitHub上提交Issue或Pull Request。

1. Fork项目仓库
2. 创建您的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request


如果这个项目对你有帮助，请考虑给我买杯咖啡 ☕

<div style="display: flex; gap: 20px; justify-content: center; margin: 30px 0;">
  <div style="text-align: center;">
    <p style="margin-bottom: 10px; font-weight: bold;">支付宝</p>
    <img src="https://github.com/user-attachments/assets/ce03a5fe-d2f5-4ff4-b8eb-e611aab43f95" alt="支付宝收款码" width="200" />
  </div>
  <div style="text-align: center;">
    <p style="margin-bottom: 10px; font-weight: bold;">微信支付</p>
    <img src="https://github.com/user-attachments/assets/1d3bae2a-4f7b-437b-9e79-d3fdfb80af75" alt="微信收款码" width="200" />
  </div>
</div>


📄 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。


🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户，感谢您的支持和反馈！
