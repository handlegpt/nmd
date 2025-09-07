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
  ListIcon,
  HeartIcon,
  NavigationIcon,
  ClockIcon,
  VolumeXIcon,
  Volume2Icon,
  VolumeIcon,
  ZapIcon,
  UsersIcon,
  MapIcon
} from 'lucide-react'
import { Place } from '@/lib/supabase'
import { useTranslation } from '@/hooks/useTranslation'
import { generatePlaceUrl } from '@/lib/urlUtils'
import PageLayout from '@/components/PageLayout'
import FixedLink from '@/components/FixedLink'
import { useUser } from '@/contexts/GlobalStateContext'
import { useNotifications } from '@/contexts/GlobalStateContext'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import { logInfo, logError } from '@/lib/logger'
import { PlaceDataService } from '@/lib/placeDataService'
import { PLACE_CATEGORIES, getCategoryIcon, getCategoryName, getCategoryColor } from '@/lib/placeCategories'
import PlaceRecommendationForm from '@/components/PlaceRecommendationForm'

// 推荐分算法类型
interface PlaceScore {
  recommendationScore: number
  ratingScore: number
  wifiScore: number
  valueScore: number
  quietScore: number
  outletScore: number
  activityScore: number
  antiInfluencerPenalty: number
}

export default function PlacesPage() {
  const { t } = useTranslation()
  const { user } = useUser()
  const { addNotification } = useNotifications()
  
  // 数据状态
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 搜索和筛选状态
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [cityFilter, setCityFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState<number[]>([])
  const [wifiFilter, setWifiFilter] = useState<number[]>([])
  const [noiseFilter, setNoiseFilter] = useState<string[]>([])
  const [outletFilter, setOutletFilter] = useState<boolean | null>(null)
  const [longStayFilter, setLongStayFilter] = useState<boolean | null>(null)
  const [socialFilter, setSocialFilter] = useState<string[]>([])
  
  // 排序和视图状态
  const [sortBy, setSortBy] = useState<'recommendation' | 'rating' | 'wifi' | 'price' | 'recent'>('recommendation')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid')
  
  // UI状态
  const [showFilters, setShowFilters] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

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

  // 推荐分算法
  const calculateRecommendationScore = (place: Place): PlaceScore => {
    // Wilson评分修正算法
    const rating = place.rating || 0
    const reviewCount = (place.upvotes || 0) + (place.downvotes || 0)
    const wilsonScore = reviewCount > 0 ? 
      (rating + 1.96 * Math.sqrt((rating * (5 - rating)) / reviewCount)) / 5 : 0

    // WiFi速度标准化 (0-100分)
    const wifiScore = Math.min(100, (place.wifi_speed || 0) / 2)

    // 性价比计算 (基于同城对比)
    const valueScore = place.price_level ? Math.max(0, 100 - (place.price_level - 1) * 20) : 50

    // 安静度评分
    const quietScore = place.noise_level === 'quiet' ? 100 : 
                      place.noise_level === 'moderate' ? 60 : 20

    // 插座情况
    const outletScore = place.outlets ? 100 : 0

    // 活跃度 (最近3个月评价)
    const activityScore = reviewCount > 5 ? 100 : reviewCount * 20

    // 网红惩罚 (高热度+低舒适度)
    const antiInfluencerPenalty = (reviewCount > 20 && rating < 4) ? 20 : 0

    // 综合推荐分
    const recommendationScore = 
      0.3 * wilsonScore * 100 +
      0.2 * wifiScore +
      0.15 * valueScore +
      0.1 * quietScore +
      0.1 * outletScore +
      0.05 * activityScore -
      antiInfluencerPenalty

    return {
      recommendationScore: Math.max(0, Math.min(100, recommendationScore)),
      ratingScore: wilsonScore * 100,
      wifiScore,
      valueScore,
      quietScore,
      outletScore,
      activityScore,
      antiInfluencerPenalty
    }
  }

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

      // 插座过滤
      const matchesOutlet = outletFilter === null || place.outlets === outletFilter

      // 长坐过滤
      const matchesLongStay = longStayFilter === null || place.long_stay_ok === longStayFilter

      // 社交氛围过滤
      const matchesSocial = socialFilter.length === 0 || socialFilter.includes(place.social_atmosphere)

      return matchesSearch && matchesCategory && matchesCity && matchesPrice && 
             matchesWifi && matchesNoise && matchesOutlet && matchesLongStay && matchesSocial
    })

    // 计算推荐分并排序
    const placesWithScores = filtered.map(place => ({
      ...place,
      score: calculateRecommendationScore(place)
    }))

    // 排序
    placesWithScores.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'recommendation':
          aValue = a.score.recommendationScore
          bValue = b.score.recommendationScore
          break
        case 'rating':
          aValue = a.score.ratingScore
          bValue = b.score.ratingScore
          break
        case 'wifi':
          aValue = a.wifi_speed || 0
          bValue = b.wifi_speed || 0
          break
        case 'price':
          aValue = a.price_level
          bValue = b.price_level
          break
        case 'recent':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        default:
          aValue = a.score.recommendationScore
          bValue = b.score.recommendationScore
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return placesWithScores
  }, [places, searchTerm, categoryFilter, cityFilter, priceFilter, wifiFilter, 
      noiseFilter, outletFilter, longStayFilter, socialFilter, sortBy, sortOrder])

  // 清除所有筛选器
  const clearAllFilters = () => {
    setCategoryFilter('all')
    setCityFilter('all')
    setPriceFilter([])
    setWifiFilter([])
    setNoiseFilter([])
    setOutletFilter(null)
    setLongStayFilter(null)
    setSocialFilter([])
    setSearchTerm('')
  }

  // 获取活跃筛选器数量
  const activeFiltersCount = [
    categoryFilter !== 'all' ? 1 : 0,
    cityFilter !== 'all' ? 1 : 0,
    priceFilter.length > 0 ? 1 : 0,
    wifiFilter.length > 0 ? 1 : 0,
    noiseFilter.length > 0 ? 1 : 0,
    outletFilter !== null ? 1 : 0,
    longStayFilter !== null ? 1 : 0,
    socialFilter.length > 0 ? 1 : 0
  ].reduce((sum, count) => sum + count, 0)

  const getPriceLevelText = (level: number) => {
    return '$'.repeat(level)
  }

  const getNoiseIcon = (level: string) => {
    switch (level) {
      case 'quiet': return <VolumeXIcon className="h-4 w-4" />
      case 'moderate': return <VolumeIcon className="h-4 w-4" />
      case 'loud': return <Volume2Icon className="h-4 w-4" />
      default: return <VolumeIcon className="h-4 w-4" />
    }
  }

  const getNoiseColor = (level: string) => {
    switch (level) {
      case 'quiet': return 'text-green-600'
      case 'moderate': return 'text-yellow-600'
      case 'loud': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const handleToggleFavorite = (placeId: string) => {
    if (!user.isAuthenticated) {
      addNotification({
        type: 'info',
        message: t('places.loginToFavorite'),
        duration: 3000
      })
      return
    }

    const newFavorites = new Set(favorites)
    if (newFavorites.has(placeId)) {
      newFavorites.delete(placeId)
      addNotification({
        type: 'success',
        message: t('places.removedFromFavorites'),
        duration: 2000
      })
    } else {
      newFavorites.add(placeId)
      addNotification({
        type: 'success',
        message: t('places.addedToFavorites'),
        duration: 2000
      })
    }
    setFavorites(newFavorites)
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
        outlets: placeData.outlets,
        long_stay_ok: placeData.long_stay_ok,
        city_id: placeData.city_id || 'default-city',
        latitude: placeData.latitude ? parseFloat(placeData.latitude) : 0,
        longitude: placeData.longitude ? parseFloat(placeData.longitude) : 0,
        submitted_by: user.profile?.id || 'anonymous',
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
      {/* 顶部工具条 - 吸顶设计 */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* 搜索框 */}
          <div className="relative mb-4">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
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

          {/* 筛选和排序控制 */}
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
                {t('places.filters')} {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </button>
              
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  {t('places.clearAll')}
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* 视图模式切换 */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <GridIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ListIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'map' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <MapIcon className="h-4 w-4" />
                </button>
              </div>

              {/* 排序控制 */}
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="recommendation">{t('places.sortByRecommendation')}</option>
                  <option value="rating">{t('places.sortByRating')}</option>
                  <option value="wifi">{t('places.sortByWifi')}</option>
                  <option value="price">{t('places.sortByPrice')}</option>
                  <option value="recent">{t('places.sortByRecent')}</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {sortOrder === 'asc' ? <SortAscIcon className="h-4 w-4" /> : <SortDescIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 筛选面板 */}
      {showFilters && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 分类筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">{t('places.category')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {PLACE_CATEGORIES.slice(0, 6).map(category => (
                    <button
                      key={category.id}
                      onClick={() => setCategoryFilter(categoryFilter === category.id ? 'all' : category.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        categoryFilter === category.id
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span>{category.icon}</span>
                      <span>{t(category.translationKey)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 城市筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">{t('places.city')}</label>
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">{t('places.allCities')}</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* WiFi速度筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">{t('places.wifiSpeed')}</label>
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
                        className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 价位筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">{t('places.priceLevel')}</label>
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
                        className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{getPriceLevelText(level)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 安静度筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">{t('places.noiseLevel')}</label>
                <div className="space-y-2">
                  {[
                    { value: 'quiet', label: t('places.quiet'), icon: <VolumeXIcon className="h-4 w-4" /> },
                    { value: 'moderate', label: t('places.medium'), icon: <VolumeIcon className="h-4 w-4" /> },
                    { value: 'loud', label: t('places.loud'), icon: <Volume2Icon className="h-4 w-4" /> }
                  ].map(noise => (
                    <label key={noise.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={noiseFilter.includes(noise.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNoiseFilter([...noiseFilter, noise.value])
                          } else {
                            setNoiseFilter(noiseFilter.filter(n => n !== noise.value))
                          }
                        }}
                        className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2">
                        {noise.icon}
                        <span className="text-sm text-gray-700">{noise.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 插座情况 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">{t('places.outlets')}</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="outlets"
                      checked={outletFilter === true}
                      onChange={() => setOutletFilter(outletFilter === true ? null : true)}
                      className="mr-3 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <ZapIcon className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-sm text-gray-700">{t('places.hasOutlets')}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="outlets"
                      checked={outletFilter === false}
                      onChange={() => setOutletFilter(outletFilter === false ? null : false)}
                      className="mr-3 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{t('places.noOutlets')}</span>
                  </label>
                </div>
              </div>

              {/* 长坐适合性 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">{t('places.longStay')}</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="longStay"
                      checked={longStayFilter === true}
                      onChange={() => setLongStayFilter(longStayFilter === true ? null : true)}
                      className="mr-3 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <ClockIcon className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-sm text-gray-700">{t('places.suitableForWork')}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="longStay"
                      checked={longStayFilter === false}
                      onChange={() => setLongStayFilter(longStayFilter === false ? null : false)}
                      className="mr-3 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{t('places.notSuitableForWork')}</span>
                  </label>
                </div>
              </div>

              {/* 社交氛围 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">{t('places.socialAtmosphere')}</label>
                <div className="space-y-2">
                  {[
                    { value: 'low', label: t('places.lowSocial') },
                    { value: 'medium', label: t('places.mediumSocial') },
                    { value: 'high', label: t('places.highSocial') }
                  ].map(social => (
                    <label key={social.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={socialFilter.includes(social.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSocialFilter([...socialFilter, social.value])
                          } else {
                            setSocialFilter(socialFilter.filter(s => s !== social.value))
                          }
                        }}
                        className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <UsersIcon className="h-4 w-4 mr-2 text-gray-600" />
                      <span className="text-sm text-gray-700">{social.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题和统计 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('places.title')}</h1>
          <p className="text-gray-600 mb-4">{t('places.subtitle')}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{t('places.showingResults', { count: filteredPlaces.length.toString(), total: places.length.toString() })}</span>
            {sortBy === 'recommendation' && (
              <span className="flex items-center gap-1">
                <StarIcon className="h-4 w-4" />
                {t('places.sortedByRecommendation')}
              </span>
            )}
          </div>
        </div>

        {/* 地点列表 */}
        {filteredPlaces.length === 0 ? (
          <div className="card card-lg text-center py-12">
            <div className="text-gray-500">
              <h3 className="text-lg font-medium mb-2">{t('places.noResults.title')}</h3>
              <p className="text-sm mb-4">{t('places.noResults.description')}</p>
              {user.isAuthenticated && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="btn btn-primary"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
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
              const category = PLACE_CATEGORIES.find(cat => cat.id === place.category)
              
              if (viewMode === 'list') {
                return (
                  <div key={place.id} className="card card-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">
                            {category?.icon || '📍'}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{place.name}</h3>
                          <p className="text-sm text-gray-600">
                            {category?.name} • {place.city_id}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{place.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <StarIcon className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">{place.rating?.toFixed(1) || 'N/A'}</span>
                            <span className="text-sm text-gray-500">({place.score?.recommendationScore.toFixed(0)}%)</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <WifiIcon className="h-3 w-3" />
                              <span>{place.wifi_speed || 'N/A'} Mbps</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSignIcon className="h-3 w-3" />
                              <span>{getPriceLevelText(place.price_level)}</span>
                            </div>
                            <div className={`flex items-center gap-1 ${getNoiseColor(place.noise_level)}`}>
                              {getNoiseIcon(place.noise_level)}
                              <span className="capitalize">{place.noise_level}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleFavorite(place.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              favorites.has(place.id) 
                                ? 'bg-red-100 text-red-600' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <HeartIcon className="h-4 w-4" />
                          </button>
                          <FixedLink
                            href={generatePlaceUrl(place)}
                            className="btn btn-sm btn-outline"
                          >
                            {t('places.viewDetails')}
                          </FixedLink>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div key={place.id} className="card card-md hover:shadow-lg transition-shadow group">
                  {/* 封面图片区域 */}
                  <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-4xl">
                      {category?.icon || '📍'}
                    </div>
                    {/* 推荐分徽章 */}
                    <div className="absolute top-3 right-3">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-gray-700">
                        {place.score?.recommendationScore.toFixed(0)}%
                      </div>
                    </div>
                    {/* 收藏按钮 */}
                    <button
                      onClick={() => handleToggleFavorite(place.id)}
                      className={`absolute top-3 left-3 p-2 rounded-full transition-colors ${
                        favorites.has(place.id) 
                          ? 'bg-red-500 text-white' 
                          : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white'
                      }`}
                    >
                      <HeartIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="p-4">
                    {/* 标题和分类 */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{place.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <span>{category?.icon}</span>
                          <span>{category?.name}</span>
                          <span>•</span>
                          <span>{place.city_id}</span>
                        </p>
                      </div>
                    </div>

                    {/* 关键指标 */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
                          <StarIcon className="h-3 w-3" />
                          <span>{t('places.rating')}</span>
                        </div>
                        <div className="font-medium text-gray-900">{place.rating?.toFixed(1) || 'N/A'}</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
                          <WifiIcon className="h-3 w-3" />
                          <span>{t('places.wifi')}</span>
                        </div>
                        <div className="font-medium text-gray-900">{place.wifi_speed || 'N/A'} Mbps</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
                          <DollarSignIcon className="h-3 w-3" />
                          <span>{t('places.price')}</span>
                        </div>
                        <div className="font-medium text-gray-900">{getPriceLevelText(place.price_level)}</div>
                      </div>
                    </div>

                    {/* 环境信息 */}
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className={`flex items-center gap-1 ${getNoiseColor(place.noise_level)}`}>
                        {getNoiseIcon(place.noise_level)}
                        <span className="capitalize">{place.noise_level}</span>
                      </div>
                      {place.outlets && (
                        <div className="flex items-center gap-1 text-green-600">
                          <ZapIcon className="h-3 w-3" />
                          <span>{t('places.outlets')}</span>
                        </div>
                      )}
                      {place.long_stay_ok && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <ClockIcon className="h-3 w-3" />
                          <span>{t('places.workFriendly')}</span>
                        </div>
                      )}
                    </div>

                    {/* 标签 */}
                    {place.tags && place.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
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

                    {/* 操作按钮 */}
                    <div className="flex gap-2">
                      <FixedLink
                        href={`/places/${place.id}`}
                        className="flex-1 btn btn-sm btn-outline"
                      >
                        {t('places.viewDetails')}
                      </FixedLink>
                      <button className="btn btn-sm btn-outline">
                        <NavigationIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* 添加地点浮动按钮 */}
        {user.isAuthenticated && (
          <button
            onClick={() => setShowAddForm(true)}
            className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors z-50"
          >
            <PlusIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Place Recommendation Form */}
      <PlaceRecommendationForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleAddPlace}
      />
    </PageLayout>
  )
}