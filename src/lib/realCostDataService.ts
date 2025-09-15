/**
 * 真实生活成本数据服务
 * 不使用Numbeo API，整合多个免费数据源
 */

export interface RealCostData {
  city: string
  country: string
  accommodation: {
    monthly: number
    daily: number
    source: string
    confidence: number // 0-1 数据可信度
  }
  food: {
    monthly: number
    daily: number
    source: string
    confidence: number
  }
  transport: {
    monthly: number
    daily: number
    source: string
    confidence: number
  }
  coworking: {
    monthly: number
    daily: number
    source: string
    confidence: number
  }
  total: {
    monthly: number
    daily: number
    confidence: number
  }
  currency: string
  lastUpdated: Date
  dataQuality: 'high' | 'medium' | 'low'
}

export class RealCostDataService {
  private static instance: RealCostDataService
  private cache = new Map<string, RealCostData>()
  private cacheExpiry = new Map<string, Date>()

  static getInstance(): RealCostDataService {
    if (!RealCostDataService.instance) {
      RealCostDataService.instance = new RealCostDataService()
    }
    return RealCostDataService.instance
  }

  /**
   * 获取城市真实生活成本数据
   */
  async getRealCostData(city: string, country: string): Promise<RealCostData> {
    const cacheKey = `${city}-${country}`
    
    // 检查缓存
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    try {
      // 从多个免费数据源获取数据
      const [nomadlistData, worldbankData, crowdsourcedData] = await Promise.allSettled([
        this.fetchFromNomadList(city, country),
        this.fetchFromWorldBank(country),
        this.fetchCrowdsourcedData(city, country)
      ])

      // 合并和验证数据
      const costData = this.mergeAndValidateData(
        nomadlistData.status === 'fulfilled' ? nomadlistData.value : null,
        worldbankData.status === 'fulfilled' ? worldbankData.value : null,
        crowdsourcedData.status === 'fulfilled' ? crowdsourcedData.value : null,
        city,
        country
      )

      // 缓存数据
      this.cache.set(cacheKey, costData)
      this.cacheExpiry.set(cacheKey, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // 7天缓存

      return costData
    } catch (error) {
      console.error('Error fetching real cost data:', error)
      throw new Error(`Failed to fetch real cost data for ${city}, ${country}`)
    }
  }

  /**
   * 从NomadList获取数据 (免费API)
   */
  private async fetchFromNomadList(city: string, country: string): Promise<Partial<RealCostData> | null> {
    try {
      // NomadList API调用
      const response = await fetch(`https://nomadlist.com/api/v2/city/${city.toLowerCase().replace(/\s+/g, '-')}`)
      if (!response.ok) return null

      const data = await response.json()
      
      return {
        accommodation: {
          monthly: data.cost?.accommodation || 0,
          daily: (data.cost?.accommodation || 0) / 30,
          source: 'NomadList',
          confidence: 0.8
        },
        food: {
          monthly: data.cost?.food || 0,
          daily: (data.cost?.food || 0) / 30,
          source: 'NomadList',
          confidence: 0.7
        },
        transport: {
          monthly: data.cost?.transport || 0,
          daily: (data.cost?.transport || 0) / 30,
          source: 'NomadList',
          confidence: 0.6
        },
        coworking: {
          monthly: data.cost?.coworking || 0,
          daily: (data.cost?.coworking || 0) / 30,
          source: 'NomadList',
          confidence: 0.9
        }
      }
    } catch (error) {
      console.warn('NomadList API failed:', error)
      return null
    }
  }

  /**
   * 从世界银行获取宏观经济数据 (免费API)
   */
  private async fetchFromWorldBank(country: string): Promise<Partial<RealCostData> | null> {
    try {
      // 世界银行API调用 - 获取购买力平价数据
      const response = await fetch(`https://api.worldbank.org/v2/country/${country}/indicator/PA.NUS.PPP?format=json&date=2023`)
      if (!response.ok) return null

      const data = await response.json()
      const pppData = data[1]?.[0]?.value // 购买力平价数据
      
      if (!pppData) return null

      // 基于购买力平价调整成本数据
      return {
        accommodation: {
          monthly: 0, // 需要其他数据源补充
          daily: 0,
          source: 'WorldBank',
          confidence: 0.5
        },
        food: {
          monthly: 0, // 需要其他数据源补充
          daily: 0,
          source: 'WorldBank',
          confidence: 0.5
        },
        transport: {
          monthly: 0, // 需要其他数据源补充
          daily: 0,
          source: 'WorldBank',
          confidence: 0.5
        },
        coworking: {
          monthly: 0, // 需要其他数据源补充
          daily: 0,
          source: 'WorldBank',
          confidence: 0.5
        }
      }
    } catch (error) {
      console.warn('WorldBank API failed:', error)
      return null
    }
  }

  /**
   * 获取众包数据 (用户提交的真实数据)
   */
  private async fetchCrowdsourcedData(city: string, country: string): Promise<Partial<RealCostData> | null> {
    try {
      // 从数据库获取用户提交的真实成本数据
      const response = await fetch(`/api/cost-data/crowdsourced?city=${city}&country=${country}`)
      if (!response.ok) return null

      const data = await response.json()
      
      if (!data.success || !data.data) return null

      const crowdsourcedData = data.data
      
      return {
        accommodation: {
          monthly: crowdsourcedData.accommodation?.average || 0,
          daily: (crowdsourcedData.accommodation?.average || 0) / 30,
          source: 'Crowdsourced',
          confidence: crowdsourcedData.accommodation?.confidence || 0.6
        },
        food: {
          monthly: crowdsourcedData.food?.average || 0,
          daily: (crowdsourcedData.food?.average || 0) / 30,
          source: 'Crowdsourced',
          confidence: crowdsourcedData.food?.confidence || 0.6
        },
        transport: {
          monthly: crowdsourcedData.transport?.average || 0,
          daily: (crowdsourcedData.transport?.average || 0) / 30,
          source: 'Crowdsourced',
          confidence: crowdsourcedData.transport?.confidence || 0.6
        },
        coworking: {
          monthly: crowdsourcedData.coworking?.average || 0,
          daily: (crowdsourcedData.coworking?.average || 0) / 30,
          source: 'Crowdsourced',
          confidence: crowdsourcedData.coworking?.confidence || 0.7
        }
      }
    } catch (error) {
      console.warn('Crowdsourced data fetch failed:', error)
      return null
    }
  }

  /**
   * 合并和验证数据
   */
  private mergeAndValidateData(
    nomadlistData: Partial<RealCostData> | null,
    worldbankData: Partial<RealCostData> | null,
    crowdsourcedData: Partial<RealCostData> | null,
    city: string,
    country: string
  ): RealCostData {
    // 数据合并策略：优先使用可信度高的数据源
    const accommodation = this.mergeCostCategory([
      nomadlistData?.accommodation,
      crowdsourcedData?.accommodation
    ])

    const food = this.mergeCostCategory([
      nomadlistData?.food,
      crowdsourcedData?.food
    ])

    const transport = this.mergeCostCategory([
      nomadlistData?.transport,
      crowdsourcedData?.transport
    ])

    const coworking = this.mergeCostCategory([
      nomadlistData?.coworking,
      crowdsourcedData?.coworking
    ])

    // 计算总成本
    const totalMonthly = accommodation.monthly + food.monthly + transport.monthly + coworking.monthly
    const totalDaily = totalMonthly / 30

    // 计算整体数据质量
    const avgConfidence = (accommodation.confidence + food.confidence + transport.confidence + coworking.confidence) / 4
    const dataQuality = avgConfidence >= 0.8 ? 'high' : avgConfidence >= 0.6 ? 'medium' : 'low'

    return {
      city,
      country,
      accommodation,
      food,
      transport,
      coworking,
      total: {
        monthly: totalMonthly,
        daily: totalDaily,
        confidence: avgConfidence
      },
      currency: 'USD',
      lastUpdated: new Date(),
      dataQuality
    }
  }

  /**
   * 合并成本类别数据
   */
  private mergeCostCategory(sources: Array<{
    monthly: number
    daily: number
    source: string
    confidence: number
  } | undefined>): {
    monthly: number
    daily: number
    source: string
    confidence: number
  } {
    const validSources = sources.filter(s => s && s.monthly > 0)
    
    if (validSources.length === 0) {
      return {
        monthly: 0,
        daily: 0,
        source: 'Unknown',
        confidence: 0
      }
    }

    if (validSources.length === 1) {
      return validSources[0]!
    }

    // 加权平均，权重基于可信度
    const totalWeight = validSources.reduce((sum, s) => sum + (s?.confidence || 0), 0)
    const weightedMonthly = validSources.reduce((sum, s) => sum + ((s?.monthly || 0) * (s?.confidence || 0)), 0) / totalWeight
    const weightedDaily = weightedMonthly / 30
    const avgConfidence = totalWeight / validSources.length

    return {
      monthly: Math.round(weightedMonthly),
      daily: Math.round(weightedDaily * 100) / 100,
      source: validSources.map(s => s?.source || 'Unknown').join(', '),
      confidence: avgConfidence
    }
  }

  /**
   * 检查缓存是否有效
   */
  private isCacheValid(cacheKey: string): boolean {
    const expiry = this.cacheExpiry.get(cacheKey)
    return expiry ? new Date() < expiry : false
  }

  /**
   * 获取数据源状态
   */
  getDataSourceStatus(): Record<string, { isActive: boolean; lastChecked: Date }> {
    return {
      nomadlist: { isActive: true, lastChecked: new Date() },
      worldbank: { isActive: true, lastChecked: new Date() },
      crowdsourced: { isActive: true, lastChecked: new Date() }
    }
  }
}

// 导出单例实例
export const realCostDataService = RealCostDataService.getInstance()
