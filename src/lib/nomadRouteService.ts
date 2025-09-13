// Nomad Route Planning Service
export interface NomadRoute {
  id: string
  title: string
  description: string
  totalDuration: number // months
  totalCost: number
  cities: RouteCity[]
  visaStrategy: VisaStrategy
  highlights: string[]
  recommendations: string[]
  createdAt: string
}

export interface RouteCity {
  id: string
  name: string
  country: string
  duration: number // days
  cost: number // monthly
  visaType: string
  visaDays: number
  highlights: string[]
  arrivalDate?: string
  departureDate?: string
}

export interface VisaStrategy {
  strategy: string
  requirements: string[]
  timeline: string[]
  costs: number
  risks: string[]
  alternatives: string[]
}

export interface UserPreferences {
  nationality: string
  budget: number // monthly
  duration: number // months
  interests: string[]
  visaPreference: 'easy' | 'moderate' | 'complex'
  climatePreference: 'warm' | 'temperate' | 'cool' | 'any'
  socialPreference: 'high' | 'medium' | 'low'
}

export class NomadRouteService {
  // 生成数字游民路线
  static async generateRoute(
    preferences: UserPreferences,
    selectedCities: any[]
  ): Promise<NomadRoute> {
    const routeId = `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 基于用户偏好和选中的城市生成路线
    const cities: RouteCity[] = selectedCities.map((city, index) => ({
      id: city.id,
      name: city.name,
      country: city.country,
      duration: this.calculateOptimalDuration(city, preferences),
      cost: city.cost_of_living || 1500,
      visaType: city.visa_type || 'Tourist Visa',
      visaDays: city.visa_days || 30,
      highlights: this.generateCityHighlights(city, preferences)
    }))

    const totalDuration = cities.reduce((sum, city) => sum + city.duration, 0)
    const totalCost = cities.reduce((sum, city) => sum + (city.cost * city.duration / 30), 0)

    const route: NomadRoute = {
      id: routeId,
      title: this.generateRouteTitle(cities, preferences),
      description: this.generateRouteDescription(cities, preferences),
      totalDuration: Math.round(totalDuration / 30), // convert to months
      totalCost: Math.round(totalCost),
      cities,
      visaStrategy: this.generateVisaStrategy(cities, preferences),
      highlights: this.generateRouteHighlights(cities, preferences),
      recommendations: this.generateRecommendations(cities, preferences),
      createdAt: new Date().toISOString()
    }

    return route
  }

  // 计算最优停留时间
  private static calculateOptimalDuration(city: any, preferences: UserPreferences): number {
    const baseDuration = city.visa_days || 30
    const maxDuration = Math.min(baseDuration, 90) // 最多90天
    
    // 根据用户偏好调整
    if (preferences.visaPreference === 'easy' && city.visa_type?.includes('Visa Free')) {
      return Math.min(maxDuration, 60)
    }
    
    if (preferences.budget < 2000 && city.cost_of_living < 1500) {
      return Math.min(maxDuration, 45) // 预算型用户，延长停留
    }
    
    return Math.min(maxDuration, 30) // 默认30天
  }

  // 生成城市亮点
  private static generateCityHighlights(city: any, preferences: UserPreferences): string[] {
    const highlights: string[] = []
    
    if (city.wifi_speed && city.wifi_speed > 50) {
      highlights.push('高速网络环境')
    }
    
    if (city.cost_of_living && city.cost_of_living < 1500) {
      highlights.push('生活成本较低')
    }
    
    if (city.visa_type?.includes('Visa Free')) {
      highlights.push('免签便利')
    }
    
    if (city.visa_type?.includes('Digital Nomad')) {
      highlights.push('数字游民友好')
    }
    
    // 根据用户兴趣添加亮点
    if (preferences.interests.includes('culture')) {
      highlights.push('丰富的文化体验')
    }
    
    if (preferences.interests.includes('nature')) {
      highlights.push('优美的自然环境')
    }
    
    return highlights
  }

  // 生成路线标题
  private static generateRouteTitle(cities: RouteCity[], preferences: UserPreferences): string {
    if (cities.length === 1) {
      return `${cities[0].name} 深度体验之旅`
    }
    
    if (cities.length <= 3) {
      const cityNames = cities.map(c => c.name).join(' → ')
      return `${cityNames} 数字游民路线`
    }
    
    return `${cities.length}城市数字游民环游`
  }

  // 生成路线描述
  private static generateRouteDescription(cities: RouteCity[], preferences: UserPreferences): string {
    const totalMonths = Math.round(cities.reduce((sum, city) => sum + city.duration, 0) / 30)
    const totalCost = cities.reduce((sum, city) => sum + (city.cost * city.duration / 30), 0)
    
    return `这是一条为期${totalMonths}个月的数字游民路线，总预算约$${Math.round(totalCost)}。路线经过${cities.length}个城市，每个城市都经过精心挑选，符合你的预算和偏好要求。`
  }

  // 生成签证策略
  private static generateVisaStrategy(cities: RouteCity[], preferences: UserPreferences): VisaStrategy {
    const visaFreeCities = cities.filter(city => city.visaType.includes('Visa Free'))
    const nomadVisaCities = cities.filter(city => city.visaType.includes('Digital Nomad'))
    const regularVisaCities = cities.filter(city => !city.visaType.includes('Visa Free') && !city.visaType.includes('Digital Nomad'))
    
    let strategy = ''
    const requirements: string[] = []
    const timeline: string[] = []
    let costs = 0
    const risks: string[] = []
    const alternatives: string[] = []
    
    if (visaFreeCities.length === cities.length) {
      strategy = '免签路线 - 无需提前申请签证'
      requirements.push('确保护照有效期6个月以上')
      timeline.push('出发前1周：确认护照有效期')
    } else if (nomadVisaCities.length > 0) {
      strategy = '数字游民签证路线 - 长期居留优势'
      requirements.push('收入证明（通常$3000+/月）')
      requirements.push('健康保险证明')
      requirements.push('无犯罪记录证明')
      timeline.push('出发前2-3个月：准备申请材料')
      timeline.push('出发前1-2个月：提交签证申请')
      costs += nomadVisaCities.length * 200 // 每个数字游民签证约$200
    } else {
      strategy = '旅游签证路线 - 需要提前规划'
      requirements.push('在职证明或银行流水')
      requirements.push('行程单和住宿预订')
      requirements.push('往返机票预订')
      timeline.push('出发前1-2个月：准备申请材料')
      timeline.push('出发前2-4周：提交签证申请')
      costs += regularVisaCities.length * 100 // 每个旅游签证约$100
    }
    
    // 添加风险提示
    if (preferences.nationality === 'CN') {
      risks.push('中国护照签证限制较多，建议提前规划')
      alternatives.push('考虑申请申根签证，可访问多个欧洲国家')
    }
    
    return {
      strategy,
      requirements,
      timeline,
      costs,
      risks,
      alternatives
    }
  }

  // 生成路线亮点
  private static generateRouteHighlights(cities: RouteCity[], preferences: UserPreferences): string[] {
    const highlights: string[] = []
    
    const totalCost = cities.reduce((sum, city) => sum + (city.cost * city.duration / 30), 0)
    const avgMonthlyCost = totalCost / (cities.reduce((sum, city) => sum + city.duration, 0) / 30)
    
    if (avgMonthlyCost < preferences.budget * 0.8) {
      highlights.push('预算友好，比预期节省20%以上')
    }
    
    if (cities.some(city => city.visaType.includes('Visa Free'))) {
      highlights.push('包含免签国家，入境便利')
    }
    
    if (cities.some(city => city.visaType.includes('Digital Nomad'))) {
      highlights.push('数字游民签证支持，长期居留')
    }
    
    if (cities.length > 1) {
      highlights.push('多城市体验，丰富旅行经历')
    }
    
    return highlights
  }

  // 生成建议
  private static generateRecommendations(cities: RouteCity[], preferences: UserPreferences): string[] {
    const recommendations: string[] = []
    
    recommendations.push('建议购买旅行保险，覆盖医疗和意外')
    recommendations.push('准备多个支付方式，包括信用卡和现金')
    
    if (cities.some(city => city.visaType.includes('Digital Nomad'))) {
      recommendations.push('考虑开设当地银行账户，便于长期居留')
    }
    
    if (preferences.budget < 2000) {
      recommendations.push('选择经济型住宿，如青旅或合租')
      recommendations.push('使用公共交通，减少交通成本')
    }
    
    recommendations.push('加入当地数字游民社群，扩展人脉')
    recommendations.push('学习基础当地语言，提升体验')
    
    return recommendations
  }

  // 保存路线到本地存储
  static saveRoute(route: NomadRoute): void {
    const savedRoutes = this.getSavedRoutes()
    savedRoutes.push(route)
    localStorage.setItem('nomad_routes', JSON.stringify(savedRoutes))
  }

  // 获取保存的路线
  static getSavedRoutes(): NomadRoute[] {
    try {
      const saved = localStorage.getItem('nomad_routes')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  }

  // 删除路线
  static deleteRoute(routeId: string): void {
    const savedRoutes = this.getSavedRoutes()
    const filtered = savedRoutes.filter(route => route.id !== routeId)
    localStorage.setItem('nomad_routes', JSON.stringify(filtered))
  }
}
