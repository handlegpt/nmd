import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  console.log('🔍 Check table structure API called')
  
  try {
    // 使用原始 SQL 查询来检查表结构
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'users')
      .order('ordinal_position')

    if (error) {
      console.error('❌ Table structure query error:', error)
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

    console.log('✅ Table structure query successful')
    return NextResponse.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        tableName: 'users',
        columns: data
      }
    })

  } catch (error) {
    console.error('💥 Unexpected error in table structure check:', error)
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
