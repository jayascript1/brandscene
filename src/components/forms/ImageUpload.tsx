import React, { useCallback, useRef, useState } from 'react';
import { useForm } from '../../hooks/useForm';
import { formatFileSize } from '../../utils/validation';
import { HoverCard, AnimatedLoader } from '../ui';

interface ImageUploadProps {
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ className = '' }) => {
  const { formData, setImage, errors, isValidating } = useForm();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setIsProcessing(true);
    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      // Create UploadedImage object
      const uploadedImage = {
        file,
        previewUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type
      };
      
      await setImage(uploadedImage);
    } finally {
      setIsProcessing(false);
    }
  }, [setImage]);

  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      await handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const hasError = errors.image;

  return (
    <HoverCard className={`bg-dark-800 rounded-lg p-6 sm:p-8 ${className}`} hoverEffect="glow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-white">
          Product Image
        </h2>
        <span className="text-xs bg-dark-700 text-dark-300 px-2 py-1 rounded animate-pulse-slow">
          Mobile-friendly
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        aria-describedby="file-input-help"
      />

      {!formData.image ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer ${
            isDragOver 
              ? 'border-primary-500 bg-primary-500/10 scale-105' 
              : hasError 
                ? 'border-red-500 bg-red-500/10' 
                : 'border-dark-600 hover:border-dark-500 hover:bg-dark-700/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          role="button"
          tabIndex={0}
          aria-describedby="upload-area-description"
          aria-invalid={!!hasError}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick();
            }
          }}
        >
          <div className="text-dark-400 mb-4 animate-float">
            <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-base sm:text-lg text-dark-300 mb-4 animate-fade-in">
            Select an image to preview. Max 15MB.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <HoverCard hoverEffect="scale">
              <button 
                type="button"
                className="btn-secondary w-full sm:w-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
                aria-label="Choose file from device"
              >
                Choose file
              </button>
            </HoverCard>
            <HoverCard hoverEffect="scale">
              <button 
                type="button"
                className="btn-secondary w-full sm:w-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
                aria-label="Pick image from camera"
              >
                📷 Pick Image
              </button>
            </HoverCard>
          </div>
          {hasError && (
            <p className="text-red-400 mt-4 text-sm animate-bounce-in" role="alert">
              {hasError}
            </p>
          )}
          <p id="upload-area-description" className="sr-only">
            Drag and drop an image file here, or click to browse files. Supported formats: JPEG, PNG, WebP. Maximum file size: 15MB.
          </p>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          <div className="relative">
            <img
              src={formData.image.previewUrl}
              alt={`Product preview: ${formData.image.fileName}`}
              className="w-full h-48 sm:h-64 object-contain bg-dark-700 rounded-lg shadow-lg"
            />
            {(isValidating || isProcessing) && (
              <div className="absolute inset-0 bg-dark-900/50 flex items-center justify-center rounded-lg backdrop-blur-sm">
                <AnimatedLoader 
                  type="dots" 
                  text={isProcessing ? "Processing image..." : "Validating..."}
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm text-dark-300">
            <span className="truncate flex-1 mr-2">{formData.image.fileName}</span>
            <span className="text-xs sm:text-sm">{formatFileSize(formData.image.fileSize)}</span>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <HoverCard hoverEffect="scale">
              <button 
                type="button"
                className="btn-secondary w-full sm:w-auto"
                onClick={handleClick}
                aria-label="Change the uploaded image"
              >
                Change Image
              </button>
            </HoverCard>
            <HoverCard hoverEffect="scale">
              <button 
                type="button"
                className="btn-secondary w-full sm:w-auto text-red-400 hover:text-red-300"
                onClick={() => setImage(null as any)}
                aria-label="Remove the uploaded image"
              >
                Remove
              </button>
            </HoverCard>
          </div>
        </div>
      )}
      
      <p id="file-input-help" className="text-dark-400 text-sm mt-4">
        Upload a high-quality product image to generate better scenes. Supported formats: JPEG, PNG, WebP.
      </p>
    </HoverCard>
  );
};

export default ImageUpload;
