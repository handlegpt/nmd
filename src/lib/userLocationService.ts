import { supabase } from './supabase'
import { logError, logInfo } from './logger'

export interface UserLocation {
  id: string
  user_id: string
  latitude?: number
  longitude?: number
  city?: string
  country?: string
  accuracy?: number
  created_at: string
}

export interface UserLocationInput {
  latitude?: number
  longitude?: number
  city?: string
  country?: string
  accuracy?: number
}

class UserLocationService {
  /**
   * 获取用户当前位置
   */
  async getCurrentLocation(userId: string): Promise<UserLocation | null> {
    try {
      const { data, error } = await supabase
        .from('user_locations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        logError('Failed to fetch current location', error, 'UserLocationService')
        return null
      }

      return data || null
    } catch (error) {
      logError('Error fetching current location', error, 'UserLocationService')
      return null
    }
  }

  /**
   * 更新用户位置
   */
  async updateLocation(userId: string, locationData: UserLocationInput): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_locations')
        .insert({
          user_id: userId,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          city: locationData.city,
          country: locationData.country,
          accuracy: locationData.accuracy
        })

      if (error) {
        logError('Failed to update user location', error, 'UserLocationService')
        return false
      }

      logInfo('User location updated successfully', { userId }, 'UserLocationService')
      return true
    } catch (error) {
      logError('Error updating user location', error, 'UserLocationService')
      return false
    }
  }

  /**
   * 获取用户位置历史
   */
  async getLocationHistory(userId: string, limit: number = 50): Promise<UserLocation[]> {
    try {
      const { data, error } = await supabase
        .from('user_locations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        logError('Failed to fetch location history', error, 'UserLocationService')
        return []
      }

      return data || []
    } catch (error) {
      logError('Error fetching location history', error, 'UserLocationService')
      return []
    }
  }

  /**
   * 删除位置记录
   */
  async deleteLocationEntry(entryId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_locations')
        .delete()
        .eq('id', entryId)

      if (error) {
        logError('Failed to delete location entry', error, 'UserLocationService')
        return false
      }

      logInfo('Location entry deleted successfully', { entryId }, 'UserLocationService')
      return true
    } catch (error) {
      logError('Error deleting location entry', error, 'UserLocationService')
      return false
    }
  }

  /**
   * 清空用户位置历史
   */
  async clearLocationHistory(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_locations')
        .delete()
        .eq('user_id', userId)

      if (error) {
        logError('Failed to clear location history', error, 'UserLocationService')
        return false
      }

      logInfo('Location history cleared successfully', { userId }, 'UserLocationService')
      return true
    } catch (error) {
      logError('Error clearing location history', error, 'UserLocationService')
      return false
    }
  }

  /**
   * 获取用户位置统计
   */
  async getLocationStats(userId: string): Promise<{
    totalLocations: number
    uniqueCities: number
    uniqueCountries: number
    lastUpdate?: string
  }> {
    try {
      const { data, error } = await supabase
        .from('user_locations')
        .select('city, country, created_at')
        .eq('user_id', userId)

      if (error) {
        logError('Failed to get location stats', error, 'UserLocationService')
        return { totalLocations: 0, uniqueCities: 0, uniqueCountries: 0 }
      }

      const totalLocations = data.length
      const uniqueCities = new Set(data.map((location: any) => location.city).filter(Boolean)).size
      const uniqueCountries = new Set(data.map((location: any) => location.country).filter(Boolean)).size
      const lastUpdate = data.length > 0 ? data[0].created_at : undefined

      return {
        totalLocations,
        uniqueCities,
        uniqueCountries,
        lastUpdate
      }
    } catch (error) {
      logError('Error getting location stats', error, 'UserLocationService')
      return { totalLocations: 0, uniqueCities: 0, uniqueCountries: 0 }
    }
  }

  /**
   * 获取用户最常访问的城市
   */
  async getMostVisitedCities(userId: string, limit: number = 10): Promise<Array<{
    city: string
    country: string
    visit_count: number
  }>> {
    try {
      const { data, error } = await supabase
        .from('user_locations')
        .select('city, country')
        .eq('user_id', userId)
        .not('city', 'is', null)

      if (error) {
        logError('Failed to get most visited cities', error, 'UserLocationService')
        return []
      }

      // Count occurrences of each city
      const cityCounts: { [key: string]: { city: string; country: string; count: number } } = {}
      data.forEach((location: any) => {
        if (location.city && location.country) {
          const key = `${location.city}, ${location.country}`
          if (!cityCounts[key]) {
            cityCounts[key] = {
              city: location.city,
              country: location.country,
              count: 0
            }
          }
          cityCounts[key].count++
        }
      })

      // Sort by count and return top cities
      return Object.values(cityCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
        .map(item => ({
          city: item.city,
          country: item.country,
          visit_count: item.count
        }))
    } catch (error) {
      logError('Error getting most visited cities', error, 'UserLocationService')
      return []
    }
  }
}

export const userLocationService = new UserLocationService()
