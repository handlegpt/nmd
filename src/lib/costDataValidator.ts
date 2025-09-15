/**
 * 成本数据验证和测试工具
 * 用于验证数据获取的准确性和城市匹配
 */

export interface DataValidationResult {
  isValid: boolean
  issues: string[]
  warnings: string[]
  suggestions: string[]
  dataSource: string
  confidence: number
}

export interface CityMatchResult {
  isExactMatch: boolean
  matchedCity: string | null
  matchedCountry: string | null
  similarity: number
  alternatives: Array<{
    city: string
    country: string
    similarity: number
  }>
}

export class CostDataValidator {
  private static instance: CostDataValidator

  static getInstance(): CostDataValidator {
    if (!CostDataValidator.instance) {
      CostDataValidator.instance = new CostDataValidator()
    }
    return CostDataValidator.instance
  }

  /**
   * 验证城市名称匹配
   */
  validateCityMatch(city: string, country: string): CityMatchResult {
    const normalizedCity = this.normalizeCityName(city)
    const normalizedCountry = this.normalizeCountryName(country)
    
    // 检查精确匹配
    const exactMatch = this.findExactMatch(normalizedCity, normalizedCountry)
    if (exactMatch) {
      return {
        isExactMatch: true,
        matchedCity: exactMatch.city,
        matchedCountry: exactMatch.country,
        similarity: 1.0,
        alternatives: []
      }
    }

    // 查找相似匹配
    const similarMatches = this.findSimilarMatches(normalizedCity, normalizedCountry)
    const bestMatch = similarMatches[0]

    return {
      isExactMatch: false,
      matchedCity: bestMatch?.city || null,
      matchedCountry: bestMatch?.country || null,
      similarity: bestMatch?.similarity || 0,
      alternatives: similarMatches.slice(0, 5)
    }
  }

  /**
   * 验证成本数据的合理性
   */
  validateCostData(costData: any, city: string, country: string): DataValidationResult {
    const issues: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // 检查数据完整性
    if (!costData.accommodation || costData.accommodation.monthly <= 0) {
      issues.push('Missing or invalid accommodation data')
    }
    if (!costData.food || costData.food.monthly <= 0) {
      issues.push('Missing or invalid food data')
    }
    if (!costData.transport || costData.transport.monthly <= 0) {
      issues.push('Missing or invalid transport data')
    }

    // 检查数据合理性
    this.validateCostReasonableness(costData, city, country, issues, warnings, suggestions)

    // 检查数据一致性
    this.validateDataConsistency(costData, issues, warnings)

    const isValid = issues.length === 0
    const confidence = this.calculateConfidence(costData, issues, warnings)

    return {
      isValid,
      issues,
      warnings,
      suggestions,
      dataSource: costData.accommodation?.source || 'Unknown',
      confidence
    }
  }

  /**
   * 标准化城市名称
   */
  private normalizeCityName(city: string): string {
    return city
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // 移除特殊字符
      .replace(/\s+/g, ' ') // 标准化空格
      .trim()
  }

