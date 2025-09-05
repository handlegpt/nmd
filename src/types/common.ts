// 通用响应类型
export interface BaseResponse {
  success: boolean
  message?: string
  error?: string
  timestamp: string
  request_id?: string
}

// 通用列表响应
export interface ListResponse<T> extends BaseResponse {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

// 通用分页参数
export interface BasePaginationParams {
  page?: number
  limit?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

// 通用搜索参数
export interface BaseSearchParams extends BasePaginationParams {
  query?: string
  filters?: Record<string, any>
  include_deleted?: boolean
}

// 通用时间范围
export interface TimeRange {
  start: string
  end: string
  timezone?: string
}

// 通用地理位置
export interface GeoLocation {
  latitude: number
  longitude: number
  accuracy?: number
  altitude?: number
  heading?: number
  speed?: number
}

// 通用地址信息
export interface Address {
  street?: string
  city?: string
  state?: string
  country: string
  postal_code?: string
  formatted_address?: string
  coordinates?: GeoLocation
}

// 通用联系信息
export interface ContactInfo {
  email?: string
  phone?: string
  website?: string
  social_media?: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
    youtube?: string
  }
}

// 通用文件信息
export interface FileInfo {
  id: string
  name: string
  size: number
  type: string
  url: string
  thumbnail_url?: string
  uploaded_at: string
  uploaded_by: string
  is_public: boolean
  metadata?: Record<string, any>
}

// 通用标签系统
export interface Tag {
  id: string
  name: string
  category?: string
  description?: string
  color?: string
  icon?: string
  usage_count: number
  created_at: string
}

// 通用分类系统
export interface Category {
  id: string
  name: string
  description?: string
  parent_id?: string
  level: number
  sort_order: number
  is_active: boolean
  icon?: string
  color?: string
  children?: Category[]
}

// 通用评分系统
export interface Rating {
  id: string
  user_id: string
  target_id: string
  target_type: string
  score: number
  comment?: string
  pros?: string[]
  cons?: string[]
  created_at: string
  updated_at: string
  helpful_votes: number
  total_votes: number
}

// 通用投票系统
export interface Vote {
  id: string
  user_id: string
  target_id: string
  target_type: string
  vote_type: 'up' | 'down' | 'neutral'
  created_at: string
  updated_at: string
}

// 通用通知设置
export interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
  in_app: boolean
  frequency: 'immediate' | 'daily' | 'weekly' | 'never'
  quiet_hours?: {
    start: string
    end: string
    timezone: string
  }
}

// 通用隐私设置
export interface PrivacySettings {
  profile_visibility: 'public' | 'friends' | 'private'
  location_sharing: 'public' | 'friends' | 'private'
  activity_visibility: 'public' | 'friends' | 'private'
  search_visibility: boolean
  data_collection: boolean
  third_party_sharing: boolean
}

// 通用审计信息
export interface AuditInfo {
  created_at: string
  created_by: string
  updated_at: string
  updated_by: string
  deleted_at?: string
  deleted_by?: string
  version: number
  change_log?: string[]
}

// 通用状态枚举
export type Status = 'active' | 'inactive' | 'pending' | 'suspended' | 'deleted'

// 通用优先级枚举
export type Priority = 'low' | 'medium' | 'high' | 'urgent' | 'critical'

// 通用难度枚举
export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert'

// 通用大小枚举
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

// 通用颜色枚举
export type Color = 
  | 'red' | 'orange' | 'yellow' | 'green' | 'blue' 
  | 'purple' | 'pink' | 'gray' | 'black' | 'white'

// 通用方向枚举
export type Direction = 'north' | 'south' | 'east' | 'west' | 'up' | 'down' | 'left' | 'right'

// 通用季节枚举
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

// 通用天气枚举
export type Weather = 
  | 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy'
  | 'foggy' | 'windy' | 'humid' | 'dry' | 'clear'
