import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logInfo, logError } from '@/lib/logger'
import { safeValidate, verificationCodeSchema } from '@/lib/validation'
import { generateToken } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  console.log('🔍 Verify-code API called')
  
  try {
    // 获取用户真实 IP 地址
    const getClientIP = (request: NextRequest): string => {
      const forwarded = request.headers.get('x-forwarded-for')
      const realIP = request.headers.get('x-real-ip')
      const cfConnectingIP = request.headers.get('cf-connecting-ip')
      
      if (cfConnectingIP) return cfConnectingIP
      if (realIP) return realIP
      if (forwarded) return forwarded.split(',')[0].trim()
      
      return '127.0.0.1' // 默认本地 IP
    }
    
    const clientIP = getClientIP(request)
    console.log('🌐 Client IP address:', clientIP)
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
      validatedData = safeValidate(verificationCodeSchema, body)
      console.log('✅ Input validated:', validatedData)
    } catch (validationError) {
      console.error('❌ Validation error:', validationError)
      const errorMessage = validationError instanceof Error ? validationError.message : 'Invalid request data'
      return NextResponse.json(
        { 
          success: false,
          error: errorMessage,
          message: errorMessage
        },
        { status: 400 }
      )
    }
    
    const { email, code, locale } = validatedData
    const safeLocale = locale || 'en'
    
    console.log('📧 Processing verification for:', { email, code, locale: safeLocale })

    // 3. 检查数据库连接和表结构
    console.log('🔍 Step 3: Checking database connection and table structure')
    try {
      const { data: tableCheck, error: tableError } = await supabase
        .from('verification_codes')
        .select('*')
        .limit(1)

      if (tableError) {
        console.error('❌ Table check failed:', tableError)
        console.error('❌ Table error details:', {
          code: tableError.code,
          message: tableError.message,
          details: tableError.details,
          hint: tableError.hint
        })
        
        if (tableError.code === '42P01') { // 表不存在
          return NextResponse.json(
            { 
              success: false,
              error: 'Database table not found',
              message: 'Verification codes table does not exist. Please contact administrator.'
            },
            { status: 500 }
          )
        }
        
        return NextResponse.json(
          { 
            success: false,
            error: 'Database connection failed',
            message: 'Database connection failed'
          },
          { status: 500 }
        )
      }
      console.log('✅ Database connection and table structure check successful')
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

    // 4. 验证验证码
    console.log('🔍 Step 4: Verifying verification code')
    let verificationCode
    try {
      console.log('🔍 Querying verification code for:', { email, code })
      
      const { data: codeData, error: codeError } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('email', email)
        .eq('code', code)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (codeError) {
        console.error('❌ Verification code error:', codeError)
        console.error('❌ Code error details:', {
          code: codeError.code,
          message: codeError.message,
          details: codeError.details,
          hint: codeError.hint
        })
        
        if (codeError.code === 'PGRST116') {
          return NextResponse.json(
            { 
              success: false,
              error: 'Invalid or expired verification code',
              message: 'Invalid or expired verification code'
            },
            { status: 400 }
          )
        }
        return NextResponse.json(
          { 
            success: false,
            error: 'Verification failed',
            message: 'Verification failed'
          },
          { status: 400 }
        )
      }

      verificationCode = codeData
      if (!verificationCode) {
        console.error('❌ No valid verification code found')
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid or expired verification code',
            message: 'Invalid or expired verification code'
          },
          { status: 400 }
        )
      }

      console.log('✅ Verification code is valid:', verificationCode.id)
    } catch (verifyError) {
      console.error('❌ Verification error:', verifyError)
      return NextResponse.json(
        { 
          success: false,
          error: 'Verification error',
          message: 'Verification error'
        },
        { status: 500 }
      )
    }

    // 5. 检查用户是否存在
    console.log('🔍 Step 5: Checking if user exists')
    let user
    try {
      let { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id, email, name, created_at, current_city, avatar_url')
        .eq('email', email)
        .single()

      if (userError && userError.code === 'PGRST116') {
        // 用户不存在，创建新用户
        console.log('👤 User does not exist, creating new user for email:', email)
        
        const userName = email.split('@')[0]
        
        console.log('📝 Creating user with explicit ip_address field and proper type casting for email:', email)
        
        // 使用 upsert 策略，明确提供 ip_address 字段并正确处理类型转换
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .upsert({
            email,
            name: userName,
            ip_address: clientIP
          }, {
            onConflict: 'email',
            ignoreDuplicates: false
          })
          .select('id, email, name, created_at, current_city, avatar_url')
          .single()

        if (createError) {
          console.error('❌ Create user error:', createError)
          console.error('❌ Create error details:', {
            code: createError.code,
            message: createError.message,
            details: createError.details,
            hint: createError.hint
          })
          
          return NextResponse.json(
            { 
              success: false,
              error: 'Failed to create user',
              message: 'Failed to create user'
            },
            { status: 500 }
          )
        }

        console.log('✅ New user created successfully:', { id: newUser.id, email: newUser.email })
        user = newUser
      } else if (userError) {
        console.error('❌ User query error:', userError)
        return NextResponse.json(
          { 
            success: false,
            error: 'User verification failed',
            message: 'User verification failed'
          },
          { status: 500 }
        )
      } else {
        // 用户已存在，使用现有用户
        console.log('✅ Existing user found:', { id: existingUser.id, email: existingUser.email, name: existingUser.name })
        user = existingUser
      }
    } catch (userError) {
      console.error('❌ User processing error:', userError)
      return NextResponse.json(
        { 
          success: false,
          error: 'User processing error',
          message: 'User processing error'
        },
        { status: 500 }
      )
    }

    if (!user) {
      console.error('❌ User not found after creation/query')
      return NextResponse.json(
        { 
          success: false,
          error: 'User verification failed',
          message: 'User verification failed'
        },
        { status: 500 }
      )
    }

    console.log('✅ User verified successfully:', user.id)

    // 6. 删除已使用的验证码
    console.log('🔍 Step 6: Deleting used verification code')
    try {
      const { error: deleteError } = await supabase
        .from('verification_codes')
        .delete()
        .eq('email', email)
        .eq('code', code)

      if (deleteError) {
        console.error('⚠️ Failed to delete verification code:', deleteError)
        // 不返回错误，因为用户已经验证成功
      } else {
        console.log('✅ Verification code deleted successfully')
      }
    } catch (deleteError) {
      console.error('⚠️ Delete verification code error:', deleteError)
      // 不返回错误，因为用户已经验证成功
    }

    // 7. 生成JWT令牌
    console.log('🔍 Step 7: Creating JWT token')
    let sessionToken
    try {
      sessionToken = await generateToken({
        userId: user.id,
        email: user.email
      })

      console.log('✅ JWT token created successfully')
    } catch (tokenError) {
      console.error('❌ JWT token creation error:', tokenError)
      return NextResponse.json(
        { 
          success: false,
          error: 'Token creation failed',
          message: 'Token creation failed'
        },
        { status: 500 }
      )
    }

    // 8. 返回成功响应
    console.log('🎉 Verification successful, returning response')
    return NextResponse.json({
      success: true,
      message: 'Verification successful',
      data: {
        sessionToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar_url || null,
          current_city: user.current_city || null,
          created_at: user.created_at
        }
      }
    })

  } catch (error) {
    console.error('💥 Unexpected error in verify-code API:', error)
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
