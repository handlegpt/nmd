import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('🔍 Verify code test API called')
  
  try {
    const body = await request.json()
    const { email, code } = body
    
    if (!email || !code) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email and code are required'
        },
        { status: 400 }
      )
    }

    const results: any = {
      timestamp: new Date().toISOString(),
      email,
      code,
      checks: {}
    }

    // 1. 检查验证码是否存在（不过期检查）
    console.log('🔍 Step 1: Checking if verification code exists')
    try {
      const { data: codeData, error: codeError } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('email', email)
        .eq('code', code)
        .single()

      if (codeError) {
        results.checks.codeExists = {
          status: 'error',
          error: codeError.message,
          code: codeError.code
        }
      } else {
        results.checks.codeExists = {
          status: 'success',
          data: codeData
        }
      }
    } catch (error) {
      results.checks.codeExists = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 2. 检查验证码是否过期
    console.log('🔍 Step 2: Checking if verification code is expired')
    try {
      const { data: codeData, error: codeError } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('email', email)
        .eq('code', code)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (codeError) {
        results.checks.codeNotExpired = {
          status: 'error',
          error: codeError.message,
          code: codeError.code
        }
      } else {
        results.checks.codeNotExpired = {
          status: 'success',
          data: codeData
        }
      }
    } catch (error) {
      results.checks.codeNotExpired = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 3. 手动检查过期时间
    console.log('🔍 Step 3: Manual expiry check')
    try {
      const { data: codeData, error: codeError } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('email', email)
        .eq('code', code)
        .single()

      if (codeData) {
        const now = new Date()
        const expiresAt = new Date(codeData.expires_at)
        const isExpired = expiresAt < now
        const timeUntilExpiry = expiresAt.getTime() - now.getTime()

        results.checks.manualExpiryCheck = {
          status: 'success',
          data: {
            expiresAt: codeData.expires_at,
            currentTime: now.toISOString(),
            isExpired,
            timeUntilExpiry,
            timeUntilExpirySeconds: Math.floor(timeUntilExpiry / 1000)
          }
        }
      } else {
        results.checks.manualExpiryCheck = {
          status: 'error',
          error: 'Code not found'
        }
      }
    } catch (error) {
      results.checks.manualExpiryCheck = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    console.log('✅ Verify code test completed')
    return NextResponse.json({
      success: true,
      data: results
    })

  } catch (error) {
    console.error('💥 Unexpected error in verify code test:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
