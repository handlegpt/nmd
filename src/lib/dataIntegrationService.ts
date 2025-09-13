// Data Integration Service for Nomad Agent
// 集成多个数据源提供实时信息

export interface WeatherData {
  city: string
  country: string
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  forecast: {
    date: string
    high: number
    low: number
    condition: string
  }[]
}

export interface ExchangeRateData {
  from: string
  to: string
  rate: number
  lastUpdated: string
}

export interface CostOfLivingData {
  city: string
  country: string
  currency: string
  categories: {
    accommodation: number
    food: number
    transportation: number
    entertainment: number
    coworking: number
    internet: number
  }
  lastUpdated: string
}

export interface VisaInfoData {
  fromCountry: string
  toCountry: string
  visaType: string
  duration: number
  cost: number
  requirements: string[]
  processingTime: string
  lastUpdated: string
}

export interface NomadCommunityData {
  city: string
  country: string
  communitySize: number
  activeEvents: number
  coworkingSpaces: number
  meetupFrequency: string
  averageAge: number
  topNationalities: string[]
  lastUpdated: string
}

export class DataIntegrationService {
  private static cache = new Map<string, { data: any; timestamp: number }>()
  private static CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

  // 缓存管理
  private static getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T
    }
    return null
  }

  private static setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  // 天气数据集成
  static async getWeatherData(city: string, country: string): Promise<WeatherData | null> {
    const cacheKey = `weather_${city}_${country}`
    const cached = this.getCachedData<WeatherData>(cacheKey)
    if (cached) return cached

    try {
      // 使用 OpenWeatherMap API (需要API key)
      // 这里使用模拟数据，实际使用时需要配置API key
      const mockWeatherData: WeatherData = {
        city,
        country,
        temperature: Math.floor(Math.random() * 30) + 15, // 15-45°C
        condition: ['sunny', 'cloudy', 'rainy', 'partly-cloudy'][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
        forecast: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          high: Math.floor(Math.random() * 10) + 25,
          low: Math.floor(Math.random() * 10) + 15,
          condition: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)]
        }))
      }

      this.setCachedData(cacheKey, mockWeatherData)
      return mockWeatherData
    } catch (error) {
      console.error('Error fetching weather data:', error)
      return null
    }
  }

  // 汇率数据集成
  static async getExchangeRate(from: string, to: string): Promise<ExchangeRateData | null> {
    const cacheKey = `exchange_${from}_${to}`
    const cached = this.getCachedData<ExchangeRateData>(cacheKey)
    if (cached) return cached

    try {
      // 使用 ExchangeRate-API (免费版本)
      // 这里使用模拟数据
      const mockExchangeData: ExchangeRateData = {
        from,
        to,
        rate: this.getMockExchangeRate(from, to),
        lastUpdated: new Date().toISOString()
      }

      this.setCachedData(cacheKey, mockExchangeData)
      return mockExchangeData
    } catch (error) {
      console.error('Error fetching exchange rate:', error)
      return null
    }
  }

  // 生活成本数据集成
  static async getCostOfLivingData(city: string, country: string): Promise<CostOfLivingData | null> {
    const cacheKey = `cost_${city}_${country}`
    const cached = this.getCachedData<CostOfLivingData>(cacheKey)
    if (cached) return cached

    try {
      // 集成 Numbeo 或类似的生活成本数据源
      // 这里使用模拟数据
      const mockCostData: CostOfLivingData = {
        city,
        country,
        currency: this.getCurrencyByCountry(country),
        categories: {
          accommodation: Math.floor(Math.random() * 1000) + 500,
          food: Math.floor(Math.random() * 400) + 200,
          transportation: Math.floor(Math.random() * 200) + 50,
          entertainment: Math.floor(Math.random() * 300) + 100,
          coworking: Math.floor(Math.random() * 200) + 100,
          internet: Math.floor(Math.random() * 50) + 20
        },
        lastUpdated: new Date().toISOString()
      }

      this.setCachedData(cacheKey, mockCostData)
      return mockCostData
    } catch (error) {
      console.error('Error fetching cost of living data:', error)
      return null
    }
  }

  // 签证信息数据集成
  static async getVisaInfo(fromCountry: string, toCountry: string): Promise<VisaInfoData | null> {
    const cacheKey = `visa_${fromCountry}_${toCountry}`
    const cached = this.getCachedData<VisaInfoData>(cacheKey)
    if (cached) return cached

    try {
      // 集成签证信息数据源
      // 这里使用模拟数据
      const mockVisaData: VisaInfoData = {
        fromCountry,
        toCountry,
        visaType: this.getMockVisaType(fromCountry, toCountry),
        duration: this.getMockVisaDuration(fromCountry, toCountry),
        cost: this.getMockVisaCost(fromCountry, toCountry),
        requirements: this.getMockVisaRequirements(fromCountry, toCountry),
        processingTime: this.getMockProcessingTime(fromCountry, toCountry),
        lastUpdated: new Date().toISOString()
      }

      this.setCachedData(cacheKey, mockVisaData)
      return mockVisaData
    } catch (error) {
      console.error('Error fetching visa info:', error)
      return null
    }
  }

  // 数字游民社区数据集成
  static async getNomadCommunityData(city: string, country: string): Promise<NomadCommunityData | null> {
    const cacheKey = `community_${city}_${country}`
    const cached = this.getCachedData<NomadCommunityData>(cacheKey)
    if (cached) return cached

    try {
      // 集成 NomadList 或类似社区数据源
      // 这里使用模拟数据
      const mockCommunityData: NomadCommunityData = {
        city,
        country,
        communitySize: Math.floor(Math.random() * 1000) + 100,
        activeEvents: Math.floor(Math.random() * 20) + 5,
        coworkingSpaces: Math.floor(Math.random() * 15) + 3,
        meetupFrequency: ['daily', 'weekly', 'bi-weekly', 'monthly'][Math.floor(Math.random() * 4)],
        averageAge: Math.floor(Math.random() * 10) + 28,
        topNationalities: ['US', 'UK', 'DE', 'FR', 'AU'].slice(0, Math.floor(Math.random() * 3) + 2),
        lastUpdated: new Date().toISOString()
      }

      this.setCachedData(cacheKey, mockCommunityData)
      return mockCommunityData
    } catch (error) {
      console.error('Error fetching community data:', error)
      return null
    }
  }

  // 批量获取城市数据
  static async getCityDataBatch(cities: { name: string; country: string }[]): Promise<{
    weather: WeatherData[]
    costOfLiving: CostOfLivingData[]
    community: NomadCommunityData[]
  }> {
    const promises = cities.map(async (city) => {
      const [weather, costOfLiving, community] = await Promise.all([
        this.getWeatherData(city.name, city.country),
        this.getCostOfLivingData(city.name, city.country),
        this.getNomadCommunityData(city.name, city.country)
      ])

      return { weather, costOfLiving, community }
    })

    const results = await Promise.all(promises)

    return {
      weather: results.map(r => r.weather).filter(Boolean) as WeatherData[],
      costOfLiving: results.map(r => r.costOfLiving).filter(Boolean) as CostOfLivingData[],
      community: results.map(r => r.community).filter(Boolean) as NomadCommunityData[]
    }
  }

  // 模拟数据生成方法
  private static getMockExchangeRate(from: string, to: string): number {
    const rates: { [key: string]: number } = {
      'USD_EUR': 0.85,
      'USD_GBP': 0.73,
      'USD_JPY': 110,
      'USD_CNY': 6.45,
      'USD_THB': 33.5,
      'USD_MYR': 4.2,
      'USD_VND': 23000,
      'USD_IDR': 14500
    }
    return rates[`${from}_${to}`] || 1
  }

  private static getCurrencyByCountry(country: string): string {
    const currencies: { [key: string]: string } = {
      'Thailand': 'THB',
      'Malaysia': 'MYR',
      'Vietnam': 'VND',
      'Indonesia': 'IDR',
      'Japan': 'JPY',
      'South Korea': 'KRW',
      'Singapore': 'SGD',
      'Philippines': 'PHP',
      'Taiwan': 'TWD',
      'Hong Kong': 'HKD'
    }
    return currencies[country] || 'USD'
  }

  private static getMockVisaType(fromCountry: string, toCountry: string): string {
    if (fromCountry === 'CN') {
      const visaFreeCountries = ['Thailand', 'Malaysia', 'Vietnam', 'Indonesia']
      return visaFreeCountries.includes(toCountry) ? 'Visa Free' : 'Tourist Visa'
    }
    return 'Visa Free'
  }

  private static getMockVisaDuration(fromCountry: string, toCountry: string): number {
    if (fromCountry === 'CN') {
      const longStayCountries = ['Thailand', 'Malaysia']
      return longStayCountries.includes(toCountry) ? 90 : 30
    }
    return 90
  }

  private static getMockVisaCost(fromCountry: string, toCountry: string): number {
    if (fromCountry === 'CN') {
      const freeCountries = ['Thailand', 'Malaysia', 'Vietnam', 'Indonesia']
      return freeCountries.includes(toCountry) ? 0 : 50
    }
    return 0
  }

  private static getMockVisaRequirements(fromCountry: string, toCountry: string): string[] {
    if (fromCountry === 'CN') {
      return [
        'Valid passport with 6+ months validity',
        'Proof of accommodation',
        'Return flight ticket',
        'Bank statement showing sufficient funds',
        'Travel insurance'
      ]
    }
    return ['Valid passport']
  }

  private static getMockProcessingTime(fromCountry: string, toCountry: string): string {
    if (fromCountry === 'CN') {
      const quickCountries = ['Thailand', 'Malaysia', 'Vietnam']
      return quickCountries.includes(toCountry) ? '1-3 business days' : '5-10 business days'
    }
    return 'Same day'
  }

  // 清除缓存
  static clearCache(): void {
    this.cache.clear()
  }

  // 获取缓存统计
  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}
