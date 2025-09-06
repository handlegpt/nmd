'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  MapPinIcon, 
  StarIcon, 
  WifiIcon, 
  DollarSignIcon, 
  UsersIcon, 
  ThumbsUpIcon, 
  ThumbsDownIcon,
  ClockIcon,
  PhoneIcon,
  GlobeIcon,
  ArrowLeftIcon
} from 'lucide-react'
import { Place } from '@/lib/supabase'
import { useTranslation } from '@/hooks/useTranslation'
import Link from 'next/link'

export default function PlaceDetailPage() {
  const { t } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const placeId = params.id as string
  
  const [place, setPlace] = useState<Place | null>(null)
  const [loading, setLoading] = useState(true)
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null)

  // Mock place data for now
  const mockPlace: Place = {
    id: placeId,
    name: 'Blue Bottle Coffee',
    category: 'cafe',
    city_id: '1',
    address: '1-1-1 Shinsaibashisuji, Chuo Ward, Osaka, Japan',
    latitude: 34.6937,
    longitude: 135.5023,
    description: '高品质咖啡连锁店，提供稳定的WiFi和安静的工作环境。咖啡品质优秀，是数字游民工作的理想选择。',
    tags: ['quiet', 'good-coffee', 'stable-wifi'],
    wifi_speed: 100,
    price_level: 3,
    noise_level: 'quiet',
    social_atmosphere: 'medium',
    submitted_by: 'user123',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    upvotes: 45,
    downvotes: 2,
    rating: 4.8,
    review_count: 23
  }

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPlace(mockPlace)
      setLoading(false)
    }, 1000)
  }, [placeId])

  const handleVote = (voteType: 'upvote' | 'downvote') => {
    if (place) {
      setUserVote(voteType)
      // Update local state immediately for better UX
      setPlace(prev => {
        if (!prev) return prev
        const newUpvotes = prev.upvotes || 0
        const newDownvotes = prev.downvotes || 0
        
        if (voteType === 'upvote') {
          return {
            ...prev,
            upvotes: newUpvotes + 1,
            downvotes: userVote === 'downvote' ? newDownvotes - 1 : newDownvotes
          }
        } else {
          return {
            ...prev,
            downvotes: newDownvotes + 1,
            upvotes: userVote === 'upvote' ? newUpvotes - 1 : newUpvotes
          }
        }
      })
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      cafe: '☕',
      coworking: '💻',
      coliving: '🏠',
      restaurant: '🍽',
      park: '🌳',
      other: '📍'
    }
    return icons[category as keyof typeof icons] || icons.other
  }

  const getPriceLevelText = (level: number) => {
    return '$'.repeat(level)
  }

  const getNoiseLevelText = (level: string) => {
    const levels = {
      quiet: t('places.details.quiet'),
      moderate: t('places.details.moderate'),
      loud: t('places.details.loud')
    }
    return levels[level as keyof typeof levels] || t('places.details.moderate')
  }

  const getSocialAtmosphereText = (level: string) => {
    const levels = {
      low: t('places.details.low'),
      medium: t('places.details.medium'),
      high: t('places.details.high')
    }
    return levels[level as keyof typeof levels] || t('places.details.medium')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('places.notFound.title')}</h1>
          <Link href="/places" className="text-blue-600 hover:text-blue-700">
            {t('places.notFound.backToList')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{place.name}</h1>
              <p className="text-sm sm:text-base text-gray-600 flex items-center space-x-2">
                <span>{getCategoryIcon(place.category)}</span>
                <span className="truncate">{place.category === 'cafe' ? t('places.categories.cafe') : 
                       place.category === 'coworking' ? t('places.categories.coworking') :
                       place.category === 'coliving' ? t('places.categories.coliving') :
                       place.category === 'hostel' ? t('places.categories.hostel') :
                       place.category === 'hotel' ? t('places.categories.hotel') :
                       place.category === 'restaurant' ? t('places.categories.restaurant') :
                       place.category === 'library' ? t('places.categories.library') :
                       place.category === 'park' ? t('places.categories.park') :
                       place.category === 'university' ? t('places.categories.university') :
                       place.category === 'shopping' ? t('places.categories.shopping') : 
                       t('places.categories.other')}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-3 sm:space-y-0">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{place.name}</h2>
                  <p className="text-sm text-gray-600 flex items-center space-x-2">
                    <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{place.address}</span>
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center space-x-1 mb-1">
                    <StarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-current" />
                    <span className="font-bold text-base sm:text-lg">{place.rating || 0}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">({place.review_count || 0} {t('places.reviews')})</p>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{place.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {place.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Voting */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleVote('upvote')}
                    className={`p-2 rounded-lg transition-colors ${
                      userVote === 'upvote' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                    }`}
                  >
                    <ThumbsUpIcon className="h-4 w-4" />
                  </button>
                  <span className="font-medium">{place.upvotes || 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleVote('downvote')}
                    className={`p-2 rounded-lg transition-colors ${
                      userVote === 'downvote' 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                    }`}
                  >
                    <ThumbsDownIcon className="h-4 w-4" />
                  </button>
                  <span className="font-medium">{place.downvotes || 0}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {t('places.recommendationScore')}: {(place.upvotes || 0) - (place.downvotes || 0)}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('places.details.title')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <WifiIcon className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">{t('places.details.wifiSpeed')}</p>
                    <p className="font-semibold">{place.wifi_speed || 'N/A'} Mbps</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <DollarSignIcon className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">{t('places.details.priceLevel')}</p>
                    <p className="font-semibold">{getPriceLevelText(place.price_level)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <UsersIcon className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">{t('places.details.noiseLevel')}</p>
                    <p className="font-semibold">{getNoiseLevelText(place.noise_level)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <UsersIcon className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-600">{t('places.details.socialAtmosphere')}</p>
                    <p className="font-semibold">{getSocialAtmosphereText(place.social_atmosphere)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">用户评价</h3>
              <div className="space-y-4">
                {/* Mock reviews */}
                <div className="border-b border-gray-100 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm font-medium">JD</span>
                      </div>
                      <span className="font-medium">John Doe</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                    </div>
                  </div>
                  <p className="text-gray-700">
                    非常好的工作环境！WiFi速度快，咖啡品质优秀，座位舒适。适合长时间工作。
                  </p>
                  <p className="text-sm text-gray-500 mt-2">2024-01-15</p>
                </div>

                <div className="border-b border-gray-100 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-sm font-medium">AS</span>
                      </div>
                      <span className="font-medium">Alice Smith</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-gray-300">★</span>
                    </div>
                  </div>
                  <p className="text-gray-700">
                    环境不错，但下午会比较拥挤。建议早点去占位置。
                  </p>
                  <p className="text-sm text-gray-500 mt-2">2024-01-10</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">联系信息</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">营业时间</p>
                    <p className="font-medium">7:00 - 22:00</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">电话</p>
                    <p className="font-medium">+81-6-1234-5678</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <GlobeIcon className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">网站</p>
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-700">
                      bluebottlecoffee.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Similar Places */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">类似地点</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">☕</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Starbucks Reserve</p>
                    <p className="text-xs text-gray-600">4.5 ★ (156)</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">💻</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">WeWork Osaka</p>
                    <p className="text-xs text-gray-600">4.7 ★ (89)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">快速操作</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  导航到这里
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                  分享给朋友
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                  写评价
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
