'use client'

import { useState } from 'react'
import { Shield, FileText, Monitor, Home, CreditCard, ExternalLink } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useNotifications } from '@/contexts/GlobalStateContext'
import { logInfo } from '@/lib/logger'

interface AffiliateService {
  id: string
  name: string
  description: string
  icon: any
  category: 'insurance' | 'visa' | 'coworking' | 'accommodation' | 'banking'
  price: string
  commission: string
  link: string
  rating: number
  features: string[]
}

export default function CityAffiliateRecommendations({ cityName }: { cityName: string }) {
  const { t } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const affiliateServices: AffiliateService[] = [
    {
      id: '1',
      name: 'SafetyWing',
      description: 'Digital nomad insurance with global coverage',
      icon: Shield,
      category: 'insurance',
      price: '$42/month',
      commission: '10%',
      link: 'https://safetywing.com',
      rating: 4.8,
      features: ['Global coverage', 'COVID-19 included', 'No home country requirement']
    },
    {
      id: '2',
      name: 'iVisa',
      description: 'Professional visa application service',
      icon: FileText,
      category: 'visa',
      price: 'From $25',
      commission: '15%',
      link: 'https://ivisa.com',
      rating: 4.6,
      features: ['Fast processing', 'Expert support', 'Document preparation']
    },
    {
      id: '3',
      name: 'WeWork',
      description: 'Global coworking space network',
      icon: Monitor,
      category: 'coworking',
      price: '$200/month',
      commission: '8%',
      link: 'https://wework.com',
      rating: 4.4,
      features: ['Global access', 'Meeting rooms', 'Events & networking']
    },
    {
      id: '4',
      name: 'Airbnb',
      description: 'Short-term accommodation worldwide',
      icon: Home,
      category: 'accommodation',
      price: 'Varies',
      commission: '3%',
      link: 'https://airbnb.com',
      rating: 4.7,
      features: ['Verified hosts', 'Flexible booking', 'Local experience']
    },
    {
      id: '5',
      name: 'Wise',
      description: 'Multi-currency digital banking',
      icon: CreditCard,
      category: 'banking',
      price: 'Free',
      commission: '5%',
      link: 'https://wise.com',
      rating: 4.9,
      features: ['Low fees', 'Real exchange rates', 'Global transfers']
    }
  ]

  const categories = [
    { id: 'all', name: 'All Services', icon: null },
    { id: 'insurance', name: 'Insurance', icon: Shield },
    { id: 'visa', name: 'Visa Services', icon: FileText },
    { id: 'coworking', name: 'Co-working', icon: Monitor },
    { id: 'accommodation', name: 'Accommodation', icon: Home },
    { id: 'banking', name: 'Banking', icon: CreditCard }
  ]

  const filteredServices = selectedCategory === 'all' 
    ? affiliateServices 
    : affiliateServices.filter(service => service.category === selectedCategory)

  const handleAffiliateClick = (service: any) => {
    logInfo('Affiliate click', { service: service.name }, 'CityAffiliateRecommendations')
    
    // 这里可以添加affiliate tracking
    window.open(service.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Recommended Services for {cityName}</h3>
          <p className="text-sm text-gray-600">Curated services to help you settle in</p>
        </div>
        <div className="text-xs text-gray-500">
          * We may earn commission from these links
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span className="text-sm">{category.name}</span>
            </button>
          )
        })}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredServices.map((service) => {
          const Icon = service.icon
          return (
            <div
              key={service.id}
              onClick={() => handleAffiliateClick(service)}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{service.name}</h4>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-1">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm font-medium">{service.rating}</span>
                  </div>
                  <p className="text-sm font-medium text-green-600">{service.price}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {service.features.slice(0, 2).map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    Commission: {service.commission}
                  </span>
                  <div className="flex items-center space-x-1 text-blue-600 text-sm">
                    <span>Visit</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
          <p className="text-gray-600">Try selecting a different category</p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          These are affiliate links. We may earn a commission when you use our links to make a purchase. 
          This helps us keep the site free and provide quality content.
        </p>
      </div>
    </div>
  )
}
