import { NextRequest, NextResponse } from 'next/server'
import { nomadPlanningAgent, UserProfile } from '@/lib/nomadAgent'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// =====================================================
// 请求验证Schema
// =====================================================

const PlanRequestSchema = z.object({
  // 用户基本信息
  nationality: z.string().min(2).max(3), // 国籍代码
  budget: z.number().min(500).max(10000), // 月预算 (USD)
  duration: z.number().min(1).max(24), // 计划时长 (月)
  startDate: z.string().optional(), // 开始日期
  
  // 用户偏好
  preferences: z.object({
    climate: z.array(z.string()).optional().default([]),
    activities: z.array(z.string()).optional().default([]),
    accommodation: z.string().optional().default('standard'),
    food: z.string().optional().default('standard'),
    social: z.string().optional().default('medium'),
    visa: z.string().optional().default('convenient')
  }),
  
  // 约束条件
  constraints: z.object({
    maxCities: z.number().min(1).max(5).optional().default(3),
    minStayDays: z.number().min(7).optional().default(30),
    maxStayDays: z.number().min(30).optional().default(365),
    mustVisit: z.array(z.string()).optional().default([]),
    avoidCountries: z.array(z.string()).optional().default([])
  }),
  
  // 可选参数
  userId: z.string().uuid().optional(),
  savePlan: z.boolean().optional().default(false)
})

// =====================================================
// API处理函数
// =====================================================

export async function POST(request: NextRequest) {
  try {
    // 解析和验证请求
    const body = await request.json()
    const validatedData = PlanRequestSchema.parse(body)
    
    console.log('📋 收到规划请求', {
      nationality: validatedData.nationality,
      budget: validatedData.budget,
      duration: validatedData.duration,
      userId: validatedData.userId
    })

    // 构建用户档案
    const userProfile: UserProfile = {
      nationality: validatedData.nationality,
      budget: validatedData.budget,
      duration: validatedData.duration,
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
      preferences: validatedData.preferences,
      constraints: validatedData.constraints
    }

    // 生成规划
    const plan = await nomadPlanningAgent.generatePlan(userProfile)

    // 如果用户登录且要求保存，则保存到数据库
    if (validatedData.userId && validatedData.savePlan) {
      await savePlanToDatabase(plan, validatedData.userId)
    }

    // 返回结果
    return NextResponse.json({
      success: true,
      data: {
        planId: plan.id,
        title: plan.title,
        routes: plan.routes.map(route => ({
          id: route.id,
          name: route.name,
          cities: route.cities.map(city => ({
            city: city.city,
            country: city.country,
            score: city.score,
            reasons: city.reasons,
            stayDuration: city.stayDuration,
            estimatedCost: city.estimatedCost,
            cost: {
              accommodation: city.cost.accommodation,
              food: city.cost.food,
              transport: city.cost.transport,
              coworking: city.cost.coworking,
              total: city.cost.total
            },
            visa: city.visa ? {
              visaName: city.visa.visaName,
              durationMonths: city.visa.durationMonths,
              costUSD: city.visa.costUSD,
              incomeRequirementUSD: city.visa.incomeRequirementUSD,
              applicationTimeDays: city.visa.applicationTimeDays,
              benefits: city.visa.benefits
            } : null,
            pois: city.pois.map(poi => ({
              name: poi.name,
              type: poi.type,
              rating: poi.rating,
              priceLevel: poi.priceLevel
            }))
          })),
          totalCost: route.totalCost,
          totalDuration: route.totalDuration,
          visaStrategy: {
            requiredVisas: route.visaStrategy.requiredVisas.map(visa => ({
              visaName: visa.visaName,
              country: visa.country,
              costUSD: visa.costUSD,
              applicationTimeDays: visa.applicationTimeDays
            })),
            totalCost: route.visaStrategy.totalCost,
            totalTime: route.visaStrategy.totalTime,
            risks: route.visaStrategy.risks
          },
          highlights: route.highlights,
          pros: route.pros,
          cons: route.cons,
          score: route.score,
          riskAssessment: route.riskAssessment
        })),
        totalCost: plan.totalCost,
        totalDuration: plan.totalDuration,
        riskAssessment: plan.riskAssessment,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt
      },
      meta: {
        processingTime: Date.now() - request.headers.get('x-request-time') || Date.now(),
        agentStatus: nomadPlanningAgent.getAgentStatus()
      }
    })

  } catch (error) {
    console.error('❌ 规划生成失败', error)

    // 处理验证错误
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 })
    }

    // 处理其他错误
    return NextResponse.json({
      success: false,
      error: 'Failed to generate plan',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// =====================================================
// 保存规划到数据库
// =====================================================

async function savePlanToDatabase(plan: any, userId: string) {
  try {
    const supabase = createClient()
    
    // 保存主规划记录
    const { data: planData, error: planError } = await supabase
      .from('travel_plans')
      .insert({
        user_id: userId,
        title: plan.title,
        origin_country: plan.userProfile.nationality,
        nationality: plan.userProfile.nationality,
        budget_usd: plan.userProfile.budget,
        duration_months: plan.userProfile.duration,
        start_date: plan.userProfile.startDate,
        party_size: 1,
        preferences: plan.userProfile.preferences,
        summary: {
          totalCost: plan.totalCost,
          totalDuration: plan.totalDuration,
          routesCount: plan.routes.length,
          riskLevel: plan.riskAssessment.overall
        },
        status: 'draft'
      })
      .select()
      .single()

    if (planError) {
      console.error('保存规划失败', planError)
      return
    }

    // 保存路线段
    for (const route of plan.routes) {
      for (let i = 0; i < route.cities.length; i++) {
        const city = route.cities[i]
        
        const { error: legError } = await supabase
          .from('plan_legs')
          .insert({
            plan_id: planData.id,
            sequence_order: i + 1,
            city_id: null, // 需要根据城市名查找city_id
            arrive_date: new Date(),
            depart_date: new Date(Date.now() + city.stayDuration * 24 * 60 * 60 * 1000),
            duration_days: city.stayDuration,
            estimated_cost_usd: city.estimatedCost,
            visa_required: !!city.visa,
            visa_type: city.visa?.visaName || null,
            visa_cost_usd: city.visa?.costUSD || null,
            notes: city.reasons.join(', '),
            metadata: {
              score: city.score,
              pois: city.pois,
              riskAssessment: route.riskAssessment
            }
          })

        if (legError) {
          console.error('保存路线段失败', legError)
        }
      }
    }

    console.log('✅ 规划已保存到数据库', { planId: planData.id })
  } catch (error) {
    console.error('保存规划到数据库失败', error)
  }
}

// =====================================================
// 获取规划历史
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 })
    }

    const supabase = createClient()
    
    // 获取用户的规划历史
    const { data: plans, error } = await supabase
      .from('travel_plans')
      .select(`
        id,
        title,
        budget_usd,
        duration_months,
        start_date,
        status,
        summary,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('获取规划历史失败', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch plans'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        plans: plans || [],
        pagination: {
          limit,
          offset,
          total: plans?.length || 0
        }
      }
    })

  } catch (error) {
    console.error('获取规划历史失败', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch plans'
    }, { status: 500 })
  }
}
