'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { 
  Users, 
  Calendar, 
  MapPin, 
  Coffee, 
  MessageCircle,
  TrendingUp,
  Clock,
  UserPlus
} from 'lucide-react'

interface CommunityActivityProps {
  cityData: {
    id: string
    name: string
    country: string
    avg_overall_rating?: number
  }
}

interface NomadData {
  id: string
  name: string
  avatar: string
  profession: string
  stayDuration: string
  joinedAt: string
}

interface MeetupData {
  id: string
  title: string
  date: string
  location: string
  attendees: number
  type: 'coffee' | 'coworking' | 'social' | 'networking'
}

export default function CommunityActivity({ cityData }: CommunityActivityProps) {
  const { t } = useTranslation()
  const [nomads, setNomads] = useState<NomadData[]>([])
  const [meetups, setMeetups] = useState<MeetupData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCommunityData = async () => {
      setIsLoading(true)
      
      // 模拟API调用获取社区数据
      const mockNomads: NomadData[] = [
        {
          id: '1',
          name: 'Sarah Chen',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
          profession: 'UI/UX Designer',
          stayDuration: '3 months',
          joinedAt: '2 days ago'
        },
        {
          id: '2',
          name: 'Alex Rodriguez',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
          profession: 'Software Developer',
          stayDuration: '1 month',
          joinedAt: '1 week ago'
        },
        {
          id: '3',
          name: 'Emma Thompson',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
          profession: 'Digital Marketer',
          stayDuration: '2 months',
          joinedAt: '3 days ago'
        }
      ]

      const mockMeetups: MeetupData[] = [
        {
          id: '1',
          title: 'Morning Coffee & Networking',
          date: 'Tomorrow, 9:00 AM',
          location: 'Blue Bottle Coffee',
          attendees: 8,
          type: 'coffee'
        },
        {
          id: '2',
          title: 'Co-working Session',
          date: 'Friday, 2:00 PM',
          location: 'WeWork Space',
          attendees: 12,
          type: 'coworking'
        },
        {
          id: '3',
          title: 'Weekend Social Meetup',
          date: 'Saturday, 7:00 PM',
          location: 'Rooftop Bar',
          attendees: 15,
          type: 'social'
        }
      ]

      setNomads(mockNomads)
      setMeetups(mockMeetups)
      setIsLoading(false)
    }

    fetchCommunityData()
  }, [cityData.id])

  const getMeetupIcon = (type: string) => {
    switch (type) {
      case 'coffee':
        return <Coffee className="h-4 w-4" />
      case 'coworking':
        return <MapPin className="h-4 w-4" />
      case 'social':
        return <MessageCircle className="h-4 w-4" />
      case 'networking':
        return <Users className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getMeetupColor = (type: string) => {
    switch (type) {
      case 'coffee':
        return 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
      case 'coworking':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
      case 'social':
        return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
      case 'networking':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {t('cityDetail.community.title')}
        </h3>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('cityDetail.community.title')}
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <TrendingUp className="h-4 w-4" />
          <span>+{Math.floor(Math.random() * 5) + 1} {t('cityDetail.community.thisWeek')}</span>
        </div>
      </div>

      {/* 当前Nomad数量 */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500 text-white rounded-lg">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {nomads.length} {t('cityDetail.community.nomadsCurrently')}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('cityDetail.community.inCity', { city: cityData.name })}
            </p>
          </div>
        </div>
      </div>

      {/* 当前Nomad列表 */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {t('cityDetail.community.recentNomads')}
        </h4>
        <div className="space-y-3">
          {nomads.map((nomad) => (
            <div key={nomad.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <img
                src={nomad.avatar}
                alt={nomad.name}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{nomad.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{nomad.profession}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{nomad.stayDuration}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{nomad.joinedAt}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
          {t('cityDetail.community.viewAllNomads')}
        </button>
      </div>

      {/* 本周Meetup */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {t('cityDetail.community.thisWeekMeetups')}
        </h4>
        <div className="space-y-3">
          {meetups.map((meetup) => (
            <div key={meetup.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`p-1 rounded ${getMeetupColor(meetup.type)}`}>
                    {getMeetupIcon(meetup.type)}
                  </div>
                  <h5 className="font-medium text-gray-900 dark:text-white">{meetup.title}</h5>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {meetup.attendees} {t('cityDetail.community.attendees')}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{meetup.date}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{meetup.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
          {t('cityDetail.community.viewAllMeetups')}
        </button>
      </div>

      {/* 加入社区按钮 */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          <UserPlus className="h-4 w-4" />
          <span>{t('cityDetail.community.joinCommunity')}</span>
        </button>
      </div>
    </div>
  )
}
