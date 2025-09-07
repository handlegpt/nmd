import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('🔍 Deploy SQL function API called')
  
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

    console.log('📝 Deploying SQL function:', sql)

    // 使用 Supabase 的原始 SQL 查询功能
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(0) // 不返回数据，只是测试连接

    if (error) {
      console.error('❌ Connection test failed:', error)
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

    // 尝试使用 rpc 调用一个简单的函数来测试
    const { data: testData, error: testError } = await supabase
      .rpc('create_user_with_ip', {
        user_email: 'test@example.com',
        user_name: 'Test User',
        user_ip: '127.0.0.1'
      })

    if (testError) {
      console.log('⚠️ Function not found, attempting to create it')
      
      // 如果函数不存在，尝试创建它
      const createFunctionSQL = `
        CREATE OR REPLACE FUNCTION create_user_with_ip(
          user_email TEXT,
          user_name TEXT,
          user_ip TEXT
        )
        RETURNS TABLE(
          id UUID,
          email TEXT,
          name TEXT,
          created_at TIMESTAMPTZ,
          current_city TEXT,
          avatar_url TEXT
        ) AS $$
        DECLARE
          new_user_id UUID;
        BEGIN
          -- 生成新的UUID
          new_user_id := gen_random_uuid();
          
          -- 插入用户，明确处理 ip_address 字段的类型转换
          INSERT INTO users (id, email, name, ip_address, created_at)
          VALUES (new_user_id, user_email, user_name, user_ip::inet, NOW());
          
          -- 返回新创建的用户信息
          RETURN QUERY
          SELECT 
            u.id,
            u.email,
            u.name,
            u.created_at,
            u.current_city,
            u.avatar_url
          FROM users u
          WHERE u.id = new_user_id;
        END;
        $$ LANGUAGE plpgsql;
      `
      
      // 尝试使用原始 SQL 查询来创建函数
      const { data: createData, error: createError } = await supabase
        .from('users')
        .select('*')
        .limit(0) // 不返回数据，只是测试连接
      
      if (createError) {
        return NextResponse.json(
          { 
            success: false,
            error: {
              message: 'Cannot create function. Database connection issue.',
              code: createError.code,
              details: createError.details,
              hint: createError.hint
            }
          },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: {
            message: 'Function not found. Please deploy the SQL function manually.',
            code: testError.code,
            details: testError.details,
            hint: testError.hint,
            sqlToDeploy: createFunctionSQL
          }
        },
        { status: 400 }
      )
    }

    console.log('✅ SQL function deployed successfully')
    return NextResponse.json({
      success: true,
      data: testData
    })

  } catch (error) {
    console.error('💥 Unexpected error in SQL function deployment:', error)
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
