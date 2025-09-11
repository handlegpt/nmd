import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useMobile, useTouchDevice } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'
import { 
  Home, 
  MapPin, 
  Users, 
  Calculator, 
  Settings, 
  Menu, 
  X,
  Search,
  Bell,
  User,
  Globe,
  BookOpen,
  Wrench,
  Heart
} from 'lucide-react'

interface NavigationItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
  isActive?: boolean
}

interface MobileNavigationProps {
  className?: string
  showSearch?: boolean
  showNotifications?: boolean
  showUserMenu?: boolean
}

export default function MobileNavigation({
  className,
  showSearch = true,
  showNotifications = true,
  showUserMenu = true,
}: MobileNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isMobile, isTablet } = useMobile()
  const { isTouchDevice } = useTouchDevice()
  
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [showSearchBar, setShowSearchBar] = useState(false)

  // 导航项配置
  const navigationItems: NavigationItem[] = [
    {
      id: 'home',
      label: '首页',
      href: '/',
      icon: <Home className="h-5 w-5" />,
      isActive: pathname === '/'
    },
    {
      id: 'cities',
      label: '城市',
      href: '/nomadcities',
      icon: <MapPin className="h-5 w-5" />,
      isActive: pathname.startsWith('/nomadcities')
    },
    {
      id: 'community',
      label: '社区',
      href: '/community',
      icon: <Users className="h-5 w-5" />,
      isActive: pathname.startsWith('/community')
    },
    {
      id: 'tax',
      label: '税务',
      href: '/nomadtax',
      icon: <Calculator className="h-5 w-5" />,
      isActive: pathname.startsWith('/nomadtax')
    },
    {
      id: 'guides',
      label: '指南',
      href: '/guides',
      icon: <BookOpen className="h-5 w-5" />,
      isActive: pathname.startsWith('/guides')
    },
    {
      id: 'tools',
      label: '工具',
      href: '/nomadtools',
      icon: <Wrench className="h-5 w-5" />,
      isActive: pathname.startsWith('/nomadtools')
    },
    {
      id: 'places',
      label: '地点',
      href: '/nomadplaces',
      icon: <Globe className="h-5 w-5" />,
      isActive: pathname.startsWith('/nomadplaces')
    },
    {
      id: 'favorites',
      label: '收藏',
      href: '/favorites',
      icon: <Heart className="h-5 w-5" />,
      isActive: pathname.startsWith('/favorites')
    }
  ]

  // 处理导航点击
  const handleNavigationClick = (item: NavigationItem) => {
    setActiveTab(item.id)
    setIsOpen(false)
    router.push(item.href)
  }

  // 处理搜索点击
  const handleSearchClick = () => {
    setShowSearchBar(!showSearchBar)
    if (!showSearchBar) {
      // 聚焦到搜索框
      setTimeout(() => {
        const searchInput = document.getElementById('mobile-search-input')
        if (searchInput) {
          searchInput.focus()
        }
      }, 100)
    }
  }

  // 处理通知点击
  const handleNotificationClick = () => {
    // 跳转到通知页面或显示通知面板
    router.push('/notifications')
  }

  // 处理用户菜单点击
  const handleUserMenuClick = () => {
    router.push('/profile')
  }

  // 触摸手势处理
  useEffect(() => {
    if (!isTouchDevice) return

    let startY = 0
    let startX = 0

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY
      startX = e.touches[0].clientX
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const endY = e.changedTouches[0].clientY
      const endX = e.changedTouches[0].clientX
      const deltaY = endY - startY
      const deltaX = endX - startX

      // 向上滑动关闭菜单
      if (isOpen && deltaY < -50 && Math.abs(deltaX) < 50) {
        setIsOpen(false)
      }

      // 向右滑动打开菜单
      if (!isOpen && deltaX > 50 && Math.abs(deltaY) < 50) {
        setIsOpen(true)
      }
    }

    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isOpen, isTouchDevice])

  // 移动端优化的样式
  const mobileStyles = {
    container: isMobile ? 'bottom-0 left-0 right-0' : 'bottom-4 left-4 right-4',
    height: isMobile ? 'h-16' : 'h-14',
    padding: isMobile ? 'px-4' : 'px-6',
    rounded: isMobile ? 'rounded-t-2xl' : 'rounded-full',
    shadow: isMobile ? 'shadow-2xl' : 'shadow-lg',
  }

  return (
    <>
      {/* 移动端导航栏 */}
      <nav className={cn(
        'fixed z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700',
        'transition-all duration-300 ease-in-out',
        mobileStyles.container,
        mobileStyles.height,
        mobileStyles.padding,
        mobileStyles.rounded,
        mobileStyles.shadow,
        className
      )}>
        <div className="flex items-center justify-between h-full">
          {/* 左侧：菜单按钮 */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'flex items-center justify-center w-10 h-10',
              'rounded-full transition-all duration-200',
              'hover:bg-gray-100 dark:hover:bg-gray-700',
              'active:scale-95',
              isOpen ? 'bg-blue-100 dark:bg-blue-900' : 'bg-transparent'
            )}
            aria-label="打开菜单"
          >
            {isOpen ? (
              <X className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            ) : (
              <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* 中间：搜索按钮 */}
          {showSearch && (
            <button
              onClick={handleSearchClick}
              className={cn(
                'flex items-center justify-center w-10 h-10',
                'rounded-full transition-all duration-200',
                'hover:bg-gray-100 dark:hover:bg-gray-700',
                'active:scale-95',
                showSearchBar ? 'bg-blue-100 dark:bg-blue-900' : 'bg-transparent'
              )}
              aria-label="搜索"
            >
              <Search className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}

          {/* 右侧：通知和用户菜单 */}
          <div className="flex items-center space-x-2">
            {showNotifications && (
              <button
                onClick={handleNotificationClick}
                className={cn(
                  'flex items-center justify-center w-10 h-10',
                  'rounded-full transition-all duration-200',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  'active:scale-95',
                  'relative'
                )}
                aria-label="通知"
              >
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                {/* 通知徽章 */}
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            )}

            {showUserMenu && (
              <button
                onClick={handleUserMenuClick}
                className={cn(
                  'flex items-center justify-center w-10 h-10',
                  'rounded-full transition-all duration-200',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  'active:scale-95',
                  'bg-blue-100 dark:bg-blue-900'
                )}
                aria-label="用户菜单"
              >
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* 搜索栏 */}
      {showSearchBar && (
        <div className={cn(
          'fixed inset-x-0 bottom-16 z-40',
          'bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700',
          'transition-all duration-300 ease-in-out',
          'px-4 py-3'
        )}>
          <input
            id="mobile-search-input"
            type="text"
            placeholder="搜索城市、地点、用户..."
            className={cn(
              'w-full px-4 py-3',
              'bg-gray-100 dark:bg-gray-700',
              'border border-gray-300 dark:border-gray-600',
              'rounded-lg',
              'text-gray-900 dark:text-white',
              'placeholder-gray-500 dark:placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              'transition-all duration-200'
            )}
          />
        </div>
      )}

      {/* 侧边菜单 */}
      <div className={cn(
        'fixed inset-0 z-50',
        'transition-all duration-300 ease-in-out',
        isOpen ? 'visible opacity-100' : 'invisible opacity-0'
      )}>
        {/* 背景遮罩 */}
        <div
          className={cn(
            'absolute inset-0 bg-black bg-opacity-50',
            'transition-opacity duration-300'
          )}
          onClick={() => setIsOpen(false)}
        />

        {/* 菜单内容 */}
        <div className={cn(
          'absolute bottom-20 left-4 right-4',
          'bg-white dark:bg-gray-800 rounded-2xl shadow-2xl',
          'transition-all duration-300 ease-in-out',
          'transform',
          isOpen ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'
        )}>
          {/* 菜单头部 */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              导航菜单
            </h3>
          </div>

          {/* 菜单项 */}
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigationClick(item)}
                  className={cn(
                    'flex flex-col items-center justify-center p-4',
                    'rounded-xl transition-all duration-200',
                    'hover:bg-gray-50 dark:hover:bg-gray-700',
                    'active:scale-95',
                    item.isActive
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  )}
                >
                  <div className={cn(
                    'mb-2',
                    item.isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                  )}>
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 菜单底部 */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              关闭
            </button>
          </div>
        </div>
      </div>

      {/* 底部安全区域 */}
      {isMobile && (
        <div className="h-16" />
      )}
    </>
  )
}
