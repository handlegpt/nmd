import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('🔍 Fix users table API called')
  
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      steps: {}
    }

    // 步骤1: 检查当前表结构
    console.log('🔍 Step 1: Checking current table structure')
    try {
      const { data: tableData, error: tableError } = await supabase
        .from('users')
        .select('*')
        .limit(1)

      if (tableError) {
        results.steps.checkStructure = {
          status: 'error',
          error: tableError.message
        }
      } else {
        results.steps.checkStructure = {
          status: 'success',
          columns: tableData.length > 0 ? Object.keys(tableData[0]) : []
        }
      }
    } catch (error) {
      results.steps.checkStructure = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 步骤2: 尝试删除有问题的 ip_address 字段（如果存在）
    console.log('🔍 Step 2: Attempting to drop ip_address column if it exists')
    try {
      const { data: dropData, error: dropError } = await supabase
        .rpc('drop_column_if_exists', {
          table_name: 'users',
          column_name: 'ip_address'
        })

      if (dropError) {
        results.steps.dropColumn = {
          status: 'error',
          error: dropError.message
        }
      } else {
        results.steps.dropColumn = {
          status: 'success',
          message: 'ip_address column dropped or did not exist'
        }
      }
    } catch (error) {
      results.steps.dropColumn = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 步骤3: 测试用户创建是否现在可以工作
    console.log('🔍 Step 3: Testing user creation after fix')
    try {
      const testEmail = 'test-after-fix@example.com'
      const { data: createData, error: createError } = await supabase
        .from('users')
        .insert({
          email: testEmail,
          name: 'Test After Fix'
        })
        .select('id, email, name')
        .single()

      if (createError) {
        results.steps.testCreation = {
          status: 'error',
          error: createError.message
        }
      } else {
        results.steps.testCreation = {
          status: 'success',
          data: createData
        }

        // 清理测试数据
        await supabase.from('users').delete().eq('email', testEmail)
      }
    } catch (error) {
      results.steps.testCreation = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    console.log('✅ Fix users table completed')
    return NextResponse.json({
      success: true,
      data: results
    })

  } catch (error) {
    console.error('💥 Unexpected error in fix users table:', error)
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
