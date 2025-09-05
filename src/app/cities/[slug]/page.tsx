'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  MapPinIcon, WifiIcon, DollarSignIcon, CalendarIcon, StarIcon, UsersIcon, 
  TrendingUpIcon, HeartIcon, CoffeeIcon, GlobeIcon, ThumbsUpIcon, ThumbsDownIcon,
  PlaneIcon, HomeIcon, UtensilsIcon, BusIcon, WifiIcon as WifiIconSolid,
  ShieldIcon, SunIcon, CloudIcon, ClockIcon, BookOpenIcon, MessageSquareIcon, CameraIcon
} from 'lucide-react'
import { getCityById, submitVote, getCities } from '@/lib/api'
import { City } from '@/lib/supabase'
import { useTranslation } from '@/hooks/useTranslation'
import { useUser } from '@/contexts/GlobalStateContext'
import VoteModal from '@/components/VoteModal'
import { realtimeService, realtimeData } from '@/lib/realtimeService'
import { addRecentCity } from '@/lib/recentCities'
import RealtimeStatusIndicator from '@/components/RealtimeStatusIndicator'

export default function CityDetailPage() {
  const { t } = useTranslation()
  const { user } = useUser()
  const params = useParams()
  const citySlug = params.slug as string
  
  const [city, setCity] = useState<City | null>(null)
  const [loading, setLoading] = useState(true)
  const [showVoteModal, setShowVoteModal] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [realTimeData, setRealTimeData] = useState<any>(null)

  useEffect(() => {
    fetchCityData()
    setupRealtimeSubscription()
    
    return () => {
      // 清理实时订阅
      if (city) {
        realtimeService.unsubscribe(`city_reviews_${city.id}`)
        realtimeService.unsubscribe(`city_votes_${city.id}`)
      }
    }
  }, [citySlug])

  const setupRealtimeSubscription = () => {
    // 只在客户端设置实时订阅
    if (typeof window !== 'undefined' && city) {
      // 订阅城市评论实时更新
      realtimeService.subscribeToCityReviews(city.id, (payload) => {
        console.log('Real-time review update:', payload)
        // 这里可以更新评论数据
        if (payload.eventType === 'INSERT') {
          // 新评论添加时刷新数据
          fetchCityData()
        }
      })

      // 订阅城市投票实时更新
      realtimeService.subscribeToCityVotes(city.id, (payload) => {
        console.log('Real-time vote update:', payload)
        // 这里可以更新投票数据
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          // 投票更新时刷新数据
          fetchCityData()
        }
      })
    }
  }

  const fetchCityData = async () => {
    try {
      setLoading(true)
      
      // 首先尝试通过slug查找城市
      const allCities = await getCities()
      const cityBySlug = allCities.find(c => 
        c.name.toLowerCase().replace(/\s+/g, '-') === citySlug.toLowerCase() ||
        c.name.toLowerCase().replace(/\s+/g, '_') === citySlug.toLowerCase()
      )
      
      if (cityBySlug) {
        setCity(cityBySlug)
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
      const cityData = await getCityById(citySlug)
      setCity(cityData)
      // 添加到最近访问城市
      if (cityData) {
        addRecentCity({
          id: cityData.id,
          name: cityData.name,
          country: cityData.country,
          country_code: cityData.country_code
        })
      }
      setupRealtimeSubscription()
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
    const baseScore = 4.2
    const wifiBonus = (city?.wifi_speed || 0) > 50 ? 0.3 : 0
    const costBonus = (city?.cost_of_living || 0) < 2000 ? 0.2 : 0
    const visaBonus = (city?.visa_days || 0) > 90 ? 0.3 : 0
    return Math.min(5, baseScore + wifiBonus + costBonus + visaBonus).toFixed(1)
  }

  // 获取社区活跃度（模拟数据）
  const getCommunityActivity = () => {
    const baseActivity = 75
    const randomVariation = Math.floor(Math.random() * 20) - 10
    return Math.max(0, Math.min(100, baseActivity + randomVariation))
  }

  // 获取生活便利性评分（模拟数据）
  const getConvenienceScore = () => {
    const baseScore = 4.0
    const wifiBonus = (city?.wifi_speed || 0) > 50 ? 0.4 : 0
    const costBonus = (city?.cost_of_living || 0) < 2000 ? 0.3 : 0
    return Math.min(5, baseScore + wifiBonus + costBonus).toFixed(1)
  }

  // 获取优缺点数据
  const getProsAndCons = () => {
    return {
      pros: [
        t('cityDetail.prosList.lowCost'),
        t('cityDetail.prosList.fastWifi'),
        t('cityDetail.prosList.activeCommunity'),
        t('cityDetail.prosList.englishFriendly'),
        t('cityDetail.prosList.convenientTransport'),
        t('cityDetail.prosList.richFood'),
        t('cityDetail.prosList.pleasantClimate'),
        t('cityDetail.prosList.highSafety')
      ],
      cons: [
        t('cityDetail.consList.rainySeason'),
        t('cityDetail.consList.unstableWifi'),
        t('cityDetail.consList.languageBarrier'),
        t('cityDetail.consList.trafficCongestion'),
        t('cityDetail.consList.visaLimitations'),
        t('cityDetail.consList.highMedicalCost'),
        t('cityDetail.consList.culturalDifferences'),
        t('cityDetail.consList.internetCensorship')
      ]
    }
  }

  // 获取生活成本细分
  const getCostBreakdown = () => {
    const totalCost = city?.cost_of_living || 2000
    return {
      accommodation: Math.round(totalCost * 0.4),
      food: Math.round(totalCost * 0.25),
      transportation: Math.round(totalCost * 0.15),
      entertainment: Math.round(totalCost * 0.1),
      utilities: Math.round(totalCost * 0.05),
      other: Math.round(totalCost * 0.05)
    }
  }

  // 获取用户评价
  const getUserReviews = () => {
    return [
      {
        id: 1,
        user: "Sarah M.",
        rating: 5,
        date: "2024-01-15",
        comment: t('cityDetail.reviews.sarahComment'),
        avatar: "👩‍💻"
      },
      {
        id: 2,
        user: "Mike R.",
        rating: 4,
        date: "2024-01-10",
        comment: t('cityDetail.reviews.mikeComment'),
        avatar: "👨‍💻"
      },
      {
        id: 3,
        user: "Emma L.",
        rating: 5,
        date: "2024-01-05",
        comment: t('cityDetail.reviews.emmaComment'),
        avatar: "👩‍💼"
      }
    ]
  }

  // 获取推荐地点数据
  const getNomadPlaces = () => {
    return [
      {
        id: 1,
        name: "Café Fabrica",
        icon: "☕",
        rating: 4.8,
        wifi: t('cityDetail.nomadPlaces.wifiStatus.stable'),
        price: "$",
        description: t('cityDetail.nomadPlaces.cafeFabrica.description'),
        tags: [t('cityDetail.nomadPlaces.cafeFabrica.tags.cafe'), t('cityDetail.nomadPlaces.cafeFabrica.tags.wifi')]
      },
      {
        id: 2,
        name: "Outsite Lisbon",
        icon: "💻",
        rating: 4.6,
        wifi: t('cityDetail.nomadPlaces.wifiStatus.stable'),
        price: "$$",
        description: t('cityDetail.nomadPlaces.outsiteLisbon.description'),
        tags: [t('cityDetail.nomadPlaces.outsiteLisbon.tags.coworking'), t('cityDetail.nomadPlaces.outsiteLisbon.tags.accommodation')]
      },
      {
        id: 3,
        name: "Bairro Alto",
        icon: "🍷",
        rating: 4.5,
        wifi: t('cityDetail.nomadPlaces.wifiStatus.average'),
        price: "$",
        description: t('cityDetail.nomadPlaces.bairroAlto.description'),
        tags: [t('cityDetail.nomadPlaces.bairroAlto.tags.nightlife'), t('cityDetail.nomadPlaces.bairroAlto.tags.bars')]
      },
      {
        id: 4,
        name: "Praca do Comercio",
        icon: "��️",
        rating: 4.4,
        wifi: t('cityDetail.nomadPlaces.wifiStatus.average'),
        price: "$",
        description: t('cityDetail.nomadPlaces.pracaComercio.description'),
        tags: [t('cityDetail.nomadPlaces.pracaComercio.tags.attractions'), t('cityDetail.nomadPlaces.pracaComercio.tags.square')]
      },
      {
        id: 5,
        name: "Belem Tower",
        icon: "⛪",
        rating: 4.3,
        wifi: t('cityDetail.nomadPlaces.wifiStatus.stable'),
        price: "$",
        description: t('cityDetail.nomadPlaces.belemTower.description'),
        tags: [t('cityDetail.nomadPlaces.belemTower.tags.attractions'), t('cityDetail.nomadPlaces.belemTower.tags.history')]
      }
    ];
  };

  // 获取推荐服务数据
  const getRecommendedServices = () => {
    return [
      {
        id: 1,
        title: "SafetyWing",
        description: t('cityDetail.recommendedServices.safetywing'),
        icon: "🛡️",
        price: "$42/月",
        link: "https://www.safetywing.com"
      },
      {
        id: 2,
        title: "iVisa",
        description: t('cityDetail.recommendedServices.ivisa'),
        icon: "📋",
        price: "$25起",
        link: "https://www.ivisa.com"
      },
      {
        id: 3,
        title: "WeWork",
        description: t('cityDetail.recommendedServices.wework'),
        icon: "💻",
        price: "$200-400/月",
        link: "https://www.wework.com"
      },
      {
        id: 4,
        title: "Airbnb",
        description: t('cityDetail.recommendedServices.airbnb'),
        icon: "🏠",
        price: "$50-100/晚",
        link: "https://www.airbnb.com"
      },
      {
        id: 5,
        title: "Uber/Bolt",
        description: t('cityDetail.recommendedServices.uber'),
        icon: "🚕",
        price: "€3起",
        link: "https://www.uber.com"
      }
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('cityDetail.loading')}</p>
        </div>
      </div>
    )
  }

  if (!city) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('cityDetail.error')}</h1>
          <p className="text-gray-600">{t('cityDetail.cityNotFound')}</p>
          <Link href="/cities" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            {t('cityDetail.backToCities')}
          </Link>
        </div>
      </div>
    )
  }

  const prosAndCons = getProsAndCons()
  const costBreakdown = getCostBreakdown()
  const userReviews = getUserReviews()

  // 生成结构化数据
  const generateStructuredData = () => {
    if (!city) return null
    
    return {
      "@context": "https://schema.org",
      "@type": "City",
      "name": city.name,
      "description": `${city.name}${t('cityDetail.structuredData.description', { country: city.country })}`,
      "url": `https://nomadnow.app/cities/${city.name.toLowerCase().replace(/\s+/g, '-')}`,
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": city.latitude || 0,
        "longitude": city.longitude || 0
      },
      "address": {
        "@type": "PostalAddress",
        "addressCountry": city.country,
        "addressLocality": city.name
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": getCityScore(),
        "reviewCount": userReviews.length,
        "bestRating": "5",
        "worstRating": "1"
      },
      "review": userReviews.map(review => ({
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": review.user
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": review.rating,
          "bestRating": "5"
        },
        "reviewBody": review.comment,
        "datePublished": review.date
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 结构化数据 */}
      {city && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateStructuredData())
          }}
        />
      )}
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              {t('common.home')}
            </Link>
            <span>/</span>
            <Link href="/cities" className="hover:text-blue-600 transition-colors">
              {t('cities.title')}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{city.name}</span>
          </nav>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{getCountryFlag(city.country_code)}</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{city.name} {getCountryFlag(city.country_code)}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <p className="text-lg text-gray-600">{city.country}</p>
                  <div className="flex items-center space-x-1">
                    <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-700">{getCityScore()}</span>
                    <span className="text-sm text-gray-500">({getCommunityActivity()}% {t('cityDetail.communityActivity')})</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <RealtimeStatusIndicator
                cityId={city.id}
                userId={user.profile?.id}
                showNotifications={true}
              />
              <button
                onClick={() => setShowVoteModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <StarIcon className="h-4 w-4" />
                <span>{t('cityDetail.vote')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Core Info Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600 mb-1 flex items-center justify-center">
                <StarIcon className="h-6 w-6 mr-1" />
                {getCityScore()}
              </div>
              <div className="text-sm text-gray-600">{t('cityDetail.overallScore')}</div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600 mb-1 flex items-center justify-center">
                <UsersIcon className="h-6 w-6 mr-1" />
                {getCommunityActivity()}%
              </div>
              <div className="text-sm text-gray-600">{t('cityDetail.communityActivity')}</div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600 mb-1 flex items-center justify-center">
                <CoffeeIcon className="h-6 w-6 mr-1" />
                {getConvenienceScore()}
              </div>
              <div className="text-sm text-gray-600">{t('cityDetail.convenienceScore')}</div>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-xl">
              <div className="text-2xl font-bold text-orange-600 mb-1 flex items-center justify-center">
                <TrendingUpIcon className="h-6 w-6 mr-1" />
                {city.visa_days}
              </div>
              <div className="text-sm text-gray-600">{t('cityDetail.stayDays')}</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
            {[
              { id: 'overview', label: t('cityDetail.overview'), icon: StarIcon },
              { id: 'pros-cons', label: t('cityDetail.prosCons'), icon: ThumbsUpIcon },
              { id: 'cost', label: t('cityDetail.costOfLiving'), icon: DollarSignIcon },
              { id: 'reviews', label: t('cityDetail.reviews'), icon: UsersIcon },
              { id: 'visa', label: t('cityDetail.visaInfo'), icon: CalendarIcon },
              { id: 'transport', label: t('cityDetail.transportAccommodation'), icon: PlaneIcon },
              { id: 'places', label: t('cities.nomadPlaces.title'), icon: HeartIcon },
              { id: 'services', label: t('cities.recommendedServices'), icon: GlobeIcon },
              { id: 'photos', label: t('cityDetail.photos'), icon: CameraIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Nomad Place Recommendations */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <HeartIcon className="h-5 w-5 mr-2 text-red-500" />
                    {t('cities.nomadPlaces.title')}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">☕</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">Café Fabrica</h4>
                          <p className="text-sm text-gray-600">{t('cities.nomadPlaces.quietAtmosphere')}, WiFi {t('cities.nomadPlaces.stable')}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600 text-sm font-medium">4.8 ⭐</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">💻</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">Outsite Lisbon</h4>
                          <p className="text-sm text-gray-600">{t('cities.nomadPlaces.coworkingColiving')}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600 text-sm font-medium">4.6 ⭐</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* City Statistics */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <TrendingUpIcon className="h-5 w-5 mr-2 text-blue-600" />
                    {t('cities.statistics')}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-1">4.8</div>
                      <div className="text-sm text-gray-600">{t('cities.rating')}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-1">${city.cost_of_living}</div>
                      <div className="text-sm text-gray-600">{t('cities.costOfLiving')}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 mb-1">{city.wifi_speed} Mbps</div>
                      <div className="text-sm text-gray-600">{t('cities.wifiSpeed')}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 mb-1">{city.visa_days}</div>
                      <div className="text-sm text-gray-600">{t('cities.stayDays')}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pros-cons' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-green-600 mb-4 flex items-center">
                    <ThumbsUpIcon className="h-5 w-5 mr-2" />
                    {t('cityDetail.pros')}
                  </h3>
                  <div className="space-y-3">
                    {prosAndCons.pros.map((pro, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <span className="text-green-500">✓</span>
                        <span className="text-gray-700">{pro}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center">
                    <ThumbsDownIcon className="h-5 w-5 mr-2" />
                    {t('cityDetail.cons')}
                  </h3>
                  <div className="space-y-3">
                    {prosAndCons.cons.map((con, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                        <span className="text-red-500">✗</span>
                        <span className="text-gray-700">{con}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'cost' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">{t('cityDetail.costBreakdown')}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <HomeIcon className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">{t('cityDetail.accommodation')}</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">${costBreakdown.accommodation}</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <UtensilsIcon className="h-5 w-5 text-green-600" />
                        <span className="font-medium">{t('cityDetail.food')}</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">${costBreakdown.food}</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <BusIcon className="h-5 w-5 text-purple-600" />
                        <span className="font-medium">{t('cityDetail.transportation')}</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">${costBreakdown.transportation}</div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <HeartIcon className="h-5 w-5 text-orange-600" />
                        <span className="font-medium">{t('cityDetail.entertainment')}</span>
                      </div>
                      <div className="text-2xl font-bold text-orange-600">${costBreakdown.entertainment}</div>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <WifiIconSolid className="h-5 w-5 text-red-600" />
                        <span className="font-medium">{t('cityDetail.utilities')}</span>
                      </div>
                      <div className="text-2xl font-bold text-red-600">${costBreakdown.utilities}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <GlobeIcon className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">{t('cityDetail.other')}</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-600">${costBreakdown.other}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <UsersIcon className="h-6 w-6 mr-3 text-blue-600" />
                    {t('cityDetail.reviews')}
                  </h3>
                  
                  {getUserReviews().length > 0 ? (
                    <div className="space-y-6">
                      {getUserReviews().map((review) => (
                        <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{review.avatar}</span>
                              <div>
                                <h4 className="font-semibold text-gray-900">{review.user}</h4>
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
                            </div>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquareIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        {t('cityDetail.noReviewsYet')}
                      </h4>
                      <p className="text-gray-600 mb-6">
                        {t('cityDetail.beFirstReviewer')}
                      </p>
                      <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                        {t('cityDetail.writeFirstReview')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'visa' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      签证信息
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('cityDetail.visaType')}</span>
                        <span className="font-medium">{city.visa_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('cityDetail.stayDays')}</span>
                        <span className="font-medium">{city.visa_days} {t('cityDetail.days')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('cityDetail.applicationDifficulty')}</span>
                        <span className="font-medium text-green-600">{t('cityDetail.easy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('cityDetail.applicationFee')}</span>
                        <span className="font-medium">{t('cityDetail.euro25to100')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-green-50 rounded-lg">
                    <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center">
                      <BookOpenIcon className="h-5 w-5 mr-2" />
                      {t('cityDetail.requirements')}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-gray-700">{t('cityDetail.validPassport')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-gray-700">{t('cityDetail.roundTripTicket')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-gray-700">{t('cityDetail.accommodationProof')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-gray-700">{t('cityDetail.financialProof')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 交通 & 住宿 Transport & Accommodation */}
            {activeTab === 'transport' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <h3 className="text-2xl font-bold text-purple-900 mb-6 flex items-center">
                      <PlaneIcon className="h-6 w-6 mr-3" />
                      {t('cityDetail.transportInfo')}
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">{t('cityDetail.airport')}</h4>
                        <p className="text-gray-600 mb-2">{t('cityDetail.lisbonAirport')}</p>
                        <p className="text-sm text-gray-500">{t('cityDetail.about7km')}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">{t('cityDetail.publicTransport')}</h4>
                        <p className="text-gray-600 mb-2">{t('cityDetail.metroBusTram')}</p>
                        <p className="text-sm text-gray-500">{t('cityDetail.monthlyPass')} {t('cityDetail.euro40')}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">{t('cityDetail.taxi')}</h4>
                        <p className="text-gray-600 mb-2">{t('cityDetail.uberBolt')}</p>
                        <p className="text-sm text-gray-500">{t('cityDetail.startingPrice')} {t('cityDetail.euro3')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <h3 className="text-2xl font-bold text-orange-900 mb-6 flex items-center">
                      <HomeIcon className="h-6 w-6 mr-3" />
                      {t('cityDetail.accommodationInfo')}
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">{t('cityDetail.coworkingSpaces')}</h4>
                        <p className="text-gray-600 mb-2">{t('cityDetail.weWorkOutsite')}</p>
                        <p className="text-sm text-gray-500">{t('cityDetail.monthlyFee')} {t('cityDetail.euro200to400')}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">{t('cityDetail.apartmentRental')}</h4>
                        <p className="text-gray-600 mb-2">{t('cityDetail.cityCenter1Bedroom')}</p>
                        <p className="text-sm text-gray-500">{t('cityDetail.monthlyRent')} {t('cityDetail.euro800to1200')}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">{t('cityDetail.hotels')}</h4>
                        <p className="text-gray-600 mb-2">{t('cityDetail.budgetHotels')}</p>
                        <p className="text-sm text-gray-500">{t('cityDetail.perNight')} {t('cityDetail.euro50to100')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 推荐地点 Nomad Places */}
            {activeTab === 'places' && (
              <div className="space-y-8">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <HeartIcon className="h-6 w-6 mr-3 text-red-500" />
                    {t('cities.nomadPlaces.title')}
                  </h3>
                  
                  {/* 分类标签 */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {['all', 'coffee', 'coworking', 'food', 'entertainment'].map((category) => (
                      <button
                        key={category}
                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        {t(`cityDetail.categories.${category}`)}
                      </button>
                    ))}
                  </div>
                  
                  {/* 地点卡片 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getNomadPlaces().map((place) => (
                      <div key={place.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-3xl">{place.icon}</span>
                            <div>
                              <h4 className="font-semibold text-gray-900">{place.name}</h4>
                              <div className="flex items-center space-x-2">
                                <StarIcon className="h-4 w-4 text-yellow-400" />
                                <span className="text-sm font-medium">{place.rating}</span>
                                <span className="text-sm text-gray-500">({place.wifi})</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-600">{place.price}</span>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{place.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {place.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 推荐服务 Recommended Services */}
            {activeTab === 'services' && (
              <div className="space-y-8">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <GlobeIcon className="h-6 w-6 mr-3 text-green-600" />
                    {t('cities.recommendedServices')}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {getRecommendedServices().map((service) => (
                      <div key={service.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">{service.icon}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{service.title}</h4>
                            <p className="text-sm text-gray-600">{service.description}</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <span className="text-lg font-bold text-green-600">{service.price}</span>
                        </div>
                        
                        <a
                          href={service.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          {t('cityDetail.viewDetails')}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}


            {/* 照片库 Photos */}
            {activeTab === 'photos' && (
              <div className="space-y-8">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <CameraIcon className="h-6 w-6 mr-3 text-purple-600" />
                    {t('cityDetail.photos')}
                  </h3>
                  
                  <div className="text-center py-12">
                    <CameraIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      {t('cityDetail.photos')}
                    </h4>
                    <p className="text-gray-600 mb-6">
                      {t('cityDetail.photoUpload.comingSoon')}
                    </p>
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                      {t('cityDetail.photoUpload.uploadPhotos')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Services */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <GlobeIcon className="h-5 w-5 mr-2 text-green-600" />
            {t('cities.recommendedServices')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">🛡️</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('cities.services.insurance')}</p>
                  <p className="text-sm text-gray-600">SafetyWing</p>
                  <p className="text-sm font-medium text-green-600">$42/{t('cities.services.month')}</p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-lg">📋</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('cities.services.visaServices')}</p>
                  <p className="text-sm text-gray-600">iVisa</p>
                  <p className="text-sm font-medium text-green-600">{t('cities.services.from')}$25</p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-lg">💻</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('cities.services.coworkingSpaces')}</p>
                  <p className="text-sm text-gray-600">WeWork</p>
                  <p className="text-sm font-medium text-green-600">{t('cities.services.from')}$200/{t('cities.services.month')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Vote Modal */}
      {showVoteModal && city && (
        <VoteModal
          city={city}
          isOpen={showVoteModal}
          onClose={() => setShowVoteModal(false)}
          onVoteSubmitted={handleVoteSubmitted}
        />
      )}
    </div>
  )
}
