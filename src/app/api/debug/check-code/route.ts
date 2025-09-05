import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  console.log('🔍 Check-code debug API called')
  
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email parameter is required',
          message: 'Please provide email parameter'
        },
        { status: 400 }
      )
    }
    
    console.log('📧 Checking verification codes for:', email)
    
    // 查询验证码
    const { data: codes, error: codeError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (codeError) {
      console.error('❌ Code query error:', codeError)
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to query verification codes',
          message: 'Database query failed'
        },
        { status: 500 }
      )
    }
    
    console.log('✅ Verification codes found:', codes?.length || 0)
    
    return NextResponse.json({
      success: true,
      message: 'Verification codes retrieved successfully',
      data: {
        email,
        codes: codes || [],
        count: codes?.length || 0
      }
    })
    
  } catch (error) {
    console.error('💥 Unexpected error in check-code API:', error)
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
