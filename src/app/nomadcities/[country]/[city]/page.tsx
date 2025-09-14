'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { getCities, getCityById } from '@/lib/api'
import { City } from '@/lib/supabase'
import { addRecentCity } from '@/lib/recentCities'
import { RealtimeService } from '@/lib/realtimeService'
import { votingSystem, VoteItem } from '@/lib/votingSystem'
import VoteModal from '@/components/VoteModal'
import CostBreakdownChart from '@/components/CostBreakdownChart'
import CommunityActivity from '@/components/CommunityActivity'
import CityMap from '@/components/CityMap'
import Breadcrumb from '@/components/Breadcrumb'
import CityImageGallery from '@/components/CityImageGallery'
import RelatedCities from '@/components/RelatedCities'
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
  MessageCircle,
  Brain,
  Award,
  Home,
  Briefcase,
  Thermometer,
  Languages,
  Banknote,
  Plus,
  ChevronRight,
  Activity,
  BarChart3,
  PieChart,
  ArrowRight,
  CheckCircle,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  ExternalLink,
  Navigation,
  Compass,
  Target,
  Sparkles,
  Rocket,
  Lightbulb,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Minus,
  Maximize2,
  Minimize2
} from 'lucide-react'

export default function CityDetailPage() {
  const { t } = useTranslation()
  const params = useParams()
  const { country, city } = params
  
  const [cityData, setCityData] = useState<City | null>(null)
  const [loading, setLoading] = useState(true)
  const [showVoteModal, setShowVoteModal] = useState(false)
  const [cityVotes, setCityVotes] = useState<{ pros: VoteItem[], cons: VoteItem[] }>({ pros: [], cons: [] })
  const [visaInfo, setVisaInfo] = useState<any>(null)
  const [visaLoading, setVisaLoading] = useState(false)

  useEffect(() => {
    fetchCityData()
  }, [country, city])

  useEffect(() => {
    if (cityData) {
      fetchVisaInfo()
    }
  }, [cityData])

  // 初始化投票数据
  useEffect(() => {
    if (cityData) {
      const cityId = `${country}/${city}`
      const pros = getCityPros()
      const cons = getCityCons()
      
      // 初始化投票数据
      votingSystem.initializeCityVotes(cityId, pros, cons)
      
      // 加载现有投票数据
      const votes = votingSystem.getCityVotes(cityId)
      setCityVotes({ pros: votes.pros, cons: votes.cons })
    }
  }, [cityData, country, city])

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

  const fetchVisaInfo = async () => {
    if (!cityData) return
    
    try {
      setVisaLoading(true)
      const response = await fetch(`/api/nomad-visas?country=${cityData.country_code}`)
      if (response.ok) {
        const visas = await response.json()
        if (visas && visas.length > 0) {
          setVisaInfo(visas[0]) // 获取第一个数字游民签证
        }
      }
    } catch (error) {
      console.error('Error fetching visa info:', error)
    } finally {
      setVisaLoading(false)
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

  // 获取城市优点
  const getCityPros = (): VoteItem[] => {
    if (!cityData) return []
    
    const pros: VoteItem[] = []
    
    // 基于数据动态生成优点
    if ((cityData.cost_of_living || cityData.cost_min_usd || 0) < 2000) {
      pros.push({
        id: 'affordable_cost',
        title: t('cityDetail.pros.affordableCost'),
        description: t('cityDetail.pros.affordableCostDesc'),
        votes: 0,
        upvotes: 0,
        downvotes: 0
      })
    }
    
    if ((cityData.wifi_speed_mbps || cityData.wifi_speed || 0) > 50) {
      pros.push({
        id: 'good_wifi',
        title: t('cityDetail.pros.goodWifi'),
        description: t('cityDetail.pros.goodWifiDesc'),
        votes: 0,
        upvotes: 0,
        downvotes: 0
      })
    }
    
    if ((cityData.visa_days || 0) > 90) {
      pros.push({
        id: 'long_visa',
        title: t('cityDetail.pros.longVisa'),
        description: t('cityDetail.pros.longVisaDesc'),
        votes: 0,
        upvotes: 0,
        downvotes: 0
      })
    }
    
    if ((cityData.avg_overall_rating || 0) > 4.0) {
      pros.push({
        id: 'nomad_friendly',
        title: t('cityDetail.pros.nomadFriendly'),
        description: t('cityDetail.pros.nomadFriendlyDesc'),
        votes: 0,
        upvotes: 0,
        downvotes: 0
      })
    }
    
    // 默认优点
    if (pros.length === 0) {
      pros.push({
        id: 'good_weather',
        title: t('cityDetail.pros.goodWeather'),
        description: t('cityDetail.pros.goodWeatherDesc'),
        votes: 0,
        upvotes: 0,
        downvotes: 0
      })
    }
    
    return pros
  }

  // 获取城市缺点
  const getCityCons = (): VoteItem[] => {
    if (!cityData) return []
    
    const cons: VoteItem[] = []
    
    // 基于数据动态生成缺点
    if ((cityData.cost_of_living || cityData.cost_max_usd || 0) > 3000) {
      cons.push({
        id: 'high_cost',
        title: t('cityDetail.cons.highCost'),
        description: t('cityDetail.cons.highCostDesc'),
        votes: 0,
        upvotes: 0,
        downvotes: 0
      })
    }
    
    if ((cityData.wifi_speed_mbps || cityData.wifi_speed || 0) < 25) {
      cons.push({
        id: 'slow_wifi',
        title: t('cityDetail.cons.slowWifi'),
        description: t('cityDetail.cons.slowWifiDesc'),
        votes: 0,
        upvotes: 0,
        downvotes: 0
      })
    }
    
    if ((cityData.visa_days || 0) < 30) {
      cons.push({
        id: 'short_visa',
        title: t('cityDetail.cons.shortVisa'),
        description: t('cityDetail.cons.shortVisaDesc'),
        votes: 0,
        upvotes: 0,
        downvotes: 0
      })
    }
    
    // 默认缺点
    if (cons.length === 0) {
      cons.push({
        id: 'language_barrier',
        title: t('cityDetail.cons.languageBarrier'),
        description: t('cityDetail.cons.languageBarrierDesc'),
        votes: 0,
        upvotes: 0,
        downvotes: 0
      })
    }
    
    return cons
  }

  // 处理投票
  const handleVote = (itemType: 'pro' | 'con', itemId: string, voteType: 'upvote' | 'downvote') => {
    if (!cityData) return
    
    const cityId = `${country}/${city}`
    const userId = 'current_user' // 这里应该从用户上下文获取真实用户ID
    
    const success = votingSystem.vote(userId, cityId, itemType, itemId, voteType)
    
    if (success) {
      // 更新本地状态
      const votes = votingSystem.getCityVotes(cityId)
      setCityVotes({ pros: votes.pros, cons: votes.cons })
    }
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

  const costLevel = getCostLevel(cityData.cost_of_living || cityData.cost_min_usd || 0)
  const wifiLevel = getWifiLevel(cityData.wifi_speed_mbps || cityData.wifi_speed || 0)
  const visaDifficulty = getVisaDifficulty(cityData.visa_days || 0)
  const communityActivity = getCommunityActivity()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumb
          items={[
            {
              label: 'Nomad Cities',
              href: '/nomadcities',
              icon: <MapPin className="h-4 w-4" />
            },
            {
              label: cityData.country,
              href: `/nomadcities?country=${cityData.country.toLowerCase().replace(/\s+/g, '-')}`
            },
            {
              label: cityData.name
            }
          ]}
        />
      </div>

      {/* Hero Section - Modern Design */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 dark:from-blue-600/5 dark:via-purple-600/5 dark:to-pink-600/5"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* City Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="relative">
                <span className="text-6xl drop-shadow-lg">{getCountryFlag(cityData.country_code)}</span>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                  {cityData.name}
                </h1>
                <p className="text-2xl text-gray-600 dark:text-gray-300 font-medium">{cityData.country}</p>
                <div className="flex items-center justify-center space-x-3 mt-3">
                  <div className="flex items-center space-x-1">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className={`h-5 w-5 ${star <= Math.floor(parseFloat(getCityScore())) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{getCityScore()}</span>
                  <span className="text-gray-500 dark:text-gray-400">({cityData.vote_count || 0} reviews)</span>
                </div>
              </div>
            </div>
          </div>

          {/* City Image Gallery - Full Width */}
          <div className="mb-12">
            <div className="relative">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 border border-white/20 dark:border-gray-700/50 shadow-2xl">
                <div className="aspect-[21/9] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl overflow-hidden">
                  <CityImageGallery cityData={cityData} />
                </div>
                
                {/* Quick Stats Overlay */}
                <div className="absolute -bottom-4 -right-4 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {cityData.nomad_score || 8.5}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Nomad Score</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200 dark:bg-gray-600"></div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {cityData.coffee_score || 9.2}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Coffee Score</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Cost of Living */}
            <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Monthly Cost</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  ${cityData.cost_of_living || cityData.cost_min_usd || 'N/A'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize font-medium">
                  {costLevel.level} budget
                </p>
              </div>
            </div>

            {/* WiFi Speed */}
            <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <Wifi className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">WiFi Speed</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {cityData.wifi_speed_mbps || cityData.wifi_speed || 'N/A'} Mbps
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize font-medium">
                  {wifiLevel.level} quality
                </p>
              </div>
            </div>

            {/* Visa Duration */}
            <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Visa Duration</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {visaInfo ? `${visaInfo.duration_months}mo` : cityData.visa_days ? `${cityData.visa_days}d` : 'N/A'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize font-medium">
                  {visaDifficulty.level} process
                </p>
              </div>
            </div>

            {/* Community Score */}
            <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Community</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {cityData.community_score || 7}/10
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize font-medium">
                  {communityActivity} activity
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/local-nomads"
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 font-semibold text-lg"
            >
              <Users className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
              <span>Join Community</span>
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
            <a
              href={`/nomadagent?city=${cityData.slug || cityData.name.toLowerCase().replace(/\s+/g, '-')}&country=${cityData.country_code}`}
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 font-semibold text-lg"
            >
              <Brain className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
              <span>AI Route Planning</span>
              <Rocket className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </div>
        </div>
      </div>

      {/* Detailed Information Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Cost Analysis & Trends */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-3xl"></div>
          <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-gray-700/50 shadow-2xl">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <PieChart className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Cost Analysis</h2>
                <p className="text-gray-600 dark:text-gray-400">Monthly expenses breakdown and trends</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Cost Breakdown Chart */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Monthly Cost Breakdown</h3>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6">
                  {cityData && <CostBreakdownChart cityData={cityData} />}
                </div>
              </div>
              
              {/* Cost Trends */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">6-Month Cost Trends</h3>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6 h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Cost Trend Chart</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Coming Soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* City Overview & Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* City Description */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-3xl"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-gray-700/50 shadow-2xl">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Globe className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">City Overview</h2>
                  <p className="text-gray-600 dark:text-gray-400">Discover what makes this city special</p>
                </div>
              </div>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {cityData && t('cityDetail.cityDescription', { 
                    city: cityData.name, 
                    country: cityData.country,
                    cost: (cityData.cost_of_living || cityData.cost_min_usd || 0).toString(),
                    wifi: (cityData.wifi_speed_mbps || cityData.wifi_speed || 0).toString(),
                    visa: (cityData.visa_days || 0).toString()
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Pros & Cons Analysis */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-3xl"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-gray-700/50 shadow-2xl">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Target className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pros & Cons</h2>
                  <p className="text-gray-600 dark:text-gray-400">Community-driven insights</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Pros */}
                <div>
                  <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Advantages
                  </h3>
                  <div className="space-y-3">
                    {cityVotes.pros.slice(0, 3).map((pro) => (
                      <div key={pro.id} className="group p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-700 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <ThumbsUp className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 dark:text-white">{pro.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{pro.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cons */}
                <div>
                  <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center">
                    <XCircle className="h-5 w-5 mr-2" />
                    Challenges
                  </h3>
                  <div className="space-y-3">
                    {cityVotes.cons.slice(0, 3).map((con) => (
                      <div key={con.id} className="group p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl border border-red-200 dark:border-red-700 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <ThumbsDown className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 dark:text-white">{con.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{con.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map & Recommended Places */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-3xl"></div>
          <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-gray-700/50 shadow-2xl">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Navigation className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Map & Places</h2>
                <p className="text-gray-600 dark:text-gray-400">Explore the city and discover nomad-friendly spots</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Interactive Map */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Interactive Map</h3>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl overflow-hidden shadow-lg">
                  {cityData && <CityMap cityData={cityData} />}
                </div>
              </div>
              
              {/* Recommended Places */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Recommended Places</h3>
                <div className="space-y-4">
                  {/* Co-working Spaces */}
                  <div className="group p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Briefcase className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Co-working Spaces</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Top 3 recommended co-working spaces</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>

                  {/* Coffee Shops */}
                  <div className="group p-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-700 hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Coffee className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Coffee Shops</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Remote work friendly cafes</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-amber-500 transition-colors" />
                    </div>
                  </div>

                  {/* Accommodation */}
                  <div className="group p-5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-700 hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Home className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Accommodation</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Nomad-friendly housing options</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </div>

                  {/* Transportation */}
                  <div className="group p-5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Plane className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Transportation</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Airports, public transport, car rental</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Community Events & Meetups */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-rose-500/5 rounded-3xl"></div>
          <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-gray-700/50 shadow-2xl">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Community Events</h2>
                <p className="text-gray-600 dark:text-gray-400">Join meetups and connect with fellow nomads</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upcoming Events */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Events</h3>
                
                <div className="space-y-4">
                  {/* Morning Coffee Networking */}
                  <div className="group p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1">Morning Coffee Networking</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Connect with local nomads over coffee</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Tomorrow 9:00 AM - 11:00 AM</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>8 attendees</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Coffee className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 font-semibold flex items-center justify-center space-x-2">
                      <span>Join Event</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Co-working Session */}
                  <div className="group p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-700 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1">Co-working Session</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Productive work session with fellow nomads</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Day after tomorrow 2:00 PM - 6:00 PM</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>12 attendees</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Briefcase className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-4 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 font-semibold flex items-center justify-center space-x-2">
                      <span>Join Event</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Create New Event */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Create Event</h3>
                
                <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-center hover:border-purple-400 dark:hover:border-purple-500 transition-colors duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Plus className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Organize Your Meetup</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Create coffee meetups, co-working sessions, or social events for the community
                  </p>
                  <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-8 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-semibold flex items-center space-x-2 mx-auto">
                    <span>Create Event</span>
                    <Sparkles className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Community Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Community Members */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-3xl"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-6 border border-white/20 dark:border-gray-700/50 shadow-2xl">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Community</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active nomads in this city</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Sample community members */}
                <div className="group p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">SC</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Sarah Chen</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">UX Designer • 3 months</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors">
                      Connect
                    </button>
                  </div>
                </div>

                <div className="group p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-700 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">AR</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Alex Rodriguez</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Software Developer • 1 month</p>
                    </div>
                    <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-colors">
                      Connect
                    </button>
                  </div>
                </div>

                <div className="group p-4 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-2xl border border-pink-200 dark:border-pink-700 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">MJ</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Maria Johnson</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Digital Marketer • 2 months</p>
                    </div>
                    <button className="text-pink-600 hover:text-pink-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/20 transition-colors">
                      Connect
                    </button>
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 font-semibold">
                View All Members
              </button>
            </div>
          </div>

          {/* Reviews & Ratings */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-3xl"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-6 border border-white/20 dark:border-gray-700/50 shadow-2xl">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reviews</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Community feedback</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Sample reviews */}
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-xs">JD</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">John Doe</h4>
                      <div className="flex items-center space-x-1">
                        {[1,2,3,4,5].map((star) => (
                          <Star key={star} className="h-3 w-3 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    "Great city for digital nomads! Excellent WiFi, affordable cost of living, and a vibrant community. Highly recommended!"
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-xs">ES</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Emma Smith</h4>
                      <div className="flex items-center space-x-1">
                        {[1,2,3,4].map((star) => (
                          <Star key={star} className="h-3 w-3 text-yellow-400 fill-current" />
                        ))}
                        <Star className="h-3 w-3 text-gray-300" />
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    "Love the coffee culture here! Perfect for remote work. Only downside is the traffic during rush hours."
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={() => setShowVoteModal(true)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-4 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 font-semibold flex items-center justify-center space-x-2"
                >
                  <Star className="h-4 w-4" />
                  <span>Rate City</span>
                </button>
                
                <button className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-4 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 font-semibold flex items-center justify-center space-x-2">
                  <Bookmark className="h-4 w-4" />
                  <span>Save to Favorites</span>
                </button>
                
                <button className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-4 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-semibold flex items-center justify-center space-x-2">
                  <Share2 className="h-4 w-4" />
                  <span>Share City</span>
                </button>
              </div>
            </div>
          </div>

          {/* Similar Cities */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-3xl"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-6 border border-white/20 dark:border-gray-700/50 shadow-2xl">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Compass className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Similar Cities</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Explore alternatives</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Sample similar cities */}
                <div className="group p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">🇵🇹</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Lisbon</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Portugal • $1800/month</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </div>
                </div>

                <div className="group p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">🇹🇭</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Bangkok</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Thailand • $1200/month</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </div>
                </div>

                <div className="group p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">🇪🇸</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Barcelona</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Spain • $2200/month</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-semibold">
                Explore More Cities
              </button>
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
