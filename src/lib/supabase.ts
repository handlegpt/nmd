import { createClient } from '@supabase/supabase-js'

// Create Supabase client for both client and server side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: any = null
let hasWarned = false

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
  if (typeof window !== 'undefined') {
  }
} else {
  if (typeof window !== 'undefined') {
    console.warn('🔧 Supabase environment variables are not configured - using mock data')
    hasWarned = true
  }
}

export { supabase }

export interface City {
  id: string
  slug: string
  name: string
  country: string
  country_code: string
  country_name: string
  timezone: string
  latitude: number
  longitude: number
  population: number
  language: string
  currency: string
  climate_tag: string
  safety_score: number
  wifi_speed_mbps: number
  cost_min_usd: number
  cost_max_usd: number
  nomad_score: number
  community_score: number
  coffee_score: number
  coworking_score: number
  is_active: boolean
  created_at: string
  updated_at: string
  // Computed fields from views or aggregations
  avg_overall_rating?: number
  vote_count?: number
  // Backward compatibility fields
  cost_of_living?: number  // 保留用于兼容旧代码
  wifi_speed?: number      // 保留用于兼容旧代码
  visa_days?: number       // 从nomad_visas表获取
  visa_type?: string       // 从nomad_visas表获取
}

export interface Vote {
  id: string
  city_id: string
  user_id: string
  overall_rating: number
  wifi_rating: number
  social_rating: number
  value_rating: number
  climate_rating: number
  comment: string
  created_at: string
}

export interface User {
  id: string
  email: string
  name: string
  avatar_url: string
  created_at: string
}

// Place recommendation related interfaces
export interface Place {
  id: string
  name: string
  category: 'cafe' | 'coworking' | 'coliving' | 'hostel' | 'hotel' | 'restaurant' | 'library' | 'park' | 'university' | 'shopping' | 'other'
  city_id: string
  address: string
  latitude: number
  longitude: number
  description: string
  tags: string[]
  wifi_speed?: number
  price_level: 1 | 2 | 3 | 4 | 5 // 1=cheap, 5=expensive
  noise_level: 'quiet' | 'moderate' | 'loud'
  social_atmosphere: 'low' | 'medium' | 'high'
  outlets?: boolean
  long_stay_ok?: boolean
  submitted_by: string | null
  created_at: string
  updated_at: string
  // Computed fields from views
  upvotes?: number
  downvotes?: number
  rating?: number
  review_count?: number
  // Google Places integration
  isFromGoogle?: boolean
  
  // Extended fields for Nomad-friendly POI
  opening_hours?: string // e.g., "09:00 - 20:00"
  phone?: string
  website?: string
  google_maps_url?: string
  socket_count?: number // Number of power outlets
  wifi_stability?: 'poor' | 'fair' | 'good' | 'excellent'
  average_spend?: string // e.g., "¥500~¥800"
  payment_methods?: string[] // e.g., ["cash", "card", "mobile_pay"]
  suitable_for?: string[] // e.g., ["work", "social", "reading", "relax"]
  check_in_count?: number // Number of nomads who checked in
  photos?: string[] // Array of photo URLs
  cover_photo?: string // Main cover photo URL
}

export interface PlaceVote {
  id: string
  place_id: string
  user_id: string
  vote_type: 'upvote' | 'downvote'
  comment?: string
  created_at: string
}

export interface PlaceReview {
  id: string
  place_id: string
  user_id: string
  user_name: string
  user_avatar?: string
  rating_wifi: number // 1-5
  rating_environment: number // 1-5
  rating_social: number // 1-5
  rating_value: number // 1-5
  overall_rating: number // 1-5
  comment: string
  photos?: string[] // Array of photo URLs
  check_in_date?: string
  created_at: string
  updated_at: string
}

