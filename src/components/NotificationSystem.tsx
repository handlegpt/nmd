'use client'

import { useState } from 'react'
import { Bell, X } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function NotificationSystem() {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'info',
      message: t('notifications.welcome'),
      read: false
    },
    {
      id: 2,
      type: 'warning',
      message: t('notifications.visaExpiry'),
      read: false
    }
  ])
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
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
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200'
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
                      <p className="text-sm flex-1">{notification.message}</p>
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

