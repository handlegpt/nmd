import { supabase } from './supabase'
import { logError, logInfo } from './logger'

export interface CityTrajectoryEntry {
  id: string
  user_id: string
  city_id: string
  city_name: string
  country: string
  visit_date: string
  duration_days?: number
  coordinates?: {
    lat: number
    lng: number
  }
  notes?: string
  created_at: string
}

export interface CityTrajectoryInput {
  city_id: string
  city_name: string
  country: string
  visit_date?: string
  duration_days?: number
  coordinates?: {
    lat: number
    lng: number
  }
  notes?: string
}

class CityTrajectoryService {
  /**
   * 获取用户城市轨迹
   */
  async getUserTrajectory(userId: string): Promise<CityTrajectoryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('user_city_trajectory')
        .select('*')
        .eq('user_id', userId)
        .order('visit_date', { ascending: false })

      if (error) {
        logError('Failed to fetch user city trajectory', error, 'CityTrajectoryService')
        return []
      }

      return data || []
    } catch (error) {
      logError('Error fetching user city trajectory', error, 'CityTrajectoryService')
      return []
    }
  }

  /**
   * 添加城市到轨迹
   */
  async addCityToTrajectory(userId: string, cityData: CityTrajectoryInput): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_city_trajectory')
        .insert({
          user_id: userId,
          city_id: cityData.city_id,
          city_name: cityData.city_name,
          country: cityData.country,
          visit_date: cityData.visit_date || new Date().toISOString(),
          duration_days: cityData.duration_days,
          coordinates: cityData.coordinates,
          notes: cityData.notes
        })

      if (error) {
        logError('Failed to add city to trajectory', error, 'CityTrajectoryService')
        return false
      }

      logInfo('City added to trajectory successfully', { userId, cityId: cityData.city_id }, 'CityTrajectoryService')
      return true
    } catch (error) {
      logError('Error adding city to trajectory', error, 'CityTrajectoryService')
      return false
    }
  }

  /**
   * 更新城市轨迹条目
   */
  async updateTrajectoryEntry(entryId: string, updates: Partial<CityTrajectoryInput>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_city_trajectory')
        .update(updates)
        .eq('id', entryId)

      if (error) {
        logError('Failed to update trajectory entry', error, 'CityTrajectoryService')
        return false
      }

      logInfo('Trajectory entry updated successfully', { entryId }, 'CityTrajectoryService')
      return true
    } catch (error) {
      logError('Error updating trajectory entry', error, 'CityTrajectoryService')
      return false
    }
  }

  /**
   * 删除城市轨迹条目
   */
  async removeTrajectoryEntry(entryId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_city_trajectory')
        .delete()
        .eq('id', entryId)

      if (error) {
        logError('Failed to remove trajectory entry', error, 'CityTrajectoryService')
        return false
      }

      logInfo('Trajectory entry removed successfully', { entryId }, 'CityTrajectoryService')
      return true
    } catch (error) {
      logError('Error removing trajectory entry', error, 'CityTrajectoryService')
      return false
    }
  }

  /**
   * 获取用户访问过的城市数量
   */
  async getVisitedCitiesCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('user_city_trajectory')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (error) {
        logError('Failed to get visited cities count', error, 'CityTrajectoryService')
        return 0
      }

      return count || 0
    } catch (error) {
      logError('Error getting visited cities count', error, 'CityTrajectoryService')
      return 0
    }
  }

  /**
   * 获取用户最近访问的城市
   */
  async getRecentCities(userId: string, limit: number = 5): Promise<CityTrajectoryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('user_city_trajectory')
        .select('*')
        .eq('user_id', userId)
        .order('visit_date', { ascending: false })
        .limit(limit)

      if (error) {
        logError('Failed to get recent cities', error, 'CityTrajectoryService')
        return []
      }

      return data || []
    } catch (error) {
      logError('Error getting recent cities', error, 'CityTrajectoryService')
      return []
    }
  }

  /**
   * 检查城市是否已访问过
   */
  async hasVisitedCity(userId: string, cityId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_city_trajectory')
        .select('id')
        .eq('user_id', userId)
        .eq('city_id', cityId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        logError('Failed to check if city was visited', error, 'CityTrajectoryService')
        return false
      }

      return !!data
    } catch (error) {
      logError('Error checking if city was visited', error, 'CityTrajectoryService')
      return false
    }
  }
}

export const cityTrajectoryService = new CityTrajectoryService()
