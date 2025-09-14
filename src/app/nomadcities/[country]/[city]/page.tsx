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
  PieChart
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumb
          items={[
            {
              label: t('cityDetail.nomadCities'),
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

      {/* 核心概览区 - 首屏 */}
      <div className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧：城市基本信息 */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-5xl">{getCountryFlag(cityData.country_code)}</span>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{cityData.name}</h1>
                  <p className="text-xl text-gray-600 dark:text-gray-400">{cityData.country}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">{getCityScore()}</span>
                    <span className="text-gray-500 dark:text-gray-400">({cityData.vote_count || 0} {t('cityDetail.reviews')})</span>
                  </div>
                </div>
              </div>

              {/* 四大核心指标卡片 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {/* 月均成本 */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">月均成本</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        ${cityData.cost_of_living || cityData.cost_min_usd || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {costLevel.level}
                      </p>
                    </div>
                  </div>
                </div>

                {/* WiFi速度 */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <Wifi className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">WiFi速度</p>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {cityData.wifi_speed_mbps || cityData.wifi_speed || 'N/A'} Mbps
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {wifiLevel.level}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 签证天数 */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">签证天数</p>
                      <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        {visaInfo ? `${visaInfo.duration_months}个月` : cityData.visa_days ? `${cityData.visa_days}天` : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {visaDifficulty.level}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 社区活跃度 */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200 dark:border-orange-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">社区活跃度</p>
                      <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                        {cityData.community_score || 7}/10
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {communityActivity}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 立即加入社区按钮 */}
              <div className="flex flex-wrap gap-4">
                <a
                  href="/local-nomads"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Users className="h-5 w-5 mr-2" />
                  <span className="font-semibold">立即加入社区</span>
                </a>
                <a
                  href={`/nomadagent?city=${cityData.slug || cityData.name.toLowerCase().replace(/\s+/g, '-')}&country=${cityData.country_code}`}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Brain className="h-5 w-5 mr-2" />
                  <span className="font-semibold">AI规划路线</span>
                </a>
              </div>
            </div>

            {/* 右侧：城市封面图 */}
            <div className="lg:col-span-1">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-64 lg:h-80 flex items-center justify-center">
                <CityImageGallery cityData={cityData} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 详细信息区 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* 成本与趋势 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <PieChart className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📊 成本与趋势</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 成本细分饼图 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">月度成本细分</h3>
              <CostBreakdownChart cityData={cityData} />
            </div>
            
            {/* 成本趋势图 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">6个月成本趋势</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 h-64 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">成本趋势图表</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">即将推出</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 城市简介与优缺点 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 城市简介 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🏙️ 城市简介</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('cityDetail.cityDescription', { 
                city: cityData.name, 
                country: cityData.country,
                cost: (cityData.cost_of_living || cityData.cost_min_usd || 0).toString(),
                wifi: (cityData.wifi_speed_mbps || cityData.wifi_speed || 0).toString(),
                visa: (cityData.visa_days || 0).toString()
              })}
            </p>
          </div>

          {/* 优缺点表格 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">优缺点分析</h2>
            </div>
            
            <div className="space-y-4">
              {/* 优点 */}
              <div>
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  优点
                </h3>
                <div className="space-y-2">
                  {cityVotes.pros.slice(0, 3).map((pro) => (
                    <div key={pro.id} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                      <p className="font-medium text-gray-900 dark:text-white">{pro.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{pro.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 缺点 */}
              <div>
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center">
                  <span className="text-red-500 mr-2">✗</span>
                  缺点
                </h3>
                <div className="space-y-2">
                  {cityVotes.cons.slice(0, 3).map((con) => (
                    <div key={con.id} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                      <p className="font-medium text-gray-900 dark:text-white">{con.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{con.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 地图与推荐地点 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <MapPin className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🗺️ 地图与推荐地点</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 地图 */}
            <div>
              <CityMap cityData={cityData} />
            </div>
            
            {/* 推荐地点列表 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">推荐地点</h3>
              <div className="space-y-4">
                {/* 联合办公空间 */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">联合办公空间</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">推荐3个最佳联合办公空间</p>
                    </div>
                  </div>
                </div>

                {/* 咖啡馆 */}
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                      <Coffee className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">咖啡馆</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">适合远程工作的咖啡馆</p>
                    </div>
                  </div>
                </div>

                {/* 住宿 */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <Home className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">住宿推荐</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">数字游民友好的住宿选择</p>
                    </div>
                  </div>
                </div>

                {/* 交通 */}
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Plane className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">交通信息</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">机场、公共交通、租车信息</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Meetups日程表 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-pink-600 dark:text-pink-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📅 Meetups日程</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 即将举行的Meetups */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">即将举行</h3>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Morning Coffee Networking</h4>
                  <span className="text-sm text-blue-600 dark:text-blue-400">8人参加</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">明天 9:00 AM - 11:00 AM</p>
                <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                  🔗 加入活动
                </button>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Co-working Session</h4>
                  <span className="text-sm text-green-600 dark:text-green-400">12人参加</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">后天 2:00 PM - 6:00 PM</p>
                <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
                  🔗 加入活动
                </button>
              </div>
            </div>

            {/* 创建新Meetup */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">创建活动</h3>
              
              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
                <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">组织你的Meetup</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  创建咖啡聚会、联合办公或社交活动
                </p>
                <button className="bg-purple-500 text-white py-2 px-6 rounded-lg hover:bg-purple-600 transition-colors">
                  创建活动
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 互动区 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 社区用户列表 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">👥 社区用户</h2>
            </div>
            
            <div className="space-y-4">
              {/* 模拟用户数据 */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">SC</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Sarah Chen</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">UX设计师 • 3个月</p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  联系
                </button>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">AR</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Alex Rodriguez</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">软件开发 • 1个月</p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  联系
                </button>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">MJ</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Maria Johnson</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">数字营销 • 2个月</p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  联系
                </button>
              </div>
            </div>

            <button className="w-full mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
              查看更多用户
            </button>
          </div>

          {/* 评论与评分 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">💬 评论与评分</h2>
            </div>
            
            <div className="space-y-4">
              {/* 模拟评论 */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-xs">JD</span>
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

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-xs">ES</span>
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
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Star className="h-4 w-4" />
                <span>👍 评分城市</span>
              </button>
              
              <button className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2">
                <Heart className="h-4 w-4" />
                <span>❤️ 收藏</span>
              </button>
              
              <button className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2">
                <Share2 className="h-4 w-4" />
                <span>📤 分享</span>
              </button>
            </div>
          </div>

          {/* 相似城市推荐 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📍 相似城市推荐</h2>
            </div>
            
            <div className="space-y-4">
              {/* 模拟推荐城市 */}
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🇵🇹</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Lisbon</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Portugal • $1800/月</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🇹🇭</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Bangkok</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Thailand • $1200/月</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🇪🇸</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Barcelona</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Spain • $2200/月</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            <button className="w-full mt-4 bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors">
              查看更多城市
            </button>
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
