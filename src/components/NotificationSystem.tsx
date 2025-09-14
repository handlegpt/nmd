'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Coffee, Users, Calendar } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useUser } from '@/contexts/GlobalStateContext'
import { logInfo, logError } from '@/lib/logger'

interface Notification {
  id: string
  type: 'info' | 'warning' | 'success' | 'error' | 'invitation'
  message: string
  read: boolean
  data?: any
  created_at?: string
}

export default function NotificationSystem() {
  const { t } = useTranslation()
  const { user } = useUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  // 获取邀请通知
  const fetchInvitations = async () => {
    if (!user.isAuthenticated || !user.profile?.id) return

    try {
      setLoading(true)
      const response = await fetch(`/api/invitations?user_id=${user.profile.id}&status=pending`)
      const result = await response.json()
      
      if (result.success && result.data) {
        const invitationNotifications: Notification[] = result.data.map((invitation: any) => ({
          id: invitation.id,
          type: 'invitation' as const,
          message: `${invitation.sender?.name || 'Someone'} invited you for ${invitation.invitation_type === 'coffee_meetup' ? 'coffee' : 'work together'}`,
          read: false,
          data: invitation,
          created_at: invitation.created_at
        }))
        
        setNotifications(prev => {
          // 合并新邀请，避免重复
          const existingIds = new Set(prev.map(n => n.id))
          const newNotifications = invitationNotifications.filter(n => !existingIds.has(n.id))
          return [...prev, ...newNotifications]
        })
      }
    } catch (error) {
      logError('Failed to fetch invitations for notifications', error, 'NotificationSystem')
    } finally {
      setLoading(false)
    }
  }

  // 请求浏览器通知权限
  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  }

  // 显示浏览器通知
  const showBrowserNotification = (notification: Notification) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('New Invitation!', {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      })
    }
  }

  // 定期检查新邀请
  useEffect(() => {
    if (user.isAuthenticated) {
      // 请求通知权限
      requestNotificationPermission()
      
      // 获取初始邀请
      fetchInvitations()
      
      // 设置定期检查
      const interval = setInterval(async () => {
        const oldCount = notifications.length
        await fetchInvitations()
        // 如果有新通知，显示浏览器通知
        if (notifications.length > oldCount) {
          const newNotifications = notifications.slice(oldCount)
          newNotifications.forEach(showBrowserNotification)
        }
      }, 30000) // 每30秒检查一次
      
      return () => clearInterval(interval)
    }
  }, [user.isAuthenticated, user.profile?.id, notifications.length])

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const handleInvitationAction = async (invitationId: string, action: 'accept' | 'decline') => {
    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action === 'accept' ? 'accepted' : 'declined' })
      })
      
      if (response.ok) {
        // 移除通知
        removeNotification(invitationId)
        // 显示成功消息
        alert(`Invitation ${action}ed successfully!`)
      }
    } catch (error) {
      logError('Failed to handle invitation action', error, 'NotificationSystem')
      alert('Failed to process invitation. Please try again.')
    }
  }

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'info':
        return 'bg-blue-50 text-blue-800 border-blue-200'
      case 'warning':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200'
      case 'success':
        return 'bg-green-50 text-green-800 border-green-200'
      case 'error':
        return 'bg-red-50 text-red-800 border-red-200'
      case 'invitation':
        return 'bg-purple-50 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'invitation':
        return <Coffee className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{t('notifications.title')}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {t('notifications.noNotifications')}
              </div>
            ) : (
              <div className="p-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border mb-2 ${getTypeStyles(notification.type)} ${
                      notification.read ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2 flex-1">
                        {getTypeIcon(notification.type)}
                        <div className="flex-1">
                          <p className="text-sm">{notification.message}</p>
                          {notification.type === 'invitation' && notification.data && (
                            <div className="mt-2 flex space-x-2">
                              <button
                                onClick={() => handleInvitationAction(notification.id, 'accept')}
                                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleInvitationAction(notification.id, 'decline')}
                                className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs underline hover:no-underline"
                          >
                            {t('notifications.markAsRead')}
                          </button>
                        )}
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setNotifications(prev => prev.map(n => ({ ...n, read: true })))
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {t('notifications.markAllAsRead')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

