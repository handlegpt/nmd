import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// =====================================================
// 获取城市列表
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country')
    const minCost = searchParams.get('minCost')
    const maxCost = searchParams.get('maxCost')
    const minNomadScore = searchParams.get('minNomadScore')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = createClient()
    
    let query = supabase
      .from('city_overview')
      .select('*')
      .eq('is_active', true)
      .order('nomad_score', { ascending: false })

    // 应用筛选条件
    if (country) {
      query = query.eq('country', country)
    }
    
    if (minCost) {
      query = query.gte('cost_min_usd', parseInt(minCost))
    }
    
    if (maxCost) {
      query = query.lte('cost_max_usd', parseInt(maxCost))
    }
    
    if (minNomadScore) {
      query = query.gte('nomad_score', parseFloat(minNomadScore))
    }

    // 应用分页
    query = query.range(offset, offset + limit - 1)

    const { data: cities, error } = await query

    if (error) {
      console.error('获取城市列表失败', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch cities'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        cities: cities || [],
        pagination: {
          limit,
          offset,
          total: cities?.length || 0
        }
      }
    })

  } catch (error) {
    console.error('获取城市列表失败', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch cities'
    }, { status: 500 })
  }
}
