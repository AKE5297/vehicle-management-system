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

### 系统架构

系统采用前后端分离架构，前端基于React 18和TypeScript构建，后端使用Node.js和Express，数据库采用MongoDB存储数据。

### 核心模块

1. **车辆管理**：添加、编辑、查看和删除车辆信息，支持上传车辆照片
2. **维修记录**：记录和管理车辆维修信息，包括配件和工时费用
3. **发票管理**：生成和管理维修发票，支持多种导出格式
4. **用户权限**：完整的角色权限体系，管理员和普通用户拥有不同的功能访问权限
5. **数据备份**：自动和手动数据备份功能，确保数据安全

### API接口文档

系统提供RESTful API接口，支持与其他系统集成。详细接口文档请参阅项目内API文档。


🤝 如何贡献

我们欢迎社区贡献和反馈！如果您有任何建议或发现问题，请在GitHub上提交Issue或Pull Request。

1. Fork项目仓库
2. 创建您的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request


如果这个项目对你有帮助，请考虑给我买杯咖啡 ☕

<div style="display: flex; flex-wrap: wrap; gap: 30px; justify-content: center; margin: 30px 0;">
  <div style="text-align: center;">
    <p style="margin-bottom: 10px; font-weight: bold;">支付宝</p>
    <img src="https://img.789600.xyz/file/AgACAgUAAyEGAASoCPKDAAMTaNaa1SXeuPTom7cThJtJkopWtigAAmfOMRs2CLBWxF1VteTNUnsBAAMCAAN3AAM2BA.jpg" alt="支付宝收款码" width="300" style="max-width: 100%;" />
  </div>
  <div style="text-align: center;">
    <p style="margin-bottom: 10px; font-weight: bold;">微信支付</p>
    <img src="https://img.789600.xyz/file/AgACAgUAAyEGAASoCPKDAAMSaNaafzhyBx8fraStspoUVVkgRC8AAmbOMRs2CLBW6cJue5eR9ywBAAMCAAN3AAM2BA.jpg" alt="微信收款码" width="300" style="max-width: 100%;" />
  </div>
</div>


📄 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。


🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户，感谢您的支持和反馈！