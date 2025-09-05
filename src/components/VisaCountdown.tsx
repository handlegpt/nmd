'use client'

import { useState, useEffect } from 'react'
import { CalendarIcon, AlertTriangleIcon, CheckCircleIcon, ClockIcon } from 'lucide-react'
import { calculateVisaDays } from '@/lib/api'
import { useTranslation } from '@/hooks/useTranslation'

interface VisaCountdownProps {
  visaExpiry: string
  country: string
  visaType: string
}

export default function VisaCountdown({ visaExpiry, country, visaType }: VisaCountdownProps) {
  const { t } = useTranslation()
  const [daysLeft, setDaysLeft] = useState(0)
  const [status, setStatus] = useState<'safe' | 'warning' | 'danger' | 'expired'>('safe')

  useEffect(() => {
    const days = calculateVisaDays(visaExpiry)
    setDaysLeft(days)
    
    if (days <= 0) {
      setStatus('expired')
    } else if (days <= 7) {
      setStatus('danger')
    } else if (days <= 30) {
      setStatus('warning')
    } else {
      setStatus('safe')
    }
  }, [visaExpiry])

  const getStatusColor = () => {
    switch (status) {
      case 'safe': return 'text-green-600 bg-green-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'danger': return 'text-red-600 bg-red-50'
      case 'expired': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'safe': return <CheckCircleIcon className="h-5 w-5" />
      case 'warning': return <ClockIcon className="h-5 w-5" />
      case 'danger': return <AlertTriangleIcon className="h-5 w-5" />
      case 'expired': return <AlertTriangleIcon className="h-5 w-5" />
      default: return <CalendarIcon className="h-5 w-5" />
    }
  }

  const getStatusMessage = () => {
    if (daysLeft <= 0) {
      return '签证已过期，请立即处理'
    } else if (daysLeft <= 7) {
      return '签证即将到期，请尽快处理'
    } else if (daysLeft <= 30) {
      return '签证即将到期，建议提前规划'
    } else {
      return '签证状态良好'
    }
  }

  const getRecommendations = () => {
    if (daysLeft <= 0) {
      return [
        '立即联系移民局了解延期选项',
        '考虑申请其他类型签证',
        '准备离境计划'
      ]
    } else if (daysLeft <= 7) {
      return [
        '立即申请签证延期',
        '准备离境机票',
        '联系移民律师咨询'
      ]
    } else if (daysLeft <= 30) {
      return [
        '开始准备签证延期材料',
        '研究其他签证选项',
        '制定备选计划'
      ]
    } else {
      return [
        '继续享受当前签证',
        '提前规划下一个目的地',
        '考虑申请长期签证'
      ]
    }
  }

  const getNextSteps = () => {
    if (daysLeft <= 0) {
      return {
        priority: '紧急',
        actions: [
          { action: '联系移民局', urgency: '立即' },
          { action: '申请签证延期', urgency: '今天' },
          { action: '准备离境', urgency: '本周内' }
        ]
      }
    } else if (daysLeft <= 7) {
      return {
        priority: '高',
        actions: [
          { action: '申请延期', urgency: '明天' },
          { action: '准备文件', urgency: '本周' },
          { action: '联系律师', urgency: '本周' }
        ]
      }
    } else if (daysLeft <= 30) {
      return {
        priority: '中',
        actions: [
          { action: '准备材料', urgency: '下周' },
          { action: '研究选项', urgency: '本月' },
          { action: '制定计划', urgency: '本月' }
        ]
      }
    } else {
      return {
        priority: '低',
        actions: [
          { action: '关注政策', urgency: '持续' },
          { action: '规划续签', urgency: '提前3个月' },
          { action: '准备文件', urgency: '提前2个月' }
        ]
      }
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <CalendarIcon className="h-5 w-5 text-blue-500 mr-2" />
          签证倒计时
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span>{getStatusMessage()}</span>
        </div>
      </div>

      {/* Main Countdown */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-gray-900 mb-2">
          {daysLeft > 0 ? daysLeft : 0}
        </div>
        <div className="text-gray-600">天</div>
        <div className="text-sm text-gray-500 mt-2">
          {country} • {visaType}
        </div>
        <div className="text-sm text-gray-500">
          到期时间: {new Date(visaExpiry).toLocaleDateString()}
        </div>
      </div>

      {/* Next Steps */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">下一步行动</h4>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            getNextSteps().priority === '紧急' ? 'bg-red-100 text-red-700' :
            getNextSteps().priority === '高' ? 'bg-orange-100 text-orange-700' :
            getNextSteps().priority === '中' ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }`}>
            {getNextSteps().priority}优先级
          </span>
        </div>
        <div className="space-y-2">
          {getNextSteps().actions.map((action, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">{action.action}</span>
              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                {action.urgency}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {status !== 'safe' && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h4 className="font-medium text-gray-900 mb-3">详细建议:</h4>
          <ul className="space-y-2">
            {getRecommendations().map((rec, index) => (
              <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            设置提醒
          </button>
          <button className="border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            查看政策
          </button>
        </div>
      </div>
    </div>
  )
}
