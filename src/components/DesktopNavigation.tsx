'use client'

import { usePathname } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import FixedLink from './FixedLink'

export default function DesktopNavigation() {
  const { t } = useTranslation()
  const pathname = usePathname()

  const navigationItems = [
    {
      name: t('navigation.home'),
      href: '/',
    },
    {
      name: t('navigation.cities'),
      href: '/cities',
    },
    {
      name: t('navigation.localNomads'),
      href: '/local-nomads',
    },
    {
      name: t('navigation.visaGuide'),
      href: '/visa-guide',
    },
    {
      name: t('navigation.tax'),
      href: '/tax',
    }
  ]

  return (
    <nav className="hidden lg:flex items-center space-x-1">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href
        
        return (
          <FixedLink
            key={item.name}
            href={item.href}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {item.name}
          </FixedLink>
        )
      })}
    </nav>
  )
}
