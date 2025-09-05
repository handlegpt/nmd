import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { GlobalStateProvider } from '@/contexts/GlobalStateContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import Header from '@/components/Header'

import PerformanceMonitor from '@/components/PerformanceMonitor'
import { ReactErrorMonitor } from '@/components/ReactErrorMonitor'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'NomadNow - 数字游民生活指南 | 城市探索、税务优化、社区连接',
    template: '%s | NomadNow'
  },
  description: 'NomadNow是数字游民的终极生活指南，提供全球城市信息、税务优化建议、社区连接和实用工具。发现最适合数字游民的城市，优化税务策略，连接全球游民社区。',
  keywords: [
    '数字游民',
    '远程工作',
    '全球城市',
    '税务优化',
    '游民社区',
    '城市探索',
    '远程办公',
    '全球旅行',
    '游民生活',
    '城市排名',
    '税务指南',
    '游民签证',
    '联合办公',
    '咖啡店',
    '生活成本'
  ],
  authors: [{ name: 'NomadNow Team' }],
  creator: 'NomadNow',
  publisher: 'NomadNow',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://nomadnow.app'),
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
    locale: 'zh_CN',
    url: 'https://nomadnow.app',
    siteName: 'NomadNow',
    title: 'NomadNow - 数字游民生活指南',
    description: '发现最适合数字游民的城市，优化税务策略，连接全球游民社区。',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NomadNow - 数字游民生活指南',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NomadNow - 数字游民生活指南',
    description: '发现最适合数字游民的城市，优化税务策略，连接全球游民社区。',
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
        <link rel="preconnect" href="https://api.nomadnow.app" />
        
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
              "url": "https://nomadnow.app",
              "description": "数字游民的终极生活指南，提供全球城市信息、税务优化建议、社区连接和实用工具",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://nomadnow.app/search?q={search_term_string}",
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
              "url": "https://nomadnow.app",
              "logo": "https://nomadnow.app/logo.png",
              "description": "数字游民生活指南平台",
              "foundingDate": "2024",
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "email": "support@nomadnow.app"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <GlobalStateProvider>
          <ThemeProvider>
            <LanguageProvider>
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