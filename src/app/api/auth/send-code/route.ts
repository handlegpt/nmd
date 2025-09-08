import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logInfo, logError } from '@/lib/logger'
import { safeValidate, emailSchema } from '@/lib/validation'
import { sendVerificationEmail, checkEmailServiceConfig } from '@/lib/emailService'

export async function POST(request: NextRequest) {
  console.log('🔍 Send-code API called')
  
  try {
    // 1. 解析请求体
    console.log('📝 Step 1: Parsing request body')
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
    
    // 2. 验证输入
    console.log('🔍 Step 2: Validating input')
    let validatedData
    try {
      validatedData = safeValidate(emailSchema, body.email)
      console.log('✅ Input validated:', validatedData)
    } catch (validationError) {
      console.error('❌ Validation error:', validationError)
      const errorMessage = validationError instanceof Error ? validationError.message : 'Invalid email format'
      return NextResponse.json(
        { 
          success: false,
          error: errorMessage,
          message: errorMessage
        },
        { status: 400 }
      )
    }
    
    const { email, locale } = body
    const safeLocale = locale || 'en'
    
    console.log('📧 Processing send-code for:', { email, locale: safeLocale })

    // 3. 检查数据库连接
    console.log('🔍 Step 3: Checking database connection')
    if (!supabase) {
      console.warn('⚠️ Supabase not configured, using mock mode')
      // 在数据库不可用时，直接进入模拟模式
    } else {
      try {
        const { data: connectionTest, error: connectionError } = await supabase
          .from('verification_codes')
          .select('count')
          .limit(1)

        if (connectionError) {
          console.error('❌ Database connection failed:', connectionError)
          return NextResponse.json(
            { 
              success: false,
              error: 'Database connection failed',
              message: 'Database connection failed'
            },
            { status: 500 }
          )
        }
        console.log('✅ Database connection successful')
      } catch (dbError) {
        console.error('❌ Database error:', dbError)
        return NextResponse.json(
          { 
            success: false,
            error: 'Database error',
            message: 'Database error'
          },
          { status: 500 }
        )
      }
    }

    // 4. 生成验证码
    console.log('🔍 Step 4: Generating verification code')
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10分钟后过期
    
    console.log('✅ Verification code generated:', code)

    // 5. 保存验证码到数据库
    console.log('🔍 Step 5: Saving verification code to database')
    if (supabase) {
      try {
        // 先删除旧的验证码
        const { error: deleteError } = await supabase
          .from('verification_codes')
          .delete()
          .eq('email', email)

        if (deleteError) {
          console.error('⚠️ Failed to delete old verification codes:', deleteError)
          // 不返回错误，继续执行
        }

        // 插入新的验证码
        const { data: codeData, error: insertError } = await supabase
          .from('verification_codes')
          .insert({
            email,
            code,
            expires_at: expiresAt.toISOString(),
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (insertError) {
          console.error('❌ Failed to insert verification code:', insertError)
          return NextResponse.json(
            { 
              success: false,
              error: 'Failed to save verification code',
              message: 'Failed to save verification code'
            },
            { status: 500 }
          )
        }

        console.log('✅ Verification code saved to database:', codeData.id)
      } catch (saveError) {
        console.error('❌ Save verification code error:', saveError)
        return NextResponse.json(
          { 
            success: false,
            error: 'Failed to save verification code',
            message: 'Failed to save verification code'
          },
          { status: 500 }
        )
      }
    } else {
      console.log('⚠️ Database not available, skipping verification code storage')
    }

    // 6. 发送验证码邮件
    console.log('🔍 Step 6: Sending verification code email')
    try {
      // 检查邮件服务配置
      const emailConfig = checkEmailServiceConfig()
      console.log('📧 Email service config:', emailConfig)
      
      if (!emailConfig.configured) {
        console.warn('⚠️ Email service not configured, using mock mode')
        // 模拟发送成功（开发环境）
        console.log('📧 Mock email sent to:', email)
        console.log('📧 Verification code:', code)
        console.log('📧 Expires at:', expiresAt.toISOString())
        logInfo('Verification code sent (mock mode)', { email, code }, 'SendCodeAPI')
      } else {
        // 发送真实邮件
        console.log('📧 Sending real email to:', email)
        const emailResult = await sendVerificationEmail(email, code, safeLocale)
        
        if (!emailResult.success) {
          console.error('❌ Email sending failed:', emailResult.error)
          return NextResponse.json(
            { 
              success: false,
              error: 'Failed to send verification code',
              message: 'Failed to send verification code'
            },
            { status: 500 }
          )
        }
        
        console.log('✅ Email sent successfully:', emailResult.messageId)
        logInfo('Verification code sent successfully', { 
          email, 
          code, 
          messageId: emailResult.messageId 
        }, 'SendCodeAPI')
      }
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError)
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to send verification code',
          message: 'Failed to send verification code'
        },
        { status: 500 }
      )
    }

    // 7. 返回成功响应
    console.log('🎉 Send-code successful, returning response')
    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully',
      data: {
        email,
        expiresAt: expiresAt.toISOString()
      }
    })

  } catch (error) {
    console.error('💥 Unexpected error in send-code API:', error)
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
