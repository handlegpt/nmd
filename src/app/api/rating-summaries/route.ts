import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// GET /api/rating-summaries - 获取用户评分摘要
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('rating_summaries')
      .select(`
        *,
        user:user_id(id, name, avatar_url)
      `)
      .order('overall_rating', { ascending: false })
      .limit(limit)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching rating summaries:', error)
      return NextResponse.json({ error: 'Failed to fetch rating summaries' }, { status: 500 })
    }

    return NextResponse.json({ summaries: data })
  } catch (error) {
    console.error('Error in rating-summaries GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/rating-summaries - 重新计算用户评分摘要
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
    }

    const body = await request.json()
    const { user_id } = body

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
    }

    // 调用数据库函数重新计算评分摘要
    const { data, error } = await supabase.rpc('update_rating_summary', {
      user_uuid: user_id
    })

    if (error) {
      console.error('Error updating rating summary:', error)
      return NextResponse.json({ error: 'Failed to update rating summary' }, { status: 500 })
    }

    // 获取更新后的摘要
    const { data: summary, error: fetchError } = await supabase
      .from('rating_summaries')
      .select(`
        *,
        user:user_id(id, name, avatar_url)
      `)
      .eq('user_id', user_id)
      .single()

    if (fetchError) {
      console.error('Error fetching updated summary:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch updated summary' }, { status: 500 })
    }

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Error in rating-summaries POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
