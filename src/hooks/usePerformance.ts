import { useEffect, useRef, useCallback, useState } from 'react';
import { performanceMonitor, measurePerformance, debounce, throttle, measureAsyncPerformance } from '../utils/performance';

interface UsePerformanceOptions {
  componentName: string;
  trackRenders?: boolean;
  trackInteractions?: boolean;
  debounceMs?: number;
  throttleMs?: number;
}

export const usePerformance = (options: UsePerformanceOptions) => {
  const { componentName, trackRenders = true, trackInteractions = true, debounceMs = 100, throttleMs = 100 } = options;
  const renderCount = useRef(0);
  const lastRenderTime = useRef<number>(0);

  // Track component renders
  useEffect(() => {
    if (trackRenders) {
      renderCount.current++;
      const now = performance.now();
      const timeSinceLastRender = now - lastRenderTime.current;
      
      performanceMonitor.recordMetric(
        `${componentName}-render`,
        timeSinceLastRender,
        'render',
        { renderCount: renderCount.current }
      );
      
      lastRenderTime.current = now;
    }
  });

  // Debounced function wrapper
  const debounced = useCallback(
    <T extends (...args: any[]) => any>(fn: T) => {
      return debounce((...args: Parameters<T>) => {
        measurePerformance(`${componentName}-debounced-action`, () => fn(...args));
      }, debounceMs);
    },
    [componentName, debounceMs]
  );

  // Throttled function wrapper
  const throttled = useCallback(
    <T extends (...args: any[]) => any>(fn: T) => {
      return throttle((...args: Parameters<T>) => {
        measurePerformance(`${componentName}-throttled-action`, () => fn(...args));
      }, throttleMs);
    },
    [componentName, throttleMs]
  );

  // Track user interactions
  const trackInteraction = useCallback((actionName: string) => {
    if (trackInteractions) {
      performanceMonitor.recordMetric(
        `${componentName}-${actionName}`,
        0,
        'interaction'
      );
    }
  }, [componentName, trackInteractions]);

  // Track async operations
  const trackAsyncOperation = useCallback(async <T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    return performanceMonitor.measureAsyncPerformance(
      `${componentName}-${operationName}`,
      operation,
      'network'
    );
  }, [componentName]);

  // Track synchronous operations
  const trackOperation = useCallback(<T>(
    operationName: string,
    operation: () => T
  ): T => {
    return performanceMonitor.measurePerformance(
      `${componentName}-${operationName}`,
      operation,
      'render'
    );
  }, [componentName]);

  // Get component performance stats
  const getStats = useCallback(() => {
    const renderMetrics = performanceMonitor.getMetrics('render').filter(
      m => m.name.includes(componentName)
    );
    
    const interactionMetrics = performanceMonitor.getMetrics('interaction').filter(
      m => m.name.includes(componentName)
    );

    return {
      renderCount: renderCount.current,
      totalRenderTime: renderMetrics.reduce((sum, m) => sum + m.duration, 0),
      avgRenderTime: renderMetrics.length > 0 
        ? renderMetrics.reduce((sum, m) => sum + m.duration, 0) / renderMetrics.length 
        : 0,
      interactionCount: interactionMetrics.length,
      slowestOperation: performanceMonitor.getSlowestMetrics(1).find(
        m => m.name.includes(componentName)
      )
    };
  }, [componentName]);

  return {
    debounced,
    throttled,
    trackInteraction,
    trackAsyncOperation,
    trackOperation,
    getStats,
    renderCount: renderCount.current
  };
};

// Hook for optimizing expensive calculations
export const useOptimizedCalculation = <T>(
  calculation: () => T,
  dependencies: any[],
  options: {
    memoize?: boolean;
    trackPerformance?: boolean;
    operationName?: string;
  } = {}
) => {
  const { memoize = true, trackPerformance = true, operationName = 'calculation' } = options;
  
  const memoizedCalculation = useCallback(() => {
    if (trackPerformance) {
      return measurePerformance(operationName, calculation);
    }
    return calculation();
  }, dependencies);

  return memoize ? memoizedCalculation : calculation;
};

// Hook for lazy loading components
export const useLazyComponent = (
  importFunc: () => Promise<any>
) => {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadComponent = useCallback(async () => {
    if (Component) return Component;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await measureAsyncPerformance('lazy-component-load', importFunc);
      setComponent(result.default || result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [Component, importFunc]);

  useEffect(() => {
    loadComponent();
  }, [loadComponent]);

  return { Component, isLoading, error, reload: loadComponent };
};

// Hook for virtual scrolling optimization
export const useVirtualScrollOptimization = (
  items: any[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  const [scrollTop, setScrollTop] = useState(0);

  const updateVisibleRange = useCallback((newScrollTop: number) => {
    const start = Math.max(0, Math.floor(newScrollTop / itemHeight) - overscan);
    const end = Math.min(
      items.length - 1,
      Math.ceil((newScrollTop + containerHeight) / itemHeight) + overscan
    );
    
    setVisibleRange({ start, end });
  }, [items.length, itemHeight, containerHeight, overscan]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    updateVisibleRange(newScrollTop);
  }, [updateVisibleRange]);

  const visibleItems = items.slice(visibleRange.start, visibleRange.end + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    scrollTop,
    handleScroll,
    visibleRange
  };
};

export default usePerformance;
