import React from 'react'
import { City } from '@/types/city'
import { MobileCard } from '@/components/common/MobileOptimizedCard'
import { Star, MapPin, Wifi, DollarSign } from 'lucide-react'

interface CityCardProps {
  city: City
  onClick?: () => void
  showDetails?: boolean
}

export default function CityCard({ city, onClick, showDetails = false }: CityCardProps) {
  return (
    <MobileCard.Interactive
      onClick={onClick}
      className="cursor-pointer"
    >
      <div className="space-y-3">
        {/* 城市名称和评分 */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {city.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {city.country}
            </p>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {city.overall_rating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* 城市标签 */}
        {city.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {city.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 城市统计 */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{city.total_reviews} 评价</span>
          </div>
          <div className="flex items-center space-x-1">
            <Wifi className="h-4 w-4" />
            <span>WiFi</span>
          </div>
          <div className="flex items-center space-x-1">
            <DollarSign className="h-4 w-4" />
            <span>成本</span>
          </div>
        </div>

        {/* 详细信息（可选） */}
        {showDetails && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">时区:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{city.timezone}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">人口:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {city.population ? `${(city.population / 1000).toFixed(0)}K` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileCard.Interactive>
  )
}
