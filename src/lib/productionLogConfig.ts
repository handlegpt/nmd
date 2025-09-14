/**
 * 生产环境日志配置
 * 用于控制生产环境中的日志输出级别和内容
 */

export interface ProductionLogConfig {
  // 是否启用详细日志
  enableVerboseLogging: boolean
  
  // 是否记录用户操作
  logUserActions: boolean
  
  // 是否记录API请求
  logApiRequests: boolean
  
  // 是否记录数据库操作
  logDatabaseOperations: boolean
  
  // 是否记录性能指标
  logPerformanceMetrics: boolean
  
  // 是否记录错误堆栈
  logErrorStack: boolean
  
  // 最大日志条目数（防止内存泄漏）
  maxLogEntries: number
  
  // 日志保留时间（小时）
  logRetentionHours: number
}

// 默认生产环境配置 - 安全优化版本
export const defaultProductionConfig: ProductionLogConfig = {
  enableVerboseLogging: false, // 生产环境禁用详细日志
  logUserActions: false, // 不记录用户操作，保护隐私
  logApiRequests: false, // 不记录API请求，避免敏感信息泄露
  logDatabaseOperations: false, // 不记录数据库操作
  logPerformanceMetrics: true, // 保留性能指标用于监控
  logErrorStack: true, // 保留错误堆栈用于调试
  maxLogEntries: 500, // 减少内存使用
  logRetentionHours: 12 // 缩短日志保留时间
}

// 开发环境配置
export const developmentConfig: ProductionLogConfig = {
  enableVerboseLogging: true,
  logUserActions: true,
  logApiRequests: true,
  logDatabaseOperations: true,
  logPerformanceMetrics: true,
  logErrorStack: true,
  maxLogEntries: 10000,
  logRetentionHours: 72
}

// 测试环境配置
export const testConfig: ProductionLogConfig = {
  enableVerboseLogging: false,
  logUserActions: false,
  logApiRequests: false,
  logDatabaseOperations: false,
  logPerformanceMetrics: false,
  logErrorStack: true,
  maxLogEntries: 100,
  logRetentionHours: 1
}

/**
 * 获取当前环境的日志配置
 */
export function getLogConfig(): ProductionLogConfig {
  const env = process.env.NODE_ENV || 'development'
  
  switch (env) {
    case 'production':
      return defaultProductionConfig
    case 'test':
      return testConfig
    case 'development':
    default:
      return developmentConfig
  }
}

/**
 * 检查是否应该记录特定类型的日志
 */
export function shouldLog(type: keyof ProductionLogConfig): boolean {
  const config = getLogConfig()
  return config[type] as boolean
}

/**
 * 生产环境日志过滤器
 */
export class ProductionLogFilter {
  private config: ProductionLogConfig
  private logBuffer: Array<{ timestamp: Date; message: string; data?: any }> = []
  
  constructor() {
    this.config = getLogConfig()
  }
  
  /**
   * 过滤日志消息
   */
  filterLog(level: string, message: string, data?: any): boolean {
    // 在生产环境中，只记录错误和警告
    if (this.config.enableVerboseLogging) {
      return true
    }
    
    // 根据日志级别过滤
    if (level === 'error' || level === 'warn') {
      return true
    }
    
    // 根据配置过滤特定类型的日志
    if (level === 'info') {
      if (message.includes('API Request') && !this.config.logApiRequests) {
        return false
      }
      if (message.includes('User Action') && !this.config.logUserActions) {
        return false
      }
      if (message.includes('Database') && !this.config.logDatabaseOperations) {
        return false
      }
      if (message.includes('Performance') && !this.config.logPerformanceMetrics) {
        return false
      }
    }
    
    return false
  }
  
  /**
   * 清理过期的日志条目
   */
  cleanupOldLogs(): void {
    const cutoffTime = new Date(Date.now() - this.config.logRetentionHours * 60 * 60 * 1000)
    
    this.logBuffer = this.logBuffer.filter(entry => entry.timestamp > cutoffTime)
    
    // 限制日志条目数量
    if (this.logBuffer.length > this.config.maxLogEntries) {
      this.logBuffer = this.logBuffer.slice(-this.config.maxLogEntries)
    }
  }
  
  /**
   * 添加日志条目到缓冲区
   */
  addToBuffer(message: string, data?: any): void {
    this.logBuffer.push({
      timestamp: new Date(),
      message,
      data
    })
    
    // 定期清理
    if (this.logBuffer.length % 100 === 0) {
      this.cleanupOldLogs()
    }
  }
  
  /**
   * 获取日志统计信息
   */
  getLogStats(): {
    totalEntries: number
    oldestEntry: Date | null
    newestEntry: Date | null
    memoryUsage: number
  } {
    const totalEntries = this.logBuffer.length
    const oldestEntry = totalEntries > 0 ? this.logBuffer[0].timestamp : null
    const newestEntry = totalEntries > 0 ? this.logBuffer[totalEntries - 1].timestamp : null
    const memoryUsage = JSON.stringify(this.logBuffer).length
    
    return {
      totalEntries,
      oldestEntry,
      newestEntry,
      memoryUsage
    }
  }
}

// 创建全局日志过滤器实例
export const logFilter = new ProductionLogFilter()
