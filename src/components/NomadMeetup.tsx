'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  MapPin, 
  Coffee, 
  MessageSquare, 
  Plus, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  MapPinOff, 
  Calendar, 
  Bell, 
  Send,
  Filter,
  Search,
  Map,
  List,
  Star,
  Heart,
  MessageCircle,
  Eye,
  UserPlus,
  Settings,
  ChevronDown,
  ChevronUp,
  Wifi,
  Globe,
  Award,
  Shield
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useNotifications, useUser } from '@/contexts/GlobalStateContext'
import { logInfo, logError } from '@/lib/logger'
import { useLocation } from '@/hooks/useLocation'
import { 
  getOnlineUsers, 
  getMeetupStats, 
  sendMeetupInvitation, 
  createPublicMeetup,
  type MeetupUser,
  type MeetupStats
} from '@/lib/meetupApi'
import {
  getCommunityMessages,
  sendCommunityMessage,
  toggleMessageLike,
  getMessageReplies,
  sendMessageReply,
  type CommunityMessage,
  type MessageReply
} from '@/lib/communityChatApi'
import { communityRealtimeService } from '@/lib/communityRealtimeService'

// 移除旧的接口定义，使用从API导入的接口
import { validateForm, validationRules, validateField } from '@/lib/formValidation'
import UserProfileModal from './UserProfileModal'
import MeetupHistory from './MeetupHistory'
import MeetupNotifications from './MeetupNotifications'

