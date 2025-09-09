'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { ChevronRight, Home, MapPin } from 'lucide-react'
import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const { t } = useTranslation()

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
      <Link 
        href="/" 
        className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <Home className="h-4 w-4" />
        <span>{t('common.home')}</span>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4" />
          {item.href ? (
            <Link 
              href={item.href}
              className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ) : (
            <span className="flex items-center space-x-1 text-gray-900 dark:text-white font-medium">
              {item.icon}
              <span>{item.label}</span>
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}
