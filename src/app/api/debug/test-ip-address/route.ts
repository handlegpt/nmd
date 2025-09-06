import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('🔍 Test IP address API called')
  
  try {
    const body = await request.json()
    const { email } = body
    
    if (!email) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email is required'
        },
        { status: 400 }
      )
    }

    const results: any = {
      timestamp: new Date().toISOString(),
      email,
      attempts: {}
    }

    const userName = email.split('@')[0]

    // 尝试1: 不提供 ip_address 字段
    console.log('🔍 Attempt 1: No ip_address field')
    try {
      const { data: data1, error: error1 } = await supabase
        .from('users')
        .insert({
          email,
          name: userName
        })
        .select('*')
        .single()

      results.attempts.noIpAddress = {
        status: error1 ? 'error' : 'success',
        error: error1 ? {
          message: error1.message,
          code: error1.code,
          details: error1.details,
          hint: error1.hint
        } : null,
        data: data1
      }
    } catch (error) {
      results.attempts.noIpAddress = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 尝试2: 提供 null ip_address
    console.log('🔍 Attempt 2: ip_address = null')
    try {
      const { data: data2, error: error2 } = await supabase
        .from('users')
        .insert({
          email: email + '_null',
          name: userName + '_null',
          ip_address: null
        })
        .select('*')
        .single()

      results.attempts.nullIpAddress = {
        status: error2 ? 'error' : 'success',
        error: error2 ? {
          message: error2.message,
          code: error2.code,
          details: error2.details,
          hint: error2.hint
        } : null,
        data: data2
      }
    } catch (error) {
      results.attempts.nullIpAddress = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 尝试3: 使用原始SQL插入
    console.log('🔍 Attempt 3: Raw SQL insert')
    try {
      const { data: data3, error: error3 } = await supabase
        .rpc('insert_user_without_ip', {
          user_email: email + '_sql',
          user_name: userName + '_sql'
        })

      results.attempts.rawSql = {
        status: error3 ? 'error' : 'success',
        error: error3 ? {
          message: error3.message,
          code: error3.code,
          details: error3.details,
          hint: error3.hint
        } : null,
        data: data3
      }
    } catch (error) {
      results.attempts.rawSql = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 尝试4: 使用 upsert 不提供 ip_address
    console.log('🔍 Attempt 4: Upsert without ip_address')
    try {
      const { data: data4, error: error4 } = await supabase
        .from('users')
        .upsert({
          email: email + '_upsert',
          name: userName + '_upsert'
        }, {
          onConflict: 'email',
          ignoreDuplicates: false
        })
        .select('*')
        .single()

      results.attempts.upsertNoIp = {
        status: error4 ? 'error' : 'success',
        error: error4 ? {
          message: error4.message,
          code: error4.code,
          details: error4.details,
          hint: error4.hint
        } : null,
        data: data4
      }
    } catch (error) {
      results.attempts.upsertNoIp = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    console.log('✅ IP address test completed')
    return NextResponse.json({
      success: true,
      data: results
    })

  } catch (error) {
    console.error('💥 Unexpected error in IP address test:', error)
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
