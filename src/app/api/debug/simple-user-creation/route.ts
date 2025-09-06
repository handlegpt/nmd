import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('🔍 Simple user creation API called')
  
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

    // 尝试1: 使用原生SQL插入
    console.log('🔍 Attempt 1: Using raw SQL insert')
    try {
      const userName = email.split('@')[0]
      const { data: sqlData, error: sqlError } = await supabase
        .rpc('create_user_simple', {
          user_email: email,
          user_name: userName
        })

      if (sqlError) {
        results.attempts.sqlInsert = {
          status: 'error',
          error: sqlError.message,
          code: sqlError.code
        }
      } else {
        results.attempts.sqlInsert = {
          status: 'success',
          data: sqlData
        }
      }
    } catch (error) {
      results.attempts.sqlInsert = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 尝试2: 使用不同的字段组合
    console.log('🔍 Attempt 2: Using different field combinations')
    try {
      const userName = email.split('@')[0]
      const { data: altData, error: altError } = await supabase
        .from('users')
        .insert({
          email,
          name: userName,
          avatar_url: null,
          preferences: {},
          current_city: null
        })
        .select('*')
        .single()

      if (altError) {
        results.attempts.altFields = {
          status: 'error',
          error: altError.message,
          code: altError.code,
          details: altError.details,
          hint: altError.hint
        }
      } else {
        results.attempts.altFields = {
          status: 'success',
          data: altData
        }
      }
    } catch (error) {
      results.attempts.altFields = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 尝试3: 使用 upsert
    console.log('🔍 Attempt 3: Using upsert')
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
        results.attempts.upsert = {
          status: 'error',
          error: upsertError.message,
          code: upsertError.code,
          details: upsertError.details,
          hint: upsertError.hint
        }
      } else {
        results.attempts.upsert = {
          status: 'success',
          data: upsertData
        }
      }
    } catch (error) {
      results.attempts.upsert = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    console.log('✅ Simple user creation test completed')
    return NextResponse.json({
      success: true,
      data: results
    })

  } catch (error) {
    console.error('💥 Unexpected error in simple user creation:', error)
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
