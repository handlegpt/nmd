'use client'

import { useState, useEffect } from 'react'
import { StarIcon, ThumbsUpIcon, ThumbsDownIcon, MapPinIcon } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useNotifications, useUser } from '@/contexts/GlobalStateContext'
import { logInfo } from '@/lib/logger'
import VoteModal from './VoteModal'
import { City } from '@/lib/supabase'
import { getCities } from '@/lib/api'

export default function CityRanking({ limit = 10 }: { limit?: number }) {
  const { t } = useTranslation()
  const { user } = useUser()
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [showVoteModal, setShowVoteModal] = useState(false)
  const [selectedCity, setSelectedCity] = useState<City | null>(null)

  // 统一使用Supabase中的真实城市数据
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true)
        const allCities = await getCities()
        // 按评分排序并限制数量
        const sortedCities = allCities
          .sort((a, b) => (b.avg_overall_rating || 0) - (a.avg_overall_rating || 0))
          .slice(0, limit)
        setCities(sortedCities)
      } catch (error) {
        console.error('Error fetching cities:', error)
        setCities([])
      } finally {
        setLoading(false)
      }
    }

    fetchCities()
  }, [limit])

  const getCountryFlag = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }

  const handleQuickVote = async (cityId: string, voteType: 'upvote' | 'downvote') => {
    logInfo(`Quick vote: ${voteType} for city ${cityId}`, null, 'CityRanking')
    
    // 这里可以调用投票API
    // 暂时只是记录日志
  }

  const handleDetailedVote = (city: City) => {
    setSelectedCity(city)
    setShowVoteModal(true)
  }

  const handleVoteSubmitted = () => {
    logInfo('Vote submitted', null, 'CityRanking')
    // 这里可以更新城市数据或触发重新加载
    setShowVoteModal(false)
    setSelectedCity(null)
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">{t('cities.loading')}</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {cities.slice(0, limit).map((city, index) => (
          <div
            key={city.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            {/* Rank and City Info */}
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getCountryFlag(city.country_code)}</span>
                <div>
                  <div className="font-semibold text-gray-900">{city.name}</div>
                  <div className="text-sm text-gray-600">{city.country}</div>
                </div>
              </div>
            </div>

            {/* Rating and Votes */}
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="flex items-center space-x-1">
                  <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="font-bold text-gray-900">{city.avg_overall_rating}</span>
                </div>
                <div className="text-xs text-gray-500">({city.vote_count} {t('cities.votes')})</div>
              </div>

              {/* Quick Vote Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleQuickVote(city.id, 'upvote')}
                  className="p-1 text-green-600 hover:text-green-700 hover:bg-green-100 rounded"
                  title={t('cities.quickUpvote')}
                >
                  <ThumbsUpIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleQuickVote(city.id, 'downvote')}
                  className="p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded"
                  title={t('cities.quickDownvote')}
                >
                  <ThumbsDownIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Detailed Vote Button */}
              <button
                onClick={() => handleDetailedVote(city)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('cities.voteDetails')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Vote Modal */}
      {showVoteModal && selectedCity && (
        <VoteModal
          isOpen={showVoteModal}
          onClose={() => setShowVoteModal(false)}
          onVoteSubmitted={handleVoteSubmitted}
          city={selectedCity}
        />
      )}
    </>
  )
}
