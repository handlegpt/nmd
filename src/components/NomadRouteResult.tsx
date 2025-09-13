'use client'

import { useState } from 'react'
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Plane, 
  Clock, 
  Star,
  Download,
  Share2,
  Heart,
  AlertTriangle,
  CheckCircle,
  Route,
  Cloud,
  Users,
  TrendingUp
} from 'lucide-react'
import { NomadRoute, NomadRouteService } from '@/lib/nomadRouteService'
import CostComparisonChart from './charts/CostComparisonChart'
import WeatherForecastChart from './charts/WeatherForecastChart'
import CommunityAnalyticsChart from './charts/CommunityAnalyticsChart'
import TrendAnalysisChart from './charts/TrendAnalysisChart'
import { ChartDataService } from '@/lib/chartDataService'

interface NomadRouteResultProps {
  route: NomadRoute
  onSave?: (route: NomadRoute) => void
  onShare?: (route: NomadRoute) => void
  onExport?: (route: NomadRoute) => void
}

export default function NomadRouteResult({ 
  route, 
  onSave, 
  onShare, 
  onExport 
}: NomadRouteResultProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'visa' | 'cities' | 'tips' | 'analytics'>('overview')

  const handleSave = () => {
    NomadRouteService.saveRoute(route)
    setIsSaved(true)
    onSave?.(route)
  }

  const handleShare = () => {
    const shareData = {
      title: route.title,
      text: route.description,
      url: window.location.href
    }
    
    if (navigator.share) {
      navigator.share(shareData)
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${route.title}\n${route.description}\n${window.location.href}`)
      alert('路线信息已复制到剪贴板！')
    }
    
    onShare?.(route)
  }

  const handleExport = () => {
    const exportData = {
      title: route.title,
      description: route.description,
      totalDuration: route.totalDuration,
      totalCost: route.totalCost,
      cities: route.cities,
      visaStrategy: route.visaStrategy,
      highlights: route.highlights,
      recommendations: route.recommendations
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${route.title.replace(/\s+/g, '_')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    onExport?.(route)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{route.title}</h2>
            <p className="text-blue-100 mb-4">{route.description}</p>
            
            {/* Key Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">{route.totalDuration} 个月</span>
                </div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm font-medium">${route.totalCost.toLocaleString()}</span>
                </div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">{route.cities.length} 个城市</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col space-y-2 ml-4">
            <button
              onClick={handleSave}
              className={`p-2 rounded-lg transition-colors ${
                isSaved 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
              title={isSaved ? '已保存' : '保存路线'}
            >
              <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
              title="分享路线"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleExport}
              className="p-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
              title="导出路线"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: '概览', icon: <Route className="h-4 w-4" /> },
            { id: 'visa', label: '签证策略', icon: <Plane className="h-4 w-4" /> },
            { id: 'cities', label: '城市详情', icon: <MapPin className="h-4 w-4" /> },
            { id: 'analytics', label: '数据分析', icon: <TrendingUp className="h-4 w-4" /> },
            { id: 'tips', label: '实用建议', icon: <Star className="h-4 w-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Highlights */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">路线亮点</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {route.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Route Timeline */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">路线时间线</h3>
              <div className="space-y-3">
                {route.cities.map((city, index) => (
                  <div key={city.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{city.name}, {city.country}</div>
                      <div className="text-sm text-gray-500">{city.duration} 天 • ${city.cost}/月</div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {city.visaType}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'visa' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">签证策略</h3>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-900">{route.visaStrategy.strategy}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">申请要求</h3>
              <ul className="space-y-2">
                {route.visaStrategy.requirements.map((req, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">申请时间线</h3>
              <div className="space-y-2">
                {route.visaStrategy.timeline.map((step, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {route.visaStrategy.risks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">风险提示</h3>
                <div className="space-y-2">
                  {route.visaStrategy.risks.map((risk, index) => (
                    <div key={index} className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-yellow-800">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'cities' && (
          <div className="space-y-6">
            {route.cities.map((city, index) => (
              <div key={city.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{city.name}, {city.country}</h3>
                    <p className="text-sm text-gray-500">{city.duration} 天 • ${city.cost}/月</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{city.visaType}</div>
                    <div className="text-xs text-gray-500">{city.visaDays} 天</div>
                  </div>
                </div>
                
                {/* 实时数据展示 */}
                {(city.weather || city.costOfLiving || city.community) && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">实时数据</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {city.weather && (
                        <div className="flex items-center space-x-2">
                          <Cloud className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-gray-600">
                            {city.weather.temperature}°C • {city.weather.condition}
                          </span>
                        </div>
                      )}
                      {city.costOfLiving && (
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-gray-600">
                            食物 ${city.costOfLiving.categories.food}/月
                          </span>
                        </div>
                      )}
                      {city.community && (
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-purple-600" />
                          <span className="text-sm text-gray-600">
                            {city.community.communitySize} 数字游民
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">城市亮点</h4>
                  <div className="flex flex-wrap gap-2">
                    {city.highlights.map((highlight, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Cost Comparison Chart */}
            <div>
              <CostComparisonChart 
                data={ChartDataService.generateCostData(
                  route.cities.map(city => ({ name: city.name, country: city.country }))
                )}
                userCurrency="USD"
                showTrends={true}
              />
            </div>

            {/* Weather Forecast for First City */}
            {route.cities.length > 0 && (
              <div>
                <WeatherForecastChart 
                  data={ChartDataService.generateWeatherData(route.cities[0].name, route.cities[0].country)}
                  city={route.cities[0].name}
                  country={route.cities[0].country}
                />
              </div>
            )}

            {/* Community Analytics */}
            <div>
              <CommunityAnalyticsChart 
                data={ChartDataService.generateCommunityData(
                  route.cities.map(city => ({ name: city.name, country: city.country }))
                )}
              />
            </div>

            {/* Trend Analysis for First City */}
            {route.cities.length > 0 && (
              <div>
                <TrendAnalysisChart 
                  data={ChartDataService.generateTrendData(route.cities[0].name, route.cities[0].country)}
                  city={route.cities[0].name}
                  country={route.cities[0].country}
                  metrics={['cost', 'community', 'events']}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'tips' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">实用建议</h3>
              <div className="space-y-3">
                {route.recommendations.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
