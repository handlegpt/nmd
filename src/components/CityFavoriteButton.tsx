'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useUser } from '@/contexts/GlobalStateContext'
import { cityFavoritesService } from '@/lib/cityFavoritesService'

interface CityFavoriteButtonProps {
  cityId: string
  cityName: string
  country?: string
  coordinates?: {
    lat: number
    lng: number
  }
  initialFavorited?: boolean
  onToggle?: (favorited: boolean) => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'icon' | 'button'
}

export default function CityFavoriteButton({
  cityId,
  cityName,
  country = 'Unknown',
  coordinates,
  initialFavorited = false,
  onToggle,
  size = 'md',
  variant = 'icon'
}: CityFavoriteButtonProps) {
  const { t } = useTranslation()
  const { user } = useUser()
  const [isFavorited, setIsFavorited] = useState(initialFavorited)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // 从数据库加载收藏状态
    const loadFavoriteStatus = async () => {
      if (user.isAuthenticated && user.profile?.id) {
        try {
          const isFavorite = await cityFavoritesService.isFavorite(user.profile.id, cityId)
          setIsFavorited(isFavorite)
        } catch (error) {
          console.error('Error loading favorite status:', error)
        }
      }
    }

    loadFavoriteStatus()
  }, [cityId, user.isAuthenticated, user.profile?.id])

  const toggleFavorite = async () => {
    if (!user.isAuthenticated || !user.profile?.id) {
      // 如果用户未登录，可以显示登录提示
      alert(t('loginRequired.favoriteMessage'))
      return
    }

    setIsLoading(true)
    try {
      const success = await cityFavoritesService.toggleFavorite(user.profile.id, {
        city_id: cityId,
        city_name: cityName,
        country: country,
        coordinates: coordinates
      })

      if (success) {
        setIsFavorited(!isFavorited)
        onToggle?.(!isFavorited)
      } else {
        console.error('Failed to toggle favorite')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4'
      case 'lg':
        return 'h-6 w-6'
      default:
        return 'h-5 w-5'
    }
  }

  const getButtonClasses = () => {
    const baseClasses = 'transition-all duration-200'
    const sizeClasses = size === 'sm' ? 'p-1' : size === 'lg' ? 'p-2' : 'p-1.5'
    
    if (variant === 'button') {
      return `${baseClasses} ${sizeClasses} rounded-lg border ${
        isFavorited 
          ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
          : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-red-500'
      }`
    }
    
    return `${baseClasses} ${sizeClasses} ${
      isFavorited 
        ? 'text-red-500 hover:text-red-600' 
        : 'text-gray-400 hover:text-red-500'
    }`
  }

  if (variant === 'button') {
    return (
      <button
        onClick={toggleFavorite}
        disabled={isLoading}
        className={getButtonClasses()}
        title={isFavorited ? t('cities.removeFromFavorites') : t('cities.addToFavorites')}
      >
        <Heart 
          className={`${getSizeClasses()} ${isFavorited ? 'fill-current' : ''}`} 
        />
      </button>
    )
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={getButtonClasses()}
      title={isFavorited ? t('cities.removeFromFavorites') : t('cities.addToFavorites')}
    >
      <Heart 
        className={`${getSizeClasses()} ${isFavorited ? 'fill-current' : ''}`} 
      />
    </button>
  )
}
