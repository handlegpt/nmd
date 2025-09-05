'use client'

import { useState, useEffect } from 'react'
import { ThumbsUpIcon, ThumbsDownIcon, StarIcon, XIcon, WifiIcon, UsersIcon, DollarSignIcon, CloudIcon } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useUser, useNotifications } from '@/contexts/GlobalStateContext'
import LoginRequired from './LoginRequired'
import { submitVote } from '@/lib/api'
import { logInfo } from '@/lib/logger'

// 投票类型
export type VoteType = 'city' | 'place'

// 投票项目接口
export interface VoteItem {
  id: string
  name: string
  type: VoteType
  currentVotes?: {
    upvotes: number
    downvotes: number
    rating?: number
  }
}

// 投票组件属性
interface UnifiedVoteSystemProps {
  item: VoteItem
  variant?: 'quick' | 'detailed' | 'modal'
  showRating?: boolean
  showComment?: boolean
  onVoteSubmitted?: (voteData: any) => void
  className?: string
}

// 评分类别
const ratingCategories = [
  {
    id: 'overall',
    labelKey: 'voteModal.overallRating',
    icon: StarIcon,
    descriptionKey: 'voteModal.overallDescription'
  },
  {
    id: 'wifi',
    labelKey: 'voteModal.wifiQuality',
    icon: WifiIcon,
    descriptionKey: 'voteModal.wifiDescription'
  },
  {
    id: 'social',
    labelKey: 'voteModal.socialAtmosphere',
    icon: UsersIcon,
    descriptionKey: 'voteModal.socialDescription'
  },
  {
    id: 'value',
    labelKey: 'voteModal.valueForMoney',
    icon: DollarSignIcon,
    descriptionKey: 'voteModal.valueDescription'
  },
  {
    id: 'climate',
    labelKey: 'voteModal.climateComfort',
    icon: CloudIcon,
    descriptionKey: 'voteModal.climateDescription'
  }
]

