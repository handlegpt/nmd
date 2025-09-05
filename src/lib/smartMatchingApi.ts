import { logInfo, logError } from './logger'
import { MeetupUser } from './meetupApi'

export interface MatchScore {
  overall: number
  interest: number
  location: number
  time: number
  activity: number
}

export interface MatchReason {
  type: 'interest' | 'location' | 'time' | 'activity'
  description: string
  score: number
}

export interface SmartMatch {
  user: MeetupUser
  score: MatchScore
  reasons: MatchReason[]
  compatibility: 'high' | 'medium' | 'low'
  recommended: boolean
}

export interface MatchingPreferences {
  interests: string[]
  location: {
    latitude: number
    longitude: number
    radius: number
  }
  timezone: string
  activityLevel: 'low' | 'medium' | 'high'
  availability: {
    morning: boolean
    afternoon: boolean
    evening: boolean
    night: boolean
  }
}

// 计算兴趣匹配度
function calculateInterestMatch(userInterests: string[], targetInterests: string[]): number {
  if (userInterests.length === 0 || targetInterests.length === 0) return 0
  
  const commonInterests = userInterests.filter(interest => 
    targetInterests.includes(interest)
  )
  
  const matchPercentage = (commonInterests.length / Math.max(userInterests.length, targetInterests.length)) * 100
  return Math.min(matchPercentage, 100)
}

// 计算位置匹配度
function calculateLocationMatch(
  userLocation: { latitude: number; longitude: number },
  targetLocation: { latitude: number; longitude: number },
  maxDistance: number = 50
): number {
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    targetLocation.latitude,
    targetLocation.longitude
  )
  
  if (distance <= 5) return 100
  if (distance <= 10) return 90
  if (distance <= 25) return 70
  if (distance <= 50) return 50
  return Math.max(0, 100 - (distance - 50))
}

// 计算时间匹配度
function calculateTimeMatch(
  userTimezone: string,
  targetTimezone: string,
  userAvailability: any,
  targetAvailability: any
): number {
  // 时区匹配
  const timezoneMatch = userTimezone === targetTimezone ? 100 : 50
  
  // 可用时间匹配
  let availabilityMatch = 0
  const timeSlots = ['morning', 'afternoon', 'evening', 'night']
  
  timeSlots.forEach(slot => {
    if (userAvailability[slot] && targetAvailability[slot]) {
      availabilityMatch += 25
    }
  })
  
  return (timezoneMatch + availabilityMatch) / 2
}

