import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  console.log('🔍 Check database permissions API called')
  
  try {
    // 检查当前用户权限
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('👤 Current user:', user ? user.id : 'No user')
    console.log('🔐 Auth error:', authError)

    // 尝试插入一个测试用户来检查权限
    const testEmail = `test-permissions-${Date.now()}@example.com`
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
            message: 'Insert test failed - permission issue',
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

    // 尝试查询用户表来检查 SELECT 权限
    const { data: selectData, error: selectError } = await supabase
      .from('users')
      .select('id, email, name')
      .limit(1)

    if (selectError) {
      console.log('⚠️ Select test failed:', selectError)
      return NextResponse.json(
        { 
          success: false,
          error: {
            message: 'Select test failed - permission issue',
            code: selectError.code,
            details: selectError.details,
            hint: selectError.hint,
            originalError: selectError.message
          }
        },
        { status: 400 }
      )
    }

    console.log('✅ Database permissions check successful')
    return NextResponse.json({
      success: true,
      data: {
        message: 'Database permissions are working correctly',
        currentUser: user ? user.id : 'No user',
        testInsert: insertData,
        testSelect: selectData
      }
    })

  } catch (error) {
    console.error('💥 Unexpected error in database permissions check:', error)
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
