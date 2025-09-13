'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useLocation } from '@/hooks/useLocation'
import { useUser } from '@/contexts/GlobalStateContext'
import { ratingSystem, UserRatingSummary } from '@/lib/ratingSystem'
import { logInfo, logError } from '@/lib/logger'
import { userPreferencesService } from '@/lib/userPreferencesService'

export interface NomadUser {
  id: string
  name: string
  avatar: string
  avatar_url?: string // 添加avatar_url字段以保持兼容性
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
  goToPage: (page: number) => void
  resetFilters: () => void
  
  // 用户操作
  addToFavorites: (userId: string) => Promise<void>
  removeFromFavorites: (userId: string) => Promise<void>
  hideUser: (userId: string) => Promise<void>
  showUser: (userId: string) => Promise<void>
  sendCoffeeInvitation: (userId: string) => Promise<boolean>
  sendWorkTogetherInvitation: (userId: string) => Promise<boolean>
  
  // 工具函数
  getUserById: (userId: string) => NomadUser | null
  getFavorites: () => Promise<string[]>
  getHiddenUsers: () => Promise<string[]>
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
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const { location } = useLocation()
  const { user } = useUser()
  
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
      return 0 // 当位置不可用时，设置为0，避免被距离过滤器排除
    }
    
    try {
      // 如果用户资料中有坐标信息，使用真实距离计算
      if (typeof window !== 'undefined' && window.localStorage) {
        const userProfile = JSON.parse(localStorage.getItem('user_profile_details') || '{}')
        if (userProfile.coordinates && currentLocation.lat && currentLocation.lng) {
          return calculateHaversineDistance(
            currentLocation.lat, currentLocation.lng,
            userProfile.coordinates.lat, userProfile.coordinates.lng
          )
        }
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
      return diffMinutes <= 120 // 2小时内活跃视为在线
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
      return diffMinutes <= 480 // 8小时内活跃视为可用
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
    // 开发环境下记录调试信息
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 getAllRegisteredUsers - function called')
    }
    try {
      const users: NomadUser[] = []
      const processedUserIds = new Set<string>() // 防止重复用户
      
      // 首先尝试从服务器获取所有用户
      try {
        console.log('🔍 getAllRegisteredUsers - fetching users from server')
        const response = await fetch('/api/users?include_hidden=false')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.users && data.users.length > 0) {
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
                  avatar_url: userData.avatar, // 添加avatar_url字段以保持兼容性
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
        // 使用模拟数据作为后备
        console.log('🔍 getAllRegisteredUsers - using mock data as fallback')
        return getMockUsers()
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
              
              const isOnline = calculateOnlineStatus(profile.updated_at)
              const isAvailable = calculateAvailabilityStatus(profile.updated_at)
              const lastSeen = calculateLastSeen(profile.updated_at)
              
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
                isOnline,
                isAvailable,
                lastSeen,
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

  // 获取模拟用户数据
  const getMockUsers = useCallback((): NomadUser[] => {
    const mockUsers: NomadUser[] = [
      {
        id: 'mock-1',
        name: 'Alex Chen',
        avatar: 'AC',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        profession: 'Software Developer',
        company: 'Tech Startup',
        location: 'Tokyo, Japan',
        distance: 2.5,
        interests: ['Technology', 'Coffee', 'Travel', 'Photography'],
        rating: 4.8,
        reviewCount: 12,
        isOnline: true,
        isAvailable: true,
        lastSeen: '2 minutes ago',
        meetupCount: 5,
        mutualInterests: ['Technology', 'Coffee'],
        compatibility: 85,
        bio: 'Digital nomad exploring Asia. Love coffee, coding, and meeting new people!',
        coordinates: { lat: 35.6762, lng: 139.6503 }
      },
      {
        id: 'mock-2',
        name: 'Sarah Johnson',
        avatar: 'SJ',
        avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        profession: 'UX Designer',
        company: 'Remote Agency',
        location: 'Lisbon, Portugal',
        distance: 15.2,
        interests: ['Design', 'Art', 'Coffee', 'Networking'],
        rating: 4.6,
        reviewCount: 8,
        isOnline: true,
        isAvailable: true,
        lastSeen: '5 minutes ago',
        meetupCount: 3,
        mutualInterests: ['Design', 'Coffee'],
        compatibility: 75,
        bio: 'Creative designer working remotely from beautiful Lisbon. Always up for a coffee chat!',
        coordinates: { lat: 38.7223, lng: -9.1393 }
      },
      {
        id: 'mock-3',
        name: 'Mike Rodriguez',
        avatar: 'MR',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        profession: 'Marketing Consultant',
        company: 'Freelance',
        location: 'Bangkok, Thailand',
        distance: 8.7,
        interests: ['Marketing', 'Food', 'Travel', 'Business'],
        rating: 4.4,
        reviewCount: 6,
        isOnline: true,
        isAvailable: false,
        lastSeen: '1 hour ago',
        meetupCount: 2,
        mutualInterests: ['Travel', 'Business'],
        compatibility: 65,
        bio: 'Marketing consultant living the digital nomad life in Bangkok. Love exploring local food!',
        coordinates: { lat: 13.7563, lng: 100.5018 }
      },
      {
        id: 'mock-4',
        name: 'Emma Wilson',
        avatar: 'EW',
        avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        profession: 'Content Creator',
        company: 'Personal Brand',
        location: 'Berlin, Germany',
        distance: 12.1,
        interests: ['Content Creation', 'Travel', 'Photography', 'Social Media'],
        rating: 4.9,
        reviewCount: 15,
        isOnline: true,
        isAvailable: true,
        lastSeen: 'just now',
        meetupCount: 7,
        mutualInterests: ['Travel', 'Photography'],
        compatibility: 80,
        bio: 'Content creator and travel blogger. Always looking for new adventures and connections!',
        coordinates: { lat: 52.5200, lng: 13.4050 }
      },
      {
        id: 'mock-5',
        name: 'David Kim',
        avatar: 'DK',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        profession: 'Data Scientist',
        company: 'Tech Company',
        location: 'Mexico City, Mexico',
        distance: 18.5,
        interests: ['Data Science', 'Technology', 'Travel', 'Coffee'],
        rating: 4.7,
        reviewCount: 10,
        isOnline: false,
        isAvailable: false,
        lastSeen: '3 hours ago',
        meetupCount: 4,
        mutualInterests: ['Technology', 'Coffee'],
        compatibility: 70,
        bio: 'Data scientist working remotely. Love analyzing data and exploring new cities!',
        coordinates: { lat: 19.4326, lng: -99.1332 }
      }
    ]
    
    console.log('🔍 getMockUsers - returning mock data', { count: mockUsers.length })
    return mockUsers
  }, [])

  // 应用筛选器
  const applyFilters = useCallback((users: NomadUser[], filters: UserFilters): NomadUser[] => {
    console.log('🔍 applyFilters - starting', { 
      usersCount: users.length,
      filters: filters,
      firstUser: users[0] ? {
        id: users[0].id,
        name: users[0].name,
        isOnline: users[0].isOnline,
        isAvailable: users[0].isAvailable,
        location: users[0].location,
        distance: users[0].distance
      } : null
    })
    
    const result = users.filter((user, index) => {
      // 搜索筛选
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        const matchesSearch = 
          user.name.toLowerCase().includes(query) ||
          user.profession.toLowerCase().includes(query) ||
          user.location.toLowerCase().includes(query) ||
          user.interests.some(interest => interest.toLowerCase().includes(query))
        
        if (!matchesSearch) {
          console.log(`🔍 applyFilters - user ${index} filtered by search`, { userId: user.id, name: user.name, query: filters.searchQuery })
          return false
        }
      }
      
      // 距离筛选
      if (filters.maxDistance && user.distance > filters.maxDistance) {
        console.log(`🔍 applyFilters - user filtered by distance`, { userId: user.id, name: user.name, distance: user.distance, maxDistance: filters.maxDistance })
        return false
      }
      
      // 兴趣筛选
      if (filters.interests.length > 0) {
        const hasMatchingInterest = filters.interests.some(interest => 
          user.interests.includes(interest)
        )
        if (!hasMatchingInterest) {
          console.log(`🔍 applyFilters - user ${index} filtered by interests`, { userId: user.id, name: user.name, userInterests: user.interests, filterInterests: filters.interests })
          return false
        }
      }
      
      // 在线状态筛选 - 为缺失的属性提供默认值
      if (filters.onlineOnly && !(user.isOnline ?? true)) {
        console.log(`🔍 applyFilters - user ${index} filtered by online status`, { userId: user.id, name: user.name, isOnline: user.isOnline })
        return false
      }
      
      // 可用状态筛选 - 为缺失的属性提供默认值
      if (filters.availableOnly && !(user.isAvailable ?? true)) {
        console.log(`🔍 applyFilters - user ${index} filtered by available status`, { userId: user.id, name: user.name, isAvailable: user.isAvailable })
        return false
      }
      
      console.log(`🔍 applyFilters - user ${index} passed all filters`, { userId: user.id, name: user.name })
      return true
    })
    
    console.log('🔍 applyFilters - result', { 
      originalCount: users.length,
      filteredCount: result.length,
      filteredUsers: result.map(u => ({ id: u.id, name: u.name }))
    })
    
    return result
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
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 loadUsers - applying filters', { 
          sortedUsersCount: sortedUsers.length,
          filters: filters,
          firstUser: sortedUsers[0] ? {
            id: sortedUsers[0].id,
            name: sortedUsers[0].name,
            isOnline: sortedUsers[0].isOnline,
            isAvailable: sortedUsers[0].isAvailable
          } : null
        })
      }
      const filtered = applyFilters(sortedUsers, filters)
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 loadUsers - filter result', { 
          originalCount: sortedUsers.length,
          filteredCount: filtered.length,
          filteredUsers: filtered.map(u => ({ id: u.id, name: u.name }))
        })
      }
      setFilteredUsers(filtered)
      
      // 计算统计数据 - 为缺失的属性提供默认值
      const availableUsers = sortedUsers.filter(u => (u.isOnline ?? true) && (u.isAvailable ?? true)).length
      const onlineUsers = sortedUsers.filter(u => u.isOnline ?? true).length
      
      setStats({
        totalUsers: sortedUsers.length,
        availableUsers,
        onlineUsers,
        todayMeetups: 0, // TODO: 从真实数据获取
        successRate: 94 // TODO: 从真实数据获取
      })
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 loadUsers - final state update', { 
          total: sortedUsers.length, 
          filtered: filtered.length,
          available: availableUsers,
          online: onlineUsers,
          finalUserNames: sortedUsers.map(u => u.name),
          finalUserIds: sortedUsers.map(u => u.id)
        })
      }
      
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
    logInfo('Manual user data refresh triggered', null, 'useNomadUsers')
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

  // 跳转到指定页面
  const goToPage = useCallback((page: number) => {
    if (!opts.enablePagination || page < 1) return
    
    const totalPages = Math.ceil(filteredUsers.length / (opts.pageSize || 9))
    if (page > totalPages) return
    
    const startIndex = (page - 1) * (opts.pageSize || 9)
    const endIndex = startIndex + (opts.pageSize || 9)
    const newDisplayedUsers = filteredUsers.slice(startIndex, endIndex)
    
    setDisplayedUsers(newDisplayedUsers)
    setCurrentPage(page)
    setHasMore(endIndex < filteredUsers.length)
  }, [opts.enablePagination, opts.pageSize, filteredUsers])

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
  const addToFavorites = useCallback(async (userId: string) => {
    if (!user?.profile?.id) return
    
    try {
      const success = await userPreferencesService.addToFavorites(user.profile.id, userId)
      if (success) {
        setFavorites(prev => {
          const newFavorites = prev.includes(userId) ? prev : [...prev, userId]
          return newFavorites
        })
      }
    } catch (error) {
      logError('Failed to add user to favorites', error, 'useNomadUsers')
    }
  }, [user?.profile?.id])

  const removeFromFavorites = useCallback(async (userId: string) => {
    if (!user?.profile?.id) return
    
    try {
      const success = await userPreferencesService.removeFromFavorites(user.profile.id, userId)
      if (success) {
        setFavorites(prev => {
          const newFavorites = prev.filter(id => id !== userId)
          return newFavorites
        })
      }
    } catch (error) {
      logError('Failed to remove user from favorites', error, 'useNomadUsers')
    }
  }, [user?.profile?.id])

  const hideUser = useCallback(async (userId: string) => {
    if (!user?.profile?.id) return
    
    try {
      const success = await userPreferencesService.hideUser(user.profile.id, userId)
      if (success) {
        setHiddenUsers(prev => {
          const newHiddenUsers = [...prev, userId]
          return newHiddenUsers
        })
        logInfo('User hidden', { userId }, 'useNomadUsers')
      }
    } catch (error) {
      logError('Failed to hide user', error, 'useNomadUsers')
    }
  }, [user?.profile?.id])

  const showUser = useCallback(async (userId: string) => {
    if (!user?.profile?.id) return
    
    try {
      const success = await userPreferencesService.showUser(user.profile.id, userId)
      if (success) {
        setHiddenUsers(prev => {
          const newHiddenUsers = prev.filter(id => id !== userId)
          return newHiddenUsers
        })
        logInfo('User shown', { userId }, 'useNomadUsers')
      }
    } catch (error) {
      logError('Failed to show user', error, 'useNomadUsers')
    }
  }, [user?.profile?.id])

  const sendCoffeeInvitation = useCallback(async (userId: string): Promise<boolean> => {
    try {
      if (!user?.profile?.id) {
        throw new Error('User not authenticated')
      }

      const targetUser = allUsers.find(u => u.id === userId)
      if (!targetUser) {
        throw new Error('User not found')
      }

      // Import invitation service dynamically to avoid circular dependencies
      const { invitationService } = await import('@/lib/invitationService')
      
      const result = await invitationService.createInvitation({
        sender_id: user.profile.id,
        receiver_id: userId,
        invitation_type: 'coffee_meetup',
        message: `Hi ${targetUser.name}! Would you like to meet for coffee? I'd love to connect with a fellow digital nomad!`
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to send invitation')
      }
      
      logInfo('Coffee invitation sent successfully', { 
        userId, 
        targetUserName: targetUser.name,
        invitationId: result.data?.id 
      }, 'useNomadUsers')
      
      return true
    } catch (error) {
      handleError(error, 'Failed to send coffee invitation')
      return false
    }
  }, [allUsers, handleError, user?.profile?.id])

  const sendWorkTogetherInvitation = useCallback(async (userId: string): Promise<boolean> => {
    try {
      if (!user?.profile?.id) {
        throw new Error('User not authenticated')
      }

      const targetUser = allUsers.find(u => u.id === userId)
      if (!targetUser) {
        throw new Error('User not found')
      }

      // Import invitation service dynamically to avoid circular dependencies
      const { invitationService } = await import('@/lib/invitationService')
      
      const result = await invitationService.createInvitation({
        sender_id: user.profile.id,
        receiver_id: userId,
        invitation_type: 'work_together',
        message: `Hi ${targetUser.name}! Would you like to work together? I think we could collaborate on some interesting projects!`
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to send invitation')
      }
      
      logInfo('Work together invitation sent successfully', { 
        userId, 
        targetUserName: targetUser.name,
        invitationId: result.data?.id 
      }, 'useNomadUsers')
      
      return true
    } catch (error) {
      handleError(error, 'Failed to send work together invitation')
      return false
    }
  }, [allUsers, handleError, user?.profile?.id])

  // 工具函数
  const getUserById = useCallback((userId: string): NomadUser | null => {
    return allUsers.find(user => user.id === userId) || null
  }, [allUsers])

  const getFavorites = useCallback(async (): Promise<string[]> => {
    if (!user?.profile?.id) return favorites
    
    try {
      const dbFavorites = await userPreferencesService.getFavorites(user.profile.id)
      if (dbFavorites.length !== favorites.length) {
        setFavorites(dbFavorites)
      }
      return dbFavorites
    } catch (error) {
      logError('Failed to get favorites from database', error, 'useNomadUsers')
      return favorites
    }
  }, [favorites, user?.profile?.id])

  const getHiddenUsers = useCallback(async (): Promise<string[]> => {
    if (!user?.profile?.id) return hiddenUsers
    
    try {
      const dbHiddenUsers = await userPreferencesService.getHiddenUsers(user.profile.id)
      if (dbHiddenUsers.length !== hiddenUsers.length) {
        setHiddenUsers(dbHiddenUsers)
      }
      return dbHiddenUsers
    } catch (error) {
      logError('Failed to get hidden users from database', error, 'useNomadUsers')
      return hiddenUsers
    }
  }, [hiddenUsers, user?.profile?.id])

  // 初始化
  useEffect(() => {
    // 加载收藏和隐藏用户列表
    const loadUserPreferences = async () => {
      if (!user?.profile?.id) {
        // 如果用户未登录，设置为空数组
        setFavorites([])
        setHiddenUsers([])
        return
      }

      // 如果用户已登录，从数据库加载
      try {
        const preferences = await userPreferencesService.getUserPreferences(user.profile.id)
        setFavorites(preferences.favorites)
        setHiddenUsers(preferences.hidden_users)
      } catch (error) {
        logError('Failed to load user preferences from database', error, 'useNomadUsers')
        // 如果数据库失败，设置为空数组
        setFavorites([])
        setHiddenUsers([])
      }
    }

    loadUserPreferences()
  }, [user?.profile?.id])

  // 加载用户数据
  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // 定期刷新用户数据（每5分钟）
  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.isAuthenticated) {
        logInfo('Periodic user data refresh', null, 'useNomadUsers')
        loadUsers()
      }
    }, 5 * 60 * 1000) // 5分钟

    return () => clearInterval(interval)
  }, [loadUsers, user?.isAuthenticated])

  // 监听用户资料更新事件
  useEffect(() => {
    const handleUserProfileUpdate = (event: CustomEvent) => {
      logInfo('User profile update event received', { userId: event.detail?.userId }, 'useNomadUsers')
      // 立即刷新一次，然后延迟再刷新一次确保数据同步
      loadUsers()
      setTimeout(() => {
        logInfo('Refreshing users after profile update (delayed)', {}, 'useNomadUsers')
        loadUsers()
      }, 2000) // 增加延迟时间确保数据库更新完成
    }

    window.addEventListener('userProfileUpdated', handleUserProfileUpdate as EventListener)
    
    return () => {
      window.removeEventListener('userProfileUpdated', handleUserProfileUpdate as EventListener)
    }
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
    goToPage,
    resetFilters,
    
    // 用户操作
    addToFavorites,
    removeFromFavorites,
    hideUser,
    showUser,
    sendCoffeeInvitation,
    sendWorkTogetherInvitation,
    
    // 工具函数
    getUserById,
    getFavorites,
    getHiddenUsers
  }
}
