import { logInfo, logError } from './logger'

// 速率限制配置
export interface RateLimitConfig {
  windowMs: number // 时间窗口（毫秒）
  maxRequests: number // 最大请求数
  keyGenerator?: (identifier: string) => string // 自定义键生成器
  skipSuccessfulRequests?: boolean // 是否跳过成功请求
  skipFailedRequests?: boolean // 是否跳过失败请求
}

// 速率限制级别
export enum RateLimitLevel {
  STRICT = 'STRICT', // 严格限制（认证相关）
  NORMAL = 'NORMAL', // 正常限制（一般API）
  RELAXED = 'RELAXED', // 宽松限制（静态资源）
  NONE = 'NONE' // 无限制
}

// 速率限制存储接口
export interface RateLimitStore {
  get(key: string): Promise<{ count: number; resetTime: number } | null>
  set(key: string, data: { count: number; resetTime: number }): Promise<void>
  increment(key: string): Promise<{ count: number; resetTime: number }>
  reset(key: string): Promise<void>
  cleanup?(): void // 可选的清理方法
}

// 内存存储实现（开发环境）
class MemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>()

  async get(key: string) {
    return this.store.get(key) || null
  }

  async set(key: string, data: { count: number; resetTime: number }) {
    this.store.set(key, data)
  }

  async increment(key: string) {
    const now = Date.now()
    const current = this.store.get(key)
    
    if (!current || now > current.resetTime) {
      const newData = { count: 1, resetTime: now + 15 * 60 * 1000 } // 15分钟窗口
      this.store.set(key, newData)
      return newData
    }
    
    current.count++
    return current
  }

  async reset(key: string) {
    this.store.delete(key)
  }

  // 清理过期数据
  cleanup() {
    const now = Date.now()
    for (const [key, value] of this.store.entries()) {
      if (now > value.resetTime) {
        this.store.delete(key)
      }
    }
  }
}

// 速率限制器类
export class RateLimiter {
  private store: RateLimitStore
  private configs: Map<RateLimitLevel, RateLimitConfig>

  constructor(store?: RateLimitStore) {
    this.store = store || new MemoryRateLimitStore()
    this.configs = new Map([
      [RateLimitLevel.STRICT, {
        windowMs: 15 * 60 * 1000, // 15分钟
        maxRequests: 10, // 恢复生产配置：10次/15分钟
        skipSuccessfulRequests: false,
        skipFailedRequests: false
      }],
      [RateLimitLevel.NORMAL, {
        windowMs: 15 * 60 * 1000, // 15分钟
        maxRequests: 100,
        skipSuccessfulRequests: false,
        skipFailedRequests: false
      }],
      [RateLimitLevel.RELAXED, {
        windowMs: 15 * 60 * 1000, // 15分钟
        maxRequests: 1000,
        skipSuccessfulRequests: true,
        skipFailedRequests: false
      }],
      [RateLimitLevel.NONE, {
        windowMs: 0,
        maxRequests: 0,
        skipSuccessfulRequests: true,
        skipFailedRequests: true
      }]
    ])

    // 定期清理内存存储
    if (this.store instanceof MemoryRateLimitStore) {
      setInterval(() => {
        this.store.cleanup?.()
      }, 60 * 1000) // 每分钟清理一次
    }
  }

  // 检查速率限制
  async checkLimit(
    identifier: string,
    level: RateLimitLevel = RateLimitLevel.NORMAL
  ): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
    retryAfter?: number
  }> {
    const config = this.configs.get(level)
    if (!config || level === RateLimitLevel.NONE) {
      return {
        allowed: true,
        remaining: -1,
        resetTime: Date.now()
      }
    }

    try {
      const key = this.generateKey(identifier, level)
      const data = await this.store.increment(key)
      
      const remaining = Math.max(0, config.maxRequests - data.count)
      const allowed = data.count <= config.maxRequests
      const retryAfter = allowed ? undefined : Math.ceil((data.resetTime - Date.now()) / 1000)

      logInfo('Rate limit check', {
        identifier,
        level,
        count: data.count,
        maxRequests: config.maxRequests,
        allowed,
        remaining,
        retryAfter
      }, 'RateLimiter')

      return {
        allowed,
        remaining,
        resetTime: data.resetTime,
        retryAfter
      }
    } catch (error) {
      logError('Rate limit check failed', error, 'RateLimiter')
      // 出错时允许请求通过
      return {
        allowed: true,
        remaining: -1,
        resetTime: Date.now()
      }
    }
  }

  // 生成存储键
  private generateKey(identifier: string, level: RateLimitLevel): string {
    const now = Date.now()
    const windowMs = this.configs.get(level)?.windowMs || 15 * 60 * 1000
    const windowStart = Math.floor(now / windowMs) * windowMs
    return `rate_limit:${level}:${identifier}:${windowStart}`
  }

  // 重置限制
  async resetLimit(identifier: string, level: RateLimitLevel = RateLimitLevel.NORMAL) {
    const key = this.generateKey(identifier, level)
    await this.store.reset(key)
    logInfo('Rate limit reset', { identifier, level }, 'RateLimiter')
  }

  // 获取限制信息
  async getLimitInfo(
    identifier: string,
    level: RateLimitLevel = RateLimitLevel.NORMAL
  ): Promise<{
    count: number
    maxRequests: number
    remaining: number
    resetTime: number
  } | null> {
    const config = this.configs.get(level)
    if (!config || level === RateLimitLevel.NONE) {
      return null
    }

    try {
      const key = this.generateKey(identifier, level)
      const data = await this.store.get(key)
      
      if (!data) {
        return {
          count: 0,
          maxRequests: config.maxRequests,
          remaining: config.maxRequests,
          resetTime: Date.now()
        }
      }

      return {
        count: data.count,
        maxRequests: config.maxRequests,
        remaining: Math.max(0, config.maxRequests - data.count),
        resetTime: data.resetTime
      }
    } catch (error) {
      logError('Get rate limit info failed', error, 'RateLimiter')
      return null
    }
  }
}

// 全局速率限制器实例
export const rateLimiter = new RateLimiter()

// 根据路径确定速率限制级别
export function getRateLimitLevel(pathname: string): RateLimitLevel {
  // 认证相关API使用严格限制
  if (pathname.startsWith('/api/auth/')) {
    return RateLimitLevel.STRICT
  }
  
  // 数据修改API使用正常限制
  if (pathname.startsWith('/api/') && (
    pathname.includes('/create') ||
    pathname.includes('/update') ||
    pathname.includes('/delete') ||
    pathname.includes('/vote') ||
    pathname.includes('/review')
  )) {
    return RateLimitLevel.NORMAL
  }
  
  // 静态资源和健康检查使用宽松限制
  if (pathname.startsWith('/_next/') ||
      pathname.startsWith('/api/health') ||
      pathname.startsWith('/api/time') ||
      pathname.startsWith('/api/weather')) {
    return RateLimitLevel.RELAXED
  }
  
  // 默认使用正常限制
  return RateLimitLevel.NORMAL
}

// 生成客户端标识符
export function generateClientIdentifier(
  ip: string,
  userAgent: string,
  userId?: string
): string {
  if (userId) {
    return `user:${userId}`
  }
  
  // 使用简单的字符串组合，避免使用crypto模块
  const combined = `${ip}-${userAgent}`
  // 简单的哈希函数，避免使用Node.js crypto模块
  let hash = 0
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为32位整数
  }
  return `client:${Math.abs(hash).toString(16)}`
}
