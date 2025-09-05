import { NextRequest, NextResponse } from 'next/server'
import { rateLimiter, RateLimitLevel } from '@/lib/rateLimiter'
import { handleError, createSuccessResponse, generateRequestId } from '@/lib/errorHandler'
import { logInfo } from '@/lib/logger'

// 获取速率限制信息
export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  logInfo('Rate limit info request', { requestId }, 'RateLimitAPI')

  try {
    const { searchParams } = new URL(request.url)
    const identifier = searchParams.get('identifier')
    const level = searchParams.get('level') as RateLimitLevel || RateLimitLevel.NORMAL

    if (!identifier) {
      return NextResponse.json(
        { error: 'Identifier parameter is required' },
        { status: 400 }
      )
    }

    const limitInfo = await rateLimiter.getLimitInfo(identifier, level)

    return NextResponse.json(createSuccessResponse({
      identifier,
      level,
      limitInfo
    }, requestId))

  } catch (error) {
    return handleError(error, 'RateLimitAPI', requestId)
  }
}

// 重置速率限制
export async function DELETE(request: NextRequest) {
  const requestId = generateRequestId()
  logInfo('Rate limit reset request', { requestId }, 'RateLimitAPI')

  try {
    const { searchParams } = new URL(request.url)
    const identifier = searchParams.get('identifier')
    const level = searchParams.get('level') as RateLimitLevel || RateLimitLevel.NORMAL

    if (!identifier) {
      return NextResponse.json(
        { error: 'Identifier parameter is required' },
        { status: 400 }
      )
    }

    await rateLimiter.resetLimit(identifier, level)

    return NextResponse.json(createSuccessResponse({
      message: 'Rate limit reset successfully',
      identifier,
      level
    }, requestId))

  } catch (error) {
    return handleError(error, 'RateLimitAPI', requestId)
  }
}
