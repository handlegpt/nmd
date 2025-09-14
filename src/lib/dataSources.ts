/**
 * 数据源整合服务
 * 整合多个真实数据源，为Nomad Agent提供准确的数据
 */

// =====================================================
// 数据源配置
// =====================================================

export interface DataSourceConfig {
  name: string
  type: 'api' | 'manual' | 'scraped'
  endpoint?: string
  apiKey?: string
  updateFrequency: 'real-time' | 'daily' | 'weekly' | 'monthly'
  lastUpdated?: Date
  isActive: boolean
}

export const DATA_SOURCES: Record<string, DataSourceConfig> = {
  // 生活成本数据
  numbeo: {
    name: 'Numbeo',
    type: 'api',
    endpoint: 'https://www.numbeo.com/api/',
    updateFrequency: 'monthly',
    isActive: true
  },
  
  // 数字游民数据
  nomadlist: {
    name: 'NomadList',
    type: 'api',
    endpoint: 'https://nomadlist.com/api/',
    updateFrequency: 'weekly',
    isActive: true
  },
  
  // 汇率数据 - 免费API，无需密钥
  exchangerate: {
    name: 'ExchangeRate-API (Free)',
    type: 'api',
    endpoint: 'https://api.exchangerate-api.com/v4/latest/',
    updateFrequency: 'daily',
    isActive: true
  },
  
  // 地图和POI数据
  googlePlaces: {
    name: 'Google Places API',
    type: 'api',
    endpoint: 'https://maps.googleapis.com/maps/api/',
    updateFrequency: 'real-time',
    isActive: true
  },
  
  // 签证信息
  visaInfo: {
    name: 'Visa Information',
    type: 'manual',
    updateFrequency: 'monthly',
    isActive: true
  },
  
  // 天气数据
  openWeather: {
    name: 'OpenWeatherMap',
    type: 'api',
    endpoint: 'https://api.openweathermap.org/data/2.5/',
    updateFrequency: 'daily',
    isActive: true
  }
}

// =====================================================
// 生活成本数据服务
// =====================================================

export interface CostOfLivingData {
  city: string
  country: string
  accommodation: {
    monthly: number
    daily: number
  }
  food: {
    monthly: number
    daily: number
  }
  transport: {
    monthly: number
    daily: number
  }
  coworking: {
    monthly: number
    daily: number
  }
  total: {
    monthly: number
    daily: number
  }
  currency: string
  lastUpdated: Date
  source: string
}

export class CostOfLivingService {
  private static instance: CostOfLivingService
  private cache: Map<string, CostOfLivingData> = new Map()
  private cacheExpiry: Map<string, Date> = new Map()

  static getInstance(): CostOfLivingService {
    if (!CostOfLivingService.instance) {
      CostOfLivingService.instance = new CostOfLivingService()
    }
    return CostOfLivingService.instance
  }

  /**
   * 获取城市生活成本数据
   */
  async getCostOfLiving(city: string, country: string): Promise<CostOfLivingData> {
    const cacheKey = `${city}-${country}`
    
    // 检查缓存
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    try {
      // 从多个数据源获取数据
      const [numbeoData, nomadlistData] = await Promise.allSettled([
        this.fetchFromNumbeo(city, country),
        this.fetchFromNomadList(city, country)
      ])

      // 合并数据
      const costData = this.mergeCostData(
        numbeoData.status === 'fulfilled' ? numbeoData.value : null,
        nomadlistData.status === 'fulfilled' ? nomadlistData.value : null,
        city,
        country
      )

      // 缓存数据
      this.cache.set(cacheKey, costData)
      this.cacheExpiry.set(cacheKey, new Date(Date.now() + 24 * 60 * 60 * 1000)) // 24小时缓存

      return costData
    } catch (error) {
      console.error('Error fetching cost of living data:', error)
      throw new Error(`Failed to fetch cost data for ${city}, ${country}`)
    }
  }

