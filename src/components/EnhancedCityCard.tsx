'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { 
  Star, 
  Wifi, 
  DollarSign, 
  MapPin, 
  Users, 
  Coffee,
  Calendar,
  Heart,
  Share2,
  Eye,
  Flag,
  TrendingUp
} from 'lucide-react'

interface CityData {
  id: string
  name: string
  country: string
  countryCode: string
  flag: string
  image: string
  rating: number
  reviewCount: number
  costOfLiving: {
    monthly: number
    currency: string
    category: string
  }
  wifi: {
    speed: number
    reliability: number
  }
  visa: {
    type: string
    duration: number
    difficulty: string
  }
  nomads: {
    count: number
    active: boolean
    meetups: string[]
  }
  tags: string[]
  isPopular: boolean
  isRecommended: boolean
}

interface EnhancedCityCardProps {
  city: CityData
  isSelected: boolean
  onSelect: (cityId: string) => void
  onViewDetails: (cityId: string) => void
  onAddToFavorites: (cityId: string) => void
  showCompareButton?: boolean
}

export default function EnhancedCityCard({
  city,
  isSelected,
  onSelect,
  onViewDetails,
  onAddToFavorites,
  showCompareButton = true
}: EnhancedCityCardProps) {
  const { t } = useTranslation()
  const [isHovered, setIsHovered] = useState(false)

  // Get cost category color and label
  const getCostCategory = () => {
    const { monthly, category } = city.costOfLiving
    const colors: Record<string, string> = {
      budget: 'bg-green-100 text-green-800',
      affordable: 'bg-blue-100 text-blue-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      expensive: 'bg-orange-100 text-orange-800',
      luxury: 'bg-red-100 text-red-800'
    }
    
    const labels: Record<string, string> = {
      budget: t('cityCard.budget'),
      affordable: t('cityCard.affordable'),
      moderate: t('cityCard.moderate'),
      expensive: t('cityCard.expensive'),
      luxury: t('cityCard.luxury')
    }

    return {
      color: colors[category] || colors.moderate,
      label: labels[category] || labels.moderate
    }
  }

  // Get visa difficulty color
  const getVisaDifficultyColor = () => {
    const colors: Record<string, string> = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    }
    return colors[city.visa.difficulty] || colors.medium
  }

  // Get WiFi quality indicator
  const getWifiQuality = () => {
    if (city.wifi.speed >= 100) return { color: 'text-green-600', icon: '🚀' }
    if (city.wifi.speed >= 50) return { color: 'text-blue-600', icon: '⚡' }
    if (city.wifi.speed >= 25) return { color: 'text-yellow-600', icon: '📶' }
    return { color: 'text-red-600', icon: '🐌' }
  }

  return (
    <div 
      className={`relative bg-white dark:bg-gray-800 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
        isSelected 
          ? 'border-blue-500 shadow-lg scale-[1.02]' 
          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:shadow-md'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* City Image Background */}
      <div className="relative h-32 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-4xl mb-2">{city.flag}</div>
            <h3 className="text-xl font-bold">{city.name}</h3>
            <p className="text-sm opacity-90">{city.country}</p>
          </div>
        </div>
        
        {/* Popular/Recommended Badge */}
        {city.isPopular && (
          <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>{t('cityCard.popular')}</span>
          </div>
        )}
        
        {city.isRecommended && (
          <div className="absolute top-3 right-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            ⭐ {t('cityCard.recommended')}
          </div>
        )}

        {/* Rating */}
        <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-gray-800/90 rounded-lg px-2 py-1 flex items-center space-x-1">
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
          <span className="font-bold text-gray-900 dark:text-white">{city.rating}</span>
          <span className="text-xs text-gray-600 dark:text-gray-400">({city.reviewCount})</span>
        </div>
      </div>

      {/* City Info */}
      <div className="p-4">
        {/* Cost and WiFi Row */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {city.costOfLiving.currency}{city.costOfLiving.monthly}/{t('cityCard.month')}
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${getCostCategory().color}`}>
                {getCostCategory().label}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Wifi className="w-4 h-4 text-blue-600" />
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {city.wifi.speed} Mbps
              </div>
              <div className={`text-xs ${getWifiQuality().color}`}>
                {getWifiQuality().icon} {city.wifi.reliability}% 稳定
              </div>
            </div>
          </div>
        </div>

        {/* Visa and Duration Row */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-purple-600" />
            <div>
              <div className="font-medium text-gray-900 dark:text-white text-sm">
                {city.visa.type}
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${getVisaDifficultyColor()}`}>
                {city.visa.difficulty === 'easy' ? t('cityCard.easy') : city.visa.difficulty === 'medium' ? t('cityCard.medium') : t('cityCard.hard')}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <div>
              <div className="font-medium text-gray-900 dark:text-white text-sm">
                {city.visa.duration} {t('cityCard.days')}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {t('cityCard.stayDuration')}
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {city.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index} 
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {city.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
              +{city.tags.length - 3}
            </span>
          )}
        </div>

        {/* Social Info */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {city.nomads.count}
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400">Nomads</span>
            </div>
            
            {city.nomads.meetups.length > 0 && (
              <div className="flex items-center space-x-1">
                <Coffee className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {city.nomads.meetups[0]}
                </span>
              </div>
            )}
          </div>
          
          <div className={`w-2 h-2 rounded-full ${city.nomads.active ? 'bg-green-500' : 'bg-gray-400'}`} />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {showCompareButton && (
              <button
                onClick={() => onSelect(city.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {isSelected ? `✓ ${t('cityCard.selected')}` : t('cityCard.selectForComparison')}
              </button>
            )}
            
            <button
              onClick={() => onViewDetails(city.id)}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {t('cityCard.viewDetails')}
            </button>
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={() => onAddToFavorites(city.id)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="添加到收藏"
            >
              <Heart className="w-4 h-4" />
            </button>
            
            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="分享">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Hover Overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-blue-500/10 border-2 border-blue-400 rounded-xl pointer-events-none transition-opacity duration-300" />
      )}
    </div>
  )
}
