/**
 * API Security Decorator
 * API安全装饰器，用于简化API端点的安全配置
 */

import { NextRequest, NextResponse } from 'next/server'
import { APISecurityMiddleware, APISecurityConfig, SECURITY_PRESETS } from './apiSecurity'
import { z } from 'zod'

// API处理器类型
type APIHandler = (
  request: NextRequest,
  context?: { params?: any; session?: any; validatedData?: any }
) => Promise<NextResponse> | NextResponse

// 安全配置选项
interface SecurityOptions extends Partial<APISecurityConfig> {
  // 输入验证模式
  schema?: z.ZodSchema
  
  // 自定义错误处理
  onError?: (error: Error, request: NextRequest) => NextResponse
  
  // 自定义成功处理
  onSuccess?: (response: NextResponse, request: NextRequest) => NextResponse
}

/**
 * 安全API装饰器
 */
export function secureAPI(options: SecurityOptions = {}) {
  return function (handler: APIHandler) {
    return async function (request: NextRequest, context?: { params?: any }) {
      try {
        // 创建安全中间件
        const securityConfig: APISecurityConfig = {
          ...SECURITY_PRESETS.PUBLIC, // 默认使用公开API配置
          ...options,
          inputValidation: {
            enabled: true,
            ...options.inputValidation,
            schema: options.schema
          },
          cors: {
            enabled: true,
            ...options.cors
          },
          securityHeaders: {
            enabled: true,
            ...options.securityHeaders
          }
        }
        
        const security = new APISecurityMiddleware(securityConfig)
        
        // 验证请求
        const validation = await security.validateRequest(request)
        
        if (!validation.allowed) {
          return validation.response || NextResponse.json(
            { error: 'Request not allowed' },
            { status: 403 }
          )
        }
        
        // 调用原始处理器
        const response = await handler(request, {
          ...context,
          session: validation.session,
          validatedData: validation.validatedData
        })
        
        // 处理响应
        return security.handleResponse(response, request)
        
      } catch (error) {
        // 自定义错误处理
        if (options.onError) {
          return options.onError(error as Error, request)
        }
        
        // 默认错误处理
        console.error('API Error:', error)
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        )
      }
    }
  }
}

/**
 * 公开API装饰器 - 无需认证
 */
export function publicAPI(schema?: z.ZodSchema) {
  return secureAPI({
    ...SECURITY_PRESETS.PUBLIC,
    schema
  })
}

/**
 * 用户API装饰器 - 需要用户认证
 */
export function userAPI(schema?: z.ZodSchema) {
  return secureAPI({
    ...SECURITY_PRESETS.USER,
    schema
  })
}

/**
 * 管理员API装饰器 - 需要管理员权限
 */
export function adminAPI(schema?: z.ZodSchema) {
  return secureAPI({
    ...SECURITY_PRESETS.ADMIN,
    schema
  })
}

/**
 * 严格API装饰器 - 高安全要求
 */
export function strictAPI(schema?: z.ZodSchema) {
  return secureAPI({
    ...SECURITY_PRESETS.STRICT,
    schema
  })
}

/**
 * 创建带验证的API处理器
 */
export function createValidatedAPI<T = any>(
  schema: z.ZodSchema<T>,
  handler: (data: T, request: NextRequest, context?: any) => Promise<NextResponse> | NextResponse,
  securityOptions: SecurityOptions = {}
) {
  return secureAPI({ ...securityOptions, schema })(async (request, context) => {
    return handler(context?.validatedData, request, context)
  })
}

/**
 * 创建CRUD API处理器
 */
export function createCRUDAPI<T = any>(
  schema: z.ZodSchema<T>,
  handlers: {
    GET?: (request: NextRequest, context?: any) => Promise<NextResponse> | NextResponse
    POST?: (data: T, request: NextRequest, context?: any) => Promise<NextResponse> | NextResponse
    PUT?: (data: T, request: NextRequest, context?: any) => Promise<NextResponse> | NextResponse
    DELETE?: (request: NextRequest, context?: any) => Promise<NextResponse> | NextResponse
  },
  securityOptions: SecurityOptions = {}
) {
  return secureAPI(securityOptions)(async (request, context) => {
    const method = request.method
    
    switch (method) {
      case 'GET':
        if (handlers.GET) {
          return handlers.GET(request, context)
        }
        break
        
      case 'POST':
        if (handlers.POST) {
          return handlers.POST(context?.validatedData, request, context)
        }
        break
        
      case 'PUT':
        if (handlers.PUT) {
          return handlers.PUT(context?.validatedData, request, context)
        }
        break
        
      case 'DELETE':
        if (handlers.DELETE) {
          return handlers.DELETE(request, context)
        }
        break
        
      default:
        return NextResponse.json(
          { error: `Method ${method} not allowed` },
          { status: 405 }
        )
    }
    
    return NextResponse.json(
      { error: `Method ${method} not implemented` },
      { status: 501 }
    )
  })
}

/**
 * 批量API处理器 - 处理多个端点
 */
export function createBatchAPI(
  endpoints: Record<string, {
    handler: APIHandler
    security?: SecurityOptions
  }>
) {
  return async function (request: NextRequest, context?: { params?: any }) {
    const url = new URL(request.url)
    const pathname = url.pathname
    
    // 查找匹配的端点
    for (const [pattern, config] of Object.entries(endpoints)) {
      if (pathname.includes(pattern)) {
        const security = new APISecurityMiddleware(config.security || SECURITY_PRESETS.PUBLIC)
        
        const validation = await security.validateRequest(request)
        if (!validation.allowed) {
          return validation.response || NextResponse.json(
            { error: 'Request not allowed' },
            { status: 403 }
          )
        }
        
        const response = await config.handler(request, {
          ...context,
          session: validation.session,
          validatedData: validation.validatedData
        })
        
        return security.handleResponse(response, request)
      }
    }
    
    return NextResponse.json(
      { error: 'Endpoint not found' },
      { status: 404 }
    )
  }
}

/**
 * 中间件组合器
 */
export function composeMiddleware(...middlewares: Array<(handler: APIHandler) => APIHandler>) {
  return function (handler: APIHandler) {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler)
  }
}

/**
 * 日志中间件
 */
export function withLogging(handler: APIHandler) {
  return async function (request: NextRequest, context?: any) {
    const start = Date.now()
    const method = request.method
    const url = request.url
    
    console.log(`[${method}] ${url} - Started`)
    
    try {
      const response = await handler(request, context)
      const duration = Date.now() - start
      
      console.log(`[${method}] ${url} - Completed in ${duration}ms (${response.status})`)
      
      return response
    } catch (error) {
      const duration = Date.now() - start
      console.error(`[${method}] ${url} - Failed in ${duration}ms:`, error)
      throw error
    }
  }
}

/**
 * 缓存中间件
 */
export function withCache(ttl: number = 300) {
  const cache = new Map<string, { data: NextResponse; expires: number }>()
  
  return function (handler: APIHandler) {
    return async function (request: NextRequest, context?: any) {
      // 只缓存GET请求
      if (request.method !== 'GET') {
        return handler(request, context)
      }
      
      const key = request.url
      const cached = cache.get(key)
      
      if (cached && cached.expires > Date.now()) {
        return cached.data
      }
      
      const response = await handler(request, context)
      
      // 只缓存成功的响应
      if (response.status === 200) {
        cache.set(key, {
          data: response,
          expires: Date.now() + ttl * 1000
        })
      }
      
      return response
    }
  }
}

// 导出类型
export type { APIHandler, SecurityOptions }
