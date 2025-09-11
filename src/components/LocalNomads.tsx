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
import { logInfo, logError } from '@/lib/logger'
import UserDetailModal from './UserDetailModal'
import UserCardSkeleton from './UserCardSkeleton'

interface NomadUser {
  id: string
  name: string
  avatar: string
  profession: string
  company?: string
  location: string
  distance: number
  interests: string[]
  rating: number
  reviewCount: number
  isOnline: boolean
  isAvailable: boolean
  lastSeen: string
  meetupCount: number
  mutualInterests: string[]
  compatibility: number
  bio: string
}

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
  
  const [users, setUsers] = useState<NomadUser[]>([])
  const [stats, setStats] = useState<MeetupStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filterDistance, setFilterDistance] = useState(10)
  const [filterInterests, setFilterInterests] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sendingInvitation, setSendingInvitation] = useState(false)
  const [selectedUser, setSelectedUser] = useState<NomadUser | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [hiddenUsers, setHiddenUsers] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  
  const observer = useRef<IntersectionObserver>()
  const lastUserElementRef = useRef<HTMLDivElement>(null)

  // 无限滚动观察器
  const lastUserRef = useCallback((node: HTMLDivElement) => {
    if (loading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        setPage(prevPage => prevPage + 1)
      }
    })
    if (node) observer.current.observe(node)
  }, [loading, hasMore, loadingMore])

  // 加载隐藏用户列表
  useEffect(() => {
    try {
      const stored = localStorage.getItem('hidden_nomad_users')
      if (stored) setHiddenUsers(JSON.parse(stored))
    } catch (e) {
      console.error('Failed to load hidden users', e)
    }
  }, [])

  // 真实用户数据加载与分页（与首页逻辑同步）
  useEffect(() => {
    const PAGE_SIZE = 9
    const loadUsers = async () => {
      setLoading(true)
      try {
        const allRegisteredUsers = getAllRegisteredUsers()

        // 过滤隐藏用户
        const visibleUsers = allRegisteredUsers.filter(u => !hiddenUsers.includes(u.id))

        // 计算距离
        const usersWithDistance = visibleUsers.map(u => ({
          ...u,
          distance: calculateDistance(u.location, location)
        }))

        // 搜索与筛选
        const filtered = usersWithDistance.filter(u => {
          const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.location.toLowerCase().includes(searchQuery.toLowerCase())

          const matchesDistance = u.distance <= filterDistance

          const matchesInterests = filterInterests.length === 0 ||
            filterInterests.some(interest => u.interests.includes(interest))

          return matchesSearch && matchesDistance && matchesInterests
        })

        // 排序（距离优先）
        const sorted = filtered.sort((a, b) => a.distance - b.distance)

        // 无限滚动分页切片
        const slice = sorted.slice(0, page * PAGE_SIZE)
        setUsers(slice)
        setHasMore(slice.length < sorted.length)

        // 统计数据
        const availableUsers = sorted.filter(u => u.isOnline && u.isAvailable).length
        setStats({
          totalUsers: sorted.length,
          availableUsers,
          todayMeetups: 0,
          successRate: 94
        })
      } catch (err) {
        console.error('Failed to load users', err)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    }

    loadUsers()
  }, [page, searchQuery, filterDistance, filterInterests, location, hiddenUsers])

  // 监听 localStorage 变化以实时刷新
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key) return
      if (e.key.startsWith('user_profile_details') || e.key === 'hidden_nomad_users') {
        setPage(1)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // 监听自定义的本地事件（与首页一致），用于当前页触发的本地变更
  useEffect(() => {
    const handleLocalEvent = () => setPage(1)
    window.addEventListener('localStorageChange', handleLocalEvent)
    return () => window.removeEventListener('localStorageChange', handleLocalEvent)
  }, [])

  // 工具: 获取所有注册用户（与首页一致）
  const getAllRegisteredUsers = (): NomadUser[] => {
    try {
      const results: NomadUser[] = []
      const keys = Object.keys(localStorage)
      const profileKeys = keys.filter(k => k.startsWith('user_profile_details'))
      profileKeys.forEach(key => {
        try {
          const raw = localStorage.getItem(key)
          if (!raw) return
          const profile = JSON.parse(raw)
          if (!profile?.id || !profile?.name) return
          const nomad: NomadUser = {
            id: profile.id,
            name: profile.name,
            avatar: profile.avatar_url || (profile.name ? profile.name.substring(0, 2).toUpperCase() : 'NN'),
            profession: profile.profession || 'Digital Nomad',
            company: profile.company || 'Freelance',
            location: profile.current_city || 'Unknown Location',
            distance: 0,
            interests: profile.interests || ['Travel', 'Technology'],
            rating: 5.0,
            reviewCount: 0,
            isOnline: calculateOnlineStatus(profile.updated_at),
            isAvailable: calculateAvailabilityStatus(profile.updated_at),
            lastSeen: calculateLastSeen(profile.updated_at),
            meetupCount: 0,
            mutualInterests: calculateMutualInterests(profile.interests || []),
            compatibility: calculateCompatibility(profile.interests || []) ,
            bio: profile.bio || 'Digital nomad exploring the world!'
          }
          results.push(nomad)
        } catch (e) {
          console.error('Failed to parse profile', e)
        }
      })
      return results
    } catch (e) {
      console.error('Failed to get registered users', e)
      return []
    }
  }

  const calculateDistance = (userLocation: string, currentLocation: any): number => {
    if (!currentLocation || !userLocation || userLocation === 'Unknown Location') return 999
    
    // 如果用户资料中有坐标信息，使用真实距离计算
    try {
      const userProfile = JSON.parse(localStorage.getItem('user_profile_details') || '{}')
      if (userProfile.coordinates && currentLocation.lat && currentLocation.lng) {
        return calculateHaversineDistance(
          currentLocation.lat, currentLocation.lng,
          userProfile.coordinates.lat, userProfile.coordinates.lng
        )
      }
    } catch (e) {
      console.error('Error calculating distance:', e)
    }
    
    // 如果没有坐标信息，返回随机距离作为fallback
    return Math.round((Math.random() * 100) + Number.EPSILON) / 10
  }

  // 使用Haversine公式计算两点间距离（公里）
  const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // 地球半径（公里）
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c
    return Math.round(distance * 10) / 10 // 保留一位小数
  }

  // 计算在线状态（基于最后活动时间）
  const calculateOnlineStatus = (lastUpdated: string): boolean => {
    if (!lastUpdated) return false
    const lastUpdate = new Date(lastUpdated)
    const now = new Date()
    const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60)
    return diffMinutes <= 30 // 30分钟内活跃视为在线
  }

  // 计算可用状态（基于最后活动时间）
  const calculateAvailabilityStatus = (lastUpdated: string): boolean => {
    if (!lastUpdated) return false
    const lastUpdate = new Date(lastUpdated)
    const now = new Date()
    const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60)
    return diffMinutes <= 60 // 1小时内活跃视为可用
  }

  // 计算最后在线时间显示
  const calculateLastSeen = (lastUpdated: string): string => {
    if (!lastUpdated) return 'Unknown'
    const lastUpdate = new Date(lastUpdated)
    const now = new Date()
    const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60)
    
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${Math.floor(diffMinutes)}m ago`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`
    return `${Math.floor(diffMinutes / 1440)}d ago`
  }

  const calculateMutualInterests = (userInterests: string[]): string[] => {
    try {
      const raw = localStorage.getItem('user_profile_details')
      if (!raw) return []
      const me = JSON.parse(raw)
      const myInterests: string[] = me?.interests || []
      return userInterests.filter(i => myInterests.includes(i))
    } catch {
      return []
    }
  }

  const calculateCompatibility = (userInterests: string[]): number => {
    try {
      const raw = localStorage.getItem('user_profile_details')
      if (!raw) return 50
      const me = JSON.parse(raw)
      const myInterests: string[] = me?.interests || []
      if (myInterests.length === 0 || userInterests.length === 0) return 50
      const common = userInterests.filter(i => myInterests.includes(i)).length
      return Math.round((common / Math.max(myInterests.length, userInterests.length)) * 100)
    } catch {
      return 50
    }
  }

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
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const targetUser = users.find(u => u.id === userId)
      alert(`Coffee meetup invitation sent to ${targetUser?.name}! They will respond within 24 hours.`)
      
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, isAvailable: false, lastSeen: 'Just now' }
          : u
      ))
      
    } catch (error) {
      logError('Failed to send coffee meetup invitation', error, 'LocalNomads')
      alert('Failed to send invitation. Please try again.')
    } finally {
      setSendingInvitation(false)
    }
  }

  const handleSendMessage = (userId: string) => {
    const targetUser = users.find(u => u.id === userId)
    alert(`Message feature coming soon! You'll be able to chat with ${targetUser?.name}.`)
  }

  const handleAddToFavorites = (userId: string) => {
    setFavorites(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleUserClick = (user: NomadUser) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.location.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDistance = user.distance <= filterDistance
    
    const matchesInterests = filterInterests.length === 0 || 
                           filterInterests.some(interest => user.interests.includes(interest))
    
    return matchesSearch && matchesDistance && matchesInterests
  })

  if (loading && page === 1) {
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                Distance: {filterDistance}km
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={filterDistance}
                onChange={(e) => setFilterDistance(Number(e.target.value))}
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
                    onClick={() => setFilterInterests(prev => 
                      prev.includes(interest) 
                        ? prev.filter(i => i !== interest)
                        : [...prev, interest]
                    )}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filterInterests.includes(interest)
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
      {loadingMore && (
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
