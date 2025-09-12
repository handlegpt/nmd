// User Rating API Service - 用户评分API服务
// 替代localStorage的ratingSystem.ts

export interface UserRating {
  id: string
  rater_id: string
  rated_user_id: string
  category: 'communication' | 'reliability' | 'friendliness' | 'professionalism' | 'overall'
  rating: number
  created_at: string
  updated_at: string
  rater?: {
    id: string
    name: string
    avatar_url?: string
  }
  rated_user?: {
    id: string
    name: string
    avatar_url?: string
  }
}

export interface UserReview {
  id: string
  reviewer_id: string
  reviewed_user_id: string
  content: string
  rating: number
  is_public: boolean
  created_at: string
  updated_at: string
  reviewer?: {
    id: string
    name: string
    avatar_url?: string
  }
  reviewed_user?: {
    id: string
    name: string
    avatar_url?: string
  }
}

export interface RatingSummary {
  id: string
  user_id: string
  overall_rating: number
  communication_rating: number
  reliability_rating: number
  friendliness_rating: number
  professionalism_rating: number
  total_ratings: number
  total_reviews: number
  last_calculated: string
  created_at: string
  updated_at: string
  user?: {
    id: string
    name: string
    avatar_url?: string
  }
}

class UserRatingApiService {
  private baseUrl = '/api'

  // 获取用户评分
  async getUserRatings(userId?: string, category?: string, limit = 50): Promise<UserRating[]> {
    try {
      const params = new URLSearchParams()
      if (userId) params.append('user_id', userId)
      if (category) params.append('category', category)
      params.append('limit', limit.toString())

      const response = await fetch(`${this.baseUrl}/user-ratings?${params}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch user ratings: ${response.statusText}`)
      }

      const data = await response.json()
      return data.ratings || []
    } catch (error) {
      console.error('Error fetching user ratings:', error)
      return []
    }
  }

  // 创建用户评分
  async createUserRating(
    raterId: string,
    ratedUserId: string,
    category: string,
    rating: number
  ): Promise<UserRating | null> {
    try {
      const response = await fetch(`${this.baseUrl}/user-ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rater_id: raterId,
          rated_user_id: ratedUserId,
          category,
          rating
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to create rating: ${response.statusText}`)
      }

      const data = await response.json()
      return data.rating
    } catch (error) {
      console.error('Error creating user rating:', error)
      return null
    }
  }

  // 获取用户评论
  async getUserReviews(userId?: string, limit = 50, offset = 0): Promise<UserReview[]> {
    try {
      const params = new URLSearchParams()
      if (userId) params.append('user_id', userId)
      params.append('limit', limit.toString())
      params.append('offset', offset.toString())

      const response = await fetch(`${this.baseUrl}/user-reviews?${params}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch user reviews: ${response.statusText}`)
      }

      const data = await response.json()
      return data.reviews || []
    } catch (error) {
      console.error('Error fetching user reviews:', error)
      return []
    }
  }

  // 创建用户评论
  async createUserReview(
    reviewerId: string,
    reviewedUserId: string,
    content: string,
    rating: number,
    isPublic = true
  ): Promise<UserReview | null> {
    try {
      const response = await fetch(`${this.baseUrl}/user-reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewer_id: reviewerId,
          reviewed_user_id: reviewedUserId,
          content,
          rating,
          is_public: isPublic
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to create review: ${response.statusText}`)
      }

      const data = await response.json()
      return data.review
    } catch (error) {
      console.error('Error creating user review:', error)
      return null
    }
  }

  // 获取评分摘要
  async getRatingSummaries(userId?: string, limit = 20): Promise<RatingSummary[]> {
    try {
      const params = new URLSearchParams()
      if (userId) params.append('user_id', userId)
      params.append('limit', limit.toString())

      const response = await fetch(`${this.baseUrl}/rating-summaries?${params}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch rating summaries: ${response.statusText}`)
      }

      const data = await response.json()
      return data.summaries || []
    } catch (error) {
      console.error('Error fetching rating summaries:', error)
      return []
    }
  }

  // 重新计算评分摘要
  async recalculateRatingSummary(userId: string): Promise<RatingSummary | null> {
    try {
      const response = await fetch(`${this.baseUrl}/rating-summaries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to recalculate rating summary: ${response.statusText}`)
      }

      const data = await response.json()
      return data.summary
    } catch (error) {
      console.error('Error recalculating rating summary:', error)
      return null
    }
  }

  // 获取特定用户的评分摘要
  async getUserRatingSummary(userId: string): Promise<RatingSummary | null> {
    try {
      const summaries = await this.getRatingSummaries(userId, 1)
      return summaries.length > 0 ? summaries[0] : null
    } catch (error) {
      console.error('Error fetching user rating summary:', error)
      return null
    }
  }

  // 获取用户的所有评分和评论
  async getUserRatingData(userId: string): Promise<{
    ratings: UserRating[]
    reviews: UserReview[]
    summary: RatingSummary | null
  }> {
    try {
      const [ratings, reviews, summary] = await Promise.all([
        this.getUserRatings(userId),
        this.getUserReviews(userId),
        this.getUserRatingSummary(userId)
      ])

      return { ratings, reviews, summary }
    } catch (error) {
      console.error('Error fetching user rating data:', error)
      return { ratings: [], reviews: [], summary: null }
    }
  }
}

// 导出单例实例
export const userRatingApiService = new UserRatingApiService()
export default userRatingApiService
