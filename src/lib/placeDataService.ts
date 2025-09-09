import { Place } from '@/lib/supabase'
import { logInfo, logError } from '@/lib/logger'

// Mock data removed - now using real data from Supabase

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
      
      // 只返回用户添加的地点，不包含示例数据
      return localPlaces
    } catch (error) {
      logError('Error loading local places', error, 'PlaceDataService')
      // 如果出错，返回空数组
      return []
    }
  }

  // 保存地点到本地存储
  static saveLocalPlaces(places: Place[]): void {
    try {
      localStorage.setItem(LOCAL_PLACES_KEY, JSON.stringify(places))
      logInfo('Places saved to local storage', { count: places.length }, 'PlaceDataService')
    } catch (error) {
      logError('Error saving places to local storage', error, 'PlaceDataService')
    }
  }

  // 添加新地点
  static addPlace(place: Place): void {
    try {
      const places = this.getLocalPlaces()
      const newPlace = {
        ...place,
        id: place.id || `local-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      places.push(newPlace)
      this.saveLocalPlaces(places)
      logInfo('Place added to local storage', { placeId: newPlace.id }, 'PlaceDataService')
    } catch (error) {
      logError('Error adding place to local storage', error, 'PlaceDataService')
    }
  }

  // 添加本地地点（别名方法，保持向后兼容）
  static addLocalPlace(place: Place): void {
    this.addPlace(place)
  }

  // 更新地点
  static updatePlace(placeId: string, updates: Partial<Place>): void {
    try {
      const places = this.getLocalPlaces()
      const index = places.findIndex(p => p.id === placeId)
      if (index !== -1) {
        places[index] = {
          ...places[index],
          ...updates,
          updated_at: new Date().toISOString()
        }
        this.saveLocalPlaces(places)
        logInfo('Place updated in local storage', { placeId }, 'PlaceDataService')
      }
    } catch (error) {
      logError('Error updating place in local storage', error, 'PlaceDataService')
    }
  }

  // 删除地点
  static deletePlace(placeId: string): void {
    try {
      const places = this.getLocalPlaces()
      const filteredPlaces = places.filter(p => p.id !== placeId)
      this.saveLocalPlaces(filteredPlaces)
      logInfo('Place deleted from local storage', { placeId }, 'PlaceDataService')
    } catch (error) {
      logError('Error deleting place from local storage', error, 'PlaceDataService')
    }
  }

  // 根据城市获取地点
  static getPlacesByCity(city: string): Place[] {
    const places = this.getLocalPlaces()
    return places.filter(place => 
      place.city_id?.toLowerCase() === city.toLowerCase()
    )
  }

  // 获取热门地点
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
      place.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      place.city_id?.toLowerCase().includes(lowerQuery)
    )
  }

  // 根据类别获取地点
  static getPlacesByCategory(category: string): Place[] {
    const places = this.getLocalPlaces()
    return places.filter(place => place.category === category)
  }

  // 获取用户位置
  static getUserLocation(): UserLocation | null {
    try {
      const stored = localStorage.getItem(USER_LOCATION_KEY)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      logError('Error loading user location', error, 'PlaceDataService')
      return null
    }
  }

  // 保存用户位置
  static saveUserLocation(location: UserLocation): void {
    try {
      localStorage.setItem(USER_LOCATION_KEY, JSON.stringify(location))
      logInfo('User location saved', { city: location.city }, 'PlaceDataService')
    } catch (error) {
      logError('Error saving user location', error, 'PlaceDataService')
    }
  }

  // 获取地点统计信息
  static getPlaceStats(): {
    totalPlaces: number
    byCategory: Record<string, number>
    byCity: Record<string, number>
    averageRating: number
  } {
    const places = this.getLocalPlaces()
    
    const stats = {
      totalPlaces: places.length,
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