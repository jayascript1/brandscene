import React, { useState, useEffect, useRef } from 'react';
import { useLazyLoad, ImageOptimizer, measurePerformance } from '../../utils/performance';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  lazyLoad?: boolean;
  preload?: boolean;
  placeholder?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  fallback?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  quality = 0.8,
  format = 'webp',
  lazyLoad = true,
  preload = false,
  placeholder,
  onLoad,
  onError,
  fallback
}) => {
  const [optimizedSrc, setOptimizedSrc] = useState<string>('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imageOptimizer = useRef<ImageOptimizer>();
  const imgRef = useRef<HTMLImageElement>(null);

  // Initialize image optimizer
  useEffect(() => {
    if (!imageOptimizer.current) {
      imageOptimizer.current = new ImageOptimizer({
        quality,
        format,
        maxWidth: width || 1920,
        maxHeight: height || 1080,
        lazyLoad,
        preload
      });
    }
  }, [quality, format, width, height, lazyLoad, preload]);

  // Lazy loading hook
  const { imgRef: lazyImgRef, isLoaded, isInView } = useLazyLoad(src, {
    threshold: 0.1,
    rootMargin: '50px'
  });

  // Optimize image when it comes into view
  useEffect(() => {
    if (isInView && src && !optimizedSrc && !isOptimizing) {
      setIsOptimizing(true);
      
      measurePerformance('image-optimization', async () => {
        try {
          const optimized = await imageOptimizer.current!.optimizeImage(src);
          setOptimizedSrc(optimized);
          setCurrentSrc(optimized);
        } catch (error) {
          console.error('Image optimization failed:', error);
          setCurrentSrc(src); // Fallback to original
          setHasError(true);
          onError?.(error as Error);
        } finally {
          setIsOptimizing(false);
        }
      });
    }
  }, [isInView, src, optimizedSrc, isOptimizing, onError]);

  // Handle image load
  const handleImageLoad = () => {
    onLoad?.();
  };

  // Handle image error
  const handleImageError = () => {
    if (fallback && currentSrc !== fallback) {
      setCurrentSrc(fallback);
      setHasError(false);
    } else {
      setHasError(true);
      onError?.(new Error('Failed to load image'));
    }
  };

  // Preload image if requested
  useEffect(() => {
    if (preload && src) {
      imageOptimizer.current?.preloadImage(src);
    }
  }, [preload, src]);

  // Determine which ref to use
  const finalImgRef = lazyLoad ? lazyImgRef : imgRef;

  return (
    <div className={`relative ${className}`}>
      {/* Placeholder */}
      {!isLoaded && placeholder && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${placeholder})` }}
        />
      )}
      
      {/* Loading indicator */}
      {isOptimizing && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-800 bg-opacity-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      )}
      
      {/* Error state */}
      {hasError && !fallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-800 bg-opacity-50">
          <div className="text-center text-dark-300">
            <svg className="mx-auto h-8 w-8 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M24 4l2.83 2.83L24 9.66l-2.83-2.83L24 4zM12 24l2.83-2.83L9.66 24l2.83 2.83L12 24zm12 0l-2.83 2.83L38.34 24l-2.83-2.83L24 24zM24 38.34l2.83 2.83L24 43.17l-2.83-2.83L24 38.34z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm">Failed to load image</p>
          </div>
        </div>
      )}
      
      {/* Optimized Image */}
      <img
        ref={finalImgRef}
        src={currentSrc || src}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${hasError ? 'opacity-50' : ''}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={lazyLoad ? 'lazy' : 'eager'}
        decoding="async"
      />
      
      {/* Performance indicator (development only) */}
      {process.env.NODE_ENV === 'development' && optimizedSrc && (
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
          Optimized
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
