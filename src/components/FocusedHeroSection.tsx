'use client'

import { useState, useEffect } from 'react'
import { Search, ArrowRight, Globe, Users, MapPin, Zap } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useUser } from '@/contexts/GlobalStateContext'
import FixedLink from '@/components/FixedLink'

export default function FocusedHeroSection() {
  const { t } = useLanguage()
  const { user } = useUser()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [currentLocation, setCurrentLocation] = useState('Getting location...')
  
  // Get current location
  useEffect(() => {
    const getLocation = async () => {
      try {
        const response = await fetch('https://api.ipapi.com/api/check?access_key=free')
        const data = await response.json()
        
        if (data.city) {
          setCurrentLocation(data.city)
        } else if (data.region) {
          setCurrentLocation(data.region)
        } else {
          setCurrentLocation('Unknown Location')
        }
      } catch (error) {
        setCurrentLocation('Unknown Location')
      }
    }

    getLocation()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // 实现搜索逻辑
      console.log('Searching for:', searchQuery)
    }
  }

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* Simple Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Hero Content - 极简聚焦 */}
        <div className="text-center space-y-12 max-w-4xl mx-auto">
          
          {/* Main Title - 清晰聚焦 */}
          <div className="space-y-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              Find Your Next
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Remote Work City
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              🌍 Explore 500+ cities, connect with nomads, and plan your journey.
            </p>
          </div>

          {/* Search Box - 简洁明了 */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 Search Cities & Cafes"
                  className="w-full pl-16 pr-32 py-5 text-xl border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder-gray-400 bg-white/95 backdrop-blur-sm shadow-lg"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Two Main CTA Buttons - 核心行动 */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <FixedLink 
              href="/nomadcities" 
              className="group btn btn-xl btn-primary flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              <Globe className="h-6 w-6" />
              <span className="text-lg font-semibold">Explore Cities</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </FixedLink>
            
            <FixedLink 
              href="/local-nomads" 
              className="group btn btn-xl btn-outline flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all border-2"
            >
              <Users className="h-6 w-6" />
              <span className="text-lg font-semibold">Join Community</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </FixedLink>
          </div>

          {/* Simple Location Info */}
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 pt-8">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="font-medium">{currentLocation}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
