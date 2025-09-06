import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('🔍 Detailed user creation test API called')
  
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

    // 尝试1: 最基本的字段
    console.log('🔍 Attempt 1: Minimal fields only')
    try {
      const userName = email.split('@')[0]
      const { data: data1, error: error1 } = await supabase
        .from('users')
        .insert({
          email,
          name: userName
        })
        .select('*')
        .single()

      results.attempts.minimal = {
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
      results.attempts.minimal = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 尝试2: 使用upsert
    console.log('🔍 Attempt 2: Upsert with minimal fields')
    try {
      const userName = email.split('@')[0]
      const { data: data2, error: error2 } = await supabase
        .from('users')
        .upsert({
          email,
          name: userName
        })
        .select('*')
        .single()

      results.attempts.upsert = {
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
      results.attempts.upsert = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 尝试3: 检查表结构
    console.log('🔍 Attempt 3: Check table structure')
    try {
      const { data: tableData, error: tableError } = await supabase
        .from('users')
        .select('*')
        .limit(1)

      results.attempts.tableCheck = {
        status: tableError ? 'error' : 'success',
        error: tableError ? {
          message: tableError.message,
          code: tableError.code,
          details: tableError.details,
          hint: tableError.hint
        } : null,
        data: tableData
      }
    } catch (error) {
      results.attempts.tableCheck = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 尝试4: 使用原始SQL查询表结构
    console.log('🔍 Attempt 4: Raw SQL table structure')
    try {
      const { data: sqlData, error: sqlError } = await supabase
        .rpc('get_table_columns', { table_name: 'users' })

      results.attempts.sqlStructure = {
        status: sqlError ? 'error' : 'success',
        error: sqlError ? {
          message: sqlError.message,
          code: sqlError.code,
          details: sqlError.details,
          hint: sqlError.hint
        } : null,
        data: sqlData
      }
    } catch (error) {
      results.attempts.sqlStructure = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    console.log('✅ Detailed user creation test completed')
    return NextResponse.json({
      success: true,
      data: results
    })

  } catch (error) {
    console.error('💥 Unexpected error in detailed user creation test:', error)
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