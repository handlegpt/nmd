'use client'

import { useState } from 'react'
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Star, 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  Share2, 
  RotateCcw,
  Plane,
  Building,
  Wifi,
  Users,
  Shield,
  TrendingUp
} from 'lucide-react'

interface NomadResultsDisplayProps {
  planData: any
  onReset: () => void
}

export default function NomadResultsDisplay({ planData, onReset }: NomadResultsDisplayProps) {
  const [selectedRoute, setSelectedRoute] = useState(0)
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'visa' | 'cost'>('overview')

  const route = planData.routes[selectedRoute]

  // 获取风险等级颜色
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // 获取风险等级图标
  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="h-4 w-4" />
      case 'medium': return <AlertTriangle className="h-4 w-4" />
      case 'high': return <AlertTriangle className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <div className="p-4 md:p-8">
      {/* 头部信息 */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              {planData.title}
            </h2>
            <p className="text-sm md:text-base text-gray-600">
              基于你的偏好生成的个性化数字游民路线规划
            </p>
          </div>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3">
            <button
              onClick={onReset}
              className="flex items-center justify-center space-x-2 px-4 py-3 md:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base touch-manipulation"
            >
              <RotateCcw className="h-4 w-4" />
              <span>重新规划</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Share2 className="h-4 w-4" />
              <span>分享</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="h-4 w-4" />
              <span>导出PDF</span>
            </button>
          </div>
        </div>

        {/* 总体统计 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">总预算</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              ${route.totalCost.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">总时长</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {Math.round(route.totalDuration / 30)} 个月
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">城市数量</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {route.cities.length}
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">推荐指数</span>
            </div>
            <div className="text-2xl font-bold text-yellow-900">
              {route.score}/100
            </div>
          </div>
        </div>
      </div>

      {/* 路线选择 */}
      {planData.routes.length > 1 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">选择路线方案</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {planData.routes.map((routeOption: any, index: number) => (
              <button
                key={routeOption.id}
                onClick={() => setSelectedRoute(index)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedRoute === index
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {routeOption.name}
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>${routeOption.totalCost.toLocaleString()}</div>
                    <div>{Math.round(routeOption.totalDuration / 30)} 个月</div>
                    <div className="flex items-center justify-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span>{routeOption.score}/100</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 标签页导航 */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: '路线概览', icon: MapPin },
              { id: 'details', label: '详细信息', icon: Building },
              { id: 'visa', label: '签证策略', icon: Shield },
              { id: 'cost', label: '成本分析', icon: DollarSign }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 标签页内容 */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 路线地图 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">路线地图</h3>
              <div className="flex items-center space-x-4 overflow-x-auto">
                {route.cities.map((city: any, index: number) => (
                  <div key={city.city} className="flex items-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2">
                        {index + 1}
                      </div>
                      <div className="text-sm font-medium text-gray-900">{city.city}</div>
                      <div className="text-xs text-gray-500">{city.country}</div>
                      <div className="text-xs text-gray-500">{city.stayDuration} 天</div>
                    </div>
                    {index < route.cities.length - 1 && (
                      <div className="mx-4 flex items-center">
                        <Plane className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 路线亮点 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  优势
                </h4>
                <ul className="space-y-2">
                  {route.pros.map((pro: string, index: number) => (
                    <li key={index} className="text-sm text-green-700 flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  注意事项
                </h4>
                <ul className="space-y-2">
                  {route.cons.map((con: string, index: number) => (
                    <li key={index} className="text-sm text-yellow-700 flex items-start">
                      <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 风险评估 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">风险评估</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(route.riskAssessment.categories).map(([category, data]: [string, any]) => (
                  <div key={category} className="text-center">
                    <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(data.level)}`}>
                      {getRiskIcon(data.level)}
                      <span className="capitalize">{category}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 capitalize">{data.level}</div>
                  </div>
                ))}
              </div>
              
              {route.riskAssessment.mitigation.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">风险缓解建议</h4>
                  <ul className="space-y-1">
                    {route.riskAssessment.mitigation.map((mitigation: string, index: number) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-green-500" />
                        {mitigation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-6">
            {route.cities.map((city: any, index: number) => (
              <div key={city.city} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {city.city}, {city.country}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {city.stayDuration} 天
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        ${city.estimatedCost.toLocaleString()}
                      </span>
                      <span className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                        {city.score}/100
                      </span>
                    </div>
                  </div>
                </div>

                {/* 城市亮点 */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">推荐理由</h4>
                  <div className="flex flex-wrap gap-2">
                    {city.reasons.map((reason: string, reasonIndex: number) => (
                      <span key={reasonIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 生活成本详情 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">住宿</div>
                    <div className="font-semibold">${city.cost.accommodation.monthly}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">餐饮</div>
                    <div className="font-semibold">${city.cost.food.monthly}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">交通</div>
                    <div className="font-semibold">${city.cost.transport.monthly}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">联合办公</div>
                    <div className="font-semibold">${city.cost.coworking.monthly}</div>
                  </div>
                </div>

                {/* 签证信息 */}
                {city.visa && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">签证信息</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">签证类型：</span>
                        <span className="font-medium">{city.visa.visaName}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">有效期：</span>
                        <span className="font-medium">{city.visa.durationMonths} 个月</span>
                      </div>
                      <div>
                        <span className="text-blue-700">申请费用：</span>
                        <span className="font-medium">${city.visa.costUSD}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">收入要求：</span>
                        <span className="font-medium">${city.visa.incomeRequirementUSD}/月</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* POI推荐 */}
                {city.pois.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">推荐地点</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {city.pois.slice(0, 4).map((poi: any, poiIndex: number) => (
                        <div key={poiIndex} className="flex items-center space-x-2 text-sm">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>{poi.name}</span>
                          <span className="text-gray-500">({poi.type})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'visa' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">签证申请策略</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900">${route.visaStrategy.totalCost}</div>
                  <div className="text-sm text-blue-700">总签证费用</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900">{route.visaStrategy.totalTime}</div>
                  <div className="text-sm text-blue-700">最长申请时间 (天)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900">{route.visaStrategy.requiredVisas.length}</div>
                  <div className="text-sm text-blue-700">需要申请的签证</div>
                </div>
              </div>

              <div className="space-y-4">
                {route.visaStrategy.requiredVisas.map((visa: any, index: number) => (
                  <div key={index} className="bg-white border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{visa.visaName}</h4>
                        <p className="text-sm text-gray-600">{visa.country}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">${visa.costUSD}</div>
                        <div className="text-sm text-gray-600">{visa.applicationTimeDays} 天</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {route.visaStrategy.risks.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-blue-900 mb-2">签证风险提示</h4>
                  <ul className="space-y-1">
                    {route.visaStrategy.risks.map((risk: string, index: number) => (
                      <li key={index} className="text-sm text-blue-700 flex items-start">
                        <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'cost' && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">详细成本分析</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">月度成本分解</h4>
                  <div className="space-y-3">
                    {route.cities.map((city: any, index: number) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-2">{city.city}</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span>住宿：</span>
                            <span className="font-medium">${city.cost.accommodation.monthly}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>餐饮：</span>
                            <span className="font-medium">${city.cost.food.monthly}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>交通：</span>
                            <span className="font-medium">${city.cost.transport.monthly}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>联合办公：</span>
                            <span className="font-medium">${city.cost.coworking.monthly}</span>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="flex justify-between font-semibold">
                            <span>总计：</span>
                            <span>${city.cost.total.monthly}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">总成本概览</h4>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span>生活成本总计：</span>
                      <span className="font-semibold">${route.totalCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>签证费用：</span>
                      <span className="font-semibold">${route.visaStrategy.totalCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>其他费用 (10%)：</span>
                      <span className="font-semibold">${Math.round(route.totalCost * 0.1).toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between text-lg font-bold">
                        <span>总预算：</span>
                        <span>${(route.totalCost + route.visaStrategy.totalCost + Math.round(route.totalCost * 0.1)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h5 className="font-medium text-yellow-800 mb-2">省钱建议</h5>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• 选择淡季出行可节省20-30%住宿费用</li>
                      <li>• 使用当地交通工具可节省交通成本</li>
                      <li>• 选择当地美食可降低餐饮费用</li>
                      <li>• 提前预订联合办公空间享受折扣</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
