import { supabase } from './supabase'
import { logError, logInfo } from './logger'

export interface CityReview {
  id: string
  user_id: string
  city_id: string
  city_name: string
  country: string
  rating: number
  review_text?: string
  visit_date?: string
  created_at: string
  updated_at: string
}

export interface CityReviewInput {
  city_id: string
  city_name: string
  country: string
  rating: number
  review_text?: string
  visit_date?: string
}

class CityReviewsService {
  /**
   * 获取用户的城市评论
   */
  async getUserReviews(userId: string): Promise<CityReview[]> {
    try {
      const { data, error } = await supabase
        .from('user_city_reviews')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        logError('Failed to fetch user city reviews', error, 'CityReviewsService')
        return []
      }

      return data || []
    } catch (error) {
      logError('Error fetching user city reviews', error, 'CityReviewsService')
      return []
    }
  }

  /**
   * 获取特定城市的用户评论
   */
  async getCityReview(userId: string, cityId: string): Promise<CityReview | null> {
    try {
      const { data, error } = await supabase
        .from('user_city_reviews')
        .select('*')
        .eq('user_id', userId)
        .eq('city_id', cityId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        logError('Failed to fetch city review', error, 'CityReviewsService')
        return null
      }

      return data || null
    } catch (error) {
      logError('Error fetching city review', error, 'CityReviewsService')
      return null
    }
  }

  /**
   * 创建或更新城市评论
   */
  async upsertCityReview(userId: string, reviewData: CityReviewInput): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_city_reviews')
        .upsert({
          user_id: userId,
          city_id: reviewData.city_id,
          city_name: reviewData.city_name,
          country: reviewData.country,
          rating: reviewData.rating,
          review_text: reviewData.review_text,
          visit_date: reviewData.visit_date
        })

      if (error) {
        logError('Failed to upsert city review', error, 'CityReviewsService')
        return false
      }

      logInfo('City review upserted successfully', { userId, cityId: reviewData.city_id }, 'CityReviewsService')
      return true
    } catch (error) {
      logError('Error upserting city review', error, 'CityReviewsService')
      return false
    }
  }

  /**
   * 删除城市评论
   */
  async deleteCityReview(userId: string, cityId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_city_reviews')
        .delete()
        .eq('user_id', userId)
        .eq('city_id', cityId)

      if (error) {
        logError('Failed to delete city review', error, 'CityReviewsService')
        return false
      }

      logInfo('City review deleted successfully', { userId, cityId }, 'CityReviewsService')
      return true
    } catch (error) {
      logError('Error deleting city review', error, 'CityReviewsService')
      return false
    }
  }

  /**
   * 获取用户评论数量
   */
  async getUserReviewsCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('user_city_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (error) {
        logError('Failed to get user reviews count', error, 'CityReviewsService')
        return 0
      }

      return count || 0
    } catch (error) {
      logError('Error getting user reviews count', error, 'CityReviewsService')
      return 0
    }
  }

  /**
   * 获取用户平均评分
   */
  async getUserAverageRating(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('user_city_reviews')
        .select('rating')
        .eq('user_id', userId)

      if (error) {
        logError('Failed to get user average rating', error, 'CityReviewsService')
        return 0
      }

      if (!data || data.length === 0) {
        return 0
      }

      const totalRating = data.reduce((sum: number, review: any) => sum + review.rating, 0)
      return Math.round((totalRating / data.length) * 10) / 10 // Round to 1 decimal place
    } catch (error) {
      logError('Error getting user average rating', error, 'CityReviewsService')
      return 0
    }
  }

  /**
   * 检查用户是否已评论过某个城市
   */
  async hasReviewedCity(userId: string, cityId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_city_reviews')
        .select('id')
        .eq('user_id', userId)
        .eq('city_id', cityId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        logError('Failed to check if city was reviewed', error, 'CityReviewsService')
        return false
      }

      return !!data
    } catch (error) {
      logError('Error checking if city was reviewed', error, 'CityReviewsService')
      return false
    }
  }

  /**
   * 获取用户最近评论的城市
   */
  async getRecentReviews(userId: string, limit: number = 5): Promise<CityReview[]> {
    try {
      const { data, error } = await supabase
        .from('user_city_reviews')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        logError('Failed to get recent reviews', error, 'CityReviewsService')
        return []
      }

      return data || []
    } catch (error) {
      logError('Error getting recent reviews', error, 'CityReviewsService')
      return []
    }
  }
}

export const cityReviewsService = new CityReviewsService()
