'use client'

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, Bell, BellOff, Activity } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import realtimeService, { RealtimeUpdate } from '@/lib/realtimeUpdateService'

interface RealtimeStatusIndicatorProps {
  cityId?: string
  userId?: string
  showNotifications?: boolean
}

export default function RealtimeStatusIndicator({
  cityId,
  userId,
  showNotifications = true
}: RealtimeStatusIndicatorProps) {
  const { t } = useTranslation()
  const [isConnected, setIsConnected] = useState(false)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [recentUpdates, setRecentUpdates] = useState<RealtimeUpdate[]>([])
  const [showUpdates, setShowUpdates] = useState(false)

  useEffect(() => {
    // 连接实时服务
    realtimeService.connect({
      cityId,
      userId,
      enableNotifications: showNotifications
    })

    // 监听连接状态变化
    const updateStatus = () => {
      const status = realtimeService.getConnectionStatus()
      setIsConnected(status.isConnected)
      setReconnectAttempts(status.reconnectAttempts)
    }

    // 初始状态
    updateStatus()

    // 定期检查状态
    const statusInterval = setInterval(updateStatus, 5000)

    // 订阅实时更新
    const unsubscribe = realtimeService.subscribe('all', (update) => {
      setRecentUpdates(prev => {
        const newUpdates = [update, ...prev.slice(0, 4)] // 保留最近5个更新
        return newUpdates
      })
    })

    // 检查通知权限
    if (showNotifications) {
      setNotificationsEnabled(Notification.permission === 'granted')
    }

    return () => {
      clearInterval(statusInterval)
      unsubscribe()
      realtimeService.disconnect()
    }
  }, [cityId, userId, showNotifications])

  const handleNotificationToggle = async () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false)
    } else {
      await realtimeService.requestNotificationPermission()
      setNotificationsEnabled(Notification.permission === 'granted')
    }
  }

  const getStatusColor = () => {
    if (isConnected) return 'text-green-500'
    if (reconnectAttempts > 0) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getStatusText = () => {
    if (isConnected) return t('realtime.connected')
    if (reconnectAttempts > 0) return t('realtime.reconnecting', { attempts: reconnectAttempts.toString() })
    return t('realtime.disconnected')
  }

  const formatUpdateTime = (timestamp: string) => {
    const now = new Date()
    const updateTime = new Date(timestamp)
    const diffMs = now.getTime() - updateTime.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)

    if (diffSeconds < 60) {
      return t('realtime.justNow')
    } else if (diffMinutes < 60) {
      return t('realtime.minutesAgo', { minutes: diffMinutes.toString() })
    } else {
      return updateTime.toLocaleTimeString()
    }
  }

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'review':
        return '💬'
      case 'photo':
        return '📸'
      case 'vote':
        return '👍'
      case 'favorite':
        return '❤️'
      default:
        return '📡'
    }
  }

  const getUpdateText = (update: RealtimeUpdate) => {
    switch (update.type) {
      case 'review':
        return t('realtime.newReview', { user: update.data.userName, city: update.data.cityName })
      case 'photo':
        return t('realtime.newPhoto', { user: update.data.photographer, city: update.data.cityName })
      case 'vote':
        return t('realtime.newVote', { city: update.data.cityName })
      case 'favorite':
        return t('realtime.newFavorite', { user: update.data.userName, city: update.data.cityName })
      default:
        return t('realtime.newUpdate')
    }
  }

  return (
    <div className="relative">
      {/* 状态指示器 */}
      <div className="flex items-center space-x-2">
        <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
          {isConnected ? (
            <Wifi className="h-4 w-4" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
          <span className="text-xs font-medium">{getStatusText()}</span>
        </div>

        {/* 通知开关 */}
        {showNotifications && (
          <button
            onClick={handleNotificationToggle}
            className={`p-1 rounded-full transition-colors ${
              notificationsEnabled 
                ? 'text-blue-500 hover:text-blue-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title={notificationsEnabled ? t('realtime.disableNotifications') : t('realtime.enableNotifications')}
          >
            {notificationsEnabled ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
          </button>
        )}

        {/* 实时更新指示器 */}
        {recentUpdates.length > 0 && (
          <button
            onClick={() => setShowUpdates(!showUpdates)}
            className="relative p-1 text-gray-500 hover:text-gray-700"
            title={t('realtime.recentUpdates')}
          >
            <Activity className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>
        )}
      </div>

      {/* 实时更新面板 */}
      {showUpdates && recentUpdates.length > 0 && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">
              {t('realtime.recentUpdates')}
            </h3>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {recentUpdates.map((update, index) => (
              <div
                key={`${update.timestamp}-${index}`}
                className="p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
              >
                <div className="flex items-start space-x-2">
                  <span className="text-lg">{getUpdateIcon(update.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">
                      {getUpdateText(update)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatUpdateTime(update.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-2 border-t border-gray-200">
            <button
              onClick={() => setShowUpdates(false)}
              className="w-full text-xs text-gray-500 hover:text-gray-700"
            >
              {t('realtime.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
