'use client'

import { useState, useEffect } from 'react'
import { StarIcon, MessageCircleIcon, ThumbsUpIcon, UserIcon } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useUser } from '@/contexts/GlobalStateContext'

interface Review {
  id: string
  userId: string
  userName: string
  userAvatar: string
  rating: number
  comment: string
  date: string
  likes: number
  replies: Reply[]
  cityId: string
}

interface Reply {
  id: string
  userId: string
  userName: string
  userAvatar: string
  comment: string
  date: string
  likes: number
}

interface CityReviewsProps {
  cityId: string
  onReviewAdded?: () => void
}

export default function CityReviews({ cityId, onReviewAdded }: CityReviewsProps) {
  const { t } = useTranslation()
  const { user } = useUser()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddReview, setShowAddReview] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [cityId])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      // 模拟API调用
      const mockReviews: Review[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'Sarah M.',
          userAvatar: '👩‍💻',
          rating: 5,
          comment: '里斯本是我去过的最适合数字游民的城市之一。WiFi速度快，生活成本合理，社区氛围很好。强烈推荐！',
          date: '2024-01-15',
          likes: 12,
          replies: [],
          cityId
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'Mike R.',
          userAvatar: '👨‍💻',
          rating: 4,
          comment: '整体体验不错，但住宿价格在旺季会比较高。建议提前预订。',
          date: '2024-01-10',
          likes: 8,
          replies: [],
          cityId
        },
        {
          id: '3',
          userId: 'user3',
          userName: 'Emma L.',
          userAvatar: '👩‍💼',
          rating: 5,
          comment: '这里的联合办公空间很棒，认识了很多志同道合的朋友。',
          date: '2024-01-05',
          likes: 15,
          replies: [],
          cityId
        }
      ]
      setReviews(mockReviews)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!user) {
      alert('请先登录')
      return
    }

    if (!newReview.comment.trim()) {
      alert('请输入评论内容')
      return
    }

    try {
      setSubmitting(true)
      // 模拟API调用
      const review: Review = {
        id: Date.now().toString(),
        userId: user.profile?.id || 'anonymous',
                  userName: user.profile?.email?.split('@')[0] || 'Anonymous',
        userAvatar: '👤',
        rating: newReview.rating,
        comment: newReview.comment,
        date: new Date().toISOString().split('T')[0],
        likes: 0,
        replies: [],
        cityId
      }

      setReviews(prev => [review, ...prev])
      setNewReview({ rating: 5, comment: '' })
      setShowAddReview(false)
      onReviewAdded?.()
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('提交评论失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLikeReview = (reviewId: string) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { ...review, likes: review.likes + 1 }
        : review
    ))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">{t('cityDetail.userReviews')}</h3>
        <button
          onClick={() => setShowAddReview(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <MessageCircleIcon className="h-4 w-4" />
          <span>{t('cityDetail.writeReview')}</span>
        </button>
      </div>

      {/* Add Review Form */}
      {showAddReview && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-4">写评论</h4>
          <div className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">评分</label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                    className="focus:outline-none"
                  >
                    <StarIcon
                      className={`h-6 w-6 ${
                        star <= newReview.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">评论</label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="分享您在这个城市的体验..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? '提交中...' : '提交评论'}
              </button>
              <button
                onClick={() => setShowAddReview(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">还没有评论，成为第一个评论者吧！</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-4">
              {/* Review Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                    {review.userAvatar}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{review.userName}</div>
                    <div className="text-sm text-gray-500">{formatDate(review.date)}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Review Content */}
              <p className="text-gray-700 mb-3">{review.comment}</p>

              {/* Review Actions */}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <button
                  onClick={() => handleLikeReview(review.id)}
                  className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                >
                  <ThumbsUpIcon className="h-4 w-4" />
                  <span>{review.likes}</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                  <MessageCircleIcon className="h-4 w-4" />
                  <span>回复</span>
                </button>
              </div>

              {/* Replies */}
              {review.replies.length > 0 && (
                <div className="mt-4 pl-4 border-l-2 border-gray-100 space-y-3">
                  {review.replies.map((reply) => (
                    <div key={reply.id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                        {reply.userAvatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{reply.userName}</span>
                          <span className="text-xs text-gray-500">{formatDate(reply.date)}</span>
                        </div>
                        <p className="text-gray-700 text-sm">{reply.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}