'use client'

import { useState, useEffect } from 'react'
import { 
  StarIcon, 
  ThumbsUpIcon, 
  ThumbsDownIcon, 
  MapPinIcon,
  FilterIcon,
  TrendingUpIcon,
  DollarSignIcon,
  WifiIcon,
  CalendarIcon,
  EyeIcon,
  HeartIcon,
  Share2Icon,
  RefreshCwIcon,
  ArrowRight
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useNotifications } from '@/contexts/GlobalStateContext'
import { useUser } from '@/contexts/GlobalStateContext'
import { logInfo, logError } from '@/lib/logger'
import { City } from '@/lib/supabase'
import { getCities } from '@/lib/api'
import UnifiedVoteSystem, { VoteItem } from './UnifiedVoteSystem'
import FixedLink from './FixedLink'
import RecentCityVote from './RecentCityVote'
import VoteModal from './VoteModal'

interface EnhancedCityRankingProps {
  limit?: number
  showQuickVote?: boolean
  showCurrentCityVote?: boolean
  showFilters?: boolean
  showPersonalized?: boolean
}

type SortOption = 'rating' | 'votes' | 'cost' | 'wifi' | 'visa'
type FilterOption = 'all' | 'digital-nomad' | 'visa-free' | 'low-cost' | 'high-wifi'

