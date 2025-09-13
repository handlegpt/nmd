// Data Source Configuration
// 管理各种数据源的配置和API密钥

export interface DataSourceConfig {
  name: string
  enabled: boolean
  apiKey?: string
  baseUrl: string
  rateLimit: {
    requests: number
    period: number // in seconds
  }
  cache: {
    duration: number // in minutes
  }
}

export const DATA_SOURCES: { [key: string]: DataSourceConfig } = {
  // 天气数据源
  openweathermap: {
    name: 'OpenWeatherMap',
    enabled: false, // 需要API密钥
    apiKey: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    rateLimit: {
      requests: 1000,
      period: 3600 // 1 hour
    },
    cache: {
      duration: 30 // 30 minutes
    }
  },

  // 汇率数据源
  exchangerate: {
    name: 'ExchangeRate-API',
    enabled: false, // 需要API密钥
    apiKey: process.env.NEXT_PUBLIC_EXCHANGERATE_API_KEY,
    baseUrl: 'https://v6.exchangerate-api.com/v6',
    rateLimit: {
      requests: 1500,
      period: 3600 // 1 hour
    },
    cache: {
      duration: 60 // 1 hour
    }
  },

  // 生活成本数据源
  numbeo: {
    name: 'Numbeo',
    enabled: false, // 需要API密钥
    apiKey: process.env.NEXT_PUBLIC_NUMBEO_API_KEY,
    baseUrl: 'https://www.numbeo.com/api',
    rateLimit: {
      requests: 100,
      period: 3600 // 1 hour
    },
    cache: {
      duration: 120 // 2 hours
    }
  },

  // 数字游民社区数据源
  nomadlist: {
    name: 'NomadList',
    enabled: false, // 需要API密钥
    apiKey: process.env.NEXT_PUBLIC_NOMADLIST_API_KEY,
    baseUrl: 'https://nomadlist.com/api',
    rateLimit: {
      requests: 100,
      period: 3600 // 1 hour
    },
    cache: {
      duration: 180 // 3 hours
    }
  },

  // 签证信息数据源
  visaapi: {
    name: 'VisaAPI',
    enabled: false, // 需要API密钥
    apiKey: process.env.NEXT_PUBLIC_VISA_API_KEY,
    baseUrl: 'https://api.visa.com',
    rateLimit: {
      requests: 50,
      period: 3600 // 1 hour
    },
    cache: {
      duration: 240 // 4 hours
    }
  }
}

// 数据源状态管理
export class DataSourceManager {
  private static instance: DataSourceManager
  private rateLimitCounters: { [key: string]: { count: number; resetTime: number } } = {}

  static getInstance(): DataSourceManager {
    if (!this.instance) {
      this.instance = new DataSourceManager()
    }
    return this.instance
  }

  // 检查数据源是否可用
  isDataSourceAvailable(sourceKey: string): boolean {
    const config = DATA_SOURCES[sourceKey]
    if (!config) return false
    
    // 检查是否启用
    if (!config.enabled) return false
    
    // 检查API密钥
    if (config.apiKey && !config.apiKey.trim()) return false
    
    // 检查速率限制
    if (this.isRateLimited(sourceKey)) return false
    
    return true
  }

  // 检查速率限制
  isRateLimited(sourceKey: string): boolean {
    const config = DATA_SOURCES[sourceKey]
    const counter = this.rateLimitCounters[sourceKey]
    
    if (!counter) {
      this.rateLimitCounters[sourceKey] = {
        count: 0,
        resetTime: Date.now() + config.rateLimit.period * 1000
      }
      return false
    }
    
    // 重置计数器
    if (Date.now() > counter.resetTime) {
      this.rateLimitCounters[sourceKey] = {
        count: 0,
        resetTime: Date.now() + config.rateLimit.period * 1000
      }
      return false
    }
    
    // 检查是否超过限制
    return counter.count >= config.rateLimit.requests
  }

  // 记录API调用
  recordApiCall(sourceKey: string): void {
    const counter = this.rateLimitCounters[sourceKey]
    if (counter) {
      counter.count++
    }
  }

  // 获取可用的数据源
  getAvailableDataSources(): string[] {
    return Object.keys(DATA_SOURCES).filter(key => this.isDataSourceAvailable(key))
  }

  // 获取数据源配置
  getDataSourceConfig(sourceKey: string): DataSourceConfig | null {
    return DATA_SOURCES[sourceKey] || null
  }

  // 启用/禁用数据源
  setDataSourceEnabled(sourceKey: string, enabled: boolean): void {
    if (DATA_SOURCES[sourceKey]) {
      DATA_SOURCES[sourceKey].enabled = enabled
    }
  }

  // 获取速率限制状态
  getRateLimitStatus(sourceKey: string): { used: number; limit: number; resetTime: number } | null {
    const config = DATA_SOURCES[sourceKey]
    const counter = this.rateLimitCounters[sourceKey]
    
    if (!config || !counter) return null
    
    return {
      used: counter.count,
      limit: config.rateLimit.requests,
      resetTime: counter.resetTime
    }
  }
}

// 环境变量检查
export function checkEnvironmentVariables(): { [key: string]: boolean } {
  const requiredVars = [
    'NEXT_PUBLIC_OPENWEATHER_API_KEY',
    'NEXT_PUBLIC_EXCHANGERATE_API_KEY',
    'NEXT_PUBLIC_NUMBEO_API_KEY',
    'NEXT_PUBLIC_NOMADLIST_API_KEY',
    'NEXT_PUBLIC_VISA_API_KEY'
  ]

  const status: { [key: string]: boolean } = {}
  
  requiredVars.forEach(varName => {
    status[varName] = !!process.env[varName]
  })

  return status
}

// 数据源健康检查
export async function performHealthCheck(): Promise<{ [key: string]: { status: 'healthy' | 'unhealthy' | 'disabled'; message: string } }> {
  const results: { [key: string]: { status: 'healthy' | 'unhealthy' | 'disabled'; message: string } } = {}
  const manager = DataSourceManager.getInstance()

  for (const [key, config] of Object.entries(DATA_SOURCES)) {
    if (!config.enabled) {
      results[key] = {
        status: 'disabled',
        message: '数据源已禁用'
      }
      continue
    }

    if (!config.apiKey) {
      results[key] = {
        status: 'unhealthy',
        message: '缺少API密钥'
      }
      continue
    }

    if (manager.isRateLimited(key)) {
      results[key] = {
        status: 'unhealthy',
        message: '已达到速率限制'
      }
      continue
    }

    // 这里可以添加实际的API健康检查
    results[key] = {
      status: 'healthy',
      message: '数据源正常'
    }
  }

  return results
}
