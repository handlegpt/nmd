'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  Search as SearchIcon, 
  MapPin, 
  Calendar, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  Upload, 
  Globe,
  Clock,
  TrendingUp,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useUser, useNotifications } from '@/contexts/GlobalStateContext'

import { getCities } from '@/lib/api'
import { City } from '@/lib/supabase'
import { logInfo, logError } from '@/lib/logger'
import PageLayout from '@/components/PageLayout'
import LoadingSpinner from '@/components/LoadingSpinner'
import FixedLink from '@/components/FixedLink'
import UnifiedVoteSystem from '@/components/UnifiedVoteSystem'
import UniversalRecommendationForm from '@/components/UniversalRecommendationForm'
import CityMatchFilter, { CityMatch } from '@/components/CityMatchFilter'
import CityMatchResults from '@/components/CityMatchResults'
import CityComparisonSelector from '@/components/CityComparisonSelector'
import CityFavoriteButton from '@/components/CityFavoriteButton'
import TrajectoryMap from '@/components/TrajectoryMap'
import EnhancedCityCard from '@/components/EnhancedCityCard'
import CityFiltersAndSort from '@/components/CityFiltersAndSort'
import CityComparisonToolbar from '@/components/CityComparisonToolbar'

interface VoteItem {
  id: string
  name: string
  type: 'city'
  currentVotes: {
    upvotes: number
    downvotes: number
    rating: number
  }
}

interface CityTrajectory {
  id: string
  cityName: string
  country: string
  startDate: string
  endDate: string | null
  daysStayed: number
  type: 'residence' | 'visit' | 'work'
  notes: string
  coordinates?: {
    lat: number
    lng: number
  }
}

