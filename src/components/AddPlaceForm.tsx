'use client'

import { useState } from 'react'
import { XIcon, CoffeeIcon, MonitorIcon, HomeIcon, UtensilsIcon, TreePine, MapPinIcon } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useUser } from '@/contexts/GlobalStateContext'
import LoginRequired from './LoginRequired'

interface AddPlaceFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (placeData: any) => void
}

export default function AddPlaceForm({ isOpen, onClose, onSubmit }: AddPlaceFormProps) {
  const { t } = useTranslation()
  const { user } = useUser()
  const [formData, setFormData] = useState({
    name: '',
    category: 'cafe',
    address: '',
    description: '',
    tags: [] as string[],
    wifi_speed: '',
    price_level: 3,
    noise_level: 'moderate',
    social_atmosphere: 'medium'
  })
  const [newTag, setNewTag] = useState('')

  const categories = [
    { id: 'cafe', name: '☕ 咖啡馆', icon: <CoffeeIcon className="h-4 w-4" /> },
    { id: 'coworking', name: '💻 Co-working', icon: <MonitorIcon className="h-4 w-4" /> },
    { id: 'coliving', name: '🏠 Coliving', icon: <HomeIcon className="h-4 w-4" /> },
    { id: 'restaurant', name: '🍽 餐馆', icon: <UtensilsIcon className="h-4 w-4" /> },
    { id: 'park', name: '🌳 公园', icon: <TreePine className="h-4 w-4" /> },
    { id: 'other', name: '📍 其他', icon: <MapPinIcon className="h-4 w-4" /> }
  ]

  const suggestedTags = [
    '安静', 'WiFi快', '咖啡好', '价格合理', '位置便利', '设施齐全',
    '社区好', '风景美', '食物好吃', '服务好', '24小时', '宠物友好'
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
      wifi_speed: formData.wifi_speed ? parseInt(formData.wifi_speed) : undefined,
      submitted_by: user.profile?.id || ''
    })
    // 重置表单
    setFormData({
      name: '',
      category: 'cafe',
      address: '',
      description: '',
      tags: [],
      wifi_speed: '',
      price_level: 3,
      noise_level: 'moderate',
      social_atmosphere: 'medium'
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">添加推荐地点</h2>
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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  地点名称 *
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
                  placeholder="例如：星巴克咖啡厅"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  类别 *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      disabled={!user.isAuthenticated}
                      onClick={() => handleInputChange('category', category.id)}
                      className={`flex items-center space-x-2 p-3 border rounded-lg transition-colors ${
                        formData.category === category.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      } ${!user.isAuthenticated ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      {category.icon}
                      <span>{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  地址 *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!user.isAuthenticated}
                  required
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !user.isAuthenticated ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                  placeholder="详细地址"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述 *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={!user.isAuthenticated}
                  required
                  rows={3}
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                    !user.isAuthenticated ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                  placeholder="描述这个地点的特色和适合数字游民的原因..."
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标签
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
                    placeholder="添加标签"
                  />
                  <button
                    type="button"
                    disabled={!user.isAuthenticated}
                    onClick={() => addTag(newTag)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    添加
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  建议标签：
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

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WiFi速度 (Mbps)
                </label>
                <input
                  type="number"
                  value={formData.wifi_speed}
                  onChange={(e) => handleInputChange('wifi_speed', e.target.value)}
                  disabled={!user.isAuthenticated}
                  min="0"
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !user.isAuthenticated ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                  placeholder="例如：50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  价格等级
                </label>
                <select
                  value={formData.price_level}
                  onChange={(e) => handleInputChange('price_level', parseInt(e.target.value))}
                  disabled={!user.isAuthenticated}
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !user.isAuthenticated ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  <option value={1}>$ 便宜</option>
                  <option value={2}>$$ 经济</option>
                  <option value={3}>$$$ 中等</option>
                  <option value={4}>$$$$ 较贵</option>
                  <option value={5}>$$$$$ 昂贵</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  噪音水平
                </label>
                <select
                  value={formData.noise_level}
                  onChange={(e) => handleInputChange('noise_level', e.target.value)}
                  disabled={!user.isAuthenticated}
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !user.isAuthenticated ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  <option value="quiet">安静</option>
                  <option value="moderate">适中</option>
                  <option value="loud">嘈杂</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  社交氛围
                </label>
                <select
                  value={formData.social_atmosphere}
                  onChange={(e) => handleInputChange('social_atmosphere', e.target.value)}
                  disabled={!user.isAuthenticated}
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !user.isAuthenticated ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  <option value="low">低</option>
                  <option value="medium">中等</option>
                  <option value="high">高</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!user.isAuthenticated}
                className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                  !user.isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                添加地点
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
