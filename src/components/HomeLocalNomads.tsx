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
import { logInfo, logError } from '@/lib/logger'

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
  // 新增字段
  status?: 'available' | 'coffeeLater' | 'notAvailable' | 'invisible'
  tags?: string[]
  badges?: string[]
  coordinates?: {
    lat: number
    lng: number
  }
}

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
  const { t } = useTranslation()
  const { user } = useUser()
  const { location, loading: locationLoading, error: locationError, requestLocation, hasPermission } = useLocation()
  
  const [users, setUsers] = useState<NomadUser[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const [sendingInvitation, setSendingInvitation] = useState(false)
  const [newUsers, setNewUsers] = useState<NomadUser[]>([])
  const [hiddenUsers, setHiddenUsers] = useState<string[]>([])
  
  // 新增状态
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [selectedStatus, setSelectedStatus] = useState<'available' | 'coffeeLater' | 'notAvailable' | 'invisible'>('available')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [mapZoom, setMapZoom] = useState(12)
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 })

  // 加载隐藏用户列表
  useEffect(() => {
    const loadHiddenUsers = () => {
      try {
        const stored = localStorage.getItem('hidden_nomad_users')
        if (stored) {
          setHiddenUsers(JSON.parse(stored))
        }
      } catch (error) {
        console.error('Error loading hidden users:', error)
      }
    }
    loadHiddenUsers()
  }, [])

  const usersPerPage = maxUsers
  const [totalUsers, setTotalUsers] = useState(0)

  // 检测新用户并添加到 Local Nomads
  useEffect(() => {
    const checkNewUsers = () => {
      if (!user.isAuthenticated || !user.profile) return

      // 检查是否是新用户（首次登录）
      const isNewUser = localStorage.getItem(`new_user_${user.profile.id}`)
      if (isNewUser === 'true') {
        // 创建新用户数据
        const newUser: NomadUser = {
          id: user.profile.id,
          name: user.profile.name || 'New Nomad',
          avatar: user.profile.name ? user.profile.name.substring(0, 2).toUpperCase() : 'NN',
          profession: getUserProfession(),
          company: getUserCompany(),
          location: user.profile.current_city || 'Unknown Location',
          distance: 0,
          interests: getUserInterests(),
          rating: 5.0,
          reviewCount: 0,
          isOnline: true,
          isAvailable: true,
          lastSeen: 'Just now',
          meetupCount: 0,
          mutualInterests: [],
          compatibility: 100,
          bio: user.profile.bio || 'New digital nomad exploring the world!'
        }

        setNewUsers(prev => {
          const exists = prev.find(u => u.id === newUser.id)
          if (!exists) {
            return [...prev, newUser]
          }
          return prev
        })

        // 标记用户已添加到 Local Nomads
        localStorage.setItem(`new_user_${user.profile.id}`, 'false')
      }
    }

    checkNewUsers()
  }, [user.isAuthenticated, user.profile])

  // 获取用户职业信息
  const getUserProfession = () => {
    try {
      const storedProfile = localStorage.getItem('user_profile_details')
      if (storedProfile) {
        const profileData = JSON.parse(storedProfile)
        return profileData.profession || 'Digital Nomad'
      }
      return 'Digital Nomad'
    } catch (error) {
      return 'Digital Nomad'
    }
  }

  // 获取用户公司信息
  const getUserCompany = () => {
    try {
      const storedProfile = localStorage.getItem('user_profile_details')
      if (storedProfile) {
        const profileData = JSON.parse(storedProfile)
        return profileData.company || 'Freelance'
      }
      return 'Freelance'
    } catch (error) {
      return 'Freelance'
    }
  }

  // 获取用户兴趣爱好
  const getUserInterests = () => {
    try {
      const storedProfile = localStorage.getItem('user_profile_details')
      if (storedProfile) {
        const profileData = JSON.parse(storedProfile)
        return profileData.interests || ['Travel', 'Technology']
      }
      return ['Travel', 'Technology']
    } catch (error) {
      return ['Travel', 'Technology']
    }
  }

  // 实时用户数据管理
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true)
      
      try {
        // 从 localStorage 获取所有注册用户
        const allRegisteredUsers = getAllRegisteredUsers()
        
        // 合并新用户和注册用户
        const allUsers = [...newUsers, ...allRegisteredUsers]
        
        // 过滤掉隐藏的用户
        const visibleUsers = allUsers.filter(user => !hiddenUsers.includes(user.id))
        
        // 计算距离（如果用户有位置信息）
        const usersWithDistance = visibleUsers.map(user => ({
          ...user,
          distance: calculateDistance(user.location, location)
        }))
        
        // 按距离排序
        const sortedUsers = usersWithDistance.sort((a, b) => a.distance - b.distance)
        
        setUsers(sortedUsers)
        setTotalUsers(sortedUsers.length)
        setTotalPages(Math.ceil(sortedUsers.length / usersPerPage))
        setLoading(false)
      } catch (error) {
        console.error('Error loading users:', error)
        setLoading(false)
      }
    }

    loadUsers()
  }, [location]) // 移除 newUsers 和 hiddenUsers 依赖，避免无限循环

  // 获取所有注册用户
  const getAllRegisteredUsers = (): NomadUser[] => {
    try {
      const users: NomadUser[] = []
      
      // 从 localStorage 获取所有用户资料
      const keys = Object.keys(localStorage)
      const profileKeys = keys.filter(key => key.startsWith('user_profile_details'))
      
      profileKeys.forEach(key => {
        try {
          const profileData = localStorage.getItem(key)
          if (profileData) {
            const profile = JSON.parse(profileData)
            if (profile.id && profile.name) {
              // 检查用户是否隐藏
              const isHidden = localStorage.getItem(`hidden_nomad_users`)
              if (isHidden) {
                const hiddenUsers = JSON.parse(isHidden)
                if (hiddenUsers.includes(profile.id)) {
                  return // 跳过隐藏的用户
                }
              }
              
              // 创建 NomadUser 对象
              const nomadUser: NomadUser = {
                id: profile.id,
                name: profile.name,
                avatar: profile.name ? profile.name.substring(0, 2).toUpperCase() : 'NN',
                profession: profile.profession || 'Digital Nomad',
                company: profile.company || 'Freelance',
                location: profile.current_city || 'Unknown Location',
                distance: 0, // 将在后面计算
                interests: profile.interests || ['Travel', 'Technology'],
                rating: 5.0, // 新用户默认评分
                reviewCount: 0,
                isOnline: true, // 假设在线
                isAvailable: true, // 假设可用
                lastSeen: 'Just now',
                meetupCount: 0,
                mutualInterests: calculateMutualInterests(profile.interests || []),
                compatibility: calculateCompatibility(profile.interests || []),
                bio: profile.bio || 'Digital nomad exploring the world!'
              }
              
              users.push(nomadUser)
            }
          }
        } catch (error) {
          console.error('Error parsing profile:', error)
        }
      })
      
      return users
    } catch (error) {
      console.error('Error getting registered users:', error)
      return []
    }
  }

  // 计算距离
  const calculateDistance = (userLocation: string, currentLocation: any): number => {
    if (!currentLocation || !userLocation || userLocation === 'Unknown Location') {
      return 999 // 未知距离
    }
    
    // 这里可以实现真实的地理距离计算
    // 目前返回随机距离用于演示
    return Math.random() * 10
  }

  // 计算共同兴趣
  const calculateMutualInterests = (userInterests: string[]): string[] => {
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
      console.error('Error calculating mutual interests:', error)
    }
    
    return []
  }

  // 计算兼容性
  const calculateCompatibility = (userInterests: string[]): number => {
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
      console.error('Error calculating compatibility:', error)
    }
    
    return 50
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

  // 实时更新用户数据
  useEffect(() => {
    const interval = setInterval(() => {
      // 重新加载用户数据以获取最新状态
      const allRegisteredUsers = getAllRegisteredUsers()
      const allUsers = [...newUsers, ...allRegisteredUsers]
      const visibleUsers = allUsers.filter(user => !hiddenUsers.includes(user.id))
      
      // 更新在线状态和最后在线时间
      const updatedUsers = visibleUsers.map(user => ({
        ...user,
        isOnline: Math.random() > 0.3, // 70% 概率在线
        lastSeen: getLastSeen(),
        distance: calculateDistance(user.location, location)
      }))
      
      // 按距离排序
      const sortedUsers = updatedUsers.sort((a, b) => a.distance - b.distance)
      
      setUsers(sortedUsers)
      setTotalUsers(sortedUsers.length)
    }, 30000) // 每30秒更新一次

    return () => clearInterval(interval)
  }, [location]) // 移除 newUsers 和 hiddenUsers 依赖，避免无限循环

  // 监听 localStorage 变化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && (e.key.startsWith('user_profile_details') || e.key === 'hidden_nomad_users')) {
        // 用户资料或隐藏状态发生变化，重新加载数据
        const allRegisteredUsers = getAllRegisteredUsers()
        const allUsers = [...newUsers, ...allRegisteredUsers]
        const visibleUsers = allUsers.filter(user => !hiddenUsers.includes(user.id))
        
        const usersWithDistance = visibleUsers.map(user => ({
          ...user,
          distance: calculateDistance(user.location, location)
        }))
        
        const sortedUsers = usersWithDistance.sort((a, b) => a.distance - b.distance)
        
        setUsers(sortedUsers)
        setTotalUsers(sortedUsers.length)
        setTotalPages(Math.ceil(sortedUsers.length / usersPerPage))
      }
    }

    // 监听其他标签页的 localStorage 变化
    window.addEventListener('storage', handleStorageChange)
    
    // 监听当前页面的 localStorage 变化（通过自定义事件）
    const handleCustomStorageChange = () => {
      handleStorageChange({ key: 'user_profile_details', newValue: null, oldValue: null } as StorageEvent)
    }
    
    window.addEventListener('localStorageChange', handleCustomStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('localStorageChange', handleCustomStorageChange)
    }
  }, [location, usersPerPage]) // 移除 newUsers 和 hiddenUsers 依赖，避免无限循环

  // 获取最后在线时间
  const getLastSeen = (): string => {
    const minutes = Math.floor(Math.random() * 60)
    if (minutes === 0) return 'Just now'
    if (minutes < 60) return `${minutes} min ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    const days = Math.floor(hours / 24)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  // 触发自定义事件通知其他组件
  const notifyStorageChange = () => {
    window.dispatchEvent(new CustomEvent('localStorageChange'))
  }

  // 分页处理
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    
    // 重新计算分页数据
    const allRegisteredUsers = getAllRegisteredUsers()
    const allUsers = [...newUsers, ...allRegisteredUsers]
    const visibleUsers = allUsers.filter(user => !hiddenUsers.includes(user.id))
    
    const startIndex = (page - 1) * usersPerPage
    const endIndex = startIndex + usersPerPage
    const pageUsers = visibleUsers.slice(startIndex, endIndex)
    
    // 计算距离
    const usersWithDistance = pageUsers.map(user => ({
      ...user,
      distance: calculateDistance(user.location, location)
    }))
    
    // 按距离排序
    const sortedUsers = usersWithDistance.sort((a, b) => a.distance - b.distance)
    
    setUsers(sortedUsers)
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
      logError('Failed to send coffee meetup invitation', error, 'HomeLocalNomads')
      alert('Failed to send invitation. Please try again.')
    } finally {
      setSendingInvitation(false)
    }
  }

  const handleAddToFavorites = (userId: string) => {
    setFavorites(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleHideUser = (userId: string) => {
    setHiddenUsers(prev => {
      const newHiddenUsers = [...prev, userId]
      // 保存到本地存储
      localStorage.setItem('hidden_nomad_users', JSON.stringify(newHiddenUsers))
      return newHiddenUsers
    })
    logInfo('User hidden from Local Nomads', { userId })
  }

  // 新增的辅助函数
  const handleWorkTogether = async (userId: string) => {
    if (!user.isAuthenticated) {
      alert('Please login to send work together invitations')
      return
    }

    setSendingInvitation(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const targetUser = users.find(u => u.id === userId)
      alert(`Work together invitation sent to ${targetUser?.name}! They will respond within 24 hours.`)
      
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, isAvailable: false, lastSeen: 'Just now' }
          : u
      ))
      
    } catch (error) {
      logError('Failed to send work together invitation', error, 'HomeLocalNomads')
      alert('Failed to send invitation. Please try again.')
    } finally {
      setSendingInvitation(false)
    }
  }

  const getHotCities = () => {
    return [
      { name: 'Chiang Mai', onlineCount: 56, coffeePrice: 2, wifiSpeed: 90 },
      { name: 'Bali', onlineCount: 43, coffeePrice: 3, wifiSpeed: 25 },
      { name: 'Lisbon', onlineCount: 28, coffeePrice: 2.5, wifiSpeed: 80 }
    ]
  }

  // 数据埋点函数
  const trackEvent = (eventName: string, properties: Record<string, any> = {}) => {
    try {
      // 这里可以集成 Google Analytics, Mixpanel 等
      console.log('📊 Track Event:', eventName, properties)
      
      // 示例：发送到分析服务
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', eventName, properties)
      }
    } catch (error) {
      console.error('Failed to track event:', error)
    }
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

  const handleViewGlobalHotspots = () => {
    // Navigate to global hotspots page or open modal
    window.open('/local-nomads', '_blank')
  }

  const handleViewMoreHotCities = () => {
    // Navigate to hot cities page
    window.open('/cities', '_blank')
  }

  const handleCopyInviteLink = () => {
    // 埋点：复制邀请链接
    trackEvent('invite_link_copy', {
      city: location?.city || 'unknown',
      user_id: user?.profile?.id || 'anonymous'
    })
    
    navigator.clipboard.writeText('https://nomad.now/invite?code=ABC123')
    alert('Invite link copied to clipboard!')
  }

  const handleGenerateQR = () => {
    // 埋点：生成二维码
    trackEvent('invite_qr_generate', {
      city: location?.city || 'unknown',
      user_id: user?.profile?.id || 'anonymous'
    })
    
    // Generate QR code for invite link
    alert('QR code generation coming soon!')
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
    console.log('Status changed to:', newStatus)
  }

  // 标签筛选函数
  const handleTagFilter = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  // 获取状态图标
  const getStatusIcon = (status: NomadUser['status']) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'coffeeLater':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'notAvailable':
        return <X className="w-4 h-4 text-red-500" />
      case 'invisible':
        return <EyeOff className="w-4 h-4 text-gray-500" />
      default:
        return <Circle className="w-4 h-4 text-gray-400" />
    }
  }

  // 获取状态颜色
  const getStatusColor = (status: NomadUser['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'coffeeLater':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'notAvailable':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'invisible':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }



  const availableUsers = users.filter(user => user.isOnline && user.isAvailable).length

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
                      {t('localNomads.nearbyOnline', { count: availableUsers.toString(), global: '128' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">128</div>
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
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400">94%</div>
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
                  {t('localNomads.trustAndResponse')}: 94% {t('localNomads.requestsGetResponse')}
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {t('localNomads.recent30DaysData')} • {t('localNomads.basedOnRealRequests', { count: totalUsers.toString() })}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">94%</div>
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
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {nomadUser.avatar}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
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
                      {newUsers.find(nu => nu.id === nomadUser.id) && (
                        <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {t('profile.newUser')}
                        </div>
                      )}
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
            Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, totalUsers)} of {totalUsers} nomads
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getHotCities().map((city, index) => (
                <div 
                  key={city.name} 
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer relative"
                  onClick={() => {
                    // 埋点：热门城市卡片点击
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
                  
                  {/* 三个字段固定顺序：在线人数 → 咖啡均价 → WiFi */}
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center justify-between">
                      <span>🟢 {city.onlineCount} online</span>
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
                      去看看 →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invite Friends Section */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200 dark:border-green-800 p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('localNomads.inviteFriendsTitle')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('localNomads.inviteReward')}
              </p>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('localNomads.inviteLink')}:</span>
                  <button
                    onClick={() => handleCopyInviteLink()}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    {t('localNomads.copyLink')}
                  </button>
                </div>
                <div className="text-sm font-mono text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  nomad.now/invite?code=ABC123
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={() => handleGenerateQR()}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <span className="text-lg">📱</span>
                  <span>{t('localNomads.generateQR')}</span>
                </button>
                <button
                  onClick={() => handleShareInvite()}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t('localNomads.shareLink')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
