'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  MapPin, 
  Star, 
  Globe, 
  TrendingUp,
  Clock,
  Heart,
  MessageSquare
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

interface StatItem {
  id: string
  label: string
  value: number
  icon: React.ReactNode
  color: string
  trend?: number
  unit?: string
}

export default function LiveStats() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<StatItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 模拟实时数据
  const generateLiveStats = () => {
    const baseStats = [
      {
        id: 'users',
        label: t('liveStats.activeUsers'),
        value: Math.floor(Math.random() * 1000) + 500,
        icon: <Users className="h-5 w-5" />,
        color: 'text-blue-600',
        trend: Math.random() > 0.5 ? 1 : -1,
        unit: ''
      },
      {
        id: 'cities',
        label: t('liveStats.citiesExplored'),
        value: Math.floor(Math.random() * 50) + 150,
        icon: <MapPin className="h-5 w-5" />,
        color: 'text-green-600',
        trend: Math.random() > 0.3 ? 1 : -1,
        unit: ''
      },
      {
        id: 'reviews',
        label: t('liveStats.reviewsPosted'),
        value: Math.floor(Math.random() * 500) + 1000,
        icon: <Star className="h-5 w-5" />,
        color: 'text-yellow-600',
        trend: Math.random() > 0.4 ? 1 : -1,
        unit: ''
      },
      {
        id: 'countries',
        label: t('liveStats.countriesVisited'),
        value: Math.floor(Math.random() * 20) + 80,
        icon: <Globe className="h-5 w-5" />,
        color: 'text-purple-600',
        trend: Math.random() > 0.6 ? 1 : -1,
        unit: ''
      },
      {
        id: 'meetups',
        label: t('liveStats.meetupsOrganized'),
        value: Math.floor(Math.random() * 100) + 200,
        icon: <MessageSquare className="h-5 w-5" />,
        color: 'text-pink-600',
        trend: Math.random() > 0.5 ? 1 : -1,
        unit: ''
      },
      {
        id: 'favorites',
        label: t('liveStats.placesFavorited'),
        value: Math.floor(Math.random() * 1000) + 2000,
        icon: <Heart className="h-5 w-5" />,
        color: 'text-red-600',
        trend: Math.random() > 0.4 ? 1 : -1,
        unit: ''
      }
    ]

    setStats(baseStats)
    setIsLoading(false)
  }

  // 初始化数据
  useEffect(() => {
    generateLiveStats()
  }, [])

  // 每30秒更新一次数据
  useEffect(() => {
    const interval = setInterval(() => {
      generateLiveStats()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // 格式化数字
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  // 获取趋势图标和颜色
  const getTrendDisplay = (trend?: number) => {
    if (!trend) return null
    
    return (
      <div className={`flex items-center space-x-1 text-xs ${
        trend > 0 ? 'text-green-600' : 'text-red-600'
      }`}>
        <TrendingUp className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
        <span>{Math.abs(trend)}%</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <section className="py-12 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('liveStats.title')}
            </h2>
            <p className="text-gray-600">
              {t('liveStats.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('liveStats.title')}
          </h2>
          <p className="text-gray-600 mb-4">
            {t('liveStats.subtitle')}
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{t('liveStats.lastUpdated')}</span>
            <span className="text-green-600 font-medium">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-gray-50 ${stat.color}`}>
                  {stat.icon}
                </div>
                {getTrendDisplay(stat.trend)}
              </div>
              
              <div className="mb-2">
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(stat.value)}
                  {stat.unit}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.label}
                </div>
              </div>

              {/* 实时指示器 */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">{t('liveStats.live')}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 实时活动流 */}
        <div className="mt-12 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('liveStats.recentActivity')}
          </h3>
          <div className="space-y-3">
            {[
              { user: 'Sarah', action: t('liveStats.activities.reviewed'), city: 'Bali' },
              { user: 'Marcus', action: t('liveStats.activities.favorited'), city: 'Porto' },
              { user: 'Emma', action: t('liveStats.activities.connected'), city: 'Chiang Mai' },
              { user: 'Alex', action: t('liveStats.activities.explored'), city: 'Lisbon' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-gray-900">{activity.user}</span>
                <span className="text-gray-600">{activity.action}</span>
                <span className="text-blue-600 font-medium">{activity.city}</span>
                <span className="text-gray-400 text-xs">
                  {Math.floor(Math.random() * 10) + 1}m ago
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 统计说明 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            {t('liveStats.disclaimer')}
          </p>
        </div>
      </div>
    </section>
  )
}