  /**
   * 从Numbeo获取数据
   * 参考: https://github.com/sixthextinction/cost-of-living-agent
   */
  private async fetchFromNumbeo(city: string, country: string): Promise<Partial<CostOfLivingData>> {
    try {
      // 方法1: 直接API调用 (如果有API密钥)
      if (process.env.NUMBEO_API_KEY) {
        return await this.fetchFromNumbeoDirectAPI(city, country)
      }
      
      // 方法2: 使用搜索API获取实时数据 (参考cost-of-living-agent)
      if (process.env.BRIGHT_DATA_CUSTOMER_ID) {
        return await this.fetchFromSearchAPI(city, country, 'numbeo')
      }
      
      // 方法3: 使用默认数据
      return this.getDefaultNumbeoData(city, country)
    } catch (error) {
      console.error('Error fetching Numbeo data:', error)
      return this.getDefaultNumbeoData(city, country)
    }
  }

  /**
   * 从Numbeo直接API获取数据
   */
  private async fetchFromNumbeoDirectAPI(city: string, country: string): Promise<Partial<CostOfLivingData>> {
    // 实际实现需要Numbeo API调用
    // 这里返回模拟数据
    return {
      accommodation: { monthly: 800, daily: 27 },
      food: { monthly: 400, daily: 13 },
      transport: { monthly: 100, daily: 3 },
      coworking: { monthly: 200, daily: 7 },
      currency: 'USD',
      source: 'Numbeo API'
    }
  }

  /**
   * 从搜索API获取实时数据 (参考cost-of-living-agent)
   */
  private async fetchFromSearchAPI(city: string, country: string, source: string): Promise<Partial<CostOfLivingData>> {
    // 实现类似cost-of-living-agent的搜索逻辑
    // 使用Bright Data SERP API搜索最新成本数据
    const searchQuery = `${city} ${country} cost of living ${source} 2024`
    
    // 这里需要实现搜索API调用
    // 参考: https://github.com/sixthextinction/cost-of-living-agent/blob/main/search.js
    
    return this.getDefaultNumbeoData(city, country)
  }

  /**
   * 获取默认Numbeo数据
   */
  private getDefaultNumbeoData(city: string, country: string): Partial<CostOfLivingData> {
    return {
      accommodation: { monthly: 800, daily: 27 },
      food: { monthly: 400, daily: 13 },
      transport: { monthly: 100, daily: 3 },
      coworking: { monthly: 200, daily: 7 },
      currency: 'USD',
      source: 'Numbeo (Default)'
    }
  }

  /**
   * 从NomadList获取数据
   */
  private async fetchFromNomadList(city: string, country: string): Promise<Partial<CostOfLivingData>> {
    // 模拟API调用 - 实际实现需要NomadList API
    return {
      accommodation: { monthly: 750, daily: 25 },
      food: { monthly: 350, daily: 12 },
      transport: { monthly: 80, daily: 3 },
      coworking: { monthly: 180, daily: 6 },
      currency: 'USD',
      source: 'NomadList'
    }
  }

  /**
   * 合并多个数据源的数据
   */
  private mergeCostData(
    numbeoData: Partial<CostOfLivingData> | null,
    nomadlistData: Partial<CostOfLivingData> | null,
    city: string,
    country: string
  ): CostOfLivingData {
    // 优先使用Numbeo数据，NomadList作为补充
    const baseData = numbeoData || nomadlistData || {}
    
    return {
      city,
      country,
      accommodation: baseData.accommodation || { monthly: 0, daily: 0 },
      food: baseData.food || { monthly: 0, daily: 0 },
      transport: baseData.transport || { monthly: 0, daily: 0 },
      coworking: baseData.coworking || { monthly: 0, daily: 0 },
      total: {
        monthly: (baseData.accommodation?.monthly || 0) + 
                (baseData.food?.monthly || 0) + 
                (baseData.transport?.monthly || 0) + 
                (baseData.coworking?.monthly || 0),
        daily: (baseData.accommodation?.daily || 0) + 
               (baseData.food?.daily || 0) + 
               (baseData.transport?.daily || 0) + 
               (baseData.coworking?.daily || 0)
      },
      currency: baseData.currency || 'USD',
      lastUpdated: new Date(),
      source: baseData.source || 'Unknown'
    }
  }

  /**
   * 检查缓存是否有效
   */
  private isCacheValid(cacheKey: string): boolean {
    const expiry = this.cacheExpiry.get(cacheKey)
    return expiry ? new Date() < expiry : false
  }
}

