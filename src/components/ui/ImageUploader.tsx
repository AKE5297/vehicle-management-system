import { useState, useRef, ChangeEvent } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { photoService } from '@/services/photoService';
import { Button } from '../ui/Button';

// 图片上传组件的属性接口
interface ImageUploaderProps {
  maxFiles?: number;
  multiple?: boolean;
  initialImages?: string[];
  onUpload: (urls: string[]) => Promise<void> | void;
  buttonText?: string;
  helpText?: string;
  maxSize?: number; // KB
  compact?: boolean;
  withDescription?: boolean;
  watermarkText?: string;
  directoryType?: string;
  additionalInfo?: {
    licensePlate?: string;
    vehicleId?: string;
  };
}

const ImageUploader = ({
  maxFiles = 10,
  multiple = false,
  initialImages = [],
  onUpload,
  buttonText = '上传图片',
  helpText = '支持JPG、PNG格式',
  maxSize = 1024, // 默认1MB
  compact = false,
  withDescription = false,
  watermarkText,
  directoryType,
  additionalInfo,
}: ImageUploaderProps) => {
  const [images, setImages] = useState<string[]>(initialImages);
  const [descriptions, setDescriptions] = useState<{ [key: string]: string }>({});
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件上传
  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const filesToProcess = Array.from(files).slice(0, multiple ? maxFiles : 1);
    const newImageUrls: string[] = [];

    try {
      // 验证每个文件
      for (const file of filesToProcess) {
        if (!validateFile(file)) return;
      }

      // 创建目录结构（如果不存在）
      photoService.createDirectoryStructure();
      
      // 获取正确的目录
      const directory = directoryType ? photoService.getDirectory(directoryType as keyof typeof photoService['DIRECTORIES']) : 'general';

      // 处理每个文件并获取URL
      for (const file of filesToProcess) {
        try {
          // 生成带水印的文件名
          const watermark = watermarkText || photoService.generateWatermarkText(
            additionalInfo?.licensePlate,
            additionalInfo?.vehicleId
          );
          
          // 保存照片并获取URL
          const imageUrl = await photoService.savePhoto(file, directory, additionalInfo);
          
          // 验证URL是否有效
          const isValid = await photoService.isValidImageUrl(imageUrl);
          if (isValid) {
            newImageUrls.push(imageUrl);
          } else {
            console.warn(`无效的图片URL: ${imageUrl}`);
            toast.warning('部分图片无法加载，请重试');
          }
        } catch (error) {
          console.error('文件上传错误:', error);
          toast.error('图片上传失败，请重试');
        }
      }

      // 更新图片列表
      const updatedImages = [...images, ...newImageUrls];
      setImages(updatedImages);
      
      // 调用回调函数
      await onUpload(newImageUrls);
      
      // 清空文件输入，允许重复上传相同文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // 显示成功消息
      toast.success(`成功上传${newImageUrls.length}张图片`);
    } catch (error) {
      console.error('图片上传过程中发生错误:', error);
      toast.error('图片上传失败，请重试');
    }
  };

  // 文件验证
  const validateFile = (file: File): boolean => {
    // 检查文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('只支持JPG、PNG、GIF和WebP格式的图片');
      return false;
    }

    // 检查文件大小
    const maxBytes = maxSize * 1024;
    if (file.size > maxBytes) {
      toast.error(`图片大小不能超过${maxSize}KB`);
      return false;
    }

    return true;
  };

  // 处理拖拽
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    // 创建临时的input事件
    const fileList = new DataTransfer();
    const maxFilesToAdd = Math.min(files.length, multiple ? maxFiles - images.length : 1);
    
    for (let i = 0; i < maxFilesToAdd; i++) {
      fileList.items.add(files[i]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.files = fileList.files;
      fileInputRef.current.dispatchEvent(new Event('change'));
    }
  };

  // 删除图片
  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    // 调用onUpload回调，传入更新后的图片列表
    onUpload(updatedImages);
  };

  // 处理描述变更
  const handleDescriptionChange = (index: number, value: string) => {
    setDescriptions(prev => ({
      ...prev,
      [index.toString()]: value
    }));
  };

  // 处理上传按钮点击
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 预览图片的组件
  const PreviewImage = ({ src, index }: { src: string; index: number }) => (
    <div className="relative group">
      {/* 图片容器 */}
      <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
        <img
          src={src}
          alt={`图片 ${index + 1}`}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            // 图片加载失败时的备用方案
            const target = e.target as HTMLImageElement;
            console.error(`图片加载失败: ${src}`);
            
            // 设置默认占位图
            target.src = "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Image%20placeholder&sign=7a887c6241b734f417ff13080ca9fdcb";
            
            // 显示加载失败的视觉提示
            target.alt = "图片加载失败";
          }}
        />
      </div>

      {/* 描述输入框 */}
      {withDescription && (
        <textarea
          value={descriptions[index.toString()] || ''}
          onChange={(e) => handleDescriptionChange(index, e.target.value)}
          placeholder="添加描述..."
          className="mt-2 w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
          rows={2}
        />
      )}

      {/* 删除按钮 */}
      <button
        type="button"
        onClick={() => handleRemoveImage(index)}
        className="absolute top-2 right-2 bg-white/80 dark:bg-gray-800/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white dark:hover:bg-gray-800"
        aria-label="删除图片"
      >
        <i className="fa-solid fa-trash text-red-500"></i>
      </button>
    </div>
  );

  // 判断是否达到最大文件数量
  const isAtMaxFiles = images.length >= maxFiles;

  return (
    <div className={cn("space-y-4", compact ? "" : "p-4 border border-gray-200 dark:border-gray-700 rounded-lg")}>
      {/* 上传按钮 */}
      {!isAtMaxFiles && (
        <div
          className={cn(
            "border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer transition-colors duration-200",
            dragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800/50"
          )}
          onClick={handleUploadClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple && !isAtMaxFiles}
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          
          <div className="mb-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <i className="fa-solid fa-cloud-arrow-up text-xl"></i>
            </div>
          </div>
          
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{buttonText}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
          
          {!compact && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              点击或拖拽文件到此处上传
            </p>
          )}
        </div>
      )}

      {/* 图片预览网格 */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((src, index) => (
            <PreviewImage key={`${src}-${index}`} src={src} index={index} />
          ))}
        </div>
      )}

      {/* 剩余上传数量提示 */}
      {multiple && !isAtMaxFiles && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          还可以上传 {maxFiles - images.length} 张图片
        </p>
      )}

      {/* 达到最大数量提示 */}
      {isAtMaxFiles && (
        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
          <i className="fa-solid fa-circle-info mr-1 text-blue-500"></i>
          已达到最大上传数量 ({maxFiles})
        </p>
      )}
    </div>
  );
};

export default ImageUploader;