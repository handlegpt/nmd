import { logInfo, logError } from '@/lib/logger'

export interface UserProfile {
  id: string
  email: string
  name: string
  avatar: string
  bio?: string
  interests: string[]
  skills: string[]
  languages: string[]
  timezone: string
  currentLocation: {
    city: string
    country: string
    countryCode: string
    latitude: number
    longitude: number
  }
  onlineStatus: {
    isOnline: boolean
    lastSeen: string
    isAvailable: boolean
    status: 'online' | 'offline' | 'away' | 'busy'
  }
  preferences: {
    meetupRadius: number // 公里
    notificationSettings: {
      email: boolean
      push: boolean
      meetupInvites: boolean
      messages: boolean
    }
  }
  stats: {
    totalMeetups: number
    successfulMeetups: number
    rating: number
    memberSince: string
  }
}

export interface OnlineUser extends Pick<UserProfile, 'id' | 'name' | 'avatar' | 'interests' | 'timezone' | 'currentLocation' | 'onlineStatus'> {
  distance?: number // 距离当前用户的公里数
  mutualInterests?: string[] // 共同兴趣
  meetupCompatibility?: number // 0-100的匹配度
}

// 用户注册
export async function registerUser(userData: {
  email: string
  name: string
  interests: string[]
  skills: string[]
  languages: string[]
  timezone: string
  currentLocation: {
    city: string
    country: string
    countryCode: string
    latitude: number
    longitude: number
  }
}): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    logInfo('Registering new user', { email: userData.email }, 'userApi')
    
    // 这里应该调用真实的API
    // 目前使用模拟数据
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      email: userData.email,
      name: userData.name,
      avatar: userData.name.substring(0, 2).toUpperCase(),
      interests: userData.interests,
      skills: userData.skills,
      languages: userData.languages,
      timezone: userData.timezone,
      currentLocation: userData.currentLocation,
      onlineStatus: {
        isOnline: true,
        lastSeen: new Date().toISOString(),
        isAvailable: true,
        status: 'online'
      },
      preferences: {
        meetupRadius: 50,
        notificationSettings: {
          email: true,
          push: true,
          meetupInvites: true,
          messages: true
        }
      },
      stats: {
        totalMeetups: 0,
        successfulMeetups: 0,
        rating: 0,
        memberSince: new Date().toISOString()
      }
    }
    
    // 保存到本地存储（模拟数据库）
    const users = JSON.parse(localStorage.getItem('nomad_users') || '[]')
    users.push(newUser)
    localStorage.setItem('nomad_users', JSON.stringify(users))
    
    return { success: true, user: newUser }
  } catch (error) {
    logError('Failed to register user', error, 'userApi')
    return { success: false, error: 'Registration failed' }
  }
}

// 更新用户在线状态
export async function updateUserStatus(userId: string, status: {
  isOnline: boolean
  isAvailable: boolean
  status: 'online' | 'offline' | 'away' | 'busy'
}): Promise<{ success: boolean; error?: string }> {
  try {
    logInfo('Updating user status', { userId, status }, 'userApi')
    
    // 这里应该调用真实的API
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 更新本地存储
    const users = JSON.parse(localStorage.getItem('nomad_users') || '[]')
    const userIndex = users.findIndex((u: UserProfile) => u.id === userId)
    
    if (userIndex !== -1) {
      users[userIndex].onlineStatus = {
        ...users[userIndex].onlineStatus,
        ...status,
        lastSeen: new Date().toISOString()
      }
      localStorage.setItem('nomad_users', JSON.stringify(users))
    }
    
    return { success: true }
  } catch (error) {
    logError('Failed to update user status', error, 'userApi')
    return { success: false, error: 'Status update failed' }
  }
}

// 更新用户位置
export async function updateUserLocation(userId: string, location: {
  city: string
  country: string
  countryCode: string
  latitude: number
  longitude: number
}): Promise<{ success: boolean; error?: string }> {
  try {
    logInfo('Updating user location', { userId, location }, 'userApi')
    
    // 这里应该调用真实的API
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 更新本地存储
    const users = JSON.parse(localStorage.getItem('nomad_users') || '[]')
    const userIndex = users.findIndex((u: UserProfile) => u.id === userId)
    
    if (userIndex !== -1) {
      users[userIndex].currentLocation = location
      localStorage.setItem('nomad_users', JSON.stringify(users))
    }
    
    return { success: true }
  } catch (error) {
    logError('Failed to update user location', error, 'userApi')
    return { success: false, error: 'Location update failed' }
  }
}

