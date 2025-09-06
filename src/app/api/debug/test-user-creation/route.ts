import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('🔍 Test user creation API called')
  
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
      steps: {}
    }

    // 1. 检查用户是否已存在
    console.log('🔍 Step 1: Checking if user already exists')
    try {
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id, email, name, created_at, current_city, avatar_url')
        .eq('email', email)
        .single()

      if (userError && userError.code === 'PGRST116') {
        results.steps.userExists = {
          status: 'not_found',
          message: 'User does not exist'
        }
      } else if (userError) {
        results.steps.userExists = {
          status: 'error',
          error: userError.message,
          code: userError.code
        }
      } else {
        results.steps.userExists = {
          status: 'found',
          data: existingUser
        }
      }
    } catch (error) {
      results.steps.userExists = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 2. 尝试创建新用户
    console.log('🔍 Step 2: Attempting to create new user')
    try {
      const userName = email.split('@')[0]
      const newUserData = {
        email,
        name: userName,
        created_at: new Date().toISOString()
      }
      
      console.log('📝 Creating user with data:', newUserData)
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert(newUserData)
        .select('id, email, name, created_at, current_city, avatar_url')
        .single()

      if (createError) {
        results.steps.createUser = {
          status: 'error',
          error: createError.message,
          code: createError.code,
          details: createError.details,
          hint: createError.hint
        }
      } else {
        results.steps.createUser = {
          status: 'success',
          data: newUser
        }
      }
    } catch (error) {
      results.steps.createUser = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 3. 检查用户表结构
    console.log('🔍 Step 3: Checking users table structure')
    try {
      const { data: sampleUsers, error: sampleError } = await supabase
        .from('users')
        .select('*')
        .limit(1)

      if (sampleError) {
        results.steps.tableStructure = {
          status: 'error',
          error: sampleError.message,
          code: sampleError.code
        }
      } else {
        results.steps.tableStructure = {
          status: 'success',
          sampleData: sampleUsers
        }
      }
    } catch (error) {
      results.steps.tableStructure = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    console.log('✅ Test user creation completed')
    return NextResponse.json({
      success: true,
      data: results
    })

  } catch (error) {
    console.error('💥 Unexpected error in test user creation:', error)
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