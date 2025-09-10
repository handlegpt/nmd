'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { getPlaces, getCities } from '@/lib/api'
import { PlaceDataService } from '@/lib/placeDataService'
import { Place, PlaceReview } from '@/lib/supabase'
import { parsePlaceUrl } from '@/lib/urlUtils'
import PageLayout from '@/components/PageLayout'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import { logInfo, logError } from '@/lib/logger'
import { 
  StarIcon, 
  WifiIcon, 
  MapPinIcon, 
  ClockIcon, 
  PhoneIcon, 
  GlobeIcon,
  ZapIcon,
  UsersIcon,
  CameraIcon,
  HeartIcon,
  ShareIcon,
  CheckIcon,
  PlusIcon,
  ArrowLeftIcon
} from 'lucide-react'

// 标签映射函数：将带空格的标签名映射到翻译键
const getTagTranslationKey = (tag: string): string => {
  const tagMap: Record<string, string> = {
    'Good Coffee': 'goodCoffee',
    'Convenient Location': 'convenientLocation', 
    'Good Community': 'goodCommunity',
    'Fast WiFi': 'fastWifi',
    'Quiet': 'quiet',
    'Reasonable Price': 'reasonablePrice',
    'Well Equipped': 'wellEquipped',
    'Beautiful View': 'beautifulView',
    'Good Food': 'goodFood',
    'Good Service': 'goodService',
    '24 Hours': 'open24Hours',
    'Pet Friendly': 'petFriendly'
  }
  return tagMap[tag] || tag
}

// 获取类别图标
const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    cafe: '☕',
    coworking: '💻',
    coliving: '🏠',
    hostel: '🛏️',
    hotel: '🏨',
    restaurant: '🍽️',
    library: '📚',
    park: '🌳',
    university: '🎓',
    shopping: '🛍️',
    other: '📍'
  }
  return icons[category] || '📍'
}

// 获取价格级别显示
const getPriceDisplay = (level: number): string => {
  return '$'.repeat(level)
}

// 获取WiFi稳定性显示
const getWifiStabilityDisplay = (stability?: string): string => {
  const stabilityMap: Record<string, string> = {
    poor: 'Poor',
    fair: 'Fair', 
    good: 'Good',
    excellent: 'Excellent'
  }
  return stabilityMap[stability || 'good'] || 'Good'
}

// 获取WiFi稳定性颜色
const getWifiStabilityColor = (stability?: string): string => {
  const colorMap: Record<string, string> = {
    poor: 'text-red-600',
    fair: 'text-orange-600',
    good: 'text-green-600', 
    excellent: 'text-green-700'
  }
  return colorMap[stability || 'good'] || 'text-green-600'
}

// 模拟评论数据（实际应该从API获取）
const mockReviews: PlaceReview[] = [
  {
    id: '1',
    place_id: 'sample-1',
    user_id: 'user-1',
    user_name: 'Alice',
    user_avatar: '',
    rating_wifi: 5,
    rating_environment: 4,
    rating_social: 3,
    rating_value: 4,
    overall_rating: 4,
    comment: '插座多，很适合工作，下午稍微吵。WiFi速度很快，咖啡也不错。',
    check_in_date: '2024-01-15',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2', 
    place_id: 'sample-1',
    user_id: 'user-2',
    user_name: 'John',
    user_avatar: '',
    rating_wifi: 4,
    rating_environment: 5,
    rating_social: 4,
    rating_value: 4,
    overall_rating: 4.25,
    comment: '咖啡好喝，空间大。适合长时间工作，插座充足。',
    check_in_date: '2024-01-10',
    created_at: '2024-01-10T14:30:00Z',
    updated_at: '2024-01-10T14:30:00Z'
  }
]

