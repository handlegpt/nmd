/**
 * Nomad Agent 核心架构
 * 多Agent协作系统，为数字游民提供智能规划服务
 */

import { dataSourceManager, CostOfLivingData, NomadVisaData, POIData } from './dataSources'

// =====================================================
// 类型定义
// =====================================================

export interface UserProfile {
  nationality: string
  budget: number
  duration: number
  startDate?: Date
  preferences: {
    climate: string[]
    activities: string[]
    accommodation: string
    food: string
    social: string
    visa: string
  }
  constraints: {
    maxCities: number
    minStayDays: number
    maxStayDays: number
    mustVisit?: string[]
    avoidCountries?: string[]
  }
}

export interface CityRecommendation {
  city: string
  country: string
  score: number
  reasons: string[]
  cost: CostOfLivingData
  visa: NomadVisaData | null
  pois: POIData[]
  stayDuration: number
  estimatedCost: number
}

export interface TravelPlan {
  id: string
  title: string
  userProfile: UserProfile
  routes: RouteOption[]
  totalCost: number
  totalDuration: number
  riskAssessment: RiskAssessment
  createdAt: Date
  updatedAt: Date
}

export interface RouteOption {
  id: string
  name: string
  cities: CityRecommendation[]
  totalCost: number
  totalDuration: number
  visaStrategy: VisaStrategy
  highlights: string[]
  pros: string[]
  cons: string[]
  score: number
}

export interface VisaStrategy {
  requiredVisas: NomadVisaData[]
  applicationTimeline: {
    visa: string
    startDate: Date
    endDate: Date
    status: 'pending' | 'approved' | 'rejected'
  }[]
  totalCost: number
  totalTime: number
  risks: string[]
}

export interface RiskAssessment {
  overall: 'low' | 'medium' | 'high'
  categories: {
    visa: { level: string; details: string[] }
    cost: { level: string; details: string[] }
    safety: { level: string; details: string[] }
    weather: { level: string; details: string[] }
    network: { level: string; details: string[] }
  }
  mitigation: string[]
}

// =====================================================
// 基础Agent类
// =====================================================

abstract class BaseAgent {
  protected name: string
  protected description: string

  constructor(name: string, description: string) {
    this.name = name
    this.description = description
  }

  abstract execute(input: any): Promise<any>

  protected log(message: string, data?: any): void {
    console.log(`[${this.name}] ${message}`, data || '')
  }

  protected error(message: string, error?: any): void {
    console.error(`[${this.name}] ${message}`, error || '')
  }
}

// =====================================================
// 签证分析Agent
// =====================================================

export class VisaAnalysisAgent extends BaseAgent {
  constructor() {
    super('VisaAnalysisAgent', '分析数字游民签证要求和策略')
  }

  async execute(userProfile: UserProfile): Promise<NomadVisaData[]> {
    this.log('开始分析签证要求', { nationality: userProfile.nationality, budget: userProfile.budget })

    try {
      // 获取所有可用的数字游民签证
      const allVisas = await dataSourceManager.visaService.getAllNomadVisas()
      
      // 筛选符合条件的签证
      const eligibleVisas = allVisas.filter(visa => {
        return visa.isActive &&
               visa.incomeRequirementUSD <= userProfile.budget &&
               visa.durationMonths >= userProfile.duration &&
               !userProfile.constraints.avoidCountries?.includes(visa.country)
      })

      // 按优先级排序
      const sortedVisas = eligibleVisas.sort((a, b) => {
        // 优先考虑：收入要求低、申请时间短、可续签
        const scoreA = this.calculateVisaScore(a, userProfile)
        const scoreB = this.calculateVisaScore(b, userProfile)
        return scoreB - scoreA
      })

      this.log('签证分析完成', { eligibleCount: sortedVisas.length })
      return sortedVisas.slice(0, 10) // 返回前10个最佳选择
    } catch (error) {
      this.error('签证分析失败', error)
      throw new Error('Failed to analyze visa requirements')
    }
  }

