import { useState } from 'react';
import { toast } from 'sonner';
import { photoService } from '../../services/photoService';
import { cn } from '@/lib/utils';
import { isUsingRealAPI } from '../../services/mockService';

interface ImageUploaderProps {
  maxFiles?: number;
  multiple?: boolean;
  initialImages?: string[];
  onUpload: (urls: string[]) => Promise<void>;
  buttonText?: string;
  helpText?: string;
  compact?: boolean;
  watermarkText?: string;
  withDescription?: boolean;
  directoryType?: keyof typeof photoService.getDirectory;
  additionalInfo?: {
    licensePlate?: string;
    vehicleId?: string;
  };
  className?: string;
  maxSize?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  maxFiles = 5,
  multiple = true,
  initialImages = [],
  onUpload,
  buttonText = '上传照片',
  maxSize = 5, // Default 5MB
  helpText = '支持JPG、PNG格式',
  compact = false,
  watermarkText,
  withDescription = false,
  directoryType = 'VEHICLE_PHOTOS',
  additionalInfo = {},
  className
}) => {
  const [images, setImages] = useState<string[]>(initialImages);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check number of files
    if (!multiple && files.length > 1) {
      toast.error('只能上传一个文件');
      return;
    }

    if (files.length + images.length > maxFiles) {
      toast.error(`最多只能上传${maxFiles}个文件`);
      return;
    }

    setLoading(true);

    try {
      // 创建目录结构（如果不存在）
      photoService.createDirectoryStructure();
      
      const newImages: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file size
        if (file.size > maxSize * 1024 * 1024) {
          toast.error(`文件大小不能超过${maxSize}MB`);
          continue;
        }
        
        // Validate file type
        if (!photoService.validateImage(file)) {
          toast.error('不支持的文件类型或文件过大');
          continue;
        }
        
        let url: string;
        
        // 如果使用真实API，则使用fetch上传文件
        if (isUsingRealAPI()) {
          // 读取文件为Base64
          const base64Data = await fileToBase64(file);
          
          // 获取目录
          const directory = photoService.getDirectory(directoryType);
          
          // 发送到服务器
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
            },
            body: JSON.stringify({
              directory,
              filename: file.name,
              type: directoryType,
              base64Data,
              additionalInfo
            })
          });
          
          if (!response.ok) {
            throw new Error('文件上传失败');
          }
          
          const data = await response.json();
          url = data.url;
        } else {
          // 使用模拟服务上传文件
          // Get directory for this type of photos
          const directory = photoService.getDirectory(directoryType);
          
          // Save photo using photo service
          url = await photoService.savePhoto(file, directory, additionalInfo);
        }
        
        newImages.push(url);
      }
      
      if (newImages.length > 0) {
        const updatedImages = [...images, ...newImages];
        setImages(updatedImages);
        onUpload(updatedImages);
          toast.success(`成功上传${newImages.length}张照片`);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('照片上传失败，请重试');
    } finally {
      setLoading(false);
      // Clear input to allow re-uploading the same file
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onUpload(updatedImages);
    toast.success('照片已移除');
  };
  
  // 将文件转换为Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // 去掉data:image/jpeg;base64,前缀
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className={cn("space-y-3", compact && "space-y-2", className)}>
      <label htmlFor="image-upload" className={cn(
        "flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer",
        "bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600",
        "hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200",
        loading && "opacity-50 cursor-not-allowed"
      )}>
        <div className="flex flex-col items-center justify-center text-center">
          <i className="fa-solid fa-cloud-arrow-up text-2xl text-gray-500 dark:text-gray-400 mb-2"></i>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {loading ? '上传中...' : `点击或拖拽文件至此处 ${buttonText}`}
          </p>
          {helpText && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {helpText}
            </p>
          )}
        </div>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
          disabled={loading}
        />
      </label>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img 
                  src={image} 
                  alt={`Uploaded image ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    // 图片加载失败时显示默认图标
                    const target = e.target as HTMLImageElement;
                    target.src = "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Image%20placeholder&sign=7a887c6241b734f417ff13080ca9fdcb";
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 bg-white/80 dark:bg-gray-800/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white dark:hover:bg-gray-800"
              >
                <i className="fa-solid fa-trash text-red-500"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageUploader;