'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { useUser } from '@/contexts/GlobalStateContext'
import FixedLink from './FixedLink'
import { User, LogOut, Settings, ChevronDown } from 'lucide-react'

export default function UserMenu() {
  const { t } = useTranslation()
  const { user, logout } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  // 未登录状态 - 显示Sign In按钮
  if (!user.isAuthenticated) {
    return (
      <FixedLink
        href="/auth/login"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        {t('auth.signIn')}
      </FixedLink>
    )
  }

  // 已登录状态 - 显示用户菜单
  const userName = user.profile?.name || 'User'
  const userInitials = userName.substring(0, 2).toUpperCase()

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
          {userInitials}
        </div>
        <span className="text-sm font-medium text-gray-700 hidden md:block">
          {userName}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <FixedLink
            href="/dashboard"
            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
            onClick={() => setIsOpen(false)}
          >
            <User className="w-4 h-4" />
            <span>{t('navigation.dashboard')}</span>
          </FixedLink>
          
          <FixedLink
            href="/profile"
            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="w-4 h-4" />
            <span>{t('common.profile')}</span>
          </FixedLink>
          
          <div className="border-t border-gray-100 my-1"></div>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('auth.logout')}</span>
          </button>
        </div>
      )}
    </div>
  )
}
