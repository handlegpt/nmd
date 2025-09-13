'use client'

import { useState, useEffect } from 'react'
import { 
  StarIcon, 
  MessageSquareIcon, 
  ThumbsUpIcon, 
  ThumbsDownIcon,
  UserIcon,
  CalendarIcon,
  FlagIcon
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useUser } from '@/contexts/GlobalStateContext'
import { useNotifications } from '@/contexts/GlobalStateContext'
import realtimeService from '@/lib/realtimeUpdateService'

interface CityReview {
  id: string
  cityId: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  title: string
  content: string
  pros: string[]
  cons: string[]
  visitDate: string
  stayDuration: string
  createdAt: string
  updatedAt: string
  helpfulCount: number
  notHelpfulCount: number
  isVerified: boolean
}

interface CityReviewSystemProps {
  cityId: string
  cityName: string
  onReviewSubmitted?: (review: CityReview) => void
}

export default function CityReviewSystem({ 
  cityId, 
  cityName, 
  onReviewSubmitted 
}: CityReviewSystemProps) {
  const { t } = useTranslation()
  const { user } = useUser()
  const { addNotification } = useNotifications()
  
  const [reviews, setReviews] = useState<CityReview[]>([])
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [selectedRating, setSelectedRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [reviewData, setReviewData] = useState({
    title: '',
    content: '',
    pros: [''],
    cons: [''],
    visitDate: '',
    stayDuration: ''
  })

  useEffect(() => {
    loadReviews()
  }, [cityId])

  const loadReviews = async () => {
    setLoading(true)
    try {
      // 从localStorage加载评论数据
      const storedReviews: any[] = [] // TODO: Replace localStorage with database API for city_reviews_${cityId}
      setReviews(storedReviews)
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!user.isAuthenticated) {
      addNotification({
        type: 'error',
        message: t('reviews.loginRequired')
      })
      return
    }

    if (selectedRating === 0) {
      addNotification({
        type: 'error',
        message: t('reviews.ratingRequired')
      })
      return
    }

    if (!reviewData.title.trim() || !reviewData.content.trim()) {
      addNotification({
        type: 'error',
        message: t('reviews.titleAndContentRequired')
      })
      return
    }

    try {
      const newReview: CityReview = {
        id: `review_${Date.now()}`,
        cityId,
        userId: user.profile?.id || 'anonymous',
        userName: user.profile?.name || 'Anonymous',
        userAvatar: user.profile?.avatar,
        rating: selectedRating,
        title: reviewData.title.trim(),
        content: reviewData.content.trim(),
        pros: reviewData.pros.filter(p => p.trim()),
        cons: reviewData.cons.filter(c => c.trim()),
        visitDate: reviewData.visitDate,
        stayDuration: reviewData.stayDuration,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        helpfulCount: 0,
        notHelpfulCount: 0,
        isVerified: false
      }

      // 保存到localStorage
      const updatedReviews = [newReview, ...reviews]
      // TODO: Replace localStorage with database API for city_reviews_${cityId})
      
      setReviews(updatedReviews)
      setShowReviewForm(false)
      resetForm()
      
      addNotification({
        type: 'success',
        message: t('reviews.submitSuccess')
      })

      // 发布实时更新
      realtimeService.publish({
        type: 'review',
        action: 'create',
        data: {
          id: newReview.id,
          cityId: newReview.cityId,
          cityName: cityName,
          userName: newReview.userName,
          rating: newReview.rating,
          title: newReview.title
        },
        userId: newReview.userId
      })

      onReviewSubmitted?.(newReview)
    } catch (error) {
      console.error('Error submitting review:', error)
      addNotification({
        type: 'error',
        message: t('reviews.submitError')
      })
    }
  }

  const resetForm = () => {
    setSelectedRating(0)
    setReviewData({
      title: '',
      content: '',
      pros: [''],
      cons: [''],
      visitDate: '',
      stayDuration: ''
    })
  }

  const handleHelpful = (reviewId: string, isHelpful: boolean) => {
    const updatedReviews = reviews.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          helpfulCount: isHelpful ? review.helpfulCount + 1 : review.helpfulCount,
          notHelpfulCount: !isHelpful ? review.notHelpfulCount + 1 : review.notHelpfulCount
        }
      }
      return review
    })
    
    setReviews(updatedReviews)
    // TODO: Replace localStorage with database API for city_reviews_${cityId})
  }

  const addField = (type: 'pros' | 'cons') => {
    setReviewData(prev => ({
      ...prev,
      [type]: [...prev[type], '']
    }))
  }

  const removeField = (type: 'pros' | 'cons', index: number) => {
    setReviewData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }))
  }

  const updateField = (type: 'pros' | 'cons', index: number, value: string) => {
    setReviewData(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => i === index ? value : item)
    }))
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <MessageSquareIcon className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {t('reviews.title')} - {cityName}
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span>{averageRating.toFixed(1)} ({reviews.length} {t('reviews.reviews')})</span>
            </div>
          </div>
        </div>
        
        {user.isAuthenticated && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="btn btn-primary"
          >
            {t('reviews.writeReview')}
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('reviews.writeReviewFor')} {cityName}
          </h3>
          
          {/* Rating */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('reviews.rating')} *
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setSelectedRating(rating)}
                  onMouseEnter={() => setHoveredRating(rating)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1"
                >
                  <StarIcon
                    className={`h-6 w-6 ${
                      rating <= (hoveredRating || selectedRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('reviews.title')} *
            </label>
            <input
              type="text"
              value={reviewData.title}
              onChange={(e) => setReviewData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('reviews.titlePlaceholder')}
              maxLength={100}
            />
          </div>

          {/* Content */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('reviews.content')} *
            </label>
            <textarea
              value={reviewData.content}
              onChange={(e) => setReviewData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder={t('reviews.contentPlaceholder')}
              maxLength={1000}
            />
          </div>

          {/* Pros */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('reviews.pros')}
            </label>
            {reviewData.pros.map((pro, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={pro}
                  onChange={(e) => updateField('pros', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('reviews.proPlaceholder')}
                />
                {reviewData.pros.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeField('pros', index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addField('pros')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + {t('reviews.addPro')}
            </button>
          </div>

          {/* Cons */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('reviews.cons')}
            </label>
            {reviewData.cons.map((con, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={con}
                  onChange={(e) => updateField('cons', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('reviews.conPlaceholder')}
                />
                {reviewData.cons.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeField('cons', index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addField('cons')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + {t('reviews.addCon')}
            </button>
          </div>

          {/* Visit Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('reviews.visitDate')}
              </label>
              <input
                type="date"
                value={reviewData.visitDate}
                onChange={(e) => setReviewData(prev => ({ ...prev, visitDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('reviews.stayDuration')}
              </label>
              <input
                type="text"
                value={reviewData.stayDuration}
                onChange={(e) => setReviewData(prev => ({ ...prev, stayDuration: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('reviews.stayDurationPlaceholder')}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowReviewForm(false)
                resetForm()
              }}
              className="btn btn-outline"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={handleSubmitReview}
              className="btn btn-primary"
            >
              {t('reviews.submitReview')}
            </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-3">💬</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('reviews.noReviews')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('reviews.beFirstToReview')} {cityName}!
          </p>
          {user.isAuthenticated && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="btn btn-primary"
            >
              {t('reviews.writeFirstReview')}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-4">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {review.userAvatar ? (
                      <img
                        src={review.userAvatar}
                        alt={review.userName}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <UserIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{review.userName}</span>
                      {review.isVerified && (
                        <span className="text-blue-600 text-sm">✓ {t('reviews.verified')}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <CalendarIcon className="h-3 w-3" />
                      <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      {review.visitDate && (
                        <>
                          <span>•</span>
                          <span>{t('reviews.visited')}: {review.visitDate}</span>
                        </>
                      )}
                      {review.stayDuration && (
                        <>
                          <span>•</span>
                          <span>{t('reviews.stayed')}: {review.stayDuration}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Review Content */}
              <div className="mb-3">
                <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{review.content}</p>
              </div>

              {/* Pros and Cons */}
              {(review.pros.length > 0 || review.cons.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  {review.pros.length > 0 && (
                    <div>
                      <h5 className="font-medium text-green-700 mb-2">{t('reviews.pros')}:</h5>
                      <ul className="space-y-1">
                        {review.pros.map((pro, index) => (
                          <li key={index} className="text-sm text-green-600 flex items-center">
                            <span className="mr-2">✓</span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {review.cons.length > 0 && (
                    <div>
                      <h5 className="font-medium text-red-700 mb-2">{t('reviews.cons')}:</h5>
                      <ul className="space-y-1">
                        {review.cons.map((con, index) => (
                          <li key={index} className="text-sm text-red-600 flex items-center">
                            <span className="mr-2">✗</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Review Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleHelpful(review.id, true)}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-green-600"
                  >
                    <ThumbsUpIcon className="h-4 w-4" />
                    <span>{review.helpfulCount}</span>
                  </button>
                  <button
                    onClick={() => handleHelpful(review.id, false)}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600"
                  >
                    <ThumbsDownIcon className="h-4 w-4" />
                    <span>{review.notHelpfulCount}</span>
                  </button>
                </div>
                <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800">
                  <FlagIcon className="h-3 w-3" />
                  <span>{t('reviews.report')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
