import { Globe } from 'lucide-react'
import FixedLink from '@/components/FixedLink'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showSubtitle?: boolean
  linkToHome?: boolean
  className?: string
}

export default function Logo({ 
  size = 'md', 
  showSubtitle = true, 
  linkToHome = true,
  className = ''
}: LogoProps) {
  const sizeClasses = {
    sm: {
      icon: 'w-6 h-6',
      iconInner: 'h-4 w-4',
      text: 'text-lg',
      subtitle: 'text-xs'
    },
    md: {
      icon: 'w-8 h-8',
      iconInner: 'h-5 w-5',
      text: 'text-xl',
      subtitle: 'text-xs'
    },
    lg: {
      icon: 'w-12 h-12',
      iconInner: 'h-7 w-7',
      text: 'text-3xl',
      subtitle: 'text-sm'
    }
  }

  const classes = sizeClasses[size]

  const logoContent = (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${classes.icon} bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg`}>
        <Globe className={`${classes.iconInner} text-white`} />
      </div>
      <div>
        <h1 className={`${classes.text} font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
          Nomad Now
        </h1>
        {showSubtitle && (
          <p className={`${classes.subtitle} text-gray-500 font-medium`}>
            Digital Nomad Tools
          </p>
        )}
      </div>
    </div>
  )

  if (linkToHome) {
    return (
      <FixedLink href="/" className="hover:opacity-80 transition-opacity">
        {logoContent}
      </FixedLink>
    )
  }

  return logoContent
}
