import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dashboard/',
        '/admin/',
        '/_next/',
        '/private/',
        '*.json',
        '*.xml'
      ],
    },
    sitemap: 'https://nomadnow.app/sitemap.xml',
  }
}
