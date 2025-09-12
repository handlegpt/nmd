import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// GET /api/meetups/[id]/participants - 获取聚会参与者
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
      .from('meetup_participants')
      .select(`
        *,
        user:user_id(id, name, avatar_url, current_city, profession)
      `)
      .eq('meetup_id', params.id)
      .order('joined_at', { ascending: true })

    if (error) {
      console.error('Error fetching meetup participants:', error)
      return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 })
    }

    return NextResponse.json({ participants: data })
  } catch (error) {
    console.error('Error in meetup participants GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/meetups/[id]/participants - 加入聚会
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // 检查聚会是否存在且未满
    const { data: meetup, error: meetupError } = await supabase
      .from('meetups')
      .select('id, max_participants, current_participants, status')
      .eq('id', params.id)
      .single()

    if (meetupError) {
      console.error('Error fetching meetup:', meetupError)
      return NextResponse.json({ error: 'Meetup not found' }, { status: 404 })
    }

    if (meetup.status !== 'active') {
      return NextResponse.json({ error: 'Meetup is not active' }, { status: 400 })
    }

    if (meetup.current_participants >= meetup.max_participants) {
      return NextResponse.json({ error: 'Meetup is full' }, { status: 400 })
    }

    // 检查用户是否已经参与
    const { data: existingParticipant } = await supabase
      .from('meetup_participants')
      .select('id')
      .eq('meetup_id', params.id)
      .eq('user_id', user_id)
      .single()

    if (existingParticipant) {
      return NextResponse.json({ error: 'User is already a participant' }, { status: 409 })
    }

    // 添加参与者
    const { data, error } = await supabase
      .from('meetup_participants')
      .insert({
        meetup_id: params.id,
        user_id,
        status: 'joined'
      })
      .select(`
        *,
        user:user_id(id, name, avatar_url, current_city)
      `)
      .single()

    if (error) {
      console.error('Error adding participant:', error)
      return NextResponse.json({ error: 'Failed to join meetup' }, { status: 500 })
    }

    return NextResponse.json({ participant: data }, { status: 201 })
  } catch (error) {
    console.error('Error in meetup participants POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/meetups/[id]/participants - 离开聚会
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
    }

    const { error } = await supabase
      .from('meetup_participants')
      .delete()
      .eq('meetup_id', params.id)
      .eq('user_id', user_id)

    if (error) {
      console.error('Error removing participant:', error)
      return NextResponse.json({ error: 'Failed to leave meetup' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Successfully left meetup' })
  } catch (error) {
    console.error('Error in meetup participants DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