export default function EnhancedCityRanking({ 
  limit = 10, 
  showQuickVote = true,
  showCurrentCityVote = true,
  showFilters = true,
  showPersonalized = true
}: EnhancedCityRankingProps) {
  const { t } = useTranslation()
  
  // Safely get user context - handle case where UserProvider is not available during static generation
  let user = null
  try {
    const userContext = useUser()
    user = userContext?.user || null
  } catch (error) {
    // UserProvider not available during static generation
    user = null
  }
  
  const [cities, setCities] = useState<City[]>([])
  const [filteredCities, setFilteredCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentCity, setCurrentCity] = useState<string>('Osaka')
  const [sortBy, setSortBy] = useState<SortOption>('rating')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const [personalizedCities, setPersonalizedCities] = useState<City[]>([])
  const { addNotification } = useNotifications()
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [ratingModalOpen, setRatingModalOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState<City | null>(null)

  // 获取真实城市数据
  useEffect(() => {
    fetchCities()
    loadFavorites()
  }, [])

  // 加载收藏状态
  const loadFavorites = () => {
    try {
      const savedFavorites = null // TODO: Replace localStorage with database API for cityFavorites
      if (savedFavorites) {
        const favoriteIds = JSON.parse(savedFavorites)
        setFavorites(new Set(favoriteIds))
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
  }

  // 当城市数据或筛选条件变化时，重新筛选和排序
  useEffect(() => {
    filterAndSortCities()
  }, [cities, sortBy, filterBy])

  // 生成个性化推荐
  useEffect(() => {
    if (user?.isAuthenticated && cities.length > 0) {
      generatePersonalizedRecommendations()
    }
  }, [cities, user?.isAuthenticated])

  const fetchCities = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCities()
      setCities(data)
    } catch (error) {
      logError('Error fetching cities', error, 'EnhancedCityRanking')
      setError('Failed to load cities')
      addNotification({
        type: 'error',
        message: 'Failed to load cities'
      })
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortCities = () => {
    let filtered = [...cities]

    // 应用筛选
    switch (filterBy) {
      case 'digital-nomad':
        filtered = filtered.filter(city => 
          city.visa_type?.toLowerCase().includes('digital nomad')
        )
        break
      case 'visa-free':
        filtered = filtered.filter(city => 
          city.visa_days >= 90 || city.visa_type?.toLowerCase().includes('visa free')
        )
        break
      case 'low-cost':
        filtered = filtered.filter(city => 
          (city.cost_of_living || 0) < 1500
        )
        break
      case 'high-wifi':
        filtered = filtered.filter(city => 
          (city.wifi_speed || 0) > 50
        )
        break
    }

    // 应用排序
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.avg_overall_rating || 0) - (a.avg_overall_rating || 0))
        break
      case 'votes':
        filtered.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
        break
      case 'cost':
        filtered.sort((a, b) => (a.cost_of_living || 0) - (b.cost_of_living || 0))
        break
      case 'wifi':
        filtered.sort((a, b) => (b.wifi_speed || 0) - (a.wifi_speed || 0))
        break
      case 'visa':
        filtered.sort((a, b) => (b.visa_days || 0) - (a.visa_days || 0))
        break
    }

    setFilteredCities(filtered)
  }

  const generatePersonalizedRecommendations = () => {
    // 基于用户偏好生成推荐
    const userPreferences = user?.profile?.preferences || {}
    let scoredCities = cities.map(city => {
      let score = 0
      
      // WiFi偏好
      if (userPreferences.wifi && city.wifi_speed) {
        score += (city.wifi_speed / 100) * userPreferences.wifi
      }
      
      // 成本偏好
      if (userPreferences.cost && city.cost_of_living) {
        const costScore = Math.max(0, 1 - (city.cost_of_living - 1000) / 2000)
        score += costScore * userPreferences.cost
      }
      
      // 签证偏好
      if (userPreferences.visa && city.visa_days) {
        const visaScore = Math.min(1, city.visa_days / 365)
        score += visaScore * userPreferences.visa
      }
      
      return { ...city, personalizedScore: score }
    })

    scoredCities.sort((a, b) => b.personalizedScore - a.personalizedScore)
    setPersonalizedCities(scoredCities.slice(0, 3))
  }

  const getCountryFlag = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }

  const getVisaColor = (days: number) => {
    if (days >= 365) return 'text-green-600'
    if (days >= 90) return 'text-blue-600'
    if (days >= 30) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCostColor = (cost: number) => {
    if (cost < 1000) return 'text-green-600'
    if (cost < 2000) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getWifiColor = (speed: number) => {
    if (speed >= 100) return 'text-green-600'
    if (speed >= 50) return 'text-blue-600'
    if (speed >= 25) return 'text-yellow-600'
    return 'text-red-600'
  }

  // 处理Rate City按钮点击
  const handleRateCity = (city: City) => {
    if (!user) {
      addNotification({
        type: 'info',
        message: t('cities.loginToRate'),
        duration: 3000
      })
      return
    }
    
    setSelectedCity(city)
    setRatingModalOpen(true)
  }

  // 处理收藏按钮点击
  const handleToggleFavorite = (cityId: string) => {
    if (!user) {
      addNotification({
        type: 'info',
        message: t('cities.loginToFavorite'),
        duration: 3000
      })
      return
    }

    const newFavorites = new Set(favorites)
    if (newFavorites.has(cityId)) {
      newFavorites.delete(cityId)
      addNotification({
        type: 'success',
        message: t('cities.removedFromFavorites'),
        duration: 2000
      })
    } else {
      newFavorites.add(cityId)
      addNotification({
        type: 'success',
        message: t('cities.addedToFavorites'),
        duration: 2000
      })
    }
    
    // 保存到localStorage
    try {
      // TODO: Replace localStorage with database API for cityFavorites)
    } catch (error) {
      console.error('Error saving favorites:', error)
    }
    
    setFavorites(newFavorites)
  }

  const handleVoteSubmitted = () => {
    logInfo('Vote submitted', 'EnhancedCityRanking')
    addNotification({
      type: 'success',
      message: t('voteSystem.voteSubmitted')
    })
    // 重新获取数据以更新投票
    fetchCities()
  }

  const handleRefresh = () => {
    fetchCities()
    addNotification({
      type: 'success',
      message: 'Cities data refreshed'
    })
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-gray-100 rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={handleRefresh}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
        >
          <RefreshCwIcon className="h-4 w-4" />
          <span>Retry</span>
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Professional Header with Enhanced Filters and Sort */}
      {showFilters && (
        <div className="mb-8">
          {/* Main Header Row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors border border-blue-200"
              >
                <FilterIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{t('cities.filters')}</span>
              </button>
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors hover:bg-gray-100 rounded-lg"
                title="Refresh data"
              >
                <RefreshCwIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="text-sm text-gray-600 font-medium">
              {filteredCities.length} {t('cities.citiesFound')}
            </div>
          </div>

          {/* Enhanced Filters Panel - Professional Tool Style */}
          {showFiltersPanel && (
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 mb-6 border border-gray-200 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sort Options - Enhanced */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('cities.sortBy')}</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="rating">{t('cities.sortByRating')}</option>
                    <option value="cost">{t('cities.sortByCost')}</option>
                    <option value="wifi">{t('cities.sortByWifi')}</option>
                    <option value="visa">{t('cities.sortByVisa')}</option>
                  </select>
                </div>

                {/* Region Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('cities.filterByRegion')}</label>
                  <select
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option>{t('cities.allRegions')}</option>
                    <option>{t('cities.asia')}</option>
                    <option>{t('cities.europe')}</option>
                    <option>{t('cities.americas')}</option>
                  </select>
                </div>

                {/* Cost Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('cities.filterByCost')}</label>
                  <select
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option>{t('cities.allRegions')}</option>
                    <option>{t('cities.lowCost')}</option>
                    <option>{t('cities.mediumCost')}</option>
                    <option>{t('cities.highCost')}</option>
                  </select>
                </div>

                {/* WiFi Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('cities.filterByWifi')}</label>
                  <select
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option>{t('cities.allRegions')}</option>
                    <option>{t('cities.lowWifi')}</option>
                    <option>{t('cities.mediumWifi')}</option>
                    <option>{t('cities.highWifi')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Personalized Recommendations */}
      {showPersonalized && user?.isAuthenticated && personalizedCities.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUpIcon className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Personalized for You</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {personalizedCities.map((city, index) => (
              <div key={city.id} className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">{getCountryFlag(city.country_code)}</span>
                  <div>
                    <div className="font-medium text-gray-900">{city.name}</div>
                    <div className="text-xs text-gray-600">{city.country}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  <div className="flex items-center space-x-1">
                    <DollarSignIcon className="h-3 w-3" />
                    <span>${city.cost_of_living}/month</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <WifiIcon className="h-3 w-3" />
                    <span>{city.wifi_speed} Mbps</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent City Vote Section */}
      {showCurrentCityVote && (
        <RecentCityVote onVoteSubmitted={handleVoteSubmitted} />
      )}

      {/* Professional City Cards Grid - Professional Tool Experience */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCities.slice(0, limit).map((city, index) => {
          const voteItem: VoteItem = {
            id: city.id,
            name: city.name,
            type: 'city',
            currentVotes: {
              upvotes: Math.floor((city.vote_count || 0) * 0.7),
              downvotes: Math.floor((city.vote_count || 0) * 0.3),
              rating: city.avg_overall_rating
            }
          }

          return (
            <div
              key={city.id}
              className="group bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] shadow-sm"
            >
              {/* City Header with Rank and Flag */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getCountryFlag(city.country_code)}</span>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{city.name}</h4>
                        <p className="text-sm text-gray-600">{city.country}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Rating Display - Prominent */}
                  <div className="text-center">
                    <div className="flex items-center space-x-1">
                      <StarIcon className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="font-bold text-gray-900 text-lg">
                        {city.avg_overall_rating?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      ({city.vote_count || 0} {t('cities.votes')})
                    </div>
                  </div>
                </div>
              </div>

              {/* Core Metrics - Visual Icons and Colors */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  {/* Cost */}
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-500 text-lg">💰</span>
                    <div>
                      <div className="text-xs text-gray-500">{t('cities.costOfLiving')}</div>
                      <div className={`font-semibold text-sm ${getCostColor(city.cost_of_living || 0)}`}>
                        ${city.cost_of_living}/mo
                      </div>
                    </div>
                  </div>
                  
                  {/* WiFi */}
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-500 text-lg">💻</span>
                    <div>
                      <div className="text-xs text-gray-500">{t('cities.wifiSpeed')}</div>
                      <div className={`font-semibold text-sm ${getWifiColor(city.wifi_speed || 0)}`}>
                        {city.wifi_speed} Mbps
                      </div>
                    </div>
                  </div>
                  
                  {/* Visa */}
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-500 text-lg">🛂</span>
                    <div>
                      <div className="text-xs text-gray-500">{t('cities.visaType')}</div>
                      <div className={`font-semibold text-sm ${getVisaColor(city.visa_days || 0)}`}>
                        {city.visa_days} {t('cities.days')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Fixed at Bottom */}
              <div className="p-4 pt-0 flex-shrink-0">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleRateCity(city)}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <StarIcon className="h-3 w-3" />
                    <span>{t('cities.rateCity')}</span>
                  </button>
                  <button 
                    onClick={() => handleToggleFavorite(city.id)}
                    title={favorites.has(city.id) ? t('cities.removeFromFavorites') : t('cities.addToFavorites')}
                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                      favorites.has(city.id) 
                        ? 'bg-red-100 hover:bg-red-200 text-red-700' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {favorites.has(city.id) ? '❤️' : '🤍'}
                  </button>
                </div>
                
                {/* Secondary Actions */}
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <FixedLink
                    href={`/nomadcities/${city.country.toLowerCase().replace(/\s+/g, '-')}/${city.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {t('cities.viewDetails')}
                  </FixedLink>
                  <button className="text-gray-500 hover:text-gray-700">
                    <Share2Icon className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Load More Button */}
      {filteredCities.length > limit && (
        <div className="text-center mt-6">
          <FixedLink
            href="/nomadcities"
            className="btn btn-md btn-outline"
          >
            {t('cities.viewAllCities')}
            <ArrowRight className="h-4 w-4 ml-2" />
          </FixedLink>
        </div>
      )}

      {/* Rating Modal */}
      {ratingModalOpen && selectedCity && (
        <VoteModal
          city={selectedCity}
          isOpen={ratingModalOpen}
          onClose={() => setRatingModalOpen(false)}
          onVoteSubmitted={handleVoteSubmitted}
        />
      )}
    </>
  )
}
