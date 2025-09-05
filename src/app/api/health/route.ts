import { NextResponse } from 'next/server'

export async function GET() {
  try {
      // 环境变量检查
  const envCheck = {
    NODE_ENV: process.env.NODE_ENV || 'not_set',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'not_set',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'not_set',
    PORT: process.env.PORT || 'not_set',
    HOSTNAME: process.env.HOSTNAME || 'not_set'
  }

    // 系统信息
    const systemInfo = {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    }

    // 应用信息
    const appInfo = {
      uptime: process.uptime(),
      pid: process.pid,
      title: process.title,
      version: process.env.npm_package_version || '1.0.0',
      buildTime: process.env.BUILD_TIME || 'unknown'
    }

      // 健康检查状态
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      environment: envCheck.NODE_ENV === 'production' ? 'ok' : 'warning',
      supabase: envCheck.NEXT_PUBLIC_SUPABASE_URL === 'set' ? 'ok' : 'error',
      system: 'ok'
    }
  }

      // 综合健康检查结果
  const healthCheck = {
    ...healthStatus,
    environment: envCheck,
    system: systemInfo,
    app: appInfo,
    summary: {
      totalChecks: 3,
      passedChecks: Object.values(healthStatus.checks).filter(check => check === 'ok').length,
      failedChecks: Object.values(healthStatus.checks).filter(check => check === 'error').length,
      warnings: Object.values(healthStatus.checks).filter(check => check === 'warning').length
    }
  }

  // 如果有错误检查，返回警告状态
  const hasErrors = healthStatus.checks.supabase === 'error'
  const statusCode = hasErrors ? 200 : 200 // 即使有错误也返回200，但在响应中标记

    return NextResponse.json(healthCheck, { status: statusCode })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'Health check failed',
        errorDetails: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'unknown',
        stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
      }, 
      { status: 500 }
    )
  }
} 