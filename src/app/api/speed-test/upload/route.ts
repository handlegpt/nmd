import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // 接收上传的测试数据
    const data = await request.arrayBuffer()
    const dataSize = data.byteLength
    
    // 返回接收到的数据大小
    return NextResponse.json({
      success: true,
      receivedBytes: dataSize,
      message: 'Upload test completed'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Upload test failed' },
      { status: 500 }
    )
  }
}
