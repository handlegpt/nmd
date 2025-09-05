import { NextRequest, NextResponse } from 'next/server'
import { logInfo, logError } from './logger'

// CORS配置接口
export interface CorsConfig {
  origin: string | string[] | ((origin: string) => boolean)
  methods?: string[]
  allowedHeaders?: string[]
  exposedHeaders?: string[]
  credentials?: boolean
  maxAge?: number
  preflightContinue?: boolean
}

// 默认CORS配置
const defaultCorsConfig: CorsConfig = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3011',
    'https://nomadnow.app',
    'https://www.nomadnow.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-Forwarded-For',
    'User-Agent'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining', 'X-Rate-Limit-Reset'],
  credentials: true,
  maxAge: 86400, // 24小时
  preflightContinue: false
}

// CORS处理器类
export class CorsHandler {
  private config: CorsConfig

  constructor(config: Partial<CorsConfig> = {}) {
    this.config = { ...defaultCorsConfig, ...config }
  }

  // 检查源是否允许
  private isOriginAllowed(origin: string): boolean {
    if (typeof this.config.origin === 'function') {
      return this.config.origin(origin)
    }

    if (typeof this.config.origin === 'string') {
      return origin === this.config.origin
    }

    if (Array.isArray(this.config.origin)) {
      return this.config.origin.includes(origin)
    }

    return false
  }

  // 处理CORS请求
  handle(request: NextRequest): NextResponse | null {
    const origin = request.headers.get('origin')
    const method = request.method

    // 记录CORS请求
    logInfo('CORS request', {
      origin,
      method,
      pathname: request.nextUrl.pathname,
      userAgent: request.headers.get('user-agent')
    }, 'CORS')

    // 检查源是否允许
    if (origin && !this.isOriginAllowed(origin)) {
      logError('CORS violation', {
        origin,
        method,
        pathname: request.nextUrl.pathname,
        allowedOrigins: this.config.origin
      }, 'CORS')

      return new NextResponse(
        JSON.stringify({ error: 'CORS policy violation' }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'null'
          }
        }
      )
    }

    // 处理预检请求
    if (method === 'OPTIONS') {
      return this.handlePreflight(request, origin)
    }

    // 为实际请求添加CORS头
    return this.addCorsHeaders(request, origin)
  }

  // 处理预检请求
  private handlePreflight(request: NextRequest, origin: string | null): NextResponse {
    const response = new NextResponse(null, { status: 200 })

    // 添加CORS头
    this.addCorsHeadersToResponse(response, origin)

    // 添加预检特定的头
    if (this.config.methods) {
      response.headers.set('Access-Control-Allow-Methods', this.config.methods.join(', '))
    }

    if (this.config.allowedHeaders) {
      response.headers.set('Access-Control-Allow-Headers', this.config.allowedHeaders.join(', '))
    }

    if (this.config.maxAge) {
      response.headers.set('Access-Control-Max-Age', this.config.maxAge.toString())
    }

    return response
  }

  // 为请求添加CORS头
  private addCorsHeaders(request: NextRequest, origin: string | null): NextResponse | null {
    // 这里返回null表示继续处理请求
    // 实际的CORS头会在中间件中添加
    return null
  }

  // 为响应添加CORS头
  addCorsHeadersToResponse(response: NextResponse, origin: string | null): void {
    if (origin && this.isOriginAllowed(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }

    if (this.config.credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }

    if (this.config.exposedHeaders) {
      response.headers.set('Access-Control-Expose-Headers', this.config.exposedHeaders.join(', '))
    }
  }

  // 创建CORS中间件
  static createMiddleware(config?: Partial<CorsConfig>) {
    const corsHandler = new CorsHandler(config)
    
    return (request: NextRequest) => {
      return corsHandler.handle(request)
    }
  }
}

// 环境特定的CORS配置
export function getCorsConfig(): CorsConfig {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  if (isDevelopment) {
    return {
      ...defaultCorsConfig,
      origin: [
        'http://localhost:3000',
        'http://localhost:3011',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3011'
      ]
    }
  }

  // 生产环境配置
  return {
    ...defaultCorsConfig,
    origin: [
      'https://nomadnow.app',
      'https://www.nomadnow.app'
    ],
    credentials: true
  }
}

// 全局CORS处理器实例
export const corsHandler = new CorsHandler(getCorsConfig())

// 简化的CORS检查函数
export function checkCors(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true // 同源请求
  
  return corsHandler['isOriginAllowed'](origin)
}

// 添加CORS头到响应
export function addCorsHeaders(response: NextResponse, request: NextRequest): void {
  const origin = request.headers.get('origin')
  corsHandler.addCorsHeadersToResponse(response, origin)
}
