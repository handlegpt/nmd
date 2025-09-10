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
 * 生成地点URL（简单同步版本，使用city_id作为fallback）
 * @param place 地点对象
 * @returns 友好的URL路径
 */
export function generatePlaceUrlSimple(place: Place): string {
  // 尝试从city_id推断城市名称（简单映射）
  const cityNameMap: Record<string, string> = {
    // 原始城市映射
    '2baab562-1b6d-4f6f-a0c8-86e2d4167b5e': 'singapore',
    '550e8400-e29b-41d4-a716-446655440008': 'osaka',
    '550e8400-e29b-41d4-a716-446655440007': 'ho-chi-minh-city',
    '550e8400-e29b-41d4-a716-446655440006': 'hong-kong',
    '550e8400-e29b-41d4-a716-446655440005': 'budapest',
    '550e8400-e29b-41d4-a716-446655440012': 'prague',
    '550e8400-e29b-41d4-a716-446655440017': 'taipei',
    '550e8400-e29b-41d4-a716-446655440018': 'kuala-lumpur',
    '550e8400-e29b-41d4-a716-446655440021': 'yerevan',
    '550e8400-e29b-41d4-a716-446655440024': 'marrakech',
    '550e8400-e29b-41d4-a716-446655440028': 'cusco',
    '550e8400-e29b-41d4-a716-446655440029': 'playa-del-carmen',
    '550e8400-e29b-41d4-a716-446655440032': 'phuket',
    '550e8400-e29b-41d4-a716-446655440033': 'ubud',
    '550e8400-e29b-41d4-a716-446655440034': 'canggu',
    '550e8400-e29b-41d4-a716-446655440035': 'madrid',
    '550e8400-e29b-41d4-a716-446655440036': 'valencia',
    '550e8400-e29b-41d4-a716-446655440037': 'vienna',
    '550e8400-e29b-41d4-a716-446655440039': 'dublin',
    '550e8400-e29b-41d4-a716-446655440040': 'edinburgh',
    '550e8400-e29b-41d4-a716-446655440041': 'kyoto',
    '550e8400-e29b-41d4-a716-446655440042': 'fukuoka',
    '550e8400-e29b-41d4-a716-446655440043': 'busan',
    '550e8400-e29b-41d4-a716-446655440044': 'da-nang',
    '550e8400-e29b-41d4-a716-446655440045': 'hanoi',
    '550e8400-e29b-41d4-a716-446655440046': 'penang',
    '550e8400-e29b-41d4-a716-446655440047': 'krabi',
    '550e8400-e29b-41d4-a716-446655440048': 'koh-samui',
    '550e8400-e29b-41d4-a716-446655440049': 'pattaya',
    '550e8400-e29b-41d4-a716-446655440050': 'koh-phangan',
    
    // 数据库脚本中的城市映射
    '550e8400-e29b-41d4-a716-446655440009': 'tokyo',
    '48f9d105-3855-4d4b-9ad1-08ba370e1acf': 'bangkok',
    'cbd649b8-2827-49a4-b778-268bec6227f0': 'berlin',
    '36f114c7-0e37-4dd8-8a08-fe07881e3054': 'barcelona',
    '3d0f7802-f64f-434b-bbed-de83b822f5ec': 'seoul',
    '3f22664a-91d0-44db-87ae-0fe2af04712a': 'mexico-city',
    '50375f9b-09db-4a96-8776-09daec4c76f9': 'medellin',
    '99998886-86e1-45c0-a6e5-c525d7d54011': 'chiang-mai',
    '8b6bdceb-31fb-4c0a-889b-53d1ac56aafc': 'bali',
    'eec3a80e-7816-46f0-a80e-e3c27f345afb': 'lisbon',
    '6b3298ac-2670-4e0e-8cba-a24828084e6a': 'porto',
    '234475de-d5e3-421d-b5e2-a25927cc56b9': 'tokyo', // 这个UUID对应Tokyo
    'a024d98c-47ed-4e20-8f35-dfccbe28d45a': 'new-york',
    '3e0567b8-d93e-422a-9696-f2da7d98c8cb': 'san-francisco',
    'a679b920-201a-4e62-a524-0140ec34731b': 'toronto',
    'f5c4aa53-f209-49b0-9a5d-53414f8a8269': 'london',
    '29f0e08c-48b8-4563-8e02-7fc3c953034e': 'paris',
    '17e35be0-3b29-4ba8-8dc5-9dcb9acce9ce': 'melbourne',
    '00211b75-8f65-4cbe-a5c2-d632b32b44bc': 'sydney',
    '398b600b-c84d-4a14-85a6-98f72983ad5e': 'rio-de-janeiro',
    '45fcaae5-c35f-4c6b-b2fb-13ea7d84dbdd': 'santiago',
    '1ae95db9-d30a-41b2-8ed4-7a05af2daeb4': 'lima',
    '2952b5c3-5c43-4315-87be-c3c0811e2cec': 'buenos-aires',
    '0b901165-df72-48b5-8231-a898f2bff74c': 'montevideo',
    'c927988d-30ba-48db-9e6b-75e7bb8e2e9c': 'istanbul',
    '7fb0f296-84fa-4afb-8044-07c9fac613f8': 'tbilisi',
    'ea825468-e535-44cc-8dc1-b581373b29a8': 'cairo',
    '21879a88-0215-47aa-a2c4-b572cc8fb3ac': 'cape-town',
    '95d15cc0-1c4b-43f2-95a6-405b86baf28d': 'dubai',
    'b6703037-f6c5-4ad1-99f2-d9c33b0629e9': 'havana',
    '1e7e2593-98c6-491c-958b-cfa1c8ac755c': 'belize-city',
    '6b0f15eb-4ad2-482e-8766-703ff466e399': 'guatemala-city',
    '753f07f9-cc9f-4227-8007-49e456e51b2c': 'managua',
    '2a957a4d-ff4f-4d73-a9b0-9936aba19bb6': 'san-jose',
    '0051f05f-b9bf-473f-b5b8-9d7a5c34c860': 'san-salvador',
    'c776ff2e-6b31-427f-825c-b86d4613f783': 'panama-city',
    'dc1812c1-c238-4305-b72f-c32f3303fa94': 'santo-domingo',
    '2f3bf08d-8224-40d0-8640-c2f32b691371': 'kingston',
    'b89f73ff-8eac-4889-a556-ab224a098ee0': 'tegucigalpa'
  }
  
  const citySlug = cityNameMap[place.city_id] || place.city_id.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
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
