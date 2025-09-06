import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('🔍 Simple user test API called')
  
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

    // 尝试1: 使用最基本的字段
    console.log('🔍 Attempt 1: Using basic fields only')
    try {
      const userName = email.split('@')[0]
      const { data: basicData, error: basicError } = await supabase
        .from('users')
        .insert({
          email,
          name: userName
        })
        .select('*')
        .single()

      if (basicError) {
        results.attempts.basic = {
          status: 'error',
          error: basicError.message,
          code: basicError.code,
          details: basicError.details,
          hint: basicError.hint
        }
      } else {
        results.attempts.basic = {
          status: 'success',
          data: basicData
        }
      }
    } catch (error) {
      results.attempts.basic = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 尝试2: 使用所有已知字段
    console.log('🔍 Attempt 2: Using all known fields')
    try {
      const userName = email.split('@')[0]
      const { data: allData, error: allError } = await supabase
        .from('users')
        .insert({
          email,
          name: userName,
          avatar_url: null,
          preferences: {},
          current_city: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single()

      if (allError) {
        results.attempts.allFields = {
          status: 'error',
          error: allError.message,
          code: allError.code,
          details: allError.details,
          hint: allError.hint
        }
      } else {
        results.attempts.allFields = {
          status: 'success',
          data: allData
        }
      }
    } catch (error) {
      results.attempts.allFields = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 尝试3: 使用upsert with basic fields
    console.log('🔍 Attempt 3: Using upsert with basic fields')
    try {
      const userName = email.split('@')[0]
      const { data: upsertData, error: upsertError } = await supabase
        .from('users')
        .upsert({
          email,
          name: userName
        })
        .select('*')
        .single()

      if (upsertError) {
        results.attempts.upsertBasic = {
          status: 'error',
          error: upsertError.message,
          code: upsertError.code,
          details: upsertError.details,
          hint: upsertError.hint
        }
      } else {
        results.attempts.upsertBasic = {
          status: 'success',
          data: upsertData
        }
      }
    } catch (error) {
      results.attempts.upsertBasic = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    console.log('✅ Simple user test completed')
    return NextResponse.json({
      success: true,
      data: results
    })

  } catch (error) {
    console.error('💥 Unexpected error in simple user test:', error)
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
