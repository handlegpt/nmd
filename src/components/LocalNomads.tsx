'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  Users, 
  MapPin, 
  Coffee, 
  MessageCircle, 
  Clock, 
  Star, 
  Heart, 
  Filter,
  Search,
  Navigation,
  Loader2
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useUser } from '@/contexts/GlobalStateContext'
import { useLocation } from '@/hooks/useLocation'
import { useNomadUsers, NomadUser } from '@/hooks/useNomadUsers'
import { logInfo, logError } from '@/lib/logger'
import UserDetailModal from './UserDetailModal'
import UserCardSkeleton from './UserCardSkeleton'
import ErrorAlert, { ErrorAlertSimple } from '@/components/ErrorAlert'

// NomadUser interface is now imported from useNomadUsers hook

interface MeetupStats {
  totalUsers: number
  availableUsers: number
  todayMeetups: number
  successRate: number
}

export default function LocalNomads() {
  const { t } = useTranslation()
  const { user } = useUser()
  const { location, loading: locationLoading, error: locationError, requestLocation, hasPermission } = useLocation()
  
  // 使用统一的用户数据管理Hook
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
    addToFavorites,
    removeFromFavorites,
    hideUser,
    sendCoffeeInvitation,
    getFavorites,
    getUserById
  } = useNomadUsers({
    enablePagination: true,
    pageSize: 9,
    enableInfiniteScroll: true,
    enableRealTimeUpdates: true,
    updateInterval: 30000
  })
  
  const [showFilters, setShowFilters] = useState(false)
  const [sendingInvitation, setSendingInvitation] = useState(false)
  const [selectedUser, setSelectedUser] = useState<NomadUser | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  
  const observer = useRef<IntersectionObserver>()
  const lastUserElementRef = useRef<HTMLDivElement>(null)

  // 无限滚动观察器
  const lastUserRef = useCallback((node: HTMLDivElement) => {
    if (loading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore()
      }
    })
    if (node) observer.current.observe(node)
  }, [loading, hasMore, loadMore])

  // 同步收藏列表
  useEffect(() => {
    setFavorites(getFavorites())
  }, [getFavorites])

  // 用户数据管理现在由useNomadUsers Hook处理

  // 判断是否为新用户（用于显示 New User 徽标，与首页视觉一致）
  const isNewUser = (userId: string): boolean => {
    try {
      return localStorage.getItem(`new_user_${userId}`) === 'true'
    } catch {
      return false
    }
  }

  // 加载收藏列表
  useEffect(() => {
    const savedFavorites = localStorage.getItem('nomadFavorites')
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch (err) {
        console.error('Failed to parse favorites:', err)
      }
    }
  }, [])

  // 保存收藏列表
  useEffect(() => {
    localStorage.setItem('nomadFavorites', JSON.stringify(favorites))
  }, [favorites])

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
      logError('Failed to send coffee meetup invitation', error, 'LocalNomads')
      alert('Failed to send invitation. Please try again.')
    } finally {
      setSendingInvitation(false)
    }
  }

  const handleSendMessage = (userId: string) => {
    const targetUser = getUserById(userId)
    alert(`Message feature coming soon! You'll be able to chat with ${targetUser?.name}.`)
  }

  const handleAddToFavorites = (userId: string) => {
    if (favorites.includes(userId)) {
      removeFromFavorites(userId)
    } else {
      addToFavorites(userId)
    }
  }

  const handleUserClick = (user: NomadUser) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  // 筛选逻辑现在由useNomadUsers Hook处理
  const filteredUsers = users

  // 处理筛选器变化
  const handleSearchChange = (query: string) => {
    setFilters({ searchQuery: query })
  }

  const handleDistanceChange = (distance: number) => {
    setFilters({ maxDistance: distance })
  }

  const handleInterestsChange = (interests: string[]) => {
    setFilters({ interests })
  }

  if (loading && currentPage === 1) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {[...Array(6)].map((_, index) => (
            <UserCardSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 错误显示 */}
      {error && (
        <ErrorAlertSimple
          message={error}
          onRetry={refreshUsers}
          onDismiss={() => {}} // Hook会自动清除错误
        />
      )}
      {/* Location Detection */}
      {!location && !locationLoading && !locationError && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Navigation className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Enable Location
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Get personalized recommendations based on your location
                </p>
              </div>
            </div>
            <button
              onClick={requestLocation}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Enable
            </button>
          </div>
        </div>
      )}

      {locationLoading && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Detecting your location...
            </span>
          </div>
        </div>
      )}

      {locationError && !hasPermission && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
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
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {location && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <h3 className="text-sm font-medium text-green-900 dark:text-green-100">
                Location Detected
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                {location.city}, {location.country}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Coffee className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Available</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.availableUsers}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Today</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todayMeetups}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Success</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.successRate}%</p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search nomads..."
              value={filters.searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Distance: {filters.maxDistance}km
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={filters.maxDistance}
                onChange={(e) => handleDistanceChange(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Interests
              </label>
              <div className="flex flex-wrap gap-2">
                {['Technology', 'Coffee', 'Travel', 'Design', 'Photography', 'Music'].map((interest) => (
                  <button
                    key={interest}
                    onClick={() => {
                      const newInterests = filters.interests.includes(interest)
                        ? filters.interests.filter(i => i !== interest)
                        : [...filters.interests, interest]
                      handleInterestsChange(newInterests)
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filters.interests.includes(interest)
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Users Grid */}
      <div className="space-y-6">
        {filteredUsers.map((user, index) => {
          const isLast = index === filteredUsers.length - 1
          const isFavorite = favorites.includes(user.id)
          
          return (
            <div
              key={user.id}
              ref={isLast ? lastUserRef : null}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
            >
              <div className="flex items-start space-x-4">
                <div 
                  className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => handleUserClick(user)}
                >
                  {user.avatar}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 
                        className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        onClick={() => handleUserClick(user)}
                      >
                        {user.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {user.profession}
                        {user.company && ` at ${user.company}`}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{user.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>{user.distance}km away</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{user.rating} ({user.reviewCount})</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isOnline && user.isAvailable 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {user.isOnline && user.isAvailable ? 'Available' : 'Busy'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.lastSeen}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {user.interests.slice(0, 3).map((interest, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.mutualInterests.includes(interest)
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {interest}
                          {user.mutualInterests.includes(interest) && (
                            <span className="ml-1">★</span>
                          )}
                        </span>
                      ))}
                      {user.interests.length > 3 && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          +{user.interests.length - 3}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 text-ellipsis">
                      {user.bio}
                    </p>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>{user.meetupCount} meetups</span>
                        <span>{user.compatibility}% match</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleCoffeeMeetup(user.id)}
                          disabled={sendingInvitation || !user.isAvailable}
                          className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Coffee className="w-4 h-4" />
                          <span className="text-sm">Meet</span>
                        </button>
                        <button
                          onClick={() => handleSendMessage(user.id)}
                          className="flex items-center space-x-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">Message</span>
                        </button>
                        <button
                          onClick={() => handleAddToFavorites(user.id)}
                          className={`p-2 rounded-lg border transition-colors ${
                            isFavorite
                              ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Load More */}
      {loading && currentPage > 1 && (
        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading more nomads...</span>
          </div>
        </div>
      )}

      {!hasMore && filteredUsers.length > 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No more nomads to show
        </div>
      )}

      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No nomads found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filters
          </p>
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
        onCoffeeMeetup={handleCoffeeMeetup}
        onSendMessage={handleSendMessage}
        onAddToFavorites={handleAddToFavorites}
        isFavorite={selectedUser ? favorites.includes(selectedUser.id) : false}
        isLoading={sendingInvitation}
      />
    </div>
  )
}
