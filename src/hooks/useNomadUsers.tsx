'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useLocation } from '@/hooks/useLocation'
import { useUser } from '@/contexts/GlobalStateContext'
import { ratingSystem, UserRatingSummary } from '@/lib/ratingSystem'
import { logInfo, logError } from '@/lib/logger'

export interface NomadUser {
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
  ratingSummary?: UserRatingSummary
  coordinates?: {
    lat: number
    lng: number
  }
  // 新增字段
  status?: 'available' | 'coffeeLater' | 'notAvailable' | 'invisible'
  tags?: string[]
  badges?: string[]
}

export interface UserFilters {
  searchQuery: string
  maxDistance: number
  interests: string[]
  onlineOnly: boolean
  availableOnly: boolean
}

export interface UserStats {
  totalUsers: number
  availableUsers: number
  onlineUsers: number
  todayMeetups: number
  successRate: number
}

export interface UseNomadUsersOptions {
  enablePagination?: boolean
  pageSize?: number
  enableInfiniteScroll?: boolean
  enableRealTimeUpdates?: boolean
  updateInterval?: number
}

export interface UseNomadUsersReturn {
  // 数据
  users: NomadUser[]
  stats: UserStats | null
  filteredUsers: NomadUser[]
  
  // 状态
  loading: boolean
  error: string | null
  hasMore: boolean
  currentPage: number
  totalPages: number
  
  // 筛选
  filters: UserFilters
  setFilters: (filters: Partial<UserFilters>) => void
  
  // 操作
  refreshUsers: () => Promise<void>
  loadMore: () => void
  resetFilters: () => void
  
  // 用户操作
  addToFavorites: (userId: string) => void
  removeFromFavorites: (userId: string) => void
  hideUser: (userId: string) => void
  showUser: (userId: string) => void
  sendCoffeeInvitation: (userId: string) => Promise<boolean>
  
  // 工具函数
  getUserById: (userId: string) => NomadUser | null
  getFavorites: () => string[]
  getHiddenUsers: () => string[]
}

const DEFAULT_FILTERS: UserFilters = {
  searchQuery: '',
  maxDistance: 50,
  interests: [],
  onlineOnly: false,
  availableOnly: false
}

const DEFAULT_OPTIONS: UseNomadUsersOptions = {
  enablePagination: true,
  pageSize: 9,
  enableInfiniteScroll: false,
  enableRealTimeUpdates: true,
  updateInterval: 30000
}

