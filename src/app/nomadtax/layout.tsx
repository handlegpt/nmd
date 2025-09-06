import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Digital Nomad Tax Guide & Calculator | Nomad Now',
  description: 'Complete digital nomad tax optimization guide with calculators, strategies, and country comparisons. Learn about FEIE, tax treaties, and residency planning for remote workers.',
  keywords: [
    'digital nomad tax',
    'remote work tax',
    'FEIE calculator',
    'tax optimization',
    'nomad tax strategies',
    'tax residency',
    'foreign earned income exclusion',
    'tax treaties',
    'nomad tax planning',
    'remote worker taxes',
    'Nomad Now'
  ].join(', '),
  openGraph: {
    title: 'Digital Nomad Tax Guide & Calculator',
    description: 'Complete digital nomad tax optimization guide with calculators, strategies, and country comparisons. Learn about FEIE, tax treaties, and residency planning.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Nomad Now',
    url: 'https://nomadnow.app/nomadtax',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digital Nomad Tax Guide & Calculator',
    description: 'Complete digital nomad tax optimization guide with calculators, strategies, and country comparisons.',
  },
  alternates: {
    canonical: 'https://nomadnow.app/nomadtax',
  },
}

export default function NomadTaxLayout({ children }: { children: React.ReactNode }) {
  return children
}
