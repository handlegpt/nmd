import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/online-users - 获取在线用户
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('online_users')
      .select(`
        *,
        user:user_id(id, name, avatar_url, current_city, profession, is_visible_in_nomads)
      `)
      .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // 5分钟内活跃
      .order('last_seen', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching online users:', error)
      return NextResponse.json({ error: 'Failed to fetch online users' }, { status: 500 })
    }

    // 过滤掉不可见的用户
    const visibleUsers = data?.filter((onlineUser: any) => 
      onlineUser.user?.is_visible_in_nomads === true
    ) || []

    return NextResponse.json({ 
      online_users: visibleUsers,
      count: visibleUsers.length
    })
  } catch (error) {
    console.error('Error in online-users GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/online-users - 更新用户在线状态
export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
    }

    const body = await request.json()
    const { 
      user_id, 
      status = 'online', 
      location_data = {}, 
      device_info = {} 
    } = body

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
    }

    // 验证状态值
    const validStatuses = ['online', 'away', 'busy', 'offline']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('online_users')
      .upsert({
        user_id,
        status,
        location_data,
        device_info,
        last_seen: new Date().toISOString()
      })
      .select(`
        *,
        user:user_id(id, name, avatar_url, current_city)
      `)
      .single()

    if (error) {
      console.error('Error updating online status:', error)
      return NextResponse.json({ error: 'Failed to update online status' }, { status: 500 })
    }

    return NextResponse.json({ online_user: data })
  } catch (error) {
    console.error('Error in online-users POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/online-users - 批量更新在线状态
export async function PUT(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
    }

    const body = await request.json()
    const { user_updates } = body

    if (!user_updates || !Array.isArray(user_updates)) {
      return NextResponse.json({ error: 'Invalid user_updates format' }, { status: 400 })
    }

    const updates = user_updates.map((update: any) => ({
      user_id: update.user_id,
      status: update.status || 'online',
      location_data: update.location_data || {},
      device_info: update.device_info || {},
      last_seen: new Date().toISOString()
    }))

    const { data, error } = await supabase
      .from('online_users')
      .upsert(updates)
      .select(`
        *,
        user:user_id(id, name, avatar_url, current_city)
      `)

    if (error) {
      console.error('Error batch updating online status:', error)
      return NextResponse.json({ error: 'Failed to update online statuses' }, { status: 500 })
    }

    return NextResponse.json({ online_users: data })
  } catch (error) {
    console.error('Error in online-users PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
