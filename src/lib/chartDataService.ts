// Chart Data Service
// 为图表组件提供数据生成和处理服务

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
  category?: string
}

export interface CostChartData {
  city: string
  country: string
  accommodation: number
  food: number
  transportation: number
  entertainment: number
  coworking: number
  internet: number
  total: number
}

export interface WeatherChartData {
  date: string
  high: number
  low: number
  condition: string
  humidity: number
  windSpeed: number
}

export interface CommunityChartData {
  city: string
  country: string
  communitySize: number
  activeEvents: number
  coworkingSpaces: number
  meetupFrequency: string
  averageAge: number
  topNationalities: string[]
}

export interface TrendChartData {
  date: string
  cost: number
  community: number
  events: number
  temperature: number
  exchangeRate: number
}

export class ChartDataService {
  // 生成模拟成本数据
  static generateCostData(cities: { name: string; country: string }[]): CostChartData[] {
    return cities.map(city => {
      const baseCost = this.getBaseCostByCountry(city.country)
      const variation = 0.8 + Math.random() * 0.4 // 80%-120% 变化
      
      const accommodation = Math.round(baseCost.accommodation * variation)
      const food = Math.round(baseCost.food * variation)
      const transportation = Math.round(baseCost.transportation * variation)
      const entertainment = Math.round(baseCost.entertainment * variation)
      const coworking = Math.round(baseCost.coworking * variation)
      const internet = Math.round(baseCost.internet * variation)
      
      return {
        city: city.name,
        country: city.country,
        accommodation,
        food,
        transportation,
        entertainment,
        coworking,
        internet,
        total: accommodation + food + transportation + entertainment + coworking + internet
      }
    })
  }

  // 生成模拟天气数据
  static generateWeatherData(city: string, country: string, days: number = 7): WeatherChartData[] {
    const baseTemp = this.getBaseTemperatureByCountry(country)
    const data: WeatherChartData[] = []
    
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      
      const tempVariation = (Math.random() - 0.5) * 10 // ±5°C 变化
      const high = Math.round(baseTemp + tempVariation + 5)
      const low = Math.round(baseTemp + tempVariation - 5)
      
      data.push({
        date: date.toISOString().split('T')[0],
        high: Math.max(high, low + 2),
        low: Math.min(low, high - 2),
        condition: this.getRandomWeatherCondition(),
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        windSpeed: Math.floor(Math.random() * 20) + 5 // 5-25 km/h
      })
    }
    
