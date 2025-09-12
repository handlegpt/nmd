import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/user-ratings - 获取用户评分
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('user_ratings')
      .select(`
        *,
        rater:rater_id(id, name, avatar_url),
        rated_user:rated_user_id(id, name, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (userId) {
      query = query.eq('rated_user_id', userId)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching user ratings:', error)
      return NextResponse.json({ error: 'Failed to fetch user ratings' }, { status: 500 })
    }

    return NextResponse.json({ ratings: data })
  } catch (error) {
    console.error('Error in user-ratings GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/user-ratings - 创建用户评分
export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
    }

    const body = await request.json()
    const { rater_id, rated_user_id, category, rating } = body

    // 验证必需字段
    if (!rater_id || !rated_user_id || !category || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 验证评分范围
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // 验证分类
    const validCategories = ['communication', 'reliability', 'friendliness', 'professionalism', 'overall']
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    // 不能给自己评分
    if (rater_id === rated_user_id) {
      return NextResponse.json({ error: 'Cannot rate yourself' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('user_ratings')
      .insert({
        rater_id,
        rated_user_id,
        category,
        rating
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user rating:', error)
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Rating already exists for this category' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Failed to create rating' }, { status: 500 })
    }

    return NextResponse.json({ rating: data }, { status: 201 })
  } catch (error) {
    console.error('Error in user-ratings POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
