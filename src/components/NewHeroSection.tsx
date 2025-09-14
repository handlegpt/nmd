'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, Globe, Users, Coffee, MapPin, Star, Search, Zap, Heart, MessageCircle } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useUser } from '@/contexts/GlobalStateContext'
import FixedLink from '@/components/FixedLink'

export default function NewHeroSection() {
  const { t } = useLanguage()
  const { user } = useUser()
  
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

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          
          {/* Left Content - Main Value Proposition */}
          <div className="space-y-8">
            {/* Hero Title */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900">
                  Connect with
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    Digital Nomads
                  </span>
                </h1>
              </div>
              
              <p className="text-xl text-gray-600 max-w-2xl">
                Find your next destination, meet fellow nomads, and discover the best cities for remote work. 
                Join the global community of location-independent professionals.
              </p>
            </div>

            {/* Main CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <FixedLink 
                href="/local-nomads" 
                className="btn btn-lg btn-primary flex items-center justify-center space-x-2 group"
              >
                <Users className="h-5 w-5" />
                <span>Find Local Nomads</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </FixedLink>
              
              <FixedLink 
                href="/nomadcities" 
                className="btn btn-lg btn-outline flex items-center justify-center space-x-2"
              >
                <MapPin className="h-5 w-5" />
                <span>Explore Cities</span>
              </FixedLink>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">500+</div>
                <div className="text-sm text-gray-600">Cities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">1,200+</div>
                <div className="text-sm text-gray-600">Active Nomads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">50+</div>
                <div className="text-sm text-gray-600">Countries</div>
              </div>
            </div>
          </div>

          {/* Right Content - Interactive Features */}
          <div className="relative">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 p-8">
              
              {/* Nomad Agent Section */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Ask Nomad Agent</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 mb-2">Try asking:</div>
                    <div className="space-y-2">
                      <div className="text-sm bg-white rounded-lg p-3 border border-gray-200">
                        "Budget $2000, need 90-day visa, love beaches"
                      </div>
                      <div className="text-sm bg-white rounded-lg p-3 border border-gray-200">
                        "Best cities for remote work in Asia?"
                      </div>
                    </div>
                  </div>
                  
                  <FixedLink 
                    href="/nomadagent" 
                    className="btn btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    <Search className="h-4 w-4" />
                    <span>Get Personalized Recommendations</span>
                  </FixedLink>
                </div>
              </div>

              {/* Live Nomads Preview */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Live Nomads
                  </h3>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">128 online</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {/* Sample Nomad Cards */}
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                      A
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Alex Chen</div>
                      <div className="text-sm text-gray-600">📍 Bangkok • Available for coffee</div>
                    </div>
                    <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Coffee className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                      S
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Sarah Kim</div>
                      <div className="text-sm text-gray-600">📍 Bali • Working remotely</div>
                    </div>
                    <button className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <MessageCircle className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                      M
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Marco Silva</div>
                      <div className="text-sm text-gray-600">📍 Lisbon • Looking for co-working</div>
                    </div>
                    <button className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <FixedLink 
                  href="/local-nomads" 
                  className="btn btn-outline w-full mt-4 flex items-center justify-center space-x-2"
                >
                  <Users className="h-4 w-4" />
                  <span>View All Nomads</span>
                </FixedLink>
              </div>

              {/* Quick Info */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{currentLocation}</div>
                    <div className="text-xs text-gray-600">📍 Current Location</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{currentTime}</div>
                    <div className="text-xs text-gray-600">🕒 Local Time</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce opacity-80"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-purple-400 rounded-full animate-pulse opacity-80"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
