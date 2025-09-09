import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logInfo, logError } from '@/lib/logger'

// GET /api/realtime/online-users - 获取在线用户
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const place_id = searchParams.get('place_id')
    
    logInfo('Fetching online users', { place_id }, 'OnlineUsersAPI')
    
    // 获取最近5分钟内有活动的用户
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    
    let query = supabase
      .from('user_activity')
      .select(`
        user_id,
        last_seen,
        current_page,
        user:users(name, avatar_url)
      `)
      .gte('last_seen', fiveMinutesAgo)
      .order('last_seen', { ascending: false })
    
    if (place_id) {
      query = query.eq('current_page', `place-${place_id}`)
    }
    
    const { data: onlineUsers, error } = await query
    
    if (error) {
      logError('Error fetching online users', error, 'OnlineUsersAPI')
      return NextResponse.json({ error: 'Failed to fetch online users' }, { status: 500 })
    }
    
    // 去重并格式化数据
    const uniqueUsers = onlineUsers?.reduce((acc: any[], user: any) => {
      if (!acc.find(u => u.user_id === user.user_id)) {
        acc.push({
          user_id: user.user_id,
          name: user.user?.name || 'Anonymous',
          avatar_url: user.user?.avatar_url,
          last_seen: user.last_seen,
          current_page: user.current_page
        })
      }
      return acc
    }, [] as any[]) || []
    
    logInfo('Successfully fetched online users', { count: uniqueUsers.length }, 'OnlineUsersAPI')
    return NextResponse.json({ online_users: uniqueUsers })
    
  } catch (error) {
    logError('Unexpected error in online users API', error, 'OnlineUsersAPI')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/realtime/online-users - 更新用户活动状态
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, current_page, user_name } = body
    
    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    logInfo('Updating user activity', { user_id, current_page }, 'OnlineUsersAPI')
    
    const now = new Date().toISOString()
    
    // 使用upsert更新或插入用户活动记录
    const { data, error } = await supabase
      .from('user_activity')
      .upsert({
        user_id,
        user_name: user_name || 'Anonymous',
        current_page: current_page || 'unknown',
        last_seen: now,
        updated_at: now
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()
    
    if (error) {
      logError('Error updating user activity', error, 'OnlineUsersAPI')
      return NextResponse.json({ error: 'Failed to update user activity' }, { status: 500 })
    }
    
    logInfo('Successfully updated user activity', { user_id }, 'OnlineUsersAPI')
    return NextResponse.json({ success: true, activity: data })
    
  } catch (error) {
    logError('Unexpected error in online users API', error, 'OnlineUsersAPI')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