export default function PlaceDetailPage() {
  const { t } = useTranslation()
  const params = useParams()
  const { city, place } = params
  
  const [placeData, setPlaceData] = useState<Place | null>(null)
  const [reviews, setReviews] = useState<PlaceReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddReview, setShowAddReview] = useState(false)
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [cities, setCities] = useState<any[]>([])

  useEffect(() => {
    fetchPlaceData()
  }, [city, place])

  const fetchPlaceData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // 从URL参数中解析城市和地点信息
      const citySlug = Array.isArray(city) ? city[0] : city
      const placeSlug = Array.isArray(place) ? place[0] : place
      
      logInfo('Fetching place data', { citySlug, placeSlug }, 'PlaceDetailPage')
      
      // 获取城市数据用于UUID到城市名称的映射
      const citiesData = await getCities()
      setCities(citiesData)
      
      // 获取所有地点数据：先检查本地存储，再检查Supabase
      const localPlaces = PlaceDataService.getLocalPlaces()
      const supabasePlaces = await getPlaces()
      
      // 合并本地和Supabase数据，去重
      const allPlaces = [...localPlaces, ...supabasePlaces]
      const uniquePlaces = allPlaces.filter((place, index, self) => 
        index === self.findIndex(p => p.id === place.id)
      )
      
      // 根据城市和地点名称查找匹配的地点
      const matchedPlace = uniquePlaces.find(p => {
        let placeCitySlug = ''
        
        if (p.city_id && typeof p.city_id === 'string') {
          // 如果是UUID格式的city_id，需要查找对应的城市名称
          if (p.city_id.includes('-') && p.city_id.length > 20) {
            // 这是UUID格式，从cities数据中查找对应的城市名称
            const city = citiesData.find(c => c.id === p.city_id)
            if (city) {
              placeCitySlug = city.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
            }
          } else {
            // 这是城市名称格式
            placeCitySlug = p.city_id.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
          }
        }
        
        const placeNameSlug = p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
        
        return placeCitySlug === citySlug && placeNameSlug === placeSlug
      })
      
      if (matchedPlace) {
        setPlaceData(matchedPlace)
        setReviews(mockReviews) // 实际应该从API获取
        logInfo('Place found', { place: matchedPlace.name, source: matchedPlace.id.startsWith('local-') ? 'local' : 'supabase' }, 'PlaceDetailPage')
      } else {
        setError('Place not found')
        logInfo('Place not found', { citySlug, placeSlug, totalPlaces: uniquePlaces.length }, 'PlaceDetailPage')
      }
    } catch (error) {
      logError('Error fetching place data', error, 'PlaceDetailPage')
      setError('Failed to load place data')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = () => {
    // TODO: 实现Check-in功能
    console.log('Check-in clicked')
  }

  const handleAddReview = () => {
    setShowAddReview(true)
  }

  const handleUploadPhoto = () => {
    setShowPhotoUpload(true)
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </PageLayout>
    )
  }

  if (error || !placeData) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <ErrorMessage 
            title="Place Not Found"
            message={error || 'The place you are looking for does not exist.'}
          />
        </div>
      </PageLayout>
    )
  }

  // 计算平均评分
  const avgWifiRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating_wifi, 0) / reviews.length : 0
  const avgEnvironmentRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating_environment, 0) / reviews.length : 0
  const avgSocialRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating_social, 0) / reviews.length : 0
  const avgValueRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating_value, 0) / reviews.length : 0

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => window.history.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back
        </button>

        {/* Header with Cover Photo */}
        <div className="relative mb-8">
          <div className="h-64 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            {placeData.cover_photo ? (
              <img 
                src={placeData.cover_photo} 
                alt={placeData.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="text-white text-center">
                <div className="text-6xl mb-4">{getCategoryIcon(placeData.category)}</div>
                <div className="text-2xl font-bold">{placeData.name}</div>
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <button className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-lg">
              <HeartIcon className="h-5 w-5" />
            </button>
            <button className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-lg">
              <ShareIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {placeData.name}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                      {placeData.rating?.toFixed(1) || '4.6'}
                    </span>
                    <span className="flex items-center">
                      <WifiIcon className="h-4 w-4 text-blue-500 mr-1" />
                      {placeData.wifi_speed || 120}Mbps
                    </span>
                    <span className="flex items-center">
                      <span className="text-green-600 mr-1">¥</span>
                      {placeData.average_spend || '500~800'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Category</div>
                  <div className="text-lg font-semibold capitalize">{placeData.category}</div>
                </div>
              </div>

              {/* Quick Tags */}
              <div className="flex flex-wrap gap-2">
                {placeData.tags?.slice(0, 4).map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {t(`recommendationForm.place.suggestedTags.${getTagTranslationKey(tag)}`) || tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Detailed Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📍 Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">{placeData.address}</span>
                  </div>
                  {placeData.opening_hours && (
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-700">{placeData.opening_hours}</span>
                    </div>
                  )}
                  {placeData.phone && (
                    <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-700">{placeData.phone}</span>
                    </div>
                  )}
                  {placeData.website && (
                    <div className="flex items-center">
                      <GlobeIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <a href={placeData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Website
                      </a>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <WifiIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">
                      {placeData.wifi_speed || 120}Mbps • {getWifiStabilityDisplay(placeData.wifi_stability)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <ZapIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">
                      {placeData.socket_count || 'Many'} outlets
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-3">💰</span>
                    <span className="text-gray-700">
                      {getPriceDisplay(placeData.price_level)} • {placeData.average_spend || '¥500~¥800'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">
                {placeData.description || "Here, you can just order a cup of coffee and stay as long as you like. Perfect for digital nomads looking for a comfortable workspace."}
              </p>
            </div>

            {/* User Ratings Breakdown */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 User Ratings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">WiFi Speed</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: `${(avgWifiRating / 5) * 100}%`}}></div>
                      </div>
                      <span className="text-sm font-medium">{avgWifiRating.toFixed(1)}/5</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Environment</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: `${(avgEnvironmentRating / 5) * 100}%`}}></div>
                      </div>
                      <span className="text-sm font-medium">{avgEnvironmentRating.toFixed(1)}/5</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Social Atmosphere</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div className="bg-purple-500 h-2 rounded-full" style={{width: `${(avgSocialRating / 5) * 100}%`}}></div>
                      </div>
                      <span className="text-sm font-medium">{avgSocialRating.toFixed(1)}/5</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Value for Money</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div className="bg-orange-500 h-2 rounded-full" style={{width: `${(avgValueRating / 5) * 100}%`}}></div>
                      </div>
                      <span className="text-sm font-medium">{avgValueRating.toFixed(1)}/5</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* User Reviews */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">💬 Reviews</h2>
                <button 
                  onClick={handleAddReview}
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Review
                </button>
              </div>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {review.user_name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{review.user_name}</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon 
                                key={i} 
                                className={`h-4 w-4 ${i < Math.floor(review.overall_rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{review.comment}</p>
                        {review.check_in_date && (
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <CheckIcon className="h-3 w-3 mr-1" />
                            Checked in on {new Date(review.check_in_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Photo Gallery */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">📸 Photos</h2>
                <button 
                  onClick={handleUploadPhoto}
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <CameraIcon className="h-4 w-4 mr-1" />
                  Upload Photo
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {placeData.photos?.map((photo, index) => (
                  <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    <img src={photo} alt={`${placeData.name} photo ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                )) || (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No photos yet. Be the first to upload one!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Check-in & Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nomad Community</h3>
              <div className="space-y-4">
                <button 
                  onClick={handleCheckIn}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center"
                >
                  <CheckIcon className="h-5 w-5 mr-2" />
                  Check In
                </button>
                <div className="text-center text-sm text-gray-600">
                  {placeData.check_in_count || 0} nomads have checked in here
                </div>
                <div className="flex space-x-2">
                  <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm">
                    <UsersIcon className="h-4 w-4 mx-auto mb-1" />
                    Meetup
                  </button>
                  <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm">
                    <ShareIcon className="h-4 w-4 mx-auto mb-1" />
                    Share
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Overall Rating</span>
                  <span className="font-medium">{placeData.rating?.toFixed(1) || '4.6'}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reviews</span>
                  <span className="font-medium">{reviews.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">WiFi Speed</span>
                  <span className="font-medium">{placeData.wifi_speed || 120} Mbps</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price Level</span>
                  <span className="font-medium">{getPriceDisplay(placeData.price_level)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Noise Level</span>
                  <span className="font-medium capitalize">{placeData.noise_level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Social Level</span>
                  <span className="font-medium capitalize">{placeData.social_atmosphere}</span>
                </div>
              </div>
            </div>

            {/* Suitable For */}
            {placeData.suitable_for && placeData.suitable_for.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Suitable For</h3>
                <div className="flex flex-wrap gap-2">
                  {placeData.suitable_for.map((activity, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                    >
                      {activity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}