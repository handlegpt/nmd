'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { meetupSystem, Meetup, MeetupReview, MeetupParticipant } from '@/lib/meetupSystem'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Star, 
  Plus,
  Edit,
  Trash2,
  Heart,
  MessageCircle,
  Share2,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { format, addDays, isAfter, isBefore } from 'date-fns'

// 使用从meetupSystem导入的类型

interface CreateMeetupForm {
  title: string
  description: string
  city: string
  date: string
  time: string
  duration: number
  maxParticipants: number
  category: Meetup['category']
  tags: string[]
  price?: number
  currency?: string
  location: string
  requirements?: string[]
}

export default function MeetupSystem() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'upcoming' | 'my-meetups' | 'create' | 'calendar'>('upcoming')
  const [meetups, setMeetups] = useState<Meetup[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm] = useState<CreateMeetupForm>({
    title: '',
    description: '',
    city: '',
    date: '',
    time: '',
    duration: 2,
    maxParticipants: 10,
    category: 'coffee',
    tags: [],
    location: '',
    requirements: []
  })

  // 初始化真实数据
  useEffect(() => {
    // 初始化聚会系统数据
    meetupSystem.initializeRealData()
    
    // 加载真实数据
    const realMeetups = meetupSystem.getMeetups()
    setMeetups(realMeetups)
  }, [])

  // Handle form changes
  const handleFormChange = (field: keyof CreateMeetupForm, value: any) => {
    setCreateForm(prev => ({ ...prev, [field]: value }))
  }

  // 加入聚会
  const handleJoinMeetup = (meetupId: string) => {
    const currentUser = JSON.parse(localStorage.getItem('user_profile_details') || '{}')
    if (!currentUser.id) return

    const success = meetupSystem.joinMeetup(
      meetupId, 
      currentUser.id, 
      currentUser.name, 
      currentUser.avatar_url || currentUser.name.substring(0, 2).toUpperCase()
    )

    if (success) {
      // 更新本地状态
      const updatedMeetups = meetupSystem.getMeetups()
      setMeetups(updatedMeetups)
    }
  }

  // 离开聚会
  const handleLeaveMeetup = (meetupId: string) => {
    const currentUser = JSON.parse(localStorage.getItem('user_profile_details') || '{}')
    if (!currentUser.id) return

    const success = meetupSystem.leaveMeetup(
      meetupId, 
      currentUser.id, 
      currentUser.name, 
      currentUser.avatar_url || currentUser.name.substring(0, 2).toUpperCase()
    )

    if (success) {
      // 更新本地状态
      const updatedMeetups = meetupSystem.getMeetups()
      setMeetups(updatedMeetups)
    }
  }

  // 创建聚会
  const handleCreateMeetup = () => {
    const currentUser = JSON.parse(localStorage.getItem('user_profile_details') || '{}')
    if (!currentUser.id) return

    const newMeetup = meetupSystem.createMeetup({
      title: createForm.title,
      description: createForm.description,
      city: createForm.city,
      country: 'Unknown',
      coordinates: { lat: 0, lng: 0 },
      date: new Date(createForm.date),
      time: createForm.time,
      duration: createForm.duration,
      maxParticipants: createForm.maxParticipants,
      category: createForm.category,
      tags: createForm.tags,
      organizer: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar_url || currentUser.name.substring(0, 2).toUpperCase(),
        rating: 4.5
      },
      status: 'upcoming',
      price: createForm.price,
      currency: createForm.currency,
      location: createForm.location,
      requirements: createForm.requirements
    })

    // 更新本地状态
    const updatedMeetups = meetupSystem.getMeetups()
    setMeetups(updatedMeetups)

    // 重置表单
    setCreateForm({
      title: '',
      description: '',
      city: '',
      date: '',
      time: '',
      duration: 2,
      maxParticipants: 10,
      category: 'coffee',
      tags: [],
      location: '',
      requirements: []
    })
    setShowCreateForm(false)
  }



  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'coffee': return '☕'
      case 'coworking': return '💻'
      case 'social': return '🎉'
      case 'adventure': return '🏔️'
      case 'learning': return '📚'
      default: return '📅'
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      case 'ongoing': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Filter meetups by tab
  const getFilteredMeetups = () => {
    switch (activeTab) {
      case 'upcoming':
        return meetups.filter(meetup => 
          meetup.status === 'upcoming' && isAfter(meetup.date, new Date())
        )
      case 'my-meetups':
        return meetups.filter(meetup => 
          meetup.organizer.id === 'currentUser' || 
          meetup.currentParticipants > 0
        )
      default:
        return meetups
    }
  }

  const filteredMeetups = getFilteredMeetups()

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {[
          { id: 'upcoming', label: 'Upcoming Meetups', icon: Calendar },
          { id: 'my-meetups', label: 'My Meetups', icon: Users },
          { id: 'create', label: 'Create Meetup', icon: Plus },
          { id: 'calendar', label: 'Calendar', icon: Calendar }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upcoming Meetups
            </h3>
            <button
              onClick={() => setActiveTab('create')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Meetup</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredMeetups.map((meetup) => (
                          <div key={meetup.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {/* Meetup Header with Image */}
                            <div className="relative h-32 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
                              <div className="absolute inset-0 bg-black/20" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center text-white">
                                  <div className="text-4xl mb-2">{getCategoryIcon(meetup.category)}</div>
                                  <h4 className="font-bold text-lg">{meetup.title}</h4>
                                  <p className="text-sm opacity-90">{meetup.city}, {meetup.country}</p>
                                </div>
                              </div>
                              
                              {/* Category Badge */}
                              <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-800/90 rounded-lg px-2 py-1">
                                <span className="text-xs font-medium text-gray-900 dark:text-white">
                                  {meetup.category === 'coffee' ? `☕ ${t('meetup.categories.coffee')}` : 
                                   meetup.category === 'coworking' ? `💻 ${t('meetup.categories.coworking')}` :
                                   meetup.category === 'social' ? `🎉 ${t('meetup.categories.social')}` :
                                   meetup.category === 'adventure' ? `🏔️ ${t('meetup.categories.adventure')}` : `📚 ${t('meetup.categories.learning')}`}
                                </span>
                              </div>
                              
                              {/* Status Badge */}
                              <div className="absolute top-3 right-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meetup.status)}`}>
                                  {meetup.status === 'upcoming' ? t('meetup.status.upcoming') : 
                                   meetup.status === 'ongoing' ? t('meetup.status.ongoing') :
                                   meetup.status === 'completed' ? t('meetup.status.completed') : t('meetup.status.cancelled')}
                                </span>
                              </div>
                            </div>
                            
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-lg font-bold">
                                    {meetup.organizer.avatar}
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white">{meetup.title}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {t('meetup.organizer')}: {meetup.organizer.name} • {meetup.city}
                                    </p>
                                    <div className="flex items-center space-x-1 mt-1">
                                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                      <span className="text-xs text-gray-600 dark:text-gray-400">
                                        {meetup.organizer.rating} {t('meetup.rating')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {meetup.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{format(meetup.date, 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{meetup.time} ({meetup.duration}h)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{meetup.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{meetup.currentParticipants}/{meetup.maxParticipants} participants</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {meetup.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                        {meetup.organizer.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{meetup.organizer.name}</p>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">{meetup.organizer.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {meetup.currentParticipants < meetup.maxParticipants ? (
                        <button
                          onClick={() => handleJoinMeetup(meetup.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Join
                        </button>
                      ) : (
                        <button
                          onClick={() => handleLeaveMeetup(meetup.id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Leave
                        </button>
                      )}
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'my-meetups' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Meetups</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMeetups.map((meetup) => (
              <div key={meetup.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getCategoryIcon(meetup.category)}</span>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{meetup.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{meetup.city}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{format(meetup.date, 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{meetup.currentParticipants}/{meetup.maxParticipants} participants</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                      Manage
                    </button>
                    <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Create New Meetup</h3>
          
          <form onSubmit={(e) => { e.preventDefault(); handleCreateMeetup(); }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meetup Title
                </label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="e.g., Lisbon Coffee Chat"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={createForm.category}
                  onChange={(e) => handleFormChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="coffee">☕ Coffee</option>
                  <option value="coworking">💻 Coworking</option>
                  <option value="social">🎉 Social</option>
                  <option value="adventure">🏔️ Adventure</option>
                  <option value="learning">📚 Learning</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={createForm.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Describe your meetup..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={createForm.date}
                  onChange={(e) => handleFormChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={createForm.time}
                  onChange={(e) => handleFormChange('time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (hours)
                </label>
                <input
                  type="number"
                  value={createForm.duration}
                  onChange={(e) => handleFormChange('duration', parseInt(e.target.value))}
                  min="1"
                  max="24"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={createForm.city}
                  onChange={(e) => handleFormChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="e.g., Lisbon"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Participants
                </label>
                <input
                  type="number"
                  value={createForm.maxParticipants}
                  onChange={(e) => handleFormChange('maxParticipants', parseInt(e.target.value))}
                  min="2"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location Details
              </label>
              <input
                type="text"
                value={createForm.location}
                onChange={(e) => handleFormChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g., Café da Garagem, Rua da Garagem 123"
                required
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Meetup
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upcoming')}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Meetup Calendar</h3>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Calendar View Coming Soon
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Interactive calendar view for all your meetups and events
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
