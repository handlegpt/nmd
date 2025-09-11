'use client'

import React, { useState, useEffect } from 'react'
import LocalNomads from '@/components/LocalNomads'
import GlobalNomadsMap from '@/components/GlobalNomadsMap'
import MeetupSystem from '@/components/MeetupSystem'
import RealTimeData from '@/components/RealTimeData'
import MobileNavigation from '@/components/MobileNavigation'
import ThemeToggle from '@/components/ThemeToggle'
import { useTranslation } from '@/hooks/useTranslation'
import { useUser } from '@/contexts/GlobalStateContext'
import { useNomadUsers } from '@/hooks/useNomadUsers'
import { 
  Users, 
  Coffee, 
  MapPin, 
  Star, 
  TrendingUp, 
  Globe,
  Heart,
  MessageCircle,
  Calendar,
  Clock,
  Search,
  Filter,
  SortAsc
} from 'lucide-react'
import ErrorAlert, { ErrorAlertSimple } from '@/components/ErrorAlert'

export default function LocalNomadsPage() {
  const { t } = useTranslation()
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState<'discover' | 'my-meetups' | 'realtime' | 'favorites'>('discover')
  
  // 使用统一的用户数据管理Hook获取统计数据
  const {
    stats,
    error,
    refreshUsers
  } = useNomadUsers({
    enablePagination: false,
    enableInfiniteScroll: false,
    enableRealTimeUpdates: true,
    updateInterval: 60000 // 1分钟更新一次统计数据
  })

  // 计算城市数量（基于用户位置）
  const totalCities = React.useMemo(() => {
    if (!stats?.totalUsers) return 0
    
    try {
      const keys = Object.keys(localStorage)
      const profileKeys = keys.filter(key => key.startsWith('user_profile_details_'))
      const cities = new Set()
      
      // 如果没有找到独立profile，尝试从通用profile获取（向后兼容）
      if (profileKeys.length === 0) {
        const generalProfile = localStorage.getItem('user_profile_details')
        if (generalProfile) {
          try {
            const profile = JSON.parse(generalProfile)
            if (profile.id && profile.name) {
              profileKeys.push('user_profile_details')
            }
          } catch (error) {
            console.error('Error parsing general profile for cities:', error)
          }
        }
      }
      
      profileKeys.forEach(key => {
        try {
          const profileData = localStorage.getItem(key)
          if (profileData) {
            const profile = JSON.parse(profileData)
            if (profile?.current_city && profile.current_city !== 'Unknown Location') {
              cities.add(profile.current_city)
            }
          }
        } catch (e) {
          console.error('Failed to parse profile for cities:', e)
        }
      })
      
      return cities.size
    } catch (error) {
      console.error('Failed to calculate cities:', error)
      return 0
    }
  }, [stats?.totalUsers])

  // 统一的社区统计数据
  const communityStats = {
    totalCities,
    totalNomads: stats?.totalUsers || 0,
    totalMeetups: stats?.todayMeetups || 0
  }

  const tabs = [
    { id: 'discover', label: t('localNomads.discover'), icon: Users },
    { id: 'my-meetups', label: t('localNomads.myMeetups'), icon: Coffee },
    { id: 'realtime', label: t('localNomads.realtimeData'), icon: TrendingUp },
    { id: 'favorites', label: t('localNomads.favorites'), icon: Heart }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 错误显示 */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <ErrorAlertSimple
            message={error}
            onRetry={refreshUsers}
            onDismiss={() => {}} // Hook会自动清除错误
          />
        </div>
      )}
      
      {/* 优化后的Header - 简洁标题 + 概览数字 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex flex-col">
              {/* 主标题 */}
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('localNomads.pageTitle')}
                </h1>
              </div>
              
              {/* 简洁概览 - 小字体副标题 */}
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>{communityStats.totalCities} {t('localNomads.stats.cities')}</span>
                <span>•</span>
                <span>{communityStats.totalNomads.toLocaleString()} {t('localNomads.stats.nomads')}</span>
                <span>•</span>
                <span>{communityStats.totalMeetups.toLocaleString()} {t('localNomads.stats.meetups')}</span>
              </div>
            </div>
            
            {/* 右侧操作区 - 主题切换移到全局导航 */}
            <div className="flex items-center space-x-4">
              <MobileNavigation />
            </div>
          </div>
        </div>
      </header>

      {/* 全球统计区 - 详细统计卡片 */}
      <section className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* 活跃城市 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{communityStats.totalCities}</div>
                  <div className="text-gray-600 dark:text-gray-400">{t('localNomads.stats.activeCities')}</div>
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('localNomads.stats.citiesDescription')}</div>
            </div>
            
            {/* 数字游民 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">{communityStats.totalNomads.toLocaleString()}</div>
                  <div className="text-gray-600 dark:text-gray-400">{t('localNomads.stats.digitalNomads')}</div>
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('localNomads.stats.nomadsDescription')}</div>
            </div>
            
            {/* Meetup活动 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center">
                  <Coffee className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{communityStats.totalMeetups.toLocaleString()}</div>
                  <div className="text-gray-600 dark:text-gray-400">{t('localNomads.stats.meetupActivities')}</div>
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('localNomads.stats.meetupsDescription')}</div>
            </div>
          </div>
          
          {/* 社区评分行 */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="font-medium">{t('localNomads.stats.communityRating')}: 4.8/5</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
                              <span className="font-medium">{t('localNomads.successRate')}: 94%</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-500" />
                              <span className="font-medium">{t('localNomads.avgConnectionTime')}: 2.3 {t('localNomads.stats.days')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="py-6">
        {activeTab === 'discover' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Global Hotspots Map Section - 整合定位提示 */}
            <section className="mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-blue-500" />
                    {t('localNomads.globalHotspots')}
                  </h3>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    {t('localNomads.exploreGlobal')}
                  </button>
                </div>
                
                {/* 定位提示 - 整合到地图区域 */}
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-blue-700 dark:text-blue-300">
                      <MapPin className="w-4 h-4" />
                      <span>{t('localNomads.enableLocationToDiscover')}</span>
                    </div>
                    <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors">
                      {t('localNomads.enableLocation')}
                    </button>
                  </div>
                </div>
                
                {/* Real Google Maps Integration */}
                <GlobalNomadsMap 
                  onCityClick={(city) => console.log('City clicked:', city)}
                  onMeetupClick={(meetupId) => console.log('Meetup clicked:', meetupId)}
                />
              </div>
            </section>

            {/* Search and Filter Section */}
            <section className="mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2 text-blue-500" />
                    {t('localNomads.searchAndConnect')}
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('localNomads.searchNomads')}
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder={t('localNomads.searchPlaceholder')}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  {/* Filters */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('localNomads.filters')}
                    </label>
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option>{t('localNomads.filterByCity')}</option>
                        <option>{t('localNomads.filterByInterest')}</option>
                        <option>{t('localNomads.filterByLanguage')}</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Sort */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('localNomads.sortBy')}
                    </label>
                    <div className="relative">
                      <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option>{t('localNomads.sortByOnlineStatus')}</option>
                        <option>{t('localNomads.sortByDistance')}</option>
                        <option>{t('localNomads.sortByActivity')}</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>{t('localNomads.startConversation')}</span>
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{t('localNomads.scheduleMeetup')}</span>
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                    <Users className="w-4 h-4" />
                    <span>{t('localNomads.inviteFriends')}</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Hot Meetups Section */}
            <section className="mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                    {t('localNomads.hotMeetups')}
                  </h3>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    {t('localNomads.viewAllMeetups')} →
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Meetup Card 1 */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        🔥 {t('localNomads.lisbonCoffeeChat')}
                      </h4>
                      <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                        8 {t('localNomads.peopleJoined')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {t('localNomads.lisbonCoffeeChatDesc')}
                    </p>
                    <button className="w-full bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm">
                      {t('localNomads.joinMeetup')}
                    </button>
                  </div>
                  
                  {/* Meetup Card 2 */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-blue-900/40 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        🧑‍💻 {t('localNomads.chiangMaiDevCowork')}
                      </h4>
                      <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        12 {t('localNomads.peopleJoined')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {t('localNomads.chiangMaiDevCoworkDesc')}
                    </p>
                    <button className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      {t('localNomads.joinMeetup')}
                    </button>
                  </div>
                  
                  {/* Meetup Card 3 */}
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-green-900/40 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        🏖️ {t('localNomads.baliBeachCoworking')}
                      </h4>
                      <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        15 {t('localNomads.peopleJoined')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {t('localNomads.baliBeachCoworkingDesc')}
                    </p>
                    <button className="w-full bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                      {t('localNomads.joinMeetup')}
                    </button>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Enhanced Meetups Section */}
            <section className="mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                    🔥 {t('localNomads.hotMeetupActivities')}
                  </h3>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    {t('localNomads.viewAllActivities')} →
                  </button>
                </div>
                
                <MeetupSystem />
              </div>
            </section>

            {/* Active Users Rankings */}
            <section className="mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-500" />
                    {t('localNomads.activeUsers')}
                  </h3>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    {t('localNomads.viewAllUsers')}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* User 1 */}
                  <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                      T
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Tom</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Lisbon</p>
                    <div className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      ☕ {t('localNomads.coffeeHero')}
                    </div>
                  </div>
                  
                  {/* User 2 */}
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-blue-900/40 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                      M
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">May</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Bali</p>
                    <div className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      🗺️ {t('localNomads.nomadExplorer')}
                    </div>
                  </div>
                  
                  {/* User 3 */}
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-green-900/40 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                      A
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Anna</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Chiang Mai</p>
                    <div className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      🏗️ {t('localNomads.communityBuilder')}
                    </div>
                  </div>
                  
                  {/* User 4 */}
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-purple-900/40 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                      S
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Sam</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Porto</p>
                    <div className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                      🎯 {t('localNomads.meetupMaster')}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 删除 Nearby Nomads Section - 功能被地图和搜索覆盖 */}
          </div>
        )}
        
        {activeTab === 'my-meetups' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <MeetupSystem />
          </div>
        )}
        
        {activeTab === 'realtime' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <RealTimeData />
          </div>
        )}
        
        {activeTab === 'favorites' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('localNomads.favoritesTitle')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('localNomads.favoritesDescription')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {t('localNomads.comingSoon')}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer CTA */}
      <section className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('localNomads.readyToConnect')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('localNomads.readyToConnectDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <MessageCircle className="w-4 h-4 mr-2" />
                {t('localNomads.startConversation')}
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                <Calendar className="w-4 h-4 mr-2" />
                {t('localNomads.scheduleMeetup')}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
