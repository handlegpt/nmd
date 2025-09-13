'use client'

import { useState, useEffect } from 'react'
import { SparklesIcon, MapPinIcon, StarIcon, FilterIcon, Route, Globe, Clock } from 'lucide-react'
import { getCities } from '@/lib/api'
import { City } from '@/lib/supabase'
import { useTranslation } from '@/hooks/useTranslation'
import { NomadRoute, NomadRouteService, UserPreferences } from '@/lib/nomadRouteService'
import NomadRouteResult from './NomadRouteResult'
import RealTimeDataCard from './RealTimeDataCard'

interface Preference {
  id: string
  label: string
  weight: number
}

interface ScoredCity extends City {
  score: number
}

export default function NomadAgent() {
  const { t } = useTranslation()
  
  const [cities, setCities] = useState<City[]>([])
  const [userPreferences, setUserPreferences] = useState<Preference[]>([])
  const [recommendations, setRecommendations] = useState<ScoredCity[]>([])
  const [loading, setLoading] = useState(false)
  const [generatedRoute, setGeneratedRoute] = useState<NomadRoute | null>(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<UserPreferences>({
    nationality: 'CN',
    budget: 2000,
    duration: 6,
    interests: ['culture', 'nature'],
    visaPreference: 'easy',
    climatePreference: 'warm',
    socialPreference: 'medium'
  })

  useEffect(() => {
    fetchCities()
  }, [])

  useEffect(() => {
    // Initialize preferences with translated labels
    const preferences: Preference[] = [
      { id: 'wifi', label: t('preferences.wifiQuality'), weight: 20 },
      { id: 'cost', label: t('preferences.costOfLiving'), weight: 25 },
      { id: 'climate', label: t('preferences.climateComfort'), weight: 20 },
      { id: 'social', label: t('preferences.socialAtmosphere'), weight: 15 },
      { id: 'visa', label: t('preferences.visaConvenience'), weight: 20 }
    ]
    setUserPreferences(preferences)
  }, [t])

  const fetchCities = async () => {
    try {
      const data = await getCities()
      setCities(data)
    } catch (error) {
      console.error('Error fetching cities:', error)
    }
  }

  const handlePreferenceChange = (id: string, weight: number) => {
    setUserPreferences(prev => 
      prev.map(pref => 
        pref.id === id ? { ...pref, weight } : pref
      )
    )
  }

  const applyPreset = (preset: string) => {
    const presets = {
      'budget': [
        { id: 'wifi', weight: 15 },
        { id: 'cost', weight: 40 },
        { id: 'climate', weight: 20 },
        { id: 'social', weight: 15 },
        { id: 'visa', weight: 10 }
      ],
      'digital': [
        { id: 'wifi', weight: 35 },
        { id: 'cost', weight: 20 },
        { id: 'climate', weight: 15 },
        { id: 'social', weight: 20 },
        { id: 'visa', weight: 10 }
      ],
      'social': [
        { id: 'wifi', weight: 15 },
        { id: 'cost', weight: 20 },
        { id: 'climate', weight: 20 },
        { id: 'social', weight: 35 },
        { id: 'visa', weight: 10 }
      ],
      'balanced': [
        { id: 'wifi', weight: 20 },
        { id: 'cost', weight: 25 },
        { id: 'climate', weight: 20 },
        { id: 'social', weight: 15 },
        { id: 'visa', weight: 20 }
      ]
    }
    
    const selectedPreset = presets[preset as keyof typeof presets]
    if (selectedPreset) {
      setUserPreferences(prev => 
        prev.map(pref => {
          const presetItem = selectedPreset.find(p => p.id === pref.id)
          return presetItem ? { ...pref, weight: presetItem.weight } : pref
        })
      )
    }
  }

  const generateRecommendations = () => {
    setLoading(true)
    
    // Enhanced AI recommendation algorithm
    setTimeout(() => {
      const scoredCities: ScoredCity[] = cities.map(city => {
        let score = 0
        let totalWeight = 0
        
        // WiFi rating (0-100 scale)
        const wifiWeight = userPreferences.find(p => p.id === 'wifi')?.weight || 0
        if (wifiWeight > 0) {
          const wifiScore = Math.min(100, (city.wifi_speed || 50) * 2) // Scale up WiFi speed
          score += wifiScore * wifiWeight
          totalWeight += wifiWeight
        }
        
        // Cost rating (lower cost = higher score, 0-100 scale)
        const costWeight = userPreferences.find(p => p.id === 'cost')?.weight || 0
        if (costWeight > 0) {
          const maxCost = 3000 // Maximum expected cost
          const costScore = Math.max(0, Math.min(100, (maxCost - (city.cost_of_living || 1500)) / maxCost * 100))
          score += costScore * costWeight
          totalWeight += costWeight
        }
        
        // Climate rating (based on latitude and timezone)
        const climateWeight = userPreferences.find(p => p.id === 'climate')?.weight || 0
        if (climateWeight > 0) {
          const absLat = Math.abs(city.latitude || 0)
          let climateScore = 0
          if (absLat < 23.5) climateScore = 90 // Tropical
          else if (absLat < 35) climateScore = 80 // Subtropical
          else if (absLat < 50) climateScore = 70 // Temperate
          else climateScore = 40 // Cold
          score += climateScore * climateWeight
          totalWeight += climateWeight
        }
        
        // Social atmosphere (based on visa type and cost)
        const socialWeight = userPreferences.find(p => p.id === 'social')?.weight || 0
        if (socialWeight > 0) {
          let socialScore = 50 // Base score
          if (city.visa_type?.includes('Digital Nomad')) socialScore += 30
          if (city.visa_type?.includes('Visa Free')) socialScore += 20
          if (city.cost_of_living && city.cost_of_living < 1500) socialScore += 20
          socialScore = Math.min(100, socialScore)
          score += socialScore * socialWeight
          totalWeight += socialWeight
        }
        
        // Visa convenience (0-100 scale)
        const visaWeight = userPreferences.find(p => p.id === 'visa')?.weight || 0
        if (visaWeight > 0) {
          let visaScore = 0
          if (city.visa_type?.includes('Visa Free')) visaScore = 100
          else if (city.visa_type?.includes('Digital Nomad')) visaScore = 90
          else if (city.visa_days && city.visa_days >= 180) visaScore = 80
          else if (city.visa_days && city.visa_days >= 90) visaScore = 60
          else if (city.visa_days && city.visa_days >= 30) visaScore = 40
          else visaScore = 20
          score += visaScore * visaWeight
          totalWeight += visaWeight
        }
        
        // Calculate final weighted score
        const finalScore = totalWeight > 0 ? score / totalWeight : 0
        
        return { ...city, score: Math.round(finalScore) }
      })
      
      const sortedCities = scoredCities
        .filter(city => city.score > 0) // Only show cities with positive scores
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
      
      setRecommendations(sortedCities)
      setLoading(false)
    }, 1000)
  }

  const getCountryFlag = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }

  const getPreferenceIcon = (id: string) => {
    const icons: { [key: string]: string } = {
      'wifi': '📶',
      'cost': '💲',
      'climate': '🌤',
      'social': '🎉',
      'visa': '🛂'
    }
    return icons[id] || '⚙️'
  }

  // 生成数字游民路线
  const generateNomadRoute = async (selectedCity: ScoredCity) => {
    setRouteLoading(true)
    
    try {
      // 选择相关城市
      const selectedCities = [selectedCity, ...recommendations.filter(city => city.id !== selectedCity.id).slice(0, 2)]
      
      // 生成路线
      const route = await NomadRouteService.generateRoute(userProfile, selectedCities)
      setGeneratedRoute(route)
      
      // 滚动到结果区域
      setTimeout(() => {
        const resultElement = document.getElementById('route-result')
        if (resultElement) {
          resultElement.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
      
    } catch (error) {
      console.error('Error generating route:', error)
      alert('生成路线时出现错误，请稍后重试')
    } finally {
      setRouteLoading(false)
    }
  }

  // 生成签证策略
  const generateVisaStrategy = (city: ScoredCity) => {
    if (city.visa_type?.includes('Visa Free')) {
      return '免签入境，可停留90天'
    } else if (city.visa_type?.includes('Digital Nomad')) {
      return '申请数字游民签证，可停留12个月'
    } else {
      return '需要申请旅游签证，建议提前1个月申请'
    }
  }

  // 生成路线亮点
  const generateRouteHighlights = (city: ScoredCity) => {
    const highlights = []
    if (city.wifi_speed && city.wifi_speed > 50) {
      highlights.push('高速网络环境')
    }
    if (city.cost_of_living && city.cost_of_living < 2000) {
      highlights.push('生活成本较低')
    }
    if (city.visa_type?.includes('Visa Free')) {
      highlights.push('免签便利')
    }
    return highlights.join('、')
  }

  return (
    <div className="space-y-8">
      {/* User Profile Settings */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Globe className="h-5 w-5 mr-2" />
          个人信息设置
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">国籍</label>
            <select
              value={userProfile.nationality}
              onChange={(e) => setUserProfile(prev => ({ ...prev, nationality: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="CN">中国</option>
              <option value="US">美国</option>
              <option value="EU">欧盟</option>
              <option value="UK">英国</option>
              <option value="AU">澳大利亚</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">月预算 (USD)</label>
            <input
              type="number"
              value={userProfile.budget}
              onChange={(e) => setUserProfile(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="500"
              max="10000"
              step="100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">计划时长 (月)</label>
            <input
              type="number"
              value={userProfile.duration}
              onChange={(e) => setUserProfile(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              max="24"
            />
          </div>
        </div>
      </div>

      {/* Main Nomad Agent Interface */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        {/* Enhanced Header with Description */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <SparklesIcon className="h-6 w-6 text-purple-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">AI智能推荐</h2>
          </div>
          <p className="text-gray-600 mb-4">基于你的偏好和预算，AI为你推荐最适合的数字游民城市</p>
          
          {/* Algorithm Explanation with Info Icon */}
          <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
            <div className="text-blue-500 mt-0.5">ℹ️</div>
            <p className="text-sm text-blue-700">我们的AI算法会综合考虑成本、签证、网络、气候等因素，为你找到最匹配的城市</p>
          </div>
        </div>

      {/* Preferences */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <FilterIcon className="h-4 w-4 mr-2" />
          {t('recommendations.preferences')}
        </h3>
        
        {/* Enhanced Preset Options with Icons and Descriptions */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">{t('recommendations.quickPresets')}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => applyPreset('budget')}
              className="p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-all duration-200 hover:scale-105 text-center group"
            >
              <div className="text-2xl mb-2">💰</div>
              <div className="font-medium text-green-800 text-sm">{t('recommendations.presets.budget')}</div>
              <div className="text-xs text-green-600 mt-1">{t('recommendations.presetDescriptions.budget')}</div>
            </button>
            <button
              onClick={() => applyPreset('digital')}
              className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all duration-200 hover:scale-105 text-center group"
            >
              <div className="text-2xl mb-2">💻</div>
              <div className="font-medium text-blue-800 text-sm">{t('recommendations.presets.digital')}</div>
              <div className="text-xs text-blue-600 mt-1">{t('recommendations.presetDescriptions.digital')}</div>
            </button>
            <button
              onClick={() => applyPreset('social')}
              className="p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-all duration-200 hover:scale-105 text-center group"
            >
              <div className="text-2xl mb-2">🎉</div>
              <div className="font-medium text-purple-800 text-sm">{t('recommendations.presets.social')}</div>
              <div className="text-xs text-purple-600 mt-1">{t('recommendations.presetDescriptions.social')}</div>
            </button>
            <button
              onClick={() => applyPreset('balanced')}
              className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all duration-200 hover:scale-105 text-center group"
            >
              <div className="text-2xl mb-2">⚖️</div>
              <div className="font-medium text-gray-800 text-sm">{t('recommendations.presets.balanced')}</div>
              <div className="text-xs text-gray-600 mt-1">{t('recommendations.presetDescriptions.balanced')}</div>
            </button>
          </div>
        </div>
        
        {/* Enhanced Sliders with Priority Indicators */}
        <div className="space-y-6">
          {userPreferences.map((preference) => {
            const getPriorityLevel = (weight: number) => {
              if (weight >= 30) return { level: 'high', color: 'text-red-600', bgColor: 'bg-red-100', dots: '●●●●●' }
              if (weight >= 20) return { level: 'medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100', dots: '●●●○○' }
              return { level: 'low', color: 'text-green-600', bgColor: 'bg-green-100', dots: '●●○○○' }
            }
            
            const priority = getPriorityLevel(preference.weight)
            
            return (
              <div key={preference.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getPreferenceIcon(preference.id)}</span>
                    <span className="text-sm font-medium text-gray-700">{preference.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${priority.bgColor} ${priority.color} font-medium`}>
                      {t(`recommendations.priorityLevels.${priority.level}`)}
                    </span>
                    <span className="text-sm text-gray-500">{preference.weight}%</span>
                  </div>
                </div>
                
                {/* Priority Indicator Dots */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">{t('recommendations.priorityIndicator')}:</span>
                  <span className={`text-lg ${priority.color}`}>{priority.dots}</span>
                </div>
                
                {/* Enhanced Slider */}
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={preference.weight}
                    onChange={(e) => handlePreferenceChange(preference.id, parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #fecaca 0%, #fef3c7 50%, #dcfce7 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Instant Recommendations Preview */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <span className="text-2xl mr-2">🔮</span>
            {t('recommendations.instantRecommendations')}
          </h3>
          <button
            onClick={generateRecommendations}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {loading ? t('recommendations.generating') : t('recommendations.generate')}
          </button>
        </div>
        
        {recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.slice(0, 3).map((city, index) => (
              <div key={city.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {city.name} {getCountryFlag(city.country_code)}
                    </div>
                    <div className="text-sm text-gray-500">{city.country}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-bold text-gray-900">{Math.round(city.score)}/100</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="text-center">
              <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                {t('recommendations.viewMoreRecommendations')} →
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">{t('recommendations.setPreferences')}</p>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">{t('recommendations.recommendedCities')}</h3>
          <div className="space-y-4">
            {recommendations.map((city, index) => (
              <div key={city.id} className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {city.name} {getCountryFlag(city.country_code)}
                      </div>
                      <div className="text-sm text-gray-500">{city.country}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-semibold text-gray-900">{Math.round(city.score)}</span>
                    </div>
                    <div className="text-xs text-gray-500">{t('recommendations.matchScore')}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">{t('recommendations.wifiSpeed')}：</span>
                    <span className="font-medium">{city.wifi_speed || 'N/A'} Mbps</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('recommendations.costOfLiving')}：</span>
                    <span className="font-medium">${city.cost_of_living || 'N/A'}/月</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('recommendations.visaType')}：</span>
                    <span className="font-medium">{city.visa_type}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('recommendations.stayDays')}：</span>
                    <span className="font-medium">{city.visa_days} {t('recommendations.days')}</span>
                  </div>
                </div>
                
                <div className="mt-3 flex space-x-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    {t('recommendations.viewDetails')}
                  </button>
                  <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    {t('recommendations.addToFavorites')}
                  </button>
                </div>
                
                {/* 新增：路线规划按钮 */}
                <div className="mt-3">
                  <button 
                    onClick={() => generateNomadRoute(city)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 text-sm font-medium flex items-center justify-center space-x-2"
                  >
                    <span>🚀</span>
                    <span>生成数字游民路线</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real-time Data for Top Recommendation */}
      {recommendations.length > 0 && (
        <div className="mt-8">
          <RealTimeDataCard 
            city={recommendations[0].name}
            country={recommendations[0].country}
            userCurrency="USD"
          />
        </div>
      )}

      {/* Route Result */}
      {generatedRoute && (
        <div id="route-result" className="mt-8">
          <NomadRouteResult 
            route={generatedRoute}
            onSave={(route) => {
              console.log('Route saved:', route)
            }}
            onShare={(route) => {
              console.log('Route shared:', route)
            }}
            onExport={(route) => {
              console.log('Route exported:', route)
            }}
          />
        </div>
      )}

      </div>
    </div>
  )
}
