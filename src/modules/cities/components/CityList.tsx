import React from 'react'
import { City } from '@/types/city'
import CityCard from './CityCard'

interface CityListProps {
  cities: City[]
  onCityClick?: (city: City) => void
  showDetails?: boolean
  className?: string
}

export default function CityList({ 
  cities, 
  onCityClick, 
  showDetails = false,
  className = '' 
}: CityListProps) {
  const handleCityClick = (city: City) => {
    onCityClick?.(city)
  }

  if (cities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        暂无城市数据
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {cities.map((city) => (
        <CityCard
          key={city.id}
          city={city}
          onClick={() => handleCityClick(city)}
          showDetails={showDetails}
        />
      ))}
    </div>
  )
}
