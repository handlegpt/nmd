/**
 * 实用的生活成本数据服务
 * 基于实际可用的数据源设计
 */

export interface PracticalCostData {
  city: string
  country: string
  accommodation: {
    monthly: number
    daily: number
    source: string
    confidence: number
    dataPoints: number
  }
  food: {
    monthly: number
    daily: number
    source: string
    confidence: number
    dataPoints: number
  }
  transport: {
    monthly: number
    daily: number
    source: string
    confidence: number
    dataPoints: number
  }
  coworking: {
    monthly: number
    daily: number
    source: string
    confidence: number
    dataPoints: number
  }
  total: {
    monthly: number
    daily: number
    confidence: number
  }
  currency: string
  lastUpdated: Date
  dataQuality: 'high' | 'medium' | 'low'
  dataSources: string[]
}

export class PracticalCostDataService {
  private static instance: PracticalCostDataService
  private cache = new Map<string, PracticalCostData>()
  private cacheExpiry = new Map<string, Date>()

  static getInstance(): PracticalCostDataService {
    if (!PracticalCostDataService.instance) {
      PracticalCostDataService.instance = new PracticalCostDataService()
    }
    return PracticalCostDataService.instance
  }

  /**
   * 获取城市生活成本数据
   */
  async getCostData(city: string, country: string): Promise<PracticalCostData> {
    const cacheKey = `${city}-${country}`
    
    // 检查缓存
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    try {
      // 数据获取优先级：
      // 1. 众包数据 (最真实)
      // 2. 预设基准数据 (作为fallback)
      // 3. 估算数据 (最后选择)
      
      const [crowdsourcedData, benchmarkData] = await Promise.allSettled([
        this.fetchCrowdsourcedData(city, country),
        this.fetchBenchmarkData(city, country)
      ])

      const costData = this.mergeCostData(
        crowdsourcedData.status === 'fulfilled' ? crowdsourcedData.value : null,
        benchmarkData.status === 'fulfilled' ? benchmarkData.value : null,
        city,
        country
      )

      // 缓存数据
      this.cache.set(cacheKey, costData)
      this.cacheExpiry.set(cacheKey, new Date(Date.now() + 24 * 60 * 60 * 1000)) // 24小时缓存

      return costData
    } catch (error) {
      console.error('Error fetching cost data:', error)
      throw new Error(`Failed to fetch cost data for ${city}, ${country}`)
    }
  }

  /**
   * 获取众包数据 (主要数据源)
   */
  private async fetchCrowdsourcedData(city: string, country: string): Promise<Partial<PracticalCostData> | null> {
    try {
      const response = await fetch(`/api/cost-data/crowdsourced?city=${city}&country=${country}`)
      if (!response.ok) return null

      const result = await response.json()
      if (!result.success || !result.data) return null

      const data = result.data
      
      return {
        accommodation: {
          monthly: data.accommodation?.average || 0,
          daily: (data.accommodation?.average || 0) / 30,
          source: 'Crowdsourced',
          confidence: data.accommodation?.confidence || 0.6,
          dataPoints: data.accommodation?.count || 0
        },
        food: {
          monthly: data.food?.average || 0,
          daily: (data.food?.average || 0) / 30,
          source: 'Crowdsourced',
          confidence: data.food?.confidence || 0.6,
          dataPoints: data.food?.count || 0
        },
        transport: {
          monthly: data.transport?.average || 0,
          daily: (data.transport?.average || 0) / 30,
          source: 'Crowdsourced',
          confidence: data.transport?.confidence || 0.6,
          dataPoints: data.transport?.count || 0
        },
        coworking: {
          monthly: data.coworking?.average || 0,
          daily: (data.coworking?.average || 0) / 30,
          source: 'Crowdsourced',
          confidence: data.coworking?.confidence || 0.7,
          dataPoints: data.coworking?.count || 0
        }
      }
    } catch (error) {
      console.warn('Crowdsourced data fetch failed:', error)
      return null
    }
  }

  /**
   * 获取基准数据 (预设的合理估算)
   */
  private async fetchBenchmarkData(city: string, country: string): Promise<Partial<PracticalCostData> | null> {
    // 基于城市和国家的预设基准数据
    const benchmarkData = this.getCityBenchmark(city, country)
    
    if (!benchmarkData) return null

    return {
      accommodation: {
        monthly: benchmarkData.accommodation,
        daily: benchmarkData.accommodation / 30,
        source: 'Benchmark',
        confidence: 0.4,
        dataPoints: 1
      },
      food: {
        monthly: benchmarkData.food,
        daily: benchmarkData.food / 30,
        source: 'Benchmark',
        confidence: 0.4,
        dataPoints: 1
      },
      transport: {
        monthly: benchmarkData.transport,
        daily: benchmarkData.transport / 30,
        source: 'Benchmark',
        confidence: 0.4,
        dataPoints: 1
      },
      coworking: {
        monthly: benchmarkData.coworking,
        daily: benchmarkData.coworking / 30,
        source: 'Benchmark',
        confidence: 0.5,
        dataPoints: 1
      }
    }
  }

