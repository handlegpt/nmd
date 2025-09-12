import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/leaderboard - 获取排行榜
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'overall'
    const period = searchParams.get('period') || 'all_time'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 验证参数
    const validCategories = ['overall', 'meetups', 'reviews', 'activity']
    const validPeriods = ['daily', 'weekly', 'monthly', 'all_time']

    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    if (!validPeriods.includes(period)) {
      return NextResponse.json({ error: 'Invalid period' }, { status: 400 })
    }

    let query = supabase
      .from('leaderboard')
      .select(`
        *,
        user:user_id(id, name, avatar_url, current_city, profession)
      `)
      .eq('category', category)
      .eq('period', period)
      .order('rank_position', { ascending: true })
      .range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      console.error('Error fetching leaderboard:', error)
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
    }

    return NextResponse.json({ 
      leaderboard: data,
      category,
      period,
      total: data?.length || 0
    })
  } catch (error) {
    console.error('Error in leaderboard GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/leaderboard - 重新计算排行榜
export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
    }

    const body = await request.json()
    const { category = 'overall', period = 'all_time' } = body

    // 验证参数
    const validCategories = ['overall', 'meetups', 'reviews', 'activity']
    const validPeriods = ['daily', 'weekly', 'monthly', 'all_time']

    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    if (!validPeriods.includes(period)) {
      return NextResponse.json({ error: 'Invalid period' }, { status: 400 })
    }

    // 调用数据库函数重新计算排行榜
    const { data, error } = await supabase.rpc('calculate_leaderboard_scores')

    if (error) {
      console.error('Error calculating leaderboard:', error)
      return NextResponse.json({ error: 'Failed to calculate leaderboard' }, { status: 500 })
    }

    // 获取更新后的排行榜
    const { data: leaderboard, error: fetchError } = await supabase
      .from('leaderboard')
      .select(`
        *,
        user:user_id(id, name, avatar_url, current_city, profession)
      `)
      .eq('category', category)
      .eq('period', period)
      .order('rank_position', { ascending: true })
      .limit(20)

    if (fetchError) {
      console.error('Error fetching updated leaderboard:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch updated leaderboard' }, { status: 500 })
    }

    return NextResponse.json({ 
      leaderboard,
      message: 'Leaderboard recalculated successfully',
      category,
      period
    })
  } catch (error) {
    console.error('Error in leaderboard POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
