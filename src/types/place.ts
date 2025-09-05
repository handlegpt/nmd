import { Coordinates } from './index'

// 地点基础信息
export interface Place {
  id: string
  name: string
  description?: string
  address: string
  city: string
  country: string
  coordinates: Coordinates
  category: PlaceCategory
  tags: string[]
  
  // 评分信息
  rating: number
  total_reviews: number
  total_votes: number
  
  // 创建和更新信息
  created_at: string
  updated_at: string
  created_by: string
  is_verified: boolean
  is_featured: boolean
}

// 地点分类
export type PlaceCategory = 
  | 'restaurant' | 'cafe' | 'bar' | 'hotel' | 'hostel'
  | 'coworking' | 'gym' | 'park' | 'museum' | 'shopping'
  | 'entertainment' | 'transport' | 'healthcare' | 'other'

// 地点详细信息
export interface PlaceDetails extends Place {
  // 营业信息
  business_hours?: {
    [key: string]: {
      open: string
      close: string
      is_closed: boolean
    }
  }
  
  // 联系信息
  contact?: {
    phone?: string
    email?: string
    website?: string
    social_media?: {
      facebook?: string
      instagram?: string
      twitter?: string
    }
  }
  
  // 设施信息
  amenities?: string[]
  
  // 价格信息
  price_range?: 'budget' | 'moderate' | 'expensive' | 'luxury'
  
  // 特色信息
  features?: {
    wifi_available?: boolean
    wifi_speed?: number
    power_outlets?: boolean
    quiet_environment?: boolean
    outdoor_seating?: boolean
    pet_friendly?: boolean
    wheelchair_accessible?: boolean
  }
}

// 地点评论
export interface PlaceReview {
  id: string
  place_id: string
  user_id: string
  rating: number
  title?: string
  content: string
  pros?: string[]
  cons?: string[]
  created_at: string
  updated_at: string
  helpful_votes: number
  total_votes: number
}

// 地点搜索参数
export interface PlaceSearchParams {
  query?: string
  category?: PlaceCategory
  tags?: string[]
  city?: string
  country?: string
  min_rating?: number
  max_price?: string
  has_wifi?: boolean
  sort_by?: 'rating' | 'distance' | 'name' | 'created_at'
  sort_order?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// 地点更新参数
export interface PlaceUpdateParams {
  name?: string
  description?: string
  address?: string
  category?: PlaceCategory
  tags?: string[]
  coordinates?: Coordinates
  business_hours?: PlaceDetails['business_hours']
  contact?: PlaceDetails['contact']
  amenities?: string[]
  price_range?: PlaceDetails['price_range']
  features?: PlaceDetails['features']
}