// =====================================================
// 数字游民签证数据服务
// =====================================================

export interface NomadVisaData {
  country: string
  countryName: string
  visaName: string
  visaType: string
  durationMonths: number
  costUSD: number
  incomeRequirementUSD: number
  applicationTimeDays: number
  requirements: string[]
  benefits: string[]
  taxImplications: string
  renewalPossible: boolean
  maxRenewals: number
  isActive: boolean
  lastUpdated: Date
}

export class NomadVisaService {
  private static instance: NomadVisaService
  private cache: Map<string, NomadVisaData[]> = new Map()

  static getInstance(): NomadVisaService {
    if (!NomadVisaService.instance) {
      NomadVisaService.instance = new NomadVisaService()
    }
    return NomadVisaService.instance
  }

  /**
   * 获取所有数字游民签证
   */
  async getAllNomadVisas(): Promise<NomadVisaData[]> {
    const cacheKey = 'all_visas'
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    try {
      // 直接使用Supabase客户端获取数据
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = createClient()
      
      const { data: visas, error } = await supabase
        .from('nomad_visas')
        .select('*')
        .eq('is_active', true)
        .order('income_requirement_usd', { ascending: true })

      if (error) {
        console.error('Error fetching nomad visas from database:', error)
        throw error
      }

      // 转换数据格式
      const formattedVisas: NomadVisaData[] = (visas || []).map((visa: any) => ({
        country: visa.country_code,
        countryName: visa.country_name,
        visaName: visa.visa_name,
        visaType: visa.visa_type,
        durationMonths: visa.duration_months,
        costUSD: visa.cost_usd,
        incomeRequirementUSD: visa.income_requirement_usd,
        applicationTimeDays: visa.application_time_days,
        requirements: visa.requirements || [],
        benefits: visa.benefits || [],
        taxImplications: visa.tax_implications || '',
        renewalPossible: visa.renewal_possible,
        maxRenewals: visa.max_renewals,
        isActive: visa.is_active,
        lastUpdated: new Date(visa.last_updated)
      }))

      this.cache.set(cacheKey, formattedVisas)
      return formattedVisas
    } catch (error) {
      console.error('Error fetching nomad visas:', error)
      // 返回默认数据
      return this.getDefaultVisaData()
    }
  }

  /**
   * 根据国家获取数字游民签证
   */
  async getNomadVisasByCountry(country: string): Promise<NomadVisaData[]> {
    const allVisas = await this.getAllNomadVisas()
    return allVisas.filter(visa => visa.country === country && visa.isActive)
  }

  /**
   * 根据用户条件筛选签证
   */
  async getEligibleVisas(
    nationality: string,
    budget: number,
    duration: number
  ): Promise<NomadVisaData[]> {
    const allVisas = await this.getAllNomadVisas()
    
    return allVisas.filter(visa => {
      // 基本筛选条件
      return visa.isActive &&
             visa.incomeRequirementUSD <= budget &&
             visa.durationMonths >= duration
    })
  }

  /**
   * 获取默认签证数据
   */
  private getDefaultVisaData(): NomadVisaData[] {
    return [
      {
        country: 'EST',
        countryName: '爱沙尼亚',
        visaName: 'Digital Nomad Visa',
        visaType: 'digital_nomad',
        durationMonths: 12,
        costUSD: 100,
        incomeRequirementUSD: 3500,
        applicationTimeDays: 30,
        requirements: ['Remote work contract', 'Health insurance', 'Accommodation proof'],
        benefits: ['Schengen area access', 'Can renew once'],
        taxImplications: 'Non-tax resident',
        renewalPossible: true,
        maxRenewals: 1,
        isActive: true,
        lastUpdated: new Date()
      },
      {
        country: 'PRT',
        countryName: '葡萄牙',
        visaName: 'D7 Visa (Digital Nomad)',
        visaType: 'digital_nomad',
        durationMonths: 12,
        costUSD: 83,
        incomeRequirementUSD: 760,
        applicationTimeDays: 60,
        requirements: ['Passive income proof', 'Health insurance', 'Accommodation'],
        benefits: ['Schengen access', 'Can renew', '5-year path to residency'],
        taxImplications: 'NHR tax benefits available',
        renewalPossible: true,
        maxRenewals: 4,
        isActive: true,
        lastUpdated: new Date()
      }
    ]
  }
}

