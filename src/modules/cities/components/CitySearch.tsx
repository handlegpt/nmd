import React, { useState } from 'react'
import { Search, X } from 'lucide-react'
import { useMobile } from '@/hooks/useResponsive'

interface CitySearchProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

export default function CitySearch({ 
  onSearch, 
  placeholder = '搜索城市...',
  className = '' 
}: CitySearchProps) {
  const [query, setQuery] = useState('')
  const { isMobile } = useMobile()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  const handleClear = () => {
    setQuery('')
    onSearch('')
  }

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full pl-10 pr-10 py-3
            bg-white dark:bg-gray-800
            border border-gray-300 dark:border-gray-600
            rounded-lg
            text-gray-900 dark:text-white
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500
            transition-all duration-200
            ${isMobile ? 'text-base' : 'text-sm'}
          `}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>
    </form>
  )
}
