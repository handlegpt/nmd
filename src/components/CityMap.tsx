'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { 
  MapPin, 
  Navigation, 
  ExternalLink,
  Wifi,
  Coffee,
  Building,
  Car
} from 'lucide-react'

interface CityMapProps {
  cityData: {
    name: string
    country: string
    latitude: number
    longitude: number
    wifi_speed: number
  }
}

interface PlaceMarker {
  id: string
  name: string
  type: 'coworking' | 'cafe' | 'accommodation' | 'transport'
  latitude: number
  longitude: number
  rating: number
  description: string
}

export default function CityMap({ cityData }: CityMapProps) {
  const { t } = useTranslation()
  const mapRef = useRef<HTMLDivElement>(null)
  const [selectedPlace, setSelectedPlace] = useState<PlaceMarker | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 模拟推荐地点数据
  const recommendedPlaces: PlaceMarker[] = [
    {
      id: '1',
      name: 'WeWork Space',
      type: 'coworking',
      latitude: cityData.latitude + 0.01,
      longitude: cityData.longitude + 0.01,
      rating: 4.5,
      description: 'Professional coworking space with excellent WiFi'
    },
    {
      id: '2',
      name: 'Blue Bottle Coffee',
      type: 'cafe',
      latitude: cityData.latitude - 0.005,
      longitude: cityData.longitude + 0.008,
      rating: 4.2,
      description: 'Great coffee and quiet atmosphere for work'
    },
    {
      id: '3',
      name: 'Nomad House',
      type: 'accommodation',
      latitude: cityData.latitude + 0.008,
      longitude: cityData.longitude - 0.012,
      rating: 4.3,
      description: 'Digital nomad friendly accommodation'
    },
    {
      id: '4',
      name: 'Central Station',
      type: 'transport',
      latitude: cityData.latitude - 0.015,
      longitude: cityData.longitude - 0.005,
      rating: 4.0,
      description: 'Main transportation hub'
    }
  ]

  useEffect(() => {
    // 模拟地图加载
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const getPlaceIcon = (type: string) => {
    switch (type) {
      case 'coworking':
        return <Building className="h-4 w-4" />
      case 'cafe':
        return <Coffee className="h-4 w-4" />
      case 'accommodation':
        return <MapPin className="h-4 w-4" />
      case 'transport':
        return <Car className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const getPlaceColor = (type: string) => {
    switch (type) {
      case 'coworking':
        return 'bg-blue-500'
      case 'cafe':
        return 'bg-amber-500'
      case 'accommodation':
        return 'bg-green-500'
      case 'transport':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getPlaceTypeLabel = (type: string) => {
    switch (type) {
      case 'coworking':
        return t('cityDetail.map.coworking')
      case 'cafe':
        return t('cityDetail.map.cafe')
      case 'accommodation':
        return t('cityDetail.map.accommodation')
      case 'transport':
        return t('cityDetail.map.transport')
      default:
        return type
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {t('cityDetail.map.title')}
        </h3>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('cityDetail.map.title')}
        </h3>
        <button className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700">
          <ExternalLink className="h-4 w-4" />
          <span>{t('cityDetail.map.openInMaps')}</span>
        </button>
      </div>

      {/* 地图容器 */}
      <div className="relative h-64 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg mb-4 overflow-hidden">
        {/* 模拟地图背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-green-200 to-yellow-200 dark:from-blue-800/30 dark:via-green-800/30 dark:to-yellow-800/30"></div>
        
        {/* 城市中心标记 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="p-2 bg-red-500 text-white rounded-full shadow-lg">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{cityData.name}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{cityData.country}</p>
          </div>
        </div>

        {/* 推荐地点标记 */}
        {recommendedPlaces.map((place, index) => {
          const x = 20 + (index * 20) + Math.random() * 20
          const y = 30 + (index * 15) + Math.random() * 20
          
          return (
            <div
              key={place.id}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
              onClick={() => setSelectedPlace(place)}
            >
              <div className={`p-2 ${getPlaceColor(place.type)} text-white rounded-full shadow-lg hover:scale-110 transition-transform`}>
                {getPlaceIcon(place.type)}
              </div>
            </div>
          )
        })}

        {/* WiFi速度指示器 */}
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-2">
            <Wifi className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {cityData.wifi_speed} Mbps
            </span>
          </div>
        </div>
      </div>

      {/* 推荐地点列表 */}
      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('cityDetail.map.recommendedPlaces')}
        </h4>
        {recommendedPlaces.map((place) => (
          <div
            key={place.id}
            className={`p-3 rounded-lg border-2 transition-colors cursor-pointer ${
              selectedPlace?.id === place.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
            onClick={() => setSelectedPlace(place)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 ${getPlaceColor(place.type)} text-white rounded-lg`}>
                  {getPlaceIcon(place.type)}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{place.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getPlaceTypeLabel(place.type)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {place.rating}
                  </span>
                </div>
                <button className="text-xs text-blue-600 hover:text-blue-700">
                  {t('cityDetail.map.directions')}
                </button>
              </div>
            </div>
            {selectedPlace?.id === place.id && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-600 dark:text-gray-400">{place.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                    <Navigation className="h-3 w-3" />
                    <span>{t('cityDetail.map.getDirections')}</span>
                  </button>
                  <button className="text-xs text-green-600 hover:text-green-700">
                    {t('cityDetail.map.save')}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 地图操作按钮 */}
      <div className="mt-4 flex space-x-2">
        <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          <Navigation className="h-4 w-4" />
          <span>{t('cityDetail.map.navigate')}</span>
        </button>
        <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
          <MapPin className="h-4 w-4" />
          <span>{t('cityDetail.map.saveLocation')}</span>
        </button>
      </div>
    </div>
  )
}
