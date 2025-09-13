import { logInfo, logError } from '@/lib/logger'
import { OnlineUser, getUserStats } from './userApi'

export interface MeetupUser {
  id: string
  name: string
  avatar: string
  location: string
  status: 'online' | 'offline' | 'away' | 'busy'
  lastSeen: string
  interests: string[]
  isAvailable: boolean
  timezone: string
  currentCity: string
  distance?: number
  mutualInterests?: string[]
  meetupCompatibility?: number
}

export interface MeetupInvitation {
  id: string
  location: string
  time: string
  description: string
  createdBy: string
  createdAt: string
  status: 'pending' | 'accepted' | 'declined' | 'completed'
}

export interface MeetupStats {
  totalUsers: number
  onlineUsers: number
  availableUsers: number
  todayMeetups: number
}

// 获取当前城市的在线用户
export async function getOnlineUsers(city: string, currentLocation?: { latitude: number; longitude: number }): Promise<MeetupUser[]> {
  try {
    logInfo('Fetching online users for city', { city }, 'meetupApi')
    
    // 如果没有真实用户数据，返回模拟数据
    const users: any[] = [] // REMOVED: localStorage usage for nomad_users
    
    if (users.length === 0) {
      // 返回模拟数据
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockUsers: MeetupUser[] = [
        {
          id: '1',
          name: 'Sarah Chen',
          avatar: 'SC',
          location: `${city}, Japan`,
          status: 'online',
          lastSeen: '2分钟前',
          interests: ['咖啡', '摄影', '技术'],
          isAvailable: true,
          timezone: 'Asia/Tokyo',
          currentCity: city,
          distance: 2.5,
          mutualInterests: ['咖啡', '摄影'],
          meetupCompatibility: 85
        },
        {
          id: '2',
          name: 'Alex Rodriguez',
          avatar: 'AR',
          location: `${city}, Japan`,
          status: 'online',
          lastSeen: '5分钟前',
          interests: ['创业', '旅行', '美食'],
          isAvailable: true,
          timezone: 'Asia/Tokyo',
          currentCity: city,
          distance: 1.8,
          mutualInterests: ['旅行', '美食'],
          meetupCompatibility: 75
        },
        {
          id: '3',
          name: 'Yuki Tanaka',
          avatar: 'YT',
          location: `${city}, Japan`,
          status: 'offline',
          lastSeen: '1小时前',
          interests: ['设计', '音乐', '文化'],
          isAvailable: false,
          timezone: 'Asia/Tokyo',
          currentCity: city,
          distance: 3.2,
          mutualInterests: ['文化'],
          meetupCompatibility: 45
        },
        {
          id: '4',
          name: 'Emma Wilson',
          avatar: 'EW',
          location: `${city}, Japan`,
          status: 'online',
          lastSeen: '刚刚',
          interests: ['写作', '瑜伽', '环保'],
          isAvailable: true,
          timezone: 'Asia/Tokyo',
          currentCity: city,
          distance: 0.8,
          mutualInterests: ['写作'],
          meetupCompatibility: 65
        }
      ]
      
      return mockUsers
    }
    
    // 使用真实的用户数据
    if (currentLocation) {
      const { getOnlineUsers: getRealOnlineUsers } = await import('./userApi')
      const onlineUsers = await getRealOnlineUsers(currentLocation)
      
      // 转换为MeetupUser格式
      return onlineUsers.map(user => ({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        location: `${user.currentLocation.city}, ${user.currentLocation.country}`,
        status: user.onlineStatus.status,
        lastSeen: formatLastSeen(user.onlineStatus.lastSeen),
        interests: user.interests,
        isAvailable: user.onlineStatus.isAvailable,
        timezone: user.timezone,
        currentCity: user.currentLocation.city,
        distance: user.distance,
        mutualInterests: user.mutualInterests,
        meetupCompatibility: user.meetupCompatibility
      }))
    }
    
    // 如果没有位置信息，返回模拟数据
    return getMockUsers(city)
  } catch (error) {
    logError('Failed to fetch online users', error, 'meetupApi')
    throw new Error('Failed to fetch online users')
  }
}