  private calculateVisaScore(visa: NomadVisaData, userProfile: UserProfile): number {
    let score = 100

    // 收入要求越低越好
    score -= (visa.incomeRequirementUSD / userProfile.budget) * 30

    // 申请时间越短越好
    score -= (visa.applicationTimeDays / 90) * 20

    // 可续签加分
    if (visa.renewalPossible) {
      score += 10
    }

    // 费用越低越好
    score -= (visa.costUSD / 1000) * 10

    return Math.max(0, Math.min(100, score))
  }
}

// =====================================================
// 成本计算Agent
// =====================================================

export class CostCalculationAgent extends BaseAgent {
  constructor() {
    super('CostCalculationAgent', '计算生活成本和预算分析')
  }

  async execute(cities: string[], userProfile: UserProfile): Promise<CostOfLivingData[]> {
    this.log('开始计算生活成本', { cities, budget: userProfile.budget })

    try {
      const costData: CostOfLivingData[] = []

      for (const city of cities) {
        const [cityName, country] = city.split(', ')
        const cost = await dataSourceManager.costService.getCostOfLiving(cityName, country)
        
        // 根据用户偏好调整成本
        const adjustedCost = this.adjustCostForPreferences(cost, userProfile)
        costData.push(adjustedCost)
      }

      this.log('成本计算完成', { citiesCount: costData.length })
      return costData
    } catch (error) {
      this.error('成本计算失败', error)
      throw new Error('Failed to calculate costs')
    }
  }

  private adjustCostForPreferences(cost: CostOfLivingData, userProfile: UserProfile): CostOfLivingData {
    const adjusted = { ...cost }

    // 根据住宿偏好调整
    if (userProfile.preferences.accommodation === 'luxury') {
      adjusted.accommodation.monthly *= 1.5
      adjusted.accommodation.daily *= 1.5
    } else if (userProfile.preferences.accommodation === 'budget') {
      adjusted.accommodation.monthly *= 0.7
      adjusted.accommodation.daily *= 0.7
    }

    // 根据饮食偏好调整
    if (userProfile.preferences.food === 'fine_dining') {
      adjusted.food.monthly *= 1.3
      adjusted.food.daily *= 1.3
    } else if (userProfile.preferences.food === 'street_food') {
      adjusted.food.monthly *= 0.8
      adjusted.food.daily *= 0.8
    }

    // 重新计算总成本
    adjusted.total.monthly = adjusted.accommodation.monthly + 
                            adjusted.food.monthly + 
                            adjusted.transport.monthly + 
                            adjusted.coworking.monthly
    adjusted.total.daily = adjusted.accommodation.daily + 
                          adjusted.food.daily + 
                          adjusted.transport.daily + 
                          adjusted.coworking.daily

    return adjusted
  }
}

// =====================================================
// 路线规划Agent
// =====================================================

export class RoutePlanningAgent extends BaseAgent {
  constructor() {
    super('RoutePlanningAgent', '规划最优数字游民路线')
  }

  async execute(
    userProfile: UserProfile,
    eligibleVisas: NomadVisaData[],
    costData: CostOfLivingData[]
  ): Promise<RouteOption[]> {
    this.log('开始规划路线', { 
      duration: userProfile.duration, 
      budget: userProfile.budget,
      visaCount: eligibleVisas.length 
    })

    try {
      // 生成候选城市
      const candidateCities = await this.generateCandidateCities(userProfile, eligibleVisas, costData)
      
      // 生成路线选项
      const routes = await this.generateRouteOptions(candidateCities, userProfile)
      
      // 评分和排序
      const scoredRoutes = routes.map(route => ({
        ...route,
        score: this.calculateRouteScore(route, userProfile)
      })).sort((a, b) => b.score - a.score)

      this.log('路线规划完成', { routesCount: scoredRoutes.length })
      return scoredRoutes.slice(0, 3) // 返回前3个最佳路线
    } catch (error) {
      this.error('路线规划失败', error)
      throw new Error('Failed to plan routes')
    }
  }

