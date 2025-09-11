'use client'

import React, { useState, useEffect } from 'react'
import { AlertTriangle, X, RefreshCw, Info, CheckCircle, XCircle } from 'lucide-react'

export type AlertType = 'error' | 'warning' | 'info' | 'success'

export interface ErrorAlertProps {
  type?: AlertType
  title?: string
  message: string
  details?: string
  onRetry?: () => void
  onDismiss?: () => void
  autoDismiss?: boolean
  dismissAfter?: number
  showDetails?: boolean
  className?: string
}

const alertConfig = {
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    iconColor: 'text-red-600 dark:text-red-400',
    titleColor: 'text-red-900 dark:text-red-100',
    textColor: 'text-red-700 dark:text-red-300'
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    titleColor: 'text-yellow-900 dark:text-yellow-100',
    textColor: 'text-yellow-700 dark:text-yellow-300'
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
    titleColor: 'text-blue-900 dark:text-blue-100',
    textColor: 'text-blue-700 dark:text-blue-300'
  },
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    iconColor: 'text-green-600 dark:text-green-400',
    titleColor: 'text-green-900 dark:text-green-100',
    textColor: 'text-green-700 dark:text-green-300'
  }
}

export default function ErrorAlert({
  type = 'error',
  title,
  message,
  details,
  onRetry,
  onDismiss,
  autoDismiss = false,
  dismissAfter = 5000,
  showDetails = false,
  className = ''
}: ErrorAlertProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [showFullDetails, setShowFullDetails] = useState(showDetails)

  const config = alertConfig[type]
  const Icon = config.icon

  useEffect(() => {
    if (autoDismiss && isVisible) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, dismissAfter)

      return () => clearTimeout(timer)
    }
  }, [autoDismiss, dismissAfter, isVisible])

  const handleDismiss = () => {
    setIsVisible(false)
    if (onDismiss) {
      onDismiss()
    }
  }

  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className={`rounded-lg border p-4 ${config.bgColor} ${config.borderColor} ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`text-sm font-medium ${config.titleColor} mb-1`}>
              {title}
            </h3>
          )}
          
          <p className={`text-sm ${config.textColor}`}>
            {message}
          </p>
          
          {details && (
            <div className="mt-2">
              <button
                onClick={() => setShowFullDetails(!showFullDetails)}
                className={`text-xs font-medium ${config.textColor} hover:underline`}
              >
                {showFullDetails ? 'Hide details' : 'Show details'}
              </button>
              
              {showFullDetails && (
                <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <pre className={`text-xs ${config.textColor} whitespace-pre-wrap overflow-auto`}>
                    {details}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {onRetry && (
            <button
              onClick={handleRetry}
              className={`p-1 rounded hover:bg-white dark:hover:bg-gray-700 transition-colors ${config.iconColor}`}
              title="Retry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          
          {onDismiss && (
            <button
              onClick={handleDismiss}
              className={`p-1 rounded hover:bg-white dark:hover:bg-gray-700 transition-colors ${config.iconColor}`}
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// 便捷的预设组件
export function ErrorAlertSimple({ message, onRetry, onDismiss }: { 
  message: string
  onRetry?: () => void
  onDismiss?: () => void 
}) {
  return (
    <ErrorAlert
      type="error"
      message={message}
      onRetry={onRetry}
      onDismiss={onDismiss}
      autoDismiss={true}
    />
  )
}

export function WarningAlert({ message, onDismiss }: { 
  message: string
  onDismiss?: () => void 
}) {
  return (
    <ErrorAlert
      type="warning"
      message={message}
      onDismiss={onDismiss}
      autoDismiss={true}
    />
  )
}

export function InfoAlert({ message, onDismiss }: { 
  message: string
  onDismiss?: () => void 
}) {
  return (
    <ErrorAlert
      type="info"
      message={message}
      onDismiss={onDismiss}
      autoDismiss={true}
    />
  )
}

export function SuccessAlert({ message, onDismiss }: { 
  message: string
  onDismiss?: () => void 
}) {
  return (
    <ErrorAlert
      type="success"
      message={message}
      onDismiss={onDismiss}
      autoDismiss={true}
    />
  )
}
