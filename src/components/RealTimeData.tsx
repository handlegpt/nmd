'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
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

interface UserStatus {
  id: string
  name: string
  avatar: string
  city: string
  status: 'online' | 'offline' | 'away' | 'busy'
  lastSeen: Date
  activity: string
  isTyping: boolean
  typingTo?: string
}

interface LeaderboardEntry {
  id: string
  name: string
  avatar: string
  city: string
  score: number
  change: number
  badges: string[]
  meetups: number
  reviews: number
}

export default function RealTimeData() {
  const { t } = useTranslation()
  const [onlineUsers, setOnlineUsers] = useState<UserStatus[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Mock data for demonstration
  useEffect(() => {
    const mockUsers: UserStatus[] = [
      {
        id: '1',
        name: 'Tom',
        avatar: 'T',
        city: 'Lisbon',
        status: 'online',
        lastSeen: new Date(),
        activity: 'Browsing meetups',
        isTyping: false
      },
      {
        id: '2',
        name: 'Anna',
        avatar: 'A',
        city: 'Chiang Mai',
        status: 'online',
        lastSeen: new Date(),
        activity: 'Creating new meetup',
        isTyping: true,
        typingTo: 'Tom'
      },
      {
        id: '3',
        name: 'May',
        avatar: 'M',
        city: 'Bali',
        status: 'away',
        lastSeen: new Date(Date.now() - 5 * 60 * 1000),
        activity: 'In a meeting',
        isTyping: false
      },
      {
        id: '4',
        name: 'Sam',
        avatar: 'S',
        city: 'Porto',
        status: 'online',
        lastSeen: new Date(),
        activity: 'Joining coworking session',
        isTyping: false
      },
      {
        id: '5',
        name: 'Alex',
        avatar: 'A',
        city: 'Mexico City',
        status: 'busy',
        lastSeen: new Date(Date.now() - 2 * 60 * 1000),
        activity: 'Working on project',
        isTyping: false
      }
    ]

    const mockLeaderboard: LeaderboardEntry[] = [
      {
        id: '1',
        name: 'Tom',
        avatar: 'T',
        city: 'Lisbon',
        score: 2847,
        change: 12,
        badges: ['Coffee Hero', 'Community Builder'],
        meetups: 15,
        reviews: 23
      },
      {
        id: '2',
        name: 'Anna',
        avatar: 'A',
        city: 'Chiang Mai',
        score: 2654,
        change: 8,
        badges: ['Nomad Explorer', 'Meetup Master'],
        meetups: 12,
        reviews: 19
      },
      {
        id: '3',
        name: 'May',
        avatar: 'M',
        city: 'Bali',
        score: 2432,
        change: -3,
        badges: ['City Guide'],
        meetups: 8,
        reviews: 15
      },
      {
        id: '4',
        name: 'Sam',
        avatar: 'S',
        city: 'Porto',
        score: 2187,
        change: 15,
        badges: ['Helpful Nomad'],
        meetups: 6,
        reviews: 12
      },
      {
        id: '5',
        name: 'Alex',
        avatar: 'A',
        city: 'Mexico City',
        score: 1956,
        change: 5,
        badges: ['Newcomer'],
        meetups: 4,
        reviews: 8
      }
    ]

    setOnlineUsers(mockUsers)
    setLeaderboard(mockLeaderboard)

    // Simulate WebSocket connection
    simulateWebSocketConnection()
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
          const newStatus = ['online', 'away', 'busy'][Math.floor(Math.random() * 3)] as UserStatus['status']
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
      default:
        return '🏆'
    }
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
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {user.avatar}
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
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  🧑‍💻 开发
                                </span>
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                  ✈️ 旅行
                                </span>
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                  ☕ 咖啡
                                </span>
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
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {entry.avatar}
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
          <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Anna</strong> created a new meetup: "Chiang Mai Dev Coworking"
            </span>
            <span className="text-xs text-gray-500">2 min ago</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Tom</strong> joined "Lisbon Coffee Chat" meetup
            </span>
            <span className="text-xs text-gray-500">5 min ago</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              <strong>May</strong> earned "City Guide" badge
            </span>
            <span className="text-xs text-gray-500">8 min ago</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Sam</strong> left "Porto Wine Tasting" meetup
            </span>
            <span className="text-xs text-gray-500">12 min ago</span>
          </div>
        </div>
      </div>
    </div>
  )
}
