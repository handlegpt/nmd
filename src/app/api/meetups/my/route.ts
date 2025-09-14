import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logInfo, logError } from '@/lib/logger'

// 使用服务角色密钥来绕过RLS策略
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables for Supabase')
}

const supabase = supabaseUrl && supabaseServiceKey ? createClient(
  supabaseUrl,
  supabaseServiceKey
) : null

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database connection not available' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const type = searchParams.get('type') || 'all' // 'all', 'organized', 'participating'

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    let query

    if (type === 'organized') {
      // 获取用户组织的meetups
      query = supabase
        .from('meetups')
        .select(`
          *,
          organizer:organizer_id(id, name, avatar_url, current_city),
          participants:meetup_participants(
            id,
            status,
            joined_at,
            user:user_id(id, name, avatar_url, current_city)
          )
        `)
        .eq('organizer_id', userId)
        .order('meeting_time', { ascending: true })
    } else if (type === 'participating') {
      // 获取用户参与的meetups
      query = supabase
        .from('meetup_participants')
        .select(`
          meetup:meetup_id(
            *,
            organizer:organizer_id(id, name, avatar_url, current_city),
            participants:meetup_participants(
              id,
              status,
              joined_at,
              user:user_id(id, name, avatar_url, current_city)
            )
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'joined')
        .order('joined_at', { ascending: false })
    } else {
      // 获取用户相关的所有meetups（组织或参与）
      const { data: organizedMeetups } = await supabase
        .from('meetups')
        .select(`
          *,
          organizer:organizer_id(id, name, avatar_url, current_city),
          participants:meetup_participants(
            id,
            status,
            joined_at,
            user:user_id(id, name, avatar_url, current_city)
          )
        `)
        .eq('organizer_id', userId)

      const { data: participatingMeetups } = await supabase
        .from('meetup_participants')
        .select(`
          meetup:meetup_id(
            *,
            organizer:organizer_id(id, name, avatar_url, current_city),
            participants:meetup_participants(
              id,
              status,
              joined_at,
              user:user_id(id, name, avatar_url, current_city)
            )
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'joined')

      // 合并并去重
      const allMeetups = [
        ...(organizedMeetups || []),
        ...(participatingMeetups?.map(p => p.meetup).filter(Boolean) || [])
      ]

      // 去重（基于meetup ID）
      const uniqueMeetups = allMeetups.filter((meetup, index, self) => 
        index === self.findIndex(m => m.id === meetup.id)
      )

      // 按时间排序
      uniqueMeetups.sort((a, b) => new Date(a.meeting_time).getTime() - new Date(b.meeting_time).getTime())

      return NextResponse.json({
        success: true,
        data: uniqueMeetups
      })
    }

    const { data, error } = await query

    if (error) {
      logError('Failed to fetch user meetups', error, 'MyMeetupsAPI')
      return NextResponse.json(
        { success: false, error: 'Failed to fetch meetups' },
        { status: 500 }
      )
    }

    // 如果是participating类型，需要提取meetup数据
    const meetups = type === 'participating' 
      ? data?.map(p => p.meetup).filter(Boolean) || []
      : data || []

    logInfo('User meetups fetched successfully', { 
      userId, 
      type, 
      count: meetups.length 
    }, 'MyMeetupsAPI')

    return NextResponse.json({
      success: true,
      data: meetups
    })

  } catch (error) {
    logError('Unexpected error in my meetups API', error, 'MyMeetupsAPI')
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
