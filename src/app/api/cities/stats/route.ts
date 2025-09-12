import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logInfo, logError } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    logInfo('Fetching cities statistics', {}, 'CitiesStatsAPI')
    
    // 获取所有用户的城市分布
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        current_city,
        is_online,
        is_available,
        last_seen
      `)
      .not('current_city', 'is', null)
      .neq('current_city', 'Unknown Location')

    if (error) {
      logError('Failed to fetch cities statistics', error, 'CitiesStatsAPI')
      return NextResponse.json(
        { error: 'Failed to fetch cities statistics' },
        { status: 500 }
      )
    }

    // 统计城市数据
    const cityStats = new Map<string, {
      name: string
      totalUsers: number
      onlineUsers: number
      availableUsers: number
      lastActivity: string
    }>()

    users?.forEach((user: any) => {
      const city = user.current_city
      if (!city) return

      if (!cityStats.has(city)) {
        cityStats.set(city, {
          name: city,
          totalUsers: 0,
          onlineUsers: 0,
          availableUsers: 0,
          lastActivity: user.last_seen || new Date().toISOString()
        })
      }

      const stats = cityStats.get(city)!
      stats.totalUsers++
      
      if (user.is_online) {
        stats.onlineUsers++
      }
      
      if (user.is_online && user.is_available) {
        stats.availableUsers++
      }

      // 更新最后活动时间
      if (user.last_seen && user.last_seen > stats.lastActivity) {
        stats.lastActivity = user.last_seen
      }
    })

    // 计算总体统计
    const totalCities = cityStats.size
    const totalUsers = users?.length || 0
    const totalOnlineUsers = users?.filter((u: any) => u.is_online).length || 0
    const totalAvailableUsers = users?.filter((u: any) => u.is_online && u.is_available).length || 0

    // 获取最活跃的城市
    const mostActiveCities = Array.from(cityStats.values())
      .sort((a, b) => b.onlineUsers - a.onlineUsers)
      .slice(0, 5)

    // 计算社区评分（基于活跃度和用户数量）
    const communityRating = calculateCommunityRating(totalUsers, totalOnlineUsers, totalAvailableUsers)

    const result = {
      totalCities,
      totalUsers,
      totalOnlineUsers,
      totalAvailableUsers,
      communityRating,
      successRate: totalUsers > 0 ? Math.round((totalAvailableUsers / totalUsers) * 100) : 0,
      avgConnectionTime: calculateAvgConnectionTime(users || []),
      mostActiveCities: mostActiveCities.map(city => ({
        name: city.name,
        users: city.totalUsers,
        onlineUsers: city.onlineUsers,
        availableUsers: city.availableUsers,
        activity: Math.round((city.onlineUsers / Math.max(city.totalUsers, 1)) * 100)
      }))
    }

    logInfo('Cities statistics fetched successfully', { 
      totalCities: result.totalCities,
      totalUsers: result.totalUsers 
    }, 'CitiesStatsAPI')
    
    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logError('Unexpected error in cities stats API', error, 'CitiesStatsAPI')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 计算社区评分
function calculateCommunityRating(totalUsers: number, onlineUsers: number, availableUsers: number): number {
  if (totalUsers === 0) return 0
  
  const onlineRate = onlineUsers / totalUsers
  const availableRate = availableUsers / totalUsers
  
  // 基础分数 + 在线率 + 可用率
  const baseScore = 3.0
  const onlineBonus = onlineRate * 1.0
  const availableBonus = availableRate * 1.0
  
  return Math.min(5.0, Math.round((baseScore + onlineBonus + availableBonus) * 10) / 10)
}

// 计算平均连接时间
function calculateAvgConnectionTime(users: any[]): number {
  if (users.length === 0) return 0
  
  const now = new Date()
  const totalHours = users.reduce((sum, user) => {
    const lastSeen = new Date(user.last_seen || user.created_at)
    const hours = (now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60)
    return sum + Math.min(hours, 168) // 最多一周
  }, 0)
  
  return Math.round((totalHours / users.length) * 10) / 10
}
