'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorMessageProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export default function ErrorMessage({ 
  title = '出错了',
  message = '加载数据时发生错误，请重试',
  onRetry,
  className = ''
}: ErrorMessageProps) {
  return (
    <div className={`card card-md bg-red-50 border-red-200 ${className}`}>
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <p className="text-sm text-red-700 mt-1">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn btn-sm bg-red-100 hover:bg-red-200 text-red-700 mt-3"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              重试
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// 空状态组件
export function EmptyState({ 
  title = '暂无数据',
  message = '当前没有可显示的内容',
  icon,
  action,
  className = ''
}: {
  title?: string
  message?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={`card card-md bg-gray-50 border-gray-200 text-center ${className}`}>
      {icon && (
        <div className="mx-auto mb-4 w-12 h-12 text-gray-400">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{message}</p>
      {action && action}
    </div>
  )
}
