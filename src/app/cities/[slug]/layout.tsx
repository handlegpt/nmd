import { Metadata } from 'next'
import { getCities } from '@/lib/api'

interface CityLayoutProps {
  children: React.ReactNode
  params: { slug: string }
}

export async function generateMetadata({ params }: CityLayoutProps): Promise<Metadata> {
  const citySlug = params.slug
  
  try {
    // 获取城市信息
    const allCities = await getCities()
    const city = allCities.find(c => 
      c.name.toLowerCase().replace(/\s+/g, '-') === citySlug.toLowerCase() ||
      c.name.toLowerCase().replace(/\s+/g, '_') === citySlug.toLowerCase()
    )
    
    if (!city) {
      return {
        title: 'City Not Found | Nomad Now',
        description: 'Sorry, the city information you are looking for was not found.',
      }
    }

    return {
      title: `${city.name} - Digital Nomad City Guide | Nomad Now`,
      description: `Explore digital nomad life in ${city.name}: Cost of living $${city.cost_of_living}/month, WiFi speed ${city.wifi_speed}Mbps, visa stay ${city.visa_days} days. View detailed city information, pros & cons, user reviews and practical advice.`,
      keywords: [
        city.name,
        'digital nomad',
        'remote work',
        'cost of living',
        'WiFi speed',
        'visa information',
        'coworking',
        'travel guide',
        'Nomad Now'
      ].join(', '),
      openGraph: {
        title: `${city.name} - Digital Nomad City Guide`,
        description: `Explore digital nomad life in ${city.name}: Cost of living $${city.cost_of_living}/month, WiFi speed ${city.wifi_speed}Mbps, visa stay ${city.visa_days} days.`,
        type: 'website',
        locale: 'en_US',
        siteName: 'Nomad Now',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${city.name} - Digital Nomad City Guide`,
        description: `Explore digital nomad life in ${city.name}: Cost of living $${city.cost_of_living}/month, WiFi speed ${city.wifi_speed}Mbps, visa stay ${city.visa_days} days.`,
      },
      alternates: {
        canonical: `https://nomadnow.app/cities/${city.name.toLowerCase().replace(/\s+/g, '-')}`,
      },
    }
  } catch (error) {
    return {
      title: 'City Information | Nomad Now',
      description: 'An error occurred while retrieving city information.',
    }
  }
}

export async function generateStaticParams() {
  try {
    const cities = await getCities()
    return cities.map((city) => ({
      slug: city.name.toLowerCase().replace(/\s+/g, '-'),
    }))
  } catch (error) {
    return []
  }
}

export default function CityLayout({ children }: CityLayoutProps) {
  return children
}
