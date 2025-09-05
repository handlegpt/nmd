'use client'

import { useState, useEffect } from 'react'
import { 
  MapPinIcon,
  SearchIcon,
  FilterIcon,
  PlusIcon,
  GridIcon,
  ListIcon,
  StarIcon,
  WifiIcon,
  DollarSignIcon,
  UsersIcon,
  MonitorIcon,
  HomeIcon,
  UtensilsIcon,
  TreePine,
  ArrowRightIcon
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useNotifications } from '@/contexts/GlobalStateContext'
import { logInfo } from '@/lib/logger'
import { getPlacesByCity, getCategoryIcon, getCategoryName, getPriceLevelText, getNoiseLevelText, getSocialAtmosphereText } from '@/lib/api'
import { Place } from '@/lib/supabase'
import AddPlaceForm from './AddPlaceForm'

interface PlaceRecommendationsProps {
  cityId: string
  limit?: number
}

export default function PlaceRecommendations({ cityId, limit }: PlaceRecommendationsProps) {
  const { t } = useTranslation()
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'rating' | 'recent' | 'popular'>('rating')
  const [showAddForm, setShowAddForm] = useState(false)
  const { addNotification } = useNotifications()

  useEffect(() => {
    loadPlaces()
  }, [cityId])

  const loadPlaces = async () => {
    setLoading(true)
    try {
      const data = await getPlacesByCity(cityId)
      // Transform the data to match our local Place interface
      const transformedData: Place[] = data.map((item: any) => ({
        ...item,
        upvotes: item.upvotes || 0,
        downvotes: item.downvotes || 0,
        rating: item.rating || 0,
        review_count: item.review_count || 0
      }))
      setPlaces(transformedData)
    } catch (error) {
      console.error('Error loading places:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPlaces = places.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         place.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedPlaces = [...filteredPlaces].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.rating || 0) - (a.rating || 0)
      case 'recent':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'popular':
        return ((b.upvotes || 0) - (b.downvotes || 0)) - ((a.upvotes || 0) - (a.downvotes || 0))
      default:
        return 0
    }
  })

  const displayedPlaces = limit ? sortedPlaces.slice(0, limit) : sortedPlaces

  const categories = [
    { id: 'all', name: t('places.categories.all'), icon: <MapPinIcon className="h-4 w-4" /> },
    { id: 'cafe', name: t('places.categories.cafe'), icon: <MapPinIcon className="h-4 w-4" /> },
    { id: 'coworking', name: t('places.categories.coworking'), icon: <MonitorIcon className="h-4 w-4" /> },
    { id: 'coliving', name: t('places.categories.coliving'), icon: <HomeIcon className="h-4 w-4" /> },
    { id: 'restaurant', name: t('places.categories.restaurant'), icon: <UtensilsIcon className="h-4 w-4" /> },
    { id: 'park', name: t('places.categories.park'), icon: <TreePine className="h-4 w-4" /> }
  ]

  const sortOptions = [
    { value: 'rating', label: t('places.sortBy.rating') },
    { value: 'recent', label: t('places.sortBy.recent') },
    { value: 'popular', label: t('places.sortBy.popular') }
  ]

  const handleAddPlace = async (placeData: any) => {
    try {
      logInfo('Adding new place', placeData, 'PlaceRecommendations')
      
      // 创建新的地点对象
      const newPlace: Place = {
        id: `temp-${Date.now()}`,
        name: placeData.name,
        category: placeData.category,
        address: placeData.address,
        description: placeData.description,
        tags: placeData.tags || [],
        wifi_speed: placeData.wifi_speed,
        price_level: placeData.price_level,
        noise_level: placeData.noise_level,
        social_atmosphere: placeData.social_atmosphere,
        city_id: cityId,
        latitude: placeData.latitude ? parseFloat(placeData.latitude) : 0,
        longitude: placeData.longitude ? parseFloat(placeData.longitude) : 0,
        submitted_by: placeData.submitted_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // 添加到本地状态
      setPlaces(prev => [newPlace, ...prev])
      setShowAddForm(false)
      
      addNotification({
        type: 'success',
        message: t('places.addPlaceSuccess', { placeName: placeData.name })
      })
    } catch (error) {
      addNotification({
        type: 'error',
        message: t('places.addPlaceError')
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading places...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{t('places.title')}</h3>
          <p className="text-sm text-gray-600">{t('places.description')}</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <PlusIcon className="h-4 w-4" />
          <span>{t('places.addPlace')}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('places.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.icon}
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* View Mode */}
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 transition-colors ${
              viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <GridIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 transition-colors ${
              viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ListIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Places Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedPlaces.map((place) => (
            <div key={place.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getCategoryIcon(place.category)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{place.name}</h3>
                      <p className="text-sm text-gray-600">{getCategoryName(place.category)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <StarIcon className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm font-medium">{place.rating || 0}</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{place.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    {place.wifi_speed && (
                      <div className="flex items-center space-x-1">
                        <WifiIcon className="h-4 w-4" />
                        <span>{place.wifi_speed} Mbps</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <DollarSignIcon className="h-4 w-4" />
                      <span>{getPriceLevelText(place.price_level)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <UsersIcon className="h-4 w-4" />
                    <span>{place.review_count || 0} {t('places.reviews')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedPlaces.map((place) => (
            <div key={place.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl">{getCategoryIcon(place.category)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{place.name}</h3>
                    <p className="text-sm text-gray-600">{getCategoryName(place.category)}</p>
                    <p className="text-gray-600 text-sm mt-1">{place.address}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <StarIcon className="h-4 w-4 text-yellow-400" />
                      <span className="font-medium">{place.rating || 0}</span>
                    </div>
                    <p className="text-sm text-gray-500">{place.review_count || 0} {t('places.reviews')}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {place.wifi_speed && (
                        <div className="flex items-center space-x-1">
                          <WifiIcon className="h-4 w-4" />
                          <span>{place.wifi_speed} Mbps</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <DollarSignIcon className="h-4 w-4" />
                        <span>{getPriceLevelText(place.price_level)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {displayedPlaces.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <MapPinIcon className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('places.noResults.title')}</h3>
          <p className="text-gray-600">{t('places.noResults.description')}</p>
        </div>
      )}

      {/* View All Button */}
      {limit && sortedPlaces.length > limit && (
        <div className="text-center">
          <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center mx-auto">
            {t('places.viewAll', { count: String(sortedPlaces.length) })}
            <ArrowRightIcon className="h-4 w-4 ml-1" />
          </button>
        </div>
      )}

             {/* Add Place Form Modal */}
       {showAddForm && (
         <AddPlaceForm
           isOpen={showAddForm}
           onClose={() => setShowAddForm(false)}
           onSubmit={handleAddPlace}
         />
       )}
    </div>
  )
}
