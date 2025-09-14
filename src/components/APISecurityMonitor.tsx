'use client'

/**
 * API Security Monitor
 * API安全监控组件，用于监控API的安全状态和性能
 */

import { useState, useEffect } from 'react'
import { Shield, AlertTriangle, CheckCircle, Activity, Clock, Users, Zap } from 'lucide-react'

interface APISecurityStats {
  totalRequests: number
  blockedRequests: number
  rateLimitedRequests: number
  authFailures: number
  validationFailures: number
  averageResponseTime: number
  activeUsers: number
  lastUpdated: Date
}

interface SecurityEvent {
  id: string
  timestamp: Date
  type: 'rate_limit' | 'auth_failure' | 'validation_error' | 'security_violation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  ip: string
  userAgent: string
  endpoint: string
}

export default function APISecurityMonitor() {
  const [stats, setStats] = useState<APISecurityStats | null>(null)
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    loadSecurityData()
    
    if (autoRefresh) {
      const interval = setInterval(loadSecurityData, 30000) // 30秒刷新一次
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const loadSecurityData = async () => {
    try {
      setIsLoading(true)
      
      // 模拟API调用获取安全数据
      const mockStats: APISecurityStats = {
        totalRequests: Math.floor(Math.random() * 10000) + 5000,
        blockedRequests: Math.floor(Math.random() * 100) + 10,
        rateLimitedRequests: Math.floor(Math.random() * 50) + 5,
        authFailures: Math.floor(Math.random() * 20) + 2,
        validationFailures: Math.floor(Math.random() * 30) + 3,
        averageResponseTime: Math.floor(Math.random() * 200) + 50,
        activeUsers: Math.floor(Math.random() * 100) + 20,
        lastUpdated: new Date()
      }
      
      const mockEvents: SecurityEvent[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          type: 'rate_limit',
          severity: 'medium',
          message: 'Rate limit exceeded for IP 192.168.1.100',
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          endpoint: '/api/users'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          type: 'auth_failure',
          severity: 'high',
          message: 'Authentication failed for user admin@example.com',
          ip: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          endpoint: '/api/admin/users'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          type: 'validation_error',
          severity: 'low',
          message: 'Invalid input data for user registration',
          ip: '192.168.1.102',
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          endpoint: '/api/auth/register'
        }
      ]
      
      setStats(mockStats)
      setEvents(mockEvents)
    } catch (error) {
      console.error('Failed to load security data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
      case 'high': return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20'
      case 'low': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20'
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'rate_limit': return <Clock className="h-4 w-4" />
      case 'auth_failure': return <Users className="h-4 w-4" />
      case 'validation_error': return <AlertTriangle className="h-4 w-4" />
      case 'security_violation': return <Shield className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getSecurityLevel = () => {
    if (!stats) return 'unknown'
    
    const blockedRatio = stats.blockedRequests / stats.totalRequests
    const authFailureRatio = stats.authFailures / stats.totalRequests
    
    if (blockedRatio < 0.01 && authFailureRatio < 0.005) return 'high'
    if (blockedRatio < 0.05 && authFailureRatio < 0.02) return 'medium'
    return 'low'
  }

  const getSecurityColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600 dark:text-green-400'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400'
      case 'low': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getSecurityIcon = (level: string) => {
    switch (level) {
      case 'high': return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
      case 'medium': return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      case 'low': return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
      default: return <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
    }
  }

  if (isLoading && !stats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Shield className="h-12 w-12 mx-auto mb-4" />
          <p>无法加载安全数据</p>
        </div>
      </div>
    )
  }

  const securityLevel = getSecurityLevel()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <Shield className="h-6 w-6 mr-2" />
          API安全监控
        </h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {getSecurityIcon(securityLevel)}
            <span className={`font-medium ${getSecurityColor(securityLevel)}`}>
              安全级别: {securityLevel.toUpperCase()}
            </span>
          </div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">自动刷新</span>
          </label>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">总请求数</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.totalRequests.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">被阻止请求</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.blockedRequests}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-2" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">速率限制</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.rateLimitedRequests}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center">
            <Zap className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">平均响应时间</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.averageResponseTime}ms
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 安全事件列表 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          最近安全事件
        </h3>
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getEventTypeIcon(event.type)}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {event.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {event.endpoint} • {event.ip} • {event.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                {event.severity.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 安全指标 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            认证失败率
          </h4>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {((stats.authFailures / stats.totalRequests) * 100).toFixed(2)}%
            </span>
            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
              <div
                className="h-2 bg-red-500 rounded-full"
                style={{ width: `${(stats.authFailures / stats.totalRequests) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            验证失败率
          </h4>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {((stats.validationFailures / stats.totalRequests) * 100).toFixed(2)}%
            </span>
            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
              <div
                className="h-2 bg-yellow-500 rounded-full"
                style={{ width: `${(stats.validationFailures / stats.totalRequests) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            活跃用户
          </h4>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.activeUsers}
            </span>
            <Users className="h-6 w-6 text-blue-500" />
          </div>
        </div>
      </div>

      {/* 最后更新时间 */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        最后更新: {stats.lastUpdated.toLocaleString()}
      </div>
    </div>
  )
}
