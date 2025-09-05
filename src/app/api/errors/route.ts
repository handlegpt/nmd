import { NextRequest, NextResponse } from 'next/server'

// 内存中的错误存储（生产环境中应该使用数据库）
const errorStore: Array<{
  id: string
  timestamp: string
  error: any
  errorInfo: any
  userAgent: string
  url: string
  userId?: string
  sessionId?: string
}> = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { error, errorInfo, userAgent, url, userId, sessionId } = body

    // 验证必需字段
    if (!error || !errorInfo) {
      return NextResponse.json(
        { error: 'Missing required fields: error, errorInfo' },
        { status: 400 }
      )
    }

    // 创建错误记录
    const errorRecord = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      error: {
        name: error.name || 'Unknown',
        message: error.message || 'No message',
        stack: error.stack || 'No stack trace',
        type: error.constructor?.name || 'Error'
      },
      errorInfo: {
        componentStack: errorInfo.componentStack || 'No component stack',
        ...errorInfo
      },
      userAgent: userAgent || 'Unknown',
      url: url || 'Unknown',
      userId: userId || undefined,
      sessionId: sessionId || undefined
    }

    // 存储错误记录
    errorStore.push(errorRecord)

    // 只保留最近 100 个错误
    if (errorStore.length > 100) {
      errorStore.splice(0, errorStore.length - 100)
    }

    // 记录到控制台（生产环境中应该记录到日志系统）
    console.error('🚨 Client error reported:', {
      id: errorRecord.id,
      error: errorRecord.error.message,
      componentStack: errorRecord.errorInfo.componentStack,
      url: errorRecord.url,
      timestamp: errorRecord.timestamp
    })

    return NextResponse.json({
      success: true,
      errorId: errorRecord.id,
      message: 'Error logged successfully'
    })

  } catch (error) {
    console.error('Failed to log client error:', error)
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const errorType = searchParams.get('type')
    const url = searchParams.get('url')

    // 过滤错误记录
    let filteredErrors = [...errorStore]

    if (errorType) {
      filteredErrors = filteredErrors.filter(err => 
        err.error.name.toLowerCase().includes(errorType.toLowerCase()) ||
        err.error.message.toLowerCase().includes(errorType.toLowerCase())
      )
    }

    if (url) {
      filteredErrors = filteredErrors.filter(err => 
        err.url.includes(url)
      )
    }

    // 分页
    const paginatedErrors = filteredErrors
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(offset, offset + limit)

    // 统计信息
    const stats = {
      totalErrors: errorStore.length,
      filteredErrors: filteredErrors.length,
      paginatedErrors: paginatedErrors.length,
      errorTypes: errorStore.reduce((acc, err) => {
        const type = err.error.name
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      recentErrors: errorStore
        .slice(-10)
        .map(err => ({
          id: err.id,
          timestamp: err.timestamp,
          error: err.error.message,
          url: err.url
        }))
    }

    return NextResponse.json({
      success: true,
      data: {
        errors: paginatedErrors,
        stats,
        pagination: {
          limit,
          offset,
          total: filteredErrors.length,
          hasMore: offset + limit < filteredErrors.length
        }
      }
    })

  } catch (error) {
    console.error('Failed to retrieve errors:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve errors' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const clearAll = searchParams.get('clear') === 'true'

    if (clearAll) {
      // 清除所有错误记录
      errorStore.length = 0
      return NextResponse.json({
        success: true,
        message: 'All errors cleared'
      })
    }

    if (id) {
      // 清除特定错误记录
      const index = errorStore.findIndex(err => err.id === id)
      if (index !== -1) {
        errorStore.splice(index, 1)
        return NextResponse.json({
          success: true,
          message: `Error ${id} cleared`
        })
      } else {
        return NextResponse.json(
          { error: 'Error not found' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Missing id parameter or clear flag' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Failed to clear errors:', error)
    return NextResponse.json(
      { error: 'Failed to clear errors' },
      { status: 500 }
    )
  }
}
