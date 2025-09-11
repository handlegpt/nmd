'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { realtimeSystem, RealtimeUser, LeaderboardEntry, ActivityEvent } from '@/lib/realtimeSystem'
import { 
  Wifi, 
  WifiOff, 
  Activity, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Circle,
  Star,
  Clock,
  MessageCircle,
  Heart,
  Award
} from 'lucide-react'

// 使用从realtimeSystem导入的类型

export default function RealTimeData() {
  const { t } = useTranslation()
  const [onlineUsers, setOnlineUsers] = useState<RealtimeUser[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [activities, setActivities] = useState<ActivityEvent[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 初始化真实数据
  useEffect(() => {
    // 初始化实时系统数据
    realtimeSystem.initializeRealData()
    
    // 加载真实数据
    const users = realtimeSystem.getOnlineUsers()
    const leaderboardData = realtimeSystem.getLeaderboard()
    const activitiesData = realtimeSystem.getActivities()
    
    setOnlineUsers(users)
    setLeaderboard(leaderboardData)
    setActivities(activitiesData)

    // 启动实时更新
    const cleanup = realtimeSystem.startRealTimeUpdates()
    
    // 设置数据更新间隔
    const updateInterval = setInterval(() => {
      const updatedUsers = realtimeSystem.getOnlineUsers()
      const updatedLeaderboard = realtimeSystem.getLeaderboard()
      const updatedActivities = realtimeSystem.getActivities()
      
      setOnlineUsers(updatedUsers)
      setLeaderboard(updatedLeaderboard)
      setActivities(updatedActivities)
      setLastUpdate(new Date())
    }, 10000) // 每10秒更新一次

    // 模拟WebSocket连接
    simulateWebSocketConnection()

    return () => {
      cleanup()
      clearInterval(updateInterval)
    }
  }, [])

  // Simulate WebSocket connection and real-time updates
  const simulateWebSocketConnection = () => {
    setConnectionStatus('connecting')
    
    // Simulate connection delay
    setTimeout(() => {
      setIsConnected(true)
      setConnectionStatus('connected')
      
      // Start real-time updates
      startRealTimeUpdates()
    }, 1000)
  }

  // Simulate real-time updates
  const startRealTimeUpdates = () => {
    // Update user statuses every 30 seconds
    const statusInterval = setInterval(() => {
      setOnlineUsers(prev => prev.map(user => {
        // Randomly change some user statuses
        if (Math.random() < 0.3) {
          const newStatus = ['online', 'away', 'busy'][Math.floor(Math.random() * 3)] as RealtimeUser['status']
          return {
            ...user,
            status: newStatus,
            lastSeen: new Date(),
            activity: getRandomActivity(),
            isTyping: Math.random() < 0.1
          }
        }
        return user
      }))
      
      setLastUpdate(new Date())
    }, 30000)

    // Update leaderboard scores every 2 minutes
    const leaderboardInterval = setInterval(() => {
      setLeaderboard(prev => prev.map(entry => {
        // Randomly adjust scores
        const scoreChange = Math.floor(Math.random() * 10) - 5
        return {
          ...entry,
          score: Math.max(0, entry.score + scoreChange),
          change: scoreChange
        }
      }))
    }, 120000)

    // Cleanup intervals
    return () => {
      clearInterval(statusInterval)
      clearInterval(leaderboardInterval)
    }
  }

  // Get random activity
  const getRandomActivity = () => {
    const activities = [
      'Browsing meetups',
      'Creating new meetup',
      'Joining coworking session',
      'Working on project',
      'Planning next trip',
      'Reading city guides',
      'Checking visa requirements',
      'Exploring new places'
    ]
    return activities[Math.floor(Math.random() * activities.length)]
  }

  // Get status icon and color
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <Wifi className="w-3 h-3 text-green-500" />
      case 'away':
        return <Clock className="w-3 h-3 text-yellow-500" />
      case 'busy':
        return <Activity className="w-3 h-3 text-red-500" />
      case 'offline':
        return <WifiOff className="w-3 h-3 text-gray-500" />
      default:
        return <Circle className="w-3 h-3 text-gray-400" />
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800'
      case 'away':
        return 'bg-yellow-100 text-yellow-800'
      case 'busy':
        return 'bg-red-100 text-red-800'
      case 'offline':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Get change indicator
  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />
    } else if (change < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />
    } else {
      return <Circle className="w-4 h-4 text-gray-400" />
    }
  }

  // Get badge icon
  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'Coffee Hero':
        return '☕'
      case 'Community Builder':
        return '🏗️'
      case 'Nomad Explorer':
        return '🗺️'
      case 'Meetup Master':
        return '🎯'
      case 'City Guide':
        return '🏛️'
      case 'Helpful Nomad':
        return '🤝'
      case 'Newcomer':
        return '🆕'
      case 'Code Nomad':
        return '💻'
      case 'Coffee Lover':
        return '☕'
      default:
        return '🏆'
    }
  }

  // Get time ago
  const getTimeAgo = (timestamp: Date): string => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' :
              connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {connectionStatus === 'connected' ? 'Connected' :
               connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
            </span>
            {connectionStatus === 'connected' && (
              <span className="text-xs text-gray-500">
                Last update: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          <button
            onClick={simulateWebSocketConnection}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reconnect
          </button>
        </div>
      </div>

                        {/* Real-time Online Users */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <Users className="w-5 h-5 mr-2 text-green-500" />
                        实时在线用户
                      </h3>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {onlineUsers.filter(u => u.status === 'online').length}
                          </div>
                          <div className="text-xs text-gray-500">在线</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {onlineUsers.length}
                          </div>
                          <div className="text-xs text-gray-500">总用户</div>
                        </div>
                      </div>
                    </div>
        
        <div className="space-y-3">
          {onlineUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium overflow-hidden">
                  {user.avatar && user.avatar.startsWith('data:') ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    user.avatar
                  )}
                </div>
                                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                                {getStatusIcon(user.status)}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                  {user.status === 'online' ? '在线' : 
                                   user.status === 'away' ? '离开' : 
                                   user.status === 'busy' ? '忙碌' : '离线'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                <span>{user.city}</span>
                                <span>•</span>
                                <span>{user.activity}</span>
                                {user.isTyping && (
                                  <>
                                    <span>•</span>
                                    <span className="text-blue-600 flex items-center space-x-1">
                                      <MessageCircle className="w-3 h-3" />
                                      <span>正在输入...</span>
                                    </span>
                                  </>
                                )}
                              </div>
                              
                              {/* Interest Tags */}
                              <div className="flex flex-wrap gap-1 mt-2">
                                {user.interests.slice(0, 3).map((interest, index) => (
                                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                    {interest}
                                  </span>
                                ))}
                                {user.interests.length > 3 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                    +{user.interests.length - 3} more
                                  </span>
                                )}
                              </div>
                              
                              {/* Last Active Time */}
                              <div className="text-xs text-gray-500 mt-1">
                                上次活跃: {user.lastSeen.toLocaleTimeString()}
                              </div>
                            </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Leaderboard */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-500" />
            Dynamic Leaderboard
          </h3>
          <span className="text-sm text-gray-500">
            Updates every 2 minutes
          </span>
        </div>
        
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium overflow-hidden">
                  {entry.avatar && entry.avatar.startsWith('data:') ? (
                    <img 
                      src={entry.avatar} 
                      alt={entry.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    entry.avatar
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900 dark:text-white">{entry.name}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">•</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{entry.city}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    {entry.badges.slice(0, 2).map((badge, badgeIndex) => (
                      <span key={badgeIndex} className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        <span>{getBadgeIcon(badge)}</span>
                        <span>{badge}</span>
                      </span>
                    ))}
                    {entry.badges.length > 2 && (
                      <span className="text-xs text-gray-500">+{entry.badges.length - 2} more</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{entry.score.toLocaleString()}</span>
                    {getChangeIndicator(entry.change)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {entry.meetups} meetups • {entry.reviews} reviews
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Activity Feed */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-500" />
          Real-time Activity Feed
        </h3>
        
        <div className="space-y-3">
          {activities.slice(-10).map((activity) => (
            <div key={activity.id} className={`flex items-center space-x-3 p-3 rounded-lg ${
              activity.type === 'meetup' ? 'bg-green-50 dark:bg-green-900/20' :
              activity.type === 'review' ? 'bg-blue-50 dark:bg-blue-900/20' :
              activity.type === 'badge' ? 'bg-purple-50 dark:bg-purple-900/20' :
              activity.type === 'join' ? 'bg-orange-50 dark:bg-orange-900/20' :
              'bg-gray-50 dark:bg-gray-700'
            }`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                activity.type === 'meetup' ? 'bg-green-500' :
                activity.type === 'review' ? 'bg-blue-500' :
                activity.type === 'badge' ? 'bg-purple-500' :
                activity.type === 'join' ? 'bg-orange-500' :
                'bg-gray-500'
              }`} />
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                  {activity.userAvatar}
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>{activity.userName}</strong> {activity.action}: {activity.details}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {getTimeAgo(activity.timestamp)}
              </span>
            </div>
          ))}
          {activities.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No recent activities</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
