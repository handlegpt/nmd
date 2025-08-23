// Global error handler for network and other errors
export class ErrorHandler {
  private static isInitialized = false;

  // Initialize global error handling
  static initialize() {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    // Handle unhandled promise rejections (network errors)
    window.addEventListener('unhandledrejection', (event) => {
      console.warn('⚠️ Unhandled promise rejection:', event.reason);
      
      // Check if it's a network error
      if (event.reason && typeof event.reason === 'object') {
        const error = event.reason;
        
        if (error.name === 'NetworkError' || 
            error.message?.includes('network') ||
            error.message?.includes('fetch') ||
            error.message?.includes('timeout')) {
          console.warn('⚠️ Network error detected, continuing with fallback');
          event.preventDefault(); // Prevent the error from being logged as unhandled
          return;
        }
      }
      
      // For other errors, log but don't prevent default behavior
      console.error('❌ Unhandled error:', event.reason);
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      console.warn('⚠️ Global error:', event.error);
      
      // Check if it's a resource loading error
      if (event.target && event.target !== window) {
        const target = event.target as HTMLElement;
        if (target.tagName === 'LINK' || target.tagName === 'SCRIPT' || target.tagName === 'IMG') {
          console.warn('⚠️ Resource loading error:', target.tagName, target.src || target.href);
          event.preventDefault(); // Prevent the error from being logged
          return;
        }
      }
    });

    this.isInitialized = true;
  }

  // Handle specific network errors
  static handleNetworkError(error: any, context?: string) {
    console.warn(`⚠️ Network error${context ? ` in ${context}` : ''}:`, error);
    
    // Return a fallback or default value
    return null;
  }

  // Check if error is a network error
  static isNetworkError(error: any): boolean {
    if (!error) return false;
    
    const errorMessage = error.message || error.toString() || '';
    const errorName = error.name || '';
    
    return errorName === 'NetworkError' ||
           errorName === 'TypeError' ||
           errorMessage.includes('network') ||
           errorMessage.includes('fetch') ||
           errorMessage.includes('timeout') ||
           errorMessage.includes('ERR_NETWORK') ||
           errorMessage.includes('ERR_SSL_PROTOCOL');
  }

  // Safe async wrapper
  static async safeAsync<T>(
    asyncFn: () => Promise<T>,
    fallback: T,
    context?: string
  ): Promise<T> {
    try {
      return await asyncFn();
    } catch (error) {
      if (this.isNetworkError(error)) {
        console.warn(`⚠️ Network error${context ? ` in ${context}` : ''}, using fallback`);
        return fallback;
      }
      throw error; // Re-throw non-network errors
    }
  }
}

// Initialize error handler
if (typeof window !== 'undefined') {
  ErrorHandler.initialize();
}

export default ErrorHandler;
