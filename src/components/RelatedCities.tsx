'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { 
  Star, 
  Wifi, 
  DollarSign, 
  Calendar,
  ArrowRight,
  TrendingUp,
  Users
} from 'lucide-react'
import Link from 'next/link'

interface RelatedCity {
  id: string
  name: string
  country: string
  country_code: string
  cost_of_living: number
  wifi_speed: number
  visa_days: number
  avg_overall_rating: number
  vote_count: number
  similarity_score: number
  similarity_reason: string
}

interface RelatedCitiesProps {
  currentCity: {
    id: string
    name: string
    country: string
    cost_of_living: number
    wifi_speed: number
    visa_days: number
  }
}

export default function RelatedCities({ currentCity }: RelatedCitiesProps) {
  const { t } = useTranslation()
  const [relatedCities, setRelatedCities] = useState<RelatedCity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRelatedCities = async () => {
      setIsLoading(true)
      
      // 模拟基于相似性算法推荐相关城市
      const mockRelatedCities: RelatedCity[] = [
        {
          id: '2',
          name: 'Lisbon',
          country: 'Portugal',
          country_code: 'PT',
          cost_of_living: 1800,
          wifi_speed: 45,
          visa_days: 90,
          avg_overall_rating: 4.3,
          vote_count: 156,
          similarity_score: 0.85,
          similarity_reason: 'Similar cost of living and visa duration'
        },
        {
          id: '3',
          name: 'Barcelona',
          country: 'Spain',
          country_code: 'ES',
          cost_of_living: 2200,
          wifi_speed: 60,
          visa_days: 90,
          avg_overall_rating: 4.1,
          vote_count: 203,
          similarity_score: 0.78,
          similarity_reason: 'Similar WiFi speed and European location'
        },
        {
          id: '4',
          name: 'Bangkok',
          country: 'Thailand',
          country_code: 'TH',
          cost_of_living: 1200,
          wifi_speed: 35,
          visa_days: 30,
          avg_overall_rating: 4.2,
          vote_count: 189,
          similarity_score: 0.72,
          similarity_reason: 'Popular nomad destination with good community'
        },
        {
          id: '5',
          name: 'Mexico City',
          country: 'Mexico',
          country_code: 'MX',
          cost_of_living: 1500,
          wifi_speed: 40,
          visa_days: 180,
          avg_overall_rating: 4.0,
          vote_count: 134,
          similarity_score: 0.68,
          similarity_reason: 'Similar cost range and long-term visa options'
        }
      ]
      
      setRelatedCities(mockRelatedCities)
      setIsLoading(false)
    }

    fetchRelatedCities()
  }, [currentCity.id])

  const getCountryFlag = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }

  const getCostLevel = (cost: number) => {
    if (cost < 1000) return { level: 'budget', color: 'text-green-600' }
    if (cost < 2000) return { level: 'affordable', color: 'text-blue-600' }
    if (cost < 3500) return { level: 'moderate', color: 'text-yellow-600' }
    return { level: 'expensive', color: 'text-red-600' }
  }

  const getWifiLevel = (speed: number) => {
    if (speed >= 100) return { level: 'excellent', color: 'text-green-600' }
    if (speed >= 50) return { level: 'good', color: 'text-blue-600' }
    if (speed >= 25) return { level: 'fair', color: 'text-yellow-600' }
    return { level: 'poor', color: 'text-red-600' }
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {t('cityDetail.relatedCities.title')}
        </h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('cityDetail.relatedCities.title')}
        </h3>
        <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
          <TrendingUp className="h-4 w-4" />
          <span>{t('cityDetail.relatedCities.basedOnSimilarity')}</span>
        </div>
      </div>

      <div className="space-y-4">
        {relatedCities.map((city) => {
          const costLevel = getCostLevel(city.cost_of_living)
          const wifiLevel = getWifiLevel(city.wifi_speed)
          
          return (
            <Link
              key={city.id}
              href={`/nomadcities/${city.country.toLowerCase().replace(/\s+/g, '-')}/${city.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="block p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{getCountryFlag(city.country_code)}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {city.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{city.country}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {city.similarity_reason}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-1 mb-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {city.avg_overall_rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        ({city.vote_count})
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-600 dark:text-gray-400">
                      <span className={`flex items-center space-x-1 ${costLevel.color}`}>
                        <DollarSign className="h-3 w-3" />
                        <span>${city.cost_of_living}</span>
                      </span>
                      <span className={`flex items-center space-x-1 ${wifiLevel.color}`}>
                        <Wifi className="h-3 w-3" />
                        <span>{city.wifi_speed}Mbps</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{city.visa_days}d</span>
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <Link
          href="/nomadcities"
          className="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <span>{t('cityDetail.relatedCities.exploreAllCities')}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
