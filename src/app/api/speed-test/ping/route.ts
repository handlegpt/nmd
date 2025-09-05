import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 简单的ping测试，返回当前时间戳
    const timestamp = Date.now()
    
    return NextResponse.json({
      success: true,
      timestamp,
      message: 'Ping test completed'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Ping test failed' },
      { status: 500 }
    )
  }
}
