/**
 * 工具数据管理器使用示例
 * 展示如何在新的工具中使用统一的数据管理功能
 */

import { useState, useEffect } from 'react'
import { createToolDataManager, TOOL_CONFIGS } from './toolDataManager'

// 示例1: 创建一个新的城市偏好工具
export function createCityPreferencesTool(userId: string) {
  const manager = createToolDataManager(TOOL_CONFIGS.CITY_PREFERENCES)
  
  // 初始化
  manager.initialize(userId)
  
  return {
    // 添加喜欢的城市
    addFavoriteCity: async (cityId: string) => {
      const favorites = manager.getData<string[]>('favorites') || []
      if (!favorites.includes(cityId)) {
        favorites.push(cityId)
        await manager.setData('favorites', favorites)
      }
    },
    
    // 移除喜欢的城市
    removeFavoriteCity: async (cityId: string) => {
      const favorites = manager.getData<string[]>('favorites') || []
      const updated = favorites.filter(id => id !== cityId)
      await manager.setData('favorites', updated)
    },
    
    // 获取喜欢的城市
    getFavoriteCities: () => manager.getData<string[]>('favorites') || [],
    
    // 评分城市
    rateCity: async (cityId: string, rating: number) => {
      const ratings = manager.getData<Record<string, number>>('ratings') || {}
      ratings[cityId] = rating
      await manager.setData('ratings', ratings)
    },
    
    // 获取城市评分
    getCityRating: (cityId: string) => {
      const ratings = manager.getData<Record<string, number>>('ratings') || {}
      return ratings[cityId] || 0
    },
    
    // 监听数据变化
    onDataChange: (callback: (data: any) => void) => {
      return manager.addListener(callback)
    },
    
    // 手动同步
    sync: () => manager.syncData(),
    
    // 清除所有数据
    clearAll: () => manager.clearData()
  }
}

// 示例2: 创建一个新的旅行计划工具
export function createTravelPlannerTool(userId: string) {
  const manager = createToolDataManager(TOOL_CONFIGS.TRAVEL_PLANNER)
  
  manager.initialize(userId)
  
  return {
    // 创建旅行计划
    createTrip: async (trip: {
      id: string
      name: string
      destination: string
      startDate: string
      endDate: string
      budget: number
    }) => {
      const trips = manager.getData<any[]>('trips') || []
      trips.push(trip)
      await manager.setData('trips', trips)
    },
    
    // 更新旅行计划
    updateTrip: async (tripId: string, updates: Partial<any>) => {
      const trips = manager.getData<any[]>('trips') || []
      const index = trips.findIndex(trip => trip.id === tripId)
      if (index !== -1) {
        trips[index] = { ...trips[index], ...updates }
        await manager.setData('trips', trips)
      }
    },
    
    // 删除旅行计划
    deleteTrip: async (tripId: string) => {
      const trips = manager.getData<any[]>('trips') || []
      const updated = trips.filter(trip => trip.id !== tripId)
      await manager.setData('trips', updated)
    },
    
    // 获取所有旅行计划
    getTrips: () => manager.getData<any[]>('trips') || [],
    
    // 添加书签
    addBookmark: async (bookmark: {
      id: string
      title: string
      url: string
      category: string
    }) => {
      const bookmarks = manager.getData<any[]>('bookmarks') || []
      bookmarks.push(bookmark)
      await manager.setData('bookmarks', bookmarks)
    },
    
    // 获取书签
    getBookmarks: (category?: string) => {
      const bookmarks = manager.getData<any[]>('bookmarks') || []
      return category ? bookmarks.filter(b => b.category === category) : bookmarks
    },
    
    // 设置预算
    setBudget: async (tripId: string, budget: number) => {
      const budgets = manager.getData<Record<string, number>>('budgets') || {}
      budgets[tripId] = budget
      await manager.setData('budgets', budgets)
    },
    
    // 获取预算
    getBudget: (tripId: string) => {
      const budgets = manager.getData<Record<string, number>>('budgets') || {}
      return budgets[tripId] || 0
    },
    
    // 监听数据变化
    onDataChange: (callback: (data: any) => void) => {
      return manager.addListener(callback)
    },
    
    // 手动同步
    sync: () => manager.syncData(),
    
    // 清除所有数据
    clearAll: () => manager.clearData()
  }
}

// 示例3: 在React组件中使用
export function useToolDataManager(config: any, userId: string) {
  const [manager] = useState(() => createToolDataManager(config))
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const initializeManager = async () => {
      await manager.initialize(userId)
      setData(manager.getAllData())
      setLoading(false)
    }
    
    initializeManager()
    
    // 监听数据变化
    const unsubscribe = manager.addListener(setData)
    
    return unsubscribe
  }, [manager, userId])
  
  return {
    manager,
    data,
    loading,
    setData: manager.setData.bind(manager),
    getData: manager.getData.bind(manager),
    sync: manager.syncData.bind(manager),
    clearData: manager.clearData.bind(manager)
  }
}

// 示例4: 在现有Domain Tracker中集成
export function createEnhancedDomainTracker(userId: string) {
  const manager = createToolDataManager(TOOL_CONFIGS.DOMAIN_TRACKER)
  
  manager.initialize(userId)
  
  return {
    // 获取域名列表
    getDomains: () => manager.getData('domains') || [],
    
    // 添加域名
    addDomain: async (domain: any) => {
      const domains = manager.getData('domains') || []
      domains.push(domain)
      await manager.setData('domains', domains)
    },
    
    // 更新域名
    updateDomain: async (domainId: string, updates: any) => {
      const domains = manager.getData('domains') || []
      const index = domains.findIndex((d: any) => d.id === domainId)
      if (index !== -1) {
        domains[index] = { ...domains[index], ...updates }
        await manager.setData('domains', domains)
      }
    },
    
    // 删除域名
    deleteDomain: async (domainId: string) => {
      const domains = manager.getData('domains') || []
      const updated = domains.filter((d: any) => d.id !== domainId)
      await manager.setData('domains', updated)
    },
    
    // 获取交易记录
    getTransactions: () => manager.getData('transactions') || [],
    
    // 添加交易
    addTransaction: async (transaction: any) => {
      const transactions = manager.getData('transactions') || []
      transactions.push(transaction)
      await manager.setData('transactions', transactions)
    },
    
    // 获取统计信息
    getStats: () => manager.getData('stats') || {},
    
    // 更新统计信息
    updateStats: async (stats: any) => {
      await manager.setData('stats', stats)
    },
    
    // 获取设置
    getSettings: () => manager.getData('settings') || {},
    
    // 更新设置
    updateSettings: async (settings: any) => {
      await manager.setData('settings', settings)
    },
    
    // 监听数据变化
    onDataChange: (callback: (data: any) => void) => {
      return manager.addListener(callback)
    },
    
    // 手动同步
    sync: () => manager.syncData(),
    
    // 清除所有数据
    clearAll: () => manager.clearData()
  }
}
