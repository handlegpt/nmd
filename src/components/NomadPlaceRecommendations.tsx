'use client'

import { useState, useEffect } from 'react'

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
import { 
  MapPinIcon,
  StarIcon,
  WifiIcon,
  DollarSignIcon,
  UsersIcon,
  ArrowRightIcon,
  PlusIcon,
  MapIcon,
  FilterIcon
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { getPlacesByCity, getCities, getPlaces } from '@/lib/api'
import { Place, City } from '@/lib/supabase'
import { generatePlaceUrlSimple } from '@/lib/urlUtils'
import FixedLink from '@/components/FixedLink'
import UniversalRecommendationForm from '@/components/UniversalRecommendationForm'
import { useNotifications } from '@/contexts/GlobalStateContext'
import { logWarn, logError } from '@/lib/logger'
import { PlaceDataService, UserLocation } from '@/lib/placeDataService'
import { PLACE_CATEGORIES, getCategoryIcon, getCategoryName, getCategoryColor } from '@/lib/placeCategories'
import GeolocationPermissionGuide from '@/components/GeolocationPermissionGuide'

export default function NomadPlaceRecommendations() {
  const { t } = useTranslation()
  const { addNotification } = useNotifications()
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showPermissionGuide, setShowPermissionGuide] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [showLocationDetection, setShowLocationDetection] = useState(false)
  const [cities, setCities] = useState<City[]>([])

  useEffect(() => {
    loadCities()
    loadTopPlaces()
    loadUserLocation()
  }, [])

  const loadCities = async () => {
    try {
      const citiesData = await getCities()
      setCities(citiesData)
    } catch (error) {
      logError('Error loading cities', error, 'NomadPlaceRecommendations')
    }
  }

  const getCityName = (cityId: string): string => {
    if (!cityId || cityId === 'Unknown City') return 'Unknown City'
    
    // 如果cityId看起来像UUID，尝试从cities数组中查找
    if (cityId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const city = cities.find(c => c.id === cityId)
      return city ? `${city.name}, ${city.country}` : 'Unknown City'
    }
    
    // 如果cityId已经是城市名称，直接返回
    return cityId
  }

  const loadTopPlaces = async () => {
    setLoading(true)
    try {
      // 获取本地存储的地点
      const localPlaces = PlaceDataService.getLocalPlaces()
      
      // 获取Supabase的地点数据
      const supabasePlaces = await getPlaces()
      
      // 合并数据并去重
      const allPlaces = [...localPlaces, ...supabasePlaces]
      const uniquePlaces = allPlaces.filter((place, index, self) => 
        index === self.findIndex(p => p.id === place.id)
      )
      
      // 如果有用户位置，优先显示该城市的地点
      if (userLocation) {
        const cityPlaces = uniquePlaces.filter(place => 
          place.city_id.toLowerCase().includes(userLocation.city.toLowerCase())
        )
        const topPlaces = cityPlaces
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 6)
        setPlaces(topPlaces)
      } else {
        // 否则显示所有热门地点
        const topPlaces = uniquePlaces
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 6)
        setPlaces(topPlaces)
      }
    } catch (error) {
      logError('Error loading places', error, 'NomadPlaceRecommendations')
      // 如果出错，至少显示本地数据
      const localPlaces = PlaceDataService.getLocalPlaces()
      setPlaces(localPlaces.slice(0, 6))
    } finally {
      setLoading(false)
    }
  }

  const loadUserLocation = () => {
    const location = PlaceDataService.getUserLocation()
    setUserLocation(location)
  }

  const detectUserLocation = () => {
    setShowLocationDetection(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // 使用反向地理编码获取城市信息
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
            )
            const data = await response.json()
            
            const location: UserLocation = {
              city: data.city || 'Unknown City',
              country: data.countryName || 'Unknown Country',
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              timestamp: Date.now()
            }
            
            PlaceDataService.saveUserLocation(location)
            setUserLocation(location)
            setShowLocationDetection(false)
            
            // 重新加载地点数据
            loadTopPlaces()
            
            addNotification({
              type: 'success',
              message: `Location detected: ${location.city}, ${location.country}`
            })
          } catch (error) {
            logError('Error detecting location', error, 'NomadPlaceRecommendations')
            setShowLocationDetection(false)
            addNotification({
              type: 'error',
              message: 'Failed to detect location'
            })
          }
        },
        (error) => {
          setShowLocationDetection(false)
          logError('Geolocation error', error, 'NomadPlaceRecommendations')
          
          let errorMessage = 'Location access denied'
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.'
            setLocationError(errorMessage)
            setShowPermissionGuide(true)
          }
          
          addNotification({
            type: 'error',
            message: errorMessage
          })
        }
      )
    } else {
      setShowLocationDetection(false)
      addNotification({
        type: 'error',
        message: 'Geolocation not supported'
      })
    }
  }

  const handleAddPlace = async (placeData: any) => {
    try {
      // 创建新的地点对象
      const newPlace: Place = {
        id: `local-${Date.now()}`,
        name: placeData.name,
        category: placeData.category,
        address: placeData.address || '',
        description: placeData.description || '',
        tags: placeData.tags || [],
        wifi_speed: placeData.wifi_speed || undefined,
        price_level: placeData.price_level || 1,
        noise_level: placeData.noise_level || 'moderate',
        social_atmosphere: placeData.social_atmosphere || 'moderate',
        city_id: userLocation?.city || 'Unknown City',
        latitude: 0,
        longitude: 0,
        submitted_by: placeData.submitted_by || 'Anonymous',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        rating: 0,
        review_count: 0,
        upvotes: 0,
        downvotes: 0
      }

      // 使用新的数据服务保存
      PlaceDataService.addLocalPlace(newPlace)

      // 更新当前显示的地点列表
      setPlaces(prev => [newPlace, ...prev.slice(0, 5)])
      
      addNotification({
        type: 'success',
        message: t('recommendationForm.submitSuccess')
      })
      
      setShowAddForm(false)
    } catch (error) {
      console.error('Error adding place:', error)
      addNotification({
        type: 'error',
        message: t('recommendationForm.submitError')
      })
    }
  }



  const getPriceLevelText = (level: number) => {
    return '$'.repeat(level)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <MapPinIcon className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t('places.title')}</h2>
            <p className="text-sm text-gray-600">
              {userLocation 
                ? `Recommendations for ${userLocation.city}, ${userLocation.country}`
                : t('places.description')
              }
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {!userLocation && (
            <button
              onClick={detectUserLocation}
              disabled={showLocationDetection}
              className="flex items-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
            >
              <MapIcon className="h-4 w-4" />
              <span>{showLocationDetection ? 'Detecting...' : 'Detect Location'}</span>
            </button>
          )}
          <FixedLink
            href="/nomadplaces"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <span>{t('common.viewDetails')}</span>
            <ArrowRightIcon className="h-4 w-4" />
          </FixedLink>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <PlusIcon className="h-4 w-4" />
            <span>{t('places.addPlace')}</span>
          </button>
        </div>
      </div>

      {/* Enhanced Filter and Sort - Professional Tool Style */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
          {/* Category Filter - Multi-select */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FilterIcon className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{t('places.filterByCategory')}:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('places.all')}
              </button>
              {PLACE_CATEGORIES.slice(0, 6).map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : category.color
                  }`}
                >
                  {category.icon} {t(category.translationKey)}
                </button>
              ))}
            </div>
          </div>

          {/* Region Filter */}
          <div className="lg:w-32">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('places.filterByRegion')}</label>
            <select className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>{t('places.allRegions')}</option>
              <option>{t('places.asia')}</option>
              <option>{t('places.europe')}</option>
              <option>{t('places.americas')}</option>
            </select>
          </div>

          {/* Sort Options */}
          <div className="lg:w-40">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('places.sortBy')}</label>
            <select className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="rating">{t('places.sortByRating')} ↓</option>
              <option value="speed">{t('places.sortBySpeed')} ↓</option>
              <option value="price">{t('places.sortByPrice')} ↑</option>
            </select>
          </div>
        </div>
      </div>

            {/* Enhanced Places Grid - Consistent Card Heights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {places
          .filter(place => selectedCategory === 'all' || place.category === selectedCategory)
          .map((place) => (
          <div
            key={place.id}
            className="bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] shadow-sm h-80 flex flex-col"
          >
            {/* Card Header - Fixed Height */}
            <div className="p-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getCategoryIcon(place.category)}</span>
                  <span className="text-xs text-gray-500">{getCategoryName(place.category)}</span>
                  {place.id.startsWith('local-') && (
                    <span className="px-1 py-0.5 bg-green-100 text-green-700 text-xs rounded">New</span>
                  )}
                </div>
                {/* Rating - Fixed Position Top Right */}
                <div className="flex items-center space-x-1">
                  <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-bold">{place.rating?.toFixed(1) || '—'}</span>
                </div>
              </div>
              
              {/* Title - Two Line Truncation */}
              <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 h-10">
                {place.name}
              </h3>
              
              {/* Location Badge */}
              {place.city_id && place.city_id !== 'Unknown City' && (
                <div className="mt-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    📍 {getCityName(place.city_id)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Core Metrics - Unified Badge Style */}
            <div className="p-4 flex-1 space-y-3">
              {/* Primary Metrics Row */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-500">📶</span>
                  <span className="font-medium">
                    {place.wifi_speed ? `${place.wifi_speed} Mbps` : '—'}
                  </span>
                  {place.wifi_speed && (
                    <span className="text-xs text-gray-500">
                      ({t('places.community')})
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-500">💲</span>
                  <span className="font-medium">{getPriceLevelText(place.price_level)}</span>
                </div>
              </div>
              
              {/* Secondary Metrics Row */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">👥</span>
                  <span className="font-medium">
                    {(place.upvotes || 0) - (place.downvotes || 0)} {t('places.recommendations')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-purple-500">🕐</span>
                  <span className="font-medium text-green-600">{t('places.openNow')}</span>
                </div>
              </div>
              
              {/* Work Friendliness Icons */}
              <div className="flex items-center space-x-3 pt-2">
                <div className="flex items-center space-x-1">
                  <span className="text-lg text-gray-300">
                    🔌
                  </span>
                  <span className="text-xs text-gray-600">{t('places.outlets')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-lg text-gray-300">
                    🪑
                  </span>
                  <span className="text-xs text-gray-600">{t('places.seating')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-lg text-gray-300">
                    🔈
                  </span>
                  <span className="text-xs text-gray-600">{t('places.noise')}</span>
                </div>
              </div>
              
              {/* Tags - Limited to 2, with +N */}
              {place.tags && place.tags.length > 0 && (
                <div className="flex items-center space-x-2 pt-2">
                  {place.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {t(`recommendationForm.place.suggestedTags.${getTagTranslationKey(tag)}`) || tag}
                    </span>
                  ))}
                  {place.tags.length > 2 && (
                    <span className="text-xs text-gray-500">+{place.tags.length - 2}</span>
                  )}
                </div>
              )}
            </div>
            
            {/* Action Buttons - Fixed at Bottom */}
            <div className="p-4 pt-0 flex-shrink-0">
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center space-x-2">
                  <StarIcon className="h-3 w-3" />
                  <span>{t('places.evaluate')}</span>
                </button>
                <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors">
                  ↗
                </button>
              </div>
              
              {/* Secondary Actions */}
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <FixedLink
                  href={generatePlaceUrlSimple(place)}
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  {t('places.viewDetails')}
                </FixedLink>
                <button className="text-gray-500 hover:text-red-500">
                  🚩
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {places.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-3">📍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('places.noResults.title')}</h3>
          <p className="text-gray-600 mb-4">{t('places.noResults.description')}</p>
          <FixedLink
            href="/nomadplaces"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            <span>{t('places.addPlace')}</span>
          </FixedLink>
        </div>
      )}

      {/* Categories Quick Access */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">{t('places.quickBrowse')}</h4>
        <div className="flex flex-wrap gap-2">
          {PLACE_CATEGORIES.slice(0, 6).map((category) => (
            <FixedLink
              key={category.id}
              href={`/nomadplaces?category=${category.id}`}
              className={`px-3 py-1 rounded-full text-sm font-medium hover:opacity-80 transition-opacity ${category.color}`}
            >
              {category.icon} {t(category.translationKey)}
            </FixedLink>
          ))}
        </div>
      </div>

      {/* Universal Recommendation Form */}
      <UniversalRecommendationForm
        type="place"
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleAddPlace}
      />

      {/* Geolocation Permission Guide */}
      <GeolocationPermissionGuide
        isOpen={showPermissionGuide}
        onClose={() => {
          setShowPermissionGuide(false)
          setLocationError(null)
        }}
        onRetry={() => {
          setShowPermissionGuide(false)
          setLocationError(null)
          detectUserLocation()
        }}
        error={locationError}
      />
    </div>
  )
}
