// Unified logging system for production optimization
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;
  private isProduction: boolean;

  private constructor() {
    this.isProduction = !__DEV__;
    this.logLevel = this.isProduction ? LogLevel.ERROR : LogLevel.DEBUG;
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  error(message: string, ...args: any[]): void {
    if (this.logLevel >= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.logLevel >= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.logLevel >= LogLevel.INFO) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.logLevel >= LogLevel.DEBUG && !this.isProduction) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  // Performance logging
  performance(metric: string, value: number, unit: string = 'ms'): void {
    if (this.logLevel >= LogLevel.INFO) {
      console.info(`[PERF] ${metric}: ${value}${unit}`);
    }
  }

  // Navigation logging (only in development)
  navigation(action: string, route: string, params?: any): void {
    if (!this.isProduction && this.logLevel >= LogLevel.DEBUG) {
      console.log(`[NAV] ${action} -> ${route}`, params);
    }
  }

  // API logging
  api(method: string, url: string, status?: number, duration?: number): void {
    if (this.logLevel >= LogLevel.INFO) {
      const statusText = status ? ` (${status})` : '';
      const durationText = duration ? ` - ${duration}ms` : '';
      console.info(`[API] ${method} ${url}${statusText}${durationText}`);
    }
  }

  // Error tracking
  trackError(error: Error, context?: string): void {
    this.error(`[${context || 'App'}] ${error.message}`, error.stack);
    
    // In production, you might want to send this to an error tracking service
    if (this.isProduction) {
      // TODO: Send to error tracking service (e.g., Sentry, Bugsnag)
    }
  }

  // User action tracking
  trackUserAction(action: string, data?: any): void {
    if (this.logLevel >= LogLevel.INFO) {
      console.info(`[USER] ${action}`, data);
    }
  }
}

export const logger = Logger.getInstance();

// Convenience functions
export const logError = (message: string, ...args: any[]) => logger.error(message, ...args);
export const logWarn = (message: string, ...args: any[]) => logger.warn(message, ...args);
export const logInfo = (message: string, ...args: any[]) => logger.info(message, ...args);
export const logDebug = (message: string, ...args: any[]) => logger.debug(message, ...args);
export const logPerformance = (metric: string, value: number, unit?: string) => logger.performance(metric, value, unit);
export const logNavigation = (action: string, route: string, params?: any) => logger.navigation(action, route, params);
export const logApi = (method: string, url: string, status?: number, duration?: number) => logger.api(method, url, status, duration);
export const trackError = (error: Error, context?: string) => logger.trackError(error, context);
export const trackUserAction = (action: string, data?: any) => logger.trackUserAction(action, data);