function CitiesPageContent() {
  const { t } = useTranslation()
  const { user } = useUser()
  const { addNotification } = useNotifications()
  const searchParams = useSearchParams()
  
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [matchResults, setMatchResults] = useState<CityMatch[]>([])
  const [showMatchResults, setShowMatchResults] = useState(false)
  
  // 新增：标签页状态
  const [activeTab, setActiveTab] = useState('cities')
  
  // 新增：轨迹相关状态
  const [trajectories, setTrajectories] = useState<CityTrajectory[]>([])
  const [showTrajectoryForm, setShowTrajectoryForm] = useState(false)
  const [editingTrajectory, setEditingTrajectory] = useState<CityTrajectory | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  
  // 新增：增强城市页面状态
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [sortBy, setSortBy] = useState<{ field: string; direction: 'asc' | 'desc' }>({
    field: 'rating',
    direction: 'desc'
  })
  
  // 新增：分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  useEffect(() => {
    fetchCities()
    loadTrajectories()
  }, [])

  // 监听用户认证状态变化
  useEffect(() => {
    if (!user.isAuthenticated) {
      setTrajectories([])
    } else {
      loadTrajectories()
    }
  }, [user.isAuthenticated])

  useEffect(() => {
    // 检查URL参数，如果包含add=true且用户已登录，则显示添加表单
    const shouldShowAddForm = searchParams.get('add') === 'true' && user.isAuthenticated
    if (shouldShowAddForm) {
      setShowAddForm(true)
    }
    
    // 检查URL参数，如果包含tab=trajectory，则切换到轨迹标签页
    const tab = searchParams.get('tab')
    if (tab === 'trajectory') {
      setActiveTab('trajectory')
    }
  }, [searchParams, user.isAuthenticated])

  const fetchCities = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCities()
      setCities(data)
    } catch (error) {
      logError('Error fetching cities', error, 'CitiesPage')
      setError('Failed to load cities. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // 新增：加载轨迹数据
  const loadTrajectories = () => {
    try {
      // 只有登录用户才能加载轨迹数据
      if (!user.isAuthenticated) {
        setTrajectories([])
        return
      }
      
      const stored = null // TODO: Replace localStorage with database API for city_trajectory
      if (stored) {
        setTrajectories(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Error loading trajectories:', error)
    }
  }

  // 新增：保存轨迹数据
  const saveTrajectories = (newTrajectories: CityTrajectory[]) => {
    try {
      // TODO: Replace localStorage with database API for city_trajectory)
      setTrajectories(newTrajectories)
      addNotification({
        type: 'success',
        message: '轨迹数据保存成功'
      })
    } catch (error) {
      console.error('Error saving trajectories:', error)
      addNotification({
        type: 'error',
        message: '保存失败，请重试'
      })
    }
  }

  // 新增：添加/编辑轨迹
  const handleTrajectorySubmit = (trajectoryData: Partial<CityTrajectory>) => {
    if (editingTrajectory) {
      // 编辑现有轨迹
      const updatedTrajectories = trajectories.map(t => 
        t.id === editingTrajectory.id ? { ...t, ...trajectoryData } : t
      )
      saveTrajectories(updatedTrajectories)
      setEditingTrajectory(null)
    } else {
      // 添加新轨迹
      const newTrajectory: CityTrajectory = {
        id: `trajectory-${Date.now()}`,
        cityName: trajectoryData.cityName || '',
        country: trajectoryData.country || '',
        startDate: trajectoryData.startDate || '',
        endDate: trajectoryData.endDate || null,
        daysStayed: trajectoryData.daysStayed || 0,
        type: trajectoryData.type || 'residence',
        notes: trajectoryData.notes || '',
        coordinates: trajectoryData.coordinates
      }
      saveTrajectories([...trajectories, newTrajectory])
    }
    setShowTrajectoryForm(false)
  }

  // 新增：删除轨迹
  const handleDeleteTrajectory = (id: string) => {
    if (confirm('确定要删除这条轨迹记录吗？')) {
      const updatedTrajectories = trajectories.filter(t => t.id !== id)
      saveTrajectories(updatedTrajectories)
    }
  }

  // 新增：导出轨迹数据
  const exportTrajectories = () => {
    try {
      const dataStr = JSON.stringify(trajectories, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `city-trajectory-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
      addNotification({
        type: 'success',
        message: '轨迹数据导出成功'
      })
    } catch (error) {
      console.error('Error exporting trajectories:', error)
      addNotification({
        type: 'error',
        message: '导出失败，请重试'
      })
    }
  }

  // 新增：导入轨迹数据
  const handleImportTrajectories = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string)
          if (Array.isArray(importedData)) {
            saveTrajectories(importedData)
            addNotification({
              type: 'success',
              message: '轨迹数据导入成功'
            })
          } else {
            throw new Error('Invalid data format')
          }
        } catch (error) {
          console.error('Error importing trajectories:', error)
          addNotification({
            type: 'error',
            message: '导入失败，数据格式不正确'
          })
        }
      }
      reader.readAsText(file)
    }
    setShowImportModal(false)
  }

  const filteredCities = cities
    .filter(city => {
      return city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             city.country.toLowerCase().includes(searchTerm.toLowerCase())
    })
    .sort((a, b) => {
      let aValue: number | string
      let bValue: number | string
      
      switch (sortBy.field) {
        case 'rating':
          aValue = a.avg_overall_rating || 0
          bValue = b.avg_overall_rating || 0
          break
        case 'cost':
          aValue = a.cost_of_living || 0
          bValue = b.cost_of_living || 0
          break
        case 'wifi':
          aValue = a.wifi_speed || 0
          bValue = b.wifi_speed || 0
          break
        case 'visa':
          aValue = a.visa_days || 0
          bValue = b.visa_days || 0
          break
        case 'nomads':
          // 使用基于城市ID的固定游民数量，确保排序一致性
          aValue = (a.id.charCodeAt(0) + a.id.charCodeAt(a.id.length - 1)) % 50 + 10
          bValue = (b.id.charCodeAt(0) + b.id.charCodeAt(b.id.length - 1)) % 50 + 10
          break
        default:
          aValue = a.name
          bValue = b.name
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortBy.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      } else {
        const numA = Number(aValue)
        const numB = Number(bValue)
        return sortBy.direction === 'asc' ? numA - numB : numB - numA
      }
    })

  // 新增：分页计算
  const totalPages = Math.ceil(filteredCities.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCities = filteredCities.slice(startIndex, endIndex)

  // 新增：分页处理函数
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // 重置到第一页
  }

  const getCountryFlag = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }

  const getVisaColor = (days: number) => {
    if (days >= 365) return 'text-green-600'
    if (days >= 90) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleVoteSubmitted = (voteData: any) => {
    logInfo('Vote submitted', voteData, 'CitiesPage')
    addNotification({
      type: 'success',
      message: t('voteSystem.voteSubmitted')
    })
  }

  const handleAddCity = async (cityData: any) => {
    try {
      logInfo('Adding new city', cityData, 'CitiesPage')
      
      // 模拟API调用
      const newCity: City = {
        id: `temp-${Date.now()}`,
        slug: cityData.name.toLowerCase().replace(/\s+/g, '-'),
        name: cityData.name,
        country: cityData.country,
        country_code: cityData.country_code || 'XX',
        country_name: cityData.country,
        timezone: cityData.timezone || 'UTC+0',
        latitude: cityData.latitude || 0,
        longitude: cityData.longitude || 0,
        population: 0,
        language: 'English',
        currency: 'USD',
        climate_tag: 'temperate',
        safety_score: 7.0,
        wifi_speed_mbps: cityData.wifi_speed || 0,
        cost_min_usd: cityData.cost_of_living || 0,
        cost_max_usd: cityData.cost_of_living || 0,
        nomad_score: 7.0,
        community_score: 7.0,
        coffee_score: 7.0,
        coworking_score: 7.0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // 向后兼容字段
        cost_of_living: cityData.cost_of_living || 0,
        wifi_speed: cityData.wifi_speed || 0,
        visa_days: cityData.visa_days || 0,
        visa_type: cityData.visa_type || 'Tourist'
      }
      
      setCities(prev => [newCity, ...prev])
      setShowAddForm(false)
      
      addNotification({
        type: 'success',
        message: t('cities.addCitySuccess', { cityName: cityData.name })
      })
    } catch (error) {
      logError('Error adding city', error, 'CitiesPage')
      addNotification({
        type: 'error',
        message: t('cities.addCityError')
      })
    }
  }

  const handleResetMatches = () => {
    setShowMatchResults(false)
    setMatchResults([])
  }
  
  // 新增：增强城市页面处理函数
  const handleCitySelect = (cityId: string) => {
    setSelectedCities(prev => {
      if (prev.includes(cityId)) {
        return prev.filter(id => id !== cityId)
      } else if (prev.length < 6) {
        return [...prev, cityId]
      }
      return prev
    })
  }
  
  const handleCityRemove = (cityId: string) => {
    setSelectedCities(prev => prev.filter(id => id !== cityId))
  }
  
  const handleClearAllCities = () => {
    setSelectedCities([])
  }
  
  const handleCompareCities = () => {
    // 跳转到城市对比页面
    window.location.href = `/city-comparison?cities=${selectedCities.join(',')}`
  }
  
  const handleSearch = (query: string) => {
    setSearchTerm(query)
    setCurrentPage(1) // 重置到第一页
    // 这里可以添加搜索逻辑
  }
  
  const handleFilter = (filters: any) => {
    // 这里可以添加筛选逻辑
    console.log('Filters applied:', filters)
    setCurrentPage(1) // 重置到第一页
  }
  
  const handleSort = (sort: any) => {
    setSortBy(sort)
    setCurrentPage(1) // 重置到第一页
    // 这里可以添加排序逻辑
  }
  
  const handleViewChange = (view: 'grid' | 'map') => {
    setViewMode(view)
  }
  
  const handleViewDetails = (city: any) => {
    // 跳转到城市详情页面，使用SEO友好的URL
    const citySlug = city.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    const countrySlug = city.country.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    window.location.href = `/nomadcities/${countrySlug}/${citySlug}`
  }
  
  const handleAddToFavorites = (cityId: string) => {
    // 这里可以添加收藏逻辑
    console.log('Add to favorites:', cityId)
  }

  // 新增：渲染轨迹标签页
  const renderTrajectoryTab = () => (
                <div className="space-y-6">
      {/* 轨迹概览统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
                      <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('cities.totalCities')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{trajectories.length}</p>
                      </div>
            <Globe className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
                    <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('cities.totalDays')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {trajectories.reduce((sum, t) => sum + (t.daysStayed || 0), 0)}
              </p>
                    </div>
            <Clock className="w-8 h-8 text-green-500" />
                        </div>
                        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
                        <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('cities.currentCity')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {trajectories.find(t => !t.endDate)?.cityName || t('cities.noTrajectory')}
              </p>
                        </div>
            <MapPin className="w-8 h-8 text-orange-500" />
                      </div>
                    </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
                  <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('cities.consecutiveDays')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(() => {
                  const currentCity = trajectories.find(t => !t.endDate)
                  if (!currentCity) return 0
                  const startDate = new Date(currentCity.startDate)
                  const now = new Date()
                  return Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                })()}
              </p>
                          </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
                          </div>
                        </div>
                      </div>

      {/* 轨迹操作按钮 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('cities.myTravelTrajectory')}</h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Upload className="w-4 h-4" />
              {t('cities.import')}
            </button>
            <button
              onClick={exportTrajectories}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              {t('cities.export')}
            </button>
            <button
              onClick={() => setShowTrajectoryForm(true)}
              className="flex items-center gap-2 px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('cities.addTrajectory')}
            </button>
                        </div>
                      </div>

        {/* 轨迹列表 */}
        <div className="space-y-4">
          {trajectories.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 italic text-center py-8">
              {t('cities.noTrajectoryRecord')}
            </p>
          ) : (
            trajectories.map((trajectory) => (
              <div key={trajectory.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-700 dark:hover:bg-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {trajectory.cityName}, {trajectory.country}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {trajectory.startDate} - {trajectory.endDate || '至今'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {trajectory.daysStayed} {t('common.days')} • {trajectory.type === 'residence' ? t('trajectoryMap.legend.residence') : trajectory.type === 'visit' ? t('trajectoryMap.legend.visit') : t('trajectoryMap.legend.work')}
                    </p>
                    {trajectory.notes && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {trajectory.notes}
                      </p>
                    )}
                          </div>
                          </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingTrajectory(trajectory)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg dark:hover:bg-blue-900/20"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTrajectory(trajectory.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                        </div>
                      </div>
            ))
          )}
                    </div>
                  </div>

      {/* 轨迹地图可视化 */}
      {trajectories.length > 0 && (
        <TrajectoryMap trajectories={trajectories} />
      )}
                          </div>
  )

  // 新增：轨迹表单组件
  const renderTrajectoryForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {editingTrajectory ? t('trajectoryForm.editTrajectory') : t('trajectoryForm.addTrajectory')}
        </h3>
        
        <form onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          handleTrajectorySubmit({
            cityName: formData.get('cityName') as string,
            country: formData.get('country') as string,
            startDate: formData.get('startDate') as string,
            endDate: formData.get('endDate') as string || null,
            daysStayed: parseInt(formData.get('daysStayed') as string) || 0,
            type: formData.get('type') as 'residence' | 'visit' | 'work',
            notes: formData.get('notes') as string
          })
        }} className="space-y-4">
                    <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('cities.cityName')} *
            </label>
            <input
              type="text"
              name="cityName"
              defaultValue={editingTrajectory?.cityName}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="例如：Bangkok"
            />
                        </div>
          
                        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('cities.country')} *
            </label>
            <input
              type="text"
              name="country"
              defaultValue={editingTrajectory?.country}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="例如：Thailand"
            />
                        </div>
          
          <div className="grid grid-cols-2 gap-4">
                        <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('cities.startDate')} *
              </label>
              <input
                type="date"
                name="startDate"
                defaultValue={editingTrajectory?.startDate}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
                        </div>

                        <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('cities.endDate')}
              </label>
              <input
                type="date"
                name="endDate"
                defaultValue={editingTrajectory?.endDate || ''}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
                      </div>
                    </div>

          <div className="grid grid-cols-2 gap-4">
                    <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('cities.daysStayed')}
              </label>
              <input
                type="number"
                name="daysStayed"
                defaultValue={editingTrajectory?.daysStayed}
                min="0"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="0"
              />
                          </div>

                        <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('cities.type')}
              </label>
              <select
                name="type"
                defaultValue={editingTrajectory?.type || 'residence'}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="residence">{t('cities.residence')}</option>
                <option value="visit">{t('cities.visit')}</option>
                <option value="work">{t('cities.work')}</option>
              </select>
                          </div>
                        </div>

                  <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('cities.notes')}
            </label>
            <textarea
              name="notes"
              defaultValue={editingTrajectory?.notes}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder={t('trajectoryForm.notesPlaceholder')}
            />
                      </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowTrajectoryForm(false)
                setEditingTrajectory(null)
              }}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {t('cities.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
            >
              {editingTrajectory ? t('cities.update') : t('cities.add')}
            </button>
                      </div>
        </form>
                    </div>
                  </div>
  )

  // 新增：导入模态框
  const renderImportModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('cities.importTrajectoryData')}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {t('cities.importTrajectoryDescription')}
        </p>
        
        <input
          type="file"
          accept=".json"
          onChange={handleImportTrajectories}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        
        <div className="flex items-center justify-end space-x-3 pt-4">
          <button
            onClick={() => setShowImportModal(false)}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {t('cities.cancel')}
          </button>
                    </div>
                  </div>
                </div>
  )

  // 新增：分页组件
  const renderPagination = () => {
    if (totalPages <= 1) return null

    const getPageNumbers = () => {
      const pages = []
      const maxVisiblePages = 5
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        const startPage = Math.max(1, currentPage - 2)
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
        
        if (startPage > 1) {
          pages.push(1)
          if (startPage > 2) {
            pages.push('...')
          }
        }
        
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i)
        }
        
        if (endPage < totalPages) {
          if (endPage < totalPages - 1) {
            pages.push('...')
          }
          pages.push(totalPages)
        }
      }
      
      return pages
    }

    return (
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        {/* 每页显示数量选择器 */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">每页显示:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            共 {filteredCities.length} 个城市
          </span>
        </div>

        {/* 分页导航 */}
        <div className="flex items-center space-x-2">
          {/* 上一页按钮 */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            上一页
          </button>

          {/* 页码按钮 */}
          <div className="flex items-center space-x-1">
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && handlePageChange(page)}
                disabled={page === '...'}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  page === currentPage
                    ? 'text-white bg-blue-500 border border-blue-500'
                    : page === '...'
                    ? 'text-gray-400 cursor-default'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* 下一页按钮 */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            下一页
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
              <PageLayout>
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingSpinner size="lg" text={t('common.loadingCities')} />
                        </div>
        </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout>
        <div className="card card-lg text-center py-12">
          <div className="text-gray-500">
            <h3 className="text-lg font-medium mb-2">{t('cities.failedToLoadCities')}</h3>
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchCities}
              className="btn btn-primary mt-4"
            >
              {t('cities.tryAgain')}
            </button>
                        </div>
                    </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      {/* 标签页导航 */}
      <div className="flex space-x-1 mb-6 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm">
        <button
          onClick={() => setActiveTab('cities')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'cities'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>{t('cities.cityList')}</span>
        </button>
        <button
          onClick={() => setActiveTab('trajectory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'trajectory'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>{t('cities.travelTrajectory')}</span>
        </button>
                        </div>

      {/* 标签页内容 */}
      {activeTab === 'cities' ? (
        <div className="space-y-6">
          {/* 城市匹配筛选器 */}
          <CityMatchFilter 
            cities={cities}
            onMatchResults={setMatchResults} 
            onReset={handleResetMatches} 
          />
          
          {/* 城市比较选择器 */}
          <CityComparisonSelector 
            cities={cities} 
            onCompare={(selectedCities) => {
              console.log('Comparing cities:', selectedCities)
              // 这里可以实现城市对比功能
            }}
          />
          
          {/* 增强的筛选和排序组件 */}
          <CityFiltersAndSort
            onSearch={handleSearch}
            onFilter={handleFilter}
            onSort={handleSort}
            onViewChange={handleViewChange}
            selectedView={viewMode}
            totalCities={cities.length}
            filteredCount={filteredCities.length}
          />
                    
          {/* Show Match Results or Cities Grid */}
          {showMatchResults ? (
            <CityMatchResults
              matches={matchResults}
              onClose={handleResetMatches}
            />
          ) : filteredCities.length === 0 ? (
            <div className="card card-lg text-center py-12">
              <div className="text-gray-500">
                <h3 className="text-lg font-medium mb-2">{t('cities.noResults.title')}</h3>
                <p className="text-sm">{t('cities.noResults.description')}</p>
                {user.isAuthenticated && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="btn btn-primary mt-4"
                  >
                    {t('cities.addCity')}
                  </button>
                )}
                        </div>
                      </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedCities.map((city) => {
                // 转换城市数据为增强卡片需要的格式
                const enhancedCityData = {
                  id: city.id,
                  name: city.name,
                  country: city.country,
                  countryCode: city.country_code,
                  flag: getCountryFlag(city.country_code),
                  image: '', // 可以添加城市图片
                  rating: city.avg_overall_rating || 0,
                  reviewCount: city.vote_count || 0,
                  costOfLiving: {
                    monthly: city.cost_of_living || city.cost_min_usd || 0,
                    currency: 'USD',
                    category: (city.cost_of_living || city.cost_min_usd || 0) < 1000 ? 'budget' : 
                              (city.cost_of_living || city.cost_min_usd || 0) < 2000 ? 'affordable' :
                              (city.cost_of_living || city.cost_min_usd || 0) < 3500 ? 'moderate' :
                              (city.cost_of_living || city.cost_min_usd || 0) < 5000 ? 'expensive' : 'luxury'
                  },
                  wifi: {
                    speed: city.wifi_speed_mbps || city.wifi_speed || 0,
                    reliability: 85 // 默认值
                  },
                  visa: {
                    type: city.visa_type || 'Tourist',
                    duration: city.visa_days || 0,
                    difficulty: (city.visa_days || 0) >= 365 ? 'easy' : 
                               (city.visa_days || 0) >= 90 ? 'medium' : 'hard'
                  },
                  nomads: {
                    count: (city.id.charCodeAt(0) + city.id.charCodeAt(city.id.length - 1)) % 50 + 10, // 基于城市ID的固定数量
                    active: true,
                    meetups: [t('cityCard.weeklyCoffeeMeetup'), t('cityCard.monthlyTechShare')]
                  },
                  tags: [t('cityCard.nomadFriendly'), t('cityCard.coworkingSpace'), t('cityCard.foodCulture')],
                  isPopular: (city.avg_overall_rating || 0) > 4.0,
                  isRecommended: (city.avg_overall_rating || 0) > 4.5
                }

                return (
                  <EnhancedCityCard
                    key={city.id}
                    city={enhancedCityData}
                    isSelected={selectedCities.includes(city.id)}
                    onSelect={handleCitySelect}
                    onViewDetails={() => handleViewDetails(city)}
                    onAddToFavorites={handleAddToFavorites}
                    showCompareButton={true}
                  />
                )
              })}
              </div>
              
              {/* 分页组件 */}
              {renderPagination()}
            </>
          )}
          
          {/* 城市对比工具栏 */}
          <CityComparisonToolbar
            selectedCities={selectedCities.map(id => {
              const city = cities.find(c => c.id === id)
              return {
                id: city?.id || '',
                name: city?.name || '',
                country: city?.country || '',
                flag: city ? getCountryFlag(city.country_code) : ''
              }
            })}
            onRemoveCity={handleCityRemove}
            onClearAll={handleClearAllCities}
            onCompare={handleCompareCities}
            maxCities={6}
          />

          {/* Universal Recommendation Form */}
          <UniversalRecommendationForm
            type="city"
            isOpen={showAddForm}
            onClose={() => setShowAddForm(false)}
            onSubmit={handleAddCity}
          />
        </div>
      ) : user.isAuthenticated ? (
        renderTrajectoryTab()
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center py-12">
          <div className="text-gray-500">
            <h3 className="text-lg font-medium mb-2">{t('cities.loginRequired')}</h3>
            <p className="text-sm mb-4">{t('cities.loginRequiredDescription')}</p>
              <button
                onClick={() => window.location.href = '/auth/login'}
                className="btn btn-primary"
              >
                {t('cities.goToLogin')}
              </button>
            </div>
          </div>
        )}

      {/* 轨迹表单 */}
      {showTrajectoryForm && renderTrajectoryForm()}
      
      {/* 导入模态框 */}
      {showImportModal && renderImportModal()}
    </PageLayout>
  )
}

export default function CitiesPage() {
  return (
          <Suspense fallback={
        <PageLayout>
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingSpinner size="lg" text="Loading cities..." />
            </div>
        </PageLayout>
      }>
      <CitiesPageContent />
    </Suspense>
  )
} 