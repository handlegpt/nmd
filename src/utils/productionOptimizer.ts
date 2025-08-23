// Production environment optimization utilities
export class ProductionOptimizer {
  private static instance: ProductionOptimizer;
  private isProduction: boolean;

  private constructor() {
    this.isProduction = !__DEV__;
  }

  static getInstance(): ProductionOptimizer {
    if (!ProductionOptimizer.instance) {
      ProductionOptimizer.instance = new ProductionOptimizer();
    }
    return ProductionOptimizer.instance;
  }

  // Clean up debug logs in production
  static cleanupDebugLogs(): void {
    if (!__DEV__) {
      // Suppress console logs in production
      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;
      const originalDebug = console.debug;
      const originalInfo = console.info;

      console.log = (...args: any[]) => {
        // Only log critical information in production
        if (args[0] && typeof args[0] === 'string' && args[0].includes('[CRITICAL]')) {
          originalLog.apply(console, args);
        }
      };

      console.warn = (...args: any[]) => {
        // Only log warnings in production if they're important
        if (args[0] && typeof args[0] === 'string' && args[0].includes('[IMPORTANT]')) {
          originalWarn.apply(console, args);
        }
      };

      console.error = (...args: any[]) => {
        // Always log errors in production
        originalError.apply(console, args);
      };

      console.debug = () => {}; // Suppress debug logs
      console.info = () => {}; // Suppress info logs
    }
  }

  // Remove development components
  static removeDevComponents(): void {
    if (!__DEV__ && typeof window !== 'undefined') {
      // Remove development-only elements
      const devElements = document.querySelectorAll('[data-dev-only]');
      devElements.forEach(element => element.remove());

      // Remove development styles
      const devStyles = document.querySelectorAll('style[data-dev-only]');
      devStyles.forEach(style => style.remove());

      // Remove development scripts
      const devScripts = document.querySelectorAll('script[data-dev-only]');
      devScripts.forEach(script => script.remove());
    }
  }

  // Optimize bundle size
  static optimizeBundle(): void {
    if (!__DEV__) {
      // Remove unused CSS
      if (typeof window !== 'undefined') {
        const unusedStyles = document.querySelectorAll('style[data-unused]');
        unusedStyles.forEach(style => style.remove());
      }
    }
  }

  // Disable development features
  static disableDevFeatures(): void {
    if (!__DEV__) {
      // Disable React DevTools
      if (typeof window !== 'undefined') {
        (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = undefined;
      }

      // Disable Redux DevTools
      if (typeof window !== 'undefined') {
        (window as any).__REDUX_DEVTOOLS_EXTENSION__ = undefined;
      }
    }
  }

  // Optimize images
  static optimizeImages(): void {
    if (!__DEV__ && typeof window !== 'undefined') {
      // Add loading="lazy" to images
      const images = document.querySelectorAll('img:not([loading])');
      images.forEach(img => {
        img.setAttribute('loading', 'lazy');
      });

      // Add decoding="async" to images
      const asyncImages = document.querySelectorAll('img:not([decoding])');
      asyncImages.forEach(img => {
        img.setAttribute('decoding', 'async');
      });
    }
  }

  // Optimize fonts
  static optimizeFonts(): void {
    if (!__DEV__ && typeof window !== 'undefined') {
      // Load fonts without preload to avoid warnings
      const fontLinks = [
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
      ];

      fontLinks.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });
    }
  }

  // Run all production optimizations
  static runAllOptimizations(): void {
    this.cleanupDebugLogs();
    this.removeDevComponents();
    this.optimizeBundle();
    this.disableDevFeatures();
    this.optimizeImages();
    this.optimizeFonts();

    if (__DEV__) {
      console.log('[PRODUCTION] Production optimizations applied');
    }
  }
}

// Convenience functions
export const optimizeForProduction = () => ProductionOptimizer.runAllOptimizations();
export const cleanupDebugLogs = () => ProductionOptimizer.cleanupDebugLogs();
export const removeDevComponents = () => ProductionOptimizer.removeDevComponents();
export const optimizeBundle = () => ProductionOptimizer.optimizeBundle();
export const disableDevFeatures = () => ProductionOptimizer.disableDevFeatures();
export const optimizeImages = () => ProductionOptimizer.optimizeImages();
export const optimizeFonts = () => ProductionOptimizer.optimizeFonts();
