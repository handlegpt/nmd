import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('🔍 Detailed user creation API called')
  
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

    // 1. 尝试不同的用户创建方式
    console.log('🔍 Step 1: Trying different user creation approaches')
    
    // 方式1: 只提供基本字段
    try {
      const userName = email.split('@')[0]
      const basicUserData = {
        email,
        name: userName
      }
      
      console.log('📝 Trying basic user creation with data:', basicUserData)
      
      const { data: basicUser, error: basicError } = await supabase
        .from('users')
        .insert(basicUserData)
        .select('*')
        .single()

      if (basicError) {
        results.steps.basicCreation = {
          status: 'error',
          error: basicError.message,
          code: basicError.code,
          details: basicError.details,
          hint: basicError.hint
        }
      } else {
        results.steps.basicCreation = {
          status: 'success',
          data: basicUser
        }
      }
    } catch (error) {
      results.steps.basicCreation = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 方式2: 提供所有可能需要的字段
    try {
      const userName = email.split('@')[0]
      const fullUserData = {
        email,
        name: userName,
        avatar_url: null,
        preferences: {},
        current_city: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log('📝 Trying full user creation with data:', fullUserData)
      
      const { data: fullUser, error: fullError } = await supabase
        .from('users')
        .insert(fullUserData)
        .select('*')
        .single()

      if (fullError) {
        results.steps.fullCreation = {
          status: 'error',
          error: fullError.message,
          code: fullError.code,
          details: fullError.details,
          hint: fullError.hint
        }
      } else {
        results.steps.fullCreation = {
          status: 'success',
          data: fullUser
        }
      }
    } catch (error) {
      results.steps.fullCreation = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 方式3: 尝试使用不同的email
    try {
      const testEmail = `test-${Date.now()}@example.com`
      const userName = testEmail.split('@')[0]
      const testUserData = {
        email: testEmail,
        name: userName
      }
      
      console.log('📝 Trying test user creation with data:', testUserData)
      
      const { data: testUser, error: testError } = await supabase
        .from('users')
        .insert(testUserData)
        .select('*')
        .single()

      if (testError) {
        results.steps.testCreation = {
          status: 'error',
          error: testError.message,
          code: testError.code,
          details: testError.details,
          hint: testError.hint
        }
      } else {
        results.steps.testCreation = {
          status: 'success',
          data: testUser
        }
      }
    } catch (error) {
      results.steps.testCreation = {
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
    console.error('💥 Unexpected error in detailed user creation:', error)
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
