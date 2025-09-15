/**
 * Expatistan数据缓存服务
 * 支持多种缓存策略：内存、Redis、文件系统
 */

import fs from 'fs/promises'
import path from 'path'

export interface CacheConfig {
  type: 'memory' | 'redis' | 'file'
  ttl: number // 缓存时间（毫秒）
  maxSize?: number // 最大缓存条目数
  filePath?: string // 文件缓存路径
  redisUrl?: string // Redis连接URL
}

export interface CachedData {
  data: any
  timestamp: number
  expiry: number
  source: string
}

export class ExpatistanCacheService {
  private static instance: ExpatistanCacheService
  private config: CacheConfig
  private memoryCache = new Map<string, CachedData>()
  private redisClient: any = null

  constructor(config: CacheConfig) {
    this.config = config
  }

  static getInstance(config?: CacheConfig): ExpatistanCacheService {
    if (!ExpatistanCacheService.instance) {
      const defaultConfig: CacheConfig = {
        type: 'memory',
        ttl: 24 * 60 * 60 * 1000, // 24小时
        maxSize: 1000
      }
      ExpatistanCacheService.instance = new ExpatistanCacheService(config || defaultConfig)
    }
    return ExpatistanCacheService.instance
  }

  /**
   * 获取缓存数据
   */
  async get(key: string): Promise<any | null> {
    switch (this.config.type) {
      case 'memory':
        return this.getFromMemory(key)
      case 'file':
        return this.getFromFile(key)
      case 'redis':
        return this.getFromRedis(key)
      default:
        return null
    }
  }

  /**
   * 设置缓存数据
   */
  async set(key: string, data: any, source: string = 'expatistan'): Promise<void> {
    const cachedData: CachedData = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + this.config.ttl,
      source
    }

