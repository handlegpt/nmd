import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// GET /api/city-votes - 获取城市投票
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const city_id = searchParams.get('city_id')
    const user_id = searchParams.get('user_id')
    const vote_type = searchParams.get('vote_type')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('city_votes')
      .select(`
        *,
        city:city_id(id, name, country),
        user:user_id(id, name, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (city_id) {
      query = query.eq('city_id', city_id)
    }

    if (user_id) {
      query = query.eq('user_id', user_id)
    }

    if (vote_type) {
      query = query.eq('vote_type', vote_type)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching city votes:', error)
      return NextResponse.json({ error: 'Failed to fetch city votes' }, { status: 500 })
    }

    return NextResponse.json({ votes: data })
  } catch (error) {
    console.error('Error in city-votes GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/city-votes - 创建城市投票
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
    }

    const body = await request.json()
    const { city_id, user_id, vote_type, vote_weight = 1 } = body

    // 验证必需字段
    if (!city_id || !user_id || !vote_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 验证投票类型
    const validVoteTypes = ['upvote', 'downvote', 'neutral']
    if (!validVoteTypes.includes(vote_type)) {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 })
    }

    // 验证投票权重
    if (vote_weight < 1 || vote_weight > 5) {
      return NextResponse.json({ error: 'Vote weight must be between 1 and 5' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('city_votes')
      .upsert({
        city_id,
        user_id,
        vote_type,
        vote_weight
      })
      .select(`
        *,
        city:city_id(id, name, country),
        user:user_id(id, name, avatar_url)
      `)
      .single()

    if (error) {
      console.error('Error creating city vote:', error)
      return NextResponse.json({ error: 'Failed to create vote' }, { status: 500 })
    }

    return NextResponse.json({ vote: data }, { status: 201 })
  } catch (error) {
    console.error('Error in city-votes POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/city-votes - 删除城市投票
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const city_id = searchParams.get('city_id')
    const user_id = searchParams.get('user_id')

    if (!city_id || !user_id) {
      return NextResponse.json({ error: 'Missing city_id or user_id' }, { status: 400 })
    }

    const { error } = await supabase
      .from('city_votes')
      .delete()
      .eq('city_id', city_id)
      .eq('user_id', user_id)

    if (error) {
      console.error('Error deleting city vote:', error)
      return NextResponse.json({ error: 'Failed to delete vote' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Vote deleted successfully' })
  } catch (error) {
    console.error('Error in city-votes DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
