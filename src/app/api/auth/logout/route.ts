import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // 服务器端无法直接清除localStorage，客户端会处理
    return NextResponse.json({
      message: '退出登录成功',
      success: true
    })
  } catch (error) {
    console.error('退出登录错误:', error)
    return NextResponse.json(
      { message: '退出登录失败' },
      { status: 500 }
    )
  }
}
