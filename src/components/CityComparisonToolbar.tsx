'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { 
  BarChart3, 
  X, 
  ArrowRight,
  Globe,
  Users,
  Coffee
} from 'lucide-react'

interface CityComparisonToolbarProps {
  selectedCities: Array<{
    id: string
    name: string
    country: string
    flag: string
  }>
  onRemoveCity: (cityId: string) => void
  onClearAll: () => void
  onCompare: () => void
  maxCities?: number
}

export default function CityComparisonToolbar({
  selectedCities,
  onRemoveCity,
  onClearAll,
  onCompare,
  maxCities = 6
}: CityComparisonToolbarProps) {
  const { t } = useTranslation()

  if (selectedCities.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-blue-500 shadow-2xl p-4 min-w-[400px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900 dark:text-white">
              {t('cityComparison.toolTitle')}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedCities.length}/{maxCities}
            </span>
          </div>
          
          <button
            onClick={onClearAll}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="清除所有选择"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Cities */}
        <div className="flex items-center space-x-2 mb-3">
          {selectedCities.map((city) => (
            <div
              key={city.id}
              className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg px-3 py-2 border border-blue-200 dark:border-blue-700"
            >
              <span className="text-lg">{city.flag}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {city.name}
              </span>
              <button
                onClick={() => onRemoveCity(city.id)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Globe className="w-4 h-4" />
              <span>{t('cityComparison.regionDistribution')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{t('cityComparison.nomadCount')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Coffee className="w-4 h-4" />
              <span>{t('cityComparison.activityComparison')}</span>
            </div>
          </div>
          
          <button
            onClick={onCompare}
            disabled={selectedCities.length < 2}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              selectedCities.length >= 2
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{t('cityComparison.compareCities', { count: selectedCities.length.toString() })}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(selectedCities.length / maxCities) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1 text-center">
            {selectedCities.length < 2 
              ? t('cityComparison.selectAtLeast2Cities') 
              : selectedCities.length === maxCities 
                ? t('cityComparison.maxCitiesReached') 
                : t('cityComparison.canSelectMoreCities', { remaining: (maxCities - selectedCities.length).toString() })
            }
          </div>
        </div>
      </div>
    </div>
  )
}
