import { Place } from '@/lib/supabase'
import { logInfo, logError } from '@/lib/logger'

// 示例地点数据
const SAMPLE_PLACES: Place[] = [
  {
    id: 'sample-1',
    name: 'Canggu Hub',
    category: 'coworking',
    address: 'Canggu, Bali, Indonesia',
    description: 'Canggu地区最受欢迎的联合办公空间，靠近海滩，WiFi速度快',
    tags: ['WiFi快', '海滩附近', '社区氛围好'],
    wifi_speed: 100,
    price_level: 2,
    noise_level: 'moderate',
    social_atmosphere: 'high',
    city_id: 'Bali',
    latitude: -8.6500,
    longitude: 115.2167,
    submitted_by: 'System',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    rating: 4.8,
    review_count: 45,
    upvotes: 42,
    downvotes: 3
  },
  {
    id: 'sample-2',
    name: 'Revolver Espresso',
    category: 'cafe',
    address: 'Seminyak, Bali, Indonesia',
    description: 'Seminyak地区著名的咖啡店，环境优雅，适合工作',
    tags: ['goodCoffee', 'elegantEnvironment', 'stableWifi'],
    wifi_speed: 80,
    price_level: 3,
    noise_level: 'moderate',
    social_atmosphere: 'medium',
    city_id: 'Bali',
    latitude: -8.6833,
    longitude: 115.1667,
    submitted_by: 'System',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    rating: 4.6,
    review_count: 28,
    upvotes: 25,
    downvotes: 3
  },
  {
    id: 'sample-3',
    name: 'Selina Porto',
    category: 'coworking',
    address: 'Porto, Portugal',
    description: 'Porto市中心的高端联合办公空间，靠近杜罗河',
    tags: ['河景', '高端设施', '社区活动'],
    wifi_speed: 120,
    price_level: 3,
    noise_level: 'quiet',
    social_atmosphere: 'high',
    city_id: 'Porto',
    latitude: 41.1579,
    longitude: -8.6291,
    submitted_by: 'System',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    rating: 4.7,
    review_count: 32,
    upvotes: 30,
    downvotes: 2
  },
  {
    id: 'sample-4',
    name: 'Majestic Café',
    category: 'cafe',
    address: 'Rua das Flores, Porto, Portugal',
    description: '波尔图最著名的历史咖啡店，环境优雅',
    tags: ['历史建筑', '优雅环境', '传统咖啡'],
    wifi_speed: 60,
    price_level: 4,
    noise_level: 'moderate',
    social_atmosphere: 'medium',
    city_id: 'Porto',
    latitude: 41.1579,
    longitude: -8.6291,
    submitted_by: 'System',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    rating: 4.5,
    review_count: 89,
    upvotes: 82,
    downvotes: 7
  },
  {
    id: 'sample-5',
    name: 'Chiang Mai Coworking',
    category: 'coworking',
    address: 'Nimman, Chiang Mai, Thailand',
    description: '清迈宁曼路附近的联合办公空间，价格实惠',
    tags: ['价格实惠', '清迈', '宁曼路'],
    wifi_speed: 90,
    price_level: 1,
    noise_level: 'quiet',
    social_atmosphere: 'high',
    city_id: 'Chiang Mai',
    latitude: 18.7883,
    longitude: 98.9853,
    submitted_by: 'System',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    rating: 4.4,
    review_count: 67,
    upvotes: 61,
    downvotes: 6
  },
  {
    id: 'sample-6',
    name: 'Ristr8to Coffee',
    category: 'cafe',
    address: 'Nimman Soi 3, Chiang Mai, Thailand',
    description: '清迈最受欢迎的咖啡店，拉花艺术闻名',
    tags: ['latteArt', 'goodCoffee', 'influencerSpot'],
    wifi_speed: 70,
    price_level: 2,
    noise_level: 'moderate',
    social_atmosphere: 'high',
    city_id: 'Chiang Mai',
    latitude: 18.7883,
    longitude: 98.9853,
    submitted_by: 'System',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    rating: 4.9,
    review_count: 234,
    upvotes: 218,
    downvotes: 16
  }
]

// 本地存储键名
const LOCAL_PLACES_KEY = 'nomad_local_places'
const USER_LOCATION_KEY = 'nomad_user_location'

export interface UserLocation {
  city: string
  country: string
  latitude: number
  longitude: number
  timestamp: number
}

export class PlaceDataService {
  // 获取本地存储的地点
  static getLocalPlaces(): Place[] {
    try {
      const stored = localStorage.getItem(LOCAL_PLACES_KEY)
      const localPlaces = stored ? JSON.parse(stored) : []
      
      // 检查用户是否已登录
      const isAuthenticated = localStorage.getItem('user_authenticated') === 'true'
      
      if (isAuthenticated) {
        // 用户已登录，只返回用户添加的地点，不显示示例数据
        return localPlaces
      } else {
        // 用户未登录，显示示例数据
        const allPlaces = [...localPlaces, ...SAMPLE_PLACES]
        
        // 去重（基于ID）
        const uniquePlaces = allPlaces.filter((place, index, self) => 
          index === self.findIndex(p => p.id === place.id)
        )
        
        return uniquePlaces
      }
    } catch (error) {
      logError('Error loading local places', error, 'PlaceDataService')
      // 如果出错，检查用户状态决定是否返回示例数据
      const isAuthenticated = localStorage.getItem('user_authenticated') === 'true'
      return isAuthenticated ? [] : SAMPLE_PLACES
    }
  }

