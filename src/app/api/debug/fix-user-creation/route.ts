import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('🔍 Fix user creation API called')
  
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

    // 尝试1: 使用原生SQL插入，明确指定所有字段
    console.log('🔍 Attempt 1: Using raw SQL with explicit field casting')
    try {
      const userName = email.split('@')[0]
      const { data: sqlData, error: sqlData } = await supabase
        .rpc('create_user_with_ip', {
          user_email: email,
          user_name: userName,
          user_ip: '127.0.0.1'
        })

      if (sqlData) {
        results.attempts.sqlWithIp = {
          status: 'error',
          error: sqlData.message,
          code: sqlData.code
        }
      } else {
        results.attempts.sqlWithIp = {
          status: 'success',
          data: sqlData
        }
      }
    } catch (error) {
      results.attempts.sqlWithIp = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 尝试2: 使用原生SQL插入，不包含ip_address字段
    console.log('🔍 Attempt 2: Using raw SQL without ip_address field')
    try {
      const userName = email.split('@')[0]
      const { data: sqlData2, error: sqlError2 } = await supabase
        .rpc('create_user_simple', {
          user_email: email,
          user_name: userName
        })

      if (sqlError2) {
        results.attempts.sqlWithoutIp = {
          status: 'error',
          error: sqlError2.message,
          code: sqlError2.code
        }
      } else {
        results.attempts.sqlWithoutIp = {
          status: 'success',
          data: sqlData2
        }
      }
    } catch (error) {
      results.attempts.sqlWithoutIp = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 尝试3: 使用insert with explicit field casting
    console.log('🔍 Attempt 3: Using insert with explicit field casting')
    try {
      const userName = email.split('@')[0]
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert({
          email,
          name: userName,
          ip_address: '127.0.0.1'
        })
        .select('*')
        .single()

      if (insertError) {
        results.attempts.insertWithCast = {
          status: 'error',
          error: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint
        }
      } else {
        results.attempts.insertWithCast = {
          status: 'success',
          data: insertData
        }
      }
    } catch (error) {
      results.attempts.insertWithCast = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 尝试4: 使用insert with null ip_address
    console.log('🔍 Attempt 4: Using insert with null ip_address')
    try {
      const userName = email.split('@')[0]
      const { data: insertData2, error: insertError2 } = await supabase
        .from('users')
        .insert({
          email,
          name: userName,
          ip_address: null
        })
        .select('*')
        .single()

      if (insertError2) {
        results.attempts.insertWithNull = {
          status: 'error',
          error: insertError2.message,
          code: insertError2.code,
          details: insertError2.details,
          hint: insertError2.hint
        }
      } else {
        results.attempts.insertWithNull = {
          status: 'success',
          data: insertData2
        }
      }
    } catch (error) {
      results.attempts.insertWithNull = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 尝试5: 使用upsert with explicit field casting
    console.log('🔍 Attempt 5: Using upsert with explicit field casting')
    try {
      const userName = email.split('@')[0]
      const { data: upsertData, error: upsertError } = await supabase
        .from('users')
        .upsert({
          email,
          name: userName,
          ip_address: '127.0.0.1'
        })
        .select('*')
        .single()

      if (upsertError) {
        results.attempts.upsertWithCast = {
          status: 'error',
          error: upsertError.message,
          code: upsertError.code,
          details: upsertError.details,
          hint: upsertError.hint
        }
      } else {
        results.attempts.upsertWithCast = {
          status: 'success',
          data: upsertData
        }
      }
    } catch (error) {
      results.attempts.upsertWithCast = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    console.log('✅ Fix user creation test completed')
    return NextResponse.json({
      success: true,
      data: results
    })

  } catch (error) {
    console.error('💥 Unexpected error in fix user creation:', error)
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
