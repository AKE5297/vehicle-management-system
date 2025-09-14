import { isUsingRealAPI } from './mockService';

// 照片管理服务，统一处理照片的上传、存储和访问
class PhotoService {
  // 不同类型照片的存储目录
  private readonly DIRECTORIES = {
    VEHICLE_PHOTOS: 'vehicle_photos',
    ENTRY_PHOTOS: 'entry_photos',
    EXIT_PHOTOS: 'exit_photos',
    MAINTENANCE_PHOTOS: 'maintenance_photos',
    INVOICE_PHOTOS: 'invoice_photos',
    PART_PHOTOS: 'part_photos',
    NOTE_PHOTOS: 'note_photos'
  };
  
   // 主目录 - 项目根目录下的uploads
  private readonly MAIN_DIRECTORY = 'uploads';

  // 保存照片到指定目录，并返回访问URL
  async savePhoto(file: File | string, directory: string, additionalInfo?: {
    licensePlate?: string,
    vehicleId?: string
  }): Promise<string> {
    // 如果使用真实API，应该通过fetch上传到服务器
    if (isUsingRealAPI()) {
      // 这个方法现在主要在ImageUploader中处理了
      // 这里保留作为备用方法
      throw new Error('照片上传在ImageUploader中处理');
    }

    // 使用模拟上传
    return new Promise((resolve) => {
      // 模拟图片上传过程
      setTimeout(() => {
        // 获取时间戳和扩展名
        const date = new Date();
        const timestamp = date.toISOString().replace(/[:.]/g, '-').slice(0, 19); // 格式: YYYY-MM-DDTHH-mm-ss
        const extension = typeof file === 'string' 
          ? file.split('.').pop() || 'jpg'
          : file.name.split('.').pop() || 'jpg';
          
        // 构建文件名：时间_车牌_车辆ID_目录_序号
        // 如果提供了车牌号，则按照用户要求使用时间加车牌的格式
        const baseFileName = additionalInfo?.licensePlate 
          ? `${timestamp}_${additionalInfo.licensePlate.replace(/\s/g, '')}`
          : `${timestamp}`;
          
        // 如果提供了车辆ID，添加到文件名中
        const fileNameWithId = additionalInfo?.vehicleId 
          ? `${baseFileName}_${additionalInfo.vehicleId}`
          : baseFileName;
        
        // 完整文件名
        const fileName = `${fileNameWithId}_${directory}.${extension}`;
        
        // 构建完整的目录路径：主目录/子目录/文件名
        const fullPath = `${this.MAIN_DIRECTORY}/${directory}/${fileName}`;
        
        // 对于模拟环境，我们使用现有的图片URL，但添加完整的路径信息
        // 在实际项目中，这里应该返回实际的文件存储路径
        if (typeof file === 'string') {
          // 保留原始URL，但添加目录信息作为查询参数
          resolve(`${file}&directory=${encodeURIComponent(fullPath)}`);
        } else {
          // 模拟文件上传后的URL
          const prompt = encodeURIComponent(`${directory} photo for ${additionalInfo?.licensePlate || 'vehicle'}`);
          resolve(`https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=${prompt}&directory=${encodeURIComponent(fullPath)}`);
        }
      }, 500); // 模拟网络延迟
    });
  }

  // 批量保存照片
  async savePhotos(files: (File | string)[], directory: string, additionalInfo?: {
    licensePlate?: string,
    vehicleId?: string
  }): Promise<string[]> {
    const savePromises = files.map(file => this.savePhoto(file, directory, additionalInfo));
    return Promise.all(savePromises);
  }

  // 获取不同类型照片的目录
  getDirectory(type: keyof typeof this.DIRECTORIES): string {
    return this.DIRECTORIES[type];
  }

  // 验证图片文件
  validateImage(file: File): boolean {
    // 检查文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return false;
    }
    
    // 检查文件大小（5MB限制）
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return false;
    }
    
    return true;
  }
  
  // 创建目录结构（实际项目中这会在服务器端执行）
  createDirectoryStructure(): void {
    // 模拟创建目录结构
    console.log(`创建目录结构: ${this.MAIN_DIRECTORY}`);
    
    // 遍历所有目录类型并创建
    Object.values(this.DIRECTORIES).forEach(dir => {
      console.log(`创建子目录: ${this.MAIN_DIRECTORY}/${dir}`);
    });
  }
  
  // 从URL中获取照片类型
  getPhotoTypeFromUrl(url: string): string | null {
    const match = url.match(/directory=([^&]+)/);
    if (match) {
      try {
        const path = decodeURIComponent(match[1]);
        // 从路径中提取目录名
        const pathParts = path.split('/');
        // 目录名应该是倒数第二个部分
        return pathParts.length >= 2 ? pathParts[pathParts.length - 2] : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  }
  
  // 生成水印文本
  generateWatermarkText(plateNumber?: string, vehicleId?: string): string {
    const now = new Date();
    const timestamp = now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    let watermark = `时间: ${timestamp}`;
    
    if (plateNumber) {
      watermark += `\n车牌: ${plateNumber}`;
    }
    
    if (vehicleId) {
      watermark += `\nID: ${vehicleId}`;
    }
    
    return watermark;
  }
}

// 初始化照片服务
export const photoService = new PhotoService();

// 应用启动时创建目录结构
photoService.createDirectoryStructure();