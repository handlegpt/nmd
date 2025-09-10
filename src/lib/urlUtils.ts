import { Place, City } from './supabase'
import { getCityById } from './api'

/**
 * 生成友好的地点URL
 * @param place 地点对象
 * @param city 城市对象（可选，如果未提供会尝试从place.city_id获取）
 * @returns 友好的URL路径
 */
export async function generatePlaceUrl(place: Place, city?: City): Promise<string> {
  // 如果提供了城市信息，使用城市信息
  if (city) {
    const citySlug = city.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    const placeSlug = place.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    return `/nomadplaces/${citySlug}/${placeSlug}`
  }
  
  // 如果没有城市信息，尝试从place.city_id获取城市信息
  try {
    const cityData = await getCityById(place.city_id)
    if (cityData) {
      const citySlug = cityData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      const placeSlug = place.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      return `/nomadplaces/${citySlug}/${placeSlug}`
    }
  } catch (error) {
    console.error('Error fetching city data for URL generation:', error)
  }
  
  // 如果无法获取城市信息，使用city_id作为fallback
  const citySlug = place.city_id.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
  const placeSlug = place.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
  return `/nomadplaces/${citySlug}/${placeSlug}`
}

/**
 * 生成友好的地点URL（同步版本，需要提供城市信息）
 * @param place 地点对象
 * @param city 城市对象
 * @returns 友好的URL路径
 */
export function generatePlaceUrlSync(place: Place, city: City): string {
  const citySlug = city.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
  const placeSlug = place.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
  return `/nomadplaces/${citySlug}/${placeSlug}`
}

/**
 * 生成友好的城市URL
 * @param city 城市对象
 * @returns 友好的URL路径
 */
export function generateCityUrl(city: City): string {
  const countrySlug = city.country.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
  const citySlug = city.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
  return `/nomadcities/${countrySlug}/${citySlug}`
}

/**
 * 从URL路径中提取城市和地点信息
 * @param pathname URL路径
 * @returns 解析后的城市和地点信息
 */
export function parsePlaceUrl(pathname: string): { citySlug: string; placeSlug: string } | null {
  const match = pathname.match(/^\/nomadplaces\/([^\/]+)\/([^\/]+)$/)
  if (match) {
    return {
      citySlug: match[1],
      placeSlug: match[2]
    }
  }
  return null
}

/**
 * 从URL路径中提取国家和城市信息
 * @param pathname URL路径
 * @returns 解析后的国家和城市信息
 */
export function parseCityUrl(pathname: string): { countrySlug: string; citySlug: string } | null {
  const match = pathname.match(/^\/nomadcities\/([^\/]+)\/([^\/]+)$/)
  if (match) {
    return {
      countrySlug: match[1],
      citySlug: match[2]
    }
  }
  return null
}
