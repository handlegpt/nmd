import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  console.log('🔍 Check RLS policies API called')
  
  try {
    // 检查 users 表的 RLS 状态
    const { data: rlsData, error: rlsError } = await supabase
      .from('users')
      .select('*')
      .limit(0) // 不返回数据，只是测试连接

    if (rlsError) {
      console.error('❌ RLS check error:', rlsError)
      return NextResponse.json(
        { 
          success: false,
          error: {
            message: rlsError.message,
            code: rlsError.code,
            details: rlsError.details,
            hint: rlsError.hint
          }
        },
        { status: 400 }
      )
    }

    // 尝试插入一个测试用户来检查权限
    const testEmail = `test-rls-${Date.now()}@example.com`
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert({
        email: testEmail,
        name: 'Test User'
      })
      .select('id, email, name')
      .single()

    if (insertError) {
      console.log('⚠️ Insert test failed:', insertError)
      return NextResponse.json(
        { 
          success: false,
          error: {
            message: 'Insert test failed - likely RLS or permission issue',
            code: insertError.code,
            details: insertError.details,
            hint: insertError.hint,
            originalError: insertError.message
          }
        },
        { status: 400 }
      )
    }

    // 如果插入成功，删除测试用户
    if (insertData) {
      await supabase
        .from('users')
        .delete()
        .eq('email', testEmail)
    }

    console.log('✅ RLS policies check successful')
    return NextResponse.json({
      success: true,
      data: {
        message: 'RLS policies and permissions are working correctly',
        testUser: insertData
      }
    })

  } catch (error) {
    console.error('💥 Unexpected error in RLS policies check:', error)
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
