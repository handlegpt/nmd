import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Digital Nomad Visa Guide & Requirements | Nomad Now',
  description: 'Complete digital nomad visa guide with country requirements, application processes, and stay duration limits. Find the best visa options for remote workers and digital nomads.',
  keywords: [
    'digital nomad visa',
    'nomad visa guide',
    'remote work visa',
    'visa requirements',
    'nomad visa countries',
    'digital nomad visa application',
    'visa-free countries',
    'nomad visa duration',
    'remote worker visa',
    'nomad visa comparison',
    'Nomad Now'
  ].join(', '),
  openGraph: {
    title: 'Digital Nomad Visa Guide & Requirements',
    description: 'Complete digital nomad visa guide with country requirements, application processes, and stay duration limits for remote workers.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Nomad Now',
    url: 'https://nomadnow.app/nomadvisaguide',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digital Nomad Visa Guide & Requirements',
    description: 'Complete digital nomad visa guide with country requirements, application processes, and stay duration limits.',
  },
  alternates: {
    canonical: 'https://nomadnow.app/nomadvisaguide',
  },
}

export default function NomadVisaGuideLayout({ children }: { children: React.ReactNode }) {
  return children
}
