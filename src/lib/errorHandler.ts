import { NextResponse } from 'next/server'
import { logError } from './logger'

// 错误类型定义
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  INTERNAL = 'INTERNAL',
  EXTERNAL_API = 'EXTERNAL_API',
  DATABASE = 'DATABASE'
}

// 错误响应接口
export interface ErrorResponse {
  success: false
  error: {
    type: ErrorType
    message: string
    code?: string
    details?: any
  }
  timestamp: string
  requestId?: string
}

// 成功响应接口
export interface SuccessResponse<T = any> {
  success: true
  data: T
  timestamp: string
  requestId?: string
}

// 创建错误响应
export function createErrorResponse(
  type: ErrorType,
  message: string,
  code?: string,
  details?: any,
  requestId?: string
): ErrorResponse {
  return {
    success: false,
    error: {
      type,
      message,
      code,
      details
    },
    timestamp: new Date().toISOString(),
    requestId
  }
}

// 创建成功响应
export function createSuccessResponse<T>(
  data: T,
  requestId?: string
): SuccessResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId
  }
}

// 获取HTTP状态码
export function getHttpStatus(errorType: ErrorType): number {
  switch (errorType) {
    case ErrorType.VALIDATION:
      return 400
    case ErrorType.AUTHENTICATION:
      return 401
    case ErrorType.AUTHORIZATION:
      return 403
    case ErrorType.NOT_FOUND:
      return 404
    case ErrorType.RATE_LIMIT:
      return 429
    case ErrorType.EXTERNAL_API:
      return 502
    case ErrorType.DATABASE:
      return 503
    case ErrorType.INTERNAL:
    default:
      return 500
  }
}

// 安全错误处理函数
export function handleError(
  error: any,
  context: string,
  requestId?: string
): NextResponse {
  let errorType = ErrorType.INTERNAL
  let message = 'An unexpected error occurred'
  let code: string | undefined
  let details: any = undefined

  // 根据错误类型分类
  if (error instanceof Error) {
    if (error.name === 'ValidationError' || error.message.includes('validation')) {
      errorType = ErrorType.VALIDATION
      message = 'Invalid input data'
      details = error.message
    } else if (error.name === 'AuthenticationError' || error.message.includes('auth')) {
      errorType = ErrorType.AUTHENTICATION
      message = 'Authentication failed'
    } else if (error.name === 'AuthorizationError' || error.message.includes('permission')) {
      errorType = ErrorType.AUTHORIZATION
      message = 'Access denied'
    } else if (error.name === 'NotFoundError' || error.message.includes('not found')) {
      errorType = ErrorType.NOT_FOUND
      message = 'Resource not found'
    } else if (error.name === 'RateLimitError' || error.message.includes('rate limit')) {
      errorType = ErrorType.RATE_LIMIT
      message = 'Rate limit exceeded'
    } else if (error.name === 'DatabaseError' || error.message.includes('database')) {
      errorType = ErrorType.DATABASE
      message = 'Database operation failed'
    } else if (error.name === 'ExternalAPIError' || error.message.includes('external')) {
      errorType = ErrorType.EXTERNAL_API
      message = 'External service unavailable'
    } else {
      // 生产环境不暴露具体错误信息
      if (process.env.NODE_ENV === 'production') {
        message = 'Internal server error'
      } else {
        message = error.message
        details = error.stack
      }
    }
  } else if (typeof error === 'string') {
    message = error
  } else if (error && typeof error === 'object') {
    message = error.message || 'Unknown error'
    code = error.code
    details = error.details
  }

  // 记录错误
  logError(`Error in ${context}`, {
    error: error instanceof Error ? error.message : error,
    type: errorType,
    requestId,
    stack: error instanceof Error ? error.stack : undefined
  }, context)

  // 创建错误响应
  const errorResponse = createErrorResponse(errorType, message, code, details, requestId)
  const status = getHttpStatus(errorType)

  return NextResponse.json(errorResponse, { status })
}

// API错误处理装饰器
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  context: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args)
    } catch (error) {
      throw new Error(`Error in ${context}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// 验证错误处理
export function handleValidationError(
  errors: string[],
  requestId?: string
): NextResponse {
  const errorResponse = createErrorResponse(
    ErrorType.VALIDATION,
    'Validation failed',
    'VALIDATION_ERROR',
    { errors },
    requestId
  )
  
  return NextResponse.json(errorResponse, { status: 400 })
}

// 认证错误处理
export function handleAuthError(
  message: string = 'Authentication required',
  requestId?: string
): NextResponse {
  const errorResponse = createErrorResponse(
    ErrorType.AUTHENTICATION,
    message,
    'AUTH_ERROR',
    undefined,
    requestId
  )
  
  return NextResponse.json(errorResponse, { status: 401 })
}

// 授权错误处理
export function handleAuthzError(
  message: string = 'Access denied',
  requestId?: string
): NextResponse {
  const errorResponse = createErrorResponse(
    ErrorType.AUTHORIZATION,
    message,
    'AUTHZ_ERROR',
    undefined,
    requestId
  )
  
  return NextResponse.json(errorResponse, { status: 403 })
}

// 速率限制错误处理
export function handleRateLimitError(
  retryAfter?: number,
  requestId?: string
): NextResponse {
  const errorResponse = createErrorResponse(
    ErrorType.RATE_LIMIT,
    'Rate limit exceeded. Please try again later.',
    'RATE_LIMIT_ERROR',
    { retryAfter },
    requestId
  )
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  
  if (retryAfter) {
    headers['Retry-After'] = retryAfter.toString()
  }
  
  return NextResponse.json(errorResponse, { status: 429, headers })
}

// 生成请求ID
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