export default function UnifiedVoteSystem({
  item,
  variant = 'quick',
  showRating = false,
  showComment = false,
  onVoteSubmitted,
  className = ''
}: UnifiedVoteSystemProps) {
  const { t } = useTranslation()
  const { user } = useUser()
  const { addNotification } = useNotifications()
  
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [ratings, setRatings] = useState({
    overall: 0,
    wifi: 0,
    social: 0,
    value: 0,
    climate: 0
  })
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 处理快速投票
  const handleQuickVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user.isAuthenticated) {
      addNotification({
        type: 'warning',
        message: t('loginRequired.voteMessage')
      })
      return
    }

    try {
      setSubmitting(true)
      
      let success = false
      
      if (item.type === 'city') {
        const userId = user.profile?.id
        if (!userId) {
          addNotification({
            type: 'error',
            message: t('loginRequired.voteMessage')
          })
          return
        }
        
        success = await submitVote({
          city_id: item.id,
          user_id: userId,
          overall_rating: voteType === 'upvote' ? 5 : 1, // 简单映射
          wifi_rating: voteType === 'upvote' ? 5 : 1,
          social_rating: voteType === 'upvote' ? 5 : 1,
          value_rating: voteType === 'upvote' ? 5 : 1,
          climate_rating: voteType === 'upvote' ? 5 : 1,
          comment: voteType === 'upvote' ? 'Quick upvote' : 'Quick downvote'
        })
      } else {
        // 地点投票暂时使用模拟成功
        logInfo(`Place vote: ${voteType} for ${item.name}`, null, 'UnifiedVoteSystem')
        success = true
      }

      if (success) {
        setUserVote(voteType)
        addNotification({
          type: 'success',
          message: t('voteSystem.voteSubmitted')
        })
        
        if (onVoteSubmitted) {
          onVoteSubmitted({ voteType, item })
        }
      } else {
        addNotification({
          type: 'error',
          message: t('voteSystem.voteFailed')
        })
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: t('voteSystem.voteFailed')
      })
    } finally {
      setSubmitting(false)
    }
  }

  // 处理详细投票
  const handleDetailedVote = () => {
    if (!user.isAuthenticated) {
      addNotification({
        type: 'warning',
        message: t('loginRequired.voteMessage')
      })
      return
    }
    setShowModal(true)
  }

  // 处理评分变化
  const handleRatingChange = (category: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [category]: rating
    }))
  }

  // 提交详细投票
  const handleSubmitDetailedVote = async () => {
    if (!user.isAuthenticated || ratings.overall === 0) {
      addNotification({
        type: 'warning',
        message: t('voteModal.pleaseProvideRating')
      })
      return
    }

    try {
      setSubmitting(true)
      
      // 目前只支持城市详细投票
      let success = false
      
      if (item.type === 'city') {
        const userId = user.profile?.id
        if (!userId) {
          addNotification({
            type: 'error',
            message: t('loginRequired.voteMessage')
          })
          return
        }
        
        success = await submitVote({
          city_id: item.id,
          user_id: userId,
          overall_rating: ratings.overall,
          wifi_rating: ratings.wifi || ratings.overall,
          social_rating: ratings.social || ratings.overall,
          value_rating: ratings.value || ratings.overall,
          climate_rating: ratings.climate || ratings.overall,
          comment: comment.trim() || ''
        })
      } else {
        // 地点详细投票暂时使用模拟成功
        logInfo(`Place detailed vote for ${item.name}`, { ratings, comment }, 'UnifiedVoteSystem')
        success = true
      }

      if (success) {
        addNotification({
          type: 'success',
          message: t('voteSystem.detailedVoteSubmitted')
        })
        
        if (onVoteSubmitted) {
          onVoteSubmitted({ ratings, comment, item })
        }
        
        setShowModal(false)
        setRatings({ overall: 0, wifi: 0, social: 0, value: 0, climate: 0 })
        setComment('')
      } else {
        addNotification({
          type: 'error',
          message: t('voteSystem.voteFailed')
        })
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: t('voteSystem.voteFailed')
      })
    } finally {
      setSubmitting(false)
    }
  }

  // 获取评分描述
  const getRatingDescription = (rating: number) => {
    if (rating === 0) return t('voteModal.clickToRate')
    if (rating <= 2) return t('voteModal.notRecommended')
    if (rating <= 3) return t('voteModal.average')
    if (rating <= 4) return t('voteModal.recommended')
    return t('voteModal.highlyRecommended')
  }

  // 快速投票组件
  const QuickVoteButtons = () => (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => handleQuickVote('upvote')}
        disabled={submitting}
        className={`p-1 rounded transition-colors ${
          userVote === 'upvote'
            ? 'text-green-600 bg-green-100'
            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
        } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={t('voteSystem.upvote')}
      >
        <ThumbsUpIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleQuickVote('downvote')}
        disabled={submitting}
        className={`p-1 rounded transition-colors ${
          userVote === 'downvote'
            ? 'text-red-600 bg-red-100'
            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
        } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={t('voteSystem.downvote')}
      >
        <ThumbsDownIcon className="h-4 w-4" />
      </button>
    </div>
  )

  // 详细投票按钮
  const DetailedVoteButton = () => (
    <button
      onClick={handleDetailedVote}
      disabled={submitting}
      className={`px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors ${
        submitting ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {t('voteSystem.detailedVote')}
    </button>
  )

  // 投票模态框
  const VoteModal = () => {
    if (!showModal) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {t('voteModal.title', { name: item.name })}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Login Required Check */}
            {!user.isAuthenticated && (
              <LoginRequired 
                message={t('loginRequired.voteMessage')}
                className="mb-6"
              />
            )}

            {/* Rating Categories */}
            <div className="space-y-6">
              {ratingCategories.map((category) => {
                const Icon = category.icon
                return (
                  <div key={category.id} className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-blue-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {t(category.labelKey)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {t(category.descriptionKey)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRatingChange(category.id, star)}
                          disabled={!user.isAuthenticated}
                          className={`p-1 rounded transition-colors ${
                            ratings[category.id as keyof typeof ratings] >= star
                              ? 'text-yellow-400'
                              : 'text-gray-300 hover:text-yellow-400'
                          } ${!user.isAuthenticated ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                          <StarIcon className="h-6 w-6 fill-current" />
                        </button>
                      ))}
                    </div>
                    
                    <p className="text-sm text-gray-600">
                      {getRatingDescription(ratings[category.id as keyof typeof ratings])}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Comment Section */}
            {showComment && (
              <div className="mt-6 space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  {t('voteModal.shareExperience')}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={!user.isAuthenticated}
                  placeholder={t('voteModal.experiencePlaceholder')}
                  className={`w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !user.isAuthenticated ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                  rows={4}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                {t('voteModal.cancel')}
              </button>
              <button
                onClick={handleSubmitDetailedVote}
                disabled={!user.isAuthenticated || submitting}
                className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                  !user.isAuthenticated || submitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? t('voteModal.submitting') : t('voteModal.submitVote')}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 根据变体渲染不同的投票界面
  if (variant === 'quick') {
    return (
      <div className={className}>
        <QuickVoteButtons />
        {showRating && <DetailedVoteButton />}
        <VoteModal />
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={className}>
        <div className="flex items-center space-x-4">
          <QuickVoteButtons />
          <DetailedVoteButton />
        </div>
        <VoteModal />
      </div>
    )
  }

  if (variant === 'modal') {
    return <VoteModal />
  }

  return null
}
