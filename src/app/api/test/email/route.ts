import { NextRequest, NextResponse } from 'next/server'
import { sendTestEmail, checkEmailServiceConfig } from '@/lib/emailService'
import { logInfo, logError } from '@/lib/logger'

export async function POST(request: NextRequest) {
  console.log('🔍 Email test API called')
  
  try {
    // 1. 解析请求体
    let body
    try {
      body = await request.json()
      console.log('✅ Request body parsed:', body)
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError)
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid JSON in request body',
          message: 'Invalid JSON in request body'
        },
        { status: 400 }
      )
    }
    
    const { email } = body
    
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid email address',
          message: 'Please provide a valid email address'
        },
        { status: 400 }
      )
    }
    
    console.log('📧 Testing email service for:', email)

    // 2. 检查邮件服务配置
    const emailConfig = checkEmailServiceConfig()
    console.log('📧 Email service config:', emailConfig)
    
    if (!emailConfig.configured) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email service not configured',
          message: 'RESEND_API_KEY not found in environment variables'
        },
        { status: 500 }
      )
    }

    // 3. 发送测试邮件
    console.log('📧 Sending test email...')
    const emailResult = await sendTestEmail(email)
    
    if (!emailResult.success) {
      console.error('❌ Test email failed:', emailResult.error)
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to send test email',
          message: emailResult.error || 'Failed to send test email'
        },
        { status: 500 }
      )
    }

    console.log('✅ Test email sent successfully:', emailResult.messageId)
    logInfo('Test email sent successfully', { 
      email, 
      messageId: emailResult.messageId 
    }, 'EmailTestAPI')

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      data: {
        email,
        messageId: emailResult.messageId,
        config: emailConfig
      }
    })

  } catch (error) {
    console.error('💥 Unexpected error in email test API:', error)
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

export async function GET(request: NextRequest) {
  console.log('🔍 Email service config check')
  
  try {
    const emailConfig = checkEmailServiceConfig()
    
    return NextResponse.json({
      success: true,
      message: 'Email service configuration check',
      data: {
        configured: emailConfig.configured,
        apiKey: emailConfig.apiKey,
        domain: emailConfig.domain,
        status: emailConfig.configured ? 'ready' : 'not_configured'
      }
    })

  } catch (error) {
    console.error('💥 Error checking email service config:', error)
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
