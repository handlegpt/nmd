import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('🔍 Simple verify-code API called')
  
  try {
    const body = await request.json()
    const { email, code, locale } = body
    
    console.log('📧 Received verification request:', { email, code, locale })
    
    // 简化的验证逻辑 - 接受任何6位数字代码
    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      console.log('❌ Invalid code format')
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid code format',
          message: 'Please enter a valid 6-digit code'
        },
        { status: 400 }
      )
    }
    
    console.log('✅ Code format is valid')
    
    // 创建模拟用户数据
    const mockUser = {
      id: `user_${Date.now()}`,
      email: email,
      name: email.split('@')[0],
      avatar: null,
      current_city: null,
      created_at: new Date().toISOString()
    }
    
    console.log('👤 Created mock user:', mockUser.id)
    
    // 生成模拟JWT令牌
    const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    
    // 返回成功响应
    const response = {
      success: true,
      message: 'Verification successful',
      data: {
        user: mockUser,
        sessionToken: mockToken
      }
    }
    
    console.log('✅ Returning success response')
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ Simple verify-code error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Internal server error'
      },
      { status: 500 }
    )
  }
}
