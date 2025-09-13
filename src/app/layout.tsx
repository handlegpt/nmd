import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { GlobalStateProvider } from '@/contexts/GlobalStateContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import Header from '@/components/Header'
import DynamicHead from '@/components/DynamicHead'

import PerformanceMonitor from '@/components/PerformanceMonitor'
import { ReactErrorMonitor } from '@/components/ReactErrorMonitor'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'NomadNow - Digital Nomad Life Guide | City Exploration, Tax Optimization, Community Connection',
    template: '%s | NomadNow'
  },
  description: 'NomadNow is the ultimate life guide for digital nomads, providing global city information, tax optimization advice, community connections and practical tools. Discover the best cities for digital nomads, optimize tax strategies, and connect with the global nomad community.',
  keywords: [
    'digital nomad',
    'remote work',
    'global cities',
    'tax optimization',
    'nomad community',
    'city exploration',
    'remote office',
    'global travel',
    'nomad life',
    'city ranking',
    'tax guide',
    'nomad visa',
    'coworking',
    'coffee shops',
    'cost of living'
  ],
  authors: [{ name: 'NomadNow Team' }],
  creator: 'NomadNow',
  publisher: 'NomadNow',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://nomad.now'),
  alternates: {
    canonical: '/',
    languages: {
      'zh-CN': '/zh',
      'en-US': '/en',
      'es-ES': '/es',
      'ja-JP': '/ja',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://nomad.now',
    siteName: 'NomadNow',
    title: 'NomadNow - Digital Nomad Life Guide',
    description: 'Discover the best cities for digital nomads, optimize tax strategies, and connect with the global nomad community.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NomadNow - Digital Nomad Life Guide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NomadNow - Digital Nomad Life Guide',
    description: 'Discover the best cities for digital nomads, optimize tax strategies, and connect with the global nomad community.',
    images: ['/og-image.jpg'],
    creator: '@nomadnow',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'travel',
  classification: 'Digital Nomad Guide',
  other: {
    'theme-color': '#3B82F6',
    'msapplication-TileColor': '#3B82F6',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'NomadNow',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.nomad.now" />
        
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Early Error Monitoring Script - TEMPORARILY DISABLED */}
        {/* 
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Error monitoring temporarily disabled to fix React infinite loops
              console.log('🚨 Error monitoring temporarily disabled for testing');
            `
          }}
        />
        */}
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "NomadNow",
              "url": "https://nomad.now",
              "description": "The ultimate life guide for digital nomads, providing global city information, tax optimization advice, community connections and practical tools",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://nomad.now/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "sameAs": [
                "https://twitter.com/nomadnow",
                "https://www.linkedin.com/company/nomadnow"
              ]
            })
          }}
        />
        
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "NomadNow",
              "url": "https://nomad.now",
              "logo": "https://nomad.now/logo.png",
              "description": "Digital nomad life guide platform",
              "foundingDate": "2024",
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "email": "support@nomad.now"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <GlobalStateProvider>
          <ThemeProvider>
            <LanguageProvider>
              <DynamicHead />
              <Header />
              <main className="flex-1">
                {children}
              </main>
              
              {/* Mobile bottom spacing */}
              <div className="lg:hidden h-20"></div>

              {/* PerformanceMonitor temporarily disabled for testing */}
              {/* <PerformanceMonitor /> */}
              {/* React Error Monitor */}
              {/* <ReactErrorMonitor /> */}
            </LanguageProvider>
          </ThemeProvider>
        </GlobalStateProvider>
      </body>
    </html>
  )
} 