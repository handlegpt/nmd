import { City, CityDetails } from '@/types/city'
import { Coordinates } from '@/types'

// 格式化城市名称
export function formatCityName(city: City | string, options?: {
  showCountry?: boolean
  showRegion?: boolean
  maxLength?: number
}): string {
  const { showCountry = true, showRegion = false, maxLength } = options || {}
  
  let cityName: string
  
  if (typeof city === 'string') {
    cityName = city
  } else {
    cityName = city.name
    
    if (showRegion && city.region) {
      cityName = `${cityName}, ${city.region}`
    }
    
    if (showCountry) {
      cityName = `${cityName}, ${city.country}`
    }
  }
  
  if (maxLength && cityName.length > maxLength) {
    return cityName.substring(0, maxLength - 3) + '...'
  }
  
  return cityName
}

// 获取城市距离
export function getCityDistance(
  city1: City | Coordinates,
  city2: City | Coordinates
): number {
  let coords1: Coordinates
  let coords2: Coordinates
  
  if ('coordinates' in city1) {
    coords1 = city1.coordinates
  } else {
    coords1 = city1
  }
  
  if ('coordinates' in city2) {
    coords2 = city2.coordinates
  } else {
    coords2 = city2
  }
  
  return calculateDistance(coords1.lat, coords1.lng, coords2.lat, coords2.lng)
}

// 计算两点间距离（公里）
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // 地球半径（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// 格式化距离
export function formatDistance(distance: number, unit: 'km' | 'mi' = 'km'): string {
  if (unit === 'mi') {
    const miles = distance * 0.621371
    if (miles < 1) {
      return `${Math.round(miles * 5280)} ft`
    } else if (miles < 10) {
      return `${miles.toFixed(1)} mi`
    } else {
      return `${Math.round(miles)} mi`
    }
  } else {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`
    } else if (distance < 10) {
      return `${distance.toFixed(1)} km`
    } else {
      return `${Math.round(distance)} km`
    }
  }
}

// 获取城市时区
export function getCityTimezone(city: City): string {
  return city.timezone || 'UTC'
}

// 获取城市当前时间
export function getCityCurrentTime(city: City): Date {
  const timezone = getCityTimezone(city)
  const now = new Date()
  
  // 简单的时区转换（实际项目中应该使用更准确的时区库）
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
  
  // 这里需要根据实际时区进行转换
  // 暂时返回UTC时间
  return new Date(utc)
}



// 获取城市生活成本等级
export function getCityCostLevel(city: CityDetails): 'very_low' | 'low' | 'moderate' | 'high' | 'very_high' {
  const monthlyCost = city.cost_of_living.total_monthly_usd
  
  if (monthlyCost < 1000) return 'very_low'
  if (monthlyCost < 2000) return 'low'
  if (monthlyCost < 3500) return 'moderate'
  if (monthlyCost < 5000) return 'high'
  return 'very_high'
}

// 获取城市WiFi等级
export function getCityWifiLevel(city: CityDetails): 'poor' | 'fair' | 'good' | 'excellent' {
  const wifiSpeed = city.infrastructure.wifi_speed_mbps
  
  if (wifiSpeed < 10) return 'poor'
  if (wifiSpeed < 25) return 'fair'
  if (wifiSpeed < 100) return 'good'
  return 'excellent'
}

// 获取城市安全等级
export function getCitySafetyLevel(city: CityDetails): 'very_low' | 'low' | 'moderate' | 'high' | 'very_high' {
  const safetyRating = city.safety.overall_safety_rating
  
  if (safetyRating < 3) return 'very_low'
  if (safetyRating < 5) return 'low'
  if (safetyRating < 7) return 'moderate'
  if (safetyRating < 9) return 'high'
  return 'very_high'
}

// 获取城市推荐指数
export function getCityRecommendationScore(city: CityDetails, userPreferences?: {
  wifiPriority: number
  costPriority: number
  climatePriority: number
  safetyPriority: number
}): number {
  if (!userPreferences) {
    // 默认权重
    userPreferences = {
      wifiPriority: 0.25,
      costPriority: 0.25,
      climatePriority: 0.25,
      safetyPriority: 0.25
    }
  }
  
  const wifiScore = (city.infrastructure.wifi_quality_rating / 10) * userPreferences.wifiPriority
  const costScore = ((5000 - city.cost_of_living.total_monthly_usd) / 5000) * userPreferences.costPriority
  const climateScore = (city.climate.average_temp_celsius > 15 && city.climate.average_temp_celsius < 30 ? 1 : 0.5) * userPreferences.climatePriority
  const safetyScore = (city.safety.overall_safety_rating / 10) * userPreferences.safetyPriority
  
  return wifiScore + costScore + climateScore + safetyScore
}

// 排序城市
export function sortCities(cities: City[], sortBy: keyof City, order: 'asc' | 'desc' = 'desc'): City[] {
  return [...cities].sort((a, b) => {
    const aVal = a[sortBy]
    const bVal = b[sortBy]
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return order === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return order === 'asc' ? aVal - bVal : bVal - aVal
    }
    
    return 0
  })
}

// 过滤城市
export function filterCities(cities: City[], filters: {
  query?: string
  categories?: string[]
  tags?: string[]
  countries?: string[]
  minRating?: number
}): City[] {
  return cities.filter(city => {
    // 文本搜索
    if (filters.query) {
      const query = filters.query.toLowerCase()
      const matchesQuery = 
        city.name.toLowerCase().includes(query) ||
        city.country.toLowerCase().includes(query) ||
        city.tags.some(tag => tag.toLowerCase().includes(query))
      
      if (!matchesQuery) return false
    }
    
    // 分类筛选
    if (filters.categories && filters.categories.length > 0) {
      const matchesCategory = filters.categories.some(cat => 
        city.categories.includes(cat as any)
      )
      if (!matchesCategory) return false
    }
    
    // 标签筛选
    if (filters.tags && filters.tags.length > 0) {
      const matchesTag = filters.tags.some(tag => 
        city.tags.includes(tag)
      )
      if (!matchesTag) return false
    }
    
    // 国家筛选
    if (filters.countries && filters.countries.length > 0) {
      if (!filters.countries.includes(city.country)) return false
    }
    
    // 最低评分
    if (filters.minRating && city.overall_rating < filters.minRating) {
      return false
    }
    
    return true
  })
}

// 获取城市统计信息
export function getCityStats(cities: City[]): {
  totalCities: number
  averageRating: number
  totalReviews: number
  totalVotes: number
  countries: string[]
  regions: string[]
  categories: string[]
  tags: string[]
} {
  const totalCities = cities.length
  const averageRating = cities.length > 0 
    ? cities.reduce((sum, city) => sum + city.overall_rating, 0) / cities.length 
    : 0
  const totalReviews = cities.reduce((sum, city) => sum + city.total_reviews, 0)
  const totalVotes = cities.reduce((sum, city) => sum + city.total_votes, 0)
  
  const countries = [...new Set(cities.map(city => city.country))].sort()
  const regions = [...new Set(cities.map(city => city.region).filter((region): region is string => Boolean(region)))].sort()
  const categories = [...new Set(cities.flatMap(city => city.categories))].sort()
  const tags = [...new Set(cities.flatMap(city => city.tags))].sort()
  
  return {
    totalCities,
    averageRating,
    totalReviews,
    totalVotes,
    countries,
    regions,
    categories,
    tags
  }
}
