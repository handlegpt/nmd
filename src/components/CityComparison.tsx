'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  BarChart3, 
  Download, 
  Plus, 
  X, 
  Search, 
  Filter, 
  Star, 
  TrendingUp, 
  TrendingDown,
  Globe,
  Wifi,
  DollarSign,
  Calendar,
  Sun,
  Users,
  Save,
  Share2,
  Settings,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { getCities } from '@/lib/api'
import { City } from '@/lib/supabase'
import FixedLink from './FixedLink'

interface ComparisonMetric {
  key: string
  label: string
  icon: React.ReactNode
  getValue: (city: City) => number
  formatValue: (value: number) => string
  getScore: (value: number) => number
  description: string
  unit: string
}

export default function CityComparison() {
  const { t } = useTranslation()
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [showCitySelector, setShowCitySelector] = useState(false)
  const [cities, setCities] = useState<City[]>([])
  const [filteredCities, setFilteredCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['wifi', 'cost', 'visa', 'climate', 'social'])
  const [showMetricsSelector, setShowMetricsSelector] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table')
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Define filterCities function first using useCallback to fix useEffect dependency issues
  const filterCities = useCallback(() => {
    let filtered = [...cities]
    
    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(city => 
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.country.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // 排序
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'country':
          aValue = a.country
          bValue = b.country
          break
        case 'cost':
          aValue = a.cost_of_living || 0
          bValue = b.cost_of_living || 0
          break
        case 'wifi':
          aValue = a.wifi_speed || 0
          bValue = b.wifi_speed || 0
          break
        case 'visa':
          aValue = a.visa_days || 0
          bValue = b.visa_days || 0
          break
        default:
          aValue = a.name
          bValue = b.name
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
    
    setFilteredCities(filtered)
  }, [cities, searchTerm, sortBy, sortOrder])

  // Get current location and initialize data
  useEffect(() => {
    fetchCities()
  }, [])

  // Update filtered cities when dependencies change
  useEffect(() => {
    filterCities()
  }, [filterCities])

  const fetchCities = async () => {
    try {
      const data = await getCities()
      setCities(data)
    } catch (error) {
      console.error('Error fetching cities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCountryFlag = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }

  const getClimateScore = (latitude: number) => {
    const absLat = Math.abs(latitude)
    if (absLat < 23.5) return 90 // Tropical
    if (absLat < 35) return 80 // Subtropical
    if (absLat < 50) return 70 // Temperate
    return 40 // Cold
  }

  const getSocialScore = (city: City) => {
    let score = 50 // Base score
    if (city.visa_type?.includes('Digital Nomad')) score += 30
    if (city.visa_type?.includes('Visa Free')) score += 20
    if (city.cost_of_living && city.cost_of_living < 1500) score += 20
    return Math.min(100, score)
  }

  const getOverallScore = (city: City) => {
    const wifiScore = city.wifi_speed ? Math.min(100, city.wifi_speed) : 50
    const costScore = city.cost_of_living ? Math.max(0, Math.min(100, (3000 - city.cost_of_living) / 30)) : 50
    const visaScore = city.visa_days ? Math.min(100, city.visa_days / 3.65) : 50
    const climateScore = getClimateScore(city.latitude || 0)
    const socialScore = getSocialScore(city)
    
    return Math.round((wifiScore + costScore + visaScore + climateScore + socialScore) / 5)
  }

  const comparisonMetrics: ComparisonMetric[] = [
    {
      key: 'overall',
      label: '综合评分',
      icon: <Star className="h-4 w-4" />,
      getValue: getOverallScore,
      formatValue: (value) => `${value}/100`,
      getScore: (value) => value,
      description: '基于所有指标的加权平均分',
      unit: '分'
    },
    {
      key: 'wifi',
      label: 'WiFi速度',
      icon: <Wifi className="h-4 w-4" />,
      getValue: (city) => city.wifi_speed || 0,
      formatValue: (value) => `${value} Mbps`,
      getScore: (value) => Math.min(100, value),
      description: '平均WiFi下载速度',
      unit: 'Mbps'
    },
    {
      key: 'cost',
      label: '生活成本',
      icon: <DollarSign className="h-4 w-4" />,
      getValue: (city) => city.cost_of_living || 0,
      formatValue: (value) => `$${value}`,
      getScore: (value) => Math.max(0, Math.min(100, (3000 - value) / 30)),
      description: '月生活成本（美元）',
      unit: '$/月'
    },
    {
      key: 'visa',
      label: '签证便利',
      icon: <Calendar className="h-4 w-4" />,
      getValue: (city) => city.visa_days || 0,
      formatValue: (value) => `${value} 天`,
      getScore: (value) => Math.min(100, value / 3.65),
      description: '可停留天数',
      unit: '天'
    },
    {
      key: 'climate',
      label: '气候舒适',
      icon: <Sun className="h-4 w-4" />,
      getValue: (city) => getClimateScore(city.latitude || 0),
      formatValue: (value) => `${value}/100`,
      getScore: (value) => value,
      description: '基于纬度的气候评分',
      unit: '分'
    },
    {
      key: 'social',
      label: '社交氛围',
      icon: <Users className="h-4 w-4" />,
      getValue: (city) => getSocialScore(city),
      formatValue: (value) => `${value}/100`,
      getScore: (value) => value,
      description: '基于签证类型和成本的社交评分',
      unit: '分'
    }
  ]

  const addCity = (cityId: string) => {
    if (selectedCities.length < 6 && !selectedCities.includes(cityId)) {
      setSelectedCities([...selectedCities, cityId])
    }
    setShowCitySelector(false)
  }

  const removeCity = (cityId: string) => {
    setSelectedCities(selectedCities.filter(id => id !== cityId))
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getTrendIcon = (city: City, metricKey: string) => {
    const metric = comparisonMetrics.find(m => m.key === metricKey)
    if (!metric) return null
    
    const value = metric.getValue(city)
    const score = metric.getScore(value)
    
    if (score >= 80) return <TrendingUp className="h-3 w-3 text-green-500" />
    if (score <= 40) return <TrendingDown className="h-3 w-3 text-red-500" />
    return null
  }

  const toggleMetric = (metricKey: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricKey) 
        ? prev.filter(key => key !== metricKey)
        : [...prev, metricKey]
    )
  }

  const exportComparison = () => {
    // 这里可以实现导出功能
    console.log('Exporting comparison...')
  }

  const saveComparison = () => {
    // 这里可以实现保存功能
    console.log('Saving comparison...')
  }

  const shareComparison = () => {
    // 这里可以实现分享功能
    console.log('Sharing comparison...')
  }

  const loadDefaultExample = () => {
    // Load popular cities for comparison example
    const popularCityIds = cities
      .filter(city => ['Bali', 'Chiang Mai', 'Lisbon'].includes(city.name))
      .slice(0, 3)
      .map(city => city.id)
    
    if (popularCityIds.length >= 2) {
      setSelectedCities(popularCityIds)
    }
  }

  const clearExample = () => {
    setSelectedCities([])
  }

  const selectedCitiesData = selectedCities.map(id => cities.find(c => c.id === id)).filter(Boolean) as City[]
  const visibleMetrics = comparisonMetrics.filter(metric => selectedMetrics.includes(metric.key))

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      {/* Header */}
      <div className="space-y-4 mb-6">
        {/* Title and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="h-6 w-6 mr-2 text-blue-600" />
              {t('cityComparison.title')}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowMetricsSelector(!showMetricsSelector)}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">{t('cityComparison.metricsSelector')}</span>
                {showMetricsSelector ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
              
              {/* Enhanced View Mode Tabs */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-all duration-200 ${
                    viewMode === 'table'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('cityComparison.dataTable')}</span>
                </button>
                <button
                  onClick={() => setViewMode('chart')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-all duration-200 ${
                    viewMode === 'chart'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('cityComparison.chartView')}</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowCitySelector(true)}
              disabled={selectedCities.length >= 6}
              className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              <span>{t('cityComparison.addCity')}</span>
            </button>
            
            {selectedCities.length > 0 && (
              <button
                onClick={clearExample}
                className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">{t('cityComparison.clearExample')}</span>
              </button>
            )}
            
            {selectedCities.length > 0 && (
              <>
                <button
                  onClick={saveComparison}
                  className="flex items-center space-x-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                >
                  <Save className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('cityComparison.saveComparison')}</span>
                </button>
                
                {/* Enhanced Export and Share Section */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={exportComparison}
                    className="flex items-center space-x-1 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('cityComparison.exportChart')}</span>
                  </button>
                  <button
                    onClick={shareComparison}
                    className="flex items-center space-x-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('cityComparison.copyShareLink')}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Selector */}
      {showMetricsSelector && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <h3 className="font-medium text-gray-900 mb-3">{t('cityComparison.selectMetrics')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {comparisonMetrics.map(metric => (
              <button
                key={metric.key}
                onClick={() => toggleMetric(metric.key)}
                className={`flex items-center space-x-2 p-2 rounded-lg text-sm transition-colors ${
                  selectedMetrics.includes(metric.key)
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {metric.icon}
                <span>{metric.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">{t('cityComparison.loadingCities')}</p>
        </div>
      ) : selectedCities.length === 0 ? (
        <div className="space-y-8">
          {/* Default Comparison Example */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('cityComparison.defaultExample')}</h3>
              <p className="text-gray-600 mb-4">{t('cityComparison.defaultExampleDescription')}</p>
              
              {/* Example Cities Display */}
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">B</div>
                  <span className="font-medium text-gray-800">Bali</span>
                </div>
                <div className="text-gray-400">vs</div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">C</div>
                  <span className="font-medium text-gray-800">Chiang Mai</span>
                </div>
                <div className="text-gray-400">vs</div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">L</div>
                  <span className="font-medium text-gray-800">Lisbon</span>
                </div>
              </div>
              
              {/* Example Chart Preview */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
                <div className="flex items-center justify-center space-x-8 text-sm">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                      <span className="text-green-600 font-bold">85</span>
                    </div>
                    <div className="text-gray-600">Bali</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                      <span className="text-yellow-600 font-bold">92</span>
                    </div>
                    <div className="text-gray-600">Chiang Mai</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                      <span className="text-blue-600 font-bold">88</span>
                    </div>
                    <div className="text-gray-600">Lisbon</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={() => loadDefaultExample()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {t('cityComparison.startComparing')}
                </button>
                <button
                  onClick={() => setShowCitySelector(true)}
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors font-medium"
                >
                  {t('cityComparison.addCitiesNow')}
                </button>
              </div>
            </div>
          </div>
          

        </div>
      ) : (
        <div className="space-y-6">
          {/* City Headers */}
          <div className={`grid gap-2 sm:gap-4 ${
            selectedCities.length === 2 ? 'grid-cols-2 sm:grid-cols-3' : 
            selectedCities.length === 3 ? 'grid-cols-2 sm:grid-cols-4' :
            selectedCities.length === 4 ? 'grid-cols-2 sm:grid-cols-5' :
            selectedCities.length === 5 ? 'grid-cols-2 sm:grid-cols-6' : 'grid-cols-2 sm:grid-cols-7'
          }`}>
            <div className="font-semibold text-gray-900 flex items-center col-span-2 sm:col-span-1">
              <Globe className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{t('cityComparison.comparisonMetrics')}</span>
              <span className="sm:hidden">指标</span>
            </div>
            {selectedCitiesData.map(city => (
              <div key={city.id} className="relative">
                <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-xl">
                  <div className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{city.name}</div>
                  <div className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                    {getCountryFlag(city.country_code)} {city.country}
                  </div>
                  <div className="text-xs text-gray-400">
                    {t('cityComparison.cityInfo.overallScore')}: {getOverallScore(city)}/100
                  </div>
                </div>
                <button
                  onClick={() => removeCity(city.id)}
                  className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                >
                  <X className="h-2 w-2 sm:h-3 sm:w-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Comparison Rows */}
          {visibleMetrics.map(metric => (
            <div key={metric.key} className={`grid gap-2 sm:gap-4 ${
              selectedCities.length === 2 ? 'grid-cols-2 sm:grid-cols-3' : 
              selectedCities.length === 3 ? 'grid-cols-2 sm:grid-cols-4' :
              selectedCities.length === 4 ? 'grid-cols-2 sm:grid-cols-5' :
              selectedCities.length === 5 ? 'grid-cols-2 sm:grid-cols-6' : 'grid-cols-2 sm:grid-cols-7'
            }`}>
              <div className="flex items-center space-x-2 p-2 sm:p-3 col-span-2 sm:col-span-1">
                <div className="text-gray-500">{metric.icon}</div>
                <div>
                  <div className="font-medium text-gray-900 text-sm sm:text-base">{metric.label}</div>
                  <div className="text-xs text-gray-500 hidden sm:block">{metric.description}</div>
                </div>
              </div>
              {selectedCitiesData.map(city => {
                const value = metric.getValue(city)
                const score = metric.getScore(value)
                const trendIcon = getTrendIcon(city, metric.key)
                
                return (
                  <div key={city.id} className="text-center p-2 sm:p-3">
                    <div className={`inline-flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium ${getScoreColor(score)}`}>
                      <span>{metric.formatValue(value)}</span>
                      {trendIcon}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{metric.unit}</div>
                  </div>
                )
              })}
            </div>
          ))}

          {/* Summary Row */}
          <div className={`grid gap-2 sm:gap-4 ${
            selectedCities.length === 2 ? 'grid-cols-2 sm:grid-cols-3' : 
            selectedCities.length === 3 ? 'grid-cols-2 sm:grid-cols-4' :
            selectedCities.length === 4 ? 'grid-cols-2 sm:grid-cols-5' :
            selectedCities.length === 5 ? 'grid-cols-2 sm:grid-cols-6' : 'grid-cols-2 sm:grid-cols-7'
          }`}>
            <div className="flex items-center space-x-2 p-2 sm:p-3 bg-blue-50 rounded-xl col-span-2 sm:col-span-1">
              <Star className="h-4 w-4 text-blue-600" />
              <div>
                <div className="font-semibold text-blue-900 text-sm sm:text-base">{t('cityComparison.overallScoreLabel')}</div>
                <div className="text-xs text-blue-600 hidden sm:block">{t('cityComparison.overallScoreDescription')}</div>
              </div>
            </div>
            {selectedCitiesData.map(city => {
              const overallScore = getOverallScore(city)
              const isTop = selectedCitiesData.every(otherCity => 
                otherCity.id === city.id || getOverallScore(otherCity) <= overallScore
              )
              
              return (
                <div key={city.id} className="text-center p-2 sm:p-3">
                  <div className={`inline-flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium ${
                    isTop ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <span>{overallScore}/100</span>
                    {isTop && <Star className="h-2 w-2 sm:h-3 sm:w-3 fill-current" />}
                  </div>
                  {isTop && (
                    <div className="text-xs text-green-600 mt-1 font-medium">{t('cityComparison.recommended')}</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Enhanced City Selector Modal */}
      {showCitySelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('cityComparison.selectCitiesTitle')}</h3>
              <button
                onClick={() => setShowCitySelector(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Search and Filter */}
            <div className="mb-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t('cityComparison.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">{t('cityComparison.sortBy')}:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="name">{t('cityComparison.sortOptions.name')}</option>
                    <option value="country">{t('cityComparison.sortOptions.country')}</option>
                    <option value="cost">{t('cityComparison.sortOptions.cost')}</option>
                    <option value="wifi">{t('cityComparison.sortOptions.wifi')}</option>
                    <option value="visa">{t('cityComparison.sortOptions.visa')}</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
                
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  <Filter className="h-4 w-4" />
                  <span>{t('cityComparison.advancedFilter')}</span>
                </button>
              </div>
            </div>
            
            {/* Cities List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredCities.map(city => {
                const isSelected = selectedCities.includes(city.id)
                const overallScore = getOverallScore(city)
                
                return (
                  <button
                    key={city.id}
                    onClick={() => addCity(city.id)}
                    disabled={isSelected}
                    className={`w-full p-4 text-left border rounded-xl transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-300 bg-blue-50 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getCountryFlag(city.country_code)}</span>
                        <div>
                          <div className="font-medium text-gray-900">{city.name}</div>
                          <div className="text-sm text-gray-500">{city.country}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{overallScore}/100</div>
                        <div className="text-xs text-gray-500">
                          {t('cityComparison.cityInfo.costPerMonth', { cost: String(city.cost_of_living || 0) })} • {t('cityComparison.cityInfo.wifiSpeed', { speed: String(city.wifi_speed || 0) })}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            
            <div className="mt-4 text-center text-sm text-gray-500">
              {t('cityComparison.selectedCount', { count: String(selectedCities.length) })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