  private async generateCandidateCities(
    userProfile: UserProfile,
    eligibleVisas: NomadVisaData[],
    costData: CostOfLivingData[]
  ): Promise<CityRecommendation[]> {
    const candidates: CityRecommendation[] = []

    for (const visa of eligibleVisas) {
      // 找到对应城市的成本数据
      const cityCost = costData.find(cost => 
        cost.country === visa.country
      )

      if (cityCost && cityCost.total.monthly <= userProfile.budget) {
        // 获取POI数据
        const pois = await dataSourceManager.poiService.getPOIsByCity(
          cityCost.city, 
          cityCost.country,
          ['cafe', 'coworking', 'restaurant']
        )

        const candidate: CityRecommendation = {
          city: cityCost.city,
          country: cityCost.country,
          score: this.calculateCityScore(cityCost, visa, userProfile),
          reasons: this.generateCityReasons(cityCost, visa, userProfile),
          cost: cityCost,
          visa,
          pois,
          stayDuration: Math.min(visa.durationMonths * 30, userProfile.constraints.maxStayDays),
          estimatedCost: cityCost.total.monthly * (visa.durationMonths || 1)
        }

        candidates.push(candidate)
      }
    }

    return candidates.sort((a, b) => b.score - a.score)
  }

  private async generateRouteOptions(
    candidates: CityRecommendation[],
    userProfile: UserProfile
  ): Promise<RouteOption[]> {
    const routes: RouteOption[] = []

    // 生成单城市路线
    for (const candidate of candidates.slice(0, 5)) {
      const route: RouteOption = {
        id: `route_${candidate.city}_${Date.now()}`,
        name: `${candidate.city} 深度体验`,
        cities: [candidate],
        totalCost: candidate.estimatedCost,
        totalDuration: candidate.stayDuration,
        visaStrategy: await this.generateVisaStrategy([candidate]),
        highlights: this.generateHighlights([candidate]),
        pros: this.generatePros([candidate]),
        cons: this.generateCons([candidate]),
        score: 0 // 将在后面计算
      }
      routes.push(route)
    }

    // 生成多城市路线
    if (candidates.length >= 2) {
      const multiCityRoutes = this.generateMultiCityRoutes(candidates, userProfile)
      routes.push(...multiCityRoutes)
    }

    return routes
  }

  private generateMultiCityRoutes(
    candidates: CityRecommendation[],
    userProfile: UserProfile
  ): RouteOption[] {
    const routes: RouteOption[] = []
    const maxCities = Math.min(userProfile.constraints.maxCities, 3)

    // 生成2-3城市的组合
    for (let i = 0; i < candidates.length - 1; i++) {
      for (let j = i + 1; j < Math.min(candidates.length, i + maxCities); j++) {
        const selectedCities = candidates.slice(i, j + 1)
        
        if (selectedCities.length <= maxCities) {
          const route: RouteOption = {
            id: `route_multi_${Date.now()}_${i}`,
            name: `${selectedCities.map(c => c.city).join(' → ')} 探索之旅`,
            cities: selectedCities,
            totalCost: selectedCities.reduce((sum, city) => sum + city.estimatedCost, 0),
            totalDuration: selectedCities.reduce((sum, city) => sum + city.stayDuration, 0),
            visaStrategy: this.generateVisaStrategy(selectedCities),
            highlights: this.generateHighlights(selectedCities),
            pros: this.generatePros(selectedCities),
            cons: this.generateCons(selectedCities),
            score: 0
          }
          routes.push(route)
        }
      }
    }

    return routes
  }

  private calculateCityScore(
    cost: CostOfLivingData,
    visa: NomadVisaData,
    userProfile: UserProfile
  ): number {
    let score = 50

    // 成本评分 (越低越好)
    const costRatio = cost.total.monthly / userProfile.budget
    score += (1 - costRatio) * 30

    // 签证便利性评分
    if (visa.applicationTimeDays <= 30) score += 10
    if (visa.renewalPossible) score += 5
    if (visa.costUSD <= 100) score += 5

    // 用户偏好匹配
    if (userProfile.preferences.climate.includes('warm') && cost.city.includes('Bangkok')) {
      score += 10
    }

    return Math.max(0, Math.min(100, score))
  }

