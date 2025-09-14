'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Search, 
  MapPin, 
  Clock, 
  TrendingUp, 
  X,
  Globe,
  Users,
  Star
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import FixedLink from '@/components/FixedLink'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/GlobalStateContext'
import { searchHistoryService } from '@/lib/searchHistoryService'

interface SearchSuggestion {
  id: string
  type: 'city' | 'place' | 'user' | 'tag'
  title: string
  subtitle?: string
  icon: React.ReactNode
  href: string
  popularity?: number
}

interface SearchHistory {
  id: string
  query: string
  timestamp: number
  type: 'city' | 'place' | 'user'
}

export default function EnhancedSearch() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user } = useUser()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // 热门搜索
  const popularSearches = [
    { query: 'Bali', type: 'city', icon: <Globe className="h-4 w-4" /> },
    { query: 'Chiang Mai', type: 'city', icon: <Globe className="h-4 w-4" /> },
    { query: 'Porto', type: 'city', icon: <Globe className="h-4 w-4" /> },
    { query: 'coworking spaces', type: 'place', icon: <MapPin className="h-4 w-4" /> },
    { query: 'digital nomads', type: 'user', icon: <Users className="h-4 w-4" /> }
  ]

  // 加载搜索历史
  useEffect(() => {
    const loadSearchHistory = async () => {
      if (user.isAuthenticated && user.profile?.id) {
        try {
          const history = await searchHistoryService.getUserSearchHistory(user.profile.id, 10)
          const formattedHistory = history.map(entry => ({
            id: entry.id,
            query: entry.search_query,
            timestamp: new Date(entry.created_at).getTime(),
            type: (entry.search_type as 'city' | 'place' | 'user') || 'city'
          }))
          setSearchHistory(formattedHistory)
        } catch (error) {
          console.error('Error loading search history:', error)
        }
      }
    }

    loadSearchHistory()
  }, [user.isAuthenticated, user.profile?.id])

  // 点击外部关闭搜索
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 搜索建议
  const generateSuggestions = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([])
      return
    }

    setIsLoading(true)

    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 300))

    const mockSuggestions: SearchSuggestion[] = [
      {
        id: '1',
        type: 'city',
        title: 'Bali, Indonesia',
        subtitle: 'Popular digital nomad destination',
        icon: <Globe className="h-4 w-4" />,
        href: '/nomadcities/indonesia/bali',
        popularity: 95
      },
      {
        id: '2',
        type: 'city',
        title: 'Chiang Mai, Thailand',
        subtitle: 'Affordable and cultural',
        icon: <Globe className="h-4 w-4" />,
        href: '/nomadcities/thailand/chiang-mai',
        popularity: 88
      },
      {
        id: '3',
        type: 'place',
        title: 'Coworking Spaces',
        subtitle: 'Find workspaces near you',
        icon: <MapPin className="h-4 w-4" />,
        href: '/nomadplaces?category=coworking',
        popularity: 75
      },
      {
        id: '4',
        type: 'user',
        title: 'Digital Nomads',
        subtitle: 'Connect with fellow nomads',
        icon: <Users className="h-4 w-4" />,
        href: '/local-nomads',
        popularity: 70
      }
    ]

    // 过滤匹配的建议
    const filtered = mockSuggestions.filter(suggestion =>
      suggestion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      suggestion.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    setSuggestions(filtered)
    setIsLoading(false)
  }

  // 处理搜索输入
  const handleSearchInput = (value: string) => {
    setQuery(value)
    setIsOpen(true)
    generateSuggestions(value)
  }

  // 处理搜索提交
  const handleSearchSubmit = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return

    // 保存到搜索历史
    if (user.isAuthenticated && user.profile?.id) {
      try {
        await searchHistoryService.addSearchEntry(user.profile.id, {
          search_query: searchQuery,
          search_type: 'city',
          results_count: 0 // 这里可以后续更新实际结果数量
        })
      } catch (error) {
        console.error('Error saving search history:', error)
      }
    }

    // 更新本地状态
    const newHistory: SearchHistory = {
      id: Date.now().toString(),
      query: searchQuery,
      timestamp: Date.now(),
      type: 'city' // 默认类型
    }

    const updatedHistory = [newHistory, ...searchHistory.filter(h => h.query !== searchQuery)].slice(0, 10)
    setSearchHistory(updatedHistory)

    // 导航到搜索结果
    router.push(`/nomadcities?search=${encodeURIComponent(searchQuery)}`)
    setIsOpen(false)
    setQuery('')
  }

  // 清除搜索历史
  const clearHistory = async () => {
    if (user.isAuthenticated && user.profile?.id) {
      try {
        await searchHistoryService.clearUserSearchHistory(user.profile.id)
        setSearchHistory([])
      } catch (error) {
        console.error('Error clearing search history:', error)
      }
    } else {
      setSearchHistory([])
    }
  }

  // 删除单个历史记录
  const removeHistoryItem = async (id: string) => {
    try {
      await searchHistoryService.deleteSearchEntry(id)
      const updatedHistory = searchHistory.filter(h => h.id !== id)
      setSearchHistory(updatedHistory)
    } catch (error) {
      console.error('Error removing search history item:', error)
    }
  }

  return (
    <div className="relative" ref={searchRef}>
      {/* 搜索输入框 */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearchInput(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={t('search.placeholder')}
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setSuggestions([])
            }}
            className="absolute inset-y-0 right-12 flex items-center pr-3"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
        <button
          onClick={() => handleSearchSubmit()}
          className="absolute inset-y-0 right-0 flex items-center pr-3"
        >
          <div className="bg-blue-600 text-white px-4 py-1 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
            {t('search.search')}
          </div>
        </button>
      </div>

      {/* 搜索下拉菜单 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {/* 搜索建议 */}
          {query && (
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                {isLoading ? t('search.loading') : t('search.suggestions')}
              </h3>
              {isLoading ? (
                <div className="flex items-center space-x-2 text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>{t('search.loading')}</span>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="space-y-2">
                  {suggestions.map((suggestion) => (
                    <FixedLink
                      key={suggestion.id}
                      href={suggestion.href}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="text-gray-400">{suggestion.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{suggestion.title}</div>
                        <div className="text-sm text-gray-500">{suggestion.subtitle}</div>
                      </div>
                      {suggestion.popularity && (
                        <div className="flex items-center space-x-1 text-xs text-gray-400">
                          <TrendingUp className="h-3 w-3" />
                          <span>{suggestion.popularity}%</span>
                        </div>
                      )}
                    </FixedLink>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">{t('search.noResults')}</div>
              )}
            </div>
          )}

          {/* 搜索历史 */}
          {!query && searchHistory.length > 0 && (
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">{t('search.recent')}</h3>
                <button
                  onClick={clearHistory}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  {t('search.clearHistory')}
                </button>
              </div>
              <div className="space-y-2">
                {searchHistory.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                    <button
                      onClick={() => handleSearchSubmit(item.query)}
                      className="flex items-center space-x-3 flex-1"
                    >
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{item.query}</span>
                    </button>
                    <button
                      onClick={() => removeHistoryItem(item.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 热门搜索 */}
          {!query && (
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">{t('search.popular')}</h3>
              <div className="space-y-2">
                {popularSearches.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearchSubmit(item.query)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                  >
                    <div className="text-gray-400">{item.icon}</div>
                    <span className="text-gray-900">{item.query}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 快速操作 */}
          <div className="p-4 bg-gray-50 rounded-b-lg">
            <div className="grid grid-cols-2 gap-2">
              <FixedLink
                href="/nomadcities"
                className="flex items-center space-x-2 p-2 rounded-lg bg-white hover:bg-gray-50 transition-colors text-sm"
                onClick={() => setIsOpen(false)}
              >
                <Globe className="h-4 w-4 text-blue-600" />
                <span>{t('search.browseCities')}</span>
              </FixedLink>
              <FixedLink
                href="/local-nomads"
                className="flex items-center space-x-2 p-2 rounded-lg bg-white hover:bg-gray-50 transition-colors text-sm"
                onClick={() => setIsOpen(false)}
              >
                <Users className="h-4 w-4 text-green-600" />
                <span>{t('search.findNomads')}</span>
              </FixedLink>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
