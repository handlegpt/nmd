import React, { useState } from 'react'
import { Filter, ChevronDown, ChevronUp } from 'lucide-react'
import { useMobile } from '@/hooks/useResponsive'
import { CityCategory } from '@/types/city'

interface CityFilterProps {
  onFilterChange: (filters: CityFilterState) => void
  className?: string
}

interface CityFilterState {
  categories: CityCategory[]
  costRange: [number, number]
  wifiSpeedMin: number
  climateType?: string
}

export default function CityFilter({ onFilterChange, className = '' }: CityFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<CityFilterState>({
    categories: [],
    costRange: [0, 5000],
    wifiSpeedMin: 0,
    climateType: undefined
  })
  
  const { isMobile } = useMobile()

  const handleFilterChange = (newFilters: Partial<CityFilterState>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  const toggleFilter = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className={`${className}`}>
      <button
        onClick={toggleFilter}
        className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        <Filter className="h-4 w-4" />
        <span>筛选</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isOpen && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
          {/* 城市分类筛选 */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">城市分类</h4>
            <div className="grid grid-cols-2 gap-2">
              {['beach', 'mountain', 'urban', 'cultural', 'tech_hub'].map((category) => (
                <label key={category} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category as CityCategory)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleFilterChange({
                          categories: [...filters.categories, category as CityCategory]
                        })
                      } else {
                        handleFilterChange({
                          categories: filters.categories.filter(c => c !== category)
                        })
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {category === 'beach' ? '海滩' :
                     category === 'mountain' ? '山地' :
                     category === 'urban' ? '都市' :
                     category === 'cultural' ? '文化' :
                     category === 'tech_hub' ? '科技中心' : category}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 成本范围筛选 */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">月成本范围 (USD)</h4>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={filters.costRange[0]}
                onChange={(e) => handleFilterChange({
                  costRange: [parseInt(e.target.value) || 0, filters.costRange[1]]
                })}
                placeholder="最小值"
                className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                value={filters.costRange[1]}
                onChange={(e) => handleFilterChange({
                  costRange: [filters.costRange[0], parseInt(e.target.value) || 5000]
                })}
                placeholder="最大值"
                className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded"
              />
            </div>
          </div>

          {/* WiFi速度筛选 */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">最低WiFi速度 (Mbps)</h4>
            <input
              type="number"
              value={filters.wifiSpeedMin}
              onChange={(e) => handleFilterChange({
                wifiSpeedMin: parseInt(e.target.value) || 0
              })}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded"
            />
          </div>
        </div>
      )}
    </div>
  )
}
