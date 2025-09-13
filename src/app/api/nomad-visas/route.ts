import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// =====================================================
// 获取数字游民签证列表
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country')
    const isActive = searchParams.get('isActive') !== 'false'

    const supabase = createClient()
    
    let query = supabase
      .from('nomad_visas')
      .select('*')
      .eq('is_active', isActive)
      .order('country', { ascending: true })

    // 如果指定了国家，则筛选
    if (country) {
      query = query.eq('country', country)
    }

    const { data: visas, error } = await query

    if (error) {
      console.error('获取数字游民签证失败', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch nomad visas'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        visas: visas || [],
        total: visas?.length || 0
      }
    })

  } catch (error) {
    console.error('获取数字游民签证失败', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch nomad visas'
    }, { status: 500 })
  }
}

// =====================================================
// 创建新的数字游民签证记录
// =====================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证必需字段
    const requiredFields = ['country', 'country_name', 'visa_name', 'visa_type', 'duration_months', 'cost_usd']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          error: `Missing required field: ${field}`
        }, { status: 400 })
      }
    }

    const supabase = createClient()
    
    const { data: visa, error } = await supabase
      .from('nomad_visas')
      .insert({
        country: body.country,
        country_name: body.country_name,
        visa_name: body.visa_name,
        visa_type: body.visa_type,
        duration_months: body.duration_months,
        cost_usd: body.cost_usd,
        income_requirement_usd: body.income_requirement_usd,
        application_time_days: body.application_time_days,
        requirements: body.requirements,
        benefits: body.benefits,
        tax_implications: body.tax_implications,
        renewal_possible: body.renewal_possible || false,
        max_renewals: body.max_renewals || 0,
        is_active: body.is_active !== false
      })
      .select()
      .single()

    if (error) {
      console.error('创建数字游民签证失败', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to create nomad visa'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: { visa }
    })

  } catch (error) {
    console.error('创建数字游民签证失败', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create nomad visa'
    }, { status: 500 })
  }
}
