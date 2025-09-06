import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  console.log('🔍 Database schema API called')
  
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      schema: {}
    }

    // 1. 尝试直接查询用户表的所有列
    console.log('🔍 Checking users table columns')
    try {
      // 使用原生SQL查询来获取表结构
      const { data: columnsData, error: columnsError } = await supabase
        .rpc('get_table_columns', { table_name: 'users' })

      if (columnsError) {
        results.schema.columns = {
          status: 'error',
          error: columnsError.message,
          code: columnsError.code
        }
      } else {
        results.schema.columns = {
          status: 'success',
          data: columnsData
        }
      }
    } catch (error) {
      results.schema.columns = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 2. 尝试查询表约束
    console.log('🔍 Checking table constraints')
    try {
      const { data: constraintsData, error: constraintsError } = await supabase
        .rpc('get_table_constraints', { table_name: 'users' })

      if (constraintsError) {
        results.schema.constraints = {
          status: 'error',
          error: constraintsError.message,
          code: constraintsError.code
        }
      } else {
        results.schema.constraints = {
          status: 'success',
          data: constraintsData
        }
      }
    } catch (error) {
      results.schema.constraints = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 3. 尝试查询触发器
    console.log('🔍 Checking triggers')
    try {
      const { data: triggersData, error: triggersError } = await supabase
        .rpc('get_table_triggers', { table_name: 'users' })

      if (triggersError) {
        results.schema.triggers = {
          status: 'error',
          error: triggersError.message,
          code: triggersError.code
        }
      } else {
        results.schema.triggers = {
          status: 'success',
          data: triggersData
        }
      }
    } catch (error) {
      results.schema.triggers = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 4. 尝试使用不同的方法查询表结构
    console.log('🔍 Trying alternative table structure query')
    try {
      const { data: altData, error: altError } = await supabase
        .from('information_schema.columns')
        .select('*')
        .eq('table_name', 'users')
        .eq('table_schema', 'public')

      if (altError) {
        results.schema.alternative = {
          status: 'error',
          error: altError.message,
          code: altError.code
        }
      } else {
        results.schema.alternative = {
          status: 'success',
          data: altData
        }
      }
    } catch (error) {
      results.schema.alternative = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    console.log('✅ Database schema check completed')
    return NextResponse.json({
      success: true,
      data: results
    })

  } catch (error) {
    console.error('💥 Unexpected error in database schema check:', error)
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
