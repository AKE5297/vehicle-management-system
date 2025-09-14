# 车辆管理系统部署文档

## 目录
- [准备工作](#准备工作)
- [本地部署](#本地部署)
- [NAS部署](#nas部署)
- [服务器部署](#服务器部署)
- [GitHub仓库托管](#github仓库托管)
- [Cloudflare Worker挂载](#cloudflare-worker挂载)
- [常见问题解决](#常见问题解决)

## 准备工作

### 环境要求
- Node.js v16.0.0 或更高版本
- npm v7.0.0 或更高版本 或 pnpm v6.0.0 或更高版本
- Git
- 现代浏览器（Chrome, Firefox, Edge等）

### 获取源代码
```bash
# 克隆仓库（如适用）
git clone <repository-url>
cd <repository-directory>

# 或直接下载源代码并解压
```

## 本地部署

### 安装依赖
```bash
# 使用npm
npm install

# 或使用pnpm
pnpm install
```

### 开发环境运行
```bash
# 使用npm
npm run dev

# 或使用pnpm
pnpm dev
```
应用将运行在 http://localhost:3000

### 生产环境构建
```bash
# 使用npm
npm run build

# 或使用pnpm
pnpm build
```

### 本地预览生产版本
```bash
# 构建完成后
npx serve dist
```
预览将运行在 http://localhost:3000

## NAS部署

### 通用部署步骤

1. **准备工作**
   - 确保NAS已安装并运行Web服务器（如Apache、Nginx或NAS自带的Web服务）
   - 确保NAS与本地电脑在同一网络中，并可通过网络访问

2. **构建生产版本**
   ```bash
   pnpm build
   ```

3. **传输文件到NAS**
   - **方法1: 使用文件共享**
     - 在NAS上创建共享文件夹（如"webapps/vehicle-management"）
     - 将本地`dist`文件夹中的所有文件复制到NAS共享文件夹中
   
   - **方法2: 使用FTP/SFTP**
     - 启用NAS的FTP/SFTP服务
     - 使用FTP客户端连接到NAS
     - 将`dist`文件夹中的所有文件上传到NAS的Web服务目录

4. **配置NAS Web服务**
   - 登录NAS管理界面
   - 找到Web服务设置
   - 将网站根目录指向您上传文件的目录
   - 确保索引文件设置为`index.html`

5. **访问应用**
   - 在浏览器中输入NAS的IP地址或域名
   - 如: http://your-nas-ip/vehicle-management

### Synology NAS 特定步骤

1. 安装"Web Station"套件
2. 在Web Station中创建新的虚拟主机
3. 选择"HTML"作为服务类型
4. 设置文档根目录为您上传文件的位置
5. 访问时使用 http://your-nas-ip/虚拟主机名称

### QNAP NAS 特定步骤

1. 安装"QTS Web Server"应用
2. 在"Web Server"设置中配置虚拟主机
3. 将文档根目录指向您的应用文件夹
4. 访问时使用 http://your-nas-ip/虚拟主机路径

## 服务器部署

### 使用Nginx部署

1. **准备服务器**
   - 购买VPS或专用服务器
   - 安装Linux操作系统（推荐Ubuntu 20.04+）
   - 安装Nginx:
     ```bash
     sudo apt update
     sudo apt install nginx
     ```

2. **构建生产版本**
   ```bash
   pnpm build
   ```

3. **传输文件到服务器**
   ```bash
   # 使用scp命令
   scp -r dist/* user@your-server-ip:/var/www/vehicle-management
   ```

4. **配置Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/vehicle-management
   ```
   
   添加以下配置:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;  # 或服务器IP地址
       
       root /var/www/vehicle-management;
       index index.html;
       
       # 支持SPA路由
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # 设置缓存控制
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 30d;
           add_header Cache-Control "public, max-age=2592000";
       }
   }
   ```

5. **启用站点配置**
   ```bash
   sudo ln -s /etc/nginx/sites-available/vehicle-management /etc/nginx/sites-enabled/
   sudo nginx -t  # 测试配置
   sudo systemctl restart nginx
   ```

6. **配置HTTPS（推荐）**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

### 使用Node.js服务器（开发环境）

如果需要在服务器上运行开发环境:

1. **安装Node.js和pnpm**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt install nodejs
   npm install -g pnpm
   ```

2. **克隆代码并安装依赖**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   pnpm install
   ```

3. **使用PM2运行**
   ```bash
   npm install -g pm2
   pm2 start npm --name "vehicle-management" -- run dev
   ```

4. **配置Nginx反向代理**（同上，略作修改）

## GitHub仓库托管

### 创建GitHub仓库

1. 登录GitHub账号
2. 点击右上角"+"图标，选择"New repository"
3. 填写仓库名称（如"vehicle-management-system"）
4. 添加描述（可选）
5. 选择"Public"或"Private"
6. 勾选"Initialize this repository with a README"
7. 点击"Create repository"

### 提交代码

1. **本地初始化Git仓库**（如果尚未初始化）
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **关联远程仓库并推送**
   ```bash
   git remote add origin https://github.com/your-username/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```

### 配置GitHub Pages（静态部署）

1. 在仓库页面点击"Settings"
2. 在左侧导航栏选择"Pages"
3. 在"Source"部分，选择"main"分支和"/docs"文件夹（或根目录）
4. 点击"Save"
5. 等待部署完成，访问 https://your-username.github.io/your-repo-name

### 配置自动部署（可选）

1. 在仓库页面点击"Actions"
2. 点击"New workflow"
3. 搜索"Node.js"并选择"Node.js CI"
4. 修改工作流文件，添加构建和部署步骤
5. 提交工作流配置

## Cloudflare Worker挂载

### 准备工作

1. 创建Cloudflare账户: https://dash.cloudflare.com/sign-up
2. 添加您的域名到Cloudflare（或使用Cloudflare Pages）

### 使用Cloudflare Pages部署

1. 登录Cloudflare控制台
2. 点击"Pages"
3. 点击"Create a project"
4. 选择"Connect to Git"
5. 授权访问您的GitHub仓库
6. 选择您的仓库
7. 配置构建设置:
   - 构建命令: `pnpm build`
   - 构建输出目录: `dist`
8. 点击"Save and Deploy"

### 创建Cloudflare Worker

1. 在Cloudflare控制台点击"Workers"
2. 点击"Create a Service"
3. 输入服务名称，选择"HTTP handler"模板
4. 点击"Create service"
5. 在代码编辑器中，替换为以下代码:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // 替换为您的Cloudflare Pages域名
  const pagesUrl = 'https://your-project.pages.dev'
  
  // 转发请求到Pages
  const response = await fetch(`${pagesUrl}${request.url.pathname}${request.url.search}`)
  
  // 返回响应
  return response
}
```

6. 点击"Save and deploy"

### 配置自定义域名（可选）

1. 在Worker详情页，点击"Triggers"
2. 在"Custom Domains"部分，点击"Add Custom Domain"
3. 输入子域名（如"app.yourdomain.com"）
4. 按照提示完成DNS配置

## 常见问题解决

### 构建错误

1. **依赖安装失败**
   - 尝试清除npm缓存: `npm cache clean --force`
   - 检查Node.js版本是否符合要求
   - 使用pnpm代替npm: `pnpm install`

2. **构建过程中内存不足**
   - 增加Node.js内存限制: `export NODE_OPTIONS=--max_old_space_size=4096`
   - 关闭其他占用内存的应用

### 部署后无法访问

1. **检查网络连接**
   - 确认服务器/NAS是否在线
   - 检查防火墙设置，确保相应端口已开放

2. **检查Web服务器配置**
   - 确认文档根目录设置正确
   - 检查Nginx配置是否有误: `nginx -t`

3. **SPA路由问题**
   - 确保Nginx配置中包含SPA支持（try_files指令）
   - 本地测试时使用`historyApiFallback: true`

### 数据持久化问题

本应用使用localStorage进行本地数据存储，数据保存在浏览器中。如需在多设备间同步数据，考虑:

1. 使用IndexedDB替代localStorage
2. 添加后端API和数据库
3. 使用第三方云存储服务

### 性能优化建议

1. **减小构建体积**
   - 分析构建包: `npm run build -- --report`
   - 考虑代码分割和懒加载

2. **优化图片**
   - 使用适当尺寸的图片
   - 考虑使用WebP格式
   - 实现图片懒加载

3. **缓存策略**
   - 合理设置HTTP缓存头
   - 考虑使用Service Worker实现离线缓存

## 结语

本部署文档涵盖了多种部署方式，您可以根据自己的需求和环境选择合适的方法。如有任何问题，请参考各工具的官方文档或寻求技术支持。