export default function NomadMeetup() {
  const { t } = useTranslation()
  const { user } = useUser()
  const { location: userLocation, loading: locationLoading, error: locationError, requestLocation } = useLocation()
  
  const [users, setUsers] = useState<MeetupUser[]>([])
  const [stats, setStats] = useState<MeetupStats | null>(null)
  const [showMeetupForm, setShowMeetupForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [sendingInvitation, setSendingInvitation] = useState(false)
  const [creatingMeetup, setCreatingMeetup] = useState(false)
  
  // 新增状态
  const [selectedUser, setSelectedUser] = useState<MeetupUser | null>(null)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [activeTab, setActiveTab] = useState<'users' | 'history' | 'notifications' | 'community'>('users')
  
  // 新增筛选和视图状态
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [showFilters, setShowFilters] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'available'>('all')
  const [filterDistance, setFilterDistance] = useState<number>(50)
  const [sortBy, setSortBy] = useState<'distance' | 'compatibility' | 'lastSeen' | 'name'>('distance')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const [showOffline, setShowOffline] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  
  // 表单验证状态
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [isValidating, setIsValidating] = useState(false)
  
  // 社区聊天状态
  const [communityMessages, setCommunityMessages] = useState<CommunityMessage[]>([])
  const [newCommunityMessage, setNewCommunityMessage] = useState('')
  const [messageType, setMessageType] = useState<'general' | 'question' | 'info' | 'help'>('general')
  const [messageSearchQuery, setMessageSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'question' | 'info' | 'help' | 'general'>('all')
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [messagesPage, setMessagesPage] = useState(1)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [selectedMessageForReply, setSelectedMessageForReply] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [replies, setReplies] = useState<Record<string, MessageReply[]>>({})
  
  const { addNotification } = useNotifications()

  const currentCity = userLocation && userLocation.city && userLocation.country 
    ? `${userLocation.city}, ${userLocation.country}` 
    : userLocation?.city || userLocation?.country || 'Loading...'

  // 筛选和排序用户
  const filteredAndSortedUsers = users
    .filter(user => {
      // 状态筛选
      if (filterStatus === 'online' && user.status !== 'online') return false
      if (filterStatus === 'available' && !user.isAvailable) return false
      if (!showOffline && user.status === 'offline') return false
      
      // 距离筛选
      if (user.distance && user.distance > filterDistance) return false
      
      // 搜索筛选
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = user.name.toLowerCase().includes(query)
        const matchesInterests = user.interests.some(interest => 
          interest.toLowerCase().includes(query)
        )
        const matchesLocation = user.location.toLowerCase().includes(query)
        if (!matchesName && !matchesInterests && !matchesLocation) return false
      }
      
      return true
    })
    .sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'distance':
          aValue = a.distance || 999
          bValue = b.distance || 999
          break
        case 'compatibility':
          aValue = a.meetupCompatibility || 0
          bValue = b.meetupCompatibility || 0
          break
        case 'lastSeen':
          aValue = new Date(a.lastSeen).getTime()
          bValue = new Date(b.lastSeen).getTime()
          break
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        default:
          aValue = a.distance || 999
          bValue = b.distance || 999
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  useEffect(() => {
    if (userLocation) {
      fetchUsers()
      fetchStats()
      fetchCommunityMessages()
    }
  }, [userLocation])

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(() => {
      fetchUsers()
      fetchStats()
    }, 30000) // 30秒刷新一次
    
    return () => clearInterval(interval)
  }, [autoRefresh])

  const fetchCommunityMessages = async (page = 1, append = false) => {
    if (!userLocation) return
    
    try {
      setMessagesLoading(true)
      
      const result = await getCommunityMessages({
        page,
        limit: 20,
        message_type: filterType === 'all' ? undefined : filterType,
        location: currentCity,
        search: searchQuery || undefined
      })

      if (append) {
        setCommunityMessages(prev => [...prev, ...result.messages])
      } else {
        setCommunityMessages(result.messages)
      }
      
      setHasMoreMessages(result.hasMore)
      setMessagesPage(page)
    } catch (error) {
      logError('Failed to fetch community messages', error, 'NomadMeetup')
      addNotification({
        type: 'error',
        message: t('meetup.failedToLoadMessages')
      })
    } finally {
      setMessagesLoading(false)
    }
  }

  // 获取消息回复
  const fetchMessageReplies = async (messageId: string) => {
    try {
      const repliesData = await getMessageReplies(messageId)
      setReplies(prev => ({
        ...prev,
        [messageId]: repliesData
      }))
    } catch (error) {
      logError('Failed to fetch message replies', error, 'NomadMeetup')
    }
  }

  const handleSendCommunityMessage = async () => {
    if (!user.isAuthenticated) {
      addNotification({
        type: 'warning',
        message: t('meetup.pleaseLoginToMeetup')
      })
      return
    }

    if (!newCommunityMessage.trim()) return

    try {
      const message = await sendCommunityMessage({
        content: newCommunityMessage.trim(),
        message_type: messageType,
        location: currentCity,
        tags: []
      })
      
      setCommunityMessages(prev => [message, ...prev])
      setNewCommunityMessage('')
      addNotification({
        type: 'success',
        message: t('meetup.messageSent')
      })
    } catch (error) {
      logError('Failed to send community message', error, 'NomadMeetup')
      addNotification({
        type: 'error',
        message: t('meetup.failedToSendMessage')
      })
    }
  }

  // 筛选和搜索消息
  const filteredMessages = communityMessages.filter(message => {
    const matchesSearch = messageSearchQuery === '' || 
      message.content.toLowerCase().includes(messageSearchQuery.toLowerCase()) ||
      message.user_name?.toLowerCase().includes(messageSearchQuery.toLowerCase()) ||
      message.tags.some(tag => tag.toLowerCase().includes(messageSearchQuery.toLowerCase()))
    
    const matchesFilter = filterType === 'all' || message.message_type === filterType
    
    return matchesSearch && matchesFilter
  })

  // 处理点赞
  const handleLikeMessage = async (messageId: string) => {
    if (!user.isAuthenticated) {
      addNotification({
        type: 'warning',
        message: t('meetup.pleaseLoginToMeetup')
      })
      return
    }

    try {
      const result = await toggleMessageLike(messageId)
      
      setCommunityMessages(prev => prev.map(message => 
        message.id === messageId 
          ? { ...message, likes_count: result.likesCount, is_liked_by_current_user: result.isLiked }
          : message
      ))
    } catch (error) {
      logError('Failed to like message', error, 'NomadMeetup')
      addNotification({
        type: 'error',
        message: t('meetup.failedToLikeMessage')
      })
    }
  }

  // 处理回复
  const handleReplyToMessage = async (messageId: string) => {
    if (!user.isAuthenticated) {
      addNotification({
        type: 'warning',
        message: t('meetup.pleaseLoginToMeetup')
      })
      return
    }

    if (!replyContent.trim()) return

    try {
      const reply = await sendMessageReply(messageId, replyContent.trim())
      
      setReplies(prev => ({
        ...prev,
        [messageId]: [...(prev[messageId] || []), reply]
      }))
      
      setReplyContent('')
      setSelectedMessageForReply(null)
      
      addNotification({
        type: 'success',
        message: t('meetup.replySent')
      })
    } catch (error) {
      logError('Failed to send reply', error, 'NomadMeetup')
      addNotification({
        type: 'error',
        message: t('meetup.failedToSendReply')
      })
    }
  }

  // 实时通信设置
  useEffect(() => {
    if (activeTab === 'community' && user.isAuthenticated) {
      // 连接实时通信
      communityRealtimeService.connect()
      
      // 监听新消息
      const handleNewMessage = (event: any) => {
        setCommunityMessages(prev => [event.data, ...prev])
      }
      
      // 监听消息更新
      const handleMessageUpdate = (event: any) => {
        setCommunityMessages(prev => prev.map(message => 
          message.id === event.data.id ? event.data : message
        ))
      }
      
      // 监听消息删除
      const handleMessageDelete = (event: any) => {
        setCommunityMessages(prev => prev.filter(message => message.id !== event.data.id))
      }
      
      // 监听点赞
      const handleMessageLike = (event: any) => {
        setCommunityMessages(prev => prev.map(message => 
          message.id === event.data.message_id 
            ? { ...message, likes_count: message.likes_count + 1 }
            : message
        ))
      }
      
      // 监听新回复
      const handleNewReply = (event: any) => {
        setReplies(prev => ({
          ...prev,
          [event.data.parent_message_id]: [...(prev[event.data.parent_message_id] || []), event.data]
        }))
      }
      
      communityRealtimeService.addEventListener('new_message', handleNewMessage)
      communityRealtimeService.addEventListener('message_updated', handleMessageUpdate)
      communityRealtimeService.addEventListener('message_deleted', handleMessageDelete)
      communityRealtimeService.addEventListener('message_liked', handleMessageLike)
      communityRealtimeService.addEventListener('new_reply', handleNewReply)
      
      return () => {
        communityRealtimeService.removeEventListener('new_message', handleNewMessage)
        communityRealtimeService.removeEventListener('message_updated', handleMessageUpdate)
        communityRealtimeService.removeEventListener('message_deleted', handleMessageDelete)
        communityRealtimeService.removeEventListener('message_liked', handleMessageLike)
        communityRealtimeService.removeEventListener('new_reply', handleNewReply)
      }
    }
  }, [activeTab, user.isAuthenticated])

  const fetchUsers = async () => {
    if (!userLocation || !userLocation.city) return
    
    try {
      setLoading(true)
      setError(null)
      
      const usersData = await getOnlineUsers(userLocation.city, {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      })
      setUsers(usersData)
    } catch (error) {
      logError('Failed to fetch users', error, 'NomadMeetup')
      setError(t('meetup.failedToLoadUsers'))
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    if (!userLocation || !userLocation.city) return
    
    try {
      const statsData = await getMeetupStats(userLocation.city)
      setStats(statsData)
    } catch (error) {
      logError('Failed to fetch stats', error, 'NomadMeetup')
      // 不显示错误，因为统计信息不是关键功能
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([
      fetchUsers(),
      fetchStats(),
      requestLocation()
    ])
    setRefreshing(false)
  }

  const handleRequestMeetup = async (userId: string) => {
    if (!user.isAuthenticated) {
      addNotification({
        type: 'warning',
        message: t('meetup.pleaseLoginToMeetup')
      })
      return
    }

    setSendingInvitation(true)
    
    try {
      const result = await sendMeetupInvitation(
        userId,
        'Coffee Shop',
        new Date().toISOString(),
        'Let\'s meet for coffee!'
      )
      
      if (result.success) {
        addNotification({
          type: 'success',
          message: t('meetup.requestSent')
        })
      } else {
        addNotification({
          type: 'error',
          message: result.message
        })
      }
    } catch (error) {
      logError('Failed to send meetup invitation', error, 'NomadMeetup')
      addNotification({
        type: 'error',
        message: t('meetup.requestFailed')
      })
    } finally {
      setSendingInvitation(false)
    }
  }

  const handleCreateMeetup = () => {
    if (!user.isAuthenticated) {
      addNotification({
        type: 'warning',
        message: t('meetup.pleaseLoginToMeetup')
      })
      return
    }
    setShowMeetupForm(true)
  }

  const handlePublishInvitation = async () => {
    const formData = new FormData(document.getElementById('meetup-form') as HTMLFormElement)
    const formValues = {
      location: formData.get('location') as string,
      time: formData.get('time') as string,
      description: formData.get('description') as string
    }

    // 表单验证
    setIsValidating(true)
    const meetupValidationRules = [
      { name: 'location', value: formValues.location, rules: validationRules.cityName },
      { name: 'time', value: formValues.time, rules: { required: true } },
      { name: 'description', value: formValues.description, rules: validationRules.description }
    ]
    const validation = validateForm(meetupValidationRules)
    
    if (!validation.isValid) {
      setFormErrors(validation.errors)
      setIsValidating(false)
      
      addNotification({
        type: 'error',
        message: Object.values(validation.errors).join('；')
      })
      return
    }

    setFormErrors({})
    setCreatingMeetup(true)
    
    try {
      const result = await createPublicMeetup(formValues.location, formValues.time, formValues.description)
      
      if (result.success) {
        addNotification({
          type: 'success',
          message: t('meetup.publicMeetupCreated')
        })
        setShowMeetupForm(false)
        // 刷新数据
        await fetchUsers()
        await fetchStats()
      } else {
        addNotification({
          type: 'error',
          message: result.message
        })
      }
    } catch (error) {
      logError('Failed to create public meetup', error, 'NomadMeetup')
      addNotification({
        type: 'error',
        message: t('meetup.createMeetupFailed')
      })
    } finally {
      setCreatingMeetup(false)
      setIsValidating(false)
    }
  }

  // 实时验证字段
  const validateFieldRealTime = (fieldName: string, value: string) => {
    let rule
    switch (fieldName) {
      case 'location':
        rule = validationRules.cityName
        break
      case 'description':
        rule = validationRules.description
        break
      case 'time':
        rule = { required: true }
        break
      default:
        return
    }
    
    const field = { name: fieldName, value, rules: rule }
    const error = validateField(field)
    setFormErrors(prev => ({
      ...prev,
      [fieldName]: error || ''
    }))
  }

  const handleUserClick = (user: MeetupUser) => {
    setSelectedUser(user)
    setShowUserProfile(true)
  }

  const handleQuickChat = (userId: string) => {
    // 实现快速聊天功能
    console.log('Quick chat with user:', userId)
  }

  const handleAddFriend = (userId: string) => {
    // 实现添加好友功能
    console.log('Add friend:', userId)
  }

  const handleViewProfile = (user: MeetupUser) => {
    setSelectedUser(user)
    setShowUserProfile(true)
  }

  const getStatusColor = (status: string, isAvailable: boolean) => {
    if (!isAvailable) return 'bg-gray-400'
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'busy': return 'bg-orange-500'
      case 'dnd': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return t('meetup.statusOnline')
      case 'offline': return t('meetup.statusOffline')
      case 'away': return t('meetup.statusAway')
      case 'busy': return t('meetup.statusBusy')
      case 'dnd': return t('meetup.statusDnd')
      default: return t('meetup.statusOffline')
    }
  }

  const TabButton = ({ id, label, icon: Icon, count }: { id: string, label: string, icon: any, count?: number }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        activeTab === id
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
      {count && count > 0 && (
        <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  )

  if (locationLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg"></div>
              <div>
                <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (locationError) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="text-center py-8">
          <MapPinOff className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">{t('meetup.locationError')}</p>
          <button
            onClick={requestLocation}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{t('common.retry')}</span>
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg"></div>
              <div>
                <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{t('common.retry')}</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Coffee className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{t('meetup.title')}</h3>
            <p className="text-sm text-gray-600 flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {currentCity}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title={t('common.refresh')}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleCreateMeetup}
            className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>{t('meetup.createMeetup')}</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-6">
        <TabButton id="users" label={t('meetup.onlineUsers')} icon={Users} />
        <TabButton id="history" label={t('meetup.history')} icon={Calendar} />
                    <TabButton id="notifications" label={t('meetup.notifications.title')} icon={Bell} count={3} />
        <TabButton id="community" label={t('meetup.communityChat')} icon={MessageSquare} />
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && (
        <>
          {/* Enhanced Header with Filters */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  {t('meetup.onlineUsers')} ({filteredAndSortedUsers.length})
                </h4>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-sm transition-colors ${
                      showFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Filter className="h-3 w-3" />
                    <span>{t('meetup.filterBy')}</span>
                    {showFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                  <button
                    onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                    className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    {viewMode === 'list' ? <Map className="h-3 w-3" /> : <List className="h-3 w-3" />}
                    <span>{viewMode === 'list' ? t('meetup.mapView') : t('meetup.listView')}</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-sm transition-colors ${
                    autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <RefreshCw className={`h-3 w-3 ${autoRefresh ? 'animate-spin' : ''}`} />
                  <span>{t('meetup.autoRefresh')}</span>
                </button>
                <span className="text-sm text-gray-500">
                  {filteredAndSortedUsers.filter(u => u.isAvailable).length} {t('meetup.available')}
                </span>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="搜索用户、兴趣或位置..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Status Filter */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="all">{t('meetup.allNomads')}</option>
                    <option value="online">{t('meetup.onlineNow')}</option>
                    <option value="available">{t('meetup.availableNow')}</option>
                  </select>

                  {/* Distance Filter */}
                  <select
                    value={filterDistance}
                    onChange={(e) => setFilterDistance(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value={5}>{t('meetup.within5km')}</option>
                    <option value={10}>{t('meetup.within10km')}</option>
                    <option value={25}>{t('meetup.within25km')}</option>
                    <option value={50}>{t('meetup.within50km')}</option>
                    <option value={999}>{t('meetup.allDistances')}</option>
                  </select>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="distance">{t('meetup.byDistance')}</option>
                    <option value="compatibility">{t('meetup.byCompatibility')}</option>
                    <option value="lastSeen">{t('meetup.lastActive')}</option>
                    <option value="name">姓名</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={showOffline}
                        onChange={(e) => setShowOffline(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{showOffline ? t('meetup.hideOffline') : t('meetup.showOffline')}</span>
                    </label>
                  </div>
                  {(searchQuery || filterStatus !== 'all' || filterDistance !== 50 || showOffline) && (
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setFilterStatus('all')
                        setFilterDistance(50)
                        setShowOffline(false)
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {t('meetup.clearFilters')}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Enhanced User Cards */}
            <div className="space-y-4">
              {filteredAndSortedUsers.map((user) => (
                <div key={user.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between">
                    {/* User Info */}
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Avatar and Status */}
                      <div className="relative">
                        <button
                          onClick={() => handleViewProfile(user)}
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium cursor-pointer hover:opacity-80 transition-opacity ${
                            user.isAvailable ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gray-400'
                          }`}>
                          {user.avatar}
                        </button>
                        <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(user.status, user.isAvailable)}`}></span>
                      </div>

                      {/* User Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h5 className="font-semibold text-gray-900 truncate">{user.name}</h5>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {getStatusText(user.status)}
                          </span>
                          {user.meetupCompatibility && user.meetupCompatibility > 80 && (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center">
                              <Star className="h-3 w-3 mr-1 fill-current" />
                              {t('meetup.compatibility', { percentage: user.meetupCompatibility.toString() })}
                            </span>
                          )}
                        </div>

                        {/* Location and Distance */}
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                          <MapPin className="h-3 w-3" />
                          <span>{user.location}</span>
                          {user.distance && (
                            <>
                              <span>•</span>
                              <span>{t('meetup.distance', { distance: user.distance.toString() })}</span>
                            </>
                          )}
                          <span>•</span>
                          <Clock className="h-3 w-3" />
                          <span>{user.lastSeen}</span>
                        </div>

                        {/* Interests */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {user.interests.slice(0, 3).map((interest, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                              {interest}
                            </span>
                          ))}
                          {user.interests.length > 3 && (
                            <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full border border-gray-200">
                              +{user.interests.length - 3}
                            </span>
                          )}
                          {user.mutualInterests && user.mutualInterests.length > 0 && (
                            <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200 flex items-center">
                              <Heart className="h-3 w-3 mr-1" />
                              {t('meetup.mutualInterests', { count: user.mutualInterests.length.toString() })}
                            </span>
                          )}
                        </div>

                        {/* Compatibility Bar */}
                        {user.meetupCompatibility && (
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${user.meetupCompatibility}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 font-medium">{user.meetupCompatibility}%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2 ml-4">
                      {user.isAvailable ? (
                        <button
                          onClick={() => handleRequestMeetup(user.id)}
                          disabled={sendingInvitation}
                          className="flex items-center space-x-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50 font-medium"
                        >
                          {sendingInvitation ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <Coffee className="h-3 w-3" />
                          )}
                          <span>{t('meetup.coffeeMeetup')}</span>
                        </button>
                      ) : (
                        <span className="text-sm text-gray-500 px-3 py-2">{t('meetup.busy')}</span>
                      )}
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleQuickChat(user.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t('meetup.quickChat')}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleAddFriend(user.id)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title={t('meetup.addFriend')}
                        >
                          <UserPlus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleViewProfile(user)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title={t('meetup.viewProfile')}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredAndSortedUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery || filterStatus !== 'all' || filterDistance !== 50 
                    ? t('meetup.noFilterResults') 
                    : t('meetup.noOnlineUsers')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || filterStatus !== 'all' || filterDistance !== 50 
                    ? 'Try adjusting your filters or search terms'
                    : t('meetup.checkLater')}
                </p>
                {(searchQuery || filterStatus !== 'all' || filterDistance !== 50) && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setFilterStatus('all')
                      setFilterDistance(50)
                      setShowOffline(false)
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('meetup.clearFilters')}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                <p className="text-xs text-gray-600">{t('meetup.totalUsers')}</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-600">{stats?.availableUsers || 0}</p>
                <p className="text-xs text-gray-600">{t('meetup.availableUsers')}</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-600">{stats?.todayMeetups || 0}</p>
                <p className="text-xs text-gray-600">{t('meetup.todayMeetups')}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'history' && (
        <MeetupHistory />
      )}

      {activeTab === 'notifications' && (
        <MeetupNotifications />
      )}

      {activeTab === 'community' && (
        <div className="space-y-4">
                    {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={messageSearchQuery}
                onChange={(e) => setMessageSearchQuery(e.target.value)}
                placeholder={t('meetup.searchPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">{t('meetup.filterAll')}</option>
                <option value="general">{t('meetup.filterGeneral')}</option>
                <option value="question">{t('meetup.filterQuestion')}</option>
                <option value="info">{t('meetup.filterInfo')}</option>
                <option value="help">{t('meetup.filterHelp')}</option>
              </select>
            </div>
          </div>

          {/* Message Stats */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{t('meetup.messageStats', { filtered: filteredMessages.length.toString(), total: communityMessages.length.toString() })}</span>
            {(messageSearchQuery || filterType !== 'all') && (
              <button
                onClick={() => {
                  setMessageSearchQuery('')
                  setFilterType('all')
                }}
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                {t('meetup.clearFilter')}
              </button>
            )}
          </div>

          {/* Message Input */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <select
                value={messageType}
                onChange={(e) => setMessageType(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="general">{t('meetup.filterGeneral')}</option>
                <option value="question">{t('meetup.filterQuestion')}</option>
                <option value="info">{t('meetup.filterInfo')}</option>
                <option value="help">{t('meetup.filterHelp')}</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newCommunityMessage}
                onChange={(e) => setNewCommunityMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendCommunityMessage()}
                placeholder={t('meetup.messagePlaceholder')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSendCommunityMessage}
                disabled={!newCommunityMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredMessages.map((message) => (
              <div key={message.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-sm font-medium">
                      {message.user_avatar || message.user_name?.substring(0, 2).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1 flex-wrap">
                      <span className="font-medium text-gray-900">{message.user_name}</span>
                      <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${
                        message.message_type === 'question' ? 'bg-yellow-100 text-yellow-800' :
                        message.message_type === 'info' ? 'bg-green-100 text-green-800' :
                        message.message_type === 'help' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {message.message_type === 'question' ? t('meetup.typeQuestion') :
                         message.message_type === 'info' ? t('meetup.typeInfo') :
                         message.message_type === 'help' ? t('meetup.typeHelp') : t('meetup.typeGeneral')}
                      </span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {new Date(message.created_at).toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center flex-shrink-0">
                        <MapPin className="h-3 w-3 mr-1" />
                        {message.location || message.user_location}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2 break-words">{message.content}</p>
                    {message.tags && message.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {message.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* 回复区域 */}
                    {selectedMessageForReply === message.id && (
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder={t('meetup.replyPlaceholder')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                          rows={2}
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                          <button
                            onClick={() => setSelectedMessageForReply(null)}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                          >
                            {t('common.cancel')}
                          </button>
                          <button
                            onClick={() => handleReplyToMessage(message.id)}
                            disabled={!replyContent.trim()}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            {t('meetup.reply')}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 显示回复 */}
                    {replies[message.id] && replies[message.id].length > 0 && (
                      <div className="mb-3 space-y-2">
                        {replies[message.id].map((reply) => (
                          <div key={reply.id} className="ml-4 p-2 bg-gray-50 rounded border-l-2 border-blue-200">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm text-gray-900">{reply.user_name}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(reply.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <button 
                        onClick={() => handleLikeMessage(message.id)}
                        className={`flex items-center space-x-1 transition-colors ${
                          message.is_liked_by_current_user 
                            ? 'text-blue-600' 
                            : 'hover:text-blue-600'
                        }`}
                        title={t('meetup.like')}
                      >
                        <span>👍</span>
                        <span>{message.likes_count}</span>
                      </button>
                      <button 
                        onClick={() => {
                          if (selectedMessageForReply === message.id) {
                            setSelectedMessageForReply(null)
                          } else {
                            setSelectedMessageForReply(message.id)
                            if (!replies[message.id]) {
                              fetchMessageReplies(message.id)
                            }
                          }
                        }}
                        className="hover:text-blue-600 transition-colors"
                        title={t('meetup.reply')}
                      >
                        {t('meetup.reply')} ({message.replies_count})
                      </button>
                      <button 
                        className="hover:text-blue-600 transition-colors"
                        title={t('meetup.share')}
                      >
                        {t('meetup.share')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredMessages.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              {messageSearchQuery || filterType !== 'all' ? (
                <>
                  <p className="text-gray-600">{t('meetup.noMatchingMessages')}</p>
                  <p className="text-sm text-gray-500">{t('meetup.tryAdjustSearch')}</p>
                </>
              ) : (
                <>
                  <p className="text-gray-600">{t('meetup.noMessages')}</p>
                  <p className="text-sm text-gray-500">{t('meetup.startConversation')}</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Meetup Form Modal */}
      {showMeetupForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t('meetup.createMeetupTitle')}</h3>
            <form id="meetup-form" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('meetup.meetupLocation')} *
                </label>
                <input
                  name="location"
                  type="text"
                  required
                  placeholder={t('meetup.meetupLocationPlaceholder')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                  onChange={(e) => validateFieldRealTime('location', e.target.value)}
                />
                {formErrors.location && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.location}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('meetup.meetupTime')} *
                </label>
                <input
                  name="time"
                  type="datetime-local"
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.time ? 'border-red-500' : 'border-gray-300'
                  }`}
                  onChange={(e) => validateFieldRealTime('time', e.target.value)}
                />
                {formErrors.time && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.time}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('meetup.meetupDescription')}
                </label>
                <textarea
                  name="description"
                  placeholder={t('meetup.meetupDescriptionPlaceholder')}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  onChange={(e) => validateFieldRealTime('description', e.target.value)}
                />
                {formErrors.description && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                )}
              </div>
            </form>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowMeetupForm(false)}
                disabled={creatingMeetup}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {t('meetup.cancel')}
              </button>
              <button 
                onClick={handlePublishInvitation}
                disabled={creatingMeetup}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {creatingMeetup ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    {t('common.submitting')}
                  </>
                ) : (
                  t('meetup.publishInvitation')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      <UserProfileModal
        user={selectedUser}
        isOpen={showUserProfile}
        onClose={() => {
          setShowUserProfile(false)
          setSelectedUser(null)
        }}
      />
    </div>
  )
}
