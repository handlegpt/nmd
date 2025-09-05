import { Coordinates, Location } from './index'

// 用户基础信息
export interface UserProfile {
  id: string
  email: string
  name: string
  avatar_url?: string
  bio?: string
  username?: string
  phone?: string
  website?: string
  
  // 位置信息
  current_location?: Location
  home_country?: string
  timezone?: string
  
  // 专业信息
  profession?: string
  company?: string
  skills: string[]
  interests: string[]
  
  // 社交媒体
  social_links: {
    instagram?: string
    twitter?: string
    linkedin?: string
    github?: string
    facebook?: string
  }
  
  // 旅行偏好
  travel_preferences: {
    budget_range: 'budget' | 'moderate' | 'luxury'
    preferred_climate: 'tropical' | 'temperate' | 'cold'
    travel_style: 'backpacker' | 'digital_nomad' | 'luxury_traveler'
    accommodation_type: 'hostel' | 'hotel' | 'apartment' | 'any'
    wifi_priority: number // 1-10
    cost_priority: number // 1-10
    social_priority: number // 1-10
    visa_priority: number // 1-10
  }
  
  // 系统信息
  created_at: string
  updated_at: string
  last_login?: string
  is_verified: boolean
  is_premium: boolean
  role: 'user' | 'moderator' | 'admin'
}

// 用户偏好设置
export interface UserPreferences {
  // 通知设置
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    meetup_reminders: boolean
    tax_deadlines: boolean
    city_updates: boolean
  }
  
  // 隐私设置
  privacy: {
    profile_visible: boolean
    location_visible: boolean
    online_status_visible: boolean
    allow_messages: boolean
    allow_meetup_invites: boolean
  }
  
  // 语言和主题
  language: 'zh-CN' | 'en-US' | 'es-ES' | 'ja-JP'
  theme: 'light' | 'dark' | 'system'
  timezone: string
  
  // 内容偏好
  content_preferences: {
    show_nsfw: boolean
    show_political: boolean
    preferred_categories: string[]
    excluded_categories: string[]
  }
}

// 用户认证状态
export interface UserAuth {
  isAuthenticated: boolean
  token?: string
  refreshToken?: string
  expiresAt?: number
}

// 用户统计信息
export interface UserStats {
  total_cities_visited: number
  total_places_reviewed: number
  total_meetups_attended: number
  total_recommendations: number
  total_votes_given: number
  total_photos_uploaded: number
  member_since_days: number
  last_activity: string
}

// 用户收藏
export interface UserFavorite {
  id: string
  type: 'city' | 'place' | 'user'
  item_id: string
  created_at: string
}

// 用户签证信息
export interface UserVisa {
  id: string
  country: string
  type: string
  status: 'active' | 'expired' | 'pending' | 'rejected'
  issue_date: string
  expiry_date: string
  max_stay_days: number
  remaining_days: number
  restrictions?: string[]
  notes?: string
}

// 用户会面历史
export interface UserMeetup {
  id: string
  title: string
  description: string
  location: Location
  date: string
  attendees: UserProfile[]
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  created_by: string
  created_at: string
}

// 完整的用户状态
export interface User {
  profile: UserProfile
  preferences: UserPreferences
  auth: UserAuth
  stats: UserStats
  favorites: UserFavorite[]
  visas: UserVisa[]
  meetups: UserMeetup[]
}

// 用户搜索参数
export interface UserSearchParams {
  query?: string
  location?: Location
  profession?: string
  skills?: string[]
  interests?: string[]
  is_online?: boolean
  is_available?: boolean
  distance_km?: number
  sort_by?: 'distance' | 'rating' | 'last_seen' | 'compatibility'
  sort_order?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// 用户更新参数
export interface UserUpdateParams {
  name?: string
  bio?: string
  profession?: string
  company?: string
  skills?: string[]
  interests?: string[]
  current_location?: Location
  travel_preferences?: Partial<UserProfile['travel_preferences']>
  social_links?: Partial<UserProfile['social_links']>
}
