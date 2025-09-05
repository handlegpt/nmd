'use client'

import { useState } from 'react'
import { 
  BarChart3, 
  X, 
  Check, 
  ArrowRight,
  Users,
  Wifi,
  DollarSign,
  Calendar
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { City } from '@/lib/supabase'
import FixedLink from '@/components/FixedLink'

interface CityComparisonSelectorProps {
  cities: City[]
  onCompare: (selectedCities: City[]) => void
}

export default function CityComparisonSelector({ cities, onCompare }: CityComparisonSelectorProps) {
  const { t } = useTranslation()
  const [selectedCities, setSelectedCities] = useState<City[]>([])
  const [showSelector, setShowSelector] = useState(false)

  const toggleCitySelection = (city: City) => {
    if (selectedCities.find(c => c.id === city.id)) {
      setSelectedCities(selectedCities.filter(c => c.id !== city.id))
    } else if (selectedCities.length < 4) {
      setSelectedCities([...selectedCities, city])
    }
  }

  const clearSelection = () => {
    setSelectedCities([])
  }

  const startComparison = () => {
    if (selectedCities.length >= 2) {
      onCompare(selectedCities)
      setShowSelector(false)
      setSelectedCities([])
    }
  }

  const getCountryFlag = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }

  const getVisaColor = (days: number) => {
    if (days >= 365) return 'text-green-600'
    if (days >= 90) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="mb-6">
      {/* 对比按钮 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowSelector(!showSelector)}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
        >
          <BarChart3 className="h-4 w-4" />
          <span>{t('cityComparison.selectCities')}</span>
          {selectedCities.length > 0 && (
            <span className="bg-white text-blue-600 px-2 py-1 rounded-full text-xs font-bold">
              {selectedCities.length}
            </span>
          )}
        </button>

        {selectedCities.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={clearSelection}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              {t('cityComparison.clear')}
            </button>
            <button
              onClick={startComparison}
              disabled={selectedCities.length < 2}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <span>{t('cityComparison.compare')}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* 已选择的城市 */}
      {selectedCities.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-blue-900 mb-3">
            {t('cityComparison.selectedCities')} ({selectedCities.length}/4)
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedCities.map((city) => (
              <div
                key={city.id}
                className="flex items-center space-x-2 bg-white border border-blue-300 rounded-lg px-3 py-2"
              >
                <span className="text-lg">{getCountryFlag(city.country_code)}</span>
                <span className="font-medium text-blue-900">{city.name}</span>
                <button
                  onClick={() => toggleCitySelection(city)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 城市选择器 */}
      {showSelector && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">
              {t('cityComparison.select2To4Cities')}
            </h4>
            <button
              onClick={() => setShowSelector(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
            {cities.map((city) => {
              const isSelected = selectedCities.find(c => c.id === city.id)
              return (
                <div
                  key={city.id}
                  onClick={() => toggleCitySelection(city)}
                  className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getCountryFlag(city.country_code)}</span>
                      <span className="font-medium text-gray-900">{city.name}</span>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {t('cities.costOfLiving')}
                      </span>
                      <span>${city.cost_of_living}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Wifi className="h-3 w-3 mr-1" />
                        {t('cities.wifiSpeed')}
                      </span>
                      <span>{city.wifi_speed} Mbps</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {t('cities.visaType')}
                      </span>
                      <span className={getVisaColor(city.visa_days)}>
                        {city.visa_days} {t('cities.stayDays')}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {selectedCities.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {t('cityComparison.selectedCount', { count: selectedCities.length.toString() })}
                </span>
                <button
                  onClick={startComparison}
                  disabled={selectedCities.length < 2}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <span>{t('cityComparison.startComparing')}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
