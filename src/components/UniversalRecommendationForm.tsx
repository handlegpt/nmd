'use client'

import { useState, useEffect } from 'react'
import { XIcon, MapPinIcon, GlobeIcon, CalendarIcon, DollarSignIcon, WifiIcon, CoffeeIcon, MonitorIcon, HomeIcon, UtensilsIcon, TreePine } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useUser } from '@/contexts/GlobalStateContext'
import { useNotifications } from '@/contexts/GlobalStateContext'
import LoginRequired from './LoginRequired'

// 推荐类型
export type RecommendationType = 'city' | 'place'

// 表单字段配置
interface FormField {
  name: string
  label: string
  type: 'text' | 'number' | 'select' | 'textarea' | 'tags' | 'highlights' | 'category'
  required?: boolean
  placeholder?: string
  helpText?: string
  options?: Array<{ value: string | number; label: string; icon?: React.ReactNode }>
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
  gridCols?: number
}

// 表单配置
interface FormConfig {
  title: string
  fields: FormField[]
  suggestedTags?: string[]
  suggestedHighlights?: string[]
  submitButtonText: string
}

// 组件属性
interface UniversalRecommendationFormProps {
  type: RecommendationType
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  initialData?: any
}

export default function UniversalRecommendationForm({
  type,
  isOpen,
  onClose,
  onSubmit,
  initialData
}: UniversalRecommendationFormProps) {
  const { t } = useTranslation()
  const { user } = useUser()
  const { addNotification } = useNotifications()
  
  // 获取表单配置
  const getFormConfig = (): FormConfig => {
    if (type === 'city') {
      return {
        title: t('recommendationForm.city.title'),
        submitButtonText: t('recommendationForm.city.submitButton'),
        suggestedTags: [
          '预算友好', 'WiFi快', '签证简单', '气候好', '美食多',
          '文化丰富', '交通便利', '安全', '英语好', '社区好',
          '工作空间', '咖啡文化', '户外', '夜生活', '购物',
          '联合办公', '网络稳定', '生活节奏慢', '风景美', '历史古迹',
          '现代设施', '医疗好', '教育资源', '创业氛围', '国际化'
        ],
        suggestedHighlights: [
          '数字游民友好', 'WiFi速度快', '生活成本低', '签证便利', '气候宜人',
          '美食丰富', '文化多元', '交通便利', '安全宜居', '英语普及',
          '社区活跃', '工作空间多', '咖啡文化', '户外活动', '夜生活丰富',
          '联合办公空间多', '网络稳定', '生活节奏慢', '风景优美', '历史古迹',
          '现代设施', '医疗条件好', '教育资源丰富', '创业氛围', '国际化程度高'
        ],
        fields: [
          {
            name: 'name',
            label: t('recommendationForm.city.fields.name'),
            type: 'text',
            required: true,
            placeholder: t('recommendationForm.city.fields.namePlaceholder'),
            gridCols: 1
          },
          {
            name: 'country',
            label: t('recommendationForm.city.fields.country'),
            type: 'text',
            required: true,
            placeholder: t('recommendationForm.city.fields.countryPlaceholder'),
            gridCols: 1
          },
          {
            name: 'country_code',
            label: t('recommendationForm.city.fields.countryCode'),
            type: 'text',
            required: true,
            placeholder: t('recommendationForm.city.fields.countryCodePlaceholder'),
            validation: { max: 2 },
            gridCols: 1
          },
          {
            name: 'timezone',
            label: t('recommendationForm.city.fields.timezone'),
            type: 'select',
            required: true,
            options: [
              'UTC', 'UTC+1', 'UTC+2', 'UTC+3', 'UTC+4', 'UTC+5', 'UTC+6', 'UTC+7', 'UTC+8', 'UTC+9', 'UTC+10', 'UTC+11', 'UTC+12',
              'UTC-1', 'UTC-2', 'UTC-3', 'UTC-4', 'UTC-5', 'UTC-6', 'UTC-7', 'UTC-8', 'UTC-9', 'UTC-10', 'UTC-11', 'UTC-12'
            ].map(tz => ({ value: tz, label: tz })),
            gridCols: 1
          },
          {
            name: 'latitude',
            label: t('recommendationForm.city.fields.latitude'),
            type: 'number',
            placeholder: t('recommendationForm.city.fields.latitudePlaceholder'),
            gridCols: 1
          },
          {
            name: 'longitude',
            label: t('recommendationForm.city.fields.longitude'),
            type: 'number',
            placeholder: t('recommendationForm.city.fields.longitudePlaceholder'),
            gridCols: 1
          },
          {
            name: 'visa_type',
            label: t('recommendationForm.city.fields.visaType'),
            type: 'select',
            required: true,
            options: [
              { value: 'Tourist Visa', label: '旅游签证' },
              { value: 'Digital Nomad Visa', label: '数字游民签证' },
              { value: 'Visa Free', label: '免签' },
              { value: 'Visa on Arrival', label: '落地签' },
              { value: 'Business Visa', label: '商务签证' },
              { value: 'Student Visa', label: '学生签证' },
              { value: 'Work Visa', label: '工作签证' },
              { value: 'Residence Permit', label: '居留许可' }
            ],
            gridCols: 1
          },
          {
            name: 'visa_days',
            label: t('recommendationForm.city.fields.visaDays'),
            type: 'number',
            required: true,
            validation: { min: 1, max: 365 },
            gridCols: 1,
            helpText: '单次签证可停留的最大天数'
          },
          {
            name: 'cost_of_living',
            label: t('recommendationForm.city.fields.costOfLiving'),
            type: 'number',
            required: true,
            validation: { min: 100, max: 10000 },
            placeholder: t('recommendationForm.city.fields.costOfLivingPlaceholder'),
            gridCols: 1,
            helpText: '包括住宿、餐饮、交通等基本生活费用'
          },
          {
            name: 'wifi_speed',
            label: t('recommendationForm.city.fields.wifiSpeed'),
            type: 'number',
            required: true,
            validation: { min: 1, max: 1000 },
            placeholder: t('recommendationForm.city.fields.wifiSpeedPlaceholder'),
            gridCols: 1,
            helpText: '平均下载速度，影响远程工作效率'
          },
          {
            name: 'description',
            label: t('recommendationForm.city.fields.description'),
            type: 'textarea',
            required: true,
            placeholder: t('recommendationForm.city.fields.descriptionPlaceholder'),
            gridCols: 2
          },
          {
            name: 'highlights',
            label: t('recommendationForm.city.fields.highlights'),
            type: 'highlights',
            gridCols: 2
          },
          {
            name: 'tags',
            label: t('recommendationForm.city.fields.tags'),
            type: 'tags',
            gridCols: 2
          }
        ]
      }
    } else {
      return {
        title: t('recommendationForm.place.title'),
        submitButtonText: t('recommendationForm.place.submitButton'),
        suggestedTags: [
          '安静', 'WiFi快', '咖啡好', '价格合理', '位置便利', '设施齐全',
          '社区好', '风景美', '食物好吃', '服务好', '24小时', '宠物友好'
        ],
        fields: [
          {
            name: 'name',
            label: t('recommendationForm.place.fields.name'),
            type: 'text',
            required: true,
            placeholder: t('recommendationForm.place.fields.namePlaceholder'),
            gridCols: 2
          },
          {
            name: 'category',
            label: t('recommendationForm.place.fields.category'),
            type: 'category',
            required: true,
            gridCols: 2
          },
          {
            name: 'address',
            label: t('recommendationForm.place.fields.address'),
            type: 'text',
            required: true,
            placeholder: t('recommendationForm.place.fields.addressPlaceholder'),
            gridCols: 2
          },
          {
            name: 'location',
            label: t('recommendationForm.place.fields.location'),
            type: 'text',
            placeholder: t('recommendationForm.place.fields.locationPlaceholder'),
            helpText: t('recommendationForm.place.fields.locationHelp'),
            gridCols: 2
          },
          {
            name: 'description',
            label: t('recommendationForm.place.fields.description'),
            type: 'textarea',
            required: true,
            placeholder: t('recommendationForm.place.fields.descriptionPlaceholder'),
            gridCols: 2
          },
          {
            name: 'wifi_speed',
            label: t('recommendationForm.place.fields.wifiSpeed'),
            type: 'number',
            placeholder: t('recommendationForm.place.fields.wifiSpeedPlaceholder'),
            validation: { min: 0 },
            gridCols: 1
          },
          {
            name: 'price_level',
            label: t('recommendationForm.place.fields.priceLevel'),
            type: 'select',
            options: [
              { value: 1, label: '$ 便宜' },
              { value: 2, label: '$$ 经济' },
              { value: 3, label: '$$$ 中等' },
              { value: 4, label: '$$$$ 较贵' },
              { value: 5, label: '$$$$$ 昂贵' }
            ],
            gridCols: 1
          },
          {
            name: 'noise_level',
            label: t('recommendationForm.place.fields.noiseLevel'),
            type: 'select',
            options: [
              { value: 'quiet', label: t('recommendationForm.place.fields.noiseLevels.quiet') },
              { value: 'moderate', label: t('recommendationForm.place.fields.noiseLevels.moderate') },
              { value: 'loud', label: t('recommendationForm.place.fields.noiseLevels.loud') }
            ],
            gridCols: 1
          },
          {
            name: 'social_atmosphere',
            label: t('recommendationForm.place.fields.socialAtmosphere'),
            type: 'select',
            options: [
              { value: 'low', label: t('recommendationForm.place.fields.socialLevels.low') },
              { value: 'medium', label: t('recommendationForm.place.fields.socialLevels.medium') },
              { value: 'high', label: t('recommendationForm.place.fields.socialLevels.high') }
            ],
            gridCols: 1
          },
          {
            name: 'tags',
            label: t('recommendationForm.place.fields.tags'),
            type: 'tags',
            gridCols: 2
          }
        ]
      }
    }
  }

  const config = getFormConfig()
  
  // 初始化表单数据
  const getInitialFormData = () => {
    const baseData = initialData || {}
    
    if (type === 'city') {
      return {
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
        tags: [] as string[],
        ...baseData
      }
    } else {
      return {
        name: '',
        category: 'cafe',
        address: '',
        location: '',
        description: '',
        tags: [] as string[],
        wifi_speed: '',
        price_level: 3,
        noise_level: 'moderate',
        social_atmosphere: 'medium',
        latitude: '',
        longitude: '',
        ...baseData
      }
    }
  }

  const [formData, setFormData] = useState(getInitialFormData())
  const [newTag, setNewTag] = useState('')
  const [newHighlight, setNewHighlight] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 重置表单数据
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData())
      setNewTag('')
      setNewHighlight('')
    }
  }, [isOpen, type, initialData])

  // 地点类别配置
  const placeCategories = [
    { id: 'cafe', name: '☕ 咖啡馆', icon: <CoffeeIcon className="h-4 w-4" /> },
    { id: 'coworking', name: '💻 Co-working', icon: <MonitorIcon className="h-4 w-4" /> },
    { id: 'coliving', name: '🏠 Coliving', icon: <HomeIcon className="h-4 w-4" /> },
    { id: 'restaurant', name: '🍽 餐馆', icon: <UtensilsIcon className="h-4 w-4" /> },
    { id: 'park', name: '🌳 公园', icon: <TreePine className="h-4 w-4" /> },
    { id: 'other', name: '📍 其他', icon: <MapPinIcon className="h-4 w-4" /> }
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev: any) => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev: any) => ({
      ...prev,
      tags: prev.tags.filter((tag: any) => tag !== tagToRemove)
    }))
  }

  const addHighlight = (highlight: string) => {
    if (highlight && !formData.highlights.includes(highlight)) {
      setFormData((prev: any) => ({
        ...prev,
        highlights: [...prev.highlights, highlight]
      }))
      setNewHighlight('')
    }
  }

  const removeHighlight = (highlightToRemove: string) => {
    setFormData((prev: any) => ({
      ...prev,
      highlights: prev.highlights.filter((highlight: any) => highlight !== highlightToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user.isAuthenticated) {
      addNotification({
        type: 'warning',
        message: t('loginRequired.recommendMessage')
      })
      return
    }

    setSubmitting(true)
    try {
      // 处理数据转换
      const processedData = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        wifi_speed: formData.wifi_speed ? parseInt(formData.wifi_speed) : undefined,
        submitted_by: user.profile?.id || ''
      }

      await onSubmit(processedData)
      
      addNotification({
        type: 'success',
        message: t('recommendationForm.submitSuccess')
      })
      
      onClose()
    } catch (error) {
      console.error('Error submitting recommendation:', error)
      addNotification({
        type: 'error',
        message: t('recommendationForm.submitError')
      })
    } finally {
      setSubmitting(false)
    }
  }

  // 渲染表单字段
  const renderField = (field: FormField) => {
    const commonClasses = `w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      !user.isAuthenticated ? 'cursor-not-allowed opacity-50' : ''
    }`

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            disabled={!user.isAuthenticated}
            required={field.required}
            placeholder={field.placeholder}
            maxLength={field.validation?.max}
            className={commonClasses}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            disabled={!user.isAuthenticated}
            required={field.required}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            step="any"
            className={commonClasses}
          />
        )

      case 'select':
        return (
          <select
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            disabled={!user.isAuthenticated}
            required={field.required}
            className={commonClasses}
          >
            <option value="">{t('common.select')}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'textarea':
        return (
          <textarea
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            disabled={!user.isAuthenticated}
            required={field.required}
            placeholder={field.placeholder}
            rows={4}
            className={`${commonClasses} resize-none`}
          />
        )

      case 'category':
        return (
          <div className="grid grid-cols-2 gap-3">
            {placeCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                disabled={!user.isAuthenticated}
                onClick={() => handleInputChange(field.name, category.id)}
                className={`flex items-center space-x-2 p-3 border rounded-lg transition-colors ${
                  formData[field.name] === category.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                } ${!user.isAuthenticated ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {category.icon}
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        )

      case 'tags':
        return (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag: any) => (
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
                placeholder={t('recommendationForm.addTag')}
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
            {config.suggestedTags && (
              <div className="text-sm text-gray-600">
                {t('recommendationForm.suggestedTags')}：
                <div className="flex flex-wrap gap-1 mt-1">
                  {config.suggestedTags.map((tag) => (
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
            )}
          </div>
        )

      case 'highlights':
        return (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {formData.highlights.map((highlight: any) => (
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
                placeholder={t('recommendationForm.addHighlight')}
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
            {config.suggestedHighlights && (
              <div className="text-sm text-gray-600">
                {t('recommendationForm.suggestedHighlights')}：
                <div className="flex flex-wrap gap-1 mt-1">
                  {config.suggestedHighlights.map((highlight) => (
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
            )}
          </div>
        )

      default:
        return null
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl w-full max-h-[90vh] overflow-y-auto ${
        type === 'city' ? 'max-w-4xl' : 'max-w-2xl'
      }`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">{config.title}</h2>
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
            {/* Render fields */}
            {config.fields.map((field) => (
              <div key={field.name} className={field.gridCols === 2 ? 'col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label} {field.required && '*'}
                </label>
                {renderField(field)}
              </div>
            ))}

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
                disabled={!user.isAuthenticated || submitting}
                className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                  !user.isAuthenticated || submitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? t('common.submitting') : config.submitButtonText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