// 计算活动水平匹配度
function calculateActivityMatch(
  userActivity: 'low' | 'medium' | 'high',
  targetActivity: 'low' | 'medium' | 'high'
): number {
  const activityLevels = { low: 1, medium: 2, high: 3 }
  const userLevel = activityLevels[userActivity]
  const targetLevel = activityLevels[targetActivity]
  
  const difference = Math.abs(userLevel - targetLevel)
  if (difference === 0) return 100
  if (difference === 1) return 70
  return 30
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

// 生成匹配理由
function generateMatchReasons(
  user: MeetupUser,
  preferences: MatchingPreferences,
  scores: MatchScore
): MatchReason[] {
  const reasons: MatchReason[] = []
  
  // 兴趣匹配理由
  if (scores.interest > 70) {
    const commonInterests = user.interests.filter(interest => 
      preferences.interests.includes(interest)
    )
    reasons.push({
      type: 'interest',
      description: `共同兴趣: ${commonInterests.slice(0, 3).join(', ')}`,
      score: scores.interest
    })
  }
  
  // 位置匹配理由
  if (scores.location > 70) {
    const distance = user.distance || 0
    reasons.push({
      type: 'location',
      description: `距离很近: ${distance.toFixed(1)}km`,
      score: scores.location
    })
  }
  
  // 时间匹配理由
  if (scores.time > 70) {
    reasons.push({
      type: 'time',
      description: '时区和可用时间匹配',
      score: scores.time
    })
  }
  
  // 活动水平匹配理由
  if (scores.activity > 70) {
    reasons.push({
      type: 'activity',
      description: '活动水平相似',
      score: scores.activity
    })
  }
  
  return reasons
}

// 智能匹配算法
export async function getSmartMatches(
  users: MeetupUser[],
  preferences: MatchingPreferences,
  limit: number = 10
): Promise<SmartMatch[]> {
  try {
    logInfo('Starting smart matching', { userCount: users.length, preferences }, 'smartMatchingApi')
    
    const matches: SmartMatch[] = []
    
    for (const user of users) {
      // 计算各项匹配度
      const interestScore = calculateInterestMatch(preferences.interests, user.interests)
      const locationScore = calculateLocationMatch(
        preferences.location,
        { latitude: user.currentCity ? 0 : 0, longitude: user.currentCity ? 0 : 0 }, // 简化处理
        preferences.location.radius
      )
      const timeScore = calculateTimeMatch(
        preferences.timezone,
        user.timezone,
        preferences.availability,
        { morning: true, afternoon: true, evening: true, night: false } // 简化处理
      )
      const activityScore = calculateActivityMatch(
        preferences.activityLevel,
        'medium' // 简化处理
      )
      
      // 计算综合评分
      const overallScore = Math.round(
        (interestScore * 0.4 + locationScore * 0.3 + timeScore * 0.2 + activityScore * 0.1)
      )
      
      const matchScore: MatchScore = {
        overall: overallScore,
        interest: Math.round(interestScore),
        location: Math.round(locationScore),
        time: Math.round(timeScore),
        activity: Math.round(activityScore)
      }
      
      // 确定兼容性级别
      let compatibility: 'high' | 'medium' | 'low'
      if (overallScore >= 80) compatibility = 'high'
      else if (overallScore >= 60) compatibility = 'medium'
      else compatibility = 'low'
      
      // 生成匹配理由
      const reasons = generateMatchReasons(user, preferences, matchScore)
      
      // 确定是否推荐
      const recommended = overallScore >= 70 && reasons.length > 0
      
      matches.push({
        user,
        score: matchScore,
        reasons,
        compatibility,
        recommended
      })
    }
    
    // 按综合评分排序
    matches.sort((a, b) => b.score.overall - a.score.overall)
    
    // 返回前N个匹配
    const topMatches = matches.slice(0, limit)
    
    logInfo('Smart matching completed', { 
      totalMatches: matches.length, 
      topMatches: topMatches.length,
      averageScore: Math.round(matches.reduce((sum, m) => sum + m.score.overall, 0) / matches.length)
    }, 'smartMatchingApi')
    
    return topMatches
  } catch (error) {
    logError('Smart matching failed', error, 'smartMatchingApi')
    throw new Error('Failed to generate smart matches')
  }
}

// 获取推荐用户
export async function getRecommendedUsers(
  currentUser: any,
  allUsers: MeetupUser[],
  limit: number = 5
): Promise<SmartMatch[]> {
  try {
    // 构建用户偏好
    const preferences: MatchingPreferences = {
      interests: currentUser.interests || ['咖啡', '摄影', '技术', '旅行', '美食'],
      location: {
        latitude: currentUser.latitude || 0,
        longitude: currentUser.longitude || 0,
        radius: 50
      },
      timezone: currentUser.timezone || 'Asia/Tokyo',
      activityLevel: 'medium',
      availability: {
        morning: true,
        afternoon: true,
        evening: true,
        night: false
      }
    }
    
    return await getSmartMatches(allUsers, preferences, limit)
  } catch (error) {
    logError('Failed to get recommended users', error, 'smartMatchingApi')
    throw new Error('Failed to get recommended users')
  }
}

// 获取匹配详情
export async function getMatchDetails(
  userId: string,
  targetUserId: string,
  allUsers: MeetupUser[]
): Promise<SmartMatch | null> {
  try {
    const currentUser = allUsers.find(u => u.id === userId)
    const targetUser = allUsers.find(u => u.id === targetUserId)
    
    if (!currentUser || !targetUser) return null
    
    const preferences: MatchingPreferences = {
      interests: currentUser.interests,
      location: {
        latitude: 0, // 简化处理
        longitude: 0,
        radius: 50
      },
      timezone: currentUser.timezone,
      activityLevel: 'medium',
      availability: {
        morning: true,
        afternoon: true,
        evening: true,
        night: false
      }
    }
    
    const matches = await getSmartMatches([targetUser], preferences, 1)
    return matches[0] || null
  } catch (error) {
    logError('Failed to get match details', error, 'smartMatchingApi')
    throw new Error('Failed to get match details')
  }
}
