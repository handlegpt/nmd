/**
 * 用户评分系统服务
 * 处理用户评分、评论等数据的数据库操作
 */

import { supabase } from './supabase'
import { logInfo, logError } from './logger'

export interface UserRating {
  id?: string
  user_id: string
  reviewer_id: string
  rating: number
  category: 'professional' | 'social' | 'reliability' | 'communication' | 'overall'
  comment?: string
  created_at?: string
  updated_at?: string
}

export interface UserReview {
  id?: string
  user_id: string
  reviewer_id: string
  title?: string
  content: string
  rating: number
  tags?: string[]
  is_verified?: boolean
  created_at?: string
  updated_at?: string
}

export interface UserRatingSummary {
  userId: string
  averageRating: number
  totalRatings: number
  categoryRatings: {
    professional: number
    social: number
    reliability: number
    communication: number
    overall: number
  }
  lastUpdated: string
}

class UserRatingService {
  private static instance: UserRatingService

  static getInstance(): UserRatingService {
    if (!UserRatingService.instance) {
      UserRatingService.instance = new UserRatingService()
    }
    return UserRatingService.instance
  }

  /**
   * 添加用户评分
   */
  async addRating(rating: Omit<UserRating, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      logInfo('Adding user rating to database', { rating }, 'UserRatingService')

      const { error } = await supabase
        .from('user_ratings')
        .upsert({
          user_id: rating.user_id,
          reviewer_id: rating.reviewer_id,
          rating: rating.rating,
          category: rating.category,
          comment: rating.comment,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,reviewer_id,category'
        })

      if (error) {
        logError('Failed to add user rating', error, 'UserRatingService')
        return false
      }

      logInfo('Successfully added user rating', { rating }, 'UserRatingService')
      return true
    } catch (error) {
      logError('Error adding user rating', error, 'UserRatingService')
      return false
    }
  }

  /**
   * 获取用户评分
   */
  async getUserRatings(userId: string): Promise<UserRating[]> {
    try {
      logInfo('Fetching user ratings from database', { userId }, 'UserRatingService')

      const { data, error } = await supabase
        .from('user_ratings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        logError('Failed to fetch user ratings', error, 'UserRatingService')
        return []
      }

      logInfo('Successfully fetched user ratings', { userId, count: data.length }, 'UserRatingService')
      return data || []
    } catch (error) {
      logError('Error fetching user ratings', error, 'UserRatingService')
      return []
    }
  }

  /**
   * 添加用户评论
   */
  async addReview(review: Omit<UserReview, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      logInfo('Adding user review to database', { review }, 'UserRatingService')

      const { error } = await supabase
        .from('user_reviews')
        .insert({
          user_id: review.user_id,
          reviewer_id: review.reviewer_id,
          title: review.title,
          content: review.content,
          rating: review.rating,
          tags: review.tags || [],
          is_verified: review.is_verified || false
        })

      if (error) {
        logError('Failed to add user review', error, 'UserRatingService')
        return false
      }

      logInfo('Successfully added user review', { review }, 'UserRatingService')
      return true
    } catch (error) {
      logError('Error adding user review', error, 'UserRatingService')
      return false
    }
  }

  /**
   * 获取用户评论
   */
  async getUserReviews(userId: string): Promise<UserReview[]> {
    try {
      logInfo('Fetching user reviews from database', { userId }, 'UserRatingService')

      const { data, error } = await supabase
        .from('user_reviews')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        logError('Failed to fetch user reviews', error, 'UserRatingService')
        return []
      }

      logInfo('Successfully fetched user reviews', { userId, count: data.length }, 'UserRatingService')
      return data || []
    } catch (error) {
      logError('Error fetching user reviews', error, 'UserRatingService')
      return []
    }
  }

  /**
   * 获取用户评分汇总
   */
  async getUserRatingSummary(userId: string): Promise<UserRatingSummary | null> {
    try {
      logInfo('Calculating user rating summary', { userId }, 'UserRatingService')

      const { data: ratings, error } = await supabase
        .from('user_ratings')
        .select('rating, category')
        .eq('user_id', userId)

      if (error) {
        logError('Failed to fetch ratings for summary', error, 'UserRatingService')
        return null
      }

      if (!ratings || ratings.length === 0) {
        return {
          userId,
          averageRating: 0,
          totalRatings: 0,
          categoryRatings: {
            professional: 0,
            social: 0,
            reliability: 0,
            communication: 0,
            overall: 0
          },
          lastUpdated: new Date().toISOString()
        }
      }

      // 计算平均评分
      const totalRating = ratings.reduce((sum: number, r: any) => sum + r.rating, 0)
      const averageRating = totalRating / ratings.length

      // 计算各分类平均评分
      const categoryRatings = {
        professional: 0,
        social: 0,
        reliability: 0,
        communication: 0,
        overall: 0
      }

      const categoryCounts = {
        professional: 0,
        social: 0,
        reliability: 0,
        communication: 0,
        overall: 0
      }

      ratings.forEach((rating: any) => {
        const category = rating.category as keyof typeof categoryRatings
        categoryRatings[category] += rating.rating
        categoryCounts[category] += 1
      })

      // 计算各分类平均分
      Object.keys(categoryRatings).forEach(category => {
        const key = category as keyof typeof categoryRatings
        if (categoryCounts[key] > 0) {
          categoryRatings[key] = categoryRatings[key] / categoryCounts[key]
        }
      })

      const summary: UserRatingSummary = {
        userId,
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings: ratings.length,
        categoryRatings,
        lastUpdated: new Date().toISOString()
      }

      logInfo('Successfully calculated rating summary', { userId, summary }, 'UserRatingService')
      return summary
    } catch (error) {
      logError('Error calculating rating summary', error, 'UserRatingService')
      return null
    }
  }

  /**
   * 获取评分者信息
   */
  async getReviewerInfo(reviewerId: string): Promise<{ name: string; avatar: string } | null> {
    try {
      // 首先尝试从数据库获取
      const { data: user, error } = await supabase
        .from('users')
        .select('name, avatar_url')
        .eq('id', reviewerId)
        .single()

      if (error || !user) {
        // 如果数据库中没有，尝试从localStorage获取
        const allProfileKeys = Object.keys(localStorage).filter(key => 
          key.startsWith('user_profile_details')
        )
        
        for (const key of allProfileKeys) {
          try {
            const profileData = localStorage.getItem(key)
            if (profileData) {
              const profile = JSON.parse(profileData)
              if (profile.id === reviewerId) {
                return {
                  name: profile.name || 'Unknown User',
                  avatar: profile.avatar_url || profile.avatar || '??'
                }
              }
            }
          } catch (e) {
            continue
          }
        }
        
        return {
          name: 'Unknown User',
          avatar: '??'
        }
      }

      return {
        name: user.name || 'Unknown User',
        avatar: user.avatar_url || '??'
      }
    } catch (error) {
      logError('Error getting reviewer info', error, 'UserRatingService')
      return {
        name: 'Unknown User',
        avatar: '??'
      }
    }
  }

  /**
   * 检查用户是否已评分
   */
  async hasUserRated(userId: string, reviewerId: string, category: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_ratings')
        .select('id')
        .eq('user_id', userId)
        .eq('reviewer_id', reviewerId)
        .eq('category', category)
        .single()

      if (error && error.code !== 'PGRST116') {
        logError('Failed to check if user has rated', error, 'UserRatingService')
        return false
      }

      return !!data
    } catch (error) {
      logError('Error checking if user has rated', error, 'UserRatingService')
      return false
    }
  }

  /**
   * 获取用户的所有评分（作为评分者）
   */
  async getUserRatingsAsReviewer(reviewerId: string): Promise<UserRating[]> {
    try {
      const { data, error } = await supabase
        .from('user_ratings')
        .select('*')
        .eq('reviewer_id', reviewerId)
        .order('created_at', { ascending: false })

      if (error) {
        logError('Failed to fetch user ratings as reviewer', error, 'UserRatingService')
        return []
      }

      return data || []
    } catch (error) {
      logError('Error fetching user ratings as reviewer', error, 'UserRatingService')
      return []
    }
  }
}

export const userRatingService = UserRatingService.getInstance()
