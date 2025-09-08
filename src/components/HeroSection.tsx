'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, Globe, Calendar, Wifi, DollarSign, MapPin, Clock, Sun, Shield, Coffee, Calculator, Navigation, Plane, Search as SearchIcon } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useUser } from '@/contexts/GlobalStateContext'
import FixedLink from '@/components/FixedLink'
import EnhancedSearch from '@/components/EnhancedSearch'
import WifiSpeedTest from '@/components/WifiSpeedTest'

export default function HeroSection() {
  const { t } = useLanguage()
  const { user } = useUser()
  const [currentTime, setCurrentTime] = useState('--:--')
  const [currentLocation, setCurrentLocation] = useState(t('home.hero.liveInfo.gettingLocation'))
  const [isLoading, setIsLoading] = useState(true)
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown')
  const [showWifiTest, setShowWifiTest] = useState(false)
  const [showLocationInput, setShowLocationInput] = useState(false)
  const [customLocation, setCustomLocation] = useState('')
  const [showVisaReminder, setShowVisaReminder] = useState(false)
  
  // Weather state
  const [weather, setWeather] = useState({
    temperature: 22,
    description: 'sunny',
    icon: '01d',
    loading: false
  })
  const [locationCoords, setLocationCoords] = useState<{lat: number, lon: number} | null>(null)

  // Function to fetch weather data
  const fetchWeather = async (lat: number, lon: number, city?: string) => {
    setWeather(prev => ({ ...prev, loading: true }))
    try {
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}&city=${city || ''}`)
      const data = await response.json()
      
      setWeather({
        temperature: data.temperature,
        description: data.description,
        icon: data.icon,
        loading: false
      })
    } catch (error) {
      console.log('Weather fetch failed:', error)
      setWeather(prev => ({ ...prev, loading: false }))
    }
  }

  // Function to refresh location using IP-based geolocation
  const refreshLocation = async () => {
    setCurrentLocation(t('home.hero.liveInfo.gettingLocation'))
    setIsLoading(true)
    try {
      const response = await fetch('https://api.ipapi.com/api/check?access_key=free')
      const data = await response.json()
      
      if (data.city && data.latitude && data.longitude) {
        setCurrentLocation(data.city)
        setLocationCoords({ lat: data.latitude, lon: data.longitude })
        // 获取天气数据
        fetchWeather(data.latitude, data.longitude, data.city)
      } else if (data.region) {
        setCurrentLocation(data.region)
        // 如果没有精确坐标，不获取天气
      } else {
        // 位置获取失败，显示手动输入选项
        setCurrentLocation(t('home.hero.liveInfo.locationFailed'))
        setShowLocationInput(true)
      }
    } catch (error) {
      console.log('IP geolocation failed:', error)
      // 位置获取失败，显示手动输入选项
      setCurrentLocation(t('home.hero.liveInfo.locationFailed'))
      setShowLocationInput(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const timeString = now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
      setCurrentTime(timeString)
    }

    // Update immediately
    updateTime()
    
    // Update every second
    const interval = setInterval(updateTime, 1000)
    
    return () => clearInterval(interval)
  }, [])

  // Get current location
  useEffect(() => {
    const getLocationByIP = async () => {
      try {
        // Use IP-based geolocation as fallback
        const response = await fetch('https://api.ipapi.com/api/check?access_key=free')
        const data = await response.json()
        
        if (data.city) {
          setCurrentLocation(data.city)
        } else if (data.region) {
          setCurrentLocation(data.region)
        } else {
          setCurrentLocation(t('home.hero.liveInfo.unknownLocation'))
        }
      } catch (error) {
        console.log('IP geolocation failed:', error)
        setCurrentLocation(t('home.hero.liveInfo.unknownLocation'))
      } finally {
        setIsLoading(false)
      }
    }

    const checkLocationPermission = async () => {
      try {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
          setLocationPermission('unknown')
          await getLocationByIP()
          return
        }

        // Check permission status if available
        if ('permissions' in navigator) {
          try {
            const permission = await navigator.permissions.query({ name: 'geolocation' })
            setLocationPermission(permission.state)
            
            if (permission.state === 'denied') {
              console.log('Geolocation permission denied, using IP-based location')
              await getLocationByIP()
              return
            }
          } catch (permError) {
            console.log('Permission query not supported, proceeding with geolocation')
          }
        }

        // Try to get precise location
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            setLocationPermission('granted')
            const { latitude, longitude } = position.coords
            
            // Use reverse geocoding to get city name
            try {
              const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=zh`
              )
              const data = await response.json()
              
              if (data.city) {
                setCurrentLocation(data.city)
              } else {
                // If reverse geocoding fails, fallback to IP-based location
                await getLocationByIP()
              }
            } catch (error) {
              console.log('Reverse geocoding failed, falling back to IP-based location')
              await getLocationByIP()
            }
            
            setIsLoading(false)
          },
          async (error) => {
            console.log('Geolocation failed:', error)
            
            // Handle specific error cases
            switch (error.code) {
              case error.PERMISSION_DENIED:
                setLocationPermission('denied')
                console.log('User denied geolocation permission')
                break
              case error.POSITION_UNAVAILABLE:
                console.log('Location information unavailable')
                break
              case error.TIMEOUT:
                console.log('Location request timed out')
                break
              default:
                console.log('Unknown geolocation error')
            }
            
            // Fallback to IP-based location
            await getLocationByIP()
          },
          {
            timeout: 10000, // 10 second timeout
            enableHighAccuracy: false, // Don't require high accuracy
            maximumAge: 300000 // Accept cached position up to 5 minutes old
          }
        )
      } catch (error) {
        console.log('Location error, falling back to IP-based location:', error)
        await getLocationByIP()
      }
    }

    checkLocationPermission()
  }, [])

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start min-h-[600px] lg:min-h-[700px]">
          
          {/* Left Content - Enhanced Tool-First Experience with Clear Visual Hierarchy */}
          <div className="space-y-6 sm:space-y-8 lg:pr-8">
            {/* Header Section - Clear Visual Separation */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b-2 border-blue-100">
                <Globe className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  {t('home.hero.liveInfo.nomadDashboard')}
                </h1>
              </div>
              
              {/* User Greeting - Enhanced with better styling */}
              {user?.isAuthenticated && (
                <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200 shadow-sm">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user.profile?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {t('home.hero.liveInfo.hi')}, {user.profile?.name || 'User'}!
                    </p>
                    <p className="text-xs text-gray-600">Ready to explore?</p>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Search Section - More Prominent with Better Visual Hierarchy */}
            <div className="space-y-4">
              <div className="relative">
                {/* Search Input - Enhanced with icon and better styling */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    {t('home.hero.liveInfo.searchIcon')}
                  </div>
                  <input
                    type="text"
                    placeholder={t('home.hero.liveInfo.searchPlaceholder')}
                    className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder-gray-400 bg-white/90 backdrop-blur-sm shadow-sm"
                  />
                </div>
                
                {/* Filter Badges - Enhanced with better styling and icons */}
                <div className="mt-4 flex flex-wrap gap-3">
                  <button className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full text-sm font-medium transition-all hover:scale-105 shadow-sm border border-blue-200">
                    {t('home.hero.liveInfo.nearMe')}
                  </button>
                  <button className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-full text-sm font-medium transition-all hover:scale-105 shadow-sm border border-orange-200">
                    {t('home.hero.liveInfo.topRated')}
                  </button>
                  <button className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full text-sm font-medium transition-all hover:scale-105 shadow-sm border border-purple-200">
                    {t('home.hero.liveInfo.newCities')}
                  </button>
                </div>
              </div>
            </div>

            {/* Cities to Explore - Professional Tool Experience */}
            <div className="space-y-4">
              {/* Header with Filters and Sort */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="mr-2">🌍</span>
                    {t('home.hero.liveInfo.citiesToExplore')}
                  </h3>
                  <FixedLink 
                    href="/nomadcities"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center group hover:underline"
                  >
                    {t('home.hero.liveInfo.viewAllCities')}
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </FixedLink>
                </div>
                
                {/* Professional Filters and Sort */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 font-medium">{t('home.hero.liveInfo.cityFilters')}:</span>
                    <select className="px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-700">
                      <option>{t('home.hero.liveInfo.allRegions')}</option>
                      <option>{t('home.hero.liveInfo.asia')}</option>
                      <option>{t('home.hero.liveInfo.europe')}</option>
                      <option>{t('home.hero.liveInfo.americas')}</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 font-medium">{t('home.hero.liveInfo.sortBy')}:</span>
                    <select className="px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-700">
                      <option>{t('home.hero.liveInfo.wifiRating')}</option>
                      <option>{t('home.hero.liveInfo.costRating')}</option>
                      <option>{t('home.hero.liveInfo.visaRating')}</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Professional City Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Bangkok Card */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group hover:scale-[1.02] shadow-sm">
                  {/* City Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">🇹🇭</span>
                      <div>
                        <h4 className="font-bold text-gray-900">Bangkok</h4>
                        <p className="text-xs text-gray-600">Thailand</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm font-semibold text-gray-700">4.5</span>
                      <span className="text-xs text-gray-500">(32{t('home.hero.liveInfo.votes')})</span>
                    </div>
                  </div>
                  
                  {/* Core Metrics */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="flex items-center space-x-1">
                      <span className="text-blue-500">💻</span>
                      <span className="text-xs text-gray-700">50 Mbps</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-green-500">🛂</span>
                      <span className="text-xs text-gray-700">30 {t('home.hero.liveInfo.days')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">💰</span>
                      <span className="text-xs text-gray-700">$1600/mo</span>
                    </div>
                  </div>
                  
                  {/* Secondary Info */}
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                    <span>🔄 {t('home.hero.liveInfo.recentVisit')}: 1 {t('home.hero.liveInfo.hoursAgo')}</span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => window.open('/nomadcities/bangkok', '_blank')}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      ⭐ {t('home.hero.liveInfo.rateCity')}
                    </button>
                    <button 
                      onClick={() => {
                        // Add to favorites functionality
                        console.log('Added Bangkok to favorites')
                      }}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                    >
                      ❤️ {t('home.hero.liveInfo.addToFavorites')}
                    </button>
                  </div>
                </div>
                
                {/* Bali Card */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-green-400 hover:shadow-lg transition-all cursor-pointer group hover:scale-[1.02] shadow-sm">
                  {/* City Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">🇮🇩</span>
                      <div>
                        <h4 className="font-bold text-gray-900">Bali</h4>
                        <p className="text-xs text-gray-600">Indonesia</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-400">⭐</span>
                      <span className="text-sm font-medium text-gray-500">{t('home.hero.liveInfo.noRating')}</span>
                      <span className="text-xs text-gray-500">(0{t('home.hero.liveInfo.votes')})</span>
                    </div>
                  </div>
                  
                  {/* Core Metrics */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="flex items-center space-x-1">
                      <span className="text-orange-500">💻</span>
                      <span className="text-xs text-gray-700">25 Mbps</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-green-500">🛂</span>
                      <span className="text-xs text-gray-700">30 {t('home.hero.liveInfo.days')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-green-500">💰</span>
                      <span className="text-xs text-gray-700">$1500/mo</span>
                    </div>
                  </div>
                  
                  {/* Secondary Info */}
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                    <span>🔄 {t('home.hero.liveInfo.recentVisit')}: 1 {t('home.hero.liveInfo.daysAgo')}</span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => window.open('/nomadcities/bali', '_blank')}
                      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      ⭐ {t('home.hero.liveInfo.rateCity')}
                    </button>
                    <button 
                      onClick={() => {
                        // Add to favorites functionality
                        console.log('Added Bali to favorites')
                      }}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                    >
                      ❤️ {t('home.hero.liveInfo.addToFavorites')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* My Favorites - Enhanced with Better Layout */}
            {user?.isAuthenticated && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center pb-2 border-b border-gray-200">
                  <span className="mr-2">❤️</span>
                  {t('home.hero.liveInfo.myFavorites')}
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div 
                    onClick={() => window.open('/nomadcities/chiang-mai', '_blank')}
                    className="bg-gradient-to-r from-white to-pink-50 rounded-lg p-3 border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all cursor-pointer group hover:scale-105 text-center"
                  >
                    <div className="text-2xl mb-2">☕</div>
                    <p className="text-xs text-gray-700 font-medium">Chiang Mai</p>
                  </div>
                  <div 
                    onClick={() => window.open('/nomadcities/barcelona', '_blank')}
                    className="bg-gradient-to-r from-white to-blue-50 rounded-lg p-3 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group hover:scale-105 text-center"
                  >
                    <div className="text-2xl mb-2">🌴</div>
                    <p className="text-xs text-gray-700 font-medium">Barcelona</p>
                  </div>
                  <div 
                    onClick={() => window.open('/nomadcities/porto', '_blank')}
                    className="bg-gradient-to-r from-white to-purple-50 rounded-lg p-3 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group hover:scale-105 text-center"
                  >
                    <div className="text-2xl mb-2">🍷</div>
                    <p className="text-xs text-gray-700 font-medium">Porto</p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Entry Points - Enhanced Tool Experience */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center pb-2 border-b border-gray-200">
                <span className="mr-2">🚀</span>
                {t('home.hero.liveInfo.quickActions')}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => window.open('/local-nomads', '_blank')}
                  className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group hover:scale-105"
                >
                  <span className="text-xl">📅</span>
                  <span className="text-sm font-medium text-gray-700">{t('home.hero.liveInfo.weeklyActivities')}</span>
                </button>
                <button 
                  onClick={() => window.open('/nomadcities', '_blank')}
                  className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:border-green-400 hover:shadow-md transition-all cursor-pointer group hover:scale-105"
                >
                  <span className="text-xl">🏆</span>
                  <span className="text-sm font-medium text-gray-700">{t('home.hero.liveInfo.cityRankings')}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Content - Redesigned Layout */}
          <div className="relative lg:sticky lg:top-8 w-full">
            <div className="card card-lg bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
              <div className="p-6 space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 text-center border-b border-gray-200 pb-3">
                  {t('home.quickInfo')}
                </h3>
                
                {/* 1. Core Information Row - 核心信息行 */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {/* Location */}
                    <div className="flex flex-col items-center space-y-1">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">{currentLocation}</span>
                      <span className="text-xs text-gray-600">📍 {t('home.hero.liveInfo.currentLocation')}</span>
                    </div>
                    
                    {/* Time */}
                    <div className="flex flex-col items-center space-y-1">
                      <Clock className="h-5 w-5 text-indigo-600" />
                      <span className="text-sm font-medium text-gray-900">{isLoading ? '--:--' : currentTime}</span>
                      <span className="text-xs text-gray-600">🕒 UTC+9</span>
                    </div>
                    
                    {/* Weather */}
                    <div className="flex flex-col items-center space-y-1">
                      <Sun className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {weather.loading ? '--°C' : `${weather.temperature}°C`}
                      </span>
                      <span className="text-xs text-gray-600">
                        {weather.loading ? '⏳' : '☀️'} {t('home.hero.liveInfo.weather')}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* 2. Visa Setup Prompt - 签证设置提示 */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-6 w-6 text-amber-600" />
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {t('home.hero.liveInfo.visaSetup')}
                        </div>
                        <div className="text-sm text-gray-600">{t('home.hero.liveInfo.visaSetupDescription')}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => window.open('/setup', '_blank')}
                      className="btn btn-sm btn-amber hover:bg-amber-600 text-white"
                    >
                      ⚙️ {t('home.hero.liveInfo.setupVisa')}
                    </button>
                  </div>
                  
                </div>
                
                {/* 3. Two Column Layout for Secondary Info - Compact */}
                <div className="grid grid-cols-2 gap-3">
                  {/* WiFi & Network Info - Compact */}
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-3 rounded-xl border border-emerald-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <Wifi className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-medium text-gray-900">{t('home.hero.liveInfo.wifiRating')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="text-lg font-bold text-emerald-700">A+</div>
                        <div className="text-xs text-gray-600">📶 120Mbps</div>
                      </div>
                      <button 
                        onClick={() => setShowWifiTest(!showWifiTest)}
                        className="btn btn-xs btn-emerald"
                      >
                        🔍 {t('home.hero.liveInfo.speedTest')}
                      </button>
                    </div>
                  </div>
                  
                  {/* Cost of Living - Compact */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-xl border border-orange-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="h-4 w-4 text-orange-600" />
                      <span className="text-xs font-medium text-gray-900">{t('home.hero.liveInfo.costOfLiving')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="text-sm font-semibold text-orange-700">{t('home.hero.liveInfo.moderate')}</div>
                        <div className="text-xs text-gray-600">$1,800/mo</div>
                      </div>
                      <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">💡 {t('home.hero.liveInfo.affordable')}</div>
                    </div>
                  </div>
                </div>
                
                {/* 4. Hot Spot Recommendation - Compact */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Coffee className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{t('home.hero.liveInfo.popularCafe')}</div>
                        <div className="text-lg font-semibold text-purple-700">Blue Bottle Coffee</div>
                        <div className="text-xs text-gray-600">{t('home.hero.liveInfo.fromUserRecommendations', { count: '127' })}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => window.open('/nomadplaces', '_blank')}
                      className="btn btn-sm btn-purple hover:bg-purple-600 text-white"
                    >
                      🔗 {t('home.hero.liveInfo.viewDetails')}
                    </button>
                  </div>
                </div>
                
                {/* 5. Quick Action Toolbar - Compact */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-3 text-center">
                    🚀 {t('home.hero.liveInfo.quickActions')}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      onClick={() => window.open('/cost-calculator', '_blank')}
                      className="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                    >
                      <Calculator className="h-5 w-5 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-gray-700">{t('home.hero.liveInfo.budgetCalculator')}</span>
                    </button>
                    
                    <button 
                      onClick={() => window.open('/nomadcities', '_blank')}
                      className="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all group"
                    >
                      <Navigation className="h-5 w-5 text-green-600 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-gray-700">{t('home.hero.liveInfo.switchCity')}</span>
                    </button>
                    
                    <button 
                      onClick={() => window.open('/dashboard', '_blank')}
                      className="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
                    >
                      <Plane className="h-5 w-5 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-gray-700">{t('home.hero.liveInfo.travelPlanning')}</span>
                    </button>
                  </div>
                </div>
                
                {/* 6. WiFi Speed Test */}
                {showWifiTest && (
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <div className="text-sm font-medium text-blue-700 mb-3 flex items-center">
                      <Wifi className="h-4 w-4 mr-2" />
                      {t('home.hero.liveInfo.wifiSpeedTest')}
                    </div>
                    <WifiSpeedTest />
                  </div>
                )}
                
                {/* 7. Location Permission Status - Simplified */}
                {locationPermission === 'denied' && (
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <div className="text-sm font-medium text-amber-700 mb-3 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {t('home.hero.liveInfo.locationPermissionDenied')}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={refreshLocation}
                        className="flex-1 btn btn-sm btn-amber hover:bg-amber-600 text-white"
                      >
                        🔄 {t('home.hero.liveInfo.refreshLocation')}
                      </button>
                      <button 
                        onClick={() => setShowLocationInput(true)}
                        className="flex-1 btn btn-sm btn-blue hover:bg-blue-600 text-white"
                      >
                        📝 {t('home.hero.liveInfo.enterManually')}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* 8. Custom Location Input */}
                {showLocationInput && (
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <div className="text-sm font-medium text-blue-700 mb-3 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {t('home.hero.liveInfo.enterCustomLocation')}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        placeholder={t('home.hero.liveInfo.locationPlaceholder')}
                        className="flex-1 px-3 py-2 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button 
                        onClick={async () => {
                          if (customLocation.trim()) {
                            setCurrentLocation(customLocation.trim())
                            setShowLocationInput(false)
                            setCustomLocation('')
                            
                            // 尝试通过城市名获取坐标和天气
                            try {
                              // 这里可以调用地理编码API获取坐标
                              // 暂时使用模拟坐标
                              const mockCoords = { lat: 35.6762, lon: 139.6503 } // 东京坐标作为示例
                              setLocationCoords(mockCoords)
                              fetchWeather(mockCoords.lat, mockCoords.lon, customLocation.trim())
                            } catch (error) {
                              console.log('Failed to get weather for custom location:', error)
                            }
                          }
                        }}
                        className="btn btn-sm btn-blue hover:bg-blue-600 text-white"
                      >
                        ✅
                      </button>
                      <button 
                        onClick={() => {
                          setShowLocationInput(false)
                          setCustomLocation('')
                        }}
                        className="btn btn-sm btn-gray hover:bg-gray-600 text-white"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce opacity-80"></div>
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-purple-400 rounded-full animate-pulse opacity-80"></div>
          </div>
        </div>
      </div>

      {/* Bottom Wave - Adjusted to not cover content */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none -z-10">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-auto">
          <path 
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
            opacity=".15" 
            className="fill-current text-white"
          ></path>
          <path 
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
            opacity=".3" 
            className="fill-current text-white"
          ></path>
          <path 
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
            opacity=".6" 
            className="fill-current text-white"
          ></path>
        </svg>
      </div>
    </section>
  )
}