  // 保存地点到本地存储
  static saveLocalPlaces(places: Place[]): void {
    try {
      localStorage.setItem(LOCAL_PLACES_KEY, JSON.stringify(places))
      logInfo('Local places saved', { count: places.length }, 'PlaceDataService')
    } catch (error) {
      logError('Error saving local places', error, 'PlaceDataService')
    }
  }

  // 添加新地点
  static addLocalPlace(place: Place): void {
    try {
      const places = this.getLocalPlaces()
      const updatedPlaces = [place, ...places]
      this.saveLocalPlaces(updatedPlaces)
      logInfo('New place added', { placeId: place.id, placeName: place.name }, 'PlaceDataService')
    } catch (error) {
      logError('Error adding local place', error, 'PlaceDataService')
    }
  }

  // 更新地点
  static updateLocalPlace(placeId: string, updates: Partial<Place>): void {
    try {
      const places = this.getLocalPlaces()
      const updatedPlaces = places.map(place => 
        place.id === placeId ? { ...place, ...updates, updated_at: new Date().toISOString() } : place
      )
      this.saveLocalPlaces(updatedPlaces)
      logInfo('Place updated', { placeId, updates }, 'PlaceDataService')
    } catch (error) {
      logError('Error updating local place', error, 'PlaceDataService')
    }
  }

  // 删除地点
  static deleteLocalPlace(placeId: string): void {
    try {
      const places = this.getLocalPlaces()
      const updatedPlaces = places.filter(place => place.id !== placeId)
      this.saveLocalPlaces(updatedPlaces)
      logInfo('Place deleted', { placeId }, 'PlaceDataService')
    } catch (error) {
      logError('Error deleting local place', error, 'PlaceDataService')
    }
  }

  // 获取用户位置
  static getUserLocation(): UserLocation | null {
    try {
      const stored = localStorage.getItem(USER_LOCATION_KEY)
      if (!stored) return null
      
      const location = JSON.parse(stored)
      // 检查位置是否过期（24小时）
      if (Date.now() - location.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(USER_LOCATION_KEY)
        return null
      }
      return location
    } catch (error) {
      logError('Error loading user location', error, 'PlaceDataService')
      return null
    }
  }

  // 保存用户位置
  static saveUserLocation(location: Omit<UserLocation, 'timestamp'>): void {
    try {
      const locationWithTimestamp = {
        ...location,
        timestamp: Date.now()
      }
      localStorage.setItem(USER_LOCATION_KEY, JSON.stringify(locationWithTimestamp))
      logInfo('User location saved', location, 'PlaceDataService')
    } catch (error) {
      logError('Error saving user location', error, 'PlaceDataService')
    }
  }

  // 根据城市获取地点
  static getPlacesByCity(cityName: string): Place[] {
    const places = this.getLocalPlaces()
    return places.filter(place => 
      place.city_id === cityName || 
      place.address?.toLowerCase().includes(cityName.toLowerCase())
    )
  }

  // 根据类别获取地点
  static getPlacesByCategory(category: string): Place[] {
    const places = this.getLocalPlaces()
    return places.filter(place => place.category === category)
  }

  // 获取热门地点（按评分排序）
  static getTopPlaces(limit: number = 10): Place[] {
    const places = this.getLocalPlaces()
    return places
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit)
  }

  // 搜索地点
  static searchPlaces(query: string): Place[] {
    const places = this.getLocalPlaces()
    const lowerQuery = query.toLowerCase()
    
    return places.filter(place => 
      place.name.toLowerCase().includes(lowerQuery) ||
      place.description?.toLowerCase().includes(lowerQuery) ||
      place.address?.toLowerCase().includes(lowerQuery) ||
      place.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  // 获取地点统计信息
  static getPlaceStats() {
    const places = this.getLocalPlaces()
    const stats = {
      total: places.length,
      byCategory: {} as Record<string, number>,
      byCity: {} as Record<string, number>,
      averageRating: 0
    }

    places.forEach(place => {
      // 按类别统计
      stats.byCategory[place.category] = (stats.byCategory[place.category] || 0) + 1
      
      // 按城市统计
      const city = place.city_id
      stats.byCity[city] = (stats.byCity[city] || 0) + 1
    })

    // 计算平均评分
    const totalRating = places.reduce((sum, place) => sum + (place.rating || 0), 0)
    stats.averageRating = places.length > 0 ? totalRating / places.length : 0

    return stats
  }
}