    switch (this.config.type) {
      case 'memory':
        await this.setToMemory(key, cachedData)
        break
      case 'file':
        await this.setToFile(key, cachedData)
        break
      case 'redis':
        await this.setToRedis(key, cachedData)
        break
    }
  }

  /**
   * 删除缓存数据
   */
  async delete(key: string): Promise<void> {
    switch (this.config.type) {
      case 'memory':
        this.memoryCache.delete(key)
        break
      case 'file':
        await this.deleteFromFile(key)
        break
      case 'redis':
        await this.deleteFromRedis(key)
        break
    }
  }

  /**
   * 清理过期缓存
   */
  async cleanup(): Promise<void> {
    switch (this.config.type) {
      case 'memory':
        this.cleanupMemory()
        break
      case 'file':
        await this.cleanupFile()
        break
      case 'redis':
        await this.cleanupRedis()
        break
    }
  }

  /**
   * 获取缓存统计信息
   */
  async getStats(): Promise<{
    type: string
    size: number
    hitRate: number
    lastCleanup: Date
  }> {
    switch (this.config.type) {
      case 'memory':
        return {
          type: 'memory',
          size: this.memoryCache.size,
          hitRate: 0, // 需要实现命中率统计
          lastCleanup: new Date()
        }
      case 'file':
        return {
          type: 'file',
          size: await this.getFileCacheSize(),
          hitRate: 0,
          lastCleanup: new Date()
        }
      case 'redis':
        return {
          type: 'redis',
          size: await this.getRedisCacheSize(),
          hitRate: 0,
          lastCleanup: new Date()
        }
      default:
        return {
          type: 'unknown',
          size: 0,
          hitRate: 0,
          lastCleanup: new Date()
        }
    }
  }

  // 内存缓存实现
  private getFromMemory(key: string): any | null {
    const cached = this.memoryCache.get(key)
    if (!cached) return null

    if (Date.now() > cached.expiry) {
      this.memoryCache.delete(key)
      return null
    }

    return cached.data
  }

  private async setToMemory(key: string, data: CachedData): Promise<void> {
    // 检查缓存大小限制
    if (this.config.maxSize && this.memoryCache.size >= this.config.maxSize) {
      // 删除最旧的条目
      const oldestKey = this.memoryCache.keys().next().value
      if (oldestKey) {
        this.memoryCache.delete(oldestKey)
      }
    }

    this.memoryCache.set(key, data)
  }

  private cleanupMemory(): void {
    const now = Date.now()
    for (const [key, cached] of this.memoryCache.entries()) {
      if (now > cached.expiry) {
        this.memoryCache.delete(key)
      }
    }
  }

  // 文件缓存实现
  private async getFromFile(key: string): Promise<any | null> {
    try {
      const filePath = this.getFilePath(key)
      const data = await fs.readFile(filePath, 'utf-8')
      const cached: CachedData = JSON.parse(data)

      if (Date.now() > cached.expiry) {
        await fs.unlink(filePath)
        return null
      }

      return cached.data
    } catch (error) {
      return null
    }
  }

  private async setToFile(key: string, data: CachedData): Promise<void> {
    const filePath = this.getFilePath(key)
    const dir = path.dirname(filePath)
    
    // 确保目录存在
    await fs.mkdir(dir, { recursive: true })
    
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))
  }

  private async deleteFromFile(key: string): Promise<void> {
    try {
      const filePath = this.getFilePath(key)
      await fs.unlink(filePath)
    } catch (error) {
      // 文件不存在，忽略错误
    }
  }

  private async cleanupFile(): Promise<void> {
    try {
      const cacheDir = this.config.filePath || './cache/expatistan'
      const files = await fs.readdir(cacheDir)
      
      for (const file of files) {
        const filePath = path.join(cacheDir, file)
        const data = await fs.readFile(filePath, 'utf-8')
        const cached: CachedData = JSON.parse(data)
        
        if (Date.now() > cached.expiry) {
          await fs.unlink(filePath)
        }
      }
    } catch (error) {
      // 目录不存在或其他错误，忽略
    }
  }

  private async getFileCacheSize(): Promise<number> {
    try {
      const cacheDir = this.config.filePath || './cache/expatistan'
      const files = await fs.readdir(cacheDir)
      return files.length
    } catch (error) {
      return 0
    }
  }

  private getFilePath(key: string): string {
    const cacheDir = this.config.filePath || './cache/expatistan'
    const safeKey = key.replace(/[^a-zA-Z0-9-_]/g, '_')
    return path.join(cacheDir, `${safeKey}.json`)
  }

  // Redis缓存实现（需要安装redis包）
  private async getFromRedis(key: string): Promise<any | null> {
    if (!this.redisClient) {
      console.warn('Redis client not initialized')
      return null
    }

    try {
      const data = await this.redisClient.get(`expatistan:${key}`)
      if (!data) return null

      const cached: CachedData = JSON.parse(data)
      if (Date.now() > cached.expiry) {
        await this.redisClient.del(`expatistan:${key}`)
        return null
      }

      return cached.data
    } catch (error) {
      console.error('Redis get error:', error)
      return null
    }
  }

  private async setToRedis(key: string, data: CachedData): Promise<void> {
    if (!this.redisClient) {
      console.warn('Redis client not initialized')
      return
    }

    try {
      await this.redisClient.setex(
        `expatistan:${key}`,
        Math.floor(this.config.ttl / 1000),
        JSON.stringify(data)
      )
    } catch (error) {
      console.error('Redis set error:', error)
    }
  }

  private async deleteFromRedis(key: string): Promise<void> {
    if (!this.redisClient) return

    try {
      await this.redisClient.del(`expatistan:${key}`)
    } catch (error) {
      console.error('Redis delete error:', error)
    }
  }

  private async cleanupRedis(): Promise<void> {
    if (!this.redisClient) return

    try {
      const keys = await this.redisClient.keys('expatistan:*')
      for (const key of keys) {
        const data = await this.redisClient.get(key)
        if (data) {
          const cached: CachedData = JSON.parse(data)
          if (Date.now() > cached.expiry) {
            await this.redisClient.del(key)
          }
        }
      }
    } catch (error) {
      console.error('Redis cleanup error:', error)
    }
  }

  private async getRedisCacheSize(): Promise<number> {
    if (!this.redisClient) return 0

    try {
      const keys = await this.redisClient.keys('expatistan:*')
      return keys.length
    } catch (error) {
      return 0
    }
  }

  /**
   * 初始化Redis连接
   */
  async initRedis(): Promise<void> {
    // 暂时禁用Redis支持，避免构建时依赖问题
    console.log('Redis support disabled for build compatibility, using memory cache')
    this.config.type = 'memory'
    this.redisClient = null
  }
}

// 导出预配置的缓存实例
export const expatistanCache = ExpatistanCacheService.getInstance({
  type: 'memory', // 默认使用内存缓存
  ttl: 6 * 30 * 24 * 60 * 60 * 1000, // 6个月缓存
  maxSize: 1000
})

// 生产环境推荐配置
export const productionCache = ExpatistanCacheService.getInstance({
  type: 'file', // 使用文件缓存，支持持久化
  ttl: 6 * 30 * 24 * 60 * 60 * 1000, // 6个月缓存
  filePath: './cache/expatistan'
})

// Redis缓存配置（需要Redis服务器）
export const redisCache = ExpatistanCacheService.getInstance({
  type: 'redis',
  ttl: 6 * 30 * 24 * 60 * 60 * 1000, // 6个月缓存
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379'
})
