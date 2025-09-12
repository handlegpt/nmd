import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logInfo, logError } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    logInfo('Fetching users leaderboard data', {}, 'UsersLeaderboardAPI')
    
    // 获取活跃用户数据
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        avatar_url,
        current_city,
        profession,
        is_online,
        is_available,
        last_seen,
        created_at
      `)
      .not('name', 'is', null)
      .neq('current_city', 'Unknown Location')
      .order('last_seen', { ascending: false })
      .limit(50)

    if (error) {
      logError('Failed to fetch users leaderboard data', error, 'UsersLeaderboardAPI')
      return NextResponse.json(
        { error: 'Failed to fetch users leaderboard data' },
        { status: 500 }
      )
    }

    // 计算用户活跃度分数
    const now = new Date()
    const leaderboard = users?.map((user: any) => {
      const lastSeen = new Date(user.last_seen || user.created_at)
      const hoursSinceLastSeen = (now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60)
      
      // 计算活跃度分数
      let activityScore = 0
      if (user.is_online) activityScore += 50
      if (user.is_available) activityScore += 30
      if (hoursSinceLastSeen < 1) activityScore += 20
      else if (hoursSinceLastSeen < 24) activityScore += 10
      else if (hoursSinceLastSeen < 168) activityScore += 5 // 一周内
      
      // 根据注册时间给予基础分数
      const daysSinceRegistration = (now.getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceRegistration < 7) activityScore += 15 // 新用户奖励
      
      return {
        id: user.id,
        name: user.name,
        avatar: user.avatar_url,
        city: user.current_city,
        profession: user.profession,
        isOnline: user.is_online,
        isAvailable: user.is_available,
        lastSeen: user.last_seen,
        activityScore: Math.round(activityScore),
        badge: getUserBadge(activityScore, user.is_online, user.is_available)
      }
    }).sort((a: any, b: any) => b.activityScore - a.activityScore).slice(0, 20) || []

    logInfo('Users leaderboard data fetched successfully', { count: leaderboard.length }, 'UsersLeaderboardAPI')
    
    return NextResponse.json({
      success: true,
      data: leaderboard,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logError('Unexpected error in users leaderboard API', error, 'UsersLeaderboardAPI')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 根据活跃度分数和状态分配徽章
function getUserBadge(activityScore: number, isOnline: boolean, isAvailable: boolean): string {
  if (activityScore >= 90) return '🏆 Community Champion'
  if (activityScore >= 80) return '⭐ Super Active'
  if (activityScore >= 70) return '🔥 Very Active'
  if (activityScore >= 60) return '💪 Active'
  if (isOnline && isAvailable) return '🟢 Available Now'
  if (isOnline) return '🟡 Online'
  return '👋 New Member'
}
