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

  // 保存照片到指定目录，并返回访问URL
  savePhoto(file: File | string, directory: string): Promise<string> {
    return new Promise((resolve) => {
      // 模拟图片上传过程
      setTimeout(() => {
        // 在实际项目中，这里应该将文件上传到服务器或云存储
        // 并返回实际的文件URL
        const timestamp = Date.now();
        const extension = typeof file === 'string' 
          ? file.split('.').pop() || 'jpg'
          : file.name.split('.').pop() || 'jpg';
          
        const fileName = `${directory}_${timestamp}.${extension}`;
        
        // 对于模拟环境，我们使用现有的图片URL，但添加目录信息
        // 在实际项目中，这里应该返回实际的文件存储路径
        if (typeof file === 'string') {
          resolve(`${file}&directory=${directory}&filename=${fileName}`);
        } else {
          // 模拟文件上传后的URL
          resolve(`https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=${encodeURIComponent(directory)}&directory=${directory}&filename=${fileName}`);
        }
      }, 800); // 模拟网络延迟
    });
  }

  // 批量保存照片
  async savePhotos(files: (File | string)[], directory: string): Promise<string[]> {
    const savePromises = files.map(file => this.savePhoto(file, directory));
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
}

export const photoService = new PhotoService();