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
          error: 'Email is required',
          message: 'Please provide email'
        },
        { status: 400 }
      )
    }
    
    console.log('📧 Testing user creation for:', email)
    
    // 1. 检查用户是否已存在
    console.log('🔍 Step 1: Checking if user exists')
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, email, name, created_at')
      .eq('email', email)
      .single()
    
    if (existingUser) {
      console.log('✅ User already exists:', existingUser.id)
      return NextResponse.json({
        success: true,
        message: 'User already exists',
        data: {
          user: existingUser,
          action: 'found_existing'
        }
      })
    }
    
    if (userError && userError.code !== 'PGRST116') {
      console.error('❌ User query error:', userError)
      return NextResponse.json(
        { 
          success: false,
          error: 'User query failed',
          message: userError.message,
          details: userError
        },
        { status: 500 }
      )
    }
    
    console.log('✅ User does not exist, proceeding with creation')
    
    // 2. 尝试创建用户
    console.log('🔍 Step 2: Creating new user')
    const userName = email.split('@')[0]
    const newUserData = {
      email,
      name: userName,
      created_at: new Date().toISOString()
    }
    
    console.log('📝 User data to insert:', newUserData)
    
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert(newUserData)
      .select('id, email, name, created_at')
      .single()
    
    if (createError) {
      console.error('❌ Create user error:', createError)
      console.error('❌ Create error details:', {
        code: createError.code,
        message: createError.message,
        details: createError.details,
        hint: createError.hint
      })
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to create user',
          message: createError.message,
          details: createError
        },
        { status: 500 }
      )
    }
    
    console.log('✅ User created successfully:', newUser.id)
    
    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: {
        user: newUser,
        action: 'created_new'
      }
    })
    
  } catch (error) {
    console.error('💥 Unexpected error in test user creation API:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Internal server error'
      },
      { status: 500 }
    )
  }
}