  /**
   * 标准化国家名称
   */
  private normalizeCountryName(country: string): string {
    return country
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * 查找精确匹配
   */
  private findExactMatch(city: string, country: string): { city: string; country: string } | null {
    const knownCities = this.getKnownCities()
    
    for (const [countryKey, cities] of Object.entries(knownCities)) {
      if (countryKey.toLowerCase() === country) {
        for (const cityKey of Object.keys(cities)) {
          if (cityKey.toLowerCase() === city) {
            return { city: cityKey, country: countryKey }
          }
        }
      }
    }
    
    return null
  }

  /**
   * 查找相似匹配
   */
  private findSimilarMatches(city: string, country: string): Array<{
    city: string
    country: string
    similarity: number
  }> {
    const knownCities = this.getKnownCities()
    const matches: Array<{ city: string; country: string; similarity: number }> = []

    for (const [countryKey, cities] of Object.entries(knownCities)) {
      const countrySimilarity = this.calculateSimilarity(country, countryKey.toLowerCase())
      
      for (const cityKey of Object.keys(cities)) {
        const citySimilarity = this.calculateSimilarity(city, cityKey.toLowerCase())
        const combinedSimilarity = (countrySimilarity + citySimilarity) / 2
        
        if (combinedSimilarity > 0.6) {
          matches.push({
            city: cityKey,
            country: countryKey,
            similarity: combinedSimilarity
          })
        }
      }
    }

    return matches.sort((a, b) => b.similarity - a.similarity)
  }

  /**
   * 计算字符串相似度
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  /**
   * 计算编辑距离
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  /**
   * 验证成本合理性
   */
  private validateCostReasonableness(
    costData: any,
    city: string,
    country: string,
    issues: string[],
    warnings: string[],
    suggestions: string[]
  ): void {
    const { accommodation, food, transport, coworking } = costData

    // 住宿成本检查
    if (accommodation?.monthly) {
      if (accommodation.monthly < 200) {
        warnings.push('Accommodation cost seems unusually low')
      } else if (accommodation.monthly > 3000) {
        warnings.push('Accommodation cost seems unusually high')
      }
    }

    // 餐饮成本检查
    if (food?.monthly) {
      if (food.monthly < 100) {
        warnings.push('Food cost seems unusually low')
      } else if (food.monthly > 1500) {
        warnings.push('Food cost seems unusually high')
      }
    }

    // 交通成本检查
    if (transport?.monthly) {
      if (transport.monthly < 20) {
        warnings.push('Transport cost seems unusually low')
      } else if (transport.monthly > 500) {
        warnings.push('Transport cost seems unusually high')
      }
    }

    // 联合办公成本检查
    if (coworking?.monthly) {
      if (coworking.monthly < 50) {
        warnings.push('Coworking cost seems unusually low')
      } else if (coworking.monthly > 800) {
        warnings.push('Coworking cost seems unusually high')
      }
    }

    // 总成本检查
    const total = (accommodation?.monthly || 0) + (food?.monthly || 0) + (transport?.monthly || 0) + (coworking?.monthly || 0)
    if (total < 500) {
      warnings.push('Total monthly cost seems unusually low')
      suggestions.push('Consider if this is a budget destination or if data is incomplete')
    } else if (total > 4000) {
      warnings.push('Total monthly cost seems unusually high')
      suggestions.push('Consider if this is a luxury destination or if data includes premium options')
    }
  }

  /**
   * 验证数据一致性
   */
  private validateDataConsistency(costData: any, issues: string[], warnings: string[]): void {
    const { accommodation, food, transport, coworking } = costData

    // 检查数据源一致性
    const sources = [accommodation?.source, food?.source, transport?.source, coworking?.source]
    const uniqueSources = [...new Set(sources.filter(Boolean))]
    
    if (uniqueSources.length > 2) {
      warnings.push('Data comes from multiple sources, which may affect consistency')
    }

    // 检查可信度一致性
    const confidences = [accommodation?.confidence, food?.confidence, transport?.confidence, coworking?.confidence]
    const avgConfidence = confidences.reduce((sum, conf) => sum + (conf || 0), 0) / confidences.length
    
    if (avgConfidence < 0.5) {
      warnings.push('Overall data confidence is low')
    }
  }

  /**
   * 计算数据可信度
   */
  private calculateConfidence(costData: any, issues: string[], warnings: string[]): number {
    let confidence = 1.0
    
    // 根据问题数量降低可信度
    confidence -= issues.length * 0.3
    confidence -= warnings.length * 0.1
    
    // 根据数据完整性调整
    const { accommodation, food, transport, coworking } = costData
    const completeness = [accommodation, food, transport, coworking].filter(Boolean).length / 4
    confidence *= completeness
    
    return Math.max(0, Math.min(1, confidence))
  }

  /**
   * 获取已知城市列表
   */
  private getKnownCities(): Record<string, Record<string, any>> {
    return {
      'Thailand': {
        'Bangkok': {},
        'Chiang Mai': {},
        'Phuket': {},
        'Pattaya': {}
      },
      'Portugal': {
        'Lisbon': {},
        'Porto': {},
        'Faro': {}
      },
      'Germany': {
        'Berlin': {},
        'Munich': {},
        'Hamburg': {},
        'Cologne': {}
      },
      'Mexico': {
        'Mexico City': {},
        'Guadalajara': {},
        'Playa del Carmen': {},
        'Tulum': {}
      },
      'Spain': {
        'Barcelona': {},
        'Madrid': {},
        'Valencia': {},
        'Seville': {}
      },
      'Czech Republic': {
        'Prague': {},
        'Brno': {}
      },
      'Hungary': {
        'Budapest': {}
      },
      'Estonia': {
        'Tallinn': {}
      },
      'Latvia': {
        'Riga': {}
      },
      'Lithuania': {
        'Vilnius': {}
      },
      'Poland': {
        'Warsaw': {},
        'Krakow': {}
      },
      'Romania': {
        'Bucharest': {},
        'Cluj-Napoca': {}
      },
      'Bulgaria': {
        'Sofia': {}
      },
      'Croatia': {
        'Zagreb': {},
        'Split': {}
      },
      'Slovenia': {
        'Ljubljana': {}
      },
      'Slovakia': {
        'Bratislava': {}
      }
    }
  }

  /**
   * 测试数据获取
   */
  async testDataFetching(city: string, country: string): Promise<{
    cityMatch: CityMatchResult
    dataValidation: DataValidationResult
    testResults: {
      numbeoTest: boolean
      benchmarkTest: boolean
      exchangeTest: boolean
    }
  }> {
    const cityMatch = this.validateCityMatch(city, country)
    
    // 测试各个数据源
    const testResults = {
      numbeoTest: await this.testNumbeoAPI(city),
      benchmarkTest: this.testBenchmarkData(city, country),
      exchangeTest: await this.testExchangeAPI()
    }

    // 模拟数据验证
    const mockCostData = {
      accommodation: { monthly: 600, source: 'Benchmark', confidence: 0.6 },
      food: { monthly: 300, source: 'Benchmark', confidence: 0.6 },
      transport: { monthly: 80, source: 'Benchmark', confidence: 0.6 },
      coworking: { monthly: 150, source: 'Benchmark', confidence: 0.7 }
    }

    const dataValidation = this.validateCostData(mockCostData, city, country)

    return {
      cityMatch,
      dataValidation,
      testResults
    }
  }

  /**
   * 测试Numbeo API
   */
  private async testNumbeoAPI(city: string): Promise<boolean> {
    try {
      const response = await fetch(`https://www.numbeo.com/api/city_prices?api_key=free&query=${encodeURIComponent(city)}`)
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * 测试基准数据
   */
  private testBenchmarkData(city: string, country: string): boolean {
    const match = this.findExactMatch(this.normalizeCityName(city), this.normalizeCountryName(country))
    return match !== null
  }

  /**
   * 测试汇率API
   */
  private async testExchangeAPI(): Promise<boolean> {
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
      return response.ok
    } catch {
      return false
    }
  }
}

// 导出单例实例
export const costDataValidator = CostDataValidator.getInstance()
