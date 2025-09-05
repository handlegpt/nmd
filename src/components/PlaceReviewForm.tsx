'use client'

import { useState } from 'react'
import { 
  XIcon, 
  StarIcon,
  PlusIcon,
  MinusIcon
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

interface PlaceReviewFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reviewData: any) => void
  placeName: string
}

export default function PlaceReviewForm({ isOpen, onClose, onSubmit, placeName }: PlaceReviewFormProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    rating: 5,
    review: '',
    pros: [] as string[],
    cons: [] as string[],
    visit_date: new Date().toISOString().split('T')[0]
  })
  const [newPro, setNewPro] = useState('')
  const [newCon, setNewCon] = useState('')

  const suggestedPros = [
    'WiFi快', '环境安静', '座位舒适', '咖啡好', '价格合理', '位置便利',
    '设施齐全', '服务好', '氛围好', '插座多', '24小时', '宠物友好'
  ]

  const suggestedCons = [
    '价格贵', 'WiFi慢', '座位少', '噪音大', '位置偏僻', '服务差',
    '设施旧', '插座少', '营业时间短', '停车难', '拥挤', '食物一般'
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addPro = (pro: string) => {
    if (pro && !formData.pros.includes(pro)) {
      setFormData(prev => ({
        ...prev,
        pros: [...prev.pros, pro]
      }))
      setNewPro('')
    }
  }

  const removePro = (proToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      pros: prev.pros.filter(pro => pro !== proToRemove)
    }))
  }

  const addCon = (con: string) => {
    if (con && !formData.cons.includes(con)) {
      setFormData(prev => ({
        ...prev,
        cons: [...prev.cons, con]
      }))
      setNewCon('')
    }
  }

  const removeCon = (conToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      cons: prev.cons.filter(con => con !== conToRemove)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    // 重置表单
    setFormData({
      rating: 5,
      review: '',
      pros: [],
      cons: [],
      visit_date: new Date().toISOString().split('T')[0]
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
            <h2 className="text-xl font-bold text-gray-900">评价 {placeName}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                总体评分 *
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleInputChange('rating', star)}
                    className="focus:outline-none"
                  >
                    <StarIcon
                      className={`h-8 w-8 ${
                        star <= formData.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-3 text-lg font-medium text-gray-900">
                  {formData.rating}/5
                </span>
              </div>
            </div>

            {/* Review */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                详细评价 *
              </label>
              <textarea
                required
                value={formData.review}
                onChange={(e) => handleInputChange('review', e.target.value)}
                placeholder="分享你的体验和感受..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Visit Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                访问日期
              </label>
              <input
                type="date"
                value={formData.visit_date}
                onChange={(e) => handleInputChange('visit_date', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Pros */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                优点
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newPro}
                  onChange={(e) => setNewPro(e.target.value)}
                  placeholder="添加优点"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => addPro(newPro)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
              
              {/* Suggested Pros */}
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-2">推荐优点：</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedPros.map((pro) => (
                    <button
                      key={pro}
                      type="button"
                      onClick={() => addPro(pro)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
                    >
                      {pro}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Pros */}
              {formData.pros.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">已选优点：</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.pros.map((pro) => (
                      <span
                        key={pro}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center space-x-1"
                      >
                        <span>{pro}</span>
                        <button
                          type="button"
                          onClick={() => removePro(pro)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <MinusIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                缺点
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newCon}
                  onChange={(e) => setNewCon(e.target.value)}
                  placeholder="添加缺点"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => addCon(newCon)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
              
              {/* Suggested Cons */}
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-2">推荐缺点：</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedCons.map((con) => (
                    <button
                      key={con}
                      type="button"
                      onClick={() => addCon(con)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm hover:bg-red-200 transition-colors"
                    >
                      {con}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Cons */}
              {formData.cons.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">已选缺点：</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.cons.map((con) => (
                      <span
                        key={con}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center space-x-1"
                      >
                        <span>{con}</span>
                        <button
                          type="button"
                          onClick={() => removeCon(con)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <MinusIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                提交评价
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
