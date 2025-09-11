// 真实用户评分和评价系统
export interface UserRating {
  id: string
  userId: string // 被评分的用户ID
  reviewerId: string // 评分者ID
  reviewerName: string
  reviewerAvatar: string
  rating: number // 1-5星评分
  comment: string
  category: 'professional' | 'social' | 'reliability' | 'communication' | 'overall'
  createdAt: Date
  updatedAt: Date
}

export interface UserReview {
  id: string
  userId: string // 被评价的用户ID
  reviewerId: string // 评价者ID
  reviewerName: string
  reviewerAvatar: string
  title: string
  content: string
  rating: number
  tags: string[]
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserRatingSummary {
  userId: string
  averageRating: number
  totalRatings: number
  ratingBreakdown: {
    '1': number
    '2': number
    '3': number
    '4': number
    '5': number
  }
  categoryRatings: {
    professional: number
    social: number
    reliability: number
    communication: number
    overall: number
  }
  recentReviews: UserReview[]
  lastUpdated: Date
}

class RatingSystem {
  private ratingsKey = 'user_ratings'
  private reviewsKey = 'user_reviews'
  private summariesKey = 'user_rating_summaries'

  // 获取用户评分
  getUserRatings(userId: string): UserRating[] {
    try {
      const stored = localStorage.getItem(this.ratingsKey)
      if (stored) {
        const allRatings = JSON.parse(stored)
        const userRatings = allRatings.filter((rating: any) => rating.userId === userId)
        return userRatings.map((rating: any) => ({
          ...rating,
          createdAt: new Date(rating.createdAt),
          updatedAt: new Date(rating.updatedAt)
        }))
      }
    } catch (error) {
      console.error('Failed to load user ratings:', error)
    }
    return []
  }

  // 保存用户评分
  saveUserRatings(ratings: UserRating[]): void {
    try {
      localStorage.setItem(this.ratingsKey, JSON.stringify(ratings))
    } catch (error) {
      console.error('Failed to save user ratings:', error)
    }
  }

  // 获取用户评价
  getUserReviews(userId: string): UserReview[] {
    try {
      const stored = localStorage.getItem(this.reviewsKey)
      if (stored) {
        const allReviews = JSON.parse(stored)
        const userReviews = allReviews.filter((review: any) => review.userId === userId)
        return userReviews.map((review: any) => ({
          ...review,
          createdAt: new Date(review.createdAt),
          updatedAt: new Date(review.updatedAt)
        }))
      }
    } catch (error) {
      console.error('Failed to load user reviews:', error)
    }
    return []
  }

  // 保存用户评价
  saveUserReviews(reviews: UserReview[]): void {
    try {
      localStorage.setItem(this.reviewsKey, JSON.stringify(reviews))
    } catch (error) {
      console.error('Failed to save user reviews:', error)
    }
  }

