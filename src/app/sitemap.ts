import { MetadataRoute } from 'next'
import { getCities } from '@/lib/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nomadnow.app'
  
  // 静态页面
  const staticPages = [
    '',
    '/nomadcities',
    '/nomadtax',
    '/nomadvisaguide',
    '/local-nomads',
    '/dashboard',
    '/about',
    '/contact',
    '/privacy',
    '/terms'
  ]

  // 获取城市数据并生成SEO友好的URL
  let cityPages: MetadataRoute.Sitemap = []
  try {
    const cities = await getCities()
    cityPages = cities.map(city => {
      const citySlug = city.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      const countrySlug = city.country.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      return {
        url: `${baseUrl}/nomadcities/${countrySlug}/${citySlug}`,
        lastModified: new Date(city.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8
      }
    })
  } catch (error) {
    console.error('Error generating city sitemap:', error)
    // 如果获取城市数据失败，使用默认的城市列表
    const defaultCities = [
      { name: 'Bali', country: 'Indonesia' },
      { name: 'Porto', country: 'Portugal' },
      { name: 'Chiang Mai', country: 'Thailand' },
      { name: 'Lisbon', country: 'Portugal' },
      { name: 'Osaka', country: 'Japan' },
      { name: 'Bangkok', country: 'Thailand' },
      { name: 'Ho Chi Minh City', country: 'Vietnam' },
      { name: 'Madrid', country: 'Spain' },
      { name: 'Barcelona', country: 'Spain' }
    ]
    
    cityPages = defaultCities.map(city => {
      const citySlug = city.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      const countrySlug = city.country.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      return {
        url: `${baseUrl}/nomadcities/${countrySlug}/${citySlug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8
      }
    })
  }

  // 静态页面sitemap
  const staticSitemap = staticPages.map(page => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: page === '' ? 'daily' as const : 'weekly' as const,
    priority: page === '' ? 1 : 0.8
  }))

  return [...staticSitemap, ...cityPages]
}
