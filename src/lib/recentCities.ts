// 最近访问城市管理
export interface RecentCity {
  id: string
  name: string
  country: string
  country_code: string
  visitedAt: Date
  visitCount: number
}

// 从localStorage获取最近访问城市
export function getRecentCities(): RecentCity[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem('recentCities')
    if (stored) {
      const cities = JSON.parse(stored)
      return cities.map((city: any) => ({
        ...city,
        visitedAt: new Date(city.visitedAt)
      }))
    }
  } catch (error) {
    console.error('Error parsing recent cities:', error)
  }
  
  return []
}

// 添加城市到最近访问列表
export function addRecentCity(city: {
  id: string
  name: string
  country: string
  country_code: string
}): void {
  if (typeof window === 'undefined') return
  
  try {
    const recentCities = getRecentCities()
    
    // 检查是否已存在
    const existingIndex = recentCities.findIndex(c => c.id === city.id)
    
    if (existingIndex >= 0) {
      // 更新访问次数和时间
      recentCities[existingIndex].visitCount += 1
      recentCities[existingIndex].visitedAt = new Date()
    } else {
      // 添加新城市
      recentCities.unshift({
        ...city,
        visitedAt: new Date(),
        visitCount: 1
      })
    }
    
    // 只保留最近10个城市
    const limitedCities = recentCities.slice(0, 10)
    
    localStorage.setItem('recentCities', JSON.stringify(limitedCities))
  } catch (error) {
    console.error('Error saving recent cities:', error)
  }
}

// 获取最近访问的城市（用于快速投票）
export function getRecentCityForVoting(): RecentCity | null {
  const recentCities = getRecentCities()
  return recentCities.length > 0 ? recentCities[0] : null
}

// 清除最近访问记录
export function clearRecentCities(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('recentCities')
}
