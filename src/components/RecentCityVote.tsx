'use client'

import { useState, useEffect } from 'react'
import { StarIcon, ClockIcon, MapPinIcon, ThumbsUpIcon, ThumbsDownIcon } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useUser } from '@/contexts/GlobalStateContext'
import { useNotifications } from '@/contexts/GlobalStateContext'
import { getRecentCityForVoting, RecentCity } from '@/lib/recentCities'
import { submitVote } from '@/lib/api'
import { logInfo } from '@/lib/logger'

interface RecentCityVoteProps {
  onVoteSubmitted?: () => void
}

export default function RecentCityVote({ onVoteSubmitted }: RecentCityVoteProps) {
  const { t } = useTranslation()
  const { user } = useUser()
  const { addNotification } = useNotifications()
  
  const [recentCity, setRecentCity] = useState<RecentCity | null>(null)
  const [loading, setLoading] = useState(false)
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null)

  useEffect(() => {
    const city = getRecentCityForVoting()
    setRecentCity(city)
  }, [])

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user) {
      addNotification({
        type: 'warning',
        message: t('loginRequired.voteMessage')
      })
      return
    }

    if (!recentCity) {
      addNotification({
        type: 'error',
        message: '没有找到最近访问的城市'
      })
      return
    }

    try {
      setLoading(true)
      
      const success = await submitVote({
        city_id: recentCity.id,
        user_id: user.profile?.id || 'anonymous',
        overall_rating: voteType === 'upvote' ? 5 : 1,
        wifi_rating: voteType === 'upvote' ? 5 : 1,
        social_rating: voteType === 'upvote' ? 5 : 1,
        value_rating: voteType === 'upvote' ? 5 : 1,
        climate_rating: voteType === 'upvote' ? 5 : 1,
        comment: voteType === 'upvote' ? 'Quick upvote for recent visit' : 'Quick downvote for recent visit'
      })

      if (success) {
        setUserVote(voteType)
        addNotification({
          type: 'success',
          message: t('voteSystem.voteSubmitted')
        })
        
        logInfo(`Recent city vote: ${voteType} for ${recentCity.name}`, null, 'RecentCityVote')
        
        if (onVoteSubmitted) {
          onVoteSubmitted()
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
      setLoading(false)
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return '刚刚'
    if (diffInHours < 24) return `${diffInHours}小时前`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}天前`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks}周前`
  }

  if (!recentCity) {
    return null
  }

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <ClockIcon className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">
            {t('home.quickVote.recentCity')}
          </h3>
        </div>
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <MapPinIcon className="h-4 w-4" />
          <span>{formatTimeAgo(recentCity.visitedAt)}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getCountryFlag(recentCity.country_code)}</span>
          <div>
            <div className="font-semibold text-gray-900">{recentCity.name}</div>
            <div className="text-sm text-gray-600">{recentCity.country}</div>
            <div className="text-xs text-gray-500">
              访问 {recentCity.visitCount} 次
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* 投票按钮 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleVote('upvote')}
              disabled={loading || userVote === 'upvote'}
              className={`p-2 rounded-lg transition-colors ${
                userVote === 'upvote'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600'
              }`}
            >
              <ThumbsUpIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => handleVote('downvote')}
              disabled={loading || userVote === 'downvote'}
              className={`p-2 rounded-lg transition-colors ${
                userVote === 'downvote'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
              }`}
            >
              <ThumbsDownIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mt-2">
        {userVote 
          ? `您已为 ${recentCity.name} 投票` 
          : t('home.quickVote.ratingHint')
        }
      </p>
    </div>
  )
}

// 获取国家国旗emoji
function getCountryFlag(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}
