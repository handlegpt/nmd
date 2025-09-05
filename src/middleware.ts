import { NextRequest, NextResponse } from 'next/server'
import { logInfo, logError } from '@/lib/logger'
import { rateLimiter, getRateLimitLevel, generateClientIdentifier } from '@/lib/rateLimiter'
import { corsHandler, addCorsHeaders } from '@/lib/cors'

// 安全头配置
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
]

// 内容安全策略
const cspHeader = {
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://fonts.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openweathermap.org https://worldtimeapi.org https://ip-api.com https://api.ipapi.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; ')
}

// 获取客户端标识符
function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  return generateClientIdentifier(ip, userAgent)
}

// 主中间件函数
export async function middleware(request: NextRequest) {
  const startTime = Date.now()
  const pathname = request.nextUrl.pathname
  
  try {
    // 记录请求
    logInfo('Middleware processing request', {
      pathname,
      method: request.method,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for')
    }, 'Middleware')

    // 1. CORS检查
    const corsResult = corsHandler.handle(request)
    if (corsResult) {
      return corsResult
    }

    // 2. 速率限制检查
    const clientId = getClientIdentifier(request)
    const rateLimitLevel = getRateLimitLevel(pathname)
    const rateLimitResult = await rateLimiter.checkLimit(clientId, rateLimitLevel)
    
    if (!rateLimitResult.allowed) {
      logError('Rate limit exceeded', {
        clientId,
        pathname,
        level: rateLimitLevel,
        retryAfter: rateLimitResult.retryAfter
      }, 'Middleware')
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Rate-Limit-Remaining': '0',
        'X-Rate-Limit-Reset': rateLimitResult.resetTime.toString()
      }
      
      if (rateLimitResult.retryAfter) {
        headers['Retry-After'] = rateLimitResult.retryAfter.toString()
      }
      
      return new NextResponse(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: rateLimitResult.retryAfter
        }),
        { 
          status: 429,
          headers
        }
      )
    }

    // 3. 获取响应
    const response = NextResponse.next()

    // 4. 添加安全头
    securityHeaders.forEach(header => {
      response.headers.set(header.key, header.value)
    })

    // 5. 添加CSP头
    response.headers.set(cspHeader.key, cspHeader.value)

    // 6. 添加CORS头
    addCorsHeaders(response, request)

    // 7. 处理预检请求
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: response.headers
      })
    }

    // 8. 记录响应时间
    const responseTime = Date.now() - startTime
    logInfo('Middleware completed', {
      pathname,
      responseTime,
      status: response.status
    }, 'Middleware')

    return response

  } catch (error) {
    logError('Middleware error', error, 'Middleware')
    
    // 返回通用错误响应
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了以下开头的路径：
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
