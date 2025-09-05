import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 生成测试数据用于下载速度测试
    const testDataSize = 1024 * 1024 // 1MB
    const chunk = '0123456789ABCDEF'.repeat(64) // 1KB chunk
    const chunks = Math.ceil(testDataSize / chunk.length)
    const testData = chunk.repeat(chunks).slice(0, testDataSize)
    
    return new NextResponse(testData, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': testDataSize.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Download test failed' },
      { status: 500 }
    )
  }
}
