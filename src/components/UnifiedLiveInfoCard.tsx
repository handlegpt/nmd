'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapPin, RefreshCw, Clock, Cloud, Wifi, Calendar, X, Globe } from 'lucide-react'
import { getCurrentLocation, getWorldTime, getTimezoneFromCoordinates } from '@/lib/api'
import { useTranslation } from '@/hooks/useTranslation'
import WifiSpeedTest from './WifiSpeedTest'
import FixedLink from './FixedLink'

interface LocationData {
  city: string
  country: string
  timezone: string
  lat: number
  lon: number
}

interface TimeData {
  time: string
  date: string
}

interface UnifiedLiveInfoCardProps {
  variant?: 'hero' | 'standalone'
  showVisaInfo?: boolean
  showActions?: boolean
  className?: string
}

export default function UnifiedLiveInfoCard({ 
  variant = 'standalone', 
  showVisaInfo = true, 
  showActions = true,
  className = ''
}: UnifiedLiveInfoCardProps) {
  const { t } = useTranslation()
  const [location, setLocation] = useState<LocationData | null>(null)
  const [time, setTime] = useState<TimeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [showWifiTest, setShowWifiTest] = useState(false)

  // Define updateTime function first using useCallback to fix useEffect dependency issues
  const updateTime = useCallback(async () => {
    if (!location?.timezone) return

    try {
      const timeData = await getWorldTime(location.timezone)
      if (timeData) {
        setTime({
          time: timeData.time,
          date: timeData.date
        })
        
        // If using fallback data, log a warning
        if (timeData.fallback) {
          console.warn('Using fallback time data for timezone:', location.timezone)
        }
      }
    } catch (error) {
      console.error('Error updating time:', error)
      // Calculate time for the specific timezone using local time + offset
      try {
        const now = new Date()
        const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000)
        
        // Try to calculate timezone offset (this is a simplified approach)
        const timezoneOffset = location.timezone.includes('Asia/Tokyo') ? 9 : 
                              location.timezone.includes('Asia/Shanghai') ? 8 :
                              location.timezone.includes('Europe/London') ? 0 :
                              location.timezone.includes('America/New_York') ? -5 : 0
        
        const targetTime = new Date(utcTime + (timezoneOffset * 3600000))
        
        setTime({
          time: targetTime.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          date: targetTime.toLocaleDateString()
        })
      } catch (fallbackError) {
        // Ultimate fallback to local time
        const now = new Date()
        setTime({
          time: now.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          date: now.toLocaleDateString()
        })
      }
    }
  }, [location])

  // Get current location and initialize data
  useEffect(() => {
    initializeData()
  }, [])

  // Update time every 5 minutes to reduce API calls
  useEffect(() => {
    const timeInterval = setInterval(() => {
      if (location?.timezone) {
        updateTime()
      }
    }, 300000) // Update every 5 minutes instead of every minute

    return () => clearInterval(timeInterval)
  }, [location, updateTime])

  const initializeData = async () => {
    setLoading(true)
    try {
      // Get current location
      const locationData = await getCurrentLocation()
      if (locationData) {
        const timezone = getTimezoneFromCoordinates(locationData.lat, locationData.lon)
        setLocation({
          city: locationData.city,
          country: locationData.country,
          timezone: timezone,
          lat: locationData.lat,
          lon: locationData.lon
        })

        // Get current time
        await updateTime()
      }
    } catch (error) {
      console.error('Error initializing data:', error)
      // Fallback to default location
      setLocation({
        city: 'Osaka',
        country: 'Japan',
        timezone: 'Asia/Tokyo',
        lat: 34.6937,
        lon: 135.5023
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setLastUpdated(new Date())
    await initializeData()
  }

  const getVisaStatus = () => {
    // This should be fetched from user's visa data
    // For now, show a placeholder or hide if user hasn't set up visa info
    return null
  }

  if (loading) {
    return (
      <div className={`card card-lg ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">{t('common.loadingLocationData')}</span>
        </div>
      </div>
    )
  }

  // Hero variant - simplified version for hero section
  if (variant === 'hero') {
    return (
      <>
        <div className={`card card-lg bg-white/90 backdrop-blur-sm border-0 shadow-2xl w-full ${className}`}>
          <div className="space-y-3 sm:space-y-4">
            {/* Header */}
            <div className="text-center">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">{t('home.hero.liveInfo.title')}</h3>
              <p className="text-xs sm:text-sm text-gray-600">{t('home.hero.liveInfo.subtitle')}</p>
            </div>

            {/* Current Time */}
            <div className="text-center p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mx-auto mb-1" />
              <div className="text-xl sm:text-2xl font-mono font-bold text-gray-900">
                {time?.time || '--:--'}
              </div>
              <div className="text-xs text-gray-600 mt-1">{t('home.hero.liveInfo.currentTime')}</div>
            </div>

            {/* Current Location */}
            <div className="text-center p-2 sm:p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mx-auto mb-1" />
              <div className="text-sm sm:text-base font-semibold text-gray-900">
                {location ? `${location.city}, ${location.country}` : t('home.hero.liveInfo.locationUnavailable')}
              </div>
              <div className="text-xs text-gray-600 mt-1">{t('home.hero.liveInfo.currentLocation')}</div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  className="flex-1 btn btn-sm btn-outline"
                  title="Refresh data"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  {t('common.refresh')}
                </button>
                <button
                  onClick={() => setShowWifiTest(true)}
                  className="flex-1 btn btn-sm btn-outline"
                  title="Test WiFi speed"
                >
                  <Wifi className="h-3 w-3 mr-1" />
                  WiFi
                </button>
              </div>
            )}
          </div>
        </div>

        {/* WiFi Speed Test Modal */}
        {showWifiTest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">WiFi Speed Test</h3>
                <button
                  onClick={() => setShowWifiTest(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <WifiSpeedTest />
            </div>
          </div>
        )}
      </>
    )
  }

  // Standalone variant - full featured version
  return (
    <>
      <div className={`card card-lg ${className}`}>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{t('home.hero.liveInfo.title')}</h3>
              <p className="text-sm text-gray-600">{t('home.hero.liveInfo.subtitle')}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="btn btn-sm btn-outline"
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {/* Current Time and Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-mono font-bold text-gray-900">
                {time?.time || '--:--'}
              </div>
              <div className="text-sm text-gray-600">{time?.date || '--'}</div>
            </div>

            <div className="text-center p-3 bg-green-50 rounded-lg">
              <MapPin className="h-5 w-5 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-semibold text-gray-900">
                {location ? location.city : 'Unknown'}
              </div>
              <div className="text-sm text-gray-600">{location?.country || 'Unknown'}</div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Globe className="h-5 w-5 text-purple-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900">Timezone</div>
              <div className="text-xs text-gray-600">{location?.timezone || 'Unknown'}</div>
            </div>

            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <Calendar className="h-5 w-5 text-yellow-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900">Last Updated</div>
              <div className="text-xs text-gray-600">
                {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowWifiTest(true)}
                className="flex-1 btn btn-outline hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <Wifi className="h-4 w-4 mr-2" />
                <span className="font-medium">{t('common.testWifi')}</span>
              </button>
              <FixedLink
                href="/nomadcities"
                className="flex-1 btn btn-primary hover:bg-blue-700 transition-colors"
              >
                <Globe className="h-4 w-4 mr-2" />
                <span className="font-medium">{t('common.exploreCities')}</span>
              </FixedLink>
            </div>
          )}
        </div>
      </div>

      {/* WiFi Speed Test Modal */}
      {showWifiTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">WiFi Speed Test</h3>
              <button
                onClick={() => setShowWifiTest(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <WifiSpeedTest />
          </div>
        </div>
      )}
    </>
  )
}
