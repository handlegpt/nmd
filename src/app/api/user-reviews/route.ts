import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// GET /api/user-reviews - 获取用户评论
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('user_reviews')
      .select(`
        *,
        reviewer:reviewer_id(id, name, avatar_url),
        reviewed_user:reviewed_user_id(id, name, avatar_url)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (userId) {
      query = query.eq('reviewed_user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching user reviews:', error)
      return NextResponse.json({ error: 'Failed to fetch user reviews' }, { status: 500 })
    }

    return NextResponse.json({ reviews: data })
  } catch (error) {
    console.error('Error in user-reviews GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/user-reviews - 创建用户评论
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
    }

    const body = await request.json()
    const { reviewer_id, reviewed_user_id, content, rating, is_public = true } = body

    // 验证必需字段
    if (!reviewer_id || !reviewed_user_id || !content || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 验证评分范围
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // 验证内容长度
    if (content.length < 10) {
      return NextResponse.json({ error: 'Review content must be at least 10 characters' }, { status: 400 })
    }

    // 不能给自己评论
    if (reviewer_id === reviewed_user_id) {
      return NextResponse.json({ error: 'Cannot review yourself' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('user_reviews')
      .insert({
        reviewer_id,
        reviewed_user_id,
        content,
        rating,
        is_public
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user review:', error)
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Review already exists for this user' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
    }

    return NextResponse.json({ review: data }, { status: 201 })
  } catch (error) {
    console.error('Error in user-reviews POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