    return data
  }

  // 生成模拟社区数据
  static generateCommunityData(cities: { name: string; country: string }[]): CommunityChartData[] {
    return cities.map(city => {
      const baseSize = this.getBaseCommunitySizeByCountry(city.country)
      const variation = 0.7 + Math.random() * 0.6 // 70%-130% 变化
      
      return {
        city: city.name,
        country: city.country,
        communitySize: Math.round(baseSize * variation),
        activeEvents: Math.floor(Math.random() * 20) + 5,
        coworkingSpaces: Math.floor(Math.random() * 15) + 3,
        meetupFrequency: this.getRandomMeetupFrequency(),
        averageAge: Math.floor(Math.random() * 10) + 28, // 28-38岁
        topNationalities: this.getRandomNationalities()
      }
    })
  }

  // 生成模拟趋势数据
  static generateTrendData(city: string, country: string, days: number = 30): TrendChartData[] {
    const data: TrendChartData[] = []
    const baseCost = this.getBaseCostByCountry(country).total
    const baseCommunity = this.getBaseCommunitySizeByCountry(country)
    const baseTemp = this.getBaseTemperatureByCountry(country)
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      // 添加趋势和随机波动
      const trendFactor = 1 + (days - i) * 0.01 // 轻微上升趋势
      const randomFactor = 0.9 + Math.random() * 0.2 // 90%-110% 随机波动
      
      data.push({
        date: date.toISOString().split('T')[0],
        cost: Math.round(baseCost * trendFactor * randomFactor),
        community: Math.round(baseCommunity * trendFactor * randomFactor),
        events: Math.floor(Math.random() * 15) + 5,
        temperature: Math.round(baseTemp + (Math.random() - 0.5) * 10),
        exchangeRate: 1 + (Math.random() - 0.5) * 0.1 // ±5% 汇率波动
      })
    }
    
    return data
  }

  // 获取国家基础成本
  private static getBaseCostByCountry(country: string) {
    const costMap: { [key: string]: any } = {
      'Thailand': { accommodation: 800, food: 300, transportation: 100, entertainment: 200, coworking: 150, internet: 30 },
      'Malaysia': { accommodation: 600, food: 250, transportation: 80, entertainment: 150, coworking: 120, internet: 25 },
      'Vietnam': { accommodation: 500, food: 200, transportation: 60, entertainment: 120, coworking: 100, internet: 20 },
      'Indonesia': { accommodation: 400, food: 180, transportation: 50, entertainment: 100, coworking: 80, internet: 15 },
      'Japan': { accommodation: 1200, food: 500, transportation: 200, entertainment: 400, coworking: 300, internet: 50 },
      'South Korea': { accommodation: 1000, food: 400, transportation: 150, entertainment: 300, coworking: 250, internet: 40 },
      'Singapore': { accommodation: 1500, food: 600, transportation: 250, entertainment: 500, coworking: 400, internet: 60 },
      'Philippines': { accommodation: 600, food: 250, transportation: 80, entertainment: 150, coworking: 120, internet: 25 },
      'Taiwan': { accommodation: 800, food: 350, transportation: 120, entertainment: 250, coworking: 180, internet: 35 },
      'Hong Kong': { accommodation: 1800, food: 700, transportation: 300, entertainment: 600, coworking: 500, internet: 70 }
    }
    
    return costMap[country] || { accommodation: 800, food: 300, transportation: 100, entertainment: 200, coworking: 150, internet: 30 }
  }

  // 获取国家基础温度
  private static getBaseTemperatureByCountry(country: string): number {
    const tempMap: { [key: string]: number } = {
      'Thailand': 30,
      'Malaysia': 28,
      'Vietnam': 26,
      'Indonesia': 27,
      'Japan': 15,
      'South Korea': 12,
      'Singapore': 28,
      'Philippines': 29,
      'Taiwan': 22,
      'Hong Kong': 23
    }
    
    return tempMap[country] || 25
  }

  // 获取国家基础社区规模
  private static getBaseCommunitySizeByCountry(country: string): number {
    const sizeMap: { [key: string]: number } = {
      'Thailand': 500,
      'Malaysia': 300,
      'Vietnam': 200,
      'Indonesia': 150,
      'Japan': 800,
      'South Korea': 600,
      'Singapore': 400,
      'Philippines': 250,
      'Taiwan': 350,
      'Hong Kong': 450
    }
    
    return sizeMap[country] || 300
  }

  // 获取随机天气条件
  private static getRandomWeatherCondition(): string {
    const conditions = ['sunny', 'cloudy', 'rainy', 'partly-cloudy']
    return conditions[Math.floor(Math.random() * conditions.length)]
  }

  // 获取随机聚会频率
  private static getRandomMeetupFrequency(): string {
    const frequencies = ['daily', 'weekly', 'bi-weekly', 'monthly']
    return frequencies[Math.floor(Math.random() * frequencies.length)]
  }

  // 获取随机国籍
  private static getRandomNationalities(): string[] {
    const nationalities = ['US', 'UK', 'DE', 'FR', 'AU', 'CA', 'NL', 'SE', 'NO', 'DK']
    const count = Math.floor(Math.random() * 3) + 2 // 2-4个国籍
    return nationalities.sort(() => 0.5 - Math.random()).slice(0, count)
  }

  // 数据聚合和统计
  static aggregateData(data: any[], groupBy: string, aggregateField: string) {
    const grouped = data.reduce((acc, item) => {
      const key = item[groupBy]
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(item[aggregateField])
      return acc
    }, {})

    return Object.entries(grouped).map(([key, values]: [string, any]) => ({
      [groupBy]: key,
      [aggregateField]: values.reduce((sum: number, val: number) => sum + val, 0) / values.length,
      count: values.length
    }))
  }

  // 计算数据趋势
  static calculateTrend(values: number[]): { direction: 'up' | 'down' | 'stable'; percentage: number } {
    if (values.length < 2) return { direction: 'stable', percentage: 0 }
    
    const first = values[0]
    const last = values[values.length - 1]
    const percentage = ((last - first) / first) * 100
    
    if (percentage > 5) return { direction: 'up', percentage: Math.abs(percentage) }
    if (percentage < -5) return { direction: 'down', percentage: Math.abs(percentage) }
    return { direction: 'stable', percentage: Math.abs(percentage) }
  }

  // 数据格式化
  static formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  static formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value)
  }

  static formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`
  }
}
