import React, { useState, useEffect } from 'react'
import { Calendar, MapPin, Users, Clock, Coffee, MessageCircle } from 'lucide-react'
import { useUser } from '@/contexts/GlobalStateContext'
import { logInfo, logError } from '@/lib/logger'

interface Meetup {
  id: string
  title: string
  description?: string
  location: string
  meeting_time: string
  max_participants: number
  current_participants: number
  status: string
  meetup_type: string
  tags: string[]
  created_at: string
  organizer: {
    id: string
    name: string
    avatar_url?: string
    current_city?: string
  }
  participants: Array<{
    id: string
    status: string
    joined_at: string
    user: {
      id: string
      name: string
      avatar_url?: string
      current_city?: string
    }
  }>
}

interface MyCoffeeMeetupsProps {
  className?: string
}

export default function MyCoffeeMeetups({ className = '' }: MyCoffeeMeetupsProps) {
  const { user } = useUser()
  const [meetups, setMeetups] = useState<Meetup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user.isAuthenticated && user.profile?.id) {
      fetchMyMeetups()
    }
  }, [user.isAuthenticated, user.profile?.id])

  const fetchMyMeetups = async () => {
    if (!user.profile?.id) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/meetups/my?user_id=${user.profile.id}&type=all`)
      const result = await response.json()

      if (result.success) {
        // 只显示coffee类型的meetups
        const coffeeMeetups = result.data.filter((meetup: Meetup) => 
          meetup.meetup_type === 'coffee'
        )
        setMeetups(coffeeMeetups)
        logInfo('Coffee meetups fetched successfully', { count: coffeeMeetups.length }, 'MyCoffeeMeetups')
      } else {
        setError(result.error || 'Failed to fetch meetups')
      }
    } catch (error) {
      logError('Failed to fetch coffee meetups', error, 'MyCoffeeMeetups')
      setError('Failed to fetch meetups')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'full':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isUpcoming = (meetingTime: string) => {
    return new Date(meetingTime) > new Date()
  }

  if (!user.isAuthenticated) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <Coffee className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Please login to view your coffee meetups</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading your coffee meetups...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <button 
            onClick={fetchMyMeetups}
            className="mt-2 text-blue-600 hover:text-blue-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (meetups.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <Coffee className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No Coffee Meetups Yet</h3>
          <p className="text-sm">Start connecting with other digital nomads by sending coffee invitations!</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-6 border-b">
        <div className="flex items-center space-x-2">
          <Coffee className="h-5 w-5 text-amber-600" />
          <h2 className="text-lg font-semibold text-gray-900">My Coffee Meetups</h2>
          <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-full">
            {meetups.length}
          </span>
        </div>
      </div>

      <div className="divide-y">
        {meetups.map((meetup) => (
          <div key={meetup.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{meetup.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(meetup.status)}`}>
                    {meetup.status}
                  </span>
                  {isUpcoming(meetup.meeting_time) && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      Upcoming
                    </span>
                  )}
                </div>

                {meetup.description && (
                  <p className="text-gray-600 text-sm mb-3">{meetup.description}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(meetup.meeting_time)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{meetup.location}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{meetup.current_participants}/{meetup.max_participants} participants</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Organized by {meetup.organizer.name}</span>
                  </div>
                </div>

                {/* Participants */}
                {meetup.participants && meetup.participants.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Participants:</h4>
                    <div className="flex flex-wrap gap-2">
                      {meetup.participants.map((participant) => (
                        <div key={participant.id} className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full">
                          {participant.user.avatar_url ? (
                            <img 
                              src={participant.user.avatar_url} 
                              alt={participant.user.name}
                              className="h-6 w-6 rounded-full"
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">
                                {participant.user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="text-sm text-gray-700">{participant.user.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="ml-4 flex flex-col space-y-2">
                {isUpcoming(meetup.meeting_time) && (
                  <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm">
                    <MessageCircle className="h-4 w-4" />
                    <span>Coordinate</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
