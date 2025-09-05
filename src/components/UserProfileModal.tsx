'use client'

import { useState } from 'react'
import { X, MapPin, Clock, Coffee, MessageSquare, Star, Calendar, Globe, Heart } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useNotifications, useUser } from '@/contexts/GlobalStateContext'
import { logInfo, logError } from '@/lib/logger'
import { sendMeetupInvitation } from '@/lib/meetupApi'
import type { MeetupUser } from '@/lib/meetupApi'

interface UserProfileModalProps {
  user: MeetupUser | null
  isOpen: boolean
  onClose: () => void
}

export default function UserProfileModal({ user, isOpen, onClose }: UserProfileModalProps) {
  const { t } = useTranslation()
  const { user: currentUser } = useUser()
  const { addNotification } = useNotifications()
  const [sendingInvitation, setSendingInvitation] = useState(false)

  if (!isOpen || !user) return null

  const handleSendInvitation = async () => {
    if (!currentUser.isAuthenticated) {
      addNotification({
        type: 'warning',
        message: t('meetup.pleaseLoginToMeetup')
      })
      return
    }

    setSendingInvitation(true)
    
    try {
      const result = await sendMeetupInvitation(
        user.id,
        'Coffee Shop',
        new Date().toISOString(),
        'Let\'s meet for coffee!'
      )
      
      if (result.success) {
        addNotification({
          type: 'success',
          message: t('meetup.requestSent')
        })
        onClose()
      } else {
        addNotification({
          type: 'error',
          message: result.message
        })
      }
    } catch (error) {
      logError('Failed to send meetup invitation', error, 'UserProfileModal')
      addNotification({
        type: 'error',
        message: t('meetup.requestFailed')
      })
    } finally {
      setSendingInvitation(false)
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'online' ? 'bg-green-500' : 'bg-gray-400'
  }

  const getAvailabilityColor = (isAvailable: boolean) => {
    return isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">{t('meetup.userProfile')}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-center space-x-4 mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${
              user.isAvailable ? 'bg-green-500' : 'bg-gray-400'
            }`}>
              {user.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="text-xl font-bold text-gray-900">{user.name}</h4>
                <span className={`w-3 h-3 rounded-full ${getStatusColor(user.status)}`}></span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <MapPin className="h-3 w-3" />
                <span>{user.location}</span>
              </div>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(user.isAvailable)}`}>
                {user.isAvailable ? t('meetup.available') : t('meetup.busy')}
              </span>
            </div>
          </div>

          {/* Status and Last Seen */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{t('meetup.lastSeen')}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{user.lastSeen}</span>
            </div>
          </div>

          {/* Interests */}
          <div className="mb-6">
            <h5 className="font-medium text-gray-900 mb-3 flex items-center">
              <Heart className="h-4 w-4 mr-2 text-red-500" />
              {t('meetup.interests')}
            </h5>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Timezone */}
          <div className="mb-6">
            <h5 className="font-medium text-gray-900 mb-2 flex items-center">
              <Globe className="h-4 w-4 mr-2 text-blue-500" />
              {t('meetup.timezone')}
            </h5>
            <p className="text-sm text-gray-600">{user.timezone}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">24</div>
              <div className="text-xs text-gray-600">{t('meetup.meetups')}</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">4.8</div>
              <div className="text-xs text-gray-600">{t('meetup.rating')}</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">156</div>
              <div className="text-xs text-gray-600">{t('meetup.days')}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            {user.isAvailable ? (
              <button
                onClick={handleSendInvitation}
                disabled={sendingInvitation}
                className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {sendingInvitation ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{t('common.submitting')}</span>
                  </>
                ) : (
                  <>
                    <Coffee className="h-4 w-4" />
                    <span>{t('meetup.coffeeMeetup')}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                disabled
                className="flex-1 flex items-center justify-center space-x-2 bg-gray-400 text-white py-3 px-4 rounded-lg cursor-not-allowed"
              >
                <Clock className="h-4 w-4" />
                <span>{t('meetup.busy')}</span>
              </button>
            )}
            <button className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              <MessageSquare className="h-4 w-4" />
              <span>{t('meetup.message')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
