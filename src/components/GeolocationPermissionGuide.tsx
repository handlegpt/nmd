'use client'

import { useState, useEffect } from 'react'
import { MapPin, Settings, RefreshCw, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

interface GeolocationPermissionGuideProps {
  isOpen: boolean
  onClose: () => void
  onRetry: () => void
  error?: string | null
}

export default function GeolocationPermissionGuide({ 
  isOpen, 
  onClose, 
  onRetry, 
  error 
}: GeolocationPermissionGuideProps) {
  const { t } = useTranslation()
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown')
  const [isChecking, setIsChecking] = useState(false)

  // 检查地理位置权限状态
  const checkPermissionStatus = async () => {
    setIsChecking(true)
    try {
      if (!navigator.geolocation) {
        setPermissionStatus('unknown')
        return
      }

      if ('permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' })
          setPermissionStatus(permission.state)
        } catch (err) {
          console.log('Permission query not supported')
          setPermissionStatus('unknown')
        }
      } else {
        setPermissionStatus('unknown')
      }
    } catch (err) {
      console.error('Error checking permission status:', err)
      setPermissionStatus('unknown')
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      checkPermissionStatus()
    }
  }, [isOpen])

  if (!isOpen) return null

  const getStatusIcon = () => {
    switch (permissionStatus) {
      case 'granted':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'denied':
        return <X className="h-6 w-6 text-red-500" />
      case 'prompt':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />
      default:
        return <MapPin className="h-6 w-6 text-gray-500" />
    }
  }

  const getStatusText = () => {
    switch (permissionStatus) {
      case 'granted':
        return t('geolocation.status.granted')
      case 'denied':
        return t('geolocation.status.denied')
      case 'prompt':
        return t('geolocation.status.prompt')
      default:
        return t('geolocation.status.unknown')
    }
  }

  const getStatusColor = () => {
    switch (permissionStatus) {
      case 'granted':
        return 'text-green-600'
      case 'denied':
        return 'text-red-600'
      case 'prompt':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <MapPin className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {t('geolocation.title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              {getStatusIcon()}
              <span className={`font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
            {error && (
              <p className="text-sm text-red-600 mt-2">
                {error}
              </p>
            )}
          </div>

          {/* Permission Denied Instructions */}
          {permissionStatus === 'denied' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-medium text-red-800 mb-2">
                  {t('geolocation.denied.title')}
                </h3>
                <p className="text-sm text-red-700 mb-3">
                  {t('geolocation.denied.description')}
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-red-600">1</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        {t('geolocation.denied.step1.title')}
                      </p>
                      <p className="text-sm text-red-700">
                        {t('geolocation.denied.step1.description')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-red-600">2</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        {t('geolocation.denied.step2.title')}
                      </p>
                      <p className="text-sm text-red-700">
                        {t('geolocation.denied.step2.description')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-red-600">3</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        {t('geolocation.denied.step3.title')}
                      </p>
                      <p className="text-sm text-red-700">
                        {t('geolocation.denied.step3.description')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Browser-specific instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">
                  {t('geolocation.browserInstructions.title')}
                </h4>
                <div className="space-y-2 text-sm text-blue-700">
                  <p><strong>Chrome/Edge:</strong> {t('geolocation.browserInstructions.chrome')}</p>
                  <p><strong>Firefox:</strong> {t('geolocation.browserInstructions.firefox')}</p>
                  <p><strong>Safari:</strong> {t('geolocation.browserInstructions.safari')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Alternative Options */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">
              {t('geolocation.alternatives.title')}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {t('geolocation.alternatives.description')}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  // 可以添加手动输入位置的逻辑
                  onClose()
                }}
                className="w-full text-left px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">
                  {t('geolocation.alternatives.manualInput')}
                </span>
              </button>
              <button
                onClick={() => {
                  // 可以添加使用IP定位的逻辑
                  onClose()
                }}
                className="w-full text-left px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">
                  {t('geolocation.alternatives.ipLocation')}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={checkPermissionStatus}
            disabled={isChecking}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{t('geolocation.refresh')}</span>
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={onRetry}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('geolocation.retry')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
