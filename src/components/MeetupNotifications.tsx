'use client'

import { useState, useEffect } from 'react'
import { 
  Bell, 
  Coffee, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Search,
  Filter,
  Trash2,
  Settings,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Star,
  AlertCircle,
  Info,
  Users
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useUser, useNotifications } from '@/contexts/GlobalStateContext'
import { logInfo, logError } from '@/lib/logger'
import { 
  getUserNotifications,
  markNotificationsAsRead,
  deleteNotification,
  getNotificationStats,
  batchNotificationAction,
  type Notification,
  type GetNotificationsOptions
} from '@/lib/notificationsApi'

export default function MeetupNotifications() {
  const { t } = useTranslation()
  const { user } = useUser()
  const { addNotification } = useNotifications()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [stats, setStats] = useState<any>(null)
  
  // 筛选和搜索状态
  const [filters, setFilters] = useState<GetNotificationsOptions>({
    page: 1,
    limit: 20
  })
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])

  useEffect(() => {
    if (user.isAuthenticated) {
      fetchNotifications()
      fetchStats()
    } else {
      setLoading(false)
    }
  }, [filters, user.isAuthenticated])

  const fetchNotifications = async (append = false) => {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      setError(null)
      
      const result = await getUserNotifications({
        ...filters,
        filter_type: searchTerm ? undefined : filters.filter_type
      })

      if (append) {
        setNotifications(prev => [...prev, ...result.notifications])
      } else {
        setNotifications(result.notifications)
      }
      
      setHasMore(result.hasMore)
    } catch (error) {
      logError('Failed to fetch notifications', error, 'MeetupNotifications')
      setError(t('meetup.notifications.loadError'))
      addNotification({
        type: 'error',
        message: t('meetup.notifications.loadError')
      })
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const fetchStats = async () => {
    try {
      const statsData = await getNotificationStats()
      setStats(statsData)
    } catch (error) {
      logError('Failed to fetch notification stats', error, 'MeetupNotifications')
    }
  }

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (key: keyof GetNotificationsOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))
    }
  }

  const handleAction = async (notification: Notification) => {
    if (!notification.action_type) return

    try {
      switch (notification.action_type) {
        case 'accept':
          logInfo('Accepting notification action', notification.action_data, 'MeetupNotifications')
          addNotification({
            type: 'success',
            message: t('meetup.notifications.invitationAccepted')
          })
          break
        case 'decline':
          logInfo('Declining notification action', notification.action_data, 'MeetupNotifications')
          addNotification({
            type: 'info',
            message: t('meetup.notifications.invitationDeclined')
          })
          break
        case 'view':
          logInfo('Viewing notification details', notification.action_data, 'MeetupNotifications')
          break
        case 'reply':
          logInfo('Replying to notification', notification.action_data, 'MeetupNotifications')
          break
        case 'dismiss':
          await deleteNotification(notification.id)
          setNotifications(prev => prev.filter(n => n.id !== notification.id))
          addNotification({
            type: 'success',
            message: t('meetup.notifications.dismissed')
          })
          break
      }
      
      // 标记为已读
      await markAsRead(notification.id)
    } catch (error) {
      logError('Failed to handle notification action', error, 'MeetupNotifications')
      addNotification({
        type: 'error',
        message: t('meetup.notifications.actionError')
      })
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationsAsRead([notificationId])
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      )
    } catch (error) {
      logError('Failed to mark notification as read', error, 'MeetupNotifications')
    }
  }

  const markAllAsRead = async () => {
    try {
      await markNotificationsAsRead()
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      )
      addNotification({
        type: 'success',
        message: t('meetup.notifications.allMarkedRead')
      })
    } catch (error) {
      logError('Failed to mark all notifications as read', error, 'MeetupNotifications')
      addNotification({
        type: 'error',
        message: t('meetup.notifications.markAllReadError')
      })
    }
  }

  const deleteSelected = async () => {
    if (selectedNotifications.length === 0) return

    try {
      await batchNotificationAction('delete', selectedNotifications)
      setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)))
      setSelectedNotifications([])
      addNotification({
        type: 'success',
        message: t('meetup.notifications.deleted')
      })
    } catch (error) {
      logError('Failed to delete notifications', error, 'MeetupNotifications')
      addNotification({
        type: 'error',
        message: t('meetup.notifications.deleteError')
      })
    }
  }

  const toggleSelection = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    )
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'meetup_invitation':
        return <Coffee className="h-5 w-5 text-green-600" />
      case 'meetup_reminder':
        return <Calendar className="h-5 w-5 text-blue-600" />
      case 'meetup_update':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'meetup_cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'city_update':
        return <MapPin className="h-5 w-5 text-purple-600" />
      case 'visa_reminder':
        return <AlertCircle className="h-5 w-5 text-orange-600" />
      case 'weather_alert':
        return <Info className="h-5 w-5 text-cyan-600" />
      case 'social_mention':
        return <Users className="h-5 w-5 text-indigo-600" />
      case 'system_announcement':
        return <Star className="h-5 w-5 text-pink-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'meetup_invitation':
        return 'bg-green-100'
      case 'meetup_reminder':
        return 'bg-blue-100'
      case 'meetup_update':
        return 'bg-yellow-100'
      case 'meetup_cancelled':
        return 'bg-red-100'
      case 'city_update':
        return 'bg-purple-100'
      case 'visa_reminder':
        return 'bg-orange-100'
      case 'weather_alert':
        return 'bg-cyan-100'
      case 'social_mention':
        return 'bg-indigo-100'
      case 'system_announcement':
        return 'bg-pink-100'
      default:
        return 'bg-gray-100'
    }
  }

  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case 'meetup_invitation':
        return t('meetup.notifications.typeInvitation')
      case 'meetup_reminder':
        return t('meetup.notifications.typeReminder')
      case 'meetup_update':
        return t('meetup.notifications.typeUpdate')
      case 'meetup_cancelled':
        return t('meetup.notifications.typeCancelled')
      case 'city_update':
        return t('meetup.notifications.typeCityUpdate')
      case 'visa_reminder':
        return t('meetup.notifications.typeVisaReminder')
      case 'weather_alert':
        return t('meetup.notifications.typeWeatherAlert')
      case 'social_mention':
        return t('meetup.notifications.typeSocialMention')
      case 'system_announcement':
        return t('meetup.notifications.typeSystemAnnouncement')
      default:
        return type
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return t('meetup.notifications.justNow')
    if (diffInMinutes < 60) return t('meetup.notifications.minutesAgo', { minutes: diffInMinutes.toString() })
    if (diffInMinutes < 1440) return t('meetup.notifications.hoursAgo', { hours: Math.floor(diffInMinutes / 60).toString() })
    return t('meetup.notifications.daysAgo', { days: Math.floor(diffInMinutes / 1440).toString() })
  }

  const unreadCount = notifications.filter(n => !n.is_read).length
  const displayedNotifications = showAll ? notifications : notifications.slice(0, 5)

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user.isAuthenticated) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="text-center py-8">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('meetup.notifications.title')}</h3>
          <p className="text-gray-600 mb-4">{t('meetup.notifications.description')}</p>
          <p className="text-sm text-gray-500 mb-4">{t('meetup.pleaseLoginToViewNotifications')}</p>
          <button
            onClick={() => window.location.href = '/auth/login'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('common.login')}
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="text-center py-8">
          <Bell className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchNotifications()}
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
          <div className="p-2 bg-orange-100 rounded-lg">
            <Bell className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{t('meetup.notifications.title')}</h3>
            <p className="text-sm text-gray-600">{t('meetup.notifications.description')}</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {unreadCount}
          </span>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('meetup.notifications.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('common.search')}
          </button>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-700 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>{t('common.filters')}</span>
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('meetup.notifications.status')}
              </label>
              <select
                value={filters.filter_read === undefined ? '' : filters.filter_read.toString()}
                onChange={(e) => handleFilterChange('filter_read', e.target.value === '' ? undefined : e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t('common.all')}</option>
                <option value="false">{t('meetup.notifications.unread')}</option>
                <option value="true">{t('meetup.notifications.read')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('meetup.notifications.type')}
              </label>
              <select
                value={filters.filter_type || ''}
                onChange={(e) => handleFilterChange('filter_type', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t('common.all')}</option>
                <option value="meetup_invitation">{t('meetup.notifications.typeInvitation')}</option>
                <option value="meetup_reminder">{t('meetup.notifications.typeReminder')}</option>
                <option value="meetup_update">{t('meetup.notifications.typeUpdate')}</option>
                <option value="city_update">{t('meetup.notifications.typeCityUpdate')}</option>
                <option value="visa_reminder">{t('meetup.notifications.typeVisaReminder')}</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-600">{t('meetup.notifications.total')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.unread}</p>
              <p className="text-xs text-gray-600">{t('meetup.notifications.unread')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{Object.keys(stats.byType).length}</p>
              <p className="text-xs text-gray-600">{t('meetup.notifications.types')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.byPriority.priority_1 || 0}</p>
              <p className="text-xs text-gray-600">{t('meetup.notifications.highPriority')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Batch Actions */}
      {selectedNotifications.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {t('meetup.notifications.selected', { count: selectedNotifications.length.toString() })}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => batchNotificationAction('mark_read', selectedNotifications)}
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                {t('meetup.notifications.markRead')}
              </button>
              <button
                onClick={deleteSelected}
                className="text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                {t('meetup.notifications.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">{t('meetup.notifications.noNotifications')}</p>
            <p className="text-sm text-gray-500">{t('meetup.notifications.checkLater')}</p>
          </div>
        ) : (
          displayedNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`border rounded-lg p-4 transition-colors ${
                notification.is_read 
                  ? 'border-gray-200 bg-gray-50' 
                  : 'border-blue-200 bg-blue-50'
              } ${selectedNotifications.includes(notification.id) ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={selectedNotifications.includes(notification.id)}
                  onChange={() => toggleSelection(notification.id)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                
                <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </h4>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {getNotificationTypeText(notification.type)}
                      </span>
                      {notification.priority > 3 && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          {t('meetup.notifications.highPriority')}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                      {formatTime(notification.created_at)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      {notification.data.creator_name && (
                        <span>{t('meetup.notifications.from')}: {notification.data.creator_name}</span>
                      )}
                      {notification.data.location && (
                        <span>{t('meetup.notifications.at')}: {notification.data.location}</span>
                      )}
                    </div>
                    
                    {notification.action_type && (
                      <div className="flex space-x-2">
                        {notification.action_type === 'accept' && (
                          <>
                            <button
                              onClick={() => handleAction(notification)}
                              className="flex items-center space-x-1 bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                            >
                              <CheckCircle className="h-3 w-3" />
                              <span>{t('meetup.notifications.accept')}</span>
                            </button>
                            <button
                              onClick={() => handleAction({ ...notification, action_type: 'decline' })}
                              className="flex items-center space-x-1 bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                            >
                              <XCircle className="h-3 w-3" />
                              <span>{t('meetup.notifications.decline')}</span>
                            </button>
                          </>
                        )}
                        {notification.action_type === 'view' && (
                          <button
                            onClick={() => handleAction(notification)}
                            className="flex items-center space-x-1 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                          >
                            <MapPin className="h-3 w-3" />
                            <span>{t('meetup.notifications.view')}</span>
                          </button>
                        )}
                        {notification.action_type === 'reply' && (
                          <button
                            onClick={() => handleAction(notification)}
                            className="flex items-center space-x-1 bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700 transition-colors"
                          >
                            <MessageSquare className="h-3 w-3" />
                            <span>{t('meetup.notifications.reply')}</span>
                          </button>
                        )}
                        {notification.action_type === 'dismiss' && (
                          <button
                            onClick={() => handleAction(notification)}
                            className="flex items-center space-x-1 bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700 transition-colors"
                          >
                            <XCircle className="h-3 w-3" />
                            <span>{t('meetup.notifications.dismiss')}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      {notifications.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                {t('meetup.notifications.markAllRead')}
              </button>
              
              {selectedNotifications.length > 0 && (
                <button
                  onClick={deleteSelected}
                  className="text-sm text-red-600 hover:text-red-700 transition-colors"
                >
                  {t('meetup.notifications.deleteSelected')}
                </button>
              )}
            </div>
            
            {notifications.length > 5 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-sm text-gray-600 hover:text-gray-700 transition-colors"
              >
                {showAll ? t('meetup.notifications.showLess') : t('meetup.notifications.showAll')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors mx-auto disabled:opacity-50"
          >
            {loadingMore ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            <span>{loadingMore ? t('common.loading') : t('common.loadMore')}</span>
          </button>
        </div>
      )}
    </div>
  )
}
