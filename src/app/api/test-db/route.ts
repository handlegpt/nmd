import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logInfo, logError } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    logInfo('Testing database connection...', null, 'TestDBAPI')
    
    // 测试基本连接
    const { data: connectionTest, error: connectionError } = await supabase
      .from('verification_codes')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      logError('Database connection failed', connectionError, 'TestDBAPI')
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: connectionError
      }, { status: 500 })
    }

    // 测试用户表
    const { data: userTest, error: userError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (userError) {
      logError('Users table test failed', userError, 'TestDBAPI')
      return NextResponse.json({
        success: false,
        error: 'Users table test failed',
        details: userError
      }, { status: 500 })
    }

    logInfo('Database connection test successful', null, 'TestDBAPI')
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      verificationCodesCount: connectionTest,
      usersCount: userTest
    })
  } catch (error) {
    logError('Unexpected error in test-db API', error, 'TestDBAPI')
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error
    }, { status: 500 })
  }
}
