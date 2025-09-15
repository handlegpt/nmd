'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { 
  DollarSign, 
  Home, 
  Utensils, 
  Car, 
  Briefcase,
  Send,
  CheckCircle,
  AlertCircle,
  Info,
  Star
} from 'lucide-react'

interface CostDataSubmitterProps {
  city: string
  country: string
  onDataSubmitted?: () => void
  className?: string
}

export default function CostDataSubmitter({ 
  city, 
  country, 
  onDataSubmitted,
  className = '' 
}: CostDataSubmitterProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    accommodation: '',
    food: '',
    transport: '',
    coworking: '',
    currency: 'USD',
    stayDuration: '',
    accommodationType: 'apartment',
    lifestyleLevel: 'medium',
    notes: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/cost-data/crowdsourced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city,
          country,
          accommodation: parseFloat(formData.accommodation),
          food: parseFloat(formData.food),
          transport: parseFloat(formData.transport),
          coworking: parseFloat(formData.coworking),
          currency: formData.currency,
          stay_duration: formData.stayDuration,
          accommodation_type: formData.accommodationType,
          lifestyle_level: formData.lifestyleLevel,
          notes: formData.notes
        })
      })

      const result = await response.json()

      if (result.success) {
        setIsSubmitted(true)
        onDataSubmitted?.()
      } else {
        setError(result.error || 'Failed to submit cost data')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateTotal = () => {
    const accommodation = parseFloat(formData.accommodation) || 0
    const food = parseFloat(formData.food) || 0
    const transport = parseFloat(formData.transport) || 0
    const coworking = parseFloat(formData.coworking) || 0
    return accommodation + food + transport + coworking
  }

  if (isSubmitted) {
    return (
      <div className={`bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 ${className}`}>
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          <div>
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
              Thank you for your contribution!
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Your cost data has been submitted and will be reviewed before being made public.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
          <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Share Your Cost Data
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Help other nomads by sharing your real expenses in {city}, {country}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 成本输入字段 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Home className="h-4 w-4 inline mr-1" />
              Accommodation (USD/month)
            </label>
            <input
              type="number"
              value={formData.accommodation}
              onChange={(e) => handleInputChange('accommodation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Utensils className="h-4 w-4 inline mr-1" />
              Food & Dining (USD/month)
            </label>
            <input
              type="number"
              value={formData.food}
              onChange={(e) => handleInputChange('food', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Car className="h-4 w-4 inline mr-1" />
              Transportation (USD/month)
            </label>
            <input
              type="number"
              value={formData.transport}
              onChange={(e) => handleInputChange('transport', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Briefcase className="h-4 w-4 inline mr-1" />
              Coworking (USD/month)
            </label>
            <input
              type="number"
              value={formData.coworking}
              onChange={(e) => handleInputChange('coworking', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 200"
              required
            />
          </div>
        </div>

        {/* 总成本显示 */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Monthly Cost:
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              ${calculateTotal().toLocaleString()}
            </span>
          </div>
        </div>

        {/* 额外信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stay Duration
            </label>
            <select
              value={formData.stayDuration}
              onChange={(e) => handleInputChange('stayDuration', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select duration</option>
              <option value="1-2 weeks">1-2 weeks</option>
              <option value="1 month">1 month</option>
              <option value="2-3 months">2-3 months</option>
              <option value="6+ months">6+ months</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Accommodation Type
            </label>
            <select
              value={formData.accommodationType}
              onChange={(e) => handleInputChange('accommodationType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="apartment">Apartment</option>
              <option value="hostel">Hostel</option>
              <option value="hotel">Hotel</option>
              <option value="coliving">Coliving</option>
              <option value="airbnb">Airbnb</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Lifestyle Level
          </label>
          <div className="flex space-x-4">
            {['budget', 'medium', 'luxury'].map((level) => (
              <label key={level} className="flex items-center">
                <input
                  type="radio"
                  name="lifestyleLevel"
                  value={level}
                  checked={formData.lifestyleLevel === level}
                  onChange={(e) => handleInputChange('lifestyleLevel', e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                  {level}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any additional information about your expenses..."
          />
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
            </div>
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">Your data helps the community!</p>
              <p>All submissions are reviewed before being made public. Your personal information is never shared.</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Submit Cost Data</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
