import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// =====================================================
// 众包生活成本数据API
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const country = searchParams.get('country')

    if (!city || !country) {
      return NextResponse.json({
        success: false,
        error: 'City and country parameters are required'
      }, { status: 400 })
    }

    const supabase = createClient()
    
    // 获取该城市的众包成本数据
    const { data: costData, error } = await supabase
      .from('crowdsourced_cost_data')
      .select('*')
      .eq('city', city)
      .eq('country', country)
      .eq('is_verified', true) // 只获取已验证的数据
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching crowdsourced cost data:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch crowdsourced cost data'
      }, { status: 500 })
    }

    if (!costData || costData.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No crowdsourced data available'
      })
    }

    // 计算平均值和可信度
    const aggregatedData = aggregateCostData(costData)

    return NextResponse.json({
      success: true,
      data: aggregatedData,
      total: costData.length
    })

  } catch (error) {
    console.error('Error in crowdsourced cost data API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证必需字段
    const requiredFields = ['city', 'country', 'accommodation', 'food', 'transport', 'coworking']
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json({
          success: false,
          error: `Missing required field: ${field}`
        }, { status: 400 })
      }
    }

    const supabase = createClient()
    
    // 插入众包数据
    const { data: newData, error } = await supabase
      .from('crowdsourced_cost_data')
      .insert({
        city: body.city,
        country: body.country,
        accommodation: body.accommodation,
        food: body.food,
        transport: body.transport,
        coworking: body.coworking,
        total: body.accommodation + body.food + body.transport + body.coworking,
        currency: body.currency || 'USD',
        user_id: body.user_id || null,
        user_nationality: body.user_nationality || null,
        stay_duration: body.stay_duration || null,
        accommodation_type: body.accommodation_type || null,
        lifestyle_level: body.lifestyle_level || 'medium',
        notes: body.notes || null,
        is_verified: false, // 新提交的数据需要验证
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting crowdsourced cost data:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to insert cost data'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: newData,
      message: 'Cost data submitted successfully. It will be reviewed before being made public.'
    })

  } catch (error) {
    console.error('Error in crowdsourced cost data POST API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * 聚合众包成本数据
 */
function aggregateCostData(costData: any[]) {
  const categories = ['accommodation', 'food', 'transport', 'coworking']
  const aggregated: any = {}

  categories.forEach(category => {
    const values = costData
      .map(item => item[category])
      .filter(value => value !== null && value !== undefined && value > 0)
    
    if (values.length > 0) {
      const average = values.reduce((sum, val) => sum + val, 0) / values.length
      const min = Math.min(...values)
      const max = Math.max(...values)
      
      // 计算可信度：基于数据点数量和方差
      const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length
      const coefficientOfVariation = Math.sqrt(variance) / average
      const confidence = Math.max(0.3, Math.min(0.9, 1 - coefficientOfVariation + (values.length / 20) * 0.2))
      
      aggregated[category] = {
        average: Math.round(average),
        min,
        max,
        count: values.length,
        confidence: Math.round(confidence * 100) / 100
      }
    }
  })

  // 计算总成本
  const totalValues = costData
    .map(item => item.total)
    .filter(value => value !== null && value !== undefined && value > 0)
  
  if (totalValues.length > 0) {
    const totalAverage = totalValues.reduce((sum, val) => sum + val, 0) / totalValues.length
    const totalVariance = totalValues.reduce((sum, val) => sum + Math.pow(val - totalAverage, 2), 0) / totalValues.length
    const totalCoefficientOfVariation = Math.sqrt(totalVariance) / totalAverage
    const totalConfidence = Math.max(0.3, Math.min(0.9, 1 - totalCoefficientOfVariation + (totalValues.length / 20) * 0.2))
    
    aggregated.total = {
      average: Math.round(totalAverage),
      min: Math.min(...totalValues),
      max: Math.max(...totalValues),
      count: totalValues.length,
      confidence: Math.round(totalConfidence * 100) / 100
    }
  }

  return aggregated
}
