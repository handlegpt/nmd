// Real-time API Service - 实时API服务
// 替代localStorage的realtimeSystem.ts

export interface OnlineUser {
  id: string
  user_id: string
  last_seen: string
  status: 'online' | 'away' | 'busy' | 'offline'
  location_data: Record<string, any>
  device_info: Record<string, any>
  created_at: string
  updated_at: string
  user?: {
    id: string
    name: string
    avatar_url?: string
    current_city?: string
    profession?: string
    is_visible_in_nomads?: boolean
  }
}

export interface LeaderboardEntry {
  id: string
  user_id: string
  score: number
  rank_position?: number
  category: 'overall' | 'meetups' | 'reviews' | 'activity'
  period: 'daily' | 'weekly' | 'monthly' | 'all_time'
  stats: Record<string, any>
  last_calculated: string
  created_at: string
  updated_at: string
  user?: {
    id: string
    name: string
    avatar_url?: string
    current_city?: string
    profession?: string
  }
}

export interface ActivityEvent {
  id: string
  user_id: string
  activity_type: string
  activity_data: Record<string, any>
  ip_address?: string
  user_agent?: string
  location_data: Record<string, any>
  created_at: string
}

class RealtimeApiService {
  private baseUrl = '/api'

  // 获取在线用户
  async getOnlineUsers(status?: string, limit = 50): Promise<OnlineUser[]> {
    try {
      const params = new URLSearchParams()
      if (status) params.append('status', status)
      params.append('limit', limit.toString())

      const response = await fetch(`${this.baseUrl}/online-users?${params}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch online users: ${response.statusText}`)
      }

      const data = await response.json()
      return data.online_users || []
    } catch (error) {
      console.error('Error fetching online users:', error)
      return []
    }
  }

  // 更新用户在线状态
  async updateOnlineStatus(
    userId: string,
    status: 'online' | 'away' | 'busy' | 'offline' = 'online',
    locationData: Record<string, any> = {},
    deviceInfo: Record<string, any> = {}
  ): Promise<OnlineUser | null> {
    try {
      const response = await fetch(`${this.baseUrl}/online-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          status,
          location_data: locationData,
          device_info: deviceInfo
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to update online status: ${response.statusText}`)
      }

      const data = await response.json()
      return data.online_user
    } catch (error) {
      console.error('Error updating online status:', error)
      return null
    }
  }

  // 批量更新在线状态
  async batchUpdateOnlineStatus(updates: Array<{
    user_id: string
    status: 'online' | 'away' | 'busy' | 'offline'
    location_data?: Record<string, any>
    device_info?: Record<string, any>
  }>): Promise<OnlineUser[]> {
    try {
      const response = await fetch(`${this.baseUrl}/online-users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_updates: updates
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to batch update online status: ${response.statusText}`)
      }

      const data = await response.json()
      return data.online_users || []
    } catch (error) {
      console.error('Error batch updating online status:', error)
      return []
    }
  }

  // 获取排行榜
  async getLeaderboard(
    category: 'overall' | 'meetups' | 'reviews' | 'activity' = 'overall',
    period: 'daily' | 'weekly' | 'monthly' | 'all_time' = 'all_time',
    limit = 20,
    offset = 0
  ): Promise<LeaderboardEntry[]> {
    try {
      const params = new URLSearchParams()
      params.append('category', category)
      params.append('period', period)
      params.append('limit', limit.toString())
      params.append('offset', offset.toString())

      const response = await fetch(`${this.baseUrl}/leaderboard?${params}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.statusText}`)
      }

      const data = await response.json()
      return data.leaderboard || []
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      return []
    }
  }

  // 重新计算排行榜
  async recalculateLeaderboard(
    category: 'overall' | 'meetups' | 'reviews' | 'activity' = 'overall',
    period: 'daily' | 'weekly' | 'monthly' | 'all_time' = 'all_time'
  ): Promise<LeaderboardEntry[]> {
    try {
      const response = await fetch(`${this.baseUrl}/leaderboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          period
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to recalculate leaderboard: ${response.statusText}`)
      }

      const data = await response.json()
      return data.leaderboard || []
    } catch (error) {
      console.error('Error recalculating leaderboard:', error)
      return []
    }
  }

  // 获取用户排行榜位置
  async getUserLeaderboardPosition(
    userId: string,
    category: 'overall' | 'meetups' | 'reviews' | 'activity' = 'overall',
    period: 'daily' | 'weekly' | 'monthly' | 'all_time' = 'all_time'
  ): Promise<LeaderboardEntry | null> {
    try {
      const leaderboard = await this.getLeaderboard(category, period, 1000) // 获取更多数据
      const userEntry = leaderboard.find(entry => entry.user_id === userId)
      return userEntry || null
    } catch (error) {
      console.error('Error fetching user leaderboard position:', error)
      return null
    }
  }

  // 获取在线用户统计
  async getOnlineStats(): Promise<{
    total: number
    online: number
    away: number
    busy: number
    offline: number
  }> {
    try {
      const onlineUsers = await this.getOnlineUsers()
      const stats = {
        total: onlineUsers.length,
        online: 0,
        away: 0,
        busy: 0,
        offline: 0
      }

      onlineUsers.forEach(user => {
        switch (user.status) {
          case 'online':
            stats.online++
            break
          case 'away':
            stats.away++
            break
          case 'busy':
            stats.busy++
            break
          case 'offline':
            stats.offline++
            break
        }
      })

      return stats
    } catch (error) {
      console.error('Error fetching online stats:', error)
      return { total: 0, online: 0, away: 0, busy: 0, offline: 0 }
    }
  }

  // 定期更新在线状态
  startOnlineStatusUpdater(userId: string, intervalMs = 30000): () => void {
    const updateStatus = async () => {
      await this.updateOnlineStatus(userId, 'online')
    }

    // 立即更新一次
    updateStatus()

    // 设置定期更新
    const interval = setInterval(updateStatus, intervalMs)

    // 页面可见性变化时更新状态
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateStatus()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // 返回清理函数
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }

  // 获取附近在线用户
  async getNearbyOnlineUsers(
    latitude: number,
    longitude: number,
    radiusKm = 50,
    limit = 20
  ): Promise<OnlineUser[]> {
    try {
      const onlineUsers = await this.getOnlineUsers('online', 100) // 获取更多在线用户
      
      // 简单的距离计算（实际应用中应该使用更精确的地理计算）
      const nearbyUsers = onlineUsers.filter(user => {
        if (!user.location_data?.latitude || !user.location_data?.longitude) {
          return false
        }

        const distance = this.calculateDistance(
          latitude,
          longitude,
          user.location_data.latitude,
          user.location_data.longitude
        )

        return distance <= radiusKm
      })

      return nearbyUsers.slice(0, limit)
    } catch (error) {
      console.error('Error fetching nearby online users:', error)
      return []
    }
  }

  // 计算两点间距离（公里）
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // 地球半径（公里）
    const dLat = this.deg2rad(lat2 - lat1)
    const dLon = this.deg2rad(lon2 - lon1)
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180)
  }
}

// 导出单例实例
export const realtimeApiService = new RealtimeApiService()
export default realtimeApiService
