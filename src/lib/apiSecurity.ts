/**
 * API Security System
 * 统一API安全验证系统，提供认证、授权、速率限制、输入验证等功能
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { enhancedLogger } from './enhancedSecureLogger'

// API安全配置接口
interface APISecurityConfig {
  // 认证配置
  requireAuth: boolean
  allowedRoles?: string[]
  
  // 速率限制配置
  rateLimit: {
    enabled: boolean
    maxRequests: number
    windowMs: number
  }
  
  // 输入验证配置
  inputValidation: {
    enabled: boolean
    schema?: z.ZodSchema
    maxBodySize?: number
  }
  
  // CORS配置
  cors: {
    enabled: boolean
    allowedOrigins?: string[]
    allowedMethods?: string[]
    allowedHeaders?: string[]
  }
  
  // 安全头配置
  securityHeaders: {
    enabled: boolean
    hsts?: boolean
    xssProtection?: boolean
    contentTypeOptions?: boolean
    frameOptions?: boolean
  }
}

// 默认安全配置
const DEFAULT_SECURITY_CONFIG: APISecurityConfig = {
  requireAuth: false,
  rateLimit: {
    enabled: true,
    maxRequests: 100,
    windowMs: 15 * 60 * 1000 // 15分钟
  },
  inputValidation: {
    enabled: true,
    maxBodySize: 1024 * 1024 // 1MB
  },
  cors: {
    enabled: true,
    allowedOrigins: ['http://localhost:3000', 'https://nomad.now'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },
  securityHeaders: {
    enabled: true,
    hsts: true,
    xssProtection: true,
    contentTypeOptions: true,
    frameOptions: true
  }
}

// 速率限制存储
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// 用户会话接口
interface UserSession {
  userId: string
  email: string
  role: string
  permissions: string[]
  expiresAt: number
}

/**
 * API安全中间件类
 */
export class APISecurityMiddleware {
  private config: APISecurityConfig

  constructor(config: Partial<APISecurityConfig> = {}) {
    this.config = { ...DEFAULT_SECURITY_CONFIG, ...config }
  }

  /**
   * 获取客户端IP地址
   */
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const remoteAddr = request.headers.get('x-remote-addr')
    
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    if (realIP) {
      return realIP
    }
    if (remoteAddr) {
      return remoteAddr
    }
    
