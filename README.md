# 车辆管理系统 (Vehicle Management System)

一个功能完整的车辆管理系统，支持车辆信息管理、维修记录跟踪、发票管理等功能。

## 🚀 功能特性

- 🚗 **车辆管理**：车辆信息录入、查询、编辑和删除
- 🔧 **维修记录**：跟踪和管理车辆维修历史
- 💳 **发票管理**：管理车辆维修和服务相关的发票
- 👥 **用户管理**：支持不同角色的用户权限管理
- 📊 **数据统计**：提供车辆状态和服务数据的可视化展示
- 💾 **数据备份与恢复**：支持数据的导出、导入和自动备份
- 🌙 **深色模式**：支持明暗两种主题模式
- 📱 **响应式设计**：适配不同尺寸的设备屏幕

## 📦 技术栈

- **前端**：React 18, TypeScript, Tailwind CSS, React Router
- **后端**：Node.js, Express, MongoDB
- **部署**：Docker, Docker Compose

## 📸 系统截图

![系统仪表盘](https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Vehicle%20management%20system%20dashboard%20with%20charts&sign=107103625046112b158c0265031d7cd8)

## 💰 支持项目

如果您觉得这个项目对您有帮助，可以通过以下方式支持我们的开发：

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
  <div class="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
    <h3 class="text-lg font-semibold mb-4 text-center">微信支付</h3>
    <img src="https://github.com/user-attachments/assets/1d3bae2a-4f7b-437b-9e79-d3fdfb80af75" alt="微信支付二维码" class="w-64 h-64 object-contain mb-4" />
    <p class="text-sm text-gray-600 dark:text-gray-400">感谢您的支持！</p>
  </div>
  
  <div class="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
    <h3 class="text-lg font-semibold mb-4 text-center">支付宝支付</h3>
    <img src="https://github.com/user-attachments/assets/ce03a5fe-d2f5-4ff4-b8eb-e611aab43f95" alt="支付宝支付二维码" class="w-64 h-64 object-contain mb-4" />
    <p class="text-sm text-gray-600 dark:text-gray-400">感谢您的支持！</p>
  </div>
</div>

## 🔧 部署指南

### <details>
<summary>📱 本地部署</summary>

### 环境要求
- Node.js 16+
- npm/pnpm/yarn
- MongoDB 4.0+

### 部署步骤

1. 克隆项目代码
```bash
git clone https://github.com/AKE5297/vehicle-management-system.git
cd vehicle-management-system
```

2. 安装依赖
```bash
npm install
# 或者使用pnpm
pnpm install
```

3. 启动开发服务器
```bash
npm run dev
# 或者使用pnpm
pnpm dev
```

4. 打开浏览器访问
```
http://localhost:3000
```

### 构建生产版本

```bash
npm run build
# 或者使用pnpm
pnpm build

# 启动生产服务器
npm run preview
# 或者使用pnpm
pnpm preview
```
</details>

### <details>
<summary>🖥️ Docker部署</summary>

### 使用Docker Compose部署

1. 克隆项目代码
```bash
git clone https://github.com/AKE5297/vehicle-management-system.git
cd vehicle-management-system
```

2. 启动Docker服务

3. 使用Docker Compose启动应用
```bash
docker-compose up -d
```

4. 打开浏览器访问
```
http://localhost:3001
```

### Docker Compose配置详解

```yaml
version: '3.8'  # 使用的Docker Compose版本

services:
  app:  # 应用服务
    image: node:18-alpine  # 使用Node.js 18的Alpine版本镜像
    container_name: vehicle-management-app  # 容器名称
    working_dir: /app  # 工作目录
    ports:
      - "3001:3000"  # 将容器的3000端口映射到主机的3001端口（前端）
      - "5001:5000"  # 将容器的5000端口映射到主机的5001端口（后端）
    volumes:
      - ./:/app  # 将当前目录挂载到容器的/app目录
      - ./uploads:/app/uploads  # 映射上传目录
    environment:  # 环境变量配置
      - MONGODB_URI=mongodb://admin:password@db:27017/vehicle-management?authSource=admin
      - JWT_SECRET=your-secret-key
      - UPLOAD_DIR=/app/uploads
      - PORT=5000
    depends_on:  # 依赖的服务
      - db
    command: sh -c "npm install -g pnpm && pnpm install && pnpm build && pnpm start"  # 启动命令

  db:  # 数据库服务
    image: mongo:latest  # 使用最新的MongoDB镜像
    environment:  # MongoDB环境变量
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
    container_name: vehicle-management-db  # 数据库容器名称
    volumes:
      - ./mongodb-data:/data/db  # 持久化MongoDB数据
    ports:
      - "27017:27017"  # 映射MongoDB端口
    restart: always  # 自动重启策略
```

### 停止和重启服务

