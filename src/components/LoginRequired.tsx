'use client'

import { ReactNode } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { useUser } from '@/contexts/GlobalStateContext'
import FixedLink from '@/components/FixedLink'
import { LogIn, Lock } from 'lucide-react'

interface LoginRequiredProps {
  children?: ReactNode
  message?: string
  showLoginButton?: boolean
  className?: string
}

export default function LoginRequired({ 
  children, 
  message,
  showLoginButton = true,
  className = ''
}: LoginRequiredProps) {
  const { t } = useTranslation()
  const { user } = useUser()

  if (user.isAuthenticated) {
    return children ? <>{children}</> : null
  }

  return (
    <div className={`bg-gray-50 rounded-lg p-6 text-center ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <div className="p-3 bg-blue-100 rounded-full">
          <Lock className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {message || t('loginRequired.title')}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {t('loginRequired.description')}
          </p>
        </div>
        {showLoginButton && (
          <FixedLink
            href="/auth/login"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            <span>{t('loginRequired.loginButton')}</span>
          </FixedLink>
        )}
      </div>
    </div>
  )
}
