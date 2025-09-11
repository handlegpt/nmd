'use client'

import { useState, useEffect } from 'react'
import { 
  X, 
  MapPin, 
  Star, 
  Coffee, 
  MessageCircle, 
  Heart, 
  Clock, 
  Users,
  Calendar,
  Phone,
  Mail,
  Globe,
  Building,
  Award
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useNomadUsers, NomadUser } from '@/hooks/useNomadUsers'
import { useUser } from '@/contexts/GlobalStateContext'
import { logInfo, logError } from '@/lib/logger'
import ErrorAlert, { ErrorAlertSimple } from '@/components/ErrorAlert'

// NomadUser interface is now imported from useNomadUsers hook

interface UserDetailModalProps {
  user: NomadUser | null
  isOpen: boolean
  onClose: () => void
  // 用户操作现在由Hook管理，简化props
  onSendMessage?: (userId: string) => void
}

export default function UserDetailModal({
  user,
  isOpen,
  onClose,
  onSendMessage
}: UserDetailModalProps) {
  const { t } = useTranslation()
  const { user: currentUser } = useUser()
  const [sendingInvitation, setSendingInvitation] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 使用统一的用户数据管理Hook
  const {
    addToFavorites,
    removeFromFavorites,
    sendCoffeeInvitation,
    getFavorites
  } = useNomadUsers({
    enablePagination: false,
    enableInfiniteScroll: false,
    enableRealTimeUpdates: false
  })

  if (!isOpen || !user) return null

  // 检查是否为收藏用户
  const [isFavorite, setIsFavorite] = useState(false)
  
  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const favorites = await getFavorites()
        setIsFavorite(favorites.includes(user.id))
      } catch (error) {
        console.error('Failed to check favorite status:', error)
      }
    }
    checkFavorite()
  }, [getFavorites, user.id])

  const handleCoffeeMeetup = async () => {
    if (!currentUser.isAuthenticated) {
      alert('Please login to send coffee meetup invitations')
      return
    }

    setSendingInvitation(true)
    setError(null)
    
    try {
      const success = await sendCoffeeInvitation(user.id)
      if (success) {
        logInfo('Coffee invitation sent successfully', { userId: user.id }, 'UserDetailModal')
        alert(`Coffee meetup invitation sent to ${user.name}! They will respond within 24 hours.`)
      } else {
        setError('Failed to send invitation. Please try again.')
      }
    } catch (error) {
      logError('Failed to send coffee meetup invitation', error, 'UserDetailModal')
      setError('Failed to send invitation. Please try again.')
    } finally {
      setSendingInvitation(false)
    }
  }

  const handleAddToFavorites = () => {
    try {
      if (isFavorite) {
        removeFromFavorites(user.id)
        logInfo('User removed from favorites', { userId: user.id }, 'UserDetailModal')
      } else {
        addToFavorites(user.id)
        logInfo('User added to favorites', { userId: user.id }, 'UserDetailModal')
      }
    } catch (error) {
      logError('Failed to update favorites', error, 'UserDetailModal')
      setError('Failed to update favorites. Please try again.')
    }
  }

  const handleSendMessage = () => {
    if (onSendMessage) {
      onSendMessage(user.id)
    } else {
      alert(`Message feature coming soon! You'll be able to chat with ${user.name}.`)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {user.name}
              </h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* 错误显示 */}
            {error && (
              <ErrorAlertSimple
                message={error}
                onRetry={() => setError(null)}
                onDismiss={() => setError(null)}
              />
            )}
            
            {/* User Info */}
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                {user.avatar_url && user.avatar_url.startsWith('data:') ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  user.avatar
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                  {user.name}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {user.profession}
                  {user.company && ` at ${user.company}`}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{user.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{user.rating} ({user.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.isOnline && user.isAvailable 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {user.isOnline && user.isAvailable ? 'Available' : 'Busy'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {user.lastSeen}
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                About
              </h5>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {user.bio}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Coffee className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Meetups
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.meetupCount}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Compatibility
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.compatibility}%
                </p>
              </div>
            </div>

            {/* Interests */}
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Interests
              </h5>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.mutualInterests.includes(interest)
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {interest}
                    {user.mutualInterests.includes(interest) && (
                      <span className="ml-1">★</span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Mutual Interests */}
            {user.mutualInterests.length > 0 && (
              <div className="mb-6">
                <h5 className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                  Mutual Interests ({user.mutualInterests.length})
                </h5>
                <div className="flex flex-wrap gap-2">
                  {user.mutualInterests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={handleCoffeeMeetup}
                disabled={sendingInvitation || !user.isAvailable}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Coffee className="w-4 h-4" />
                <span>
                  {sendingInvitation ? 'Sending...' : 'Meet for Coffee'}
                </span>
              </button>
              <button
                onClick={handleSendMessage}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message</span>
              </button>
              <button
                onClick={handleAddToFavorites}
                className={`p-3 rounded-lg border transition-colors ${
                  isFavorite
                    ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
