'use client'

import Logo from './Logo'
import DesktopNavigation from './DesktopNavigation'
import NotificationSystem from './NotificationSystem'
import LanguageSwitcher from './LanguageSwitcher'
import MobileMenu from './MobileMenu'
import UserMenu from './UserMenu'

interface HeaderProps {
  showNavigation?: boolean
  className?: string
  pageTitle?: string
  showPageTitle?: boolean
}

export default function Header({ 
  showNavigation = true, 
  className = '',
  pageTitle,
  showPageTitle = false
}: HeaderProps) {
  return (
    <header className={`bg-white shadow-sm border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Logo size="md" />
            {showNavigation && <DesktopNavigation />}
            {showPageTitle && pageTitle && (
              <>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600 font-medium">{pageTitle}</span>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="hidden lg:block">
              <NotificationSystem />
            </div>
            <div className="hidden lg:block">
              <LanguageSwitcher />
            </div>
            <div className="hidden lg:block">
              <UserMenu />
            </div>
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
