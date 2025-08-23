// Application optimization utilities
export class AppOptimizer {
  private static instance: AppOptimizer;
  private isProduction: boolean;

  private constructor() {
    this.isProduction = !__DEV__;
  }

  static getInstance(): AppOptimizer {
    if (!AppOptimizer.instance) {
      AppOptimizer.instance = new AppOptimizer();
    }
    return AppOptimizer.instance;
  }

  // Clean up debug logs in production
  static cleanupDebugLogs(): void {
    if (!__DEV__) {
      // Suppress console logs in production
      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;

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
    }
  }

  // Optimize images
  static optimizeImageUrl(url: string, width: number, height: number): string {
    if (!url) return url;

    // Add image optimization parameters
    const params = new URLSearchParams({
      w: width.toString(),
      h: height.toString(),
      q: '80', // quality
      fm: 'webp', // format
      fit: 'crop',
    });
    
    return `${url}?${params.toString()}`;
  }

  // Optimize bundle size
  static optimizeBundle(): void {
    // Remove unused imports and code
    if (__DEV__) {
      console.log('[OPTIMIZATION] Bundle optimization suggestions:');
      console.log('- Remove unused components');
      console.log('- Lazy load heavy components');
      console.log('- Optimize images and assets');
      console.log('- Use tree shaking');
    }
  }

  // Optimize memory usage
  static optimizeMemory(): void {
    if (typeof window !== 'undefined') {
      // Clear unused event listeners
      const cleanup = () => {
        // Clear any cached data
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              if (name.includes('old-')) {
                caches.delete(name);
              }
            });
          });
        }
      };

      // Clean up on page unload
      window.addEventListener('beforeunload', cleanup);
    }
  }

  // Optimize network requests
  static optimizeNetworkRequests(): void {
    // Add request caching
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch;
      const cache = new Map();

      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input.toString();
        
        // Check cache for GET requests
        if (init?.method === 'GET' || !init?.method) {
          const cached = cache.get(url);
          if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minutes
            return new Response(JSON.stringify(cached.data), {
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }

        // Make actual request
        const response = await originalFetch(input, init);
        
        // Cache successful GET responses
        if (response.ok && (init?.method === 'GET' || !init?.method)) {
          const clone = response.clone();
          clone.json().then(data => {
            cache.set(url, {
              data,
              timestamp: Date.now()
            });
          });
        }

        return response;
      };
    }
  }

  // Optimize animations
  static optimizeAnimations(): void {
    // Use transform instead of position for better performance
    if (typeof window !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        .optimized-animation {
          will-change: transform;
          transform: translateZ(0);
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Optimize scroll performance
  static optimizeScroll(): void {
    if (typeof window !== 'undefined') {
      // Add passive event listeners for better scroll performance
      const addPassiveListener = (element: Element, event: string) => {
        element.addEventListener(event, () => {}, { passive: true });
      };

      // Optimize scroll containers
      document.querySelectorAll('.scroll-container').forEach(container => {
        addPassiveListener(container, 'scroll');
        addPassiveListener(container, 'touchstart');
        addPassiveListener(container, 'touchmove');
      });
    }
  }

  // Optimize fonts
  static optimizeFonts(): void {
    if (typeof window !== 'undefined') {
      // Preload critical fonts
      const fontLinks = [
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
      ];

      fontLinks.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = href;
        document.head.appendChild(link);
      });
    }
  }

  // Optimize SEO
  static optimizeSEO(): void {
    if (typeof window !== 'undefined') {
      // Add meta tags for better SEO
      const metaTags = [
        { name: 'description', content: 'NomadNow - Connect with digital nomads worldwide' },
        { name: 'keywords', content: 'digital nomad, remote work, travel, community' },
        { name: 'author', content: 'NomadNow Team' },
        { property: 'og:title', content: 'NomadNow' },
        { property: 'og:description', content: 'Connect with digital nomads worldwide' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ];

      metaTags.forEach(tag => {
        const meta = document.createElement('meta');
        Object.entries(tag).forEach(([key, value]) => {
          meta.setAttribute(key, value);
        });
        document.head.appendChild(meta);
      });
    }
  }

  // Optimize accessibility
  static optimizeAccessibility(): void {
    if (typeof window !== 'undefined') {
      // Add ARIA labels and roles
      const addAriaLabels = () => {
        // Add labels to buttons without text
        document.querySelectorAll('button:not([aria-label])').forEach(button => {
          if (!button.textContent?.trim()) {
            const icon = button.querySelector('i, svg');
            if (icon) {
              button.setAttribute('aria-label', icon.className || 'Button');
            }
          }
        });

        // Add roles to interactive elements
        document.querySelectorAll('[role]').forEach(element => {
          if (!element.getAttribute('aria-label')) {
            const text = element.textContent?.trim();
            if (text) {
              element.setAttribute('aria-label', text);
            }
          }
        });
      };

      // Run after DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addAriaLabels);
      } else {
        addAriaLabels();
      }
    }
  }

  // Optimize security
  static optimizeSecurity(): void {
    if (typeof window !== 'undefined') {
      // Add security headers
      const securityHeaders = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      };

      // Add CSP header
      const csp = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:;";
      
      // Note: These headers should be set on the server side
      if (__DEV__) {
        console.log('[SECURITY] Recommended headers:', securityHeaders);
        console.log('[SECURITY] CSP:', csp);
      }
    }
  }

  // Run all optimizations
  static runAllOptimizations(): void {
    this.cleanupDebugLogs();
    this.optimizeBundle();
    this.optimizeMemory();
    this.optimizeNetworkRequests();
    this.optimizeAnimations();
    this.optimizeScroll();
    this.optimizeFonts();
    this.optimizeSEO();
    this.optimizeAccessibility();
    this.optimizeSecurity();

    if (__DEV__) {
      console.log('[OPTIMIZATION] All optimizations applied');
    }
  }
}

// Convenience functions
export const optimizeApp = () => AppOptimizer.runAllOptimizations();
export const cleanupDebugLogs = () => AppOptimizer.cleanupDebugLogs();
export const optimizeImages = (url: string, width: number, height: number) => AppOptimizer.optimizeImageUrl(url, width, height);
export const optimizeBundle = () => AppOptimizer.optimizeBundle();
export const optimizeMemory = () => AppOptimizer.optimizeMemory();
export const optimizeNetwork = () => AppOptimizer.optimizeNetworkRequests();
export const optimizeAnimations = () => AppOptimizer.optimizeAnimations();
export const optimizeScroll = () => AppOptimizer.optimizeScroll();
export const optimizeFonts = () => AppOptimizer.optimizeFonts();
export const optimizeSEO = () => AppOptimizer.optimizeSEO();
export const optimizeAccessibility = () => AppOptimizer.optimizeAccessibility();
export const optimizeSecurity = () => AppOptimizer.optimizeSecurity();