// 获取在线用户（基于地理位置）
export async function getOnlineUsers(
  currentLocation: { latitude: number; longitude: number },
  radius: number = 50
): Promise<OnlineUser[]> {
  try {
    logInfo('Fetching online users', { currentLocation, radius }, 'userApi')
    
    // 这里应该调用真实的API
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 从本地存储获取用户数据
    const users = JSON.parse(localStorage.getItem('nomad_users') || '[]')
    
    // 过滤在线用户
    const onlineUsers = users.filter((user: UserProfile) => 
      user.onlineStatus.isOnline && user.onlineStatus.isAvailable
    )
    
    // 计算距离和匹配度
    const usersWithDistance = onlineUsers.map((user: UserProfile) => {
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        user.currentLocation.latitude,
        user.currentLocation.longitude
      )
      
      // 只返回在指定半径内的用户
      if (distance <= radius) {
        const mutualInterests = calculateMutualInterests(user.interests)
        const meetupCompatibility = calculateMeetupCompatibility(user, mutualInterests)
        
        return {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          interests: user.interests,
          timezone: user.timezone,
          currentLocation: user.currentLocation,
          onlineStatus: user.onlineStatus,
          distance: Math.round(distance * 10) / 10, // 保留一位小数
          mutualInterests,
          meetupCompatibility
        } as OnlineUser
      }
      return null
    }).filter(Boolean)
    
    // 按距离和匹配度排序
    usersWithDistance.sort((a: OnlineUser | null, b: OnlineUser | null) => {
      if (a!.meetupCompatibility !== b!.meetupCompatibility) {
        return b!.meetupCompatibility! - a!.meetupCompatibility!
      }
      return a!.distance! - b!.distance!
    })
    
    return usersWithDistance as OnlineUser[]
  } catch (error) {
    logError('Failed to fetch online users', error, 'userApi')
    throw new Error('Failed to fetch online users')
  }
}

// 计算两点间距离（公里）
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // 地球半径（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// 计算共同兴趣（模拟当前用户的兴趣）
function calculateMutualInterests(userInterests: string[]): string[] {
  // 模拟当前用户的兴趣
  const currentUserInterests = ['咖啡', '摄影', '技术', '旅行', '美食']
  return userInterests.filter(interest => currentUserInterests.includes(interest))
}

// 计算meetup匹配度
function calculateMeetupCompatibility(user: UserProfile, mutualInterests: string[]): number {
  let score = 0
  
  // 基于共同兴趣评分
  score += mutualInterests.length * 20
  
  // 基于用户评分
  score += user.stats.rating * 10
  
  // 基于成功meetup数量
  score += Math.min(user.stats.successfulMeetups * 5, 30)
  
  // 基于在线状态
  if (user.onlineStatus.status === 'online') {
    score += 10
  }
  
  return Math.min(score, 100)
}

// 获取用户统计信息
export async function getUserStats(city: string): Promise<{
  totalUsers: number
  onlineUsers: number
  availableUsers: number
  todayMeetups: number
}> {
  try {
    logInfo('Fetching user stats', { city }, 'userApi')
    
    // 这里应该调用真实的API
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const users = JSON.parse(localStorage.getItem('nomad_users') || '[]')
    
    const totalUsers = users.length
    const onlineUsers = users.filter((u: UserProfile) => u.onlineStatus.isOnline).length
    const availableUsers = users.filter((u: UserProfile) => 
      u.onlineStatus.isOnline && u.onlineStatus.isAvailable
    ).length
    
    // 模拟今日meetup数量
    const todayMeetups = Math.floor(Math.random() * 20) + 5
    
    return {
      totalUsers,
      onlineUsers,
      availableUsers,
      todayMeetups
    }
  } catch (error) {
    logError('Failed to fetch user stats', error, 'userApi')
    throw new Error('Failed to fetch user stats')
  }
}
