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
  MapPinIcon, StarIcon, WifiIcon, DollarSignIcon, UsersIcon, 
  PlusIcon, FilterIcon, MapIcon
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { Place } from '@/lib/supabase'
import { generatePlaceUrl } from '@/lib/urlUtils'
import FixedLink from '@/components/FixedLink'
import UniversalRecommendationForm from '@/components/UniversalRecommendationForm'
import { useNotifications } from '@/contexts/GlobalStateContext'
import { PlaceDataService, UserLocation } from '@/lib/placeDataService'
import { PLACE_CATEGORIES, getCategoryIcon, getCategoryName, getCategoryColor } from '@/lib/placeCategories'
import { getRecommendedPlacesForCity, getRecommendedCategoriesForCity } from '@/lib/citySpecificPlaces'
import { logInfo, logError } from '@/lib/logger'

interface CityPlacesSectionProps {
  cityName: string
  cityCountry: string
}

export default function CityPlacesSection({ cityName, cityCountry }: CityPlacesSectionProps) {
  const { t } = useTranslation()
  const { addNotification } = useNotifications()
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)

  useEffect(() => {
    loadCityPlaces()
    loadUserLocation()
  }, [cityName])

  const loadCityPlaces = () => {
    setLoading(true)
    try {
      // 获取用户添加的该城市地点
      const userPlaces = PlaceDataService.getPlacesByCity(cityName)
      
      // 获取城市特定推荐地点
      const recommendedPlaces = getRecommendedPlacesForCity(cityName, userPlaces)
      
      setPlaces(recommendedPlaces)
    } catch (error) {
      logError('Error loading city places', error, 'CityPlacesSection')
    } finally {
      setLoading(false)
    }
  }

  const loadUserLocation = () => {
    const location = PlaceDataService.getUserLocation()
    setUserLocation(location)
  }

  const handleAddPlace = async (placeData: any) => {
    try {
      const newPlace: Place = {
        id: `local-${Date.now()}`,
        name: placeData.name,
        category: placeData.category,
        address: placeData.address || `${cityName}, ${cityCountry}`,
        description: placeData.description || '',
        tags: placeData.tags || [],
        wifi_speed: placeData.wifi_speed || undefined,
        price_level: placeData.price_level || 1,
        noise_level: placeData.noise_level || 'moderate',
        social_atmosphere: placeData.social_atmosphere || 'moderate',
        city_id: cityName,
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

      PlaceDataService.addLocalPlace(newPlace)
      setPlaces(prev => [newPlace, ...prev])
      
      addNotification({
        type: 'success',
        message: t('recommendationForm.submitSuccess')
      })
      
      setShowAddForm(false)
    } catch (error) {
      logError('Error adding place', error, 'CityPlacesSection')
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
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const filteredPlaces = places.filter(place => 
    selectedCategory === 'all' || place.category === selectedCategory
  )

  // 获取城市特定的推荐分类
  const recommendedCategories = getRecommendedCategoriesForCity(cityName)

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MapPinIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t('cityDetail.recommendedPlaces')} - {cityName}</h2>
            <p className="text-sm text-gray-600">{t('cityDetail.recommendedPlacesDescription')} {cityName}</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Place</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <FilterIcon className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filter by category:</span>
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
            All ({places.length})
          </button>
          {PLACE_CATEGORIES.slice(0, 6).map((category) => {
            const count = places.filter(place => place.category === category.id).length
            const isRecommended = recommendedCategories.includes(category.id)
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : isRecommended
                    ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                    : category.color
                }`}
              >
                {category.icon} {category.name} ({count})
                {isRecommended && (
                  <span className="ml-1 text-xs">⭐</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Places Grid */}
      {filteredPlaces.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-3">📍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No places found</h3>
          <p className="text-gray-600 mb-4">Be the first to recommend a place in {cityName}!</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Place</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlaces.map((place) => (
            <FixedLink
              key={place.id}
              href={generatePlaceUrl(place)}
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getCategoryIcon(place.category)}</span>
                  <span className="text-xs text-gray-500">{getCategoryName(place.category)}</span>
                  {place.id.startsWith('local-') && (
                    <span className="px-1 py-0.5 bg-green-100 text-green-700 text-xs rounded">New</span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <StarIcon className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{place.rating || 0}</span>
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{place.name}</h3>
              
              <div className="space-y-1 text-xs text-gray-600">
                {place.wifi_speed && (
                  <div className="flex items-center space-x-1">
                    <WifiIcon className="h-3 w-3" />
                    <span>{place.wifi_speed} Mbps</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <DollarSignIcon className="h-3 w-3" />
                  <span>{getPriceLevelText(place.price_level)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <UsersIcon className="h-3 w-3" />
                  <span>{(place.upvotes || 0) - (place.downvotes || 0)} recommendations</span>
                </div>
              </div>

              {place.tags && place.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {place.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {t(`recommendationForm.place.suggestedTags.${getTagTranslationKey(tag)}`) || tag}
                    </span>
                  ))}
                </div>
              )}
            </FixedLink>
          ))}
        </div>
      )}

      {/* Universal Recommendation Form */}
      <UniversalRecommendationForm
        type="place"
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleAddPlace}
      />
    </div>
  )
}
