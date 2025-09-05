'use client'

import { useState } from 'react'
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
}

interface UserDetailModalProps {
  user: NomadUser | null
  isOpen: boolean
  onClose: () => void
  onCoffeeMeetup: (userId: string) => void
  onSendMessage: (userId: string) => void
  onAddToFavorites: (userId: string) => void
  isFavorite: boolean
  isLoading?: boolean
}

export default function UserDetailModal({
  user,
  isOpen,
  onClose,
  onCoffeeMeetup,
  onSendMessage,
  onAddToFavorites,
  isFavorite,
  isLoading = false
}: UserDetailModalProps) {
  const { t } = useTranslation()
  const [sendingInvitation, setSendingInvitation] = useState(false)

  if (!isOpen || !user) return null

  const handleCoffeeMeetup = async () => {
    setSendingInvitation(true)
    try {
      await onCoffeeMeetup(user.id)
    } finally {
      setSendingInvitation(false)
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
            {/* User Info */}
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {user.avatar}
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
                disabled={sendingInvitation || isLoading || !user.isAvailable}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Coffee className="w-4 h-4" />
                <span>
                  {sendingInvitation ? 'Sending...' : 'Meet for Coffee'}
                </span>
              </button>
              <button
                onClick={() => onSendMessage(user.id)}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message</span>
              </button>
              <button
                onClick={() => onAddToFavorites(user.id)}
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
