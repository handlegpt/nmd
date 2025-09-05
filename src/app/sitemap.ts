import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://nomadnow.app'
  
  // 静态页面
  const staticPages = [
    '',
    '/cities',
    '/tax',
    '/local-nomads',
    '/dashboard',
    '/about',
    '/contact',
    '/privacy',
    '/terms'
  ]

  // 城市页面（动态生成）
  const cities = [
    'bali',
    'porto', 
    'chiang-mai',
    'lisbon',
    'osaka',
    'bangkok',
    'ho-chi-minh-city',
    'madrid',
    'barcelona'
  ]

  const cityPages = cities.map(city => ({
    url: `${baseUrl}/cities/${city}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8
  }))

  // 静态页面sitemap
  const staticSitemap = staticPages.map(page => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: page === '' ? 'daily' as const : 'weekly' as const,
    priority: page === '' ? 1 : 0.8
  }))

  return [...staticSitemap, ...cityPages]
}
