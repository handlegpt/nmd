// 缓存工具类
export class CacheManager {
  private static instance: CacheManager
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  set(key: string, data: any, ttl: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    const isExpired = Date.now() - item.timestamp > item.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  has(key: string): boolean {
    return this.cache.has(key) && !this.isExpired(key)
  }

  private isExpired(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return true
    return Date.now() - item.timestamp > item.ttl
  }
}

// 内存缓存
export const memoryCache = CacheManager.getInstance()

// 本地存储缓存
export class LocalStorageCache {
  static set(key: string, data: any, ttl: number = 3600000): void {
    const item = {
      data,
      timestamp: Date.now(),
      ttl
    }
    localStorage.setItem(key, JSON.stringify(item))
  }

  static get(key: string): any | null {
    const itemStr = localStorage.getItem(key)
    if (!itemStr) return null

    try {
      const item = JSON.parse(itemStr)
      const isExpired = Date.now() - item.timestamp > item.ttl
      
      if (isExpired) {
        localStorage.removeItem(key)
        return null
      }

      return item.data
    } catch {
      localStorage.removeItem(key)
      return null
    }
  }

  static delete(key: string): void {
    localStorage.removeItem(key)
  }

  static clear(): void {
    localStorage.clear()
  }
}

// 会话存储缓存
export class SessionStorageCache {
  static set(key: string, data: any, ttl: number = 1800000): void {
    const item = {
      data,
      timestamp: Date.now(),
      ttl
    }
    sessionStorage.setItem(key, JSON.stringify(item))
  }

  static get(key: string): any | null {
    const itemStr = sessionStorage.getItem(key)
    if (!itemStr) return null

    try {
      const item = JSON.parse(itemStr)
      const isExpired = Date.now() - item.timestamp > item.ttl
      
      if (isExpired) {
        sessionStorage.removeItem(key)
        return null
      }

      return item.data
    } catch {
      sessionStorage.removeItem(key)
      return null
    }
  }

  static delete(key: string): void {
    sessionStorage.removeItem(key)
  }

  static clear(): void {
    sessionStorage.clear()
  }
}

// 缓存装饰器
export function Cached(ttl: number = 300000, cacheType: 'memory' | 'local' | 'session' = 'memory') {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}_${propertyName}_${JSON.stringify(args)}`
      
      let cachedData: any = null
      
      switch (cacheType) {
        case 'memory':
          cachedData = memoryCache.get(cacheKey)
          break
        case 'local':
          cachedData = LocalStorageCache.get(cacheKey)
          break
        case 'session':
          cachedData = SessionStorageCache.get(cacheKey)
          break
      }

      if (cachedData) {
        return cachedData
      }

      const result = await method.apply(this, args)
      
      switch (cacheType) {
        case 'memory':
          memoryCache.set(cacheKey, result, ttl)
          break
        case 'local':
          LocalStorageCache.set(cacheKey, result, ttl)
          break
        case 'session':
          SessionStorageCache.set(cacheKey, result, ttl)
          break
      }

      return result
    }
  }
}

// 预加载缓存
export class PreloadCache {
  private static preloadQueue: Array<() => Promise<void>> = []

  static addToQueue(loader: () => Promise<void>): void {
    this.preloadQueue.push(loader)
  }

  static async processQueue(): Promise<void> {
    const promises = this.preloadQueue.map(loader => loader())
    await Promise.allSettled(promises)
    this.preloadQueue = []
  }

  static preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = reject
      img.src = src
    })
  }

  static preloadData<T>(key: string, loader: () => Promise<T>, ttl: number = 300000): void {
    this.addToQueue(async () => {
      try {
        const data = await loader()
        memoryCache.set(key, data, ttl)
      } catch (error) {
      }
    })
  }
}
