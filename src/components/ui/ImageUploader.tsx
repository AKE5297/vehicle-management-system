import { useState } from 'react';
import { toast } from 'sonner';
import { photoService } from '../../services/photoService';
import { cn } from '../../lib/utils';

interface ImageUploaderProps {
  maxFiles?: number;
  multiple?: boolean;
  initialImages?: string[];
  onUpload: (urls: string[]) => void;
  buttonText?: string;
  maxSize?: number;
  helpText?: string;
  compact?: boolean;
  watermarkText?: string;
  withDescription?: boolean;
  directoryType?: keyof typeof photoService.getDirectory;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  maxFiles = 5,
  multiple = true,
  initialImages = [],
  onUpload,
  buttonText = '上传照片',
  maxSize = 500, // Default 500KB
  helpText = '支持JPG、PNG格式',
  compact = false,
  watermarkText,
  withDescription = false,
  directoryType = 'VEHICLE_PHOTOS'
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
      const newImages: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file size
        if (file.size > maxSize * 1024) {
          toast.error(`文件大小不能超过${maxSize}KB`);
          continue;
        }
        
        // Validate file type
        if (!photoService.validateImage(file)) {
          toast.error('不支持的文件类型或文件过大');
          continue;
        }
        
        // Get directory for this type of photos
        const directory = photoService.getDirectory(directoryType);
        
        // Save photo using photo service
        const url = await photoService.savePhoto(file, directory);
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

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
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
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Image%20placeholder&sign=7a887c6241b734f417ff13080ca9fdcb";
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-white/80 dark:bg-gray-900/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                aria-label="Remove image"
              >
                <i className="fa-solid fa-trash text-red-500"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;