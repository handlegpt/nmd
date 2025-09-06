'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { getCities, getCityById } from '@/lib/api'
import { City } from '@/lib/supabase'
import { addRecentCity } from '@/lib/recentCities'
import { RealtimeService } from '@/lib/realtimeService'
import VoteModal from '@/components/VoteModal'
import { 
  Star, 
  Wifi, 
  DollarSign, 
  MapPin, 
  Users, 
  Coffee,
  Calendar,
  Heart,
  Share2,
  Eye,
  Flag,
  TrendingUp,
  Clock,
  Globe,
  Zap,
  Shield,
  Plane,
  Building,
  Utensils,
  Camera,
  MessageCircle
} from 'lucide-react'

export default function CityDetailPage() {
  const { t } = useTranslation()
  const params = useParams()
  const { country, city } = params
  
  const [cityData, setCityData] = useState<City | null>(null)
  const [loading, setLoading] = useState(true)
  const [showVoteModal, setShowVoteModal] = useState(false)

  useEffect(() => {
    fetchCityData()
  }, [country, city])

  const setupRealtimeSubscription = () => {
    if (cityData?.id) {
      // 设置实时订阅逻辑
      const realtimeService = new RealtimeService()
      realtimeService.subscribeToCityReviews(cityData.id, (payload) => {
        console.log('City review updated:', payload)
        // 可以在这里更新UI
      })
    }
  }

  const fetchCityData = async () => {
    try {
      setLoading(true)
      
      // 首先尝试通过country/city slug查找城市
      const allCities = await getCities()
      const cityBySlug = allCities.find(c => {
        const citySlug = c.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
        const countrySlug = c.country.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
        return citySlug === city?.toString().toLowerCase() && countrySlug === country?.toString().toLowerCase()
      })
      
      if (cityBySlug) {
        setCityData(cityBySlug)
        // 添加到最近访问城市
        addRecentCity({
          id: cityBySlug.id,
          name: cityBySlug.name,
          country: cityBySlug.country,
          country_code: cityBySlug.country_code
        })
        setupRealtimeSubscription()
        return
      }
      
      // 如果通过slug没找到，尝试通过ID查找（向后兼容）
      const cityById = await getCityById(city?.toString() || '')
      if (cityById) {
        setCityData(cityById)
        // 添加到最近访问城市
        addRecentCity({
          id: cityById.id,
          name: cityById.name,
          country: cityById.country,
          country_code: cityById.country_code
        })
        setupRealtimeSubscription()
      }
    } catch (error) {
      console.error('Error fetching city data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCountryFlag = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }

  const handleVoteSubmitted = () => {
    setShowVoteModal(false)
    fetchCityData() // 刷新数据
  }

  // 计算城市评分（模拟数据）
  const getCityScore = () => {
    if (!cityData) return '0.0'
    const baseScore = 4.2
    const wifiBonus = (cityData.wifi_speed || 0) > 50 ? 0.3 : 0
    const costBonus = (cityData.cost_of_living || 0) < 2000 ? 0.2 : 0
    const visaBonus = (cityData.visa_days || 0) > 90 ? 0.3 : 0
    return Math.min(5, baseScore + wifiBonus + costBonus + visaBonus).toFixed(1)
  }

  // 获取社区活跃度（模拟数据）
  const getCommunityActivity = () => {
    if (!cityData) return 'low'
    const score = cityData.avg_overall_rating || 0
    if (score >= 4.5) return 'high'
    if (score >= 3.5) return 'medium'
    return 'low'
  }

  // 获取生活成本等级
  const getCostLevel = (cost: number) => {
    if (cost < 1000) return { level: 'budget', color: 'text-green-600' }
    if (cost < 2000) return { level: 'affordable', color: 'text-blue-600' }
    if (cost < 3500) return { level: 'moderate', color: 'text-yellow-600' }
    if (cost < 5000) return { level: 'expensive', color: 'text-orange-600' }
    return { level: 'luxury', color: 'text-red-600' }
  }

  // 获取WiFi等级
  const getWifiLevel = (speed: number) => {
    if (speed >= 100) return { level: 'excellent', color: 'text-green-600' }
    if (speed >= 50) return { level: 'good', color: 'text-blue-600' }
    if (speed >= 25) return { level: 'fair', color: 'text-yellow-600' }
    return { level: 'poor', color: 'text-red-600' }
  }

  // 获取签证难度
  const getVisaDifficulty = (days: number) => {
    if (days >= 365) return { level: 'easy', color: 'text-green-600' }
    if (days >= 90) return { level: 'medium', color: 'text-yellow-600' }
    return { level: 'hard', color: 'text-red-600' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!cityData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('cityDetail.cityNotFound')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('cityDetail.cityNotFoundDescription')}
          </p>
          <a 
            href="/nomadcities" 
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {t('cityDetail.backToCities')}
          </a>
        </div>
      </div>
    )
  }

  const costLevel = getCostLevel(cityData.cost_of_living)
  const wifiLevel = getWifiLevel(cityData.wifi_speed)
  const visaDifficulty = getVisaDifficulty(cityData.visa_days)
  const communityActivity = getCommunityActivity()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center space-x-4 mb-4">
            <span className="text-4xl">{getCountryFlag(cityData.country_code)}</span>
            <div>
              <h1 className="text-4xl font-bold">{cityData.name}</h1>
              <p className="text-xl text-blue-100">{cityData.country}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-6 mt-8">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-400" />
              <span className="text-lg font-semibold">{getCityScore()}</span>
              <span className="text-blue-100">({cityData.vote_count || 0} {t('cityDetail.reviews')})</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span className="text-lg font-semibold">${cityData.cost_of_living}</span>
              <span className="text-blue-100">/month</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Wifi className="h-5 w-5" />
              <span className="text-lg font-semibold">{cityData.wifi_speed}Mbps</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span className="text-lg font-semibold">{cityData.visa_days} {t('cityDetail.days')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {t('cityDetail.quickStats')}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('cityDetail.costOfLiving')}</p>
                    <p className={`text-lg font-semibold ${costLevel.color}`}>
                      ${cityData.cost_of_living}/month
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 capitalize">
                      {t(`cityDetail.costLevel.${costLevel.level}`)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Wifi className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('cityDetail.wifiSpeed')}</p>
                    <p className={`text-lg font-semibold ${wifiLevel.color}`}>
                      {cityData.wifi_speed} Mbps
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 capitalize">
                      {t(`cityDetail.wifiLevel.${wifiLevel.level}`)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('cityDetail.visaStay')}</p>
                    <p className={`text-lg font-semibold ${visaDifficulty.color}`}>
                      {cityData.visa_days} {t('cityDetail.days')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 capitalize">
                      {t(`cityDetail.visaDifficulty.${visaDifficulty.level}`)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('cityDetail.nomadCommunity')}</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                      {t(`cityDetail.communityActivity.${communityActivity}`)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {t('cityDetail.activeNomads')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* City Description */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('cityDetail.aboutCity')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {t('cityDetail.cityDescription', { 
                  city: cityData.name, 
                  country: cityData.country,
                  cost: cityData.cost_of_living.toString(),
                  wifi: cityData.wifi_speed.toString(),
                  visa: cityData.visa_days.toString()
                })}
              </p>
            </div>

            {/* Pros and Cons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  {t('cityDetail.pros')}
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('cityDetail.pros.affordableCost')}
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('cityDetail.pros.goodWifi')}
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('cityDetail.pros.longVisa')}
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('cityDetail.pros.nomadFriendly')}
                    </span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  {t('cityDetail.cons')}
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('cityDetail.cons.languageBarrier')}
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('cityDetail.cons.weatherIssues')}
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('cityDetail.cons.transportation')}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Info */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('cityDetail.actions')}
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => setShowVoteModal(true)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Star className="h-5 w-5" />
                  <span>{t('cityDetail.rateCity')}</span>
                </button>
                
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                  <Heart className="h-5 w-5" />
                  <span>{t('cityDetail.addToFavorites')}</span>
                </button>
                
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                  <Share2 className="h-5 w-5" />
                  <span>{t('cityDetail.share')}</span>
                </button>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('cityDetail.quickInfo')}
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('cityDetail.timezone')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{cityData.timezone}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('cityDetail.coordinates')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {cityData.latitude.toFixed(2)}, {cityData.longitude.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('cityDetail.visaType')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{cityData.visa_type}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vote Modal */}
      {showVoteModal && cityData && (
        <VoteModal
          city={cityData}
          isOpen={showVoteModal}
          onClose={() => setShowVoteModal(false)}
          onVoteSubmitted={handleVoteSubmitted}
        />
      )}
    </div>
  )
}