  private calculateRouteScore(route: RouteOption, userProfile: UserProfile): number {
    let score = 50

    // 成本效率评分
    const costEfficiency = userProfile.budget / route.totalCost
    score += costEfficiency * 20

    // 时间效率评分
    const timeEfficiency = userProfile.duration / (route.totalDuration / 30)
    score += timeEfficiency * 15

    // 多样性评分
    if (route.cities.length > 1) score += 10

    // 签证便利性评分
    if (route.visaStrategy.totalTime <= 60) score += 10

    return Math.max(0, Math.min(100, score))
  }

  private generateCityReasons(
    cost: CostOfLivingData,
    visa: NomadVisaData,
    userProfile: UserProfile
  ): string[] {
    const reasons: string[] = []

    if (cost.total.monthly <= userProfile.budget * 0.8) {
      reasons.push('生活成本合理')
    }

    if (visa.applicationTimeDays <= 30) {
      reasons.push('签证申请便利')
    }

    if (visa.renewalPossible) {
      reasons.push('可续签延长停留')
    }

    if (cost.coworking.monthly <= 200) {
      reasons.push('联合办公空间丰富')
    }

    return reasons
  }

  private generateHighlights(cities: CityRecommendation[]): string[] {
    const highlights: string[] = []

    cities.forEach(city => {
      if (city.cost.total.monthly <= 1500) {
        highlights.push(`${city.city} 生活成本低廉`)
      }
      if (city.visa?.renewalPossible) {
        highlights.push(`${city.city} 可长期居留`)
      }
      if (city.pois.length > 5) {
        highlights.push(`${city.city} 丰富的数字游民设施`)
      }
    })

    return highlights
  }

  private generatePros(cities: CityRecommendation[]): string[] {
    const pros: string[] = []

    const totalCost = cities.reduce((sum, city) => sum + city.estimatedCost, 0)
    if (totalCost <= 2000) {
      pros.push('总体成本较低')
    }

    const hasRenewableVisa = cities.some(city => city.visa?.renewalPossible)
    if (hasRenewableVisa) {
      pros.push('签证可续签')
    }

    const hasGoodNetwork = cities.some(city => city.cost.coworking.monthly <= 200)
    if (hasGoodNetwork) {
      pros.push('数字游民基础设施完善')
    }

    return pros
  }

  private generateCons(cities: CityRecommendation[]): string[] {
    const cons: string[] = []

    const hasLongVisaProcess = cities.some(city => 
      city.visa && city.visa.applicationTimeDays > 60
    )
    if (hasLongVisaProcess) {
      cons.push('部分签证申请时间较长')
    }

    const hasHighCost = cities.some(city => city.estimatedCost > 3000)
    if (hasHighCost) {
      cons.push('部分城市生活成本较高')
    }

    return cons
  }

  private async generateVisaStrategy(cities: CityRecommendation[]): Promise<VisaStrategy> {
    const requiredVisas = cities.map(city => city.visa).filter(Boolean) as NomadVisaData[]
    
    const applicationTimeline = requiredVisas.map(visa => ({
      visa: visa.visaName,
      startDate: new Date(),
      endDate: new Date(Date.now() + visa.applicationTimeDays * 24 * 60 * 60 * 1000),
      status: 'pending' as const
    }))

    return {
      requiredVisas,
      applicationTimeline,
      totalCost: requiredVisas.reduce((sum, visa) => sum + visa.costUSD, 0),
      totalTime: Math.max(...requiredVisas.map(visa => visa.applicationTimeDays)),
      risks: this.identifyVisaRisks(requiredVisas)
    }
  }

  private identifyVisaRisks(visas: NomadVisaData[]): string[] {
    const risks: string[] = []

    const hasLongProcess = visas.some(visa => visa.applicationTimeDays > 60)
    if (hasLongProcess) {
      risks.push('部分签证申请时间较长，需要提前规划')
    }

    const hasHighCost = visas.some(visa => visa.costUSD > 500)
    if (hasHighCost) {
      risks.push('部分签证费用较高')
    }

    const hasStrictRequirements = visas.some(visa => 
      visa.requirements.length > 5
    )
    if (hasStrictRequirements) {
      risks.push('部分签证要求较为严格')
    }

    return risks
  }
}

