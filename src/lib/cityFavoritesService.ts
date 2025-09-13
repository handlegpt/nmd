import { supabase } from './supabase'
import { logError, logInfo } from './logger'

export interface CityFavorite {
  id: string
  user_id: string
  city_id: string
  city_name: string
  country: string
  coordinates?: {
    lat: number
    lng: number
  }
  created_at: string
}

export interface CityFavoriteInput {
  city_id: string
  city_name: string
  country: string
  coordinates?: {
    lat: number
    lng: number
  }
}

class CityFavoritesService {
  /**
   * 获取用户收藏的城市列表
   */
  async getUserFavorites(userId: string): Promise<CityFavorite[]> {
    try {
      const { data, error } = await supabase
        .from('user_city_favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        logError('Failed to fetch user city favorites', error, 'CityFavoritesService')
        return []
      }

      return data || []
    } catch (error) {
      logError('Error fetching user city favorites', error, 'CityFavoritesService')
      return []
    }
  }

  /**
   * 添加城市到收藏
   */
  async addFavorite(userId: string, cityData: CityFavoriteInput): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_city_favorites')
        .insert({
          user_id: userId,
          city_id: cityData.city_id,
          city_name: cityData.city_name,
          country: cityData.country,
          coordinates: cityData.coordinates
        })

      if (error) {
        logError('Failed to add city favorite', error, 'CityFavoritesService')
        return false
      }

      logInfo('City favorite added successfully', { userId, cityId: cityData.city_id }, 'CityFavoritesService')
      return true
    } catch (error) {
      logError('Error adding city favorite', error, 'CityFavoritesService')
      return false
    }
  }

  /**
   * 从收藏中移除城市
   */
  async removeFavorite(userId: string, cityId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_city_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('city_id', cityId)

      if (error) {
        logError('Failed to remove city favorite', error, 'CityFavoritesService')
        return false
      }

      logInfo('City favorite removed successfully', { userId, cityId }, 'CityFavoritesService')
      return true
    } catch (error) {
      logError('Error removing city favorite', error, 'CityFavoritesService')
      return false
    }
  }

  /**
   * 检查城市是否已收藏
   */
  async isFavorite(userId: string, cityId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_city_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('city_id', cityId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        logError('Failed to check city favorite status', error, 'CityFavoritesService')
        return false
      }

      return !!data
    } catch (error) {
      logError('Error checking city favorite status', error, 'CityFavoritesService')
      return false
    }
  }

  /**
   * 切换城市收藏状态
   */
  async toggleFavorite(userId: string, cityData: CityFavoriteInput): Promise<boolean> {
    try {
      const isCurrentlyFavorite = await this.isFavorite(userId, cityData.city_id)
      
      if (isCurrentlyFavorite) {
        return await this.removeFavorite(userId, cityData.city_id)
      } else {
        return await this.addFavorite(userId, cityData)
      }
    } catch (error) {
      logError('Error toggling city favorite', error, 'CityFavoritesService')
      return false
    }
  }

  /**
   * 获取收藏城市数量
   */
  async getFavoriteCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('user_city_favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (error) {
        logError('Failed to get favorite count', error, 'CityFavoritesService')
        return 0
      }

      return count || 0
    } catch (error) {
      logError('Error getting favorite count', error, 'CityFavoritesService')
      return 0
    }
  }
}

export const cityFavoritesService = new CityFavoritesService()