```bash
# 停止服务
docker-compose down

# 重启服务
docker-compose restart
```
</details>

### <details>
<summary>🗄️ NAS部署 (群晖、飞牛OS等)</summary>

### 群晖NAS部署步骤

1. 登录群晖DSM管理界面

2. 打开Docker应用

3. 在注册表中搜索并下载以下镜像：
   - `node:18-alpine`
   - `mongo:latest`

4. 在文件管理器中创建项目目录，例如：`/volume1/docker/vehicle-management`

5. 通过SSH或文件管理器上传项目代码到创建的目录

6. 上传或创建`docker-compose.yml`文件（使用上面的配置）

7. 打开SSH终端，执行以下命令：
```bash
cd /volume1/docker/vehicle-management
docker-compose up -d
```

8. 通过浏览器访问：`http://<你的NAS IP>:3001`

### 飞牛OS部署步骤

1. 登录飞牛OS管理界面

2. 打开应用商店，安装Docker

3. 创建项目目录并上传代码

4. 创建并编辑`docker-compose.yml`文件（使用上面的配置，但注意端口冲突问题）

5. 通过终端执行部署命令：
```bash
docker-compose up -d
```

6. 访问`http://<你的NAS IP>:3001`
</details>

### <details>
<summary>☁️ 服务器部署</summary>

### 环境要求
- 一台VPS或云服务器
- Ubuntu/CentOS/Debian等Linux系统
- 已安装Docker和Docker Compose

### 部署步骤

1. 登录服务器
```bash
ssh user@your-server-ip
```

2. 安装必要的软件
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose -y

# CentOS
sudo yum install docker docker-compose -y
sudo systemctl start docker
sudo systemctl enable docker
```

3. 克隆项目代码
```bash
git clone https://github.com/AKE5297/vehicle-management-system.git
cd vehicle-management-system
```

4. 启动应用
```bash
docker-compose up -d
```

5. 配置防火墙（可选）
```bash
# Ubuntu/Debian
sudo ufw allow 3001
sudo ufw allow 27017

# CentOS
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --permanent --add-port=27017/tcp
sudo firewall-cmd --reload
```

6. 配置域名（可选）
   - 可以使用Nginx或Apache配置反向代理
   - 建议配置HTTPS以提高安全性
</details>

### <details>
<summary>🌐 Cloudflare Pages部署</summary>

Cloudflare Pages提供了简单的静态网站部署方式，适合部署前端应用。

### 部署步骤

1. 注册或登录Cloudflare账户

2. 在Cloudflare Dashboard中，选择"Pages"

3. 点击"创建项目"，选择"连接到Git"

4. 选择您的GitHub仓库：`https://github.com/AKE5297/vehicle-management-system`

5. 配置构建设置：
   - 框架预设：React
   - 构建命令：`npm run build`
   - 构建输出目录：`dist`
   - 环境变量：添加必要的环境变量，如：
     - `NODE_VERSION`: `18`
     - `NPM_VERSION`: `9`

6. 点击"保存并部署"开始部署过程

7. 部署完成后，Cloudflare会提供一个`.pages.dev`域名，您也可以配置自定义域名

### 注意事项

- Cloudflare Pages只部署前端部分，后端API和数据库需要另外部署
- 可以将后端API部署到Cloudflare Workers或其他服务器上
- 需要在前端配置API地址以连接后端服务
</details>

### <details>
<summary>⚡ Cloudflare Workers部署（前端）</summary>

Cloudflare Workers适合部署轻量级的前端应用和API代理。

### 部署步骤

1. 安装Wrangler CLI
```bash
npm install -g wrangler
```

2. 登录Wrangler
```bash
wrangler login
```

3. 在项目根目录初始化Worker
```bash
wrangler init
```

4. 编辑`wrangler.toml`文件，配置Worker
```toml
name = "vehicle-management-frontend"
main = "worker.js"
compatibility_date = "2023-09-01"
```

5. 创建`worker.js`文件，添加前端服务逻辑

6. 部署Worker
```bash
wrangler deploy
```

7. 访问提供的Worker URL
</details>

## 📚 MongoDB使用指南

### <details>
<summary>📋 数据库安装与配置</summary>

### 本地安装MongoDB

