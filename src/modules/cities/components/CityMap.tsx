import React from 'react'
import { City } from '@/types/city'
import { useMobile } from '@/hooks/useResponsive'

interface CityMapProps {
  cities: City[]
  onCityClick?: (city: City) => void
  className?: string
}

export default function CityMap({ cities, onCityClick, className = '' }: CityMapProps) {
  const { isMobile } = useMobile()

  // 这是一个简化的地图组件，实际项目中应该集成真实的地图库
  return (
    <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="text-center py-8">
        <div className="text-gray-500 dark:text-gray-400 mb-2">
          🗺️ 地图视图
        </div>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          {isMobile ? '移动端地图组件' : '桌面端地图组件'}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          显示 {cities.length} 个城市
        </p>
      </div>
      
      {/* 城市列表预览 */}
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {cities.slice(0, 5).map((city) => (
          <div
            key={city.id}
            onClick={() => onCityClick?.(city)}
            className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {city.name}, {city.country}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {city.coordinates.lat.toFixed(2)}, {city.coordinates.lng.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
