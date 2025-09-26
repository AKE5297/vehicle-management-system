# 车辆管理系统

一个功能完善的车辆管理系统，支持车辆信息管理、维修记录、保险理赔和数据统计等功能。

## 功能特点

- 完整的车辆生命周期管理
- 维修记录和配件管理
- 保险理赔流程跟踪
- 数据导出和报表生成
- 用户权限管理
- 响应式设计，支持移动端访问

## 部署指南

### Docker Compose 部署

1. 克隆项目仓库:
```bash
git clone https://github.com/AKE5297/vehicle-management-system.git
cd vehicle-management-system
```

2. 使用Docker Compose启动服务:
```bash
docker-compose up -d
```

3. 访问系统:
```
http://localhost:3000
```

### Cloudflare Pages 部署

1. 确保项目包含正确的构建脚本:
```json
"scripts": {
  "build": "vite build --outDir dist"
}
```

2. 在Cloudflare Pages中创建新项目，关联GitHub仓库

3. 设置构建命令:
```
pnpm build
```

4. 设置输出目录:
```
dist
```

5. 部署完成后访问分配的URL

## MongoDB 配置指南

### 基本配置

MongoDB连接信息在`docker-compose.yml`文件中配置:

```yaml
environment:
  - MONGODB_URI=mongodb://admin:password@db:27017/vehicle-management?authSource=admin
```

### 带认证的连接字符串获取

1. 连接字符串格式:
```
mongodb://用户名:密码@主机:端口/数据库名?authSource=admin
```

2. 在项目中，连接字符串位于`docker-compose.yml`的`MONGODB_URI`环境变量中

3. 默认管理员凭据(可在docker-compose.yml中修改):
   - 用户名: admin
   - 密码: password
   - 数据库: vehicle-management
   - 认证源: admin

### 手动连接MongoDB

使用MongoDB客户端连接:
```bash
mongosh "mongodb://admin:password@localhost:27017/vehicle-management?authSource=admin"
```

### 备份与恢复

备份数据库:
```bash
docker exec vehicle-management-db mongodump --username admin --password password --authenticationDatabase admin --db vehicle-management --out /data/backup
```

恢复数据库:
```bash
docker exec vehicle-management-db mongorestore --username admin --password password --authenticationDatabase admin /data/backup/vehicle-management
```

## 使用说明

### 默认账号

- 管理员账号: admin/admin123
- 普通用户: user1/user123

### 主要功能模块

1. 车辆管理 - 添加和维护车辆信息
2. 维修记录 - 记录维修详情和配件使用
3. 发票管理 - 管理维修和保险发票
4. 数据管理 - 导出系统数据
5. 系统设置 - 配置系统参数和用户权限

## 常见问题

### 图片上传失败

1. 检查文件大小是否超过限制(默认1024KB)
2. 确认文件格式是否为JPG或PNG
3. 检查服务器存储空间是否充足
4. 查看浏览器控制台网络请求错误信息

### MongoDB连接问题

1. 确认MongoDB服务是否正常运行
2. 检查连接字符串格式是否正确
3. 验证数据库认证凭据
4. 确认网络是否允许连接MongoDB端口

## 技术栈

- React 18
- TypeScript
- Node.js & Express
- MongoDB
- Docker & Docker Compose
- Tailwind CSS