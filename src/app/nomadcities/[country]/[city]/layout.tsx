import { Metadata } from 'next'
import { getCities } from '@/lib/api'

interface CityLayoutProps {
  params: { country: string; city: string }
}

export async function generateMetadata({ params }: CityLayoutProps): Promise<Metadata> {
  const { country, city } = params
  
  try {
    // 获取城市信息
    const allCities = await getCities()
    const cityData = allCities.find(c => {
      const citySlug = c.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      const countrySlug = c.country.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      return citySlug === city.toLowerCase() && countrySlug === country.toLowerCase()
    })
    
    if (!cityData) {
      return {
        title: 'City Not Found | Nomad Now',
        description: 'Sorry, the city information you are looking for was not found.',
      }
    }

    return {
      title: `${cityData.name}, ${cityData.country} - Digital Nomad City Guide | Nomad Now`,
      description: `Explore digital nomad life in ${cityData.name}, ${cityData.country}: Cost of living $${cityData.cost_of_living}/month, WiFi speed ${cityData.wifi_speed}Mbps, visa stay ${cityData.visa_days} days. View detailed city information, pros & cons, user reviews and practical advice.`,
      keywords: [
        cityData.name,
        cityData.country,
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
        title: `${cityData.name}, ${cityData.country} - Digital Nomad City Guide`,
        description: `Explore digital nomad life in ${cityData.name}, ${cityData.country}: Cost of living $${cityData.cost_of_living}/month, WiFi speed ${cityData.wifi_speed}Mbps, visa stay ${cityData.visa_days} days.`,
        type: 'website',
        locale: 'en_US',
        siteName: 'Nomad Now',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${cityData.name}, ${cityData.country} - Digital Nomad City Guide`,
        description: `Explore digital nomad life in ${cityData.name}, ${cityData.country}: Cost of living $${cityData.cost_of_living}/month, WiFi speed ${cityData.wifi_speed}Mbps, visa stay ${cityData.visa_days} days.`,
      },
      alternates: {
        canonical: `https://nomad.now/nomadcities/${country}/${city}`,
      },
    }
  } catch (error) {
    return {
      title: 'City Information | Nomad Now',
      description: 'Digital nomad city guide and information.',
    }
  }
}

export async function generateStaticParams() {
  try {
    const cities = await getCities()
    return cities.map((city) => {
      const citySlug = city.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      const countrySlug = city.country.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      return {
        country: countrySlug,
        city: citySlug,
      }
    })
  } catch (error) {
    return []
  }
}

export default function CityLayout({ children }: { children: React.ReactNode }) {
  return children
}