  // 添加评分
  addRating(userId: string, reviewerId: string, reviewerName: string, reviewerAvatar: string, rating: number, comment: string, category: UserRating['category']): boolean {
    try {
      const ratings = this.getAllRatings()
      
      // 检查是否已经评分过
      const existingRating = ratings.find(r => r.userId === userId && r.reviewerId === reviewerId && r.category === category)
      
      const newRating: UserRating = {
        id: `rating_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        reviewerId,
        reviewerName,
        reviewerAvatar,
        rating: Math.max(1, Math.min(5, rating)), // 确保评分在1-5之间
        comment,
        category,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      if (existingRating) {
        // 更新现有评分
        const index = ratings.findIndex(r => r.id === existingRating.id)
        ratings[index] = { ...newRating, id: existingRating.id }
      } else {
        // 添加新评分
        ratings.push(newRating)
      }

      this.saveUserRatings(ratings)
      this.updateUserRatingSummary(userId)
      
      return true
    } catch (error) {
      console.error('Failed to add rating:', error)
      return false
    }
  }

  // 添加评价
  addReview(userId: string, reviewerId: string, reviewerName: string, reviewerAvatar: string, title: string, content: string, rating: number, tags: string[]): boolean {
    try {
      const reviews = this.getAllReviews()
      
      // 检查是否已经评价过
      const existingReview = reviews.find(r => r.userId === userId && r.reviewerId === reviewerId)
      
      const newReview: UserReview = {
        id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        reviewerId,
        reviewerName,
        reviewerAvatar,
        title,
        content,
        rating: Math.max(1, Math.min(5, rating)),
        tags,
        isVerified: true, // 假设所有评价都是已验证的
        createdAt: new Date(),
        updatedAt: new Date()
      }

      if (existingReview) {
        // 更新现有评价
        const index = reviews.findIndex(r => r.id === existingReview.id)
        reviews[index] = { ...newReview, id: existingReview.id }
      } else {
        // 添加新评价
        reviews.push(newReview)
      }

      this.saveUserReviews(reviews)
      this.updateUserRatingSummary(userId)
      
      return true
    } catch (error) {
      console.error('Failed to add review:', error)
      return false
    }
  }

  // 获取所有评分
  private getAllRatings(): UserRating[] {
    try {
      const stored = localStorage.getItem(this.ratingsKey)
      if (stored) {
        const ratings = JSON.parse(stored)
        return ratings.map((rating: any) => ({
          ...rating,
          createdAt: new Date(rating.createdAt),
          updatedAt: new Date(rating.updatedAt)
        }))
      }
    } catch (error) {
      console.error('Failed to load all ratings:', error)
    }
    return []
  }

  // 获取所有评价
  private getAllReviews(): UserReview[] {
    try {
      const stored = localStorage.getItem(this.reviewsKey)
      if (stored) {
        const reviews = JSON.parse(stored)
        return reviews.map((review: any) => ({
          ...review,
          createdAt: new Date(review.createdAt),
          updatedAt: new Date(review.updatedAt)
        }))
      }
    } catch (error) {
      console.error('Failed to load all reviews:', error)
    }
    return []
  }

  // 更新用户评分摘要
  private updateUserRatingSummary(userId: string): void {
    const ratings = this.getUserRatings(userId)
    const reviews = this.getUserReviews(userId)
    
    if (ratings.length === 0) return

    // 计算平均评分
    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0)
    const averageRating = totalRating / ratings.length

    // 计算评分分布
    const ratingBreakdown = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
    ratings.forEach(rating => {
      ratingBreakdown[rating.rating.toString() as keyof typeof ratingBreakdown]++
    })

    // 计算分类评分
    const categoryRatings = {
      professional: 0,
      social: 0,
      reliability: 0,
      communication: 0,
      overall: 0
    }

    Object.keys(categoryRatings).forEach(category => {
      const categoryRatingList = ratings.filter(r => r.category === category)
      if (categoryRatingList.length > 0) {
        const categoryTotal = categoryRatingList.reduce((sum, rating) => sum + rating.rating, 0)
        categoryRatings[category as keyof typeof categoryRatings] = categoryTotal / categoryRatingList.length
      }
    })

    // 获取最近的评价
    const recentReviews = reviews
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)

    const summary: UserRatingSummary = {
      userId,
      averageRating: Math.round(averageRating * 10) / 10, // 保留一位小数
      totalRatings: ratings.length,
      ratingBreakdown,
      categoryRatings,
      recentReviews,
      lastUpdated: new Date()
    }

    // 保存摘要
    try {
      const stored = localStorage.getItem(this.summariesKey)
      const summaries = stored ? JSON.parse(stored) : []
      const existingIndex = summaries.findIndex((s: any) => s.userId === userId)
      
      if (existingIndex !== -1) {
        summaries[existingIndex] = summary
      } else {
        summaries.push(summary)
      }
      
      localStorage.setItem(this.summariesKey, JSON.stringify(summaries))
    } catch (error) {
      console.error('Failed to save rating summary:', error)
    }
  }

  // 获取用户评分摘要
  getUserRatingSummary(userId: string): UserRatingSummary | null {
    try {
      const stored = localStorage.getItem(this.summariesKey)
      if (stored) {
        const summaries = JSON.parse(stored)
        const summary = summaries.find((s: any) => s.userId === userId)
        if (summary) {
          return {
            ...summary,
            lastUpdated: new Date(summary.lastUpdated),
            recentReviews: summary.recentReviews.map((review: any) => ({
              ...review,
              createdAt: new Date(review.createdAt),
              updatedAt: new Date(review.updatedAt)
            }))
          }
        }
      }
    } catch (error) {
      console.error('Failed to load rating summary:', error)
    }
    return null
  }

  // 初始化真实数据
  initializeRealData(): void {
    // 从localStorage获取所有用户资料
    const keys = Object.keys(localStorage)
    const profileKeys = keys.filter(key => key.startsWith('user_profile_details'))
    
    const ratings: UserRating[] = []
    const reviews: UserReview[] = []
    
    profileKeys.forEach((key, index) => {
      try {
        const profileData = localStorage.getItem(key)
        if (profileData) {
          const profile = JSON.parse(profileData)
          if (profile?.id && profile?.name) {
            // 为每个用户生成一些示例评分和评价
            this.generateSampleRatings(profile, ratings, reviews, profileKeys, index)
          }
        }
      } catch (e) {
        console.error('Failed to generate sample ratings:', e)
      }
    })
    
    this.saveUserRatings(ratings)
    this.saveUserReviews(reviews)
    
    // 为每个用户生成评分摘要
    profileKeys.forEach(key => {
      try {
        const profileData = localStorage.getItem(key)
        if (profileData) {
          const profile = JSON.parse(profileData)
          if (profile?.id) {
            this.updateUserRatingSummary(profile.id)
          }
        }
      } catch (e) {
        console.error('Failed to update rating summary:', e)
      }
    })
  }

  // 生成示例评分
  private generateSampleRatings(profile: any, ratings: UserRating[], reviews: UserReview[], allProfiles: string[], currentIndex: number): void {
    const categories: UserRating['category'][] = ['professional', 'social', 'reliability', 'communication', 'overall']
    const reviewTitles = [
      'Great coworking partner',
      'Excellent communication',
      'Very reliable person',
      'Fun to hang out with',
      'Professional and helpful',
      'Great networking skills',
      'Always on time',
      'Very knowledgeable',
      'Easy to work with',
      'Friendly and approachable'
    ]
    
    const reviewContents = [
      'Had a great time working together. Very professional and easy to communicate with.',
      'Excellent networking skills and always willing to help others.',
      'Very reliable and always delivers on promises. Highly recommended!',
      'Great personality and fun to be around. Made the meetup enjoyable.',
      'Professional approach to work and very knowledgeable in their field.',
      'Easy to work with and always brings positive energy to the group.',
      'Punctual and organized. Great attention to detail.',
      'Very helpful and always willing to share knowledge and experience.',
      'Friendly and approachable. Great for networking and collaboration.',
      'Excellent communication skills and very responsive to messages.'
    ]
    
    const tags = [
      ['Professional', 'Reliable'],
      ['Friendly', 'Helpful'],
      ['Knowledgeable', 'Experienced'],
      ['Punctual', 'Organized'],
      ['Great communicator', 'Team player'],
      ['Networking', 'Social'],
      ['Creative', 'Innovative'],
      ['Supportive', 'Encouraging'],
      ['Flexible', 'Adaptable'],
      ['Motivated', 'Ambitious']
    ]

    // 为每个用户生成2-4个评分
    const numRatings = Math.floor(Math.random() * 3) + 2
    for (let i = 0; i < numRatings; i++) {
      const reviewerIndex = Math.floor(Math.random() * allProfiles.length)
      if (reviewerIndex === currentIndex) continue // 不给自己评分
      
      try {
        const reviewerData = localStorage.getItem(allProfiles[reviewerIndex])
        if (reviewerData) {
          const reviewer = JSON.parse(reviewerData)
          if (reviewer?.id && reviewer?.name) {
            const category = categories[Math.floor(Math.random() * categories.length)]
            const rating = Math.floor(Math.random() * 2) + 4 // 4-5星评分
            
            const newRating: UserRating = {
              id: `sample_rating_${profile.id}_${reviewer.id}_${i}`,
              userId: profile.id,
              reviewerId: reviewer.id,
              reviewerName: reviewer.name,
              reviewerAvatar: reviewer.avatar_url || reviewer.name.substring(0, 2).toUpperCase(),
              rating,
              comment: this.generateRatingComment(category, rating),
              category,
              createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // 30天内
              updatedAt: new Date()
            }
            
            ratings.push(newRating)
          }
        }
      } catch (e) {
        console.error('Failed to generate sample rating:', e)
      }
    }

    // 为每个用户生成1-2个评价
    const numReviews = Math.floor(Math.random() * 2) + 1
    for (let i = 0; i < numReviews; i++) {
      const reviewerIndex = Math.floor(Math.random() * allProfiles.length)
      if (reviewerIndex === currentIndex) continue // 不给自己评价
      
      try {
        const reviewerData = localStorage.getItem(allProfiles[reviewerIndex])
        if (reviewerData) {
          const reviewer = JSON.parse(reviewerData)
          if (reviewer?.id && reviewer?.name) {
            const titleIndex = Math.floor(Math.random() * reviewTitles.length)
            const contentIndex = Math.floor(Math.random() * reviewContents.length)
            const tagIndex = Math.floor(Math.random() * tags.length)
            const rating = Math.floor(Math.random() * 2) + 4 // 4-5星评分
            
            const newReview: UserReview = {
              id: `sample_review_${profile.id}_${reviewer.id}_${i}`,
              userId: profile.id,
              reviewerId: reviewer.id,
              reviewerName: reviewer.name,
              reviewerAvatar: reviewer.avatar_url || reviewer.name.substring(0, 2).toUpperCase(),
              title: reviewTitles[titleIndex],
              content: reviewContents[contentIndex],
              rating,
              tags: tags[tagIndex],
              isVerified: true,
              createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // 30天内
              updatedAt: new Date()
            }
            
            reviews.push(newReview)
          }
        }
      } catch (e) {
        console.error('Failed to generate sample review:', e)
      }
    }
  }

  // 生成评分评论
  private generateRatingComment(category: UserRating['category'], rating: number): string {
    const comments = {
      professional: {
        4: 'Very professional and reliable',
        5: 'Extremely professional and knowledgeable'
      },
      social: {
        4: 'Great social skills and easy to talk to',
        5: 'Excellent social skills and very friendly'
      },
      reliability: {
        4: 'Very reliable and trustworthy',
        5: 'Extremely reliable and always delivers'
      },
      communication: {
        4: 'Good communication skills',
        5: 'Excellent communication and very responsive'
      },
      overall: {
        4: 'Great person to work with',
        5: 'Outstanding individual, highly recommended'
      }
    }
    
    return comments[category][rating as keyof typeof comments[typeof category]] || 'Good experience'
  }
}

export const ratingSystem = new RatingSystem()
