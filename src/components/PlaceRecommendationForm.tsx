'use client'

import { useState, useEffect } from 'react'
import { 
  XIcon, 
  MapPinIcon, 
  CameraIcon, 
  WifiIcon, 
  DollarSignIcon,
  VolumeXIcon,
  VolumeIcon,
  Volume2Icon,
  ZapIcon,
  ClockIcon,
  UsersIcon,
  UploadIcon,
  CheckIcon
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useUser } from '@/contexts/GlobalStateContext'
import { useNotifications } from '@/contexts/GlobalStateContext'
import { PLACE_CATEGORIES } from '@/lib/placeCategories'
import { logInfo, logError } from '@/lib/logger'

interface PlaceRecommendationFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (placeData: any) => void
}

interface FormData {
  name: string
  category: string
  address: string
  city: string
  description: string
  wifi_speed: number
  price_level: number
  noise_level: string
  social_atmosphere: string
  outlets: boolean
  long_stay_ok: boolean
  tags: string[]
  images: File[]
  recommendation_reason: string
}

export default function PlaceRecommendationForm({ 
  isOpen, 
  onClose, 
  onSubmit 
}: PlaceRecommendationFormProps) {
  const { t } = useTranslation()
  const { user } = useUser()
  const { addNotification } = useNotifications()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: '',
    address: '',
    city: '',
    description: '',
    wifi_speed: 0,
    price_level: 3,
    noise_level: 'moderate',
    social_atmosphere: 'medium',
    outlets: false,
    long_stay_ok: false,
    tags: [],
    images: [],
    recommendation_reason: ''
  })

  const [duplicateCheck, setDuplicateCheck] = useState<{
    checking: boolean
    found: boolean
    similarPlaces: any[]
  }>({
    checking: false,
    found: false,
    similarPlaces: []
  })

  const steps = [
    { id: 1, title: t('places.form.step1'), description: t('places.form.step1Desc') },
    { id: 2, title: t('places.form.step2'), description: t('places.form.step2Desc') },
    { id: 3, title: t('places.form.step3'), description: t('places.form.step3Desc') },
    { id: 4, title: t('places.form.step4'), description: t('places.form.step4Desc') },
    { id: 5, title: t('places.form.step5'), description: t('places.form.step5Desc') }
  ]

  const suggestedTags = [
    'quiet', 'wifi', 'coffee', 'work', 'friendly', 'cheap', 'expensive',
    'outlets', 'food', 'drinks', 'atmosphere', 'service', 'location'
  ]

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      // 压缩图片
      const compressedFiles = files.map(file => {
        return new Promise<File>((resolve) => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          const img = new Image()
          
          img.onload = () => {
            // 设置最大尺寸
            const maxWidth = 800
            const maxHeight = 600
            let { width, height } = img
            
            if (width > height) {
              if (width > maxWidth) {
                height = (height * maxWidth) / width
                width = maxWidth
              }
            } else {
              if (height > maxHeight) {
                width = (width * maxHeight) / height
                height = maxHeight
              }
            }
            
            canvas.width = width
            canvas.height = height
            
            ctx?.drawImage(img, 0, 0, width, height)
            
            canvas.toBlob((blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                })
                resolve(compressedFile)
              } else {
                resolve(file)
              }
            }, 'image/jpeg', 0.8)
          }
          
          img.src = URL.createObjectURL(file)
        })
      })
      
      Promise.all(compressedFiles).then(compressed => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...compressed].slice(0, 3) // 最多3张图片
        }))
      })
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const checkForDuplicates = async () => {
    if (!formData.name || !formData.address) return
    
    setDuplicateCheck(prev => ({ ...prev, checking: true }))
    
    try {
      // 模拟重复检查API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 这里应该调用实际的API来检查重复
      const mockSimilarPlaces = [
        { name: 'Similar Place 1', address: '123 Main St', similarity: 85 },
        { name: 'Similar Place 2', address: '456 Oak Ave', similarity: 72 }
      ]
      
      setDuplicateCheck({
        checking: false,
        found: mockSimilarPlaces.length > 0,
        similarPlaces: mockSimilarPlaces
      })
    } catch (error) {
      logError('Error checking duplicates', error, 'PlaceRecommendationForm')
      setDuplicateCheck(prev => ({ ...prev, checking: false }))
    }
  }

  const handleSubmit = async () => {
    if (!user.isAuthenticated) {
      addNotification({
        type: 'error',
        message: t('places.form.loginRequired')
      })
      return
    }

    setLoading(true)
    
    try {
      // 准备提交数据
      const submitData = {
        ...formData,
        submitted_by: user.profile?.id || 'anonymous',
        latitude: 0, // 这里应该通过地址获取坐标
        longitude: 0,
        city_id: formData.city
      }
      
      logInfo('Submitting place recommendation', submitData, 'PlaceRecommendationForm')
      
      // 调用父组件的提交函数
      await onSubmit(submitData)
      
      // 重置表单
      setFormData({
        name: '',
        category: '',
        address: '',
        city: '',
        description: '',
        wifi_speed: 0,
        price_level: 3,
        noise_level: 'medium',
        social_atmosphere: 'medium',
        outlets: false,
        long_stay_ok: false,
        tags: [],
        images: [],
        recommendation_reason: ''
      })
      setCurrentStep(1)
      setDuplicateCheck({ checking: false, found: false, similarPlaces: [] })
      
    } catch (error) {
      logError('Error submitting place recommendation', error, 'PlaceRecommendationForm')
      addNotification({
        type: 'error',
        message: t('places.form.submitError')
      })
    } finally {
      setLoading(false)
    }
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.category && formData.address && formData.city
      case 2:
        return formData.wifi_speed > 0 && formData.price_level > 0
      case 3:
        return formData.noise_level && formData.social_atmosphere
      case 4:
        return formData.description && formData.recommendation_reason
      case 5:
        return true
      default:
        return false
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {t('places.form.title')}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {t('places.form.subtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep >= step.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step.id ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t('places.form.basicInfo')}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('places.form.placeName')} *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('places.form.placeNamePlaceholder')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('places.form.category')} *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">{t('places.form.selectCategory')}</option>
                      {PLACE_CATEGORIES.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {t(category.translationKey)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('places.form.address')} *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('places.form.addressPlaceholder')}
                  />
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('places.form.city')} *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('places.form.cityPlaceholder')}
                  />
                </div>
                
                {/* Duplicate Check */}
                {formData.name && formData.address && (
                  <div className="mt-4">
                    <button
                      onClick={checkForDuplicates}
                      disabled={duplicateCheck.checking}
                      className="btn btn-outline btn-sm"
                    >
                      {duplicateCheck.checking ? t('places.form.checking') : t('places.form.checkDuplicates')}
                    </button>
                    
                    {duplicateCheck.found && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800 mb-2">
                          {t('places.form.similarPlacesFound')}
                        </p>
                        {duplicateCheck.similarPlaces.map((place, index) => (
                          <div key={index} className="text-sm text-yellow-700">
                            • {place.name} - {place.address} ({place.similarity}% {t('places.form.similarity')})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: WiFi and Price */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t('places.form.wifiAndPrice')}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <WifiIcon className="h-4 w-4 inline mr-1" />
                      {t('places.form.wifiSpeed')} *
                    </label>
                    <input
                      type="number"
                      value={formData.wifi_speed}
                      onChange={(e) => handleInputChange('wifi_speed', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="50"
                      min="0"
                      max="1000"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t('places.form.wifiSpeedHelp')}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSignIcon className="h-4 w-4 inline mr-1" />
                      {t('places.form.priceLevel')} *
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(level => (
                        <button
                          key={level}
                          onClick={() => handleInputChange('price_level', level)}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            formData.price_level === level
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {'$'.repeat(level)}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('places.form.priceLevelHelp')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Environment */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t('places.form.environment')}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {t('places.form.noiseLevel')}
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'quiet', label: t('places.quiet'), icon: <VolumeXIcon className="h-4 w-4" /> },
                        { value: 'moderate', label: t('places.medium'), icon: <VolumeIcon className="h-4 w-4" /> },
                        { value: 'loud', label: t('places.loud'), icon: <Volume2Icon className="h-4 w-4" /> }
                      ].map(noise => (
                        <label key={noise.value} className="flex items-center">
                          <input
                            type="radio"
                            name="noise_level"
                            value={noise.value}
                            checked={formData.noise_level === noise.value}
                            onChange={(e) => handleInputChange('noise_level', e.target.value)}
                            className="mr-3 border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex items-center gap-2">
                            {noise.icon}
                            <span className="text-sm text-gray-700">{noise.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {t('places.form.socialAtmosphere')}
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'low', label: t('places.lowSocial') },
                        { value: 'medium', label: t('places.mediumSocial') },
                        { value: 'high', label: t('places.highSocial') }
                      ].map(social => (
                        <label key={social.value} className="flex items-center">
                          <input
                            type="radio"
                            name="social_atmosphere"
                            value={social.value}
                            checked={formData.social_atmosphere === social.value}
                            onChange={(e) => handleInputChange('social_atmosphere', e.target.value)}
                            className="mr-3 border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <UsersIcon className="h-4 w-4 mr-2 text-gray-600" />
                          <span className="text-sm text-gray-700">{social.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="outlets"
                      checked={formData.outlets}
                      onChange={(e) => handleInputChange('outlets', e.target.checked)}
                      className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="outlets" className="flex items-center text-sm text-gray-700">
                      <ZapIcon className="h-4 w-4 mr-2 text-green-600" />
                      {t('places.form.hasOutlets')}
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="long_stay_ok"
                      checked={formData.long_stay_ok}
                      onChange={(e) => handleInputChange('long_stay_ok', e.target.checked)}
                      className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="long_stay_ok" className="flex items-center text-sm text-gray-700">
                      <ClockIcon className="h-4 w-4 mr-2 text-blue-600" />
                      {t('places.form.suitableForLongStay')}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Description and Tags */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t('places.form.descriptionAndTags')}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('places.form.description')} *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('places.form.descriptionPlaceholder')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('places.form.recommendationReason')} *
                    </label>
                    <textarea
                      value={formData.recommendation_reason}
                      onChange={(e) => handleInputChange('recommendation_reason', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('places.form.recommendationReasonPlaceholder')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('places.form.tags')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {suggestedTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => handleTagToggle(tag)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            formData.tags.includes(tag)
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          {t(`recommendationForm.place.suggestedTags.${tag}`) || tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Images */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t('places.form.images')}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('places.form.uploadImages')}
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <UploadIcon className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          {t('places.form.clickToUpload')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {t('places.form.imageRequirements')}
                        </p>
                      </label>
                    </div>
                  </div>
                  
                  {formData.images.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        {t('places.form.uploadedImages')} ({formData.images.length}/3)
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <XIcon className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="btn btn-outline"
          >
            {t('places.form.previous')}
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="btn btn-outline"
            >
              {t('places.form.cancel')}
            </button>
            
            {currentStep < 5 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceedToNext()}
                className="btn btn-primary"
              >
                {t('places.form.next')}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !canProceedToNext()}
                className="btn btn-primary"
              >
                {loading ? t('places.form.submitting') : t('places.form.submit')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
