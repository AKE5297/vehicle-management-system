import { useState, useRef, ChangeEvent } from 'react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

// Interface for image uploader props
interface ImageUploaderProps {
  // Maximum number of images allowed
  maxFiles?: number;
  // Maximum file size in MB
  maxSizeMB?: number;
  // Callback when images are uploaded
  onUpload: (urls: string[]) => void;
  // Initial images to display
  initialImages?: string[];
  // Whether multiple images are allowed
  multiple?: boolean;
  // Custom upload button text
  buttonText?: string;
  // Whether to show preview
  showPreview?: boolean;
  // Watermark text to add to images
  watermarkText?: string;
}

// Image uploader component with preview and drag & drop support
const ImageUploader: React.FC<ImageUploaderProps> = ({
  maxFiles = 5,
  maxSizeMB = 5,
  onUpload,
  initialImages = [],
  multiple = true,
  buttonText = '上传图片',
  showPreview = true,
  watermarkText = ''
}) => {
  // State for managing uploaded images
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  // Ref for file input element
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Calculate maximum file size in bytes
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  // Handle file selection from input
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
      
      // Reset input to allow re-selection of the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Handle dragged files
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };
  
  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  
  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  
  // Process selected files
  const handleFiles = (files: FileList) => {
    // Check if multiple files are allowed
    if (!multiple && files.length > 1) {
      toast.error('只能选择一个文件');
      return;
    }
    
    // Check file count limit
    if (images.length + files.length > maxFiles) {
      toast.error(`最多只能上传 ${maxFiles} 张图片`);
      return;
    }
    
    // Process each file
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    
    fileArray.forEach(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} 不是有效的图片文件`);
        return;
      }
      
      // Check file size
      if (file.size > maxSizeBytes) {
        toast.error(`${file.name} 超过了 ${maxSizeMB}MB 的大小限制`);
        return;
      }
      
      validFiles.push(file);
    });
    
    if (validFiles.length > 0) {
      uploadFiles(validFiles);
    }
  };
  
  // Upload and process files
  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    
    try {
      // Create an array to hold the promises for each file processing
      const uploadPromises = files.map(async (file) => {
        // Create a preview URL for the image
        const previewUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              resolve(e.target.result as string);
            } else {
              throw new Error('无法读取图片文件');
            }
          };
          reader.readAsDataURL(file);
        });
        
        // In a real application, this would be where you upload to a server
        // For this mock implementation, we'll just return the preview URL after a delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Apply watermark if requested (simulated with a different image URL)
        if (watermarkText) {
          const watermarkedUrl = `https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Car%20image%20with%20watermark%20${watermarkText}`;
          return watermarkedUrl;
        }
        
        return previewUrl;
      });
      
      // Wait for all uploads to complete
      const newImageUrls = await Promise.all(uploadPromises);
      
      // Update state with new images
      const updatedImages = [...images, ...newImageUrls];
      setImages(updatedImages);
      
      // Notify parent component of new uploads
      onUpload(updatedImages);
      
      toast.success(`成功上传 ${files.length} 张图片`);
    } catch (error) {
      console.error('图片上传失败:', error);
      toast.error('图片上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };
  
  // Remove an image
  const removeImage = (indexToRemove: number) => {
    const updatedImages = images.filter((_, index) => index !== indexToRemove);
    setImages(updatedImages);
    onUpload(updatedImages);
    toast.info('图片已移除');
  };
  
  // Trigger file input click
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300",
          dragActive 
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
            : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer",
          uploading ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
        )}
        onClick={!uploading ? handleButtonClick : undefined}onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple={multiple}
          className="hidden"
          disabled={uploading}
        />
        
        <div className="flex flex-col items-center justify-center">
          <div className={cn(
            "p-3 rounded-full",
            uploading 
              ? "bg-gray-100 dark:bg-gray-800 text-gray-400" 
              : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          )}>
            {uploading ? (
              <i className="fa-solid fa-spinner fa-spin text-xl"></i>
            ) : (
              <i className="fa-solid fa-cloud-upload-alt text-2xl"></i>
            )}
          </div>
          
          <h3 className="mt-3 text-lg font-medium text-gray-800 dark:text-white">
            {uploading ? "上传中..." : buttonText}
          </h3>
          
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-md">
            {uploading 
              ? "正在处理您的图片，请稍候..." 
              : "点击或拖拽图片到此处上传，支持 JPG、PNG 格式"}
          </p>
          
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            {`最多上传 ${maxFiles} 张图片，单张不超过 ${maxSizeMB}MB`}
          </p>
        </div>
      </div>
      
      {/* Image preview grid */}
      {showPreview && images.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            已上传图片 ({images.length}/{maxFiles})
          </h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {images.map((image, index) => (
              <div 
                key={index} 
                className="relative group rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-square transition-all duration-200 hover:shadow-md"
              >
                <img
                  src={image}
                  alt={`上传的图片 ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                  aria-label={`删除图片 ${index + 1}`}
                >
                  <div className="w-10 h-10 rounded-full bg-white bg-opacity-90 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-colors duration-200">
                    <i className="fa-solid fa-trash-alt"></i>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;