'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Users, 
  MapPin, 
  Coffee, 
  MessageCircle, 
  Clock, 
  Star, 
  Heart, 
  ChevronLeft,
  ChevronRight,
  Loader2,
  Navigation,
  X,
  Map,
  List,
  ZoomIn,
  ZoomOut,
  Target,
  Eye,
  EyeOff,
  Filter,
  Tag,
  Award,
  Settings,
  CheckCircle,
  Circle
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useUser } from '@/contexts/GlobalStateContext'
import { useLocation } from '@/hooks/useLocation'
import { useNomadUsers, NomadUser } from '@/hooks/useNomadUsers'
import { logInfo, logError } from '@/lib/logger'
import UserDetailModal from './UserDetailModal'
import ErrorAlert, { ErrorAlertSimple } from '@/components/ErrorAlert'

// NomadUser interface is now imported from useNomadUsers hook

interface TagCategory {
  id: string
  name: string
  tags: string[]
}

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  progress?: number
}

interface HomeLocalNomadsProps {
  maxUsers?: number
  showPagination?: boolean
  showLocationDetection?: boolean
  showStats?: boolean
  showNewUsers?: boolean
}

export default function HomeLocalNomads({
  maxUsers = 6,
  showPagination = true,
  showLocationDetection = true,
  showStats = true,
  showNewUsers = true
}: HomeLocalNomadsProps) {
  logInfo('HomeLocalNomads component rendering', { maxUsers, showPagination, showLocationDetection, showStats, showNewUsers }, 'HomeLocalNomads')
  
  const { t } = useTranslation()
  const { user } = useUser()
  const { location, loading: locationLoading, error: locationError, requestLocation, hasPermission } = useLocation()
  
  logInfo('HomeLocalNomads - hooks loaded', { 
    userAuthenticated: user?.isAuthenticated, 
    userId: user?.profile?.id,
    location: location,
    locationLoading: locationLoading
  }, 'HomeLocalNomads')
  
  // 使用统一的用户数据管理Hook
  logInfo('HomeLocalNomads - about to call useNomadUsers', { 
    enablePagination: showPagination,
    pageSize: maxUsers,
    enableInfiniteScroll: false,
    enableRealTimeUpdates: true,
    updateInterval: 30000
  }, 'HomeLocalNomads')
  
  const {
    users,
    stats,
    loading,
    error,
    hasMore,
    currentPage,
    totalPages,
    filters,
    setFilters,
    refreshUsers,
    loadMore,
    goToPage,
    addToFavorites,
    removeFromFavorites,
    hideUser,
    sendCoffeeInvitation,
    sendWorkTogetherInvitation,
    getFavorites,
    getUserById
  } = useNomadUsers({
    enablePagination: showPagination,
    pageSize: maxUsers,
    enableInfiniteScroll: false,
    enableRealTimeUpdates: true,
    updateInterval: 30000
  })
  
  logInfo('HomeLocalNomads - useNomadUsers called successfully', { 
    usersCount: users?.length || 0,
    loading: loading,
    error: error,
    stats: stats
  }, 'HomeLocalNomads')
  
  const [sendingInvitation, setSendingInvitation] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  
  // 新增状态
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [selectedStatus, setSelectedStatus] = useState<'available' | 'coffeeLater' | 'notAvailable' | 'invisible'>('available')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [mapZoom, setMapZoom] = useState(12)
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 })
  
  // 用户详情模态框状态
  const [selectedUser, setSelectedUser] = useState<NomadUser | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 同步收藏列表
  useEffect(() => {
    const syncFavorites = async () => {
      try {
        const favoritesList = await getFavorites()
        setFavorites(favoritesList)
      } catch (error) {
        logError('Failed to sync favorites', error, 'HomeLocalNomads')
      }
    }
    syncFavorites()
  }, [getFavorites])

  // 用户数据现在由useNomadUsers Hook管理

  // 用户数据获取现在由useNomadUsers Hook处理

  // 距离计算、在线状态等现在由useNomadUsers Hook处理



  // 收藏列表现在完全由useNomadUsers Hook管理，移除localStorage依赖

  // 实时更新和localStorage监听现在由useNomadUsers Hook处理

  // 分页处理现在由useNomadUsers Hook管理
  const handlePageChange = (page: number) => {
    // 调用hook的分页功能
    goToPage(page)
  }

  // 处理用户点击
  const handleUserClick = (user: NomadUser) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  // 收藏列表保存现在由useNomadUsers Hook管理，移除localStorage依赖

  const handleCoffeeMeetup = async (userId: string) => {
    if (!user.isAuthenticated) {
      alert('Please login to send coffee meetup invitations')
      return
    }

    setSendingInvitation(true)
    
    try {
      const success = await sendCoffeeInvitation(userId)
      if (success) {
        const targetUser = getUserById(userId)
        alert(`Coffee meetup invitation sent to ${targetUser?.name}! They will respond within 24 hours.`)
      } else {
        alert('Failed to send invitation. Please try again.')
      }
    } catch (error) {
      logError('Failed to send coffee meetup invitation', error, 'HomeLocalNomads')
      alert('Failed to send invitation. Please try again.')
    } finally {
      setSendingInvitation(false)
    }
  }

  const handleAddToFavorites = (userId: string) => {
    if (favorites.includes(userId)) {
      removeFromFavorites(userId)
    } else {
      addToFavorites(userId)
    }
  }

  const handleHideUser = (userId: string) => {
    hideUser(userId)
  }

  // 新增的辅助函数
  const handleWorkTogether = async (userId: string) => {
    if (!user.isAuthenticated) {
      alert('Please login to send work together invitations')
      return
    }

    setSendingInvitation(true)
    
    try {
      const success = await sendWorkTogetherInvitation(userId)
      
      if (success) {
        const targetUser = getUserById(userId)
        alert(`Work together invitation sent to ${targetUser?.name}! They will respond within 7 days.`)
      } else {
        alert('Failed to send invitation. Please try again.')
      }
      
    } catch (error) {
      logError('Failed to send work together invitation', error, 'HomeLocalNomads')
      alert('Failed to send invitation. Please try again.')
    } finally {
      setSendingInvitation(false)
    }
  }

  // 热门城市数据现在从真实API获取
  const [hotCities, setHotCities] = useState<any[]>([])
  const [loadingHotCities, setLoadingHotCities] = useState(false)

  // 获取热门城市数据
  useEffect(() => {
    const fetchHotCities = async () => {
      setLoadingHotCities(true)
      try {
        const response = await fetch('/api/cities/hot')
        const result = await response.json()
        if (result.success) {
          setHotCities(result.data)
        }
      } catch (error) {
        logError('Failed to fetch hot cities', error, 'HomeLocalNomads')
      } finally {
        setLoadingHotCities(false)
      }
    }

    fetchHotCities()
  }, [])

  // 数据埋点函数
  const trackEvent = (eventName: string, properties: Record<string, any> = {}) => {
    try {
      // 这里可以集成 Google Analytics, Mixpanel 等
      logInfo('Track Event', { eventName, properties }, 'HomeLocalNomads')
      
      // 示例：发送到分析服务
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', eventName, properties)
      }
    } catch (error) {
      logError('Failed to track event', error, 'HomeLocalNomads')
    }
  }


  const handleViewGlobalHotspots = () => {
    // Navigate to global hotspots page or open modal
    window.open('/local-nomads', '_blank')
  }

  const handleViewMoreHotCities = () => {
    // Navigate to hot cities page
    window.open('/nomadcities', '_blank')
  }

  const handleShareInvite = () => {
    // 埋点：邀请链接分享
    trackEvent('invite_link_share', {
      city: location?.city || 'unknown',
      user_id: user?.profile?.id || 'anonymous',
      context: 'home_empty'
    })
    
    if (navigator.share) {
      navigator.share({
        title: 'Join me on Nomad Now!',
        text: 'Discover digital nomad cities and connect with fellow nomads',
        url: 'https://nomad.now/invite?code=ABC123'
      })
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText('https://nomad.now/invite?code=ABC123')
      alert('Invite link copied to clipboard!')
    }
  }



  // 标签系统数据
  const tagCategories: TagCategory[] = [
    {
      id: 'lifestyle',
      name: t('localNomads.tagCategories.lifestyle'),
      tags: [
        t('localNomads.lifestyleTags.earlyBird'),
        t('localNomads.lifestyleTags.nightOwl'),
        t('localNomads.lifestyleTags.minimalist'),
        t('localNomads.lifestyleTags.adventurer')
      ]
    },
    {
      id: 'work',
      name: t('localNomads.tagCategories.work'),
      tags: [
        t('localNomads.workTags.developer'),
        t('localNomads.workTags.designer'),
        t('localNomads.workTags.writer'),
        t('localNomads.workTags.entrepreneur')
      ]
    },
    {
      id: 'interests',
      name: t('localNomads.tagCategories.interests'),
      tags: [
        t('localNomads.interestTags.photography'),
        t('localNomads.interestTags.music'),
        t('localNomads.interestTags.cooking'),
        t('localNomads.interestTags.fitness')
      ]
    },
    {
      id: 'personality',
      name: t('localNomads.tagCategories.personality'),
      tags: [
        t('localNomads.personalityTags.extrovert'),
        t('localNomads.personalityTags.introvert'),
        t('localNomads.personalityTags.creative'),
        t('localNomads.personalityTags.analytical')
      ]
    }
  ]

  // 徽章系统数据
  const badges: Badge[] = [
    {
      id: 'localGuide',
      name: t('localNomads.badgeTypes.localGuide'),
      description: t('localNomads.badgeDescriptions.localGuide'),
      icon: '🏛️',
      earned: true,
      progress: 100
    },
    {
      id: 'coffeeHero',
      name: t('localNomads.badgeTypes.coffeeHero'),
      description: t('localNomads.badgeDescriptions.coffeeHero'),
      icon: '☕',
      earned: false,
      progress: 60
    },
    {
      id: 'cityExplorer',
      name: t('localNomads.badgeTypes.cityExplorer'),
      description: t('localNomads.badgeDescriptions.cityExplorer'),
      icon: '🗺️',
      earned: true,
      progress: 100
    },
    {
      id: 'communityBuilder',
      name: t('localNomads.badgeTypes.communityBuilder'),
      description: t('localNomads.badgeDescriptions.communityBuilder'),
      icon: '🏗️',
      earned: false,
      progress: 30
    }
  ]

  // 地图控制函数
  const handleZoomIn = () => setMapZoom(prev => Math.min(prev + 1, 18))
  const handleZoomOut = () => setMapZoom(prev => Math.max(prev - 1, 8))
  const handleCenterMap = () => {
    if (location && 'lat' in location && 'lng' in location) {
      setMapCenter({ lat: (location as any).lat || 0, lng: (location as any).lng || 0 })
    }
  }

  // 状态切换函数
  const handleStatusChange = (newStatus: NonNullable<NomadUser['status']>) => {
    setSelectedStatus(newStatus)
    // 这里可以调用API更新用户状态
    logInfo('Status changed', { newStatus }, 'HomeLocalNomads')
  }

  // 标签筛选函数
  const handleTagFilter = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  // 状态图标和颜色函数已移除，现在使用简单的在线/离线状态



  const availableUsers = stats?.availableUsers || 0
  const totalUsers = stats?.totalUsers || 0

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(maxUsers)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 h-20 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 错误显示 */}
      {error && (
        <ErrorAlertSimple
          message={error}
          onRetry={refreshUsers}
          onDismiss={() => {}} // Hook会自动清除错误
        />
      )}
      {/* 位置权限检测 - 双路径选择 */}
      {showLocationDetection && !location && !locationLoading && !locationError && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Navigation className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {t('localNomads.enableLocation')}
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {t('localNomads.getPersonalizedRecommendations')}
                </p>
              </div>
            </div>
          </div>
          
          {/* 双路径选择 */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                // 埋点：点击允许定位
                trackEvent('loc_enable_click', {
                  browser: navigator.userAgent,
                  success: true
                })
                requestLocation()
              }}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Target className="w-4 h-4" />
              <span>{t('localNomads.allowLocation')}</span>
            </button>
            <button
              onClick={() => {/* TODO: 手动选城市 */}}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-sm"
            >
              <MapPin className="w-4 h-4" />
              <span>{t('localNomads.selectCityManually')}</span>
            </button>
          </div>
        </div>
      )}

      {showLocationDetection && locationError && !hasPermission && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Navigation className="w-5 h-5 text-red-600 dark:text-red-400" />
              <div>
                <h3 className="text-sm font-medium text-red-900 dark:text-red-100">
                  Location Access Required
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {locationError}
                </p>
              </div>
            </div>
            <button
              onClick={requestLocation}
              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Stats with Community Trust Index */}
      {showStats && (
        <div className="space-y-4 mb-6">
          {/* Location and Global Stats */}
          {location && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {t('localNomads.yourCity', { city: location.city || 'Unknown City' })}
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {t('localNomads.nearbyOnline', { count: availableUsers.toString(), global: totalUsers.toString() })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalUsers}</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">{t('localNomads.globalNomads')}</div>
                </div>
              </div>
            </div>
          )}

          {/* 三指标卡 - 右对齐，减少占高 */}
          <div className="flex justify-end">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center min-w-[100px]">
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{totalUsers}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t('localNomads.totalNomads')}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center min-w-[100px]">
                <div className="text-xl font-bold text-green-600 dark:text-green-400">{availableUsers}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t('localNomads.availableNow')}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center min-w-[100px]">
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{stats?.successRate || 0}%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t('localNomads.successRate')}</div>
              </div>
            </div>
          </div>

          {/* 合并的 Trust & Response 卡片 */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200 dark:border-green-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-green-900 dark:text-green-100 flex items-center">
                  <span className="text-lg mr-2">🌟</span>
                  {t('localNomads.trustAndResponse')}: {stats?.successRate || 0}% {t('localNomads.requestsGetResponse')}
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {t('localNomads.recent30DaysData')} • {t('localNomads.basedOnRealRequests', { count: totalUsers.toString() })}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats?.successRate || 0}%</div>
                <div className="text-xs text-green-600 dark:text-green-400">{t('localNomads.successRate')}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((nomadUser) => {
          const isFavorite = favorites.includes(nomadUser.id)
          
          return (
            <div
              key={nomadUser.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
            >
              <div className="flex items-start space-x-3">
                <div 
                  className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => handleUserClick(nomadUser)}
                >
                  {nomadUser.avatar_url && nomadUser.avatar_url.startsWith('data:') ? (
                    <img 
                      src={nomadUser.avatar_url} 
                      alt={nomadUser.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    nomadUser.avatar
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 
                        className="text-sm font-semibold text-gray-900 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        onClick={() => handleUserClick(nomadUser)}
                      >
                        {nomadUser.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {nomadUser.profession}
                        {nomadUser.company && ` at ${nomadUser.company}`}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        nomadUser.isOnline && nomadUser.isAvailable 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {nomadUser.isOnline && nomadUser.isAvailable ? 'Available' : 'Busy'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{nomadUser.location}</span>
                  </div>
                  
                  <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{nomadUser.distance.toFixed(1)}km</span>
                    <span>•</span>
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span>{nomadUser.rating}</span>
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-1">
                    {nomadUser.interests.slice(0, 2).map((interest, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          nomadUser.mutualInterests.includes(interest)
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {interest}
                        {nomadUser.mutualInterests.includes(interest) && <span className="ml-1">★</span>}
                      </span>
                    ))}
                    {nomadUser.interests.length > 2 && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        +{nomadUser.interests.length - 2}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {nomadUser.compatibility}% match
                    </div>
                    
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleCoffeeMeetup(nomadUser.id)}
                        disabled={sendingInvitation || !nomadUser.isAvailable}
                        className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title={t('localNomads.coffeeMeetup')}
                      >
                        <Coffee className="w-3 h-3" />
                        <span>{t('localNomads.coffeeMeetup')}</span>
                      </button>
                      <button
                        onClick={() => handleWorkTogether(nomadUser.id)}
                        disabled={sendingInvitation || !nomadUser.isAvailable}
                        className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title={t('localNomads.workTogether')}
                      >
                        <span className="text-xs">🧑‍💻</span>
                        <span>{t('localNomads.workTogether')}</span>
                      </button>
                      <button
                        onClick={() => handleAddToFavorites(nomadUser.id)}
                        className={`p-1 rounded border transition-colors ${
                          isFavorite
                            ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${isFavorite ? 'fill-current' : ''}`} />
                      </button>
                      {nomadUser.id === user.profile?.id && (
                        <button
                          onClick={() => handleHideUser(nomadUser.id)}
                          className="p-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                          title={t('profile.hideFromLocalNomads')}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((currentPage - 1) * maxUsers) + 1} to {Math.min(currentPage * maxUsers, totalUsers)} of {totalUsers} nomads
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
              {totalPages > 5 && (
                <span className="px-2 text-gray-500">...</span>
              )}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Empty State with Hot Cities and Invite Friends */}
      {users.length === 0 && !loading && (
        <div className="space-y-8">
          {/* First Nomad in City */}
          <div className="text-center py-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('localNomads.firstNomadInCity')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('localNomads.inviteFriends')}
              </p>
              
              {/* 并排两个主按钮，大小一致 */}
              <div className="flex items-center justify-center space-x-4 mb-3">
                <button
                  onClick={() => handleShareInvite()}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium min-w-[140px]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>🔗 Share Link</span>
                </button>
                <button
                  onClick={() => handleViewGlobalHotspots()}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors font-medium min-w-[140px]"
                >
                  <MapPin className="w-4 h-4" />
                  <span>🌍 View Hotspots</span>
                </button>
              </div>
              
              {/* 次要文案 */}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('localNomads.shareInviteLink')}
              </p>
            </div>
          </div>

          {/* Hot Cities Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <span className="text-2xl mr-2">🔥</span>
                {t('localNomads.hotCities')}
              </h3>
              <button
                onClick={() => handleViewMoreHotCities()}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {t('localNomads.viewMoreHotCities')}
              </button>
            </div>
            
            {/* 热门城市数据 */}
            {loadingHotCities ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Loader2 className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-spin" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t('localNomads.loadingHotCities')}
                </h4>
              </div>
            ) : hotCities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {hotCities.map((city, index) => (
                  <div 
                    key={city.name} 
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer relative"
                    onClick={() => {
                      trackEvent('hot_city_card_click', {
                        city: city.name,
                        rank: index + 1,
                        user_id: user?.profile?.id || 'anonymous'
                      })
                    }}
                  >
                    {/* 右上角排名 */}
                    <div className="absolute top-3 right-3">
                      <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
                    </div>
                    
                    {/* 城市名称 */}
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 pr-8">{city.name}</h4>
                    
                    {/* 城市数据 */}
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center justify-between">
                        <span>🟢 {city.onlineCount} online</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {city.hotness}% hot
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>☕ ${city.coffeePrice}</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Community</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>📶 {city.wifiSpeed} Mbps</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Verified</span>
                      </div>
                    </div>
                    
                    {/* 左下角"去看看"轻按钮 */}
                    <div className="mt-3 flex justify-start">
                      <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                        {t('common.goSee')} →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t('localNomads.noHotCities')}
                </h4>
                <p className="text-sm">
                  {t('localNomads.beFirstInYourCity')}
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedUser(null)
        }}
        onSendMessage={(userId: string) => {
          // 处理发送消息
          logInfo('Send message', { userId }, 'HomeLocalNomads')
        }}
        addToFavorites={addToFavorites}
        removeFromFavorites={removeFromFavorites}
        sendCoffeeInvitation={sendCoffeeInvitation}
        getFavorites={getFavorites}
      />
    </div>
  )
}
