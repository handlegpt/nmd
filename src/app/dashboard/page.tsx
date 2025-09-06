'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { useUser } from '@/contexts/GlobalStateContext'
import UserPreferencesPanel from '@/components/UserPreferencesPanel'
import MobileNavigation from '@/components/MobileNavigation'
import ThemeToggle from '@/components/ThemeToggle'
import { 
  User, 
  MapPin, 
  Calendar, 
  Settings,
  TrendingUp,
  Globe,
  Clock,
  Bell,
  Briefcase,
  Edit3,
  Heart,
  FileText,
  Users,
  Award,
  Star,
  Target,
  Map,
  Coffee,
  Plane,
  Compass,
  Trophy,
  Zap,
  Flag,
  Route
} from 'lucide-react'

export default function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useUser()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 给认证检查一些时间
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    // 条件性初始化示例城市轨迹数据：只在未登录时显示
    const initializeSampleData = () => {
      try {
        // 如果用户已登录，不显示示例数据
        if (user.isAuthenticated) {
          return
        }

        const existingTrajectory = localStorage.getItem('city_trajectory')
        if (!existingTrajectory) {
          const sampleTrajectory = [
            {
              id: '1',
              cityName: 'Bangkok',
              country: 'Thailand',
              startDate: '2024-01-15',
              endDate: '2024-03-15',
              daysStayed: 60,
              type: 'residence',
              notes: 'Digital nomad hub with great food and affordable living'
            },
            {
              id: '2',
              cityName: 'Chiang Mai',
              country: 'Thailand',
              startDate: '2024-03-16',
              endDate: '2024-05-16',
              daysStayed: 61,
              type: 'residence',
              notes: 'Cultural city with mountains and temples'
            },
            {
              id: '3',
              cityName: 'Bali',
              country: 'Indonesia',
              startDate: '2024-05-17',
              endDate: null, // 当前城市
              daysStayed: 0, // 将在计算中动态更新
              type: 'residence',
              notes: 'Island paradise with beaches and spiritual vibes'
            }
          ]
          localStorage.setItem('city_trajectory', JSON.stringify(sampleTrajectory))
        }
      } catch (error) {
        console.error('Error initializing sample data:', error)
      }
    }

    // 只在未登录时初始化示例数据
    if (!user.isAuthenticated) {
      initializeSampleData()
    }

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // 只有在加载完成后且确实未认证时才跳转
    if (!isLoading && !user.isAuthenticated) {
      router.push('/auth/login')
    }
  }, [user.isAuthenticated, router, isLoading])

  // 显示加载状态
  if (isLoading || !user.isAuthenticated || !user.profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('dashboard.loadingUserData')}</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: t('dashboard.overview'), icon: TrendingUp },
    { id: 'preferences', label: t('dashboard.preferences'), icon: Settings },
    { id: 'activity', label: t('dashboard.activity.title'), icon: Clock },
    { id: 'notifications', label: t('dashboard.notifications.title'), icon: Bell }
  ]

  // 获取用户职业信息，优先从 profile 数据获取
  const getUserProfession = () => {
    try {
      const storedProfile = localStorage.getItem('user_profile_details')
      if (storedProfile) {
        const profileData = JSON.parse(storedProfile)
        return profileData.profession || t('dashboard.notSet')
      }
      return t('dashboard.notSet')
    } catch (error) {
      return t('dashboard.notSet')
    }
  }

  // 获取用户名称，优先从 localStorage 获取最新数据
  const getUserName = () => {
    try {
      const storedProfile = localStorage.getItem('user_profile_details')
      if (storedProfile) {
        const profileData = JSON.parse(storedProfile)
        return profileData.name || user.profile?.name || t('dashboard.notSet')
      }
      return user.profile?.name || t('dashboard.notSet')
    } catch (error) {
      return user.profile?.name || t('dashboard.notSet')
    }
  }

  // 获取用户当前城市，优先从 localStorage 获取最新数据
  const getUserCurrentCity = () => {
    try {
      const storedProfile = localStorage.getItem('user_profile_details')
      if (storedProfile) {
        const profileData = JSON.parse(storedProfile)
        return profileData.current_city || user.profile?.current_city || t('dashboard.notSet')
      }
      return user.profile?.current_city || t('dashboard.notSet')
    } catch (error) {
      return user.profile?.current_city || t('dashboard.notSet')
    }
  }

  // 计算资料完整度
  const getProfileCompletion = () => {
    try {
      const storedProfile = localStorage.getItem('user_profile_details')
      if (!storedProfile) return 0
      
      const profileData = JSON.parse(storedProfile)
      let completedFields = 0
      const totalFields = 8
      
      if (profileData.name && profileData.name.trim()) completedFields++
      if (profileData.current_city && profileData.current_city.trim()) completedFields++
      if (profileData.bio && profileData.bio.trim()) completedFields++
      if (profileData.profession && profileData.profession.trim()) completedFields++
      if (profileData.company && profileData.company.trim()) completedFields++
      if (profileData.skills && profileData.skills.length > 0) completedFields++
      if (profileData.interests && profileData.interests.length > 0) completedFields++
      if (profileData.social_links && profileData.social_links.length > 0) completedFields++
      
      return Math.round((completedFields / totalFields) * 100)
    } catch (error) {
      return 0
    }
  }

  // 获取城市轨迹数据
  const getCitiesVisited = () => {
    try {
      // 从城市轨迹数据中获取用户居住过的城市
      const cityTrajectory = localStorage.getItem('city_trajectory')
      if (cityTrajectory) {
        const trajectory = JSON.parse(cityTrajectory)
        return trajectory.length || 0
      }
      
      // 如果没有轨迹数据，尝试从评论中获取（作为备用）
      const visitedCities = localStorage.getItem('city_reviews')
      if (visitedCities) {
        const reviews = JSON.parse(visitedCities)
        let visitedCount = 0
        Object.values(reviews).forEach((cityReviews: any) => {
          if (cityReviews.reviews && Array.isArray(cityReviews.reviews) && cityReviews.reviews.length > 0) {
            visitedCount++
          }
        })
        return visitedCount
      }
      
      return 0
    } catch (error) {
      return 0
    }
  }

  // 获取城市轨迹详情
  const getCityTrajectory = () => {
    try {
      const cityTrajectory = localStorage.getItem('city_trajectory')
      if (cityTrajectory) {
        return JSON.parse(cityTrajectory)
      }
      return []
    } catch (error) {
      return []
    }
  }

  // 获取总居住天数
  const getTotalDaysTraveling = () => {
    try {
      const trajectory = getCityTrajectory()
      let totalDays = 0
      trajectory.forEach((city: any) => {
        if (city.daysStayed) {
          totalDays += city.daysStayed
        }
      })
      return totalDays
    } catch (error) {
      return 0
    }
  }

  // 获取当前连续居住天数
  const getCurrentStreak = () => {
    try {
      const trajectory = getCityTrajectory()
      if (trajectory.length === 0) return 0
      
      // 按时间排序，获取最新的城市
      const sortedTrajectory = trajectory.sort((a: any, b: any) => 
        new Date(b.endDate || b.startDate).getTime() - new Date(a.endDate || a.startDate).getTime()
      )
      
      const latestCity = sortedTrajectory[0]
      if (!latestCity.endDate) {
        // 如果还在当前城市，计算从开始到现在的天数
        const startDate = new Date(latestCity.startDate)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - startDate.getTime())
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      }
      
      return 0
    } catch (error) {
      return 0
    }
  }

  // 获取本月访问城市数量
  const getCitiesThisMonth = () => {
    try {
      const visitedCities = localStorage.getItem('city_reviews')
      if (visitedCities) {
        const reviews = JSON.parse(visitedCities)
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        
        let count = 0
        Object.values(reviews).forEach((cityReviews: any) => {
          if (cityReviews.reviews && Array.isArray(cityReviews.reviews)) {
            cityReviews.reviews.forEach((review: any) => {
              const reviewDate = new Date(review.timestamp)
              if (reviewDate.getMonth() === currentMonth && reviewDate.getFullYear() === currentYear) {
                count++
              }
            })
          }
        })
        return count
      }
      return 0
    } catch (error) {
      return 0
    }
  }

  // 获取已连接的游民数量
  const getNomadsConnected = () => {
    try {
      const connections = localStorage.getItem('nomad_connections')
      if (connections) {
        const data = JSON.parse(connections)
        return data.length || 0
      }
      return 0
    } catch (error) {
      return 0
    }
  }

  // 获取本月连接数量
  const getConnectionsThisMonth = () => {
    try {
      const connections = localStorage.getItem('nomad_connections')
      if (connections) {
        const data = JSON.parse(connections)
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        
        let count = 0
        data.forEach((connection: any) => {
          const connectionDate = new Date(connection.timestamp)
          if (connectionDate.getMonth() === currentMonth && connectionDate.getFullYear() === currentYear) {
            count++
          }
        })
        return count
      }
      return 0
    } catch (error) {
      return 0
    }
  }

  // 获取收藏城市数量
  const getFavoriteCities = () => {
    try {
      const favorites = localStorage.getItem('city_favorites')
      if (favorites) {
        const data = JSON.parse(favorites)
        return data.length || 0
      }
      return 0
    } catch (error) {
      return 0
    }
  }

  // 获取最近收藏的城市
  const getRecentFavoriteCity = () => {
    try {
      const favorites = localStorage.getItem('city_favorites')
      if (favorites) {
        const data = JSON.parse(favorites)
        if (data.length > 0) {
          return data[data.length - 1].name || 'Unknown'
        }
      }
      return 'None'
    } catch (error) {
      return 'None'
    }
  }

  // 获取已解锁徽章数量
  const getUnlockedBadgesCount = () => {
    let count = 0
    if (getCitiesVisited() >= 3) count++ // City Explorer
    if (getTotalDaysTraveling() >= 30) count++ // Monthly Nomad
    if (getNomadsConnected() >= 5) count++ // Networker
    if (getProfileCompletion() >= 90) count++ // Profile Master
    if (getConnectionsThisMonth() >= 3) count++ // Coffee Hero
    if (getFavoriteCities() >= 5) count++ // Explorer
    return count
  }

  // 获取总徽章数量
  const getTotalBadgesCount = () => 6

  // 获取最近活动数据
  const getRecentActivity = () => {
    try {
      const activities = []
      
      // 从城市轨迹获取最近活动
      const cityTrajectory = localStorage.getItem('city_trajectory')
      if (cityTrajectory) {
        const trajectory = JSON.parse(cityTrajectory)
        if (trajectory.length > 0) {
          const latestCity = trajectory[trajectory.length - 1]
          if (latestCity.startDate) {
            const startDate = new Date(latestCity.startDate)
            const daysAgo = Math.ceil((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24))
            activities.push({
              type: 'cityAdded',
              city: latestCity.cityName,
              timestamp: daysAgo,
              icon: '🌍',
              color: 'blue'
            })
          }
        }
      }
      
      // 从城市评论获取最近活动
      const cityReviews = localStorage.getItem('city_reviews')
      if (cityReviews) {
        const reviews = JSON.parse(cityReviews)
        Object.entries(reviews).forEach(([cityName, cityData]: [string, any]) => {
          if (cityData.reviews && Array.isArray(cityData.reviews)) {
            cityData.reviews.forEach((review: any) => {
              const reviewDate = new Date(review.timestamp)
              const daysAgo = Math.ceil((Date.now() - reviewDate.getTime()) / (1000 * 60 * 60 * 24))
              if (daysAgo <= 7) { // 只显示最近7天的活动
                activities.push({
                  type: 'cityReviewed',
                  city: cityName,
                  timestamp: daysAgo,
                  icon: '⭐',
                  color: 'green'
                })
              }
            })
          }
        })
      }
      
      // 从地点推荐获取最近活动
      const localPlaces = localStorage.getItem('nomad_local_places')
      if (localPlaces) {
        const places = JSON.parse(localPlaces)
        if (places.length > 0) {
          const latestPlace = places[places.length - 1]
          if (latestPlace.timestamp) {
            const placeDate = new Date(latestPlace.timestamp)
            const daysAgo = Math.ceil((Date.now() - placeDate.getTime()) / (1000 * 60 * 60 * 24))
            if (daysAgo <= 7) {
              activities.push({
                type: 'placeAdded',
                place: latestPlace.name,
                city: latestPlace.city,
                timestamp: daysAgo,
                icon: '📍',
                color: 'purple'
              })
            }
          }
        }
      }
      
      // 按时间排序，返回最近5个活动
      return activities
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(0, 5)
    } catch (error) {
      return []
    }
  }

  // 获取个性化推荐
  const getPersonalizedRecommendations = () => {
    try {
      const recommendations = []
      
      // 基于当前城市推荐
      const currentCity = user.profile?.current_city
      if (currentCity) {
        recommendations.push({
          type: 'city',
          title: t('dashboard.recommendations.exploreNearby', { city: currentCity }),
          description: t('dashboard.recommendations.exploreNearbyDesc'),
          action: 'explore',
          icon: '🗺️',
          color: 'blue'
        })
      }
      
      // 基于旅行天数推荐
      const totalDays = getTotalDaysTraveling()
      if (totalDays > 0) {
        if (totalDays < 30) {
          recommendations.push({
            type: 'tip',
            title: t('dashboard.recommendations.newbieTip'),
            description: t('dashboard.recommendations.newbieTipDesc'),
            action: 'visa',
            icon: '📋',
            color: 'green'
          })
        } else if (totalDays > 180) {
          recommendations.push({
            type: 'tip',
            title: t('dashboard.recommendations.experiencedTip'),
            description: t('dashboard.recommendations.experiencedTipDesc'),
            action: 'tax',
            icon: '💰',
            color: 'orange'
          })
        }
      }
      
      // 基于资料完整度推荐
      const completion = getProfileCompletion()
      if (completion < 80) {
        recommendations.push({
          type: 'profile',
          title: t('dashboard.recommendations.completeProfile'),
          description: t('dashboard.recommendations.completeProfileDesc', { percentage: completion.toString() }),
          action: 'profile',
          icon: '👤',
          color: 'purple'
        })
      }
      
      return recommendations
    } catch (error) {
      return []
    }
  }

  // 获取成就数据
  const getAchievements = () => {
    try {
      const achievements = []
      
      // 城市探索成就
      const citiesVisited = getCitiesVisited()
      if (citiesVisited >= 1) achievements.push({ name: t('dashboard.achievements.cityExplorer'), icon: '🌍', unlocked: true })
      if (citiesVisited >= 5) achievements.push({ name: t('dashboard.achievements.cityExpert'), icon: '🏆', unlocked: true })
      if (citiesVisited >= 10) achievements.push({ name: t('dashboard.achievements.worldTraveler'), icon: '🌎', unlocked: true })
      
      // 旅行天数成就
      const totalDays = getTotalDaysTraveling()
      if (totalDays >= 30) achievements.push({ name: t('dashboard.achievements.monthlyNomad'), icon: '📅', unlocked: true })
      if (totalDays >= 90) achievements.push({ name: t('dashboard.achievements.quarterlyNomad'), icon: '📊', unlocked: true })
      if (totalDays >= 365) achievements.push({ name: t('dashboard.achievements.yearlyNomad'), icon: '🎉', unlocked: true })
      
      // 连续天数成就
      const currentStreak = getCurrentStreak()
      if (currentStreak >= 7) achievements.push({ name: t('dashboard.achievements.weeklyNomad'), icon: '📆', unlocked: true })
      if (currentStreak >= 30) achievements.push({ name: t('dashboard.achievements.monthlyStreak'), icon: '🔥', unlocked: true })
      
      // 社交成就
      const nomadsConnected = getNomadsConnected()
      if (nomadsConnected >= 1) achievements.push({ name: t('dashboard.achievements.socialNewbie'), icon: '🤝', unlocked: true })
      if (nomadsConnected >= 5) achievements.push({ name: t('dashboard.achievements.socialExpert'), icon: '👥', unlocked: true })
      
      return achievements
    } catch (error) {
      return []
    }
  }

  // 获取旅行统计图表数据
  const getTravelChartData = () => {
    try {
      const cityTrajectory = localStorage.getItem('city_trajectory')
      if (!cityTrajectory) return []
      
      const trajectory = JSON.parse(cityTrajectory)
      const monthlyData: Record<string, number> = {}
      
      trajectory.forEach((city: any) => {
        if (city.startDate) {
          const date = new Date(city.startDate)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (city.daysStayed || 0)
        }
      })
      
      return Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6) // 最近6个月
        .map(([month, days]) => ({
          month: month,
          days: days
        }))
    } catch (error) {
      return []
    }
  }

    const renderOverview = () => (
    <div className="space-y-6">
      {/* Enhanced User Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                {user.profile?.avatar_url ? (
                  <img 
                    src={user.profile.avatar_url} 
                    alt={user.profile.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{getUserName()}</h2>
              <p className="text-gray-600 dark:text-gray-400">{user.profile?.email}</p>
              <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{getUserCurrentCity()}</span>
              </div>
              <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                <Briefcase className="w-4 h-4 mr-1" />
                <span>{t('dashboard.profession')}: {getUserProfession()}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
            >
              <Edit3 className="w-4 h-4" />
              {t('dashboard.editProfile')}
            </button>
          </div>
        </div>
      </div>

      {/* 旅程可视化模块 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Map className="w-6 h-6 mr-3 text-blue-600" />
              {t('dashboard.myJourney')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
                              🌍 {t('dashboard.citiesAndDays', { cities: getCitiesVisited().toString(), days: getTotalDaysTraveling().toString() })}
            </p>
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors text-sm">
                              {t('dashboard.byYear')}
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                              {t('dashboard.byMonth')}
            </button>
          </div>
        </div>
        
        {/* 旅程地图展示 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Globe className="w-16 h-16 text-blue-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                {getCitiesVisited() > 0 ? t('dashboard.clickToViewDetailedMap') : t('dashboard.startYourJourney')}
              </p>
              {getCitiesVisited() === 0 && (
                <button 
                  onClick={() => router.push('/cities?tab=trajectory')}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('dashboard.addFirstCity')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 核心数据仪表盘 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* 旅行天数 */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-8 h-8 text-blue-200" />
            <span className="text-2xl font-bold">{getTotalDaysTraveling()}</span>
          </div>
                            <p className="text-blue-100 text-sm font-medium">{t('dashboard.travelDays')}</p>
          <p className="text-blue-200 text-xs mt-1">
                          {getCitiesVisited() > 0 ? t('dashboard.citiesCount', { count: getCitiesVisited().toString() }) : t('dashboard.startRecording')}
          </p>
        </div>

        {/* 访问城市 */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <Globe className="w-8 h-8 text-green-200" />
            <span className="text-2xl font-bold">{getCitiesVisited()}</span>
          </div>
                            <p className="text-green-100 text-sm font-medium">{t('dashboard.visitedCities')}</p>
          <p className="text-green-200 text-xs mt-1">
                          {getCitiesVisited() > 0 ? t('dashboard.continueExploring') : t('dashboard.addCity')}
          </p>
        </div>

        {/* 当前城市停留 */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <MapPin className="w-8 h-8 text-orange-200" />
            <span className="text-2xl font-bold">{getCurrentStreak()}</span>
          </div>
                            <p className="text-orange-100 text-sm font-medium">{t('dashboard.currentCity')}</p>
          <p className="text-orange-200 text-xs mt-1">
                          {getCurrentStreak() > 0 ? t('dashboard.daysStaying') : t('dashboard.setCity')}
          </p>
        </div>

        {/* Nomads 连接 */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-8 h-8 text-purple-200" />
            <span className="text-2xl font-bold">{getNomadsConnected()}</span>
          </div>
                            <p className="text-purple-100 text-sm font-medium">{t('dashboard.nomadsConnected')}</p>
          <p className="text-purple-200 text-xs mt-1">
                          {getNomadsConnected() > 0 ? t('dashboard.newThisMonth') : t('dashboard.startConnecting')}
          </p>
        </div>
      </div>

      {/* 成就徽章系统 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Trophy className="w-6 h-6 mr-3 text-yellow-600" />
                            {t('dashboard.achievementBadges')}
          </h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
                          {t('dashboard.unlockedBadges', { unlocked: getUnlockedBadgesCount().toString(), total: getTotalBadgesCount().toString() })}
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {/* City Explorer 徽章 */}
          <div className={`text-center p-4 rounded-xl border-2 transition-all duration-200 ${
            getCitiesVisited() >= 3 
              ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' 
              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
          }`}>
            <div className={`text-3xl mb-2 ${getCitiesVisited() >= 3 ? '' : 'grayscale opacity-50'}`}>
              🌍
            </div>
            <p className={`text-sm font-medium ${getCitiesVisited() >= 3 ? 'text-yellow-800 dark:text-yellow-200' : 'text-gray-500 dark:text-gray-400'}`}>
              City Explorer
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {getCitiesVisited()}/3 {t('dashboard.badgeProgress.cities')}
            </p>
          </div>

          {/* Monthly Nomad 徽章 */}
          <div className={`text-center p-4 rounded-xl border-2 transition-all duration-200 ${
            getTotalDaysTraveling() >= 30 
              ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20' 
              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
          }`}>
            <div className={`text-3xl mb-2 ${getTotalDaysTraveling() >= 30 ? '' : 'grayscale opacity-50'}`}>
              📅
            </div>
            <p className={`text-sm font-medium ${getTotalDaysTraveling() >= 30 ? 'text-purple-800 dark:text-purple-200' : 'text-gray-500 dark:text-gray-400'}`}>
              Monthly Nomad
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {getTotalDaysTraveling()}/30 {t('dashboard.badgeProgress.days')}
            </p>
          </div>

          {/* Networker 徽章 */}
          <div className={`text-center p-4 rounded-xl border-2 transition-all duration-200 ${
            getNomadsConnected() >= 5 
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
          }`}>
            <div className={`text-3xl mb-2 ${getNomadsConnected() >= 5 ? '' : 'grayscale opacity-50'}`}>
              🤝
            </div>
            <p className={`text-sm font-medium ${getNomadsConnected() >= 5 ? 'text-blue-800 dark:text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
              Networker
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {getNomadsConnected()}/5 {t('dashboard.badgeProgress.connections')}
            </p>
          </div>

          {/* Profile Master 徽章 */}
          <div className={`text-center p-4 rounded-xl border-2 transition-all duration-200 ${
            getProfileCompletion() >= 90 
              ? 'border-green-400 bg-green-50 dark:bg-green-900/20' 
              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
          }`}>
            <div className={`text-3xl mb-2 ${getProfileCompletion() >= 90 ? '' : 'grayscale opacity-50'}`}>
              🏆
            </div>
            <p className={`text-sm font-medium ${getProfileCompletion() >= 90 ? 'text-green-800 dark:text-green-200' : 'text-gray-500 dark:text-gray-400'}`}>
              Profile Master
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {getProfileCompletion()}/90%
            </p>
          </div>

          {/* Coffee Hero 徽章 */}
          <div className={`text-center p-4 rounded-xl border-2 transition-all duration-200 ${
            getConnectionsThisMonth() >= 3 
              ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20' 
              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
          }`}>
            <div className={`text-3xl mb-2 ${getConnectionsThisMonth() >= 3 ? '' : 'grayscale opacity-50'}`}>
              ☕
            </div>
            <p className={`text-sm font-medium ${getConnectionsThisMonth() >= 3 ? 'text-orange-800 dark:text-orange-200' : 'text-gray-500 dark:text-gray-400'}`}>
              Coffee Hero
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {getConnectionsThisMonth()}/3 {t('dashboard.badgeProgress.thisMonth')}
            </p>
          </div>

          {/* Explorer 徽章 */}
          <div className={`text-center p-4 rounded-xl border-2 transition-all duration-200 ${
            getFavoriteCities() >= 5 
              ? 'border-pink-400 bg-pink-50 dark:bg-pink-900/20' 
              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
          }`}>
            <div className={`text-3xl mb-2 ${getFavoriteCities() >= 5 ? '' : 'grayscale opacity-50'}`}>
              🗺️
            </div>
            <p className={`text-sm font-medium ${getFavoriteCities() >= 5 ? 'text-pink-800 dark:text-pink-200' : 'text-gray-500 dark:text-gray-400'}`}>
              Explorer
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {getFavoriteCities()}/5 {t('dashboard.badgeProgress.favorites')}
            </p>
          </div>
        </div>
      </div>

      {/* 下一目标激励 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Target className="w-6 h-6 mr-3 text-blue-600" />
                            {t('dashboard.nextGoal')}
          </h3>
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                          🎯 {t('dashboard.keepMovingForward')}!
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Plane className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {t('dashboard.visitMoreCities', { count: Math.max(0, 3 - getCitiesVisited()).toString() })}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  → {t('dashboard.upgradeCityExplorer')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {t('dashboard.recommendations.connectNomads', { count: Math.max(0, 5 - getNomadsConnected()).toString() })}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  → {t('dashboard.unlockNetworkerBadge')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('dashboard.recentActivity')}</h3>
        <div className="space-y-4">
          {getRecentActivity().length > 0 ? (
            getRecentActivity().map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <span className="text-lg">{activity.icon}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {activity.type === 'cityAdded' && t('dashboard.activity.cityAdded', { city: activity.city })}
                  {activity.type === 'cityReviewed' && t('dashboard.activity.cityReviewed', { city: activity.city })}
                  {activity.type === 'placeAdded' && t('dashboard.activity.placeAdded', { place: activity.place, city: activity.city })}
                </span>
                               <span className="text-xs text-gray-400 dark:text-gray-500">
                 {activity.timestamp} {t('dashboard.daysAgo')}
               </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic text-center py-4">
              {t('dashboard.noRecentActivity')}
            </p>
          )}
        </div>
      </div>

      {/* Personalized Recommendations */}
      {getPersonalizedRecommendations().length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('dashboard.personalizedRecommendations')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getPersonalizedRecommendations().map((rec, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-700 dark:hover:bg-gray-700">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{rec.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{rec.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.description}</p>
                    <button
                      onClick={() => {
                        if (rec.action === 'explore') router.push('/cities')
                        else if (rec.action === 'visa') router.push('/visa-guide')
                        else if (rec.action === 'tax') router.push('/tax')
                        else if (rec.action === 'profile') router.push('/profile')
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
                    >
                      {t('dashboard.learnMore')} →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {getAchievements().length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('dashboard.achievements.title')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {getAchievements().map((achievement, index) => (
              <div key={index} className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-800">
                <span className="text-3xl mb-2 block">{achievement.icon}</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{achievement.name}</p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    {t('dashboard.achievements.unlockedStatus')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions - 卡片化快捷入口 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Zap className="w-6 h-6 mr-3 text-yellow-600" />
            {t('dashboard.quickActions.title')}
          </h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {t('dashboard.quickActions.subtitle')}
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* 探索城市 */}
          <button
            onClick={() => router.push('/cities')}
            className="group relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/40 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-4 hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">{t('dashboard.quickActions.exploreCities')}</span>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{t('dashboard.quickActions.exploreCitiesDesc')}</p>
            </div>
          </button>

          {/* 找 Nomad */}
          <button
            onClick={() => router.push('/local-nomads')}
            className="group relative bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/40 border-2 border-green-200 dark:border-green-700 rounded-xl p-4 hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm font-semibold text-green-800 dark:text-green-200">{t('dashboard.quickActions.findNomads')}</span>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">{t('dashboard.quickActions.findNomadsDesc')}</p>
            </div>
          </button>

          {/* 咖啡地图 */}
          <button
            onClick={() => router.push('/places')}
            className="group relative bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/40 border-2 border-purple-200 dark:border-purple-700 rounded-xl p-4 hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Coffee className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm font-semibold text-purple-800 dark:text-purple-200">{t('dashboard.quickActions.coffeeMap')}</span>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">{t('dashboard.quickActions.coffeeMapDesc')}</p>
            </div>
          </button>

          {/* 签证指南 */}
          <button
            onClick={() => router.push('/visa-guide')}
            className="group relative bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/40 border-2 border-orange-200 dark:border-orange-700 rounded-xl p-4 hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm font-semibold text-orange-800 dark:text-orange-200">{t('dashboard.quickActions.visaGuide')}</span>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">{t('dashboard.quickActions.visaGuideDesc')}</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'preferences':
        return <UserPreferencesPanel />
      case 'activity':
        return (
          <div className="space-y-6">
            {/* Activity Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('dashboard.activity.timeline')}</h3>
              <div className="space-y-4">
                {getRecentActivity().length > 0 ? (
                  getRecentActivity().map((activity, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <span className="text-lg">{activity.icon}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.type === 'cityAdded' && t('dashboard.activity.cityAdded', { city: activity.city })}
                          {activity.type === 'cityReviewed' && t('dashboard.activity.cityReviewed', { city: activity.city })}
                          {activity.type === 'placeAdded' && t('dashboard.activity.placeAdded', { place: activity.place, city: activity.city })}
                        </p>
                                             <p className="text-sm text-gray-500 dark:text-gray-400">
                       {activity.timestamp} {t('dashboard.daysAgo')}
                     </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic text-center py-8">
                    {t('dashboard.noActivityRecords')}
                  </p>
                )}
              </div>
            </div>

            {/* Travel Statistics Chart */}
            {getTravelChartData().length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('dashboard.travelStatistics')}</h3>
                <div className="space-y-4">
                  {getTravelChartData().map((data, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {data.month}
                      </span>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((data.days / 31) * 100, 100)}%` }}
                          ></div>
                        </div>
                                                 <span className="text-sm text-gray-600 dark:text-gray-400 w-16 text-right">
                           {data.days} {t('dashboard.days')}
                         </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      case 'notifications':
        return (
          <div className="space-y-6">
            {/* System Notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('dashboard.systemNotifications')}</h3>
              <div className="space-y-4">
                {/* Profile Completion Reminder */}
                {getProfileCompletion() < 80 && (
                  <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm">!</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        {t('dashboard.profileCompletionReminder.title')}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                        {t('dashboard.profileCompletionReminder.description', { percentage: getProfileCompletion().toString() })}
                      </p>
                      <button
                        onClick={() => router.push('/profile')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
                      >
                        {t('dashboard.profileCompletionReminder.action')} →
                      </button>
                    </div>
                  </div>
                )}

                {/* Travel Reminders */}
                {getCurrentStreak() > 0 && (
                  <div className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm">🎉</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">
                        {t('dashboard.travelReminder.continuousTravel')}
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-200 mt-1">
                        {t('dashboard.travelReminder.currentStreak', { days: getCurrentStreak().toString() })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Achievement Unlocked */}
                {getAchievements().length > 0 && (
                  <div className="flex items-start space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm">🏆</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                        {t('dashboard.achievementUnlocked.title')}
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-200 mt-1">
                        {t('dashboard.achievements.unlocked', { count: getAchievements().length.toString() })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('dashboard.notificationSettings')}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{t('dashboard.emailNotifications')}</p>
                                          <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.emailNotificationsDesc')}</p>
                  </div>
                  <button className="w-12 h-6 bg-gray-200 rounded-full relative transition-colors">
                    <div className="w-5 h-5 bg-white rounded-full shadow transform transition-transform translate-x-0"></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{t('dashboard.pushNotifications')}</p>
                                          <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.pushNotificationsDesc')}</p>
                  </div>
                  <button className="w-12 h-6 bg-blue-500 rounded-full relative transition-colors">
                    <div className="w-5 h-5 bg-white rounded-full shadow transform transition-transform translate-x-6"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return renderOverview()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MobileNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Brand Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Globe className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nomad Now</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Digital Nomad Hub</p>
                </div>
              </div>
              
              {/* Breadcrumb */}
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{t('navigation.home')}</span>
                <span>/</span>
                <span className="text-blue-600 dark:text-blue-400">{t('navigation.dashboard')}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* User Status */}
              <div className="hidden md:flex items-center space-x-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">{t('dashboard.online')}</span>
                </div>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600 dark:text-gray-400">{new Date().toLocaleDateString()}</span>
              </div>
              
              {/* Theme Toggle */}
              <div className="hidden lg:block">
                <ThemeToggle />
              </div>
            </div>
          </div>
          
          {/* Welcome Message */}
          <div className="mt-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('dashboard.welcome')}, {getUserName()}!</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{t('dashboard.subtitle')}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}
