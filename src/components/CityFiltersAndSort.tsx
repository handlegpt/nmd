'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { 
  Search, 
  Filter, 
  Grid3X3, 
  Map, 
  SortAsc, 
  SortDesc,
  Globe,
  DollarSign,
  Wifi,
  MapPin,
  Users,
  Coffee,
  Star
} from 'lucide-react'

interface FilterOptions {
  region: string
  budget: string
  visaDuration: string
  wifiSpeed: string
  language: string
}

interface SortOptions {
  field: 'cost' | 'wifi' | 'visa' | 'rating' | 'nomads'
  direction: 'asc' | 'desc'
}

interface CityFiltersAndSortProps {
  onSearch: (query: string) => void
  onFilter: (filters: FilterOptions) => void
  onSort: (sort: SortOptions) => void
  onViewChange: (view: 'grid' | 'map') => void
  selectedView: 'grid' | 'map'
  totalCities: number
  filteredCount: number
}

export default function CityFiltersAndSort({
  onSearch,
  onFilter,
  onSort,
  onViewChange,
  selectedView,
  totalCities,
  filteredCount
}: CityFiltersAndSortProps) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({
    region: '',
    budget: '',
    visaDuration: '',
    wifiSpeed: '',
    language: ''
  })
  const [sortBy, setSortBy] = useState<SortOptions>({
    field: 'rating',
    direction: 'desc'
  })
  const [showFilters, setShowFilters] = useState(false)

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch(query)
  }

  // Handle filter change
  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilter(newFilters)
  }

  // Handle sort change
  const handleSortChange = (field: SortOptions['field']) => {
    const newSort: SortOptions = {
      field,
      direction: sortBy.field === field && sortBy.direction === 'desc' ? 'asc' : 'desc'
    }
    setSortBy(newSort)
    onSort(newSort)
  }

  // Get sort icon
  const getSortIcon = (field: string) => {
    if (sortBy.field !== field) return <SortAsc className="w-4 h-4" />
    return sortBy.direction === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
  }

  // Get sort label
  const getSortLabel = (field: string) => {
    const labels = {
      cost: t('cities.sortByCost'),
      wifi: t('cities.sortByWifi'),
      visa: t('cities.sortByVisa'),
      rating: t('cities.sortByRating'),
      nomads: t('cities.sortByNomads')
    }
    return labels[field as keyof typeof labels] || field
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            🌍 {t('cityFilters.nomadCities')}
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('cityFilters.showingCities', { filtered: filteredCount.toString(), total: totalCities.toString() })}
          </div>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => onViewChange('grid')}
            className={`p-2 rounded-md transition-colors ${
              selectedView === 'grid'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            title={t('cityFilters.gridView')}
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => onViewChange('map')}
            className={`p-2 rounded-md transition-colors ${
              selectedView === 'map'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            title={t('cityFilters.mapView')}
          >
            <Map className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={t('cityFilters.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Sort and Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Sort Options */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('cityFilters.sortBy')}</span>
          {[
            { field: 'rating', icon: <Star className="w-4 h-4" /> },
            { field: 'cost', icon: <DollarSign className="w-4 h-4" /> },
            { field: 'wifi', icon: <Wifi className="w-4 h-4" /> },
            { field: 'visa', icon: <MapPin className="w-4 h-4" /> },
            { field: 'nomads', icon: <Users className="w-4 h-4" /> }
          ].map(({ field, icon }) => (
            <button
              key={field}
              onClick={() => handleSortChange(field as SortOptions['field'])}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy.field === field
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {icon}
              <span>{getSortLabel(field)}</span>
              {getSortIcon(field)}
            </button>
          ))}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showFilters
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>{t('cityFilters.filter')}</span>
          {Object.values(filters).some(v => v) && (
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Region Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Globe className="w-4 h-4 inline mr-1" />
                {t('cityFilters.region')}
              </label>
              <select
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              >
                <option value="">{t('cityFilters.allRegions')}</option>
                <option value="asia">{t('cityFilters.asia')}</option>
                <option value="europe">{t('cityFilters.europe')}</option>
                <option value="americas">{t('cityFilters.americas')}</option>
                <option value="africa">{t('cityFilters.africa')}</option>
                <option value="oceania">{t('cityFilters.oceania')}</option>
              </select>
            </div>

            {/* Budget Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                {t('cityFilters.budget')}
              </label>
              <select
                value={filters.budget}
                onChange={(e) => handleFilterChange('budget', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              >
                <option value="">{t('cityFilters.allBudgets')}</option>
                <option value="budget">{t('cityFilters.budgetUnder1000')}</option>
                <option value="affordable">{t('cityFilters.affordable1000to2000')}</option>
                <option value="moderate">{t('cityFilters.moderate2000to3500')}</option>
                <option value="expensive">{t('cityFilters.expensive3500to5000')}</option>
                <option value="luxury">{t('cityFilters.luxuryOver5000')}</option>
              </select>
            </div>

            {/* Visa Duration Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                {t('cityFilters.visaDuration')}
              </label>
              <select
                value={filters.visaDuration}
                onChange={(e) => handleFilterChange('visaDuration', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              >
                <option value="">{t('cityFilters.allDurations')}</option>
                <option value="30">{t('cityFilters.within30Days')}</option>
                <option value="60">{t('cityFilters.within60Days')}</option>
                <option value="90">{t('cityFilters.within90Days')}</option>
                <option value="180">{t('cityFilters.within180Days')}</option>
                <option value="365">{t('cityFilters.over1Year')}</option>
              </select>
            </div>

            {/* WiFi Speed Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Wifi className="w-4 h-4 inline mr-1" />
                {t('cityFilters.wifiSpeed')}
              </label>
              <select
                value={filters.wifiSpeed}
                onChange={(e) => handleFilterChange('wifiSpeed', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              >
                <option value="">{t('cityFilters.allSpeeds')}</option>
                <option value="25">{t('cityFilters.over25Mbps')}</option>
                <option value="50">{t('cityFilters.over50Mbps')}</option>
                <option value="100">{t('cityFilters.over100Mbps')}</option>
                <option value="200">{t('cityFilters.over200Mbps')}</option>
              </select>
            </div>

            {/* Language Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                {t('cityFilters.language')}
              </label>
              <select
                value={filters.language}
                onChange={(e) => handleFilterChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              >
                <option value="">{t('cityFilters.allLanguages')}</option>
                <option value="english">{t('cityFilters.english')}</option>
                <option value="spanish">{t('cityFilters.spanish')}</option>
                <option value="french">{t('cityFilters.french')}</option>
                <option value="german">{t('cityFilters.german')}</option>
                <option value="chinese">{t('cityFilters.chinese')}</option>
                <option value="japanese">{t('cityFilters.japanese')}</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                const emptyFilters = {
                  region: '',
                  budget: '',
                  visaDuration: '',
                  wifiSpeed: '',
                  language: ''
                }
                setFilters(emptyFilters)
                onFilter(emptyFilters)
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              {t('cityFilters.clearAllFilters')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
