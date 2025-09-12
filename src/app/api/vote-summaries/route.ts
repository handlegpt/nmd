import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/vote-summaries - 获取投票摘要
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const target_id = searchParams.get('target_id')
    const target_type = searchParams.get('target_type')
    const limit = parseInt(searchParams.get('limit') || '50')
    const sort_by = searchParams.get('sort_by') || 'weighted_score'

    let query = supabase
      .from('vote_summaries')
      .select('*')
      .order(sort_by, { ascending: false })
      .limit(limit)

    if (target_id) {
      query = query.eq('target_id', target_id)
    }

    if (target_type) {
      query = query.eq('target_type', target_type)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching vote summaries:', error)
      return NextResponse.json({ error: 'Failed to fetch vote summaries' }, { status: 500 })
    }

    return NextResponse.json({ summaries: data })
  } catch (error) {
    console.error('Error in vote-summaries GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/vote-summaries - 重新计算投票摘要
export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
    }

    const body = await request.json()
    const { target_id, target_type } = body

    if (!target_id || !target_type) {
      return NextResponse.json({ error: 'Missing target_id or target_type' }, { status: 400 })
    }

    // 验证目标类型
    const validTargetTypes = ['city', 'place']
    if (!validTargetTypes.includes(target_type)) {
      return NextResponse.json({ error: 'Invalid target_type' }, { status: 400 })
    }

    // 调用数据库函数重新计算投票摘要
    const { data, error } = await supabase.rpc('update_vote_summary', {
      target_uuid: target_id,
      target_type_param: target_type
    })

    if (error) {
      console.error('Error updating vote summary:', error)
      return NextResponse.json({ error: 'Failed to update vote summary' }, { status: 500 })
    }

    // 获取更新后的摘要
    const { data: summary, error: fetchError } = await supabase
      .from('vote_summaries')
      .select('*')
      .eq('target_id', target_id)
      .eq('target_type', target_type)
      .single()

    if (fetchError) {
      console.error('Error fetching updated summary:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch updated summary' }, { status: 500 })
    }

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Error in vote-summaries POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
