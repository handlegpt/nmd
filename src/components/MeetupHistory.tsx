'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock as ClockIcon,
  Search,
  Filter,
  Download,
  Star,
  Eye,
  MessageSquare,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { logInfo, logError } from '@/lib/logger'
import { 
  getUserMeetupHistory, 
  getMeetupDetails,
  getMeetupStats,
  type Meetup,
  type GetMeetupHistoryOptions
} from '@/lib/meetupHistoryApi'
import { useUser, useNotifications } from '@/contexts/GlobalStateContext'

export default function MeetupHistory() {
  const { t } = useTranslation()
  const { user } = useUser()
  const { addNotification } = useNotifications()
  const [meetups, setMeetups] = useState<Meetup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)
  
  // 筛选和搜索状态
  const [filters, setFilters] = useState<GetMeetupHistoryOptions>({
    page: 1,
    limit: 20
  })
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    if (user.isAuthenticated) {
      fetchMeetupHistory()
      fetchStats()
    } else {
      setLoading(false)
    }
  }, [filters, user.isAuthenticated])

  const fetchMeetupHistory = async (append = false) => {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      setError(null)
      
      const result = await getUserMeetupHistory({
        ...filters,
        search: searchTerm || undefined
      })

      if (append) {
        setMeetups(prev => [...prev, ...result.meetups])
      } else {
        setMeetups(result.meetups)
      }
      
      setHasMore(result.hasMore)
    } catch (error) {
      logError('Failed to fetch meetup history', error, 'MeetupHistory')
      setError(t('meetup.failedToLoadHistory'))
      addNotification({
        type: 'error',
        message: t('meetup.failedToLoadHistory')
      })
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const fetchStats = async () => {
    try {
      const statsData = await getMeetupStats()
      setStats(statsData)
    } catch (error) {
      logError('Failed to fetch meetup stats', error, 'MeetupHistory')
    }
  }

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (key: keyof GetMeetupHistoryOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))
    }
  }

  const exportHistory = () => {
    try {
      const csvContent = [
        ['Title', 'Location', 'Date', 'Status', 'Type', 'Participants', 'Rating'].join(','),
        ...meetups.map(meetup => [
          `"${meetup.title}"`,
          `"${meetup.location}"`,
          `"${formatDate(meetup.scheduled_time)}"`,
          meetup.status,
          meetup.meetup_type,
          meetup.total_participants || 0,
          meetup.average_rating || 0
        ].join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `meetup-history-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      addNotification({
        type: 'success',
        message: t('meetup.historyExported')
      })
    } catch (error) {
      logError('Failed to export history', error, 'MeetupHistory')
      addNotification({
        type: 'error',
        message: t('meetup.exportFailed')
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'active':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      case 'scheduled':
        return <ClockIcon className="h-4 w-4" />
      case 'active':
        return <ClockIcon className="h-4 w-4" />
      default:
        return <ClockIcon className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return t('meetup.statusCompleted')
      case 'cancelled':
        return t('meetup.statusCancelled')
      case 'scheduled':
        return t('meetup.statusScheduled')
      case 'active':
        return t('meetup.statusActive')
      default:
        return status
    }
  }

  const getMeetupTypeText = (type: string) => {
    switch (type) {
      case 'casual':
        return t('meetup.typeCasual')
      case 'work':
        return t('meetup.typeWork')
      case 'social':
        return t('meetup.typeSocial')
      case 'activity':
        return t('meetup.typeActivity')
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('meetup.history')}</h3>
          <p className="text-gray-600 mb-4">{t('meetup.historyDescription')}</p>
          <p className="text-sm text-gray-500 mb-4">{t('meetup.pleaseLoginToViewHistory')}</p>
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
          <Calendar className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchMeetupHistory()}
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
          <div className="p-2 bg-purple-100 rounded-lg">
            <Calendar className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{t('meetup.history')}</h3>
            <p className="text-sm text-gray-600">{t('meetup.historyDescription')}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">{meetups.length} {t('meetup.meetups')}</span>
          <button
            onClick={exportHistory}
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>{t('meetup.export')}</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('meetup.searchPlaceholder')}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('meetup.status')}
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t('common.all')}</option>
                <option value="scheduled">{t('meetup.statusScheduled')}</option>
                <option value="active">{t('meetup.statusActive')}</option>
                <option value="completed">{t('meetup.statusCompleted')}</option>
                <option value="cancelled">{t('meetup.statusCancelled')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('meetup.type')}
              </label>
              <select
                value={filters.meetup_type || ''}
                onChange={(e) => handleFilterChange('meetup_type', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t('common.all')}</option>
                <option value="casual">{t('meetup.typeCasual')}</option>
                <option value="work">{t('meetup.typeWork')}</option>
                <option value="social">{t('meetup.typeSocial')}</option>
                <option value="activity">{t('meetup.typeActivity')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('meetup.dateFrom')}
              </label>
              <input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => handleFilterChange('date_from', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMeetups}</p>
              <p className="text-xs text-gray-600">{t('meetup.totalMeetups')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.completedMeetups}</p>
              <p className="text-xs text-gray-600">{t('meetup.completed')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.participationRate}%</p>
              <p className="text-xs text-gray-600">{t('meetup.participationRate')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{stats.averageRating}</p>
              <p className="text-xs text-gray-600">{t('meetup.averageRating')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Meetup List */}
      <div className="space-y-4">
        {meetups.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">{t('meetup.noHistory')}</p>
            <p className="text-sm text-gray-500">{t('meetup.startMeeting')}</p>
          </div>
        ) : (
          meetups.map((meetup) => (
            <div key={meetup.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(meetup.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meetup.status)}`}>
                    {getStatusText(meetup.status)}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {getMeetupTypeText(meetup.meetup_type)}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{formatDate(meetup.created_at)}</span>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">{meetup.title}</h4>
                
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{meetup.location}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{formatDate(meetup.scheduled_time)}</span>
                </div>
                
                {meetup.description && (
                  <p className="text-sm text-gray-600 mt-2">{meetup.description}</p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{meetup.total_participants || 0} {t('meetup.participants')}</span>
                    </div>
                    {meetup.average_rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span>{meetup.average_rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors">
                      <Eye className="h-3 w-3" />
                      <span>{t('common.view')}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-green-600 hover:text-green-700 transition-colors">
                      <MessageSquare className="h-3 w-3" />
                      <span>{t('common.message')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

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
