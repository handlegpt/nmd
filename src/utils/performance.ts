// Performance optimization utilities

// Debounce function for expensive operations
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

// Throttle function for frequent events
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

// Memoization helper
export const memoize = <T extends (...args: any[]) => any>(
  func: T
): T => {
  const cache = new Map();
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }
  
  return new IntersectionObserver(callback, {
    threshold: 0.1,
    rootMargin: '50px',
    ...options,
  });
};

// Preload critical resources
export const preloadResource = (url: string, type: 'image' | 'script' | 'style' = 'image') => {
  if (typeof window === 'undefined') return;

  switch (type) {
    case 'image':
      const img = new Image();
      img.src = url;
      break;
    case 'script':
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      document.head.appendChild(script);
      break;
    case 'style':
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      document.head.appendChild(link);
      break;
  }
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  if (__DEV__) {
    const start = performance.now();
    fn();
    const end = performance.now();
    // Performance measurement (silent in production)
  } else {
    fn();
  }
};

// Bundle size optimization
export const chunkLoader = <T>(importFn: () => Promise<T>): (() => Promise<T>) => {
  let promise: Promise<T> | null = null;
  
  return () => {
    if (!promise) {
      promise = importFn();
    }
    return promise;
  };
};

// Memory management
export const cleanupMemory = () => {
  if (typeof window !== 'undefined' && 'gc' in window) {
    (window as any).gc?.();
  }
};

// Critical CSS inlining helper
export const inlineCriticalCSS = (css: string) => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }
};
