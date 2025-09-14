'use client'

import { useState, useEffect } from 'react'
import { Search, Zap, MapPin, Users, Coffee, ArrowRight, Globe, Star, Clock, Wifi, TrendingUp, Heart } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useUser } from '@/contexts/GlobalStateContext'
import FixedLink from '@/components/FixedLink'

export default function UltimateHeroSection() {
  const { t } = useLanguage()
  const { user } = useUser()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [currentTime, setCurrentTime] = useState('--:--')
  const [currentLocation, setCurrentLocation] = useState('Getting location...')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  
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
      // Redirect to cities page with search query
      const searchParams = new URLSearchParams({
        search: searchQuery.trim()
      })
      window.location.href = `/nomadcities?${searchParams.toString()}`
    }
  }

  const quickSearchSuggestions = [
    { text: 'Bangkok', type: 'city', icon: '🏙️' },
    { text: 'Lisbon', type: 'city', icon: '🏛️' },
    { text: 'Bali', type: 'city', icon: '🏝️' },
    { text: 'Chiang Mai', type: 'city', icon: '☕' },
    { text: 'Remote work cafes', type: 'place', icon: '☕' },
    { text: 'Co-working spaces', type: 'place', icon: '💻' }
  ]

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-yellow-200 rounded-full opacity-20 animate-bounce"></div>
      </div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        
        {/* Hero Content */}
        <div className="text-center space-y-8 max-w-5xl mx-auto">
          
          {/* Main Title with Animation */}
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200 shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">1,200+ Nomads Online</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              Your Next
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient">
                Remote Work
              </span>
              <span className="block text-4xl sm:text-5xl lg:text-6xl text-gray-700">
                Adventure Awaits
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover the perfect city for your digital nomad lifestyle. 
              Connect with fellow remote workers and unlock your next destination.
            </p>
          </div>

          {/* Enhanced Search Box */}
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <div className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-105' : 'scale-100'}`}>
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder="🔍 Where do you want to work next? (city, cafe, nomad...)"
                  className="w-full pl-16 pr-32 py-5 text-xl border-2 border-gray-200 rounded-3xl focus:border-blue-500 focus:ring-8 focus:ring-blue-100 transition-all placeholder-gray-400 bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  Search
                </button>
              </div>
            </form>
            
            {/* Enhanced Search Suggestions */}
            <div className="mt-6">
              <div className="text-sm text-gray-500 mb-3">Popular searches:</div>
              <div className="flex flex-wrap justify-center gap-3">
                {quickSearchSuggestions.map((suggestion, index) => (
                  <button 
                    key={index}
                    onClick={() => {
                      setSearchQuery(suggestion.text)
                      // Also trigger search immediately
                      const searchParams = new URLSearchParams({
                        search: suggestion.text
                      })
                      window.location.href = `/nomadcities?${searchParams.toString()}`
                    }}
                    className="group flex items-center space-x-2 bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm hover:shadow-md"
                  >
                    <span className="text-lg">{suggestion.icon}</span>
                    <span className="text-sm font-medium">{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
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
              <span className="text-lg font-semibold">Meet Nomads</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </FixedLink>
            
            <FixedLink 
              href="/nomadvisaguide" 
              className="group btn btn-xl btn-outline flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all border-2"
            >
              <MapPin className="h-6 w-6" />
              <span className="text-lg font-semibold">Visa Guide</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </FixedLink>
          </div>

          {/* Enhanced Nomad Agent CTA */}
          <div className="pt-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-lg opacity-30"></div>
              <FixedLink 
                href="/nomadagent" 
                className="relative inline-flex items-center space-x-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-5 rounded-3xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-2xl hover:shadow-3xl group transform hover:scale-105"
              >
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Zap className="h-7 w-7" />
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold">🎯 AI City Recommendations</div>
                  <div className="text-sm opacity-90">Get personalized suggestions in seconds</div>
                </div>
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </FixedLink>
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 border-t border-gray-200">
            <div className="text-center group">
              <div className="text-4xl font-bold text-blue-600 group-hover:scale-110 transition-transform">500+</div>
              <div className="text-sm text-gray-600 font-medium">Cities Worldwide</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl font-bold text-green-600 group-hover:scale-110 transition-transform">1,200+</div>
              <div className="text-sm text-gray-600 font-medium">Active Nomads</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl font-bold text-purple-600 group-hover:scale-110 transition-transform">50+</div>
              <div className="text-sm text-gray-600 font-medium">Countries</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl font-bold text-pink-600 group-hover:scale-110 transition-transform">24/7</div>
              <div className="text-sm text-gray-600 font-medium">Community Support</div>
            </div>
          </div>

          {/* Enhanced Location & Time */}
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-600 pt-8">
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="font-medium">{currentLocation}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="font-medium">{currentTime}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="font-medium">Live Updates</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
