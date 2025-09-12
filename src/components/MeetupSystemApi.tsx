'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { meetupApiService, Meetup, MeetupReview, MeetupParticipant } from '@/lib/meetupApiService'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  Star,
  MessageCircle,
  UserPlus,
  UserMinus,
  Edit,
  Trash2,
  Filter
} from 'lucide-react'

interface MeetupSystemApiProps {
  userId?: string
  onMeetupCreated?: (meetup: Meetup) => void
  onMeetupJoined?: (meetup: Meetup) => void
  onMeetupLeft?: (meetup: Meetup) => void
}

export default function MeetupSystemApi({ 
  userId, 
  onMeetupCreated, 
  onMeetupJoined, 
  onMeetupLeft 
}: MeetupSystemApiProps) {
  const { t } = useTranslation()
  const [meetups, setMeetups] = useState<Meetup[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedMeetup, setSelectedMeetup] = useState<Meetup | null>(null)
  const [filter, setFilter] = useState<'all' | 'coffee' | 'work' | 'social'>('all')
  const [newMeetup, setNewMeetup] = useState({
    title: '',
    description: '',
    location: '',
    meeting_time: '',
    max_participants: 10,
    meetup_type: 'coffee' as 'coffee' | 'work' | 'social' | 'other',
    tags: [] as string[]
  })

  useEffect(() => {
    loadMeetups()
  }, [filter])

  const loadMeetups = async () => {
    try {
      setLoading(true)
      const meetupType = filter === 'all' ? undefined : filter
      const meetups = await meetupApiService.getMeetups('active', meetupType)
      setMeetups(meetups)
    } catch (error) {
      console.error('Error loading meetups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMeetup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    try {
      const meetup = await meetupApiService.createMeetup({
        organizer_id: userId,
        ...newMeetup
      })

      if (meetup) {
        setMeetups(prev => [meetup, ...prev])
        setNewMeetup({
          title: '',
          description: '',
          location: '',
          meeting_time: '',
          max_participants: 10,
          meetup_type: 'coffee',
          tags: []
        })
        setShowCreateForm(false)
        onMeetupCreated?.(meetup)
      }
    } catch (error) {
      console.error('Error creating meetup:', error)
    }
  }

  const handleJoinMeetup = async (meetupId: string) => {
    if (!userId) return

    try {
      const participant = await meetupApiService.joinMeetup(meetupId, userId)
      if (participant) {
        await loadMeetups() // Reload to get updated participant count
        const meetup = meetups.find(m => m.id === meetupId)
        if (meetup) {
          onMeetupJoined?.(meetup)
        }
      }
    } catch (error) {
      console.error('Error joining meetup:', error)
    }
  }

  const handleLeaveMeetup = async (meetupId: string) => {
    if (!userId) return

    try {
      const success = await meetupApiService.leaveMeetup(meetupId, userId)
      if (success) {
        await loadMeetups() // Reload to get updated participant count
        const meetup = meetups.find(m => m.id === meetupId)
        if (meetup) {
          onMeetupLeft?.(meetup)
        }
      }
    } catch (error) {
      console.error('Error leaving meetup:', error)
    }
  }

  const isUserParticipant = (meetup: Meetup): boolean => {
    if (!userId) return false
    return meetup.participants?.some(p => p.user_id === userId && p.status === 'joined') || false
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredMeetups = meetups.filter(meetup => {
    if (filter === 'all') return true
    return meetup.meetup_type === filter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {t('meetups.title', 'Meetups')}
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('meetups.create', 'Create Meetup')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'coffee', 'work', 'social'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t(`meetups.types.${type}`, type.charAt(0).toUpperCase() + type.slice(1))}
          </button>
        ))}
      </div>

      {/* Create Meetup Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4">
            {t('meetups.createNew', 'Create New Meetup')}
          </h3>
          <form onSubmit={handleCreateMeetup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('meetups.title', 'Title')}
              </label>
              <input
                type="text"
                value={newMeetup.title}
                onChange={(e) => setNewMeetup(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('meetups.description', 'Description')}
              </label>
              <textarea
                value={newMeetup.description}
                onChange={(e) => setNewMeetup(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('meetups.location', 'Location')}
                </label>
                <input
                  type="text"
                  value={newMeetup.location}
                  onChange={(e) => setNewMeetup(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('meetups.meetingTime', 'Meeting Time')}
                </label>
                <input
                  type="datetime-local"
                  value={newMeetup.meeting_time}
                  onChange={(e) => setNewMeetup(prev => ({ ...prev, meeting_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('meetups.type', 'Type')}
                </label>
                <select
                  value={newMeetup.meetup_type}
                  onChange={(e) => setNewMeetup(prev => ({ ...prev, meetup_type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="coffee">{t('meetups.types.coffee', 'Coffee')}</option>
                  <option value="work">{t('meetups.types.work', 'Work')}</option>
                  <option value="social">{t('meetups.types.social', 'Social')}</option>
                  <option value="other">{t('meetups.types.other', 'Other')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('meetups.maxParticipants', 'Max Participants')}
                </label>
                <input
                  type="number"
                  min="2"
                  max="50"
                  value={newMeetup.max_participants}
                  onChange={(e) => setNewMeetup(prev => ({ ...prev, max_participants: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('meetups.create', 'Create Meetup')}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                {t('common.cancel', 'Cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Meetups List */}
      <div className="space-y-4">
        {filteredMeetups.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t('meetups.noMeetups', 'No meetups found')}
          </div>
        ) : (
          filteredMeetups.map((meetup) => (
            <div key={meetup.id} className="bg-white p-6 rounded-lg shadow-md border">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {meetup.title}
                  </h3>
                  
                  {meetup.description && (
                    <p className="text-gray-600 mb-3">{meetup.description}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {meetup.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(meetup.meeting_time)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {meetup.current_participants}/{meetup.max_participants}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {t(`meetups.types.${meetup.meetup_type}`, meetup.meetup_type)}
                    </div>
                  </div>

                  {meetup.organizer && (
                    <div className="text-sm text-gray-500 mb-3">
                      {t('meetups.organizedBy', 'Organized by')}: {meetup.organizer.name}
                    </div>
                  )}

                  {meetup.tags && meetup.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {meetup.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {isUserParticipant(meetup) ? (
                    <button
                      onClick={() => handleLeaveMeetup(meetup.id)}
                      className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      <UserMinus className="w-4 h-4" />
                      {t('meetups.leave', 'Leave')}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinMeetup(meetup.id)}
                      disabled={meetup.current_participants >= meetup.max_participants}
                      className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <UserPlus className="w-4 h-4" />
                      {t('meetups.join', 'Join')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
