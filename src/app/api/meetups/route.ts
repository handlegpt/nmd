import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/meetups - 获取聚会列表
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'active'
    const meetup_type = searchParams.get('type')
    const location = searchParams.get('location')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('meetups')
      .select(`
        *,
        organizer:organizer_id(id, name, avatar_url, current_city),
        participants:meetup_participants(
          id,
          status,
          joined_at,
          user:user_id(id, name, avatar_url)
        )
      `)
      .eq('status', status)
      .order('meeting_time', { ascending: true })
      .range(offset, offset + limit - 1)

    if (meetup_type) {
      query = query.eq('meetup_type', meetup_type)
    }

    if (location) {
      query = query.ilike('location', `%${location}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching meetups:', error)
      // 如果表不存在，返回空数组而不是错误
      if (error.code === '42P01') { // Table doesn't exist
        return NextResponse.json({ meetups: [] })
      }
      return NextResponse.json({ error: 'Failed to fetch meetups' }, { status: 500 })
    }

    return NextResponse.json({ meetups: data || [] })
  } catch (error) {
    console.error('Error in meetups GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/meetups - 创建聚会
export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
    }

    const body = await request.json()
    const { 
      organizer_id, 
      title, 
      description, 
      location, 
      meeting_time, 
      max_participants = 10,
      meetup_type = 'coffee',
      tags = []
    } = body

    // 验证必需字段
    if (!organizer_id || !title || !location || !meeting_time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 验证会议时间不能是过去
    const meetingDate = new Date(meeting_time)
    if (meetingDate <= new Date()) {
      return NextResponse.json({ error: 'Meeting time must be in the future' }, { status: 400 })
    }

    // 验证最大参与者数量
    if (max_participants < 2 || max_participants > 50) {
      return NextResponse.json({ error: 'Max participants must be between 2 and 50' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('meetups')
      .insert({
        organizer_id,
        title,
        description,
        location,
        meeting_time,
        max_participants,
        meetup_type,
        tags
      })
      .select(`
        *,
        organizer:organizer_id(id, name, avatar_url, current_city)
      `)
      .single()

    if (error) {
      console.error('Error creating meetup:', error)
      return NextResponse.json({ error: 'Failed to create meetup' }, { status: 500 })
    }

    // 自动将组织者添加为参与者
    await supabase
      .from('meetup_participants')
      .insert({
        meetup_id: data.id,
        user_id: organizer_id,
        status: 'joined'
      })

    return NextResponse.json({ meetup: data }, { status: 201 })
  } catch (error) {
    console.error('Error in meetups POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
