import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('🔍 Execute SQL API called')
  
  try {
    const body = await request.json()
    const { sql } = body
    
    if (!sql) {
      return NextResponse.json(
        { 
          success: false,
          error: 'SQL is required'
        },
        { status: 400 }
      )
    }

    console.log('📝 Executing SQL:', sql)

    // 使用 Supabase 的 rpc 来执行原始SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      console.error('❌ SQL execution error:', error)
      return NextResponse.json(
        { 
          success: false,
          error: {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          }
        },
        { status: 400 }
      )
    }

    console.log('✅ SQL executed successfully')
    return NextResponse.json({
      success: true,
      data: data
    })

  } catch (error) {
    console.error('💥 Unexpected error in SQL execution:', error)
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