export function useNomadUsers(options: UseNomadUsersOptions = {}): UseNomadUsersReturn {
  console.log('🔍 useNomadUsers Hook initialized', { options })
  logInfo('useNomadUsers Hook initialized', { options }, 'useNomadUsers')
  
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const { location } = useLocation()
  const { user } = useUser()
  
  logInfo('useNomadUsers Hook - user and location loaded', { 
    userId: user?.profile?.id, 
    userName: user?.profile?.name,
    isAuthenticated: user?.isAuthenticated,
    location: location 
  }, 'useNomadUsers')
  
  console.log('🔍 useNomadUsers - user and location loaded', { 
    userId: user?.profile?.id, 
    userName: user?.profile?.name,
    isAuthenticated: user?.isAuthenticated,
    location: location 
  })
  
  // 状态管理
  const [allUsers, setAllUsers] = useState<NomadUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<NomadUser[]>([])
  const [displayedUsers, setDisplayedUsers] = useState<NomadUser[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<UserFilters>(DEFAULT_FILTERS)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const [hiddenUsers, setHiddenUsers] = useState<string[]>([])
  
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastUpdateRef = useRef<number>(0)
  
  console.log('🔍 useNomadUsers - state initialized', { 
    allUsersCount: allUsers.length,
    loading: loading,
    error: error
  })

  // 错误处理工具函数
  const handleError = useCallback((error: any, context: string) => {
    const errorMessage = error?.message || 'An unexpected error occurred'
    logError(`[useNomadUsers] ${context}`, error, 'useNomadUsers')
    setError(errorMessage)
    
    // 自动清除错误（5秒后）
    setTimeout(() => setError(null), 5000)
  }, [])

  // 清除错误
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // 计算距离
  const calculateDistance = useCallback((userLocation: string, currentLocation: any): number => {
    if (!currentLocation || !userLocation || userLocation === 'Unknown Location') {
      return 999 // 未知距离
    }
    
    try {
      // 如果用户资料中有坐标信息，使用真实距离计算
      const userProfile = JSON.parse(localStorage.getItem('user_profile_details') || '{}')
      if (userProfile.coordinates && currentLocation.lat && currentLocation.lng) {
        return calculateHaversineDistance(
          currentLocation.lat, currentLocation.lng,
          userProfile.coordinates.lat, userProfile.coordinates.lng
        )
      }
    } catch (e) {
      logError('Error calculating distance', e, 'useNomadUsers')
    }
    
    // 如果没有坐标信息，返回随机距离作为fallback
    return Math.round((Math.random() * 100) + Number.EPSILON) / 10
  }, [])

  // 使用Haversine公式计算两点间距离（公里）
  const calculateHaversineDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
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
  }, [])

  // 计算在线状态（基于最后活动时间）
  const calculateOnlineStatus = useCallback((lastUpdated: string): boolean => {
    if (!lastUpdated) return false
    try {
      const lastUpdate = new Date(lastUpdated)
      const now = new Date()
      const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60)
      return diffMinutes <= 30 // 30分钟内活跃视为在线
    } catch (e) {
      logError('Error calculating online status', e, 'useNomadUsers')
      return false
    }
  }, [])

  // 计算可用状态（基于最后活动时间）
  const calculateAvailabilityStatus = useCallback((lastUpdated: string): boolean => {
    if (!lastUpdated) return false
    try {
      const lastUpdate = new Date(lastUpdated)
      const now = new Date()
      const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60)
      return diffMinutes <= 60 // 1小时内活跃视为可用
    } catch (e) {
      logError('Error calculating availability status', e, 'useNomadUsers')
      return false
    }
  }, [])

  // 计算最后在线时间显示
  const calculateLastSeen = useCallback((lastUpdated: string): string => {
    if (!lastUpdated) return 'Unknown'
    try {
      const lastUpdate = new Date(lastUpdated)
      const now = new Date()
      const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60)
      
      if (diffMinutes < 1) return 'Just now'
      if (diffMinutes < 60) return `${Math.floor(diffMinutes)}m ago`
      if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`
      return `${Math.floor(diffMinutes / 1440)}d ago`
    } catch (e) {
      logError('Error calculating last seen', e, 'useNomadUsers')
      return 'Unknown'
    }
  }, [])

  // 计算共同兴趣
  const calculateMutualInterests = useCallback((userInterests: string[]): string[] => {
    if (!user.isAuthenticated || !user.profile) return []
    
    try {
      const currentUserProfile = localStorage.getItem('user_profile_details')
      if (currentUserProfile) {
        const currentProfile = JSON.parse(currentUserProfile)
        const currentInterests = currentProfile.interests || []
        
        return userInterests.filter(interest => 
          currentInterests.includes(interest)
        )
      }
    } catch (error) {
      logError('Error calculating mutual interests', error, 'useNomadUsers')
    }
    
    return []
  }, [user.isAuthenticated, user.profile])

  // 计算兼容性
  const calculateCompatibility = useCallback((userInterests: string[]): number => {
    if (!user.isAuthenticated || !user.profile) return 0
    
    try {
      const currentUserProfile = localStorage.getItem('user_profile_details')
      if (currentUserProfile) {
        const currentProfile = JSON.parse(currentUserProfile)
        const currentInterests = currentProfile.interests || []
        
        if (currentInterests.length === 0 || userInterests.length === 0) {
          return 50 // 默认兼容性
        }
        
        const commonInterests = userInterests.filter(interest => 
          currentProfile.interests.includes(interest)
        )
        
        return Math.round((commonInterests.length / Math.max(currentInterests.length, userInterests.length)) * 100)
      }
    } catch (error) {
      logError('Error calculating compatibility', error, 'useNomadUsers')
    }
    
    return 50
  }, [user.isAuthenticated, user.profile])

  // 获取所有注册用户
  const getAllRegisteredUsers = useCallback(async (): Promise<NomadUser[]> => {
    console.log('🔍 getAllRegisteredUsers - function called')
    try {
      const users: NomadUser[] = []
      const processedUserIds = new Set<string>() // 防止重复用户
      
      // 首先尝试从服务器获取所有用户
      try {
        console.log('🔍 getAllRegisteredUsers - fetching users from server')
        const response = await fetch('/api/users?include_hidden=false')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.users) {
            console.log('🔍 getAllRegisteredUsers - server users loaded', { 
              count: data.users.length,
              userNames: data.users.map((u: any) => u.name)
            })
            
            // 处理服务器用户数据
            data.users.forEach((userData: any) => {
              if (!processedUserIds.has(userData.id)) {
                processedUserIds.add(userData.id)
                
                // 获取用户评分摘要
                const ratingSummary = ratingSystem.getUserRatingSummary(userData.id)
                
                const nomadUser: NomadUser = {
                  id: userData.id,
                  name: userData.name,
                  avatar: userData.avatar,
                  profession: userData.profession,
                  company: userData.company,
                  location: userData.location,
                  distance: 0, // 将在后面计算
                  interests: userData.interests,
                  rating: ratingSummary?.averageRating || 0,
                  reviewCount: ratingSummary?.totalRatings || 0,
                  isOnline: calculateOnlineStatus(userData.updatedAt),
                  isAvailable: calculateAvailabilityStatus(userData.updatedAt),
                  lastSeen: calculateLastSeen(userData.updatedAt),
                  meetupCount: 0,
                  mutualInterests: calculateMutualInterests(userData.interests || []),
                  compatibility: calculateCompatibility(userData.interests || []),
                  bio: userData.bio,
                  ratingSummary: ratingSummary || undefined,
                  coordinates: userData.coordinates
                }
                
                users.push(nomadUser)
                console.log('🔍 getAllRegisteredUsers - added server user to list', { 
                  userId: userData.id, 
                  name: userData.name, 
                  location: userData.location,
                  totalUsers: users.length,
                  processedUserIds: Array.from(processedUserIds)
                })
              }
            })
            
            console.log('🔍 getAllRegisteredUsers - server users processed', { 
              count: users.length, 
              userIds: users.map(u => u.id), 
              userNames: users.map(u => u.name) 
            })
            return users
          }
        }
      } catch (serverError) {
        console.error('🔍 getAllRegisteredUsers - server fetch failed', serverError)
        logError('Failed to fetch users from server', serverError, 'useNomadUsers')
      }
      
      // 如果服务器获取失败，回退到localStorage
      console.log('🔍 getAllRegisteredUsers - falling back to localStorage')
      
      // 获取所有用户的独立profile存储
      const keys = Object.keys(localStorage)
      const independentProfileKeys = keys.filter(key => key.startsWith('user_profile_details_'))
      
      // 同时检查通用profile（向后兼容）
      const generalProfileKey = 'user_profile_details'
      const hasGeneralProfile = localStorage.getItem(generalProfileKey) !== null
      
      // 合并所有profile keys
      const profileKeys = [...independentProfileKeys]
      if (hasGeneralProfile) {
        profileKeys.push(generalProfileKey)
      }
      
      // 检查是否有其他用户相关的localStorage数据
      const allUserKeys = keys.filter(key => 
        key.includes('user') || 
        key.includes('profile') || 
        key.includes('nomad') ||
        key.includes('test')
      )
      
      console.log('🔍 getAllRegisteredUsers - found profile keys', { 
        independentProfileKeys, 
        hasGeneralProfile, 
        profileKeys, 
        totalKeys: keys.length,
        allUserKeys: allUserKeys.slice(0, 10) // 只显示前10个，避免日志过长
      })
      logInfo('Found profile keys', { profileKeys, totalKeys: keys.length }, 'useNomadUsers')
      
      // 处理每个profile key
      for (const key of profileKeys) {
        try {
          const profileData = localStorage.getItem(key)
          if (profileData) {
            const profile = JSON.parse(profileData)
            console.log('🔍 getAllRegisteredUsers - processing profile', { key, profileId: profile.id, profileName: profile.name })
          }
        } catch (e) {
          console.error('🔍 getAllRegisteredUsers - error parsing profile', { key, error: e })
        }
      }
      
      profileKeys.forEach(key => {
        try {
          const profileData = localStorage.getItem(key)
          if (profileData) {
            const profile = JSON.parse(profileData)
            if (profile.id && profile.name && !processedUserIds.has(profile.id)) {
              processedUserIds.add(profile.id)
              
              // 获取用户评分摘要
              const ratingSummary = ratingSystem.getUserRatingSummary(profile.id)
              
              const nomadUser: NomadUser = {
                id: profile.id,
                name: profile.name,
                avatar: profile.avatar_url || (profile.name ? profile.name.substring(0, 2).toUpperCase() : 'NN'),
                profession: profile.profession || 'Digital Nomad',
                company: profile.company || 'Freelance',
                location: profile.current_city || 'Unknown Location',
                distance: 0, // 将在后面计算
                interests: profile.interests || ['Travel', 'Technology'],
                rating: ratingSummary?.averageRating || 0,
                reviewCount: ratingSummary?.totalRatings || 0,
                isOnline: calculateOnlineStatus(profile.updated_at),
                isAvailable: calculateAvailabilityStatus(profile.updated_at),
                lastSeen: calculateLastSeen(profile.updated_at),
                meetupCount: 0,
                mutualInterests: calculateMutualInterests(profile.interests || []),
                compatibility: calculateCompatibility(profile.interests || []),
                bio: profile.bio || 'Digital nomad exploring the world!',
                ratingSummary: ratingSummary || undefined,
                coordinates: profile.coordinates
              }
              
              users.push(nomadUser)
              console.log('🔍 getAllRegisteredUsers - added user to list', { 
                userId: profile.id, 
                name: profile.name, 
                location: profile.current_city,
                totalUsers: users.length,
                processedUserIds: Array.from(processedUserIds)
              })
              logInfo('Added user to list', { userId: profile.id, name: profile.name, location: profile.current_city }, 'useNomadUsers')
            }
          }
        } catch (error) {
          logError('Error parsing profile', error, 'useNomadUsers')
        }
      })
      
      console.log('🔍 getAllRegisteredUsers - final result', { count: users.length, userIds: users.map(u => u.id), userNames: users.map(u => u.name) })
      logInfo('Total users loaded', { count: users.length, userIds: users.map(u => u.id) }, 'useNomadUsers')
      return users
    } catch (error) {
      console.error('🔍 getAllRegisteredUsers - error', error)
      logError('Error getting registered users', error, 'useNomadUsers')
      return []
    }
  }, [calculateOnlineStatus, calculateAvailabilityStatus, calculateLastSeen, calculateMutualInterests, calculateCompatibility])

  // 应用筛选器
  const applyFilters = useCallback((users: NomadUser[], filters: UserFilters): NomadUser[] => {
    return users.filter(user => {
      // 搜索筛选
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        const matchesSearch = 
          user.name.toLowerCase().includes(query) ||
          user.profession.toLowerCase().includes(query) ||
          user.location.toLowerCase().includes(query) ||
          user.interests.some(interest => interest.toLowerCase().includes(query))
        
        if (!matchesSearch) return false
      }
      
      // 距离筛选
      if (user.distance > filters.maxDistance) return false
      
      // 兴趣筛选
      if (filters.interests.length > 0) {
        const hasMatchingInterest = filters.interests.some(interest => 
          user.interests.includes(interest)
        )
        if (!hasMatchingInterest) return false
      }
      
      // 在线状态筛选
      if (filters.onlineOnly && !user.isOnline) return false
      
      // 可用状态筛选
      if (filters.availableOnly && !user.isAvailable) return false
      
      return true
    })
  }, [])

  // 加载用户数据
  const loadUsers = useCallback(async () => {
    console.log('🔍 loadUsers - function called')
    try {
      setLoading(true)
      clearError()
      
      console.log('🔍 loadUsers - starting to load users', { 
        hiddenUsersCount: hiddenUsers.length,
        hiddenUserIds: hiddenUsers,
        currentLocation: location 
      })
      
      logInfo('Starting to load users', { 
        hiddenUsersCount: hiddenUsers.length,
        hiddenUserIds: hiddenUsers,
        currentLocation: location 
      }, 'useNomadUsers')
      
      // 初始化评分系统
      ratingSystem.initializeRealData()
      
      // 获取所有用户
      const allRegisteredUsers = await getAllRegisteredUsers()
      console.log('🔍 loadUsers - all registered users loaded', { 
        count: allRegisteredUsers.length,
        userNames: allRegisteredUsers.map(u => u.name),
        userIds: allRegisteredUsers.map(u => u.id)
      })
      logInfo('All registered users loaded', { 
        count: allRegisteredUsers.length,
        userNames: allRegisteredUsers.map(u => u.name)
      }, 'useNomadUsers')
      
      // 过滤隐藏用户
      const visibleUsers = allRegisteredUsers.filter(user => !hiddenUsers.includes(user.id))
      logInfo('After filtering hidden users', { 
        visibleCount: visibleUsers.length,
        hiddenCount: allRegisteredUsers.length - visibleUsers.length
      }, 'useNomadUsers')
      
      // 计算距离
      const usersWithDistance = visibleUsers.map(user => ({
        ...user,
        distance: calculateDistance(user.location, location)
      }))
      
      // 按距离排序
      const sortedUsers = usersWithDistance.sort((a, b) => a.distance - b.distance)
      
      setAllUsers(sortedUsers)
      
      // 应用筛选器
      const filtered = applyFilters(sortedUsers, filters)
      setFilteredUsers(filtered)
      
      // 计算统计数据
      const availableUsers = sortedUsers.filter(u => u.isOnline && u.isAvailable).length
      const onlineUsers = sortedUsers.filter(u => u.isOnline).length
      
      setStats({
        totalUsers: sortedUsers.length,
        availableUsers,
        onlineUsers,
        todayMeetups: 0, // TODO: 从真实数据获取
        successRate: 94 // TODO: 从真实数据获取
      })
      
      console.log('🔍 loadUsers - final state update', { 
        total: sortedUsers.length, 
        filtered: filtered.length,
        available: availableUsers,
        online: onlineUsers,
        finalUserNames: sortedUsers.map(u => u.name),
        finalUserIds: sortedUsers.map(u => u.id)
      })
      
      logInfo('Users loaded successfully', { 
        total: sortedUsers.length, 
        filtered: filtered.length,
        available: availableUsers,
        online: onlineUsers,
        finalUserNames: sortedUsers.map(u => u.name)
      }, 'useNomadUsers')
      
    } catch (error) {
      handleError(error, 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [getAllRegisteredUsers, hiddenUsers, location, calculateDistance, applyFilters, filters, clearError, handleError])

  // 刷新用户数据
  const refreshUsers = useCallback(async () => {
    await loadUsers()
  }, [loadUsers])

  // 加载更多用户（分页）
  const loadMore = useCallback(() => {
    if (!opts.enablePagination || !hasMore) return
    
    const nextPage = currentPage + 1
    const startIndex = 0
    const endIndex = nextPage * (opts.pageSize || 9)
    const newDisplayedUsers = filteredUsers.slice(startIndex, endIndex)
    
    setDisplayedUsers(newDisplayedUsers)
    setCurrentPage(nextPage)
    setHasMore(endIndex < filteredUsers.length)
  }, [opts.enablePagination, opts.pageSize, hasMore, currentPage, filteredUsers])

  // 设置筛选器
  const setFilters = useCallback((newFilters: Partial<UserFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1) // 重置分页
  }, [])

  // 重置筛选器
  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS)
    setCurrentPage(1)
  }, [])

  // 用户操作
  const addToFavorites = useCallback((userId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(userId) ? prev : [...prev, userId]
      localStorage.setItem('nomadFavorites', JSON.stringify(newFavorites))
      return newFavorites
    })
  }, [])

  const removeFromFavorites = useCallback((userId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.filter(id => id !== userId)
      localStorage.setItem('nomadFavorites', JSON.stringify(newFavorites))
      return newFavorites
    })
  }, [])

  const hideUser = useCallback((userId: string) => {
    setHiddenUsers(prev => {
      const newHiddenUsers = [...prev, userId]
      localStorage.setItem('hidden_nomad_users', JSON.stringify(newHiddenUsers))
      return newHiddenUsers
    })
    logInfo('User hidden', { userId }, 'useNomadUsers')
  }, [])

  const showUser = useCallback((userId: string) => {
    setHiddenUsers(prev => {
      const newHiddenUsers = prev.filter(id => id !== userId)
      localStorage.setItem('hidden_nomad_users', JSON.stringify(newHiddenUsers))
      return newHiddenUsers
    })
    logInfo('User shown', { userId }, 'useNomadUsers')
  }, [])

  const sendCoffeeInvitation = useCallback(async (userId: string): Promise<boolean> => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const targetUser = allUsers.find(u => u.id === userId)
      if (!targetUser) {
        throw new Error('User not found')
      }
      
      logInfo('Coffee invitation sent', { userId, targetUserName: targetUser.name }, 'useNomadUsers')
      return true
    } catch (error) {
      handleError(error, 'Failed to send coffee invitation')
      return false
    }
  }, [allUsers, handleError])

  // 工具函数
  const getUserById = useCallback((userId: string): NomadUser | null => {
    return allUsers.find(user => user.id === userId) || null
  }, [allUsers])

  const getFavorites = useCallback((): string[] => {
    return favorites
  }, [favorites])

  const getHiddenUsers = useCallback((): string[] => {
    return hiddenUsers
  }, [hiddenUsers])

  // 初始化
  useEffect(() => {
    // 加载收藏和隐藏用户列表
    try {
      const savedFavorites = localStorage.getItem('nomadFavorites')
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites))
      }
      
      const savedHiddenUsers = localStorage.getItem('hidden_nomad_users')
      if (savedHiddenUsers) {
        setHiddenUsers(JSON.parse(savedHiddenUsers))
      }
    } catch (error) {
      logError('Failed to load user preferences', error, 'useNomadUsers')
    }
  }, [])

  // 加载用户数据
  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // 筛选器变化时重新筛选
  useEffect(() => {
    const filtered = applyFilters(allUsers, filters)
    setFilteredUsers(filtered)
    
    // 重置分页
    setCurrentPage(1)
    const initialDisplay = opts.enablePagination 
      ? filtered.slice(0, opts.pageSize || 9)
      : filtered
    setDisplayedUsers(initialDisplay)
    setHasMore(opts.enablePagination ? (opts.pageSize || 9) < filtered.length : false)
  }, [allUsers, filters, applyFilters, opts.enablePagination, opts.pageSize])

  // 实时更新
  useEffect(() => {
    if (!opts.enableRealTimeUpdates) return
    
    const interval = setInterval(() => {
      const now = Date.now()
      if (now - lastUpdateRef.current >= (opts.updateInterval || 30000)) {
        loadUsers()
        lastUpdateRef.current = now
      }
    }, opts.updateInterval || 30000)
    
    updateIntervalRef.current = interval
    
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
      }
    }
  }, [opts.enableRealTimeUpdates, opts.updateInterval, loadUsers])

  // 监听localStorage变化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && (e.key.startsWith('user_profile_details') || e.key === 'hidden_nomad_users')) {
        loadUsers()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // 监听自定义事件
    const handleCustomStorageChange = () => {
      loadUsers()
    }
    
    window.addEventListener('localStorageChange', handleCustomStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('localStorageChange', handleCustomStorageChange)
    }
  }, [loadUsers])

  // 计算总页数
  const totalPages = opts.enablePagination 
    ? Math.ceil(filteredUsers.length / (opts.pageSize || 9))
    : 1

  return {
    // 数据
    users: displayedUsers,
    stats,
    filteredUsers,
    
    // 状态
    loading,
    error,
    hasMore,
    currentPage,
    totalPages,
    
    // 筛选
    filters,
    setFilters,
    
    // 操作
    refreshUsers,
    loadMore,
    resetFilters,
    
    // 用户操作
    addToFavorites,
    removeFromFavorites,
    hideUser,
    showUser,
    sendCoffeeInvitation,
    
    // 工具函数
    getUserById,
    getFavorites,
    getHiddenUsers
  }
}
