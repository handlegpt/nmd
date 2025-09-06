'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  SearchIcon, 
  StarIcon, 
  WifiIcon, 
  DollarSignIcon, 
  MapPinIcon, 
  PlusIcon,
  FilterIcon,
  XIcon,
  SortAscIcon,
  SortDescIcon,
  GridIcon,
  ListIcon
} from 'lucide-react'
import { Place } from '@/lib/supabase'
import { useTranslation } from '@/hooks/useTranslation'
import PageLayout from '@/components/PageLayout'
import FixedLink from '@/components/FixedLink'
import { useUser } from '@/contexts/GlobalStateContext'
import { useNotifications } from '@/contexts/GlobalStateContext'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import UnifiedVoteSystem, { VoteItem } from '@/components/UnifiedVoteSystem'
import UniversalRecommendationForm, { RecommendationType } from '@/components/UniversalRecommendationForm'
import { logInfo, logError } from '@/lib/logger'
import { PlaceDataService } from '@/lib/placeDataService'
import { PLACE_CATEGORIES, getCategoryIcon, getCategoryName, getCategoryColor } from '@/lib/placeCategories'

export default function PlacesPage() {
  const { t } = useTranslation()
  const { user } = useUser()
  const { addNotification } = useNotifications()
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState<number[]>([])
  const [wifiFilter, setWifiFilter] = useState<number[]>([])
  const [noiseFilter, setNoiseFilter] = useState<string[]>([])
  const [socialFilter, setSocialFilter] = useState<string[]>([])
  const [cityFilter, setCityFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'rating' | 'name' | 'price' | 'wifi' | 'recent'>('rating')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchPlaces()
  }, [])

  const fetchPlaces = () => {
    setLoading(true)
    setError(null)
    try {
      const data = PlaceDataService.getLocalPlaces()
      setPlaces(data)
    } catch (error) {
      logError('Error fetching places', error, 'PlacesPage')
      setError('Failed to load places. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // 获取所有城市列表
  const cities = useMemo(() => {
    const citySet = new Set(places.map(place => place.city_id).filter(Boolean))
    return Array.from(citySet).sort()
  }, [places])

  // 高级筛选和搜索
  const filteredPlaces = useMemo(() => {
    let filtered = places.filter(place => {
      // 搜索过滤
      const matchesSearch = !searchTerm || 
        place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      // 类别过滤
      const matchesCategory = categoryFilter === 'all' || place.category === categoryFilter

      // 城市过滤
      const matchesCity = cityFilter === 'all' || place.city_id === cityFilter

      // 价格过滤
      const matchesPrice = priceFilter.length === 0 || priceFilter.includes(place.price_level)

      // WiFi过滤
      const matchesWifi = wifiFilter.length === 0 || 
        (place.wifi_speed && wifiFilter.some(range => {
          const speed = place.wifi_speed || 0
          if (range === 0) return speed < 50
          if (range === 50) return speed >= 50 && speed < 100
          if (range === 100) return speed >= 100
          return false
        }))

      // 噪音过滤
      const matchesNoise = noiseFilter.length === 0 || noiseFilter.includes(place.noise_level)

      // 社交氛围过滤
      const matchesSocial = socialFilter.length === 0 || socialFilter.includes(place.social_atmosphere)

      return matchesSearch && matchesCategory && matchesCity && matchesPrice && matchesWifi && matchesNoise && matchesSocial
    })

    // 排序
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'rating':
          aValue = a.rating || 0
          bValue = b.rating || 0
          break
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'price':
          aValue = a.price_level
          bValue = b.price_level
          break
        case 'wifi':
          aValue = a.wifi_speed || 0
          bValue = b.wifi_speed || 0
          break
        case 'recent':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        default:
          aValue = a.rating || 0
          bValue = b.rating || 0
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [places, searchTerm, categoryFilter, cityFilter, priceFilter, wifiFilter, noiseFilter, socialFilter, sortBy, sortOrder])

  // 清除所有筛选器
  const clearAllFilters = () => {
    setCategoryFilter('all')
    setPriceFilter([])
    setWifiFilter([])
    setNoiseFilter([])
    setSocialFilter([])
    setCityFilter('all')
    setSearchTerm('')
  }

  // 获取活跃筛选器数量
  const activeFiltersCount = [
    categoryFilter !== 'all' ? 1 : 0,
    priceFilter.length > 0 ? 1 : 0,
    wifiFilter.length > 0 ? 1 : 0,
    noiseFilter.length > 0 ? 1 : 0,
    socialFilter.length > 0 ? 1 : 0,
    cityFilter !== 'all' ? 1 : 0
  ].reduce((sum, count) => sum + count, 0)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cafe':
        return '☕'
      case 'coworking':
        return '💻'
      case 'coliving':
        return '🏠'
      case 'restaurant':
        return '🍽'
      case 'park':
        return '🌳'
      default:
        return '📍'
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'cafe':
        return t('places.categories.cafe')
      case 'coworking':
        return t('places.categories.coworking')
      case 'coliving':
        return t('places.categories.coliving')
      case 'restaurant':
        return t('places.categories.restaurant')
      case 'park':
        return t('places.categories.park')
      default:
        return t('places.categories.other')
    }
  }

  const getPriceLevelText = (level: number) => {
    switch (level) {
      case 1:
        return '$'
      case 2:
        return '$$'
      case 3:
        return '$$$'
      case 4:
        return '$$$$'
      case 5:
        return '$$$$$'
      default:
        return '$$$'
    }
  }

  const handleVoteSubmitted = (voteData: any) => {
    logInfo('Vote submitted', voteData, 'PlacesPage')
    addNotification({
      type: 'success',
      message: t('voteSystem.voteSubmitted')
    })
  }

  const handleAddPlace = async (placeData: any) => {
    try {
      logInfo('Adding new place', placeData, 'PlacesPage')
      
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
        city_id: 'default-city',
        latitude: placeData.latitude ? parseFloat(placeData.latitude) : 0,
        longitude: placeData.longitude ? parseFloat(placeData.longitude) : 0,
        submitted_by: placeData.submitted_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      setPlaces(prev => [newPlace, ...prev])
      setShowAddForm(false)
      
      addNotification({
        type: 'success',
        message: t('places.addPlaceSuccess', { placeName: placeData.name })
      })
    } catch (error) {
      logError('Error adding place', error, 'PlacesPage')
      addNotification({
        type: 'error',
        message: t('places.addPlaceError')
      })
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Loading places..." />
        </div>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout>
        <ErrorMessage 
          title="Failed to load places"
          message={error}
          onRetry={fetchPlaces}
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      {/* Header with Add Place Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('places.title')}</h1>
          <p className="text-gray-600 mt-2">Discover amazing places for digital nomads</p>
          <p className="text-sm text-gray-500 mt-1">
            {filteredPlaces.length} of {places.length} places
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <GridIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
          {user.isAuthenticated && (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              {t('places.addPlace')}
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Search and Filter Bar */}
      <div className="card card-md mb-6">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('places.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
              >
                <XIcon className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Filter Toggle and Active Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showFilters 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FilterIcon className="h-4 w-4" />
                Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </button>
              
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="rating">Sort by Rating</option>
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="wifi">Sort by WiFi</option>
                <option value="recent">Sort by Recent</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {sortOrder === 'asc' ? <SortAscIcon className="h-4 w-4" /> : <SortDescIcon className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {PLACE_CATEGORIES.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Level</label>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(level => (
                    <label key={level} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={priceFilter.includes(level)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPriceFilter([...priceFilter, level])
                          } else {
                            setPriceFilter(priceFilter.filter(p => p !== level))
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{getPriceLevelText(level)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* WiFi Speed Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WiFi Speed</label>
                <div className="space-y-2">
                  {[
                    { value: 0, label: '< 50 Mbps' },
                    { value: 50, label: '50-100 Mbps' },
                    { value: 100, label: '> 100 Mbps' }
                  ].map(range => (
                    <label key={range.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={wifiFilter.includes(range.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWifiFilter([...wifiFilter, range.value])
                          } else {
                            setWifiFilter(wifiFilter.filter(w => w !== range.value))
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Places Grid/List */}
      {filteredPlaces.length === 0 ? (
        <div className="card card-lg text-center py-12">
          <div className="text-gray-500">
            <h3 className="text-lg font-medium mb-2">{t('places.noResults.title')}</h3>
            <p className="text-sm">{t('places.noResults.description')}</p>
            {user.isAuthenticated && (
              <button
                onClick={() => setShowAddForm(true)}
                className="btn btn-primary mt-4"
              >
                {t('places.addPlace')}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
        }>
          {filteredPlaces.map((place) => {
            const voteItem: VoteItem = {
              id: place.id,
              name: place.name,
              type: 'place',
              currentVotes: {
                upvotes: Math.floor((place.upvotes || 0) * 0.7),
                downvotes: Math.floor((place.downvotes || 0) * 0.3),
                rating: place.rating
              }
            }

            if (viewMode === 'list') {
              return (
                <div key={place.id} className="card card-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-2xl">{getCategoryIcon(place.category)}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{place.name}</h3>
                        <p className="text-sm text-gray-600">{getCategoryName(place.category)} • {place.city_id}</p>
                        <p className="text-sm text-gray-500 mt-1">{place.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <StarIcon className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{place.rating?.toFixed(1) || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <WifiIcon className="h-3 w-3" />
                          <span>{place.wifi_speed || 'N/A'} Mbps</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {getPriceLevelText(place.price_level)}
                        </div>
                      </div>
                      <UnifiedVoteSystem
                        item={voteItem}
                        variant="quick"
                        onVoteSubmitted={handleVoteSubmitted}
                      />
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <div key={place.id} className="card card-md hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getCategoryIcon(place.category)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{place.name}</h3>
                      <p className="text-sm text-gray-600">{getCategoryName(place.category)}</p>
                    </div>
                  </div>
                  <UnifiedVoteSystem
                    item={voteItem}
                    variant="quick"
                    onVoteSubmitted={handleVoteSubmitted}
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4" />
                    <span className="truncate">{place.address}</span>
                  </div>
                  
                  <p className="text-sm text-gray-700 line-clamp-2">{place.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t('places.wifiSpeed')}</span>
                    <span className="font-medium">{place.wifi_speed || 'N/A'} Mbps</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t('places.priceLevel')}</span>
                    <span className="font-medium">{getPriceLevelText(place.price_level)}</span>
                  </div>
                  
                  {place.tags && place.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {place.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                        >
                          {t(`recommendationForm.place.suggestedTags.${tag}`) || tag}
                        </span>
                      ))}
                      {place.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          +{place.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <FixedLink
                    href={`/places/${place.id}`}
                    className="btn btn-sm btn-outline w-full"
                  >
                    {t('places.viewDetails')}
                  </FixedLink>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Universal Recommendation Form */}
      <UniversalRecommendationForm
        type="place"
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleAddPlace}
      />
    </PageLayout>
  )
}
