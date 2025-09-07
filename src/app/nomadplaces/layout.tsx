import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Digital Nomad Places & Recommendations | Nomad Now',
  description: 'Discover the best places for digital nomads worldwide. Find coworking spaces, cafes, restaurants, and accommodation with WiFi speeds, costs, and nomad-friendly ratings.',
  keywords: [
    'digital nomad places',
    'nomad places',
    'coworking spaces',
    'nomad cafes',
    'remote work places',
    'nomad restaurants',
    'nomad accommodation',
    'nomad recommendations',
    'nomad-friendly places',
    'places for digital nomads',
    'Nomad Now'
  ].join(', '),
  openGraph: {
    title: 'Digital Nomad Places & Recommendations',
    description: 'Discover the best places for digital nomads worldwide. Find coworking spaces, cafes, restaurants, and accommodation with WiFi speeds, costs, and nomad-friendly ratings.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Nomad Now',
    url: 'https://nomad.now/nomadplaces',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digital Nomad Places & Recommendations',
    description: 'Discover the best places for digital nomads worldwide. Find coworking spaces, cafes, restaurants, and accommodation with WiFi speeds, costs, and nomad-friendly ratings.',
  },
  alternates: {
    canonical: 'https://nomad.now/nomadplaces',
  },
}

export default function NomadPlacesLayout({ children }: { children: React.ReactNode }) {
  return children
}
