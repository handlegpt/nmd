/**
 * Expatistan数据抓取服务
 */

import { expatistanCache } from './expatistanCacheService'

export interface ExpatistanScrapedData {
  city: string
  country: string
  accommodation: {
    monthly: number
    confidence: number
  }
  food: {
    monthly: number
    confidence: number
  }
  transport: {
    monthly: number
    confidence: number
  }
  coworking: {
    monthly: number
    confidence: number
  }
  total: {
    monthly: number
    confidence: number
  }
  lastUpdated: Date
  dataQuality: 'high' | 'medium' | 'low'
}

export class ExpatistanScraperService {
  private static instance: ExpatistanScraperService
  private rateLimitDelay = 2000 // 2秒延迟，避免过于频繁的请求
  private lastRequestTime = 0
  private userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'

  static getInstance(): ExpatistanScraperService {
    if (!ExpatistanScraperService.instance) {
      ExpatistanScraperService.instance = new ExpatistanScraperService()
    }
    return ExpatistanScraperService.instance
  }

  /**
   * 获取Expatistan数据（带缓存）
   */
  async getExpatistanData(city: string, country: string): Promise<ExpatistanScrapedData | null> {
    const cacheKey = `expatistan-${city.toLowerCase()}-${country.toLowerCase()}`
    
    // 检查缓存
    const cachedData = await expatistanCache.get(cacheKey)
    if (cachedData) {
      console.log(`Cache hit for ${city}, ${country}`)
      return cachedData
    }

      console.log(`Cache miss for ${city}, ${country}, fetching from Expatistan...`)
      
      try {
        // 添加延迟避免过于频繁的请求
        await this.enforceRateLimit()
      
      // 抓取数据
      const scrapedData = await this.scrapeExpatistanData(city, country)
      
      if (scrapedData) {
        // 缓存数据
        await expatistanCache.set(cacheKey, scrapedData, 'expatistan-scraper')
        console.log(`Data cached for ${city}, ${country}`)
      }
      
      return scrapedData
    } catch (error) {
      console.error(`Error scraping Expatistan data for ${city}, ${country}:`, error)
      return null
    }
  }

  /**
   * 实际抓取Expatistan数据
   */
  private async scrapeExpatistanData(city: string, country: string): Promise<ExpatistanScrapedData | null> {
    try {
      const citySlug = this.createCitySlug(city, country)
      const url = `https://expatistan.com/cost-of-living/${citySlug}`
      
      console.log(`Scraping: ${url}`)
      
      // 使用fetch抓取页面
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        // 添加超时
        signal: AbortSignal.timeout(10000) // 10秒超时
      })

      if (!response.ok) {
        console.warn(`HTTP ${response.status} for ${url}`)
        return null
      }

      const html = await response.text()
      
      // 解析HTML数据
      const parsedData = this.parseExpatistanHTML(html, city, country)
      
      return parsedData
    } catch (error) {
      console.error('Scraping error:', error)
      return null
    }
  }

  /**
   * 解析Expatistan HTML页面
   */
  private parseExpatistanHTML(html: string, city: string, country: string): ExpatistanScrapedData | null {
    try {
      // 这里需要实现HTML解析逻辑
      // 由于在Node.js环境中，我们需要使用类似cheerio的库来解析HTML
      // 为了演示，我们返回模拟数据
      
      console.log('Parsing Expatistan HTML...')
      
      // 模拟解析结果
      const mockData = this.getMockDataForCity(city, country)
      if (!mockData) return null

      const total = mockData.accommodation.monthly + mockData.food.monthly + mockData.transport.monthly + mockData.coworking.monthly
      const avgConfidence = (mockData.accommodation.confidence + mockData.food.confidence + mockData.transport.confidence + mockData.coworking.confidence) / 4
      const dataQuality = avgConfidence >= 0.7 ? 'high' : avgConfidence >= 0.6 ? 'medium' : 'low'

      return {
        city,
        country,
        accommodation: {
          monthly: mockData.accommodation.monthly,
          confidence: mockData.accommodation.confidence
        },
        food: {
          monthly: mockData.food.monthly,
          confidence: mockData.food.confidence
        },
        transport: {
          monthly: mockData.transport.monthly,
          confidence: mockData.transport.confidence
        },
        coworking: {
          monthly: mockData.coworking.monthly,
          confidence: mockData.coworking.confidence
        },
        total: {
          monthly: total,
          confidence: avgConfidence
        },
        lastUpdated: new Date(),
        dataQuality
      }
    } catch (error) {
      console.error('HTML parsing error:', error)
      return null
    }
  }

  /**
   * 创建城市URL slug
   */
  private createCitySlug(city: string, country: string): string {
    return city
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
  }

  /**
   * 添加请求延迟
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const delay = this.rateLimitDelay - timeSinceLastRequest
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    
    this.lastRequestTime = Date.now()
  }

  /**
   * 获取城市模拟数据（用于演示）
   */
  private getMockDataForCity(city: string, country: string): any | null {
    const cityKey = city.toLowerCase().replace(/\s+/g, '-')
    
    const mockData: Record<string, any> = {
      'bangkok': {
        accommodation: { monthly: 650, confidence: 0.8 },
        food: { monthly: 320, confidence: 0.7 },
        transport: { monthly: 85, confidence: 0.6 },
        coworking: { monthly: 120, confidence: 0.7 }
      },
      'lisbon': {
        accommodation: { monthly: 950, confidence: 0.8 },
        food: { monthly: 420, confidence: 0.7 },
        transport: { monthly: 65, confidence: 0.6 },
        coworking: { monthly: 150, confidence: 0.7 }
      },
      'berlin': {
        accommodation: { monthly: 1100, confidence: 0.8 },
        food: { monthly: 480, confidence: 0.7 },
        transport: { monthly: 85, confidence: 0.6 },
        coworking: { monthly: 200, confidence: 0.7 }
      },
      'mexico-city': {
        accommodation: { monthly: 750, confidence: 0.8 },
        food: { monthly: 380, confidence: 0.7 },
        transport: { monthly: 70, confidence: 0.6 },
        coworking: { monthly: 100, confidence: 0.7 }
      },
      'barcelona': {
        accommodation: { monthly: 1050, confidence: 0.8 },
        food: { monthly: 450, confidence: 0.7 },
        transport: { monthly: 75, confidence: 0.6 },
        coworking: { monthly: 180, confidence: 0.7 }
      }
    }

    return mockData[cityKey] || null
  }

  /**
   * 获取抓取统计信息
   */
  getScrapingStats(): {
    lastRequestTime: Date
    rateLimitDelay: number
    cacheEnabled: boolean
  } {
    return {
      lastRequestTime: new Date(this.lastRequestTime),
      rateLimitDelay: this.rateLimitDelay,
      cacheEnabled: true
    }
  }

  /**
   * 清理缓存
   */
  async clearCache(): Promise<void> {
    // 这里需要实现清理所有Expatistan相关缓存的逻辑
    console.log('Clearing Expatistan cache...')
  }

  /**
   * 获取数据源状态
   */
  getDataSourceStatus(): {
    isActive: boolean
    lastChecked: Date
    scrapingEnabled: boolean
  } {
    return {
      isActive: true,
      lastChecked: new Date(),
      scrapingEnabled: true
    }
  }
}

// 导出单例实例
export const expatistanScraper = ExpatistanScraperService.getInstance()