// 格式化最后在线时间
function formatLastSeen(lastSeen: string): string {
  const now = new Date()
  const lastSeenDate = new Date(lastSeen)
  const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return '刚刚'
  if (diffInMinutes < 60) return `${diffInMinutes}分钟前`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`
  return `${Math.floor(diffInMinutes / 1440)}天前`
}

// 获取模拟用户数据
function getMockUsers(city: string): MeetupUser[] {
  // 生产环境：返回空数组，避免显示虚假数据
  // TODO: 实现真实的用户在线状态API
  return []
}

// 获取meetup统计信息
export async function getMeetupStats(city: string): Promise<MeetupStats> {
  try {
    logInfo('Fetching meetup stats for city', { city }, 'meetupApi')
    
    // 使用真实的用户统计API
    const stats = await getUserStats(city)
    return stats
  } catch (error) {
    logError('Failed to fetch meetup stats', error, 'meetupApi')
    throw new Error('Failed to fetch meetup stats')
  }
}

// 发送见面邀请
export async function sendMeetupInvitation(
  targetUserId: string,
  location: string,
  time: string,
  description: string
): Promise<{ success: boolean; message: string }> {
  try {
    logInfo('Sending meetup invitation', { 
      targetUserId, 
      location, 
      time 
    }, 'meetupApi')
    
    // 创建 meetup 邀请记录
    const meetupInvitation = {
      id: `meetup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      targetUserId,
      location,
      time,
      description,
      createdBy: 'current_user', // TODO: 获取当前用户ID
      createdAt: new Date().toISOString(),
      status: 'pending'
    }
    
    // 保存到 localStorage 作为模拟数据库
    const existingInvitations: any[] = [] // REMOVED: localStorage usage for meetup_invitations
    existingInvitations.push(meetupInvitation)
    // REMOVED: localStorage usage for meetup_invitations)
    
    // 创建通知记录
    const notification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: targetUserId,
      type: 'meetup_invitation',
      title: 'New Meetup Invitation',
      message: `You have been invited to a meetup at ${location}`,
      data: {
        meetupId: meetupInvitation.id,
        location,
        time,
        description,
        creator_name: 'Current User' // TODO: 获取当前用户名称
      },
      isRead: false,
      isHighPriority: false,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7天后过期
    }
    
    // 保存通知到 localStorage
    const existingNotifications: any[] = [] // REMOVED: localStorage usage for user_notifications
    existingNotifications.push(notification)
    // REMOVED: localStorage usage for user_notifications)
    
    logInfo('Meetup invitation and notification created', { 
      meetupId: meetupInvitation.id, 
      notificationId: notification.id 
    }, 'meetupApi')
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      success: true,
      message: 'Meetup invitation sent successfully'
    }
  } catch (error) {
    logError('Failed to send meetup invitation', error, 'meetupApi')
    throw new Error('Failed to send meetup invitation')
  }
}

// 创建公开的meetup邀请
export async function createPublicMeetup(
  location: string,
  time: string,
  description: string
): Promise<{ success: boolean; message: string }> {
  try {
    logInfo('Creating public meetup', { 
      location, 
      time 
    }, 'meetupApi')
    
    // 这里应该调用真实的API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      success: true,
      message: 'Public meetup created successfully'
    }
  } catch (error) {
    logError('Failed to create public meetup', error, 'meetupApi')
    throw new Error('Failed to create public meetup')
  }
}

// 获取用户的meetup历史
export async function getMeetupHistory(): Promise<MeetupInvitation[]> {
  try {
    logInfo('Fetching meetup history', null, 'meetupApi')
    
    // 这里应该调用真实的API
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return []
  } catch (error) {
    logError('Failed to fetch meetup history', error, 'meetupApi')
    throw new Error('Failed to fetch meetup history')
  }
}
