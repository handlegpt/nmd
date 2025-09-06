import { Metadata } from 'next'

interface PlaceLayoutProps {
  params: { id: string }
}

export async function generateMetadata({ params }: PlaceLayoutProps): Promise<Metadata> {
  const placeId = params.id
  
  // 这里可以根据placeId获取具体的place信息来生成动态元数据
  // 暂时使用通用的元数据
  return {
    title: `Digital Nomad Place Details | Nomad Now`,
    description: `Discover detailed information about this digital nomad-friendly place including WiFi speeds, costs, amenities, and nomad reviews.`,
    keywords: [
      'digital nomad place',
      'nomad place details',
      'coworking space',
      'nomad cafe',
      'remote work place',
      'nomad restaurant',
      'nomad accommodation',
      'nomad reviews',
      'nomad-friendly place',
      'Nomad Now'
    ].join(', '),
    openGraph: {
      title: `Digital Nomad Place Details`,
      description: `Discover detailed information about this digital nomad-friendly place including WiFi speeds, costs, amenities, and nomad reviews.`,
      type: 'website',
      locale: 'en_US',
      siteName: 'Nomad Now',
      url: `https://nomadnow.app/nomadplaces/${placeId}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Digital Nomad Place Details`,
      description: `Discover detailed information about this digital nomad-friendly place including WiFi speeds, costs, amenities, and nomad reviews.`,
    },
    alternates: {
      canonical: `https://nomadnow.app/nomadplaces/${placeId}`,
    },
  }
}

export default function PlaceLayout({ children }: { children: React.ReactNode }) {
  return children
}
