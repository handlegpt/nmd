import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  console.log('🔍 Table structure API called')
  
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      tables: {}
    }

    // 1. 检查用户表结构
    console.log('🔍 Checking users table structure')
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1)

      if (usersError) {
        results.tables.users = {
          status: 'error',
          error: usersError.message,
          code: usersError.code
        }
      } else {
        results.tables.users = {
          status: 'success',
          sampleData: usersData,
          columns: usersData.length > 0 ? Object.keys(usersData[0]) : []
        }
      }
    } catch (error) {
      results.tables.users = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 2. 检查验证码表结构
    console.log('🔍 Checking verification_codes table structure')
    try {
      const { data: codesData, error: codesError } = await supabase
        .from('verification_codes')
        .select('*')
        .limit(1)

      if (codesError) {
        results.tables.verification_codes = {
          status: 'error',
          error: codesError.message,
          code: codesError.code
        }
      } else {
        results.tables.verification_codes = {
          status: 'success',
          sampleData: codesData,
          columns: codesData.length > 0 ? Object.keys(codesData[0]) : []
        }
      }
    } catch (error) {
      results.tables.verification_codes = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    console.log('✅ Table structure check completed')
    return NextResponse.json({
      success: true,
      data: results
    })

  } catch (error) {
    console.error('💥 Unexpected error in table structure check:', error)
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