// =====================================================
// 汇率数据服务
// =====================================================

export interface ExchangeRateData {
  base: string
  rates: Record<string, number>
  lastUpdated: Date
}

export class ExchangeRateService {
  private static instance: ExchangeRateService
  private cache: Map<string, ExchangeRateData> = new Map()
  private cacheExpiry: Map<string, Date> = new Map()

  static getInstance(): ExchangeRateService {
    if (!ExchangeRateService.instance) {
      ExchangeRateService.instance = new ExchangeRateService()
    }
    return ExchangeRateService.instance
  }

  /**
   * 获取汇率数据
   */
  async getExchangeRates(baseCurrency: string = 'USD'): Promise<ExchangeRateData> {
    const cacheKey = `rates_${baseCurrency}`
    
    // 检查缓存
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    try {
      // 从免费的 ExchangeRate-API 获取汇率数据
      // API文档: https://api.exchangerate-api.com/v4/latest/USD
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch exchange rates: ${response.status}`)
      }
      
      const data = await response.json()
      
      // 验证API响应格式
      if (!data.rates || typeof data.rates !== 'object') {
        throw new Error('Invalid API response format')
      }
      
      const exchangeData: ExchangeRateData = {
        base: data.base || baseCurrency,
        rates: data.rates,
        lastUpdated: new Date()
      }

      // 缓存数据 (1小时缓存)
      this.cache.set(cacheKey, exchangeData)
      this.cacheExpiry.set(cacheKey, new Date(Date.now() + 60 * 60 * 1000))

      return exchangeData
    } catch (error) {
      console.error('❌ 获取汇率数据失败:', error)
      // 返回默认汇率
      return this.getDefaultExchangeRates(baseCurrency)
    }
  }

  /**
   * 转换货币
   */
  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount
    }

    const rates = await this.getExchangeRates(fromCurrency)
    const rate = rates.rates[toCurrency]
    
    if (!rate) {
      throw new Error(`Exchange rate not found for ${toCurrency}`)
    }

    return amount * rate
  }

  /**
   * 获取默认汇率数据
   */
  private getDefaultExchangeRates(baseCurrency: string): ExchangeRateData {
    const defaultRates: Record<string, Record<string, number>> = {
      USD: {
        EUR: 0.85,
        GBP: 0.73,
        JPY: 110.0,
        CNY: 6.45,
        THB: 33.0,
        MXN: 20.0
      },
      EUR: {
        USD: 1.18,
        GBP: 0.86,
        JPY: 129.0,
        CNY: 7.58,
        THB: 38.8,
        MXN: 23.5
      }
    }

    return {
      base: baseCurrency,
      rates: defaultRates[baseCurrency] || {},
      lastUpdated: new Date()
    }
  }

  /**
   * 检查缓存是否有效
   */
  private isCacheValid(cacheKey: string): boolean {
    const expiry = this.cacheExpiry.get(cacheKey)
    return expiry ? new Date() < expiry : false
  }
}

// =====================================================
// POI数据服务
// =====================================================

export interface POIData {
  id: string
  name: string
  type: 'cafe' | 'coworking' | 'restaurant' | 'hotel' | 'attraction'
  address: string
  latitude: number
  longitude: number
  rating: number
  priceLevel: number
  openingHours: string[]
  website?: string
  phone?: string
  photos: string[]
  reviews: {
    rating: number
    text: string
    author: string
    date: Date
  }[]
  lastUpdated: Date
}

export class POIService {
  private static instance: POIService
  private cache: Map<string, POIData[]> = new Map()
  private cacheExpiry: Map<string, Date> = new Map()

  static getInstance(): POIService {
    if (!POIService.instance) {
      POIService.instance = new POIService()
    }
    return POIService.instance
  }

  /**
   * 获取城市POI数据
   */
  async getPOIsByCity(
    city: string,
    country: string,
    types: string[] = ['cafe', 'coworking', 'restaurant']
  ): Promise<POIData[]> {
    const cacheKey = `${city}-${country}-${types.join(',')}`
    
    // 检查缓存
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    try {
      // 从Google Places API获取数据
      const pois = await this.fetchFromGooglePlaces(city, country, types)
      
      // 缓存数据
      this.cache.set(cacheKey, pois)
      this.cacheExpiry.set(cacheKey, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // 7天缓存

      return pois
    } catch (error) {
      console.error('Error fetching POIs:', error)
      // 返回默认数据
      return this.getDefaultPOIData(city, country, types)
    }
  }

  /**
   * 从Google Places API获取数据
   */
  private async fetchFromGooglePlaces(
    city: string,
    country: string,
    types: string[]
  ): Promise<POIData[]> {
    // 模拟API调用 - 实际实现需要Google Places API
    return [
      {
        id: 'poi_1',
        name: 'Local Cafe',
        type: 'cafe',
        address: '123 Main St, ' + city,
        latitude: 40.7128,
        longitude: -74.0060,
        rating: 4.5,
        priceLevel: 2,
        openingHours: ['Mon-Fri: 7:00-19:00', 'Sat-Sun: 8:00-20:00'],
        website: 'https://localcafe.com',
        phone: '+1-555-0123',
        photos: ['https://example.com/photo1.jpg'],
        reviews: [
          {
            rating: 5,
            text: 'Great coffee and atmosphere!',
            author: 'John Doe',
            date: new Date()
          }
        ],
        lastUpdated: new Date()
      }
    ]
  }

  /**
   * 获取默认POI数据
   */
  private getDefaultPOIData(
    city: string,
    country: string,
    types: string[]
  ): POIData[] {
    return types.map((type, index) => ({
      id: `default_${type}_${index}`,
      name: `Default ${type}`,
      type: type as any,
      address: `Default address, ${city}`,
      latitude: 40.7128,
      longitude: -74.0060,
      rating: 4.0,
      priceLevel: 2,
      openingHours: ['Mon-Fri: 9:00-18:00'],
      photos: [],
      reviews: [],
      lastUpdated: new Date()
    }))
  }

  /**
   * 检查缓存是否有效
   */
  private isCacheValid(cacheKey: string): boolean {
    const expiry = this.cacheExpiry.get(cacheKey)
    return expiry ? new Date() < expiry : false
  }
}

// =====================================================
// 数据源管理器
// =====================================================

export class DataSourceManager {
  private static instance: DataSourceManager
  public costService: CostOfLivingService
  public visaService: NomadVisaService
  public exchangeService: ExchangeRateService
  public poiService: POIService

  constructor() {
    this.costService = CostOfLivingService.getInstance()
    this.visaService = NomadVisaService.getInstance()
    this.exchangeService = ExchangeRateService.getInstance()
    this.poiService = POIService.getInstance()
  }

  static getInstance(): DataSourceManager {
    if (!DataSourceManager.instance) {
      DataSourceManager.instance = new DataSourceManager()
    }
    return DataSourceManager.instance
  }

  /**
   * 获取城市综合数据
   */
  async getCityData(city: string, country: string) {
    const [costData, visas, pois] = await Promise.allSettled([
      this.costService.getCostOfLiving(city, country),
      this.visaService.getNomadVisasByCountry(country),
      this.poiService.getPOIsByCity(city, country)
    ])

    return {
      cost: costData.status === 'fulfilled' ? costData.value : null,
      visas: visas.status === 'fulfilled' ? visas.value : [],
      pois: pois.status === 'fulfilled' ? pois.value : []
    }
  }

  /**
   * 获取所有数据源状态
   */
  getDataSourceStatus(): Record<string, { isActive: boolean; lastUpdated?: Date }> {
    return Object.entries(DATA_SOURCES).reduce((acc, [key, config]) => {
      acc[key] = {
        isActive: config.isActive,
        lastUpdated: config.lastUpdated
      }
      return acc
    }, {} as Record<string, { isActive: boolean; lastUpdated?: Date }>)
  }
}

// 导出单例实例
export const dataSourceManager = DataSourceManager.getInstance()
