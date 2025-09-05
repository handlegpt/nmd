'use client'

import { useState } from 'react'
import { XIcon, MapPinIcon, GlobeIcon, CalendarIcon, DollarSignIcon, WifiIcon } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useUser } from '@/contexts/GlobalStateContext'
import LoginRequired from './LoginRequired'

interface AddCityFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (cityData: any) => void
}

export default function AddCityForm({ isOpen, onClose, onSubmit }: AddCityFormProps) {
  const { t } = useTranslation()
  const { user } = useUser()
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    country_code: '',
    timezone: '',
    latitude: '',
    longitude: '',
    visa_days: 90,
    visa_type: 'Tourist Visa',
    cost_of_living: 1500,
    wifi_speed: 50,
    description: '',
    highlights: [] as string[],
    tags: [] as string[]
  })
  const [newHighlight, setNewHighlight] = useState('')
  const [newTag, setNewTag] = useState('')

  const visaTypes = [
    'Tourist Visa',
    'Digital Nomad Visa',
    'Visa Free',
    'Visa on Arrival',
    'Business Visa',
    'Student Visa',
    'Work Visa'
  ]

  const timezones = [
    'UTC',
    'UTC+1', 'UTC+2', 'UTC+3', 'UTC+4', 'UTC+5', 'UTC+6', 'UTC+7', 'UTC+8', 'UTC+9', 'UTC+10', 'UTC+11', 'UTC+12',
    'UTC-1', 'UTC-2', 'UTC-3', 'UTC-4', 'UTC-5', 'UTC-6', 'UTC-7', 'UTC-8', 'UTC-9', 'UTC-10', 'UTC-11', 'UTC-12'
  ]

  const suggestedHighlights = [
    t('recommendationForm.city.suggestedHighlights.nomadFriendly'),
    t('recommendationForm.city.suggestedHighlights.fastWifi'),
    t('recommendationForm.city.suggestedHighlights.lowCost'),
    t('recommendationForm.city.suggestedHighlights.visaConvenient'),
    t('recommendationForm.city.suggestedHighlights.goodClimate'),
    t('recommendationForm.city.suggestedHighlights.foodRich'),
    t('recommendationForm.city.suggestedHighlights.culturalDiverse'),
    t('recommendationForm.city.suggestedHighlights.convenientTransport'),
    t('recommendationForm.city.suggestedHighlights.safeLiving'),
    t('recommendationForm.city.suggestedHighlights.englishFriendly'),
    t('recommendationForm.city.suggestedHighlights.activeCommunity'),
    t('recommendationForm.city.suggestedHighlights.workspaces'),
    t('recommendationForm.city.suggestedHighlights.coffeeCulture'),
    t('recommendationForm.city.suggestedHighlights.outdoorActivities'),
    t('recommendationForm.city.suggestedHighlights.nightlife')
  ]

  const suggestedTags = [
    t('recommendationForm.city.suggestedTags.budgetFriendly'),
    t('recommendationForm.city.suggestedTags.fastWifi'),
    t('recommendationForm.city.suggestedTags.easyVisa'),
    t('recommendationForm.city.suggestedTags.goodClimate'),
    t('recommendationForm.city.suggestedTags.goodFood'),
    t('recommendationForm.city.suggestedTags.culturalRich'),
    t('recommendationForm.city.suggestedTags.convenientTransport'),
    t('recommendationForm.city.suggestedTags.safe'),
    t('recommendationForm.city.suggestedTags.englishFriendly'),
    t('recommendationForm.city.suggestedTags.goodCommunity'),
    t('recommendationForm.city.suggestedTags.workspaces'),
    t('recommendationForm.city.suggestedTags.coffeeCulture'),
    t('recommendationForm.city.suggestedTags.outdoor'),
    t('recommendationForm.city.suggestedTags.nightlife'),
    t('recommendationForm.city.suggestedTags.shopping')
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addHighlight = (highlight: string) => {
    if (highlight && !formData.highlights.includes(highlight)) {
      setFormData(prev => ({
        ...prev,
        highlights: [...prev.highlights, highlight]
      }))
      setNewHighlight('')
    }
  }

  const removeHighlight = (highlightToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter(highlight => highlight !== highlightToRemove)
    }))
  }

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user.isAuthenticated) {
      return
    }
    
    onSubmit({
      ...formData,
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      submitted_by: user.profile?.id || ''
    })
    
    // 重置表单
    setFormData({
      name: '',
      country: '',
      country_code: '',
      timezone: '',
      latitude: '',
      longitude: '',
      visa_days: 90,
      visa_type: 'Tourist Visa',
      cost_of_living: 1500,
      wifi_speed: 50,
      description: '',
      highlights: [],
      tags: []
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">{t('recommendationForm.city.title')}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Login Required Check */}
          {!user.isAuthenticated && (
            <LoginRequired 
              message={t('loginRequired.recommendMessage')}
              className="mb-6"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('recommendationForm.city.fields.name')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!user.isAuthenticated}
                  required
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !user.isAuthenticated ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                  placeholder={t('recommendationForm.city.fields.namePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('recommendationForm.city.fields.country')} *
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  disabled={!user.isAuthenticated}
                  required
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !user.isAuthenticated ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                  placeholder={t('recommendationForm.city.fields.countryPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('recommendationForm.city.fields.countryCode')} *
                </label>
                <input
                  type="text"
                  value={formData.country_code}
                  onChange={(e) => handleInputChange('country_code', e.target.value.toUpperCase())}
                  disabled={!user.isAuthenticated}
                  required
                  maxLength={2}
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !user.isAuthenticated ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                  placeholder={t('recommendationForm.city.fields.countryCodePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('recommendationForm.city.fields.timezone')} *
                </label>
                <select
                  value={formData.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                  disabled={!user.isAuthenticated}
                  required
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !user.isAuthenticated ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  <option value="">{t('recommendationForm.city.fields.selectTimezone')}</option>
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('recommendationForm.city.fields.latitude')}
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange('latitude', e.target.value)}
                  disabled={!user.isAuthenticated}
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !user.isAuthenticated ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                  placeholder={t('recommendationForm.city.fields.latitudePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('recommendationForm.city.fields.longitude')}
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange('longitude', e.target.value)}
                  disabled={!user.isAuthenticated}
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !user.isAuthenticated ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                  placeholder={t('recommendationForm.city.fields.longitudePlaceholder')}
                />
              </div>
            </div>

            {/* Visa Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('recommendationForm.city.fields.visaType')} *
                </label>
                <select
                  value={formData.visa_type}
                  onChange={(e) => handleInputChange('visa_type', e.target.value)}
                  disabled={!user.isAuthenticated}
                  required
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !user.isAuthenticated ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  {visaTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('recommendationForm.city.fields.visaDays')} *
                </label>
                <input
                  type="number"
                  value={formData.visa_days}
                  onChange={(e) => handleInputChange('visa_days', parseInt(e.target.value))}
                  disabled={!user.isAuthenticated}
                  required
                  min="1"
                  max="365"
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !user.isAuthenticated ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                />
              </div>
            </div>

            {/* Cost and WiFi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('recommendationForm.city.fields.costOfLiving')} *
                </label>
                <input
                  type="number"
                  value={formData.cost_of_living}
                  onChange={(e) => handleInputChange('cost_of_living', parseInt(e.target.value))}
                  disabled={!user.isAuthenticated}
                  required
                  min="100"
                  max="10000"
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !user.isAuthenticated ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                  placeholder={t('recommendationForm.city.fields.costOfLivingPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('recommendationForm.city.fields.wifiSpeed')} *
                </label>
                <input
                  type="number"
                  value={formData.wifi_speed}
                  onChange={(e) => handleInputChange('wifi_speed', parseInt(e.target.value))}
                  disabled={!user.isAuthenticated}
                  required
                  min="1"
                  max="1000"
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !user.isAuthenticated ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                  placeholder={t('recommendationForm.city.fields.wifiSpeedPlaceholder')}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('recommendationForm.city.fields.description')} *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={!user.isAuthenticated}
                required
                rows={4}
                className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  !user.isAuthenticated ? 'cursor-not-allowed opacity-50' : ''
                }`}
                placeholder={t('recommendationForm.city.fields.descriptionPlaceholder')}
              />
            </div>

            {/* Highlights */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('recommendationForm.city.fields.highlights')}
              </label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {formData.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                    >
                      {highlight}
                      <button
                        type="button"
                        disabled={!user.isAuthenticated}
                        onClick={() => removeHighlight(highlight)}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newHighlight}
                    onChange={(e) => setNewHighlight(e.target.value)}
                    disabled={!user.isAuthenticated}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight(newHighlight))}
                    className={`flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      !user.isAuthenticated ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                    placeholder={t('recommendationForm.city.fields.addHighlight')}
                  />
                  <button
                    type="button"
                    disabled={!user.isAuthenticated}
                    onClick={() => addHighlight(newHighlight)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {t('common.add')}
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  {t('recommendationForm.city.fields.suggestedHighlights')}：
                  <div className="flex flex-wrap gap-1 mt-1">
                    {suggestedHighlights.map((highlight) => (
                      <button
                        key={highlight}
                        type="button"
                        disabled={!user.isAuthenticated}
                        onClick={() => addHighlight(highlight)}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        {highlight}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('recommendationForm.city.fields.tags')}
              </label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        disabled={!user.isAuthenticated}
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    disabled={!user.isAuthenticated}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(newTag))}
                    className={`flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      !user.isAuthenticated ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                    placeholder={t('recommendationForm.city.fields.addTag')}
                  />
                  <button
                    type="button"
                    disabled={!user.isAuthenticated}
                    onClick={() => addTag(newTag)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {t('common.add')}
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  {t('recommendationForm.city.fields.suggestedTags')}：
                  <div className="flex flex-wrap gap-1 mt-1">
                    {suggestedTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        disabled={!user.isAuthenticated}
                        onClick={() => addTag(tag)}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={!user.isAuthenticated}
                className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                  !user.isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {t('recommendationForm.city.submitButton')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
