import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('🔍 Remove IP address field API called')
  
  try {
    // 尝试删除 ip_address 字段
    console.log('📝 Attempting to remove ip_address field from users table')
    
    // 首先检查字段是否存在
    const { data: checkData, error: checkError } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (checkError) {
      console.error('❌ Check users table error:', checkError)
      return NextResponse.json(
        { 
          success: false,
          error: {
            message: checkError.message,
            code: checkError.code,
            details: checkError.details,
            hint: checkError.hint
          }
        },
        { status: 400 }
      )
    }

    // 尝试插入一个测试用户来确认问题
    const testEmail = `test-remove-ip-${Date.now()}@example.com`
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
      
      // 如果插入失败，尝试使用 upsert
      const { data: upsertData, error: upsertError } = await supabase
        .from('users')
        .upsert({
          email: testEmail,
          name: 'Test User'
        }, {
          onConflict: 'email',
          ignoreDuplicates: false
        })
        .select('id, email, name')
        .single()

      if (upsertError) {
        console.log('⚠️ Upsert test also failed:', upsertError)
        return NextResponse.json(
          { 
            success: false,
            error: {
              message: 'Both insert and upsert failed',
              insertError: insertError.message,
              upsertError: upsertError.message,
              code: insertError.code,
              details: insertError.details,
              hint: insertError.hint
            }
          },
          { status: 400 }
        )
      }

      // 如果 upsert 成功，删除测试用户
      if (upsertData) {
        await supabase
          .from('users')
          .delete()
          .eq('email', testEmail)
      }

      return NextResponse.json(
        { 
          success: true,
          message: 'Upsert works but insert fails - likely ip_address field issue',
          data: {
            insertError: insertError.message,
            upsertSuccess: true
          }
        }
      )
    }

    // 如果插入成功，删除测试用户
    if (insertData) {
      await supabase
        .from('users')
        .delete()
        .eq('email', testEmail)
    }

    console.log('✅ Users table is working correctly')
    return NextResponse.json({
      success: true,
      message: 'Users table is working correctly - no ip_address field issue',
      data: {
        testUser: insertData
      }
    })

  } catch (error) {
    console.error('💥 Unexpected error in remove IP address field:', error)
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
