import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  console.log('🔍 Verification codes debug API called')
  
  try {
    // 获取所有验证码（按创建时间倒序）
    const { data: codes, error } = await supabase
      .from('verification_codes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('❌ Failed to fetch verification codes:', error)
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to fetch verification codes',
          message: error.message
        },
        { status: 500 }
      )
    }

    // 检查每个验证码是否过期
    const now = new Date()
    const processedCodes = codes?.map((code: any) => ({
      ...code,
      isExpired: new Date(code.expires_at) < now,
      timeUntilExpiry: new Date(code.expires_at).getTime() - now.getTime()
    })) || []

    console.log('✅ Verification codes fetched successfully')
    return NextResponse.json({
      success: true,
      data: {
        total: codes?.length || 0,
        codes: processedCodes,
        currentTime: now.toISOString()
      }
    })

  } catch (error) {
    console.error('💥 Unexpected error in verification codes debug:', error)
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
