import { Place } from '@/lib/supabase'
import { logInfo, logError } from '@/lib/logger'
import { localPlacesService } from './localPlacesService'
import { userLocationService } from './userLocationService'

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
  // 获取本地存储的地点（现在从数据库获取）
  static async getLocalPlaces(userId?: string): Promise<Place[]> {
    try {
      if (!userId) {
        // 如果没有用户ID，返回localStorage中的缓存数据
        const stored = localStorage.getItem(LOCAL_PLACES_KEY)
        return stored ? JSON.parse(stored) : []
      }

      // 从数据库获取用户地点
      const dbPlaces = await localPlacesService.getUserLocalPlaces(userId)
      
      // 转换为Place格式
      const places: Place[] = dbPlaces.map(dbPlace => ({
        id: dbPlace.id,
        name: dbPlace.place_name,
        category: (dbPlace.place_type as any) || 'other',
        address: dbPlace.address || '',
        description: dbPlace.notes || '',
        tags: [],
        wifi_speed: undefined,
        price_level: 3,
        noise_level: 'moderate',
        social_atmosphere: 'medium',
        city_id: dbPlace.city,
        latitude: dbPlace.coordinates?.lat || 0,
        longitude: dbPlace.coordinates?.lng || 0,
        submitted_by: userId,
        created_at: dbPlace.created_at,
        updated_at: dbPlace.updated_at,
        rating: dbPlace.rating,
        review_count: 0,
        upvotes: 0,
        downvotes: 0
      }))

      return places
    } catch (error) {
      logError('Error loading local places', error, 'PlaceDataService')
      // 如果出错，返回localStorage中的缓存数据
      const stored = localStorage.getItem(LOCAL_PLACES_KEY)
      return stored ? JSON.parse(stored) : []
    }
  }

  // 保存地点到本地存储（现在保存到数据库）
  static async saveLocalPlaces(places: Place[], userId?: string): Promise<void> {
    try {
      if (!userId) {
        // 如果没有用户ID，保存到localStorage
        localStorage.setItem(LOCAL_PLACES_KEY, JSON.stringify(places))
        logInfo('Places saved to local storage', { count: places.length }, 'PlaceDataService')
        return
      }

      // 保存到数据库
      const placesToSave = places.map(place => ({
        place_id: place.id,
        place_name: place.name,
        city: place.city_id,
        country: '',
        place_type: place.category,
        coordinates: place.latitude && place.longitude ? {
          lat: place.latitude,
          lng: place.longitude
        } : undefined,
        address: place.address,
        rating: place.rating,
        notes: place.description
      }))

      await localPlacesService.addLocalPlaces(userId, placesToSave)
      logInfo('Places saved to database', { count: places.length }, 'PlaceDataService')
    } catch (error) {
      logError('Error saving places', error, 'PlaceDataService')
    }
  }

  // 添加新地点
  static async addPlace(place: Place, userId?: string): Promise<void> {
    try {
      if (!userId) {
        // 如果没有用户ID，保存到localStorage
        const places = await this.getLocalPlaces()
        const newPlace = {
          ...place,
          id: place.id || `local-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        places.push(newPlace)
        await this.saveLocalPlaces(places)
        logInfo('Place added to local storage', { placeId: newPlace.id }, 'PlaceDataService')
        return
      }

      // 保存到数据库
      const placeToSave = {
        place_id: place.id || `local-${Date.now()}`,
        place_name: place.name,
        city: place.city_id,
        country: '',
        place_type: place.category,
        coordinates: place.latitude && place.longitude ? {
          lat: place.latitude,
          lng: place.longitude
        } : undefined,
        address: place.address,
        rating: place.rating,
        notes: place.description
      }

      await localPlacesService.addLocalPlace(userId, placeToSave)
      logInfo('Place added to database', { placeId: place.id, name: place.name }, 'PlaceDataService')
    } catch (error) {
      logError('Error adding place', error, 'PlaceDataService')
    }
  }

  // 添加本地地点（别名方法，保持向后兼容）
  static addLocalPlace(place: Place): void {
    this.addPlace(place)
  }

  // 更新地点
  static async updatePlace(placeId: string, updates: Partial<Place>, userId?: string): Promise<void> {
    try {
      if (!userId) {
        // 如果没有用户ID，更新localStorage
        const places = await this.getLocalPlaces()
        const index = places.findIndex(p => p.id === placeId)
        if (index !== -1) {
          places[index] = {
            ...places[index],
            ...updates,
            updated_at: new Date().toISOString()
          }
          await this.saveLocalPlaces(places)
          logInfo('Place updated in local storage', { placeId }, 'PlaceDataService')
        }
        return
      }

      // 更新数据库
      const updateData = {
        place_name: updates.name,
        place_type: updates.category,
        coordinates: updates.latitude && updates.longitude ? {
          lat: updates.latitude,
          lng: updates.longitude
        } : undefined,
        address: updates.address,
        rating: updates.rating,
        notes: updates.description
      }

      await localPlacesService.updateLocalPlace(userId, placeId, updateData)
      logInfo('Place updated in database', { placeId }, 'PlaceDataService')
    } catch (error) {
      logError('Error updating place', error, 'PlaceDataService')
    }
  }

  // 删除地点
  static async deletePlace(placeId: string, userId?: string): Promise<void> {
    try {
      if (!userId) {
        // 如果没有用户ID，删除localStorage中的数据
        const places = await this.getLocalPlaces()
        const filteredPlaces = places.filter(p => p.id !== placeId)
        await this.saveLocalPlaces(filteredPlaces)
        logInfo('Place deleted from local storage', { placeId }, 'PlaceDataService')
        return
      }

      // 删除数据库中的数据
      await localPlacesService.deleteLocalPlace(userId, placeId)
      logInfo('Place deleted from database', { placeId }, 'PlaceDataService')
    } catch (error) {
      logError('Error deleting place', error, 'PlaceDataService')
    }
  }

  // 根据城市获取地点
  static async getPlacesByCity(city: string, userId?: string): Promise<Place[]> {
    const places = await this.getLocalPlaces(userId)
    return places.filter(place => 
      place.city_id?.toLowerCase() === city.toLowerCase()
    )
  }

  // 获取热门地点
  static async getTopPlaces(limit: number = 10, userId?: string): Promise<Place[]> {
    const places = await this.getLocalPlaces(userId)
    return places
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit)
  }

  // 搜索地点
  static async searchPlaces(query: string, userId?: string): Promise<Place[]> {
    const places = await this.getLocalPlaces(userId)
    const lowerQuery = query.toLowerCase()
    
    return places.filter(place => 
      place.name.toLowerCase().includes(lowerQuery) ||
      place.description?.toLowerCase().includes(lowerQuery) ||
      place.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      place.city_id?.toLowerCase().includes(lowerQuery)
    )
  }

  // 根据类别获取地点
  static async getPlacesByCategory(category: string, userId?: string): Promise<Place[]> {
    const places = await this.getLocalPlaces(userId)
    return places.filter(place => place.category === category)
  }

  // 获取用户位置
  static async getUserLocation(userId?: string): Promise<UserLocation | null> {
    try {
      if (!userId) {
        // 如果没有用户ID，从localStorage获取
        const stored = localStorage.getItem(USER_LOCATION_KEY)
        return stored ? JSON.parse(stored) : null
      }

      // 从数据库获取用户位置
      const dbLocation = await userLocationService.getCurrentLocation(userId)
      if (dbLocation) {
        return {
          city: dbLocation.city || '',
          country: dbLocation.country || '',
          latitude: dbLocation.latitude || 0,
          longitude: dbLocation.longitude || 0,
          timestamp: new Date(dbLocation.created_at).getTime()
        }
      }

      return null
    } catch (error) {
      logError('Error loading user location', error, 'PlaceDataService')
      // 如果出错，从localStorage获取
      const stored = localStorage.getItem(USER_LOCATION_KEY)
      return stored ? JSON.parse(stored) : null
    }
  }

  // 保存用户位置
  static async saveUserLocation(location: UserLocation, userId?: string): Promise<void> {
    try {
      if (!userId) {
        // 如果没有用户ID，保存到localStorage
        localStorage.setItem(USER_LOCATION_KEY, JSON.stringify(location))
        logInfo('User location saved to local storage', { city: location.city }, 'PlaceDataService')
        return
      }

      // 保存到数据库
      await userLocationService.updateLocation(userId, {
        city: location.city,
        country: location.country,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: 0
      })
      logInfo('User location saved to database', { city: location.city }, 'PlaceDataService')
    } catch (error) {
      logError('Error saving user location', error, 'PlaceDataService')
    }
  }

  // 获取地点统计信息
  static async getPlaceStats(userId?: string): Promise<{
    totalPlaces: number
    byCategory: Record<string, number>
    byCity: Record<string, number>
    averageRating: number
  }> {
    const places = await this.getLocalPlaces(userId)
    
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