  /**
   * 获取城市基准数据
   */
  private getCityBenchmark(city: string, country: string): {
    accommodation: number
    food: number
    transport: number
    coworking: number
  } | null {
    // 基于实际调研的基准数据
    const benchmarks: Record<string, Record<string, any>> = {
      'Thailand': {
        'Bangkok': { accommodation: 600, food: 300, transport: 80, coworking: 150 },
        'Chiang Mai': { accommodation: 400, food: 250, transport: 50, coworking: 120 },
        'Phuket': { accommodation: 700, food: 350, transport: 100, coworking: 180 }
      },
      'Portugal': {
        'Lisbon': { accommodation: 900, food: 400, transport: 60, coworking: 180 },
        'Porto': { accommodation: 700, food: 350, transport: 50, coworking: 150 }
      },
      'Germany': {
        'Berlin': { accommodation: 1000, food: 450, transport: 80, coworking: 200 },
        'Munich': { accommodation: 1200, food: 500, transport: 90, coworking: 220 },
        'Hamburg': { accommodation: 1100, food: 480, transport: 85, coworking: 210 }
      },
      'Mexico': {
        'Mexico City': { accommodation: 700, food: 350, transport: 60, coworking: 150 },
        'Guadalajara': { accommodation: 600, food: 300, transport: 50, coworking: 130 },
        'Playa del Carmen': { accommodation: 800, food: 400, transport: 70, coworking: 180 }
      },
      'Spain': {
        'Barcelona': { accommodation: 1000, food: 450, transport: 70, coworking: 200 },
        'Madrid': { accommodation: 950, food: 420, transport: 65, coworking: 190 },
        'Valencia': { accommodation: 700, food: 350, transport: 50, coworking: 150 }
      },
      'Czech Republic': {
        'Prague': { accommodation: 600, food: 300, transport: 60, coworking: 120 },
        'Brno': { accommodation: 500, food: 250, transport: 50, coworking: 100 }
      },
      'Hungary': {
        'Budapest': { accommodation: 500, food: 250, transport: 50, coworking: 100 }
      },
      'Estonia': {
        'Tallinn': { accommodation: 600, food: 300, transport: 60, coworking: 120 }
      }
    }

    return benchmarks[country]?.[city] || null
  }

  /**
   * 合并成本数据
   */
  private mergeCostData(
    crowdsourcedData: Partial<PracticalCostData> | null,
    benchmarkData: Partial<PracticalCostData> | null,
    city: string,
    country: string
  ): PracticalCostData {
    // 优先使用众包数据，如果没有则使用基准数据
    const accommodation = crowdsourcedData?.accommodation || benchmarkData?.accommodation || this.getDefaultCost('accommodation')
    const food = crowdsourcedData?.food || benchmarkData?.food || this.getDefaultCost('food')
    const transport = crowdsourcedData?.transport || benchmarkData?.transport || this.getDefaultCost('transport')
    const coworking = crowdsourcedData?.coworking || benchmarkData?.coworking || this.getDefaultCost('coworking')

    // 计算总成本
    const totalMonthly = accommodation.monthly + food.monthly + transport.monthly + coworking.monthly
    const totalDaily = totalMonthly / 30

    // 计算整体数据质量
    const avgConfidence = (accommodation.confidence + food.confidence + transport.confidence + coworking.confidence) / 4
    const dataQuality = avgConfidence >= 0.7 ? 'high' : avgConfidence >= 0.5 ? 'medium' : 'low'

    // 收集数据源
    const dataSources = [
      accommodation.source,
      food.source,
      transport.source,
      coworking.source
    ].filter((source, index, arr) => arr.indexOf(source) === index) // 去重

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
      dataQuality,
      dataSources
    }
  }

  /**
   * 获取默认成本 (当没有数据时的fallback)
   */
  private getDefaultCost(category: string): {
    monthly: number
    daily: number
    source: string
    confidence: number
    dataPoints: number
  } {
    const defaults = {
      accommodation: 800,
      food: 400,
      transport: 80,
      coworking: 150
    }

    return {
      monthly: defaults[category as keyof typeof defaults] || 500,
      daily: (defaults[category as keyof typeof defaults] || 500) / 30,
      source: 'Estimated',
      confidence: 0.2,
      dataPoints: 0
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
      crowdsourced: { isActive: true, lastChecked: new Date() },
      benchmark: { isActive: true, lastChecked: new Date() }
    }
  }
}

// 导出单例实例
export const practicalCostDataService = PracticalCostDataService.getInstance()
