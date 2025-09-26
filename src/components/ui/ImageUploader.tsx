import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { photoService } from '../../services/photoService';
import { cn } from '../../lib/utils';

interface ImageUploaderProps {
  maxFiles?: number;
  multiple?: boolean;
  initialImages?: string[];
  onUpload: (urls: string[]) => void;
  buttonText?: string;
  maxSize?: number; // in KB
  helpText?: string;
  compact?: boolean;
  withDescription?: boolean;
  directoryType?: keyof typeof photoService.getDirectory;
  watermarkText?: string;
  additionalInfo?: {
    licensePlate?: string;
    vehicleId?: string;
  };
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  maxFiles = 5,
  multiple = false,
  initialImages = [],
  onUpload,
  buttonText = '上传图片',
  maxSize = 2000, // Default 2MB
  helpText = '支持JPG、PNG格式',
  compact = false,
  withDescription = false,
  directoryType = 'VEHICLE_PHOTOS',
  watermarkText,
  additionalInfo
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [descriptions, setDescriptions] = useState<string[]>([]);
  
  // Initialize with initial images if provided
  useState(() => {
    if (initialImages.length > 0) {
      setPreviewUrls([...initialImages]);
      setDescriptions(new Array(initialImages.length).fill(''));
    }
  }, [initialImages]);
  
  // Handle file selection
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Validate and add files
    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    
    selectedFiles.forEach(file => {
      // Check file size
      if (file.size > maxSize * 1024) {
        toast.error(`${file.name} 文件大小超过限制（${maxSize}KB）`);
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} 不是有效的图片文件`);
        return;
      }
      
      // Check total files
      if (files.length + previewUrls.length + newFiles.length >= maxFiles) {
        toast.error(`最多只能上传 ${maxFiles} 张图片`);
        return;
      }
      
      newFiles.push(file);
      
      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      newPreviews.push(objectUrl);
      
      // Clean up object URL on unmount
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    });
    
    // Update state
    setFiles(prev => [...prev, ...newFiles]);
    setPreviewUrls(prev => [...prev, ...newPreviews]);
    setDescriptions(prev => [...prev, ...new Array(newPreviews.length).fill('')]);
    
    // Clear input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [files, previewUrls, maxSize, maxFiles]);
  
  // Handle upload
  const handleUpload = async () => {
    if (files.length === 0) {
      // 如果没有新文件要上传，但有初始图片，也需要触发回调以确保数据一致性
      if (previewUrls.length > 0) {
        onUpload(previewUrls);
        toast.success('图片上传成功');
      }
      return;
    }
    
    setUploading(true);
    
    try {
      // Get the appropriate directory
      const directory = photoService.getDirectory(directoryType);
      
      // Save all files
      const uploadedUrls: string[] = [];
      
      // Process each file with detailed error handling
      for (let i = 0; i < files.length; i++) {
        try {
          // 检查文件是否有效
          if (!photoService.validateImage(files[i])) {
            toast.error(`${files[i].name} 图片无效，跳过上传`);
            continue;
          }
          
          // 调用保存照片方法
          const url = await photoService.savePhoto(files[i], directory, additionalInfo);
          
          // 验证保存后的URL是否有效
          const isValid = await photoService.isValidImageUrl(url);
          
          if (isValid) {
            uploadedUrls.push(url);
            console.log(`成功上传图片: ${url}`);
          } else {
            toast.error(`${files[i].name} 上传成功但图片无效，已跳过`);
            console.error(`上传的图片URL无效: ${url}`);
          }
        } catch (error) {
          console.error(`上传文件失败: ${files[i].name}`, error);
          toast.error(`${files[i].name} 上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
      }
      
      // 合并现有的预览URL和新上传的URL
      const existingUrls = previewUrls.slice(0, previewUrls.length - files.length);
      const allUrls = [...existingUrls, ...uploadedUrls];
      
      // 更新状态并通知父组件
      setPreviewUrls(allUrls);
      setFiles([]);
      onUpload(allUrls);
      
      if (uploadedUrls.length > 0) {
        toast.success(`成功上传 ${uploadedUrls.length} 张图片`);
      } else {
        toast.warning('没有成功上传任何图片，请检查文件格式和大小');
      }
    } catch (error) {
      console.error('批量上传图片时发生错误:', error);
      toast.error('图片上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };
  
  // Handle remove preview
  const handleRemovePreview = (index: number) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setDescriptions(prev => prev.filter((_, i) => i !== index));
    
    // Remove corresponding file if it hasn't been uploaded yet
    if (index >= previewUrls.length - files.length) {
      setFiles(prev => {
        const newFiles = [...prev];
        newFiles.splice(index - (previewUrls.length - files.length), 1);
        return newFiles;
      });
    }
    
    // Notify parent component of the update
    onUpload(previewUrls.filter((_, i) => i !== index));
  };
  
  // Handle description change
  const handleDescriptionChange = (index: number, value: string) => {
    setDescriptions(prev => {
      const newDescriptions = [...prev];
      newDescriptions[index] = value;
      return newDescriptions;
    });
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };
  
  return (
    <div className={cn(
      "space-y-3",
      compact ? "max-w-sm" : ""
    )}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple={multiple}
        accept="image/*"
        className="hidden"
      />
      
      {/* Upload button */}
      <button
        type="button"
        onClick={triggerFileInput}
        disabled={uploading || previewUrls.length >= maxFiles}
        className={cn(
          "inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200",
          uploading ? "opacity-50 cursor-not-allowed" : "",
          previewUrls.length >= maxFiles ? "opacity-50 cursor-not-allowed" : ""
        )}
      >
        <i className={`fa-solid ${uploading ? 'fa-spinner fa-spin' : 'fa-cloud-arrow-up'} mr-2`}></i>
        {uploading ? "上传中..." : buttonText}
      </button>
      
      {/* Help text */}
      {helpText && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
      )}
      
      {/* Upload button to confirm and process files */}
      {files.length > 0 && !uploading && (
        <button
          type="button"
          onClick={handleUpload}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
        >
          <i className="fa-solid fa-check mr-2"></i>
          确认上传 {files.length} 张图片
        </button>
      )}
      
      {/* Preview gallery */}
      {previewUrls.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                <img
                  src={url}
                  alt={`预览 ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    // 图片加载失败时显示占位图
                    const target = e.target as HTMLImageElement;
                    // 使用更可靠的占位图URL
                    target.src = "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Image%20placeholder&sign=7a887c6241b734f417ff13080ca9fdcb";
                  }}
                />
              </div>
              
              {/* Delete button */}
              <button
                type="button"
                onClick={() => handleRemovePreview(index)}
                className="absolute top-1 right-1 bg-white/80 dark:bg-gray-800/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white dark:hover:bg-gray-800"
                aria-label="删除图片"
              >
                <i className="fa-solid fa-trash text-red-500"></i>
              </button>
              
              {/* Description input */}
              {withDescription && (
                <textarea
                  value={descriptions[index]}
                  onChange={(e) => handleDescriptionChange(index, e.target.value)}
                  placeholder="添加描述..."
                  className="w-full mt-1 px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  rows={2}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;