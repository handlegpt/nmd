'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { useUser } from '@/hooks/useUser'
import { realtimeApiService, OnlineUser } from '@/lib/realtimeApiService'
import { userRatingApiService } from '@/lib/userRatingApiService'
import { meetupApiService } from '@/lib/meetupApiService'
import { 
  MapPin, 
  Users, 
  Coffee, 
  Briefcase, 
  Star,
  MessageCircle,
  UserPlus,
  Clock,
  Wifi,
  Globe
} from 'lucide-react'

interface HomeLocalNomadsApiProps {
  className?: string
}

export default function HomeLocalNomadsApi({ className = '' }: HomeLocalNomadsApiProps) {
  const { t } = useTranslation()
  const { user } = useUser()
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState<{ city: string; country: string } | null>(null)
  const [nearbyUsers, setNearbyUsers] = useState<OnlineUser[]>([])
  const [showAllUsers, setShowAllUsers] = useState(false)

  useEffect(() => {
    loadOnlineUsers()
    getCurrentLocation()
    
    // Set up periodic updates
    const interval = setInterval(loadOnlineUsers, 30000) // Update every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (user?.id) {
      // Update user's online status
      realtimeApiService.updateOnlineStatus(user.id, 'online', {
        city: location?.city || 'Unknown',
        country: location?.country || 'Unknown'
      })
    }
  }, [user?.id, location])

  const loadOnlineUsers = async () => {
    try {
      const users = await realtimeApiService.getOnlineUsers('online', 50)
      setOnlineUsers(users)
      
      if (location) {
        const nearby = await realtimeApiService.getNearbyOnlineUsers(
          // Mock coordinates for demo - in real app, get from user's location
          35.6762, 139.6503, // Tokyo coordinates
          50, // 50km radius
          20
        )
        setNearbyUsers(nearby)
      }
    } catch (error) {
      console.error('Error loading online users:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentLocation = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            // In a real app, you would reverse geocode the coordinates
            // For now, we'll use a mock location
            setLocation({ city: 'Tokyo', country: 'Japan' })
          },
          (error) => {
            console.error('Error getting location:', error)
            setLocation({ city: 'Tokyo', country: 'Japan' }) // Fallback
          }
        )
      } else {
        setLocation({ city: 'Tokyo', country: 'Japan' }) // Fallback
      }
    } catch (error) {
      console.error('Error getting location:', error)
      setLocation({ city: 'Tokyo', country: 'Japan' }) // Fallback
    }
  }

  const handleCoffeeMeetup = async (targetUserId: string) => {
    if (!user?.id) return

    try {
      const meetup = await meetupApiService.createMeetup({
        organizer_id: user.id,
        title: 'Coffee Meetup',
        description: 'Let\'s grab a coffee together!',
        location: 'Local Coffee Shop',
        meeting_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        max_participants: 2,
        meetup_type: 'coffee',
        tags: ['coffee', 'casual']
      })

      if (meetup) {
        // In a real app, you would send an invitation to the target user
        alert('Coffee meetup invitation sent!')
      }
    } catch (error) {
      console.error('Error creating coffee meetup:', error)
      alert('Failed to send coffee meetup invitation')
    }
  }

  const handleWorkTogether = async (targetUserId: string) => {
    if (!user?.id) return

    try {
      const meetup = await meetupApiService.createMeetup({
        organizer_id: user.id,
        title: 'Work Together',
        description: 'Let\'s work together and share ideas!',
        location: 'Co-working Space',
        meeting_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        max_participants: 4,
        meetup_type: 'work',
        tags: ['work', 'collaboration']
      })

      if (meetup) {
        // In a real app, you would send an invitation to the target user
        alert('Work together invitation sent!')
      }
    } catch (error) {
      console.error('Error creating work together meetup:', error)
      alert('Failed to send work together invitation')
    }
  }

  const handleRateUser = async (targetUserId: string, rating: number, category: string) => {
    if (!user?.id) return

    try {
      const result = await userRatingApiService.createUserRating(
        user.id,
        targetUserId,
        category,
        rating
      )

      if (result) {
        alert('Rating submitted successfully!')
      }
    } catch (error) {
      console.error('Error rating user:', error)
      alert('Failed to submit rating')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'busy': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return t('status.online', 'Online')
      case 'away': return t('status.away', 'Away')
      case 'busy': return t('status.busy', 'Busy')
      default: return t('status.offline', 'Offline')
    }
  }

  const displayUsers = showAllUsers ? onlineUsers : nearbyUsers

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('localNomads.title', 'Local Nomads')}
          </h2>
          {location && (
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              <span>
                {t('localNomads.youAreIn', 'You\'re in')} {location.city}, {location.country}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAllUsers(!showAllUsers)}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
          >
            {showAllUsers ? t('localNomads.showNearby', 'Show Nearby') : t('localNomads.showAll', 'Show All')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-blue-900">{nearbyUsers.length}</div>
              <div className="text-sm text-blue-700">
                {t('localNomads.nearby', 'people online nearby')}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Globe className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-green-900">{onlineUsers.length}</div>
              <div className="text-sm text-green-700">
                {t('localNomads.global', 'nomads active globally')}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Wifi className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-purple-900">128</div>
              <div className="text-sm text-purple-700">
                {t('localNomads.globalNomads', 'Global Nomads')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {displayUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t('localNomads.noUsers', 'No nomads online at the moment')}
          </div>
        ) : (
          displayUsers.map((onlineUser) => (
            <div key={onlineUser.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    {onlineUser.user?.avatar_url ? (
                      <img
                        src={onlineUser.user.avatar_url}
                        alt={onlineUser.user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600 font-medium">
                        {onlineUser.user?.name?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(onlineUser.status)}`}></div>
                </div>
                
                <div>
                  <div className="font-medium text-gray-900">
                    {onlineUser.user?.name || 'Unknown User'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {onlineUser.user?.current_city || 'Unknown Location'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {getStatusText(onlineUser.status)} • {onlineUser.user?.profession || 'Digital Nomad'}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCoffeeMeetup(onlineUser.user_id)}
                  className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm hover:bg-orange-200 transition-colors"
                  title={t('localNomads.coffeeMeetup', 'Coffee Meetup')}
                >
                  <Coffee className="w-4 h-4" />
                  {t('localNomads.coffee', 'Coffee')}
                </button>
                
                <button
                  onClick={() => handleWorkTogether(onlineUser.user_id)}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                  title={t('localNomads.workTogether', 'Work Together')}
                >
                  <Briefcase className="w-4 h-4" />
                  {t('localNomads.work', 'Work')}
                </button>

                <button
                  onClick={() => handleRateUser(onlineUser.user_id, 5, 'overall')}
                  className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200 transition-colors"
                  title={t('localNomads.rateUser', 'Rate User')}
                >
                  <Star className="w-4 h-4" />
                  {t('localNomads.rate', 'Rate')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {!showAllUsers && nearbyUsers.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowAllUsers(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('localNomads.viewAll', 'View All Online Nomads')}
          </button>
        </div>
      )}
    </div>
  )
}
