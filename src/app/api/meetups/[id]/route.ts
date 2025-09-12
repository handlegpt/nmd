import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// GET /api/meetups/[id] - 获取特定聚会详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
    }

    const { data, error } = await supabase
      .from('meetups')
      .select(`
        *,
        organizer:organizer_id(id, name, avatar_url, current_city),
        participants:meetup_participants(
          id,
          status,
          joined_at,
          user:user_id(id, name, avatar_url, current_city)
        ),
        activities:meetup_activities(
          id,
          activity_type,
          activity_data,
          created_at,
          user:user_id(id, name, avatar_url)
        ),
        reviews:meetup_reviews(
          id,
          content,
          rating,
          created_at,
          reviewer:reviewer_id(id, name, avatar_url)
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching meetup:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Meetup not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch meetup' }, { status: 500 })
    }

    return NextResponse.json({ meetup: data })
  } catch (error) {
    console.error('Error in meetup GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/meetups/[id] - 更新聚会
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
    }

    const body = await request.json()
    const { 
      title, 
      description, 
      location, 
      meeting_time, 
      max_participants,
      status,
      tags
    } = body

    // 构建更新对象
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (location !== undefined) updateData.location = location
    if (meeting_time !== undefined) updateData.meeting_time = meeting_time
    if (max_participants !== undefined) updateData.max_participants = max_participants
    if (status !== undefined) updateData.status = status
    if (tags !== undefined) updateData.tags = tags

    const { data, error } = await supabase
      .from('meetups')
      .update(updateData)
      .eq('id', params.id)
      .select(`
        *,
        organizer:organizer_id(id, name, avatar_url, current_city)
      `)
      .single()

    if (error) {
      console.error('Error updating meetup:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Meetup not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to update meetup' }, { status: 500 })
    }

    return NextResponse.json({ meetup: data })
  } catch (error) {
    console.error('Error in meetup PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/meetups/[id] - 删除聚会
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
    }

    const { error } = await supabase
      .from('meetups')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting meetup:', error)
      return NextResponse.json({ error: 'Failed to delete meetup' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Meetup deleted successfully' })
  } catch (error) {
    console.error('Error in meetup DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
