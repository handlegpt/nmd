import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('🔍 Test user creation methods API called')
  
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
      methods: {}
    }

    // 方法1: 使用原生SQL插入，不包含ip_address字段
    console.log('🔍 Method 1: Using raw SQL without ip_address field')
    try {
      const userName = email.split('@')[0]
      const { data: sqlData, error: sqlError } = await supabase
        .rpc('create_user_simple', {
          user_email: email,
          user_name: userName
        })

      if (sqlError) {
        results.methods.rawSql = {
          status: 'error',
          error: sqlError.message,
          code: sqlError.code
        }
      } else {
        results.methods.rawSql = {
          status: 'success',
          data: sqlData
        }
      }
    } catch (error) {
      results.methods.rawSql = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 方法2: 使用insert with explicit field casting
    console.log('🔍 Method 2: Using insert with explicit field casting')
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
        results.methods.insertWithIp = {
          status: 'error',
          error: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint
        }
      } else {
        results.methods.insertWithIp = {
          status: 'success',
          data: insertData
        }
      }
    } catch (error) {
      results.methods.insertWithIp = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 方法3: 使用insert without ip_address field
    console.log('🔍 Method 3: Using insert without ip_address field')
    try {
      const userName = email.split('@')[0]
      const { data: insertData2, error: insertError2 } = await supabase
        .from('users')
        .insert({
          email,
          name: userName
        })
        .select('*')
        .single()

      if (insertError2) {
        results.methods.insertWithoutIp = {
          status: 'error',
          error: insertError2.message,
          code: insertError2.code,
          details: insertError2.details,
          hint: insertError2.hint
        }
      } else {
        results.methods.insertWithoutIp = {
          status: 'success',
          data: insertData2
        }
      }
    } catch (error) {
      results.methods.insertWithoutIp = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 方法4: 使用upsert with ip_address field
    console.log('🔍 Method 4: Using upsert with ip_address field')
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
        results.methods.upsertWithIp = {
          status: 'error',
          error: upsertError.message,
          code: upsertError.code,
          details: upsertError.details,
          hint: upsertError.hint
        }
      } else {
        results.methods.upsertWithIp = {
          status: 'success',
          data: upsertData
        }
      }
    } catch (error) {
      results.methods.upsertWithIp = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 方法5: 使用upsert without ip_address field
    console.log('🔍 Method 5: Using upsert without ip_address field')
    try {
      const userName = email.split('@')[0]
      const { data: upsertData2, error: upsertError2 } = await supabase
        .from('users')
        .upsert({
          email,
          name: userName
        })
        .select('*')
        .single()

      if (upsertError2) {
        results.methods.upsertWithoutIp = {
          status: 'error',
          error: upsertError2.message,
          code: upsertError2.code,
          details: upsertError2.details,
          hint: upsertError2.hint
        }
      } else {
        results.methods.upsertWithoutIp = {
          status: 'success',
          data: upsertData2
        }
      }
    } catch (error) {
      results.methods.upsertWithoutIp = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    console.log('✅ Test user creation methods completed')
    return NextResponse.json({
      success: true,
      data: results
    })

  } catch (error) {
    console.error('💥 Unexpected error in test user creation methods:', error)
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
