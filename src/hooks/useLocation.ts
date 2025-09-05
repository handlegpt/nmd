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
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState(false)

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setHasPermission(true)
        
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
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.'
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
  }, [])

  useEffect(() => {
    // 保存位置到localStorage
    if (location) {
      localStorage.setItem('userLocation', JSON.stringify(location))
    }
  }, [location])

  return { location, loading, error, requestLocation, hasPermission }
}
