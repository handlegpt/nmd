/**
 * 安全日志工具
 * 在生产环境中过滤敏感信息，防止数据泄露
 */

interface LogContext {
  [key: string]: any
}

interface SecureLogOptions {
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  context?: LogContext
  component?: string
}

// 敏感字段列表
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'key',
  'secret',
  'auth',
  'credential',
  'session',
  'cookie',
  'jwt',
  'api_key',
  'access_token',
  'refresh_token',
  'private_key',
  'client_secret',
  'database_password',
  'email_password',
  'admin_password',
  'user_password',
  'verification_code',
  'otp',
  'pin',
  'ssn',
  'credit_card',
  'bank_account',
  'phone_number',
  'address',
  'ip_address',
  'user_agent',
  'referer',
  'authorization',
  'x-api-key',
  'x-auth-token'
]

// 敏感值模式
const SENSITIVE_PATTERNS = [
  /^[A-Za-z0-9+/]{20,}={0,2}$/, // Base64编码的令牌
  /^[A-Za-z0-9]{32,}$/, // 长随机字符串
  /^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/, // 信用卡号
  /^\d{3}-\d{2}-\d{4}$/, // SSN
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // 邮箱地址
  /^\+?[\d\s-()]{10,}$/, // 电话号码
]

/**
 * 检查字段名是否敏感
 */
function isSensitiveField(fieldName: string): boolean {
  const lowerFieldName = fieldName.toLowerCase()
  return SENSITIVE_FIELDS.some(field => 
    lowerFieldName.includes(field) || 
    lowerFieldName.endsWith(field) ||
    lowerFieldName.startsWith(field)
  )
}

/**
 * 检查值是否敏感
 */
function isSensitiveValue(value: any): boolean {
  if (typeof value !== 'string') return false
  
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(value))
}

/**
 * 清理敏感信息
 */
function sanitizeValue(value: any, fieldName?: string): any {
  // 如果字段名敏感，直接屏蔽
  if (fieldName && isSensitiveField(fieldName)) {
    return '[REDACTED]'
  }
  
  // 如果值敏感，屏蔽
  if (isSensitiveValue(value)) {
    return '[REDACTED]'
  }
  
  // 如果是对象，递归清理
  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      return value.map(item => sanitizeValue(item))
    } else {
      const sanitized: any = {}
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val, key)
      }
      return sanitized
    }
  }
  
  return value
}

/**
 * 安全日志记录器
 */
class SecureLogger {
  private isProduction: boolean
  
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production'
  }
  
  /**
   * 记录信息日志
   */
  info(message: string, context?: LogContext, component?: string): void {
    this.log({ level: 'info', message, context, component })
  }
  
  /**
   * 记录警告日志
   */
  warn(message: string, context?: LogContext, component?: string): void {
    this.log({ level: 'warn', message, context, component })
  }
  
  /**
   * 记录错误日志
   */
  error(message: string, context?: LogContext, component?: string): void {
    this.log({ level: 'error', message, context, component })
  }
  
  /**
   * 记录调试日志
   */
  debug(message: string, context?: LogContext, component?: string): void {
    if (!this.isProduction) {
      this.log({ level: 'debug', message, context, component })
    }
  }
  
  /**
   * 核心日志方法
   */
  private log(options: SecureLogOptions): void {
    const { level, message, context, component } = options
    
    // 在生产环境中过滤敏感信息
    const sanitizedContext = this.isProduction 
      ? sanitizeValue(context) 
      : context
    
    // 构建日志对象
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      component: component || 'Unknown',
      context: sanitizedContext,
      environment: process.env.NODE_ENV
    }
    
    // 根据级别输出日志
    switch (level) {
      case 'error':
        console.error(`[${component || 'App'}] ${message}`, sanitizedContext)
        break
      case 'warn':
        console.warn(`[${component || 'App'}] ${message}`, sanitizedContext)
        break
      case 'debug':
        console.debug(`[${component || 'App'}] ${message}`, sanitizedContext)
        break
      default:
        console.log(`[${component || 'App'}] ${message}`, sanitizedContext)
    }
    
    // 在生产环境中，可以发送到外部日志服务
    if (this.isProduction && level === 'error') {
      this.sendToExternalLogger(logEntry)
    }
  }
  
  /**
   * 发送到外部日志服务（如Sentry、LogRocket等）
   */
  private sendToExternalLogger(logEntry: any): void {
    // 这里可以集成外部日志服务
    // 例如：Sentry.captureException, LogRocket.captureException 等
    try {
      // 示例：发送到外部服务
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logEntry)
      // })
    } catch (error) {
      // 避免日志记录本身出错
      console.error('Failed to send log to external service:', error)
    }
  }
}

// 创建全局实例
export const secureLogger = new SecureLogger()

// 兼容性导出
export const logInfo = (message: string, context?: LogContext, component?: string) => 
  secureLogger.info(message, context, component)

export const logWarn = (message: string, context?: LogContext, component?: string) => 
  secureLogger.warn(message, context, component)

export const logError = (message: string, context?: LogContext, component?: string) => 
  secureLogger.error(message, context, component)

export const logDebug = (message: string, context?: LogContext, component?: string) => 
  secureLogger.debug(message, context, component)

// 工具函数
export { sanitizeValue, isSensitiveField, isSensitiveValue }
export const sanitizeForLogging = sanitizeValue
