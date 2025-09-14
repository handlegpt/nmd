/**
 * Enhanced Secure Logger
 * 增强的安全日志记录器，提供更全面的敏感信息过滤和日志管理
 */

import { secureLogger, sanitizeValue } from './secureLogger'
import { getLogConfig, shouldLog, logFilter } from './productionLogConfig'

interface LogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  component: string
  context?: any
  stackTrace?: string
  userId?: string
  sessionId?: string
  requestId?: string
}

interface LogMetrics {
  totalLogs: number
  errorCount: number
  warningCount: number
  infoCount: number
  debugCount: number
  lastLogTime: Date | null
  averageLogSize: number
}

/**
 * Enhanced Secure Logger Class
 */
export class EnhancedSecureLogger {
  private logBuffer: LogEntry[] = []
  private metrics: LogMetrics = {
    totalLogs: 0,
    errorCount: 0,
    warningCount: 0,
    infoCount: 0,
    debugCount: 0,
    lastLogTime: null,
    averageLogSize: 0
  }
  private isProduction: boolean
  private config = getLogConfig()

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production'
    this.initializeLogger()
  }

  /**
   * Initialize logger with environment-specific settings
   */
  private initializeLogger(): void {
    // Override console methods in production
    if (this.isProduction) {
      this.overrideConsoleMethods()
    }
  }

  /**
   * Override console methods to use secure logging
   */
  private overrideConsoleMethods(): void {
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug
    }

    // Override console.log
    console.log = (...args: any[]) => {
      if (this.shouldLogMessage('info', args)) {
        this.log('info', this.formatConsoleArgs(args), 'Console')
      }
    }

    // Override console.error
    console.error = (...args: any[]) => {
      if (this.shouldLogMessage('error', args)) {
        this.log('error', this.formatConsoleArgs(args), 'Console')
      }
    }

    // Override console.warn
    console.warn = (...args: any[]) => {
      if (this.shouldLogMessage('warn', args)) {
        this.log('warn', this.formatConsoleArgs(args), 'Console')
      }
    }

    // Override console.info
    console.info = (...args: any[]) => {
      if (this.shouldLogMessage('info', args)) {
        this.log('info', this.formatConsoleArgs(args), 'Console')
      }
    }

    // Override console.debug
    console.debug = (...args: any[]) => {
      if (this.shouldLogMessage('debug', args)) {
        this.log('debug', this.formatConsoleArgs(args), 'Console')
      }
    }
  }

  /**
   * Check if message should be logged based on configuration
   */
  private shouldLogMessage(level: string, args: any[]): boolean {
    // Always log errors and warnings
    if (level === 'error' || level === 'warn') {
      return true
    }

    // Check if verbose logging is enabled
    if (!this.config.enableVerboseLogging && level === 'debug') {
      return false
    }

    // Filter based on message content
    const message = this.formatConsoleArgs(args)
    return logFilter.filterLog(level, message, args)
  }

  /**
   * Format console arguments into a readable string
   */
  private formatConsoleArgs(args: any[]): string {
    return args.map(arg => {
      if (typeof arg === 'object') {
        return JSON.stringify(sanitizeValue(arg))
      }
      return String(arg)
    }).join(' ')
  }

  /**
   * Core logging method
   */
  private log(level: 'info' | 'warn' | 'error' | 'debug', message: string, component: string, context?: any): void {
    const logEntry: LogEntry = {
      id: this.generateLogId(),
      timestamp: new Date(),
      level,
      message: this.sanitizeMessage(message),
      component,
      context: context ? sanitizeValue(context) : undefined,
      stackTrace: level === 'error' ? this.getStackTrace() : undefined
    }

    // Add to buffer
    this.addToBuffer(logEntry)

    // Update metrics
    this.updateMetrics(logEntry)

    // Use original secure logger
    secureLogger[level](message, context, component)

    // Send to external services if needed
    if (this.isProduction && level === 'error') {
      this.sendToExternalServices(logEntry)
    }
  }

  /**
   * Sanitize log message
   */
  private sanitizeMessage(message: string): string {
    // Remove potential sensitive patterns
    let sanitized = message

    // Remove API keys
    sanitized = sanitized.replace(/[A-Za-z0-9]{32,}/g, '[API_KEY]')
    
    // Remove email addresses
    sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
    
    // Remove phone numbers
    sanitized = sanitized.replace(/\+?[\d\s-()]{10,}/g, '[PHONE]')
    
    // Remove credit card numbers
    sanitized = sanitized.replace(/\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/g, '[CARD]')

    return sanitized
  }

  /**
   * Generate unique log ID
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get stack trace for errors
   */
  private getStackTrace(): string {
    const stack = new Error().stack
    return stack ? stack.split('\n').slice(2, 10).join('\n') : ''
  }

  /**
   * Add log entry to buffer
   */
  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry)
    
    // Maintain buffer size
    if (this.logBuffer.length > this.config.maxLogEntries) {
      this.logBuffer = this.logBuffer.slice(-this.config.maxLogEntries)
    }
  }

  /**
   * Update log metrics
   */
  private updateMetrics(entry: LogEntry): void {
    this.metrics.totalLogs++
    this.metrics.lastLogTime = entry.timestamp
    
    switch (entry.level) {
      case 'error':
        this.metrics.errorCount++
        break
      case 'warn':
        this.metrics.warningCount++
        break
      case 'info':
        this.metrics.infoCount++
        break
      case 'debug':
        this.metrics.debugCount++
        break
    }

    // Update average log size
    const totalSize = this.logBuffer.reduce((sum, log) => 
      sum + JSON.stringify(log).length, 0)
    this.metrics.averageLogSize = totalSize / this.logBuffer.length
  }

  /**
   * Send to external logging services
   */
  private sendToExternalServices(entry: LogEntry): void {
    try {
      // Send to external service (e.g., Sentry, LogRocket, etc.)
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.captureException(new Error(entry.message), {
          tags: {
            component: entry.component,
            level: entry.level
          },
          extra: entry.context
        })
      }
    } catch (error) {
      // Avoid infinite logging loops
      console.error('Failed to send log to external service:', error)
    }
  }

  /**
   * Public logging methods
   */
  info(message: string, context?: any, component: string = 'App'): void {
    this.log('info', message, component, context)
  }

  warn(message: string, context?: any, component: string = 'App'): void {
    this.log('warn', message, component, context)
  }

  error(message: string, context?: any, component: string = 'App'): void {
    this.log('error', message, component, context)
  }

  debug(message: string, context?: any, component: string = 'App'): void {
    if (!this.isProduction || this.config.enableVerboseLogging) {
      this.log('debug', message, component, context)
    }
  }

  /**
   * Get log metrics
   */
  getMetrics(): LogMetrics {
    return { ...this.metrics }
  }

  /**
   * Get recent logs
   */
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logBuffer.slice(-count)
  }

  /**
   * Clear log buffer
   */
  clearLogs(): void {
    this.logBuffer = []
    this.metrics = {
      totalLogs: 0,
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      debugCount: 0,
      lastLogTime: null,
      averageLogSize: 0
    }
  }

  /**
   * Export logs for analysis
   */
  exportLogs(): string {
    return JSON.stringify({
      metrics: this.metrics,
      logs: this.logBuffer,
      exportTime: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }, null, 2)
  }
}

// Create global instance
export const enhancedLogger = new EnhancedSecureLogger()

// Export convenience functions
export const logInfo = (message: string, context?: any, component?: string) => 
  enhancedLogger.info(message, context, component)

export const logWarn = (message: string, context?: any, component?: string) => 
  enhancedLogger.warn(message, context, component)

export const logError = (message: string, context?: any, component?: string) => 
  enhancedLogger.error(message, context, component)

export const logDebug = (message: string, context?: any, component?: string) => 
  enhancedLogger.debug(message, context, component)

// Export the class for custom instances
export { EnhancedSecureLogger as SecureLoggerClass }
