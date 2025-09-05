import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 环境诊断
    const environmentDiagnostics = {
      nodeEnv: process.env.NODE_ENV || 'not_set',
      isProduction: process.env.NODE_ENV === 'production',
      isDevelopment: process.env.NODE_ENV === 'development',
      buildTime: process.env.BUILD_TIME || 'unknown',
      version: process.env.npm_package_version || '1.0.0'
    }

      // 环境变量诊断
  const envVarDiagnostics = {
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing'
    },
    app: {
      url: process.env.NEXT_PUBLIC_APP_URL || 'not_set',
      port: process.env.PORT || 'not_set',
      hostname: process.env.HOSTNAME || 'not_set'
    }
  }

    // 系统资源诊断
    const systemDiagnostics = {
      platform: process.platform,
      architecture: process.arch,
      nodeVersion: process.version,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        external: Math.round(process.memoryUsage().external / 1024 / 1024) + ' MB',
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB'
      },
      cpu: {
        user: Math.round(process.cpuUsage().user / 1000) + ' ms',
        system: Math.round(process.cpuUsage().system / 1000) + ' ms'
      },
      uptime: {
        seconds: Math.round(process.uptime()),
        formatted: formatUptime(process.uptime())
      }
    }

    // 应用状态诊断
    const appDiagnostics = {
      pid: process.pid,
      title: process.title,
      cwd: process.cwd(),
      execPath: process.execPath,
      argv: process.argv.slice(0, 3), // 只显示前3个参数
      versions: {
        node: process.versions.node,
        v8: process.versions.v8,
        openssl: process.versions.openssl,
        zlib: process.versions.zlib
      }
    }

      // 潜在问题检测
  const potentialIssues = []
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    potentialIssues.push('Missing Supabase URL - API calls will fail')
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    potentialIssues.push('Missing Supabase anonymous key - Authentication will fail')
  }
  
  if (process.env.NODE_ENV !== 'production') {
    potentialIssues.push('Not running in production mode - Performance may be affected')
  }

      // 诊断摘要
  const diagnosticSummary = {
    status: potentialIssues.length === 0 ? 'healthy' : 'issues_detected',
    timestamp: new Date().toISOString(),
    totalChecks: 3,
    passedChecks: 3 - potentialIssues.length,
    failedChecks: potentialIssues.length,
    criticalIssues: potentialIssues.filter(issue => 
      issue.includes('Supabase') || issue.includes('Authentication')
    ).length
  }

    const debugInfo = {
      summary: diagnosticSummary,
      environment: environmentDiagnostics,
      envVars: envVarDiagnostics,
      system: systemDiagnostics,
      app: appDiagnostics,
      potentialIssues,
      recommendations: generateRecommendations(potentialIssues)
    }

    return NextResponse.json(debugInfo, { 
      status: potentialIssues.length === 0 ? 200 : 200 // 总是返回200，但在响应中标记问题
    })

  } catch (error) {
    console.error('Debug endpoint failed:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        error: 'Debug endpoint failed',
        errorDetails: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// 辅助函数：格式化运行时间
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${secs}s`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

// 生成建议
function generateRecommendations(issues: string[]): string[] {
  const recommendations = []
  
  if (issues.some(issue => issue.includes('Supabase'))) {
    recommendations.push('Check Supabase project configuration and environment variables')
    recommendations.push('Verify Supabase project is running and accessible')
  }
  

  
  if (issues.some(issue => issue.includes('production'))) {
    recommendations.push('Ensure NODE_ENV is set to production in production deployment')
  }
  
  if (recommendations.length === 0) {
    recommendations.push('All systems appear to be configured correctly')
  }
  
  return recommendations
}
