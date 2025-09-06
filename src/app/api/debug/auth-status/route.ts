import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  console.log('🔍 Auth status check API called')
  
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      checks: {}
    }

    // 1. 检查Supabase连接
    console.log('🔍 Step 1: Checking Supabase connection')
    try {
      const { data, error } = await supabase
        .from('verification_codes')
        .select('count')
        .limit(1)

      if (error) {
        results.checks.supabaseConnection = {
          status: 'error',
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        }
      } else {
        results.checks.supabaseConnection = {
          status: 'success',
          message: 'Supabase connection successful'
        }
      }
    } catch (error) {
      results.checks.supabaseConnection = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 2. 检查verification_codes表
    console.log('🔍 Step 2: Checking verification_codes table')
    try {
      const { data, error } = await supabase
        .from('verification_codes')
        .select('*')
        .limit(1)

      if (error) {
        results.checks.verificationCodesTable = {
          status: 'error',
          error: error.message,
          code: error.code
        }
      } else {
        results.checks.verificationCodesTable = {
          status: 'success',
          message: 'verification_codes table accessible',
          sampleData: data
        }
      }
    } catch (error) {
      results.checks.verificationCodesTable = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 3. 检查users表
    console.log('🔍 Step 3: Checking users table')
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(1)

      if (error) {
        results.checks.usersTable = {
          status: 'error',
          error: error.message,
          code: error.code
        }
      } else {
        results.checks.usersTable = {
          status: 'success',
          message: 'users table accessible',
          sampleData: data
        }
      }
    } catch (error) {
      results.checks.usersTable = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 4. 检查环境变量
    console.log('🔍 Step 4: Checking environment variables')
    results.checks.environmentVariables = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing',
      jwtSecret: process.env.JWT_SECRET ? 'configured' : 'missing',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'missing'
    }

    // 5. 测试JWT生成
    console.log('🔍 Step 5: Testing JWT generation')
    try {
      const { generateToken } = await import('@/lib/jwt')
      const testToken = await generateToken({
        userId: 'test-user-id',
        email: 'test@example.com'
      })
      
      results.checks.jwtGeneration = {
        status: 'success',
        message: 'JWT generation successful',
        tokenLength: testToken.length
      }
    } catch (error) {
      results.checks.jwtGeneration = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    console.log('✅ Auth status check completed')
    return NextResponse.json({
      success: true,
      data: results
    })

  } catch (error) {
    console.error('💥 Unexpected error in auth status check:', error)
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
