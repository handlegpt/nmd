type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  data?: any
  timestamp: string
  context?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  private formatMessage(level: LogLevel, message: string, data?: any, context?: string): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? `[${context}]` : ''
    return `${timestamp} ${level.toUpperCase()} ${contextStr} ${message}`
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) {
      return true // 开发环境记录所有日志
    }
    
    if (this.isProduction) {
      // 生产环境只记录warn和error
      return level === 'warn' || level === 'error'
    }
    
    return false
  }

  private log(level: LogLevel, message: string, data?: any, context?: string) {
    if (!this.shouldLog(level)) return

    const formattedMessage = this.formatMessage(level, message, data, context)
    
    switch (level) {
      case 'debug':
        if (this.isDevelopment) {
          console.log(formattedMessage, data || '')
        }
        break
      case 'info':
        if (this.isDevelopment) {
          console.info(formattedMessage, data || '')
        }
        break
      case 'warn':
        console.warn(formattedMessage, data || '')
        break
      case 'error':
        console.error(formattedMessage, data || '')
        // 在生产环境中，这里可以发送错误到错误追踪服务
        if (this.isProduction) {
          this.sendToErrorTracking(level, message, data, context)
        }
        break
    }
  }

  private sendToErrorTracking(level: LogLevel, message: string, data?: any, context?: string) {
    // TODO: 集成错误追踪服务（如Sentry）
    const logEntry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      context
    }
    
    // 这里可以发送到错误追踪服务
    // 例如：Sentry.captureException(new Error(message), { extra: logEntry })
  }

  debug(message: string, data?: any, context?: string) {
    this.log('debug', message, data, context)
  }

  info(message: string, data?: any, context?: string) {
    this.log('info', message, data, context)
  }

  warn(message: string, data?: any, context?: string) {
    this.log('warn', message, data, context)
  }

  error(message: string, data?: any, context?: string) {
    this.log('error', message, data, context)
  }
}

// 创建全局logger实例
export const logger = new Logger()

// 导出便捷方法
export const logDebug = (message: string, data?: any, context?: string) => logger.debug(message, data, context)
export const logInfo = (message: string, data?: any, context?: string) => logger.info(message, data, context)
export const logWarn = (message: string, data?: any, context?: string) => logger.warn(message, data, context)
export const logError = (message: string, data?: any, context?: string) => logger.error(message, data, context)
