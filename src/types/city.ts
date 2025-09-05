import { Coordinates, Location } from './index'

// 城市基础信息
export interface City {
  id: string
  name: string
  country: string
  region?: string
  coordinates: Coordinates
  timezone: string
  population?: number
  area_km2?: number
  
  // 城市标签
  tags: string[]
  categories: CityCategory[]
  
  // 基础评分
  overall_rating: number
  total_reviews: number
  total_votes: number
  
  // 创建和更新信息
  created_at: string
  updated_at: string
  created_by: string
  is_verified: boolean
  is_featured: boolean
}

// 城市分类
export type CityCategory = 
  | 'beach' | 'mountain' | 'urban' | 'rural' | 'island'
  | 'tech_hub' | 'cultural' | 'historical' | 'nature' | 'party'
  | 'quiet' | 'family_friendly' | 'backpacker' | 'luxury' | 'budget'

// 城市详细信息
export interface CityDetails extends City {
  // 生活成本
  cost_of_living: {
    accommodation_monthly_usd: number
    food_monthly_usd: number
    transportation_monthly_usd: number
    entertainment_monthly_usd: number
    total_monthly_usd: number
    cost_level: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'
  }
  
  // 气候信息
  climate: {
    type: 'tropical' | 'subtropical' | 'temperate' | 'continental' | 'polar'
    average_temp_celsius: number
    rainy_season_months: number[]
    dry_season_months: number[]
    humidity_percentage: number
  }
  
  // 签证信息
  visa_info: {
    tourist_visa_days: number
    digital_nomad_visa_available: boolean
    digital_nomad_visa_days?: number
    visa_free_countries: string[]
    visa_required_countries: string[]
    visa_application_time_days: number
    visa_cost_usd: number
  }
  
  // 基础设施
  infrastructure: {
    wifi_speed_mbps: number
    wifi_quality_rating: number
    electricity_reliability: number
    water_quality: number
    internet_censorship: 'none' | 'light' | 'moderate' | 'heavy'
  }
  
  // 交通
  transportation: {
    public_transport_rating: number
    airport_connections: number
    bike_friendliness: number
    walkability_rating: number
    taxi_availability: number
    ride_sharing_available: boolean
  }
  
  // 安全
  safety: {
    overall_safety_rating: number
    crime_rate: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'
    political_stability: number
    health_care_quality: number
    emergency_services_rating: number
  }
  
  // 文化和社会
  culture: {
    english_speaking_level: number
    local_friendliness: number
    expat_community_size: number
    cultural_activities: number
    nightlife_rating: number
    food_quality_rating: number
  }
  
  // 工作环境
  work_environment: {
    coworking_spaces_count: number
    coffee_shops_work_friendly: number
    libraries_work_friendly: number
    noise_level: 'very_quiet' | 'quiet' | 'moderate' | 'noisy' | 'very_noisy'
    work_culture_rating: number
  }
  
  // 医疗和教育
  services: {
    healthcare_quality: number
    international_schools: number
    universities_rating: number
    banking_services: number
    postal_services: number
  }
}

// 城市评分
export interface CityRating {
  city_id: string
  user_id: string
  
  // 各项评分 (1-10)
  wifi_quality: number
  cost_of_living: number
  climate: number
  safety: number
  culture: number
  transportation: number
  work_environment: number
  visa_friendliness: number
  
  // 总体评分
  overall_rating: number
  
  // 评论
  review: string
  pros: string[]
  cons: string[]
  
  // 元数据
  created_at: string
  updated_at: string
  is_verified: boolean
  helpful_votes: number
}

// 城市投票
export interface CityVote {
  id: string
  city_id: string
  user_id: string
  vote_type: 'upvote' | 'downvote'
  created_at: string
}

// 城市比较
export interface CityComparison {
  id: string
  user_id: string
  cities: string[] // city IDs
  comparison_metrics: string[]
  notes?: string
  created_at: string
  updated_at: string
}

// 城市搜索参数
export interface CitySearchParams {
  query?: string
  country?: string
  region?: string
  categories?: CityCategory[]
  tags?: string[]
  
  // 筛选条件
  cost_range?: {
    min: number
    max: number
  }
  wifi_speed_min?: number
  climate_type?: CityDetails['climate']['type']
  visa_free_for?: string // 国家代码
  
  // 排序
  sort_by?: 'rating' | 'cost' | 'wifi_speed' | 'safety' | 'created_at'
  sort_order?: 'asc' | 'desc'
  
  // 分页
  page?: number
  limit?: number
  
  // 位置筛选
  near_coordinates?: Coordinates
  max_distance_km?: number
}

// 城市推荐
export interface CityRecommendation {
  city: CityDetails
  score: number
  reasons: string[]
  match_percentage: number
  user_preferences_match: {
    wifi_priority: number
    cost_priority: number
    climate_priority: number
    safety_priority: number
  }
}

// 城市统计
export interface CityStats {
  total_reviews: number
  total_votes: number
  average_rating: number
  rating_distribution: {
    '1': number
    '2': number
    '3': number
    '4': number
    '5': number
  }
  recent_activity: {
    new_reviews_24h: number
    new_votes_24h: number
    active_users_24h: number
  }
  trending_score: number
}

// 城市更新参数
export interface CityUpdateParams {
  name?: string
  country?: string
  region?: string
  coordinates?: Coordinates
  timezone?: string
  tags?: string[]
  categories?: CityCategory[]
  cost_of_living?: Partial<CityDetails['cost_of_living']>
  climate?: Partial<CityDetails['climate']>
  visa_info?: Partial<CityDetails['visa_info']>
  infrastructure?: Partial<CityDetails['infrastructure']>
  transportation?: Partial<CityDetails['transportation']>
  safety?: Partial<CityDetails['safety']>
  culture?: Partial<CityDetails['culture']>
  work_environment?: Partial<CityDetails['work_environment']>
  services?: Partial<CityDetails['services']>
}
