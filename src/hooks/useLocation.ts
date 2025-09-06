'use client'

import { useState, useEffect } from 'react'

interface Location {
  latitude: number
  longitude: number
  city?: string
  country?: string
}

interface UseLocationReturn {
  location: Location | null
  loading: boolean
  error: string | null
  requestLocation: () => void
  hasPermission: boolean
  permissionStatus: 'unknown' | 'granted' | 'denied' | 'prompt'
  showPermissionGuide: boolean
  setShowPermissionGuide: (show: boolean) => void
  clearError: () => void
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown')
  const [showPermissionGuide, setShowPermissionGuide] = useState(false)

  // 检查权限状态
  const checkPermissionStatus = async () => {
    try {
      if (!navigator.geolocation) {
        setPermissionStatus('unknown')
        return
      }

      if ('permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' })
          setPermissionStatus(permission.state)
          setHasPermission(permission.state === 'granted')
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
    }
  }

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      setPermissionStatus('unknown')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setHasPermission(true)
        setPermissionStatus('granted')
        
        try {
          // 使用反向地理编码获取城市信息
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          )
          
          if (response.ok) {
            const data = await response.json()
            setLocation({
              latitude,
              longitude,
              city: data.city || data.locality,
              country: data.countryName
            })
          } else {
            setLocation({ latitude, longitude })
          }
        } catch (err) {
          // 如果反向地理编码失败，仍然保存坐标
          setLocation({ latitude, longitude })
        }
        
        setLoading(false)
      },
      (err) => {
        setHasPermission(false)
        let errorMessage = 'Failed to get location'
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setPermissionStatus('denied')
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.'
            setShowPermissionGuide(true)
            break
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.'
            break
          case err.TIMEOUT:
            errorMessage = 'Location request timed out.'
            break
          default:
            errorMessage = err.message || 'An unknown error occurred while getting location.'
        }
        
        setError(errorMessage)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  const clearError = () => {
    setError(null)
  }

  useEffect(() => {
    // 检查是否有保存的位置
    const savedLocation = localStorage.getItem('userLocation')
    if (savedLocation) {
      try {
        setLocation(JSON.parse(savedLocation))
      } catch (err) {
        console.error('Failed to parse saved location:', err)
      }
    }
    
    // 检查权限状态
    checkPermissionStatus()
  }, [])

  useEffect(() => {
    // 保存位置到localStorage
    if (location) {
      localStorage.setItem('userLocation', JSON.stringify(location))
    }
  }, [location])

  return { 
    location, 
    loading, 
    error, 
    requestLocation, 
    hasPermission,
    permissionStatus,
    showPermissionGuide,
    setShowPermissionGuide,
    clearError
  }
}
