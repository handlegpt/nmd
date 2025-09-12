import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logInfo, logError } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    logInfo('Fetching hot cities data', {}, 'HotCitiesAPI')
    
    // 获取热门城市数据 - 基于用户数量和活跃度
    const { data: hotCities, error } = await supabase
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
      logError('Failed to fetch hot cities data', error, 'HotCitiesAPI')
      return NextResponse.json(
        { error: 'Failed to fetch hot cities data' },
        { status: 500 }
      )
    }

    // 处理数据：统计每个城市的用户数量和在线状态
    const cityStats = new Map<string, {
      name: string
      totalUsers: number
      onlineUsers: number
      availableUsers: number
      lastActivity: string
    }>()

    hotCities?.forEach((user: any) => {
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

    // 转换为数组并按在线用户数排序
    const sortedCities = Array.from(cityStats.values())
      .sort((a, b) => b.onlineUsers - a.onlineUsers)
      .slice(0, 10) // 取前10个热门城市

    // 获取城市详细信息（咖啡价格、WiFi速度等）
    const cityNames = sortedCities.map(city => city.name)
    const { data: cityDetails, error: cityError } = await supabase
      .from('cities')
      .select('name, cost_of_living, wifi_speed')
      .in('name', cityNames)

    if (cityError) {
      logError('Failed to fetch city details', cityError, 'HotCitiesAPI')
    }

    // 合并数据
    const result = sortedCities.map(city => {
      const details = cityDetails?.find((d: any) => d.name === city.name)
      return {
        name: city.name,
        onlineCount: city.onlineUsers,
        totalUsers: city.totalUsers,
        availableUsers: city.availableUsers,
        coffeePrice: details?.cost_of_living ? Math.round(details.cost_of_living * 0.1 * 100) / 100 : 2.5, // 估算咖啡价格
        wifiSpeed: details?.wifi_speed || 50, // 默认WiFi速度
        lastActivity: city.lastActivity,
        hotness: Math.min(100, Math.round((city.onlineUsers / Math.max(city.totalUsers, 1)) * 100)) // 热度百分比
      }
    })

    logInfo('Hot cities data fetched successfully', { count: result.length }, 'HotCitiesAPI')
    
    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logError('Unexpected error in hot cities API', error, 'HotCitiesAPI')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
