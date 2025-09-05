import React from 'react'
import { City } from '@/types/city'
import { useMobile } from '@/hooks/useResponsive'
import { Star, Users, MapPin, TrendingUp } from 'lucide-react'

interface CityStatsProps {
  cities: City[]
  className?: string
}

export default function CityStats({ cities, className = '' }: CityStatsProps) {
  const { isMobile } = useMobile()

  // 计算统计数据
  const stats = {
    totalCities: cities.length,
    averageRating: cities.length > 0 
      ? cities.reduce((sum, city) => sum + city.overall_rating, 0) / cities.length 
      : 0,
    totalReviews: cities.reduce((sum, city) => sum + city.total_reviews, 0),
    totalVotes: cities.reduce((sum, city) => sum + city.total_votes, 0),
    topRatedCity: cities.length > 0 
      ? cities.reduce((top, city) => city.overall_rating > top.overall_rating ? city : top)
      : null
  }

  const statItems = [
    {
      label: '城市总数',
      value: stats.totalCities,
      icon: <MapPin className="h-5 w-5" />,
      color: 'text-blue-600'
    },
    {
      label: '平均评分',
      value: stats.averageRating.toFixed(1),
      icon: <Star className="h-5 w-5" />,
      color: 'text-yellow-600'
    },
    {
      label: '总评价数',
      value: stats.totalReviews,
      icon: <Users className="h-5 w-5" />,
      color: 'text-green-600'
    },
    {
      label: '总投票数',
      value: stats.totalVotes,
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-purple-600'
    }
  ]

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 统计卡片 */}
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
        {statItems.map((item) => (
          <div
            key={item.label}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center"
          >
            <div className={`${item.color} mb-2 flex justify-center`}>
              {item.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {item.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* 评分最高的城市 */}
      {stats.topRatedCity && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                🏆 评分最高的城市
              </h4>
              <p className="text-blue-800 dark:text-blue-200">
                {stats.topRatedCity.name}, {stats.topRatedCity.country}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.topRatedCity.overall_rating.toFixed(1)}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                ⭐ 评分
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 城市分布统计 */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
          城市分布统计
        </h4>
        <div className="space-y-2">
          {Object.entries(
            cities.reduce((acc, city) => {
              const country = city.country
              acc[country] = (acc[country] || 0) + 1
              return acc
            }, {} as Record<string, number>)
          )
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([country, count]) => (
              <div key={country} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {country}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(count / cities.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
