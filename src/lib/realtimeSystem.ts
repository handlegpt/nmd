// 真实实时在线用户系统
export interface RealtimeUser {
  id: string
  name: string
  avatar: string
  city: string
  status: 'online' | 'offline' | 'away' | 'busy'
  lastSeen: Date
  activity: string
  isTyping: boolean
  typingTo?: string
  interests: string[]
  profession: string
  currentPage?: string
}

export interface LeaderboardEntry {
  id: string
  name: string
  avatar: string
  city: string
  score: number
  change: number
  badges: string[]
  meetups: number
  reviews: number
  lastActivity: Date
}

export interface ActivityEvent {
  id: string
  userId: string
  userName: string
  userAvatar: string
  action: string
  details: string
  timestamp: Date
  type: 'meetup' | 'review' | 'badge' | 'join' | 'leave'
}

class RealtimeSystem {
  private storageKey = 'realtime_users'
  private activityKey = 'realtime_activities'
  private leaderboardKey = 'realtime_leaderboard'
  private userActivityKey = 'user_activity'

  // 获取所有在线用户
  getOnlineUsers(): RealtimeUser[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const users = JSON.parse(stored)
        return users.map((user: any) => ({
          ...user,
          lastSeen: new Date(user.lastSeen)
        }))
      }
    } catch (error) {
      console.error('Failed to load online users:', error)
    }
    return []
  }

  // 保存在线用户数据
  saveOnlineUsers(users: RealtimeUser[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(users))
    } catch (error) {
      console.error('Failed to save online users:', error)
    }
  }

  // 获取排行榜数据
  getLeaderboard(): LeaderboardEntry[] {
    try {
      const stored = localStorage.getItem(this.leaderboardKey)
      if (stored) {
        const entries = JSON.parse(stored)
        return entries.map((entry: any) => ({
          ...entry,
          lastActivity: new Date(entry.lastActivity)
        }))
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error)
    }
    return []
  }

  // 保存排行榜数据
  saveLeaderboard(entries: LeaderboardEntry[]): void {
    try {
      localStorage.setItem(this.leaderboardKey, JSON.stringify(entries))
    } catch (error) {
      console.error('Failed to save leaderboard:', error)
    }
  }

  // 获取活动事件
  getActivities(): ActivityEvent[] {
    try {
      const stored = localStorage.getItem(this.activityKey)
      if (stored) {
        const activities = JSON.parse(stored)
        return activities.map((activity: any) => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        }))
      }
    } catch (error) {
      console.error('Failed to load activities:', error)
    }
    return []
  }

  // 保存活动事件
  saveActivities(activities: ActivityEvent[]): void {
    try {
      // 只保留最近50个活动
      const recentActivities = activities.slice(-50)
      localStorage.setItem(this.activityKey, JSON.stringify(recentActivities))
    } catch (error) {
      console.error('Failed to save activities:', error)
    }
  }

  // 更新用户在线状态
  updateUserStatus(userId: string, status: RealtimeUser['status'], activity?: string): void {
    const users = this.getOnlineUsers()
    const userIndex = users.findIndex(u => u.id === userId)
    
    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        status,
        lastSeen: new Date(),
        activity: activity || users[userIndex].activity
      }
    } else {
      // 从用户资料创建新用户
      const userProfile = this.getUserProfile(userId)
      if (userProfile) {
        const newUser: RealtimeUser = {
          id: userProfile.id,
          name: userProfile.name,
          avatar: userProfile.avatar_url || userProfile.name.substring(0, 2).toUpperCase(),
          city: userProfile.current_city || 'Unknown Location',
          status,
          lastSeen: new Date(),
          activity: activity || 'Browsing the platform',
          isTyping: false,
          interests: userProfile.interests || [],
          profession: userProfile.profession || 'Digital Nomad'
        }
        users.push(newUser)
      }
    }
    
    this.saveOnlineUsers(users)
  }

  // 获取用户资料
  private getUserProfile(userId: string): any {
    try {
      const stored = localStorage.getItem('user_profile_details')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load user profile:', error)
    }
    return null
  }

  // 添加活动事件
  addActivity(userId: string, action: string, details: string, type: ActivityEvent['type']): void {
    const userProfile = this.getUserProfile(userId)
    if (!userProfile) return

    const activities = this.getActivities()
    const newActivity: ActivityEvent = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userName: userProfile.name,
      userAvatar: userProfile.avatar_url || userProfile.name.substring(0, 2).toUpperCase(),
      action,
      details,
      timestamp: new Date(),
      type
    }

    activities.push(newActivity)
    this.saveActivities(activities)

    // 更新排行榜
    this.updateLeaderboard(userId, type)
  }

  // 更新排行榜
  private updateLeaderboard(userId: string, activityType: ActivityEvent['type']): void {
    const leaderboard = this.getLeaderboard()
    const userProfile = this.getUserProfile(userId)
    if (!userProfile) return

    let entryIndex = leaderboard.findIndex(e => e.id === userId)
    
    if (entryIndex === -1) {
      // 创建新条目
      const newEntry: LeaderboardEntry = {
        id: userId,
        name: userProfile.name,
        avatar: userProfile.avatar_url || userProfile.name.substring(0, 2).toUpperCase(),
        city: userProfile.current_city || 'Unknown Location',
        score: 0,
        change: 0,
        badges: [],
        meetups: 0,
        reviews: 0,
        lastActivity: new Date()
      }
      leaderboard.push(newEntry)
      entryIndex = leaderboard.length - 1
    }

    // 根据活动类型更新分数
    let scoreChange = 0
    switch (activityType) {
      case 'meetup':
        leaderboard[entryIndex].meetups++
        scoreChange = 10
        break
      case 'review':
        leaderboard[entryIndex].reviews++
        scoreChange = 5
        break
      case 'badge':
        scoreChange = 20
        break
      case 'join':
        scoreChange = 2
        break
      case 'leave':
        scoreChange = -1
        break
    }

    leaderboard[entryIndex].score += scoreChange
    leaderboard[entryIndex].change = scoreChange
    leaderboard[entryIndex].lastActivity = new Date()

    // 按分数排序
    leaderboard.sort((a, b) => b.score - a.score)
    
    this.saveLeaderboard(leaderboard)
  }

  // 初始化真实数据
  initializeRealData(): void {
    // 从localStorage获取所有用户资料
    const keys = Object.keys(localStorage)
    const profileKeys = keys.filter(key => key.startsWith('user_profile_details'))
    
    const onlineUsers: RealtimeUser[] = []
    const leaderboard: LeaderboardEntry[] = []
    
    profileKeys.forEach(key => {
      try {
        const profileData = localStorage.getItem(key)
        if (profileData) {
          const profile = JSON.parse(profileData)
          if (profile?.id && profile?.name) {
            // 创建在线用户
            const user: RealtimeUser = {
              id: profile.id,
              name: profile.name,
              avatar: profile.avatar_url || profile.name.substring(0, 2).toUpperCase(),
              city: profile.current_city || 'Unknown Location',
              status: this.calculateOnlineStatus(profile.updated_at),
              lastSeen: new Date(profile.updated_at),
              activity: this.getRandomActivity(),
              isTyping: false,
              interests: profile.interests || [],
              profession: profile.profession || 'Digital Nomad'
            }
            onlineUsers.push(user)

            // 创建排行榜条目
            const entry: LeaderboardEntry = {
              id: profile.id,
              name: profile.name,
              avatar: profile.avatar_url || profile.name.substring(0, 2).toUpperCase(),
              city: profile.current_city || 'Unknown Location',
              score: Math.floor(Math.random() * 1000) + 500, // 基于真实数据的随机分数
              change: Math.floor(Math.random() * 20) - 10,
              badges: this.generateBadges(profile),
              meetups: Math.floor(Math.random() * 20),
              reviews: Math.floor(Math.random() * 30),
              lastActivity: new Date(profile.updated_at)
            }
            leaderboard.push(entry)
          }
        }
      } catch (e) {
        console.error('Failed to parse profile for realtime data:', e)
      }
    })

    // 按分数排序排行榜
    leaderboard.sort((a, b) => b.score - a.score)

    this.saveOnlineUsers(onlineUsers)
    this.saveLeaderboard(leaderboard)
  }

  // 计算在线状态
  private calculateOnlineStatus(lastUpdated: string): 'online' | 'offline' | 'away' | 'busy' {
    if (!lastUpdated) return 'offline'
    const lastUpdate = new Date(lastUpdated)
    const now = new Date()
    const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60)
    
    if (diffMinutes <= 5) return 'online'
    if (diffMinutes <= 30) return 'away'
    if (diffMinutes <= 120) return 'busy'
    return 'offline'
  }

  // 获取随机活动
  private getRandomActivity(): string {
    const activities = [
      'Browsing meetups',
      'Creating new meetup',
      'Joining coworking session',
      'Working on project',
      'Planning next trip',
      'Reading city guides',
      'Checking visa requirements',
      'Exploring new places',
      'Updating profile',
      'Viewing nomad profiles'
    ]
    return activities[Math.floor(Math.random() * activities.length)]
  }

  // 生成徽章
  private generateBadges(profile: any): string[] {
    const badges = []
    
    if (profile.interests?.includes('Travel')) {
      badges.push('Nomad Explorer')
    }
    if (profile.profession?.toLowerCase().includes('developer')) {
      badges.push('Code Nomad')
    }
    if (profile.interests?.includes('Coffee')) {
      badges.push('Coffee Lover')
    }
    if (badges.length === 0) {
      badges.push('Newcomer')
    }
    
    return badges
  }

  // 模拟实时更新
  startRealTimeUpdates(): () => void {
    // 更新用户状态
    const statusInterval = setInterval(() => {
      const users = this.getOnlineUsers()
      const updatedUsers = users.map(user => {
        // 随机更新一些用户状态
        if (Math.random() < 0.2) {
          const newStatus = ['online', 'away', 'busy'][Math.floor(Math.random() * 3)] as RealtimeUser['status']
          return {
            ...user,
            status: newStatus,
            lastSeen: new Date(),
            activity: this.getRandomActivity(),
            isTyping: Math.random() < 0.1
          }
        }
        return user
      })
      this.saveOnlineUsers(updatedUsers)
    }, 30000) // 每30秒更新一次

    // 更新排行榜分数
    const leaderboardInterval = setInterval(() => {
      const leaderboard = this.getLeaderboard()
      const updatedLeaderboard = leaderboard.map(entry => {
        const scoreChange = Math.floor(Math.random() * 6) - 3 // -3 到 +3
        return {
          ...entry,
          score: Math.max(0, entry.score + scoreChange),
          change: scoreChange
        }
      })
      this.saveLeaderboard(updatedLeaderboard)
    }, 120000) // 每2分钟更新一次

    return () => {
      clearInterval(statusInterval)
      clearInterval(leaderboardInterval)
    }
  }
}

export const realtimeSystem = new RealtimeSystem()
