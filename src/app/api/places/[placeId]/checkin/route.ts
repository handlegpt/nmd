import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logInfo, logError } from '@/lib/logger'

// POST /api/places/[placeId]/checkin - 用户Check-in
export async function POST(
  request: NextRequest,
  { params }: { params: { placeId: string } }
) {
  try {
    const { placeId } = params
    const body = await request.json()
    
    const { user_id, user_name, check_in_date, notes } = body
    
    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    logInfo('Processing place check-in', { placeId, user_id }, 'PlaceCheckinAPI')
    
    // 检查是否已经Check-in过今天
    const today = new Date().toISOString().split('T')[0]
    const { data: existingCheckin } = await supabase
      .from('place_checkins')
      .select('id')
      .eq('place_id', placeId)
      .eq('user_id', user_id)
      .eq('check_in_date', today)
      .single()
    
    if (existingCheckin) {
      return NextResponse.json({ 
        error: 'Already checked in today',
        checkin: existingCheckin 
      }, { status: 409 })
    }
    
    // 创建Check-in记录
    const { data: checkin, error } = await supabase
      .from('place_checkins')
      .insert({
        place_id: placeId,
        user_id,
        user_name: user_name || 'Anonymous',
        check_in_date: check_in_date || today,
        notes: notes || '',
        check_in_time: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      logError('Error creating check-in', error, 'PlaceCheckinAPI')
      return NextResponse.json({ error: 'Failed to create check-in' }, { status: 500 })
    }
    
    // 更新地点的Check-in计数
    await updatePlaceCheckinCount(placeId)
    
    logInfo('Successfully created check-in', { checkinId: checkin.id }, 'PlaceCheckinAPI')
    return NextResponse.json({ checkin }, { status: 201 })
    
  } catch (error) {
    logError('Unexpected error in place check-in API', error, 'PlaceCheckinAPI')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/places/[placeId]/checkin - 获取Check-in统计
export async function GET(
  request: NextRequest,
  { params }: { params: { placeId: string } }
) {
  try {
    const { placeId } = params
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    
    logInfo('Fetching place check-in stats', { placeId, user_id }, 'PlaceCheckinAPI')
    
    // 获取总Check-in数
    const { count: totalCheckins } = await supabase
      .from('place_checkins')
      .select('*', { count: 'exact', head: true })
      .eq('place_id', placeId)
    
    // 获取今日Check-in数
    const today = new Date().toISOString().split('T')[0]
    const { count: todayCheckins } = await supabase
      .from('place_checkins')
      .select('*', { count: 'exact', head: true })
      .eq('place_id', placeId)
      .eq('check_in_date', today)
    
    // 如果提供了user_id，检查用户是否已Check-in
    let userCheckedIn = false
    if (user_id) {
      const { data: userCheckin } = await supabase
        .from('place_checkins')
        .select('id')
        .eq('place_id', placeId)
        .eq('user_id', user_id)
        .eq('check_in_date', today)
        .single()
      
      userCheckedIn = !!userCheckin
    }
    
    // 获取最近的Check-in记录
    const { data: recentCheckins } = await supabase
      .from('place_checkins')
      .select('user_name, check_in_time, notes')
      .eq('place_id', placeId)
      .order('check_in_time', { ascending: false })
      .limit(5)
    
    const stats = {
      total_checkins: totalCheckins || 0,
      today_checkins: todayCheckins || 0,
      user_checked_in: userCheckedIn,
      recent_checkins: recentCheckins || []
    }
    
    logInfo('Successfully fetched check-in stats', stats, 'PlaceCheckinAPI')
    return NextResponse.json({ stats })
    
  } catch (error) {
    logError('Unexpected error in place check-in API', error, 'PlaceCheckinAPI')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 更新地点的Check-in计数
async function updatePlaceCheckinCount(placeId: string) {
  try {
    const { count } = await supabase
      .from('place_checkins')
      .select('*', { count: 'exact', head: true })
      .eq('place_id', placeId)
    
    await supabase
      .from('places')
      .update({ check_in_count: count || 0 })
      .eq('id', placeId)
    
    logInfo('Updated place check-in count', { placeId, count }, 'PlaceCheckinAPI')
  } catch (error) {
    logError('Error updating place check-in count', error, 'PlaceCheckinAPI')
  }
}
