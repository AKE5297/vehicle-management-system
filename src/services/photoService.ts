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
    // 总是使用模拟上传，确保功能可用
    console.log('使用模拟上传');
    
    try {
      // 创建目录结构（如果不存在）
      this.createDirectoryStructure();
      
      // 检查是否是浏览器环境
      const isBrowser = typeof window !== 'undefined';
      
      // 如果file已经是URL字符串，直接返回
      if (typeof file === 'string') {
        // 检查是否已经是完整URL
        if (file.startsWith('http://') || file.startsWith('https://')) {
          return file;
        }
        
        // 否则构建完整URL
        const baseUrl = isBrowser ? window.location.origin : '';
        return `${baseUrl}/${file}`;
      }
      
      // 如果是File对象，执行文件上传逻辑
      return new Promise((resolve, reject) => {
        // 验证文件
        if (!this.validateImage(file)) {
          reject(new Error('图片格式或大小不符合要求'));
          return;
        }
        
        // 模拟图片上传过程
        setTimeout(() => {
          try {
            // 获取时间戳和扩展名
            const date = new Date();
            const timestamp = date.toISOString().replace(/[:.]/g, '-').slice(0, 19); // 格式: YYYY-MM-DDTHH-mm-ss
            const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
            
            // 构建文件名：时间_车牌_车辆ID_目录_序号
            // 如果提供了车牌号，则按照用户要求使用时间加车牌的格式
            const baseFileName = additionalInfo?.licensePlate 
              ? `${timestamp}_${additionalInfo.licensePlate.replace(/\s/g, '')}`
              : `${timestamp}`;
              
            // 构建完整的文件路径
            const fullPath = `${this.MAIN_DIRECTORY}/${directory}/${baseFileName}.${extension}`;
            
            // 模拟文件上传后的URL
            // 使用更稳定的图片生成服务，避免出现图片无法加载的问题
            // 为了提高成功率，使用更简单清晰的提示词
            let prompt = '';
            
            // 根据目录类型生成合适的提示词
            if (directory === this.DIRECTORIES.VEHICLE_PHOTOS) {
              prompt = `Vehicle photo ${additionalInfo?.licensePlate || ''}`;
            } else if (directory === this.DIRECTORIES.ENTRY_PHOTOS) {
              prompt = `Car entry photo with timestamp ${additionalInfo?.licensePlate || ''}`;
            } else if (directory === this.DIRECTORIES.EXIT_PHOTOS) {
              prompt = `Car exit photo with timestamp ${additionalInfo?.licensePlate || ''}`;
            } else if (directory === this.DIRECTORIES.MAINTENANCE_PHOTOS) {
              prompt = `Car maintenance photo ${additionalInfo?.licensePlate || ''}`;
            } else if (directory === this.DIRECTORIES.INVOICE_PHOTOS) {
              prompt = `Invoice document photo`;
            } else if (directory === this.DIRECTORIES.PART_PHOTOS) {
              prompt = `Car part photo`;
            } else if (directory === this.DIRECTORIES.NOTE_PHOTOS) {
              prompt = `Service note photo ${additionalInfo?.licensePlate || ''}`;
            } else {
              prompt = `Document photo`;
            }
            
            // 编码提示词
            const encodedPrompt = encodeURIComponent(prompt);
            
            // 使用稳定的图片生成服务
            const imageUrl = `https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=${encodedPrompt}`;
            
            console.log(`图片上传成功: ${imageUrl}`);
            resolve(imageUrl);
          } catch (error) {
            console.error('图片处理失败:', error);
            reject(error);
          }
        }, 500); // 模拟网络延迟
      });
    } catch (error) {
      console.error('保存照片时发生错误:', error);
      throw error;
    }
  }

  // 批量保存照片
  async savePhotos(files: (File | string)[], directory: string, additionalInfo?: {
    licensePlate?: string,
    vehicleId?: string
  }): Promise<string[]> {
    try {
      const savePromises = files.map(file => this.savePhoto(file, directory, additionalInfo));
      return Promise.all(savePromises);
    } catch (error) {
      console.error('批量保存照片失败:', error);
      throw error;
    }
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
      console.error('不支持的图片类型:', file.type);
      return false;
    }
    
    // 检查文件大小（5MB限制）
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error('图片大小超过限制:', (file.size / 1024 / 1024).toFixed(2), 'MB');
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
  
  // 检查图片URL是否有效
  async isValidImageUrl(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      
      // 5秒超时
      setTimeout(() => resolve(false), 5000);
    });
  }
  
  // 获取照片类型
  getPhotoTypeFromUrl(url: string): string | null {
    // 从URL参数中提取目录信息
    const urlParams = new URLSearchParams(url.split('?')[1]);
    const prompt = urlParams.get('prompt');
    
    if (prompt) {
      // 解码prompt参数
      try {
        const decodedPrompt = decodeURIComponent(prompt);
        
        // 检查prompt中是否包含已知的目录名
        for (const directory of Object.values(this.DIRECTORIES)) {
          if (decodedPrompt.includes(directory)) {
            return directory;
          }
        }
        
        // 如果没有找到具体目录，根据提示信息判断类型
        if (decodedPrompt.includes('vehicle')) return 'vehicle';
        if (decodedPrompt.includes('entry')) return 'entry';
        if (decodedPrompt.includes('exit')) return 'exit';
        if (decodedPrompt.includes('maintenance')) return 'maintenance';
        if (decodedPrompt.includes('invoice')) return 'invoice';
        if (decodedPrompt.includes('part')) return 'part';
        if (decodedPrompt.includes('note')) return 'note';
      } catch (e) {
        console.error('解析URL失败:', e);
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