    return 'unknown'
  }

  /**
   * 生成速率限制键
   */
  private getRateLimitKey(request: NextRequest): string {
    const ip = this.getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'
    return `${ip}:${userAgent.substring(0, 50)}`
  }

  /**
   * 检查速率限制
   */
  private checkRateLimit(request: NextRequest): { allowed: boolean; remaining: number; resetTime: number } {
    if (!this.config.rateLimit.enabled) {
      return { allowed: true, remaining: Infinity, resetTime: 0 }
    }

    const key = this.getRateLimitKey(request)
    const now = Date.now()
    const windowMs = this.config.rateLimit.windowMs
    const maxRequests = this.config.rateLimit.maxRequests

    const current = rateLimitStore.get(key)
    
    if (!current || now > current.resetTime) {
      // 新的时间窗口
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      })
      
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs
      }
    }

    if (current.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime
      }
    }

    // 增加计数
    current.count++
    rateLimitStore.set(key, current)

    return {
      allowed: true,
      remaining: maxRequests - current.count,
      resetTime: current.resetTime
    }
  }

  /**
   * 验证用户认证
   */
  private async validateAuth(request: NextRequest): Promise<UserSession | null> {
    if (!this.config.requireAuth) {
      return null
    }

    try {
      const authHeader = request.headers.get('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null
      }

      const token = authHeader.substring(7)
      
      // 这里应该验证JWT令牌
      // 为了演示，我们创建一个模拟的会话
      const session: UserSession = {
        userId: 'user_123',
        email: 'user@example.com',
        role: 'user',
        permissions: ['read', 'write'],
        expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24小时
      }

      // 检查角色权限
      if (this.config.allowedRoles && !this.config.allowedRoles.includes(session.role)) {
        return null
      }

      return session
    } catch (error) {
      enhancedLogger.error('Auth validation failed', { error }, 'APISecurity')
      return null
    }
  }

  /**
   * 验证输入数据
   */
  private async validateInput(request: NextRequest): Promise<{ valid: boolean; data?: any; error?: string }> {
    if (!this.config.inputValidation.enabled) {
      return { valid: true }
    }

    try {
      // 检查请求体大小
      const contentLength = request.headers.get('content-length')
      if (contentLength && this.config.inputValidation.maxBodySize) {
        const size = parseInt(contentLength)
        if (size > this.config.inputValidation.maxBodySize) {
          return {
            valid: false,
            error: `Request body too large. Maximum size: ${this.config.inputValidation.maxBodySize} bytes`
          }
        }
      }

      // 如果有验证模式，验证请求体
      if (this.config.inputValidation.schema) {
        const body = await request.json()
        const result = this.config.inputValidation.schema.safeParse(body)
        
        if (!result.success) {
          return {
            valid: false,
            error: `Validation failed: ${result.error.errors.map(e => e.message).join(', ')}`
          }
        }

        return { valid: true, data: result.data }
      }

      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid request body'
      }
    }
  }

  /**
   * 设置安全头
   */
  private setSecurityHeaders(response: NextResponse): NextResponse {
    if (!this.config.securityHeaders.enabled) {
      return response
    }

    const headers = response.headers

    if (this.config.securityHeaders.hsts) {
      headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    }

    if (this.config.securityHeaders.xssProtection) {
      headers.set('X-XSS-Protection', '1; mode=block')
    }

    if (this.config.securityHeaders.contentTypeOptions) {
      headers.set('X-Content-Type-Options', 'nosniff')
    }

    if (this.config.securityHeaders.frameOptions) {
      headers.set('X-Frame-Options', 'DENY')
    }

    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

    return response
  }

  /**
   * 设置CORS头
   */
  private setCORSHeaders(response: NextResponse, request: NextRequest): NextResponse {
    if (!this.config.cors.enabled) {
      return response
    }

    const origin = request.headers.get('origin')
    const headers = response.headers

    if (origin && this.config.cors.allowedOrigins?.includes(origin)) {
      headers.set('Access-Control-Allow-Origin', origin)
    }

    if (this.config.cors.allowedMethods) {
      headers.set('Access-Control-Allow-Methods', this.config.cors.allowedMethods.join(', '))
    }

    if (this.config.cors.allowedHeaders) {
      headers.set('Access-Control-Allow-Headers', this.config.cors.allowedHeaders.join(', '))
    }

    headers.set('Access-Control-Allow-Credentials', 'true')
    headers.set('Access-Control-Max-Age', '86400')

    return response
  }

  /**
   * 记录安全事件
   */
  private logSecurityEvent(
    event: string,
    request: NextRequest,
    details: any = {}
  ): void {
    enhancedLogger.warn(`Security Event: ${event}`, {
      ip: this.getClientIP(request),
      userAgent: request.headers.get('user-agent'),
      url: request.url,
      method: request.method,
      ...details
    }, 'APISecurity')
  }

  /**
   * 主要的安全验证方法
   */
  async validateRequest(request: NextRequest): Promise<{
    allowed: boolean
    response?: NextResponse
    session?: UserSession | null
    validatedData?: any
  }> {
    try {
      // 1. 速率限制检查
      const rateLimit = this.checkRateLimit(request)
      if (!rateLimit.allowed) {
        this.logSecurityEvent('Rate limit exceeded', request, {
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime
        })

        const response = NextResponse.json(
          { error: 'Rate limit exceeded', retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000) },
          { status: 429 }
        )

        response.headers.set('X-RateLimit-Limit', this.config.rateLimit.maxRequests.toString())
        response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())
        response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString())

        return { allowed: false, response }
      }

      // 2. 认证检查
      const session = await this.validateAuth(request)
      if (this.config.requireAuth && !session) {
        this.logSecurityEvent('Authentication failed', request)
        return {
          allowed: false,
          response: NextResponse.json({ error: 'Authentication required' }, { status: 401 })
        }
      }

      // 3. 输入验证
      const inputValidation = await this.validateInput(request)
      if (!inputValidation.valid) {
        this.logSecurityEvent('Input validation failed', request, {
          error: inputValidation.error
        })
        return {
          allowed: false,
          response: NextResponse.json({ error: inputValidation.error }, { status: 400 })
        }
      }

      // 4. 记录成功的请求
      enhancedLogger.info('API request validated', {
        ip: this.getClientIP(request),
        method: request.method,
        url: request.url,
        userId: session?.userId
      }, 'APISecurity')

      return {
        allowed: true,
        session,
        validatedData: inputValidation.data
      }
    } catch (error) {
      enhancedLogger.error('Security validation error', { error }, 'APISecurity')
      return {
        allowed: false,
        response: NextResponse.json({ error: 'Internal server error' }, { status: 500 })
      }
    }
  }

  /**
   * 处理响应
   */
  handleResponse(response: NextResponse, request: NextRequest): NextResponse {
    // 设置安全头
    let secureResponse = this.setSecurityHeaders(response)
    
    // 设置CORS头
    secureResponse = this.setCORSHeaders(secureResponse, request)

    return secureResponse
  }
}

// 预定义的安全配置
export const SECURITY_PRESETS = {
  // 公开API - 无需认证，有速率限制
  PUBLIC: {
    requireAuth: false,
    rateLimit: { enabled: true, maxRequests: 100, windowMs: 15 * 60 * 1000 }
  },
  
  // 用户API - 需要认证，中等速率限制
  USER: {
    requireAuth: true,
    allowedRoles: ['user', 'admin'],
    rateLimit: { enabled: true, maxRequests: 200, windowMs: 15 * 60 * 1000 }
  },
  
  // 管理员API - 需要管理员权限，高速率限制
  ADMIN: {
    requireAuth: true,
    allowedRoles: ['admin'],
    rateLimit: { enabled: true, maxRequests: 500, windowMs: 15 * 60 * 1000 }
  },
  
  // 严格API - 高安全要求
  STRICT: {
    requireAuth: true,
    rateLimit: { enabled: true, maxRequests: 50, windowMs: 15 * 60 * 1000 },
    inputValidation: { enabled: true, maxBodySize: 512 * 1024 } // 512KB
  }
}

// 便捷函数
export const createSecureAPI = (config: Partial<APISecurityConfig> = {}) => {
  return new APISecurityMiddleware(config)
}

export const createPublicAPI = () => createSecureAPI(SECURITY_PRESETS.PUBLIC)
export const createUserAPI = () => createSecureAPI(SECURITY_PRESETS.USER)
export const createAdminAPI = () => createSecureAPI(SECURITY_PRESETS.ADMIN)
export const createStrictAPI = () => createSecureAPI(SECURITY_PRESETS.STRICT)

// 导出类型
export type { APISecurityConfig, UserSession }
