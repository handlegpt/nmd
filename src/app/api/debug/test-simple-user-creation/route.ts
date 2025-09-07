import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('🔍 Test simple user creation API called')
  
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

    const userName = email.split('@')[0]
    console.log('📝 Testing user creation for:', { email, userName })

    // 尝试最简单的用户创建
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email,
        name: userName
      })
      .select('id, email, name, created_at')
      .single()

    if (createError) {
      console.error('❌ Create user error:', createError)
      return NextResponse.json(
        { 
          success: false,
          error: {
            message: createError.message,
            code: createError.code,
            details: createError.details,
            hint: createError.hint
          }
        },
        { status: 400 }
      )
    }

    console.log('✅ User created successfully:', newUser)
    return NextResponse.json({
      success: true,
      data: newUser
    })

  } catch (error) {
    console.error('💥 Unexpected error in simple user creation test:', error)
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