1. 下载并安装MongoDB Community Server
   - [MongoDB官网下载](https://www.mongodb.com/try/download/community)

2. 启动MongoDB服务
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

3. 连接MongoDB
```bash
mongosh
```

4. 创建数据库和用户
```javascript
// 连接到admin数据库
use admin

// 创建管理员用户
db.createUser({
  user: "admin",
  pwd: "password",
  roles: [{ role: "root", db: "admin" }]
})

// 创建应用数据库
use vehicle-management

// 创建应用用户
db.createUser({
  user: "appuser",
  pwd: "apppassword",
  roles: [{ role: "readWrite", db: "vehicle-management" }]
})
```

### 使用Docker运行MongoDB

```bash
docker run -d \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -v ./mongodb-data:/data/db \
  --name mongo \
  mongo:latest
```

### 连接MongoDB数据库

使用MongoDB Compass或其他MongoDB客户端工具连接：
- 连接URL：`mongodb://admin:password@localhost:27017/vehicle-management?authSource=admin`
</details>

### <details>
<summary>🔍 数据库查询示例</summary>

### 查询所有车辆
```javascript
// 使用MongoDB Shell
use vehicle-management
db.vehicles.find()

// 使用Mongoose (Node.js)
const vehicles = await Vehicle.find();
```

### 查询特定状态的车辆
```javascript
// 查询在场车辆
db.vehicles.find({ status: "in" })

// 查询特定品牌的车辆
db.vehicles.find({ brand: "奔驰" })
```

### 统计车辆数据
```javascript
// 统计总车辆数
db.vehicles.countDocuments()

// 按车辆类型统计
db.vehicles.aggregate([
  { $group: { _id: "$vehicleType", count: { $sum: 1 } } }
])
```

### 高级查询
```javascript
// 查询最近30天入场的车辆
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

db.vehicles.find({
  entryTime: { $gte: thirtyDaysAgo }
})
```
</details>

### <details>
<summary>💾 数据备份与恢复</summary>

### 使用mongodump备份数据
```bash
# 备份所有数据库
mongodump --uri="mongodb://admin:password@localhost:27017" --out=/backup

# 只备份vehicle-management数据库
mongodump --uri="mongodb://admin:password@localhost:27017/vehicle-management" --out=/backup
```

### 使用mongorestore恢复数据
```bash
# 恢复所有数据库
mongorestore --uri="mongodb://admin:password@localhost:27017" /backup

# 只恢复vehicle-management数据库
mongorestore --uri="mongodb://admin:password@localhost:27017" --db=vehicle-management /backup/vehicle-management
```

### 定时备份脚本
```bash
#!/bin/bash
BACKUP_DIR="/backup/mongodb"
DATE=$(date +%Y%m%d%H%M%S)
mkdir -p $BACKUP_DIR

mongodump --uri="mongodb://admin:password@localhost:27017/vehicle-management" --out=$BACKUP_DIR/$DATE

# 保留最近7天的备份
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
```
</details>

## 🚗 使用指南

### <details>
<summary>🔐 登录系统</summary>

系统初始提供一个管理员账户：
- 用户名：`admin`
- 密码：`admin123`

首次登录后，请及时修改密码以保证账户安全。
</details>

### <details>
<summary>📝 添加车辆</summary>

1. 登录系统后，点击左侧菜单的"车辆管理"
2. 点击"添加车辆"按钮
3. 填写车辆信息，包括车牌号、品牌、型号等
4. 上传车辆照片（可选）
5. 点击"保存"按钮完成添加
</details>

### <details>
<summary>🔧 创建维修记录</summary>

1. 从左侧菜单进入"维修记录"页面
2. 点击"创建维修单"按钮
3. 选择车辆并填写维修信息
4. 添加维修配件和工时费
5. 上传维修照片（可选）
6. 保存维修记录
</details>

### <details>
<summary>📊 查看数据统计</summary>

1. 登录系统后，默认进入仪表盘页面
2. 查看各项统计数据，包括总车辆数、在场车辆数等
3. 查看月度服务统计图表
4. 查看最近添加的车辆信息
</details>

## 🛠️ 开发指南

### <details>
<summary>👨‍💻 项目结构</summary>

```
vehicle-management-system/
├── src/                # 源代码目录
│   ├── components/      # 可复用组件
│   ├── contexts/        # React上下文
│   ├── hooks/           # 自定义Hooks
│   ├── pages/           # 页面组件
│   ├── services/        # 服务层
│   ├── types/           # TypeScript类型定义
│   ├── App.tsx          # 应用入口组件
│   └── main.tsx         # 渲染入口
├── public/              # 静态资源
├── server.js            # 后端服务器
├── package.json         # 项目依赖
└── docker-compose.yml   # Docker Compose配置
```
</details>

### <details>
<summary>📦 安装与开发</summary>

1. 克隆仓库
```bash
git clone https://github.com/AKE5297/vehicle-management-system.git
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

4. 构建生产版本
```bash
pnpm build
```

5. 预览生产版本
```bash
pnpm preview
```
</details>

### <details>
<summary>🧪 测试</summary>

```bash
# 运行单元测试
pnpm test

# 运行测试覆盖率
pnpm test:coverage
```
</details>

## 🤝 贡献指南

我们欢迎社区贡献！如果你有任何想法或发现了问题，请：

1. Fork 这个仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 📞 联系我们

如有任何问题或建议，请随时联系我们。