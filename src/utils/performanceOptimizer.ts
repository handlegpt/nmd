import { logPerformance, logError } from './logger';

// Performance optimization utilities
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private metrics: Map<string, number[]> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  // Measure function execution time
  static measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      logPerformance(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      logError(`Error in ${name} after ${duration}ms`, error);
      throw error;
    }
  }

  // Measure async function execution time
  static async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      logPerformance(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      logError(`Error in ${name} after ${duration}ms`, error);
      throw error;
    }
  }

  // Debounce function calls
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Throttle function calls
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Memoize function results
  static memoize<T extends (...args: any[]) => any>(
    fn: T,
    keyFn?: (...args: Parameters<T>) => string
  ): T {
    const cache = new Map<string, ReturnType<T>>();
    
    return ((...args: Parameters<T>): ReturnType<T> => {
      const key = keyFn ? keyFn(...args) : JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key)!;
      }
      
      const result = fn(...args);
      cache.set(key, result);
      return result;
    }) as T;
  }

  // Lazy load components
  static lazyLoad<T>(importFn: () => Promise<{ default: T }>): () => Promise<T> {
    let component: T | null = null;
    let loading = false;
    let promise: Promise<T> | null = null;

    return async (): Promise<T> => {
      if (component) {
        return component;
      }

      if (loading && promise) {
        return promise;
      }

      loading = true;
      promise = importFn().then(module => {
        component = module.default;
        loading = false;
        return component;
      });

      return promise;
    };
  }

  // Optimize images
  static optimizeImage(url: string, width: number, height: number): string {
    // Add image optimization parameters
    const params = new URLSearchParams({
      w: width.toString(),
      h: height.toString(),
      q: '80', // quality
      fm: 'webp', // format
    });
    
    return `${url}?${params.toString()}`;
  }

  // Preload critical resources
  static preloadResource(url: string, type: 'image' | 'script' | 'style'): void {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = type === 'image' ? 'preload' : 'prefetch';
      link.as = type;
      link.href = url;
      document.head.appendChild(link);
    }
  }

  // Monitor memory usage
  static monitorMemory(): void {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      const used = memory.usedJSHeapSize / 1024 / 1024; // MB
      const total = memory.totalJSHeapSize / 1024 / 1024; // MB
      const limit = memory.jsHeapSizeLimit / 1024 / 1024; // MB
      
      logPerformance('Memory Used', used, 'MB');
      logPerformance('Memory Total', total, 'MB');
      logPerformance('Memory Limit', limit, 'MB');
      
      // Warn if memory usage is high
      if (used / limit > 0.8) {
        logError('High memory usage detected', { used, total, limit });
      }
    }
  }

  // Monitor frame rate
  static monitorFrameRate(callback?: (fps: number) => void): () => void {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        logPerformance('FPS', fps);
        
        if (callback) {
          callback(fps);
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }

  // Optimize scroll performance
  static optimizeScroll(
    element: HTMLElement,
    callback: (scrollTop: number) => void
  ): () => void {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          callback(element.scrollTop);
          ticking = false;
        });
        ticking = true;
      }
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }

  // Batch DOM updates
  static batchUpdates(updates: (() => void)[]): void {
    if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
      requestAnimationFrame(() => {
        updates.forEach(update => update());
      });
    } else {
      updates.forEach(update => update());
    }
  }

  // Optimize list rendering
  static createVirtualizedList<T>(
    items: T[],
    itemHeight: number,
    containerHeight: number,
    renderItem: (item: T, index: number) => React.ReactNode
  ): {
    visibleItems: T[];
    startIndex: number;
    endIndex: number;
    totalHeight: number;
  } {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const totalHeight = items.length * itemHeight;
    
    return {
      visibleItems: items.slice(0, visibleCount),
      startIndex: 0,
      endIndex: Math.min(visibleCount, items.length),
      totalHeight,
    };
  }

  // Cache expensive computations
  static createCache<K, V>(maxSize: number = 100): Map<K, V> {
    return new Map<K, V>();
  }

  // Optimize network requests
  static optimizeRequest(url: string, options: RequestInit = {}): RequestInit {
    return {
      ...options,
      headers: {
        'Cache-Control': 'max-age=300', // 5 minutes
        ...options.headers,
      },
    };
  }
}

// Convenience functions
export const measure = PerformanceOptimizer.measure;
export const measureAsync = PerformanceOptimizer.measureAsync;
export const debounce = PerformanceOptimizer.debounce;
export const throttle = PerformanceOptimizer.throttle;
export const memoize = PerformanceOptimizer.memoize;
export const lazyLoad = PerformanceOptimizer.lazyLoad;
export const optimizeImage = PerformanceOptimizer.optimizeImage;
export const preloadResource = PerformanceOptimizer.preloadResource;
export const monitorMemory = PerformanceOptimizer.monitorMemory;
export const monitorFrameRate = PerformanceOptimizer.monitorFrameRate;
export const optimizeScroll = PerformanceOptimizer.optimizeScroll;
export const batchUpdates = PerformanceOptimizer.batchUpdates;
export const createVirtualizedList = PerformanceOptimizer.createVirtualizedList;
export const createCache = PerformanceOptimizer.createCache;
export const optimizeRequest = PerformanceOptimizer.optimizeRequest;
