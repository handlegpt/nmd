// Warning suppression utilities for development

// Suppress specific warnings in development
export const suppressWarnings = () => {
  if (__DEV__) {
    // Suppress shadow* style warnings (already handled by platformStyles)
    const originalWarn = console.warn;
    console.warn = (...args: any[]) => {
      const message = args[0];
      if (typeof message === 'string') {
        // Suppress specific warnings
        if (
          message.includes('shadow*') ||
          message.includes('props.pointerEvents') ||
          message.includes('style.resizeMode') ||
          message.includes('style.tintColor') ||
          message.includes('useNativeDriver') ||
          message.includes('Download the React DevTools')
        ) {
          return;
        }
      }
      originalWarn.apply(console, args);
    };
  }
};

// Performance optimization warnings
export const logPerformanceWarning = (message: string) => {
  if (__DEV__) {
    console.warn(`Performance: ${message}`);
  }
};

// Development-only warnings
export const logDevWarning = (message: string) => {
  if (__DEV__) {
    console.warn(`Development: ${message}`);
  }
};

// Initialize warning suppression
if (typeof window !== 'undefined') {
  suppressWarnings();
}
