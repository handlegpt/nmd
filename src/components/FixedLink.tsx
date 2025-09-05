'use client'

import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'
import { logInfo } from '@/lib/logger'

interface FixedLinkProps {
  href: string
  children: ReactNode
  className?: string
  onClick?: () => void
}

export default function FixedLink({ href, children, className = '', onClick }: FixedLinkProps) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    logInfo('FixedLink navigating to', { href }, 'FixedLink')
    
    if (onClick) {
      onClick()
    }
    
    router.push(href)
  }

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  )
}
