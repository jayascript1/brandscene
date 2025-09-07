import React from 'react';
import { errorMonitor } from './errorMonitoring';

// Performance optimization utilities

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: Date;
  category: 'load' | 'render' | 'interaction' | 'network' | 'memory';
  metadata?: Record<string, any>;
}

export interface ImageOptimizationConfig {
  quality: number;
  format: 'webp' | 'jpeg' | 'png';
  maxWidth: number;
  maxHeight: number;
  lazyLoad: boolean;
  preload: boolean;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private isEnabled: boolean = true;

  constructor() {
    this.setupPerformanceObservers();
  }

  private setupPerformanceObservers() {
    // Navigation timing
    if ('PerformanceObserver' in window) {
      const navigationObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordMetric('page-load', navEntry.loadEventEnd - navEntry.loadEventStart, 'load', {
              domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              firstPaint: navEntry.loadEventEnd - navEntry.fetchStart
            });
          }
        });
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.set('navigation', navigationObserver);
    }

    // Resource timing
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.recordMetric('resource-load', resourceEntry.duration, 'network', {
              name: resourceEntry.name,
              size: resourceEntry.transferSize,
              type: resourceEntry.initiatorType
            });
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
    }

    // Long tasks
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'longtask') {
            const longTaskEntry = entry as PerformanceEntry;
            this.recordMetric('long-task', longTaskEntry.duration, 'render', {
              startTime: longTaskEntry.startTime,
              endTime: longTaskEntry.startTime + longTaskEntry.duration
            });
          }
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.set('longtask', longTaskObserver);
    }
  }

  recordMetric(
    name: string,
    duration: number,
    category: PerformanceMetric['category'],
    metadata?: Record<string, any>
  ) {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: new Date(),
      category,
      metadata
    };

    this.metrics.push(metric);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Report to error monitoring system - use different thresholds per category
    const thresholds = {
      'load': 30000,      // 30s for initial page loads
      'render': 100,      // 100ms for render operations
      'interaction': 500, // 500ms for user interactions
      'network': 60000,   // 60s for network requests (3D assets can be large)
      'memory': 1000      // 1s for memory operations
    };
    
    const threshold = thresholds[category] || 5000; // Default 5s fallback
    if (duration > threshold) {
      errorMonitor.capturePerformanceMetric(name, duration, metadata);
    }

    // Log in development - only log unusually slow operations
    if (process.env.NODE_ENV === 'development') {
      const logThresholds = {
        'load': 10000,      // Log page loads > 10s
        'render': 100,      // Log renders > 100ms  
        'interaction': 500, // Log interactions > 500ms
        'network': 30000,   // Log network requests > 30s (for large 3D assets)
        'memory': 1000      // Log memory operations > 1s
      };
      
      const logThreshold = logThresholds[category] || 5000;
      if (duration > logThreshold) {
        console.log(`Performance: ${name} took ${duration}ms`);
      }
    }
  }

  measurePerformance<T>(
    name: string,
    fn: () => T,
    category: PerformanceMetric['category'] = 'render'
  ): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    this.recordMetric(name, end - start, category);
    return result;
  }

  async measureAsyncPerformance<T>(
    name: string,
    fn: () => Promise<T>,
    category: PerformanceMetric['category'] = 'network'
  ): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    this.recordMetric(name, end - start, category);
    return result;
  }

  getMetrics(category?: PerformanceMetric['category']): PerformanceMetric[] {
    if (category) {
      return this.metrics.filter(m => m.category === category);
    }
    return [...this.metrics];
  }

  getAverageMetric(name: string): number {
    const metrics = this.metrics.filter(m => m.name === name);
    if (metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / metrics.length;
  }

  getSlowestMetrics(limit: number = 10): PerformanceMetric[] {
    return [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  clearMetrics() {
    this.metrics = [];
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Singleton performance monitor
export const performanceMonitor = new PerformanceMonitor();

// Lazy load components with loading fallback
export const lazyLoad = (importFunc: () => Promise<any>, fallback?: React.ComponentType) => {
  const LazyComponent = React.lazy(importFunc);
  
  return (props: any) => React.createElement(React.Suspense, {
    fallback: fallback ? React.createElement(fallback) : React.createElement('div', null, 'Loading...')
  }, React.createElement(LazyComponent, props));
};

// Debounce function for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for performance
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Memoization utility with cache size limit
export const memoize = <T extends (...args: any[]) => any>(
  func: T,
  maxCacheSize: number = 100
): T => {
  const cache = new Map();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    
    // Limit cache size
    if (cache.size >= maxCacheSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    cache.set(key, result);
    return result;
  }) as T;
};

// Image optimization and caching
export class ImageOptimizer {
  private cache = new Map<string, string>();
  private loadingQueue: Set<string> = new Set();
  private config: ImageOptimizationConfig;

  constructor(config: Partial<ImageOptimizationConfig> = {}) {
    this.config = {
      quality: 0.8,
      format: 'webp',
      maxWidth: 1920,
      maxHeight: 1080,
      lazyLoad: true,
      preload: false,
      ...config
    };
  }

  async optimizeImage(src: string): Promise<string> {
    // Check cache first
    if (this.cache.has(src)) {
      return this.cache.get(src)!;
    }

    // Check if already loading
    if (this.loadingQueue.has(src)) {
      return new Promise((resolve) => {
        const checkCache = () => {
          if (this.cache.has(src)) {
            resolve(this.cache.get(src)!);
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      });
    }

    this.loadingQueue.add(src);

    try {
      const optimizedSrc = await this.processImage(src);
      this.cache.set(src, optimizedSrc);
      this.loadingQueue.delete(src);
      return optimizedSrc;
    } catch (error) {
      this.loadingQueue.delete(src);
      throw error;
    }
  }

  private async processImage(src: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          // Calculate new dimensions
          const { width, height } = this.calculateDimensions(img.width, img.height);
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and resize image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to desired format
          const mimeType = this.getMimeType();
          const optimizedSrc = canvas.toDataURL(mimeType, this.config.quality);
          
          resolve(optimizedSrc);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    });
  }

  private calculateDimensions(width: number, height: number): { width: number; height: number } {
    const { maxWidth, maxHeight } = this.config;
    
    if (width <= maxWidth && height <= maxHeight) {
      return { width, height };
    }
    
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    return {
      width: Math.round(width * ratio),
      height: Math.round(height * ratio)
    };
  }

  private getMimeType(): string {
    switch (this.config.format) {
      case 'webp':
        return 'image/webp';
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      default:
        return 'image/webp';
    }
  }

  preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  }

  clearCache() {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

// Lazy loading hook
export const useLazyLoad = (src: string, options: { threshold?: number; rootMargin?: string } = {}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  React.useEffect(() => {
    if (isInView && src) {
      const img = new Image();
      img.onload = () => setIsLoaded(true);
      img.src = src;
    }
  }, [isInView, src]);

  return { imgRef, isLoaded, isInView };
};

// Virtual scrolling hook for large lists
export const useVirtualScroll = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const visibleStartIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleEndIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(visibleStartIndex, visibleEndIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStartIndex * itemHeight;

  const handleScroll = React.useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll
  };
};

// Bundle size optimization utilities
export const bundleAnalyzer = {
  // Track component usage
  trackComponentUsage(componentName: string) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Component used: ${componentName}`);
    }
  },

  // Track feature usage
  trackFeatureUsage(featureName: string) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Feature used: ${featureName}`);
    }
  }
};

// Memory management utilities
export const memoryManager = {
  // Clear unused caches
  clearUnusedCaches() {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
  },

  // Clear image cache
  clearImageCache() {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.filter(name => name.includes('image')).forEach(name => {
          caches.delete(name);
        });
      });
    }
  },

  // Monitor memory usage
  getMemoryUsage(): number | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    }
    return null;
  }
};

// Export convenience functions
export const measurePerformance = (name: string, fn: () => void) => {
  return performanceMonitor.measurePerformance(name, fn);
};

export const measureAsyncPerformance = (name: string, fn: () => Promise<any>) => {
  return performanceMonitor.measureAsyncPerformance(name, fn);
};

export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

export const batchUpdates = (updates: (() => void)[]) => {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
};

export const cleanupMemory = () => {
  memoryManager.clearUnusedCaches();
  memoryManager.clearImageCache();
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Memory cleanup completed');
  }
};

export default performanceMonitor;