// =====================================================
// 风险评估Agent
// =====================================================

export class RiskAssessmentAgent extends BaseAgent {
  constructor() {
    super('RiskAssessmentAgent', '评估数字游民路线风险')
  }

  async execute(route: RouteOption, userProfile: UserProfile): Promise<RiskAssessment> {
    this.log('开始风险评估', { routeId: route.id })

    try {
      const assessment: RiskAssessment = {
        overall: 'medium',
        categories: {
          visa: this.assessVisaRisk(route.visaStrategy),
          cost: this.assessCostRisk(route, userProfile),
          safety: this.assessSafetyRisk(route.cities),
          weather: this.assessWeatherRisk(route.cities, userProfile),
          network: this.assessNetworkRisk(route.cities)
        },
        mitigation: []
      }

      // 计算总体风险等级
      assessment.overall = this.calculateOverallRisk(assessment.categories)
      
      // 生成风险缓解建议
      assessment.mitigation = this.generateMitigationStrategies(assessment)

      this.log('风险评估完成', { overall: assessment.overall })
      return assessment
    } catch (error) {
      this.error('风险评估失败', error)
      throw new Error('Failed to assess risks')
    }
  }

  private assessVisaRisk(visaStrategy: VisaStrategy): { level: string; details: string[] } {
    const details: string[] = []
    let level = 'low'

    if (visaStrategy.totalTime > 60) {
      details.push('签证申请时间较长')
      level = 'medium'
    }

    if (visaStrategy.totalCost > 1000) {
      details.push('签证费用较高')
      level = 'medium'
    }

    if (visaStrategy.risks.length > 2) {
      details.push('存在多个签证风险')
      level = 'high'
    }

    return { level, details }
  }

  private assessCostRisk(route: RouteOption, userProfile: UserProfile): { level: string; details: string[] } {
    const details: string[] = []
    let level = 'low'

    const costRatio = route.totalCost / (userProfile.budget * userProfile.duration)
    
    if (costRatio > 1.2) {
      details.push('预算可能不足')
      level = 'high'
    } else if (costRatio > 1.0) {
      details.push('预算较为紧张')
      level = 'medium'
    }

    const hasExpensiveCity = route.cities.some(city => city.estimatedCost > 3000)
    if (hasExpensiveCity) {
      details.push('包含高成本城市')
      level = level === 'low' ? 'medium' : level
    }

    return { level, details }
  }

  private assessSafetyRisk(cities: CityRecommendation[]): { level: string; details: string[] } {
    const details: string[] = []
    let level = 'low'

    // 这里应该基于实际的安全数据
    const hasUnsafeCity = cities.some(city => 
      city.country === 'MEX' || city.country === 'THA'
    )
    
    if (hasUnsafeCity) {
      details.push('部分城市安全等级较低')
      level = 'medium'
    }

    return { level, details }
  }

  private assessWeatherRisk(cities: CityRecommendation[], userProfile: UserProfile): { level: string; details: string[] } {
    const details: string[] = []
    let level = 'low'

    // 检查气候偏好匹配
    const hasUnfavorableWeather = cities.some(city => {
      if (userProfile.preferences.climate.includes('warm') && 
          (city.country === 'DEU' || city.country === 'CZE')) {
        return true
      }
      return false
    })

    if (hasUnfavorableWeather) {
      details.push('部分城市气候可能不符合偏好')
      level = 'medium'
    }

    return { level, details }
  }

  private assessNetworkRisk(cities: CityRecommendation[]): { level: string; details: string[] } {
    const details: string[] = []
    let level = 'low'

    const hasPoorNetwork = cities.some(city => 
      city.cost.coworking.monthly > 300 || city.pois.length < 3
    )

    if (hasPoorNetwork) {
      details.push('部分城市数字游民基础设施不足')
      level = 'medium'
    }

    return { level, details }
  }

  private calculateOverallRisk(categories: RiskAssessment['categories']): 'low' | 'medium' | 'high' {
    const riskLevels = Object.values(categories).map(cat => cat.level)
    
    if (riskLevels.includes('high')) return 'high'
    if (riskLevels.filter(level => level === 'medium').length >= 2) return 'medium'
    return 'low'
  }

