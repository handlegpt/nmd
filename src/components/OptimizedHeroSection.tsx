'use client'

import { useState, useEffect } from 'react'
import { Search, Zap, MapPin, Users, Coffee, ArrowRight, Globe, Star, Clock, Wifi } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useUser } from '@/contexts/GlobalStateContext'
import FixedLink from '@/components/FixedLink'

export default function OptimizedHeroSection() {
  const { t } = useLanguage()
  const { user } = useUser()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [currentTime, setCurrentTime] = useState('--:--')
  const [currentLocation, setCurrentLocation] = useState('Getting location...')
  
  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
      setCurrentTime(timeString)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

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
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* World Map Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-blue-100 to-transparent"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        
        {/* Hero Content */}
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          
          {/* Main Title */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Find Your Next
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Remote Work City
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the best cities for digital nomads, connect with fellow remote workers, 
              and plan your next adventure.
            </p>
          </div>

          {/* Global Search Box */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 Where do you want to work next? (city, cafe, nomad...)"
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder-gray-400 bg-white/90 backdrop-blur-sm shadow-lg"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Search
                </button>
              </div>
            </form>
            
            {/* Search Suggestions */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="text-sm text-gray-500">Try:</span>
              <button 
                onClick={() => setSearchQuery('Bangkok')}
                className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
              >
                Bangkok
              </button>
              <button 
                onClick={() => setSearchQuery('Lisbon')}
                className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
              >
                Lisbon
              </button>
              <button 
                onClick={() => setSearchQuery('Bali')}
                className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
              >
                Bali
              </button>
            </div>
          </div>

          {/* Core CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <FixedLink 
              href="/nomadcities" 
              className="btn btn-lg btn-primary flex items-center justify-center space-x-2 group"
            >
              <Globe className="h-5 w-5" />
              <span>Explore Cities</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </FixedLink>
            
            <FixedLink 
              href="/local-nomads" 
              className="btn btn-lg btn-outline flex items-center justify-center space-x-2 group"
            >
              <Users className="h-5 w-5" />
              <span>Meet Nomads</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </FixedLink>
            
            <FixedLink 
              href="/nomadvisaguide" 
              className="btn btn-lg btn-outline flex items-center justify-center space-x-2 group"
            >
              <MapPin className="h-5 w-5" />
              <span>Visa Guide</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </FixedLink>
          </div>

          {/* Nomad Agent CTA */}
          <div className="pt-8">
            <FixedLink 
              href="/nomadagent" 
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl group"
            >
              <Zap className="h-6 w-6" />
              <span className="text-lg font-semibold">🎯 AI推荐下个城市</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </FixedLink>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 border-t border-gray-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">500+</div>
              <div className="text-sm text-gray-600">Cities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">1,200+</div>
              <div className="text-sm text-gray-600">Active Nomads</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">50+</div>
              <div className="text-sm text-gray-600">Countries</div>
            </div>
          </div>

          {/* Current Location & Time */}
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>{currentLocation}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{currentTime}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
