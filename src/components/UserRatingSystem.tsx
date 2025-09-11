'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { useUser } from '@/contexts/GlobalStateContext'
import { userRatingService, UserRating, UserReview, UserRatingSummary } from '@/lib/userRatingService'
import { Star, MessageCircle, ThumbsUp, ThumbsDown } from 'lucide-react'

interface UserRatingSystemProps {
  targetUserId: string
  targetUserName: string
  onRatingAdded?: () => void
  onReviewAdded?: () => void
}

export default function UserRatingSystem({ 
  targetUserId, 
  targetUserName, 
  onRatingAdded, 
  onReviewAdded 
}: UserRatingSystemProps) {
  const { t } = useTranslation()
  const { user } = useUser()
  const [ratings, setRatings] = useState<UserRating[]>([])
  const [reviews, setReviews] = useState<UserReview[]>([])
  const [summary, setSummary] = useState<UserRatingSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRatingForm, setShowRatingForm] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newRating, setNewRating] = useState({
    professional: 0,
    social: 0,
    reliability: 0,
    communication: 0,
    overall: 0
  })
  const [newReview, setNewReview] = useState({
    title: '',
    content: '',
    rating: 0
  })

  // 加载评分数据
  useEffect(() => {
    const loadRatingData = async () => {
      if (!targetUserId) return

      try {
        setLoading(true)
        const [ratingsData, reviewsData, summaryData] = await Promise.all([
          userRatingService.getUserRatings(targetUserId),
          userRatingService.getUserReviews(targetUserId),
          userRatingService.getUserRatingSummary(targetUserId)
        ])

        setRatings(ratingsData)
        setReviews(reviewsData)
        setSummary(summaryData)
      } catch (error) {
        console.error('Failed to load rating data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRatingData()
  }, [targetUserId])

  // 提交评分
  const handleSubmitRating = async () => {
    if (!user?.profile?.id) {
      alert('Please login to submit ratings')
      return
    }

    try {
      const categories = ['professional', 'social', 'reliability', 'communication', 'overall'] as const
      
      for (const category of categories) {
        if (newRating[category] > 0) {
          await userRatingService.addRating({
            user_id: targetUserId,
            reviewer_id: user.profile.id,
            rating: newRating[category],
            category
          })
        }
      }

      // 重新加载数据
      const [ratingsData, summaryData] = await Promise.all([
        userRatingService.getUserRatings(targetUserId),
        userRatingService.getUserRatingSummary(targetUserId)
      ])

      setRatings(ratingsData)
      setSummary(summaryData)
      setShowRatingForm(false)
      setNewRating({
        professional: 0,
        social: 0,
        reliability: 0,
        communication: 0,
        overall: 0
      })

      onRatingAdded?.()
    } catch (error) {
      console.error('Failed to submit rating:', error)
      alert('Failed to submit rating. Please try again.')
    }
  }

  // 提交评论
  const handleSubmitReview = async () => {
    if (!user?.profile?.id) {
      alert('Please login to submit reviews')
      return
    }

    if (!newReview.content.trim()) {
      alert('Please enter a review content')
      return
    }

    try {
      await userRatingService.addReview({
        user_id: targetUserId,
        reviewer_id: user.profile.id,
        title: newReview.title,
        content: newReview.content,
        rating: newReview.rating
      })

      // 重新加载数据
      const reviewsData = await userRatingService.getUserReviews(targetUserId)
      setReviews(reviewsData)
      setShowReviewForm(false)
      setNewReview({
        title: '',
        content: '',
        rating: 0
      })

      onReviewAdded?.()
    } catch (error) {
      console.error('Failed to submit review:', error)
      alert('Failed to submit review. Please try again.')
    }
  }

  // 渲染星级评分
  const renderStarRating = (rating: number, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange?.(star)}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400 transition-colors`}
          >
            <Star className="w-5 h-5 fill-current" />
          </button>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Rating & Reviews for {targetUserName}</h3>

      {/* 评分汇总 */}
      {summary && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Rating</span>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">{summary.averageRating}</span>
              {renderStarRating(Math.round(summary.averageRating))}
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Based on {summary.totalRatings} ratings
          </div>
          
          {/* 分类评分 */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            {Object.entries(summary.categoryRatings).map(([category, rating]) => (
              <div key={category} className="flex justify-between">
                <span className="capitalize">{category}</span>
                <span className="font-medium">{rating.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 评分按钮 */}
      {user?.isAuthenticated && user.profile.id !== targetUserId && (
        <div className="mb-4 space-x-2">
          <button
            onClick={() => setShowRatingForm(!showRatingForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ThumbsUp className="w-4 h-4 inline mr-2" />
            Rate User
          </button>
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4 inline mr-2" />
            Write Review
          </button>
        </div>
      )}

      {/* 评分表单 */}
      {showRatingForm && (
        <div className="mb-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
          <h4 className="font-medium mb-3">Rate {targetUserName}</h4>
          <div className="space-y-3">
            {(['professional', 'social', 'reliability', 'communication', 'overall'] as const).map((category) => (
              <div key={category} className="flex items-center justify-between">
                <span className="capitalize text-sm font-medium">{category}</span>
                {renderStarRating(newRating[category], (rating) => 
                  setNewRating(prev => ({ ...prev, [category]: rating }))
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex space-x-2">
            <button
              onClick={handleSubmitRating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Rating
            </button>
            <button
              onClick={() => setShowRatingForm(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 评论表单 */}
      {showReviewForm && (
        <div className="mb-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
          <h4 className="font-medium mb-3">Write a Review for {targetUserName}</h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Review title (optional)"
              value={newReview.title}
              onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <textarea
              placeholder="Write your review..."
              value={newReview.content}
              onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Overall Rating:</span>
              {renderStarRating(newReview.rating, (rating) => 
                setNewReview(prev => ({ ...prev, rating }))
              )}
            </div>
          </div>
          <div className="mt-4 flex space-x-2">
            <button
              onClick={handleSubmitReview}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Submit Review
            </button>
            <button
              onClick={() => setShowReviewForm(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 评论列表 */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Reviews ({reviews.length})</h4>
          {reviews.map((review) => (
            <div key={review.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">Anonymous User</span>
                  {renderStarRating(review.rating)}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(review.created_at || '').toLocaleDateString()}
                </span>
              </div>
              {review.title && (
                <h5 className="font-medium text-sm mb-1">{review.title}</h5>
              )}
              <p className="text-sm text-gray-700 dark:text-gray-300">{review.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