  private generateMitigationStrategies(assessment: RiskAssessment): string[] {
    const strategies: string[] = []

    if (assessment.categories.visa.level === 'high') {
      strategies.push('提前3-6个月开始签证申请流程')
    }

    if (assessment.categories.cost.level === 'high') {
      strategies.push('准备额外20%的预算作为应急资金')
    }

    if (assessment.categories.safety.level === 'medium') {
      strategies.push('购买全面的旅行保险')
    }

    if (assessment.categories.network.level === 'medium') {
      strategies.push('提前联系当地的数字游民社区')
    }

    return strategies
  }
}

// =====================================================
// 主Nomad Agent协调器
// =====================================================

export class NomadPlanningAgent {
  private visaAgent: VisaAnalysisAgent
  private costAgent: CostCalculationAgent
  private routeAgent: RoutePlanningAgent
  private riskAgent: RiskAssessmentAgent

  constructor() {
    this.visaAgent = new VisaAnalysisAgent()
    this.costAgent = new CostCalculationAgent()
    this.routeAgent = new RoutePlanningAgent()
    this.riskAgent = new RiskAssessmentAgent()
  }

  /**
   * 生成数字游民规划
   */
  async generatePlan(userProfile: UserProfile): Promise<TravelPlan> {
    console.log('🚀 开始生成数字游民规划', userProfile)

    try {
      // 1. 分析签证要求
      console.log('📋 分析签证要求...')
      const eligibleVisas = await this.visaAgent.execute(userProfile)

      // 2. 计算生活成本
      console.log('💰 计算生活成本...')
      const candidateCities = eligibleVisas.map(visa => 
        `${visa.countryName}, ${visa.country}`
      )
      const costData = await this.costAgent.execute(candidateCities, userProfile)

      // 3. 规划路线
      console.log('🗺️ 规划路线...')
      const routes = await this.routeAgent.execute(userProfile, eligibleVisas, costData)

      // 4. 评估风险
      console.log('⚠️ 评估风险...')
      const routesWithRisk = await Promise.all(
        routes.map(async (route) => {
          const riskAssessment = await this.riskAgent.execute(route, userProfile)
          return { ...route, riskAssessment }
        })
      )

      // 5. 生成最终规划
      const plan: TravelPlan = {
        id: `plan_${Date.now()}`,
        title: `数字游民规划 - ${userProfile.duration}个月`,
        userProfile,
        routes: routesWithRisk,
        totalCost: Math.min(...routesWithRisk.map(r => r.totalCost)),
        totalDuration: userProfile.duration,
        riskAssessment: routesWithRisk[0]?.riskAssessment || {
          overall: 'medium',
          categories: {
            visa: { level: 'medium', details: [] },
            cost: { level: 'medium', details: [] },
            safety: { level: 'low', details: [] },
            weather: { level: 'low', details: [] },
            network: { level: 'medium', details: [] }
          },
          mitigation: []
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      console.log('✅ 数字游民规划生成完成', { 
        planId: plan.id, 
        routesCount: plan.routes.length,
        totalCost: plan.totalCost 
      })

      return plan
    } catch (error) {
      console.error('❌ 规划生成失败', error)
      throw new Error('Failed to generate nomad plan')
    }
  }

  /**
   * 获取Agent状态
   */
  getAgentStatus(): Record<string, { name: string; description: string; status: string }> {
    return {
      visaAgent: {
        name: this.visaAgent.name,
        description: this.visaAgent.description,
        status: 'ready'
      },
      costAgent: {
        name: this.costAgent.name,
        description: this.costAgent.description,
        status: 'ready'
      },
      routeAgent: {
        name: this.routeAgent.name,
        description: this.routeAgent.description,
        status: 'ready'
      },
      riskAgent: {
        name: this.riskAgent.name,
        description: this.riskAgent.description,
        status: 'ready'
      }
    }
  }
}

// 导出单例实例
export const nomadPlanningAgent = new NomadPlanningAgent()
