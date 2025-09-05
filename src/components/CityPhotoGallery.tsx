'use client'

import { useState } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Download,
  Share2,
  Heart
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

interface CityPhoto {
  id: string
  url: string
  alt: string
  description?: string
  photographer?: string
  tags?: string[]
}

interface CityPhotoGalleryProps {
  cityName: string
  photos: CityPhoto[]
  maxPhotos?: number
}

export default function CityPhotoGallery({ 
  cityName, 
  photos, 
  maxPhotos = 6 
}: CityPhotoGalleryProps) {
  const { t } = useTranslation()
  const [selectedPhoto, setSelectedPhoto] = useState<CityPhoto | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const displayedPhotos = photos.slice(0, maxPhotos)

  const openPhoto = (photo: CityPhoto, index: number) => {
    setSelectedPhoto(photo)
    setCurrentIndex(index)
  }

  const closePhoto = () => {
    setSelectedPhoto(null)
  }

  const nextPhoto = () => {
    if (selectedPhoto) {
      const nextIndex = (currentIndex + 1) % displayedPhotos.length
      setSelectedPhoto(displayedPhotos[nextIndex])
      setCurrentIndex(nextIndex)
    }
  }

  const prevPhoto = () => {
    if (selectedPhoto) {
      const prevIndex = currentIndex === 0 ? displayedPhotos.length - 1 : currentIndex - 1
      setSelectedPhoto(displayedPhotos[prevIndex])
      setCurrentIndex(prevIndex)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (selectedPhoto) {
      if (e.key === 'Escape') {
        closePhoto()
      } else if (e.key === 'ArrowRight') {
        nextPhoto()
      } else if (e.key === 'ArrowLeft') {
        prevPhoto()
      }
    }
  }

  // 添加键盘事件监听
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown)
  }

  // 如果没有照片，显示占位符
  if (displayedPhotos.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('cityGallery.noPhotos')}
        </h3>
        <p className="text-gray-600">
          {t('cityGallery.noPhotosDescription', { city: cityName })}
        </p>
      </div>
    )
  }

  return (
    <>
      {/* 照片网格 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {displayedPhotos.map((photo, index) => (
          <div
            key={photo.id}
            className="relative group cursor-pointer overflow-hidden rounded-lg"
            onClick={() => openPhoto(photo, index)}
          >
            <img
              src={photo.url}
              alt={photo.alt}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center">
                <p className="font-medium">{photo.description || photo.alt}</p>
                {photo.photographer && (
                  <p className="text-sm opacity-75">by {photo.photographer}</p>
                )}
              </div>
            </div>
            {index === maxPhotos - 1 && photos.length > maxPhotos && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  +{photos.length - maxPhotos}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 照片查看器 */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative max-w-4xl max-h-full p-4">
            {/* 关闭按钮 */}
            <button
              onClick={closePhoto}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="h-6 w-6" />
            </button>

            {/* 照片 */}
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.alt}
              className="max-w-full max-h-[80vh] object-contain"
            />

            {/* 照片信息 */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="bg-black bg-opacity-50 rounded-lg p-4">
                <h3 className="font-medium text-lg mb-2">
                  {selectedPhoto.description || selectedPhoto.alt}
                </h3>
                {selectedPhoto.photographer && (
                  <p className="text-sm opacity-75 mb-2">
                    {t('cityGallery.photographer')}: {selectedPhoto.photographer}
                  </p>
                )}
                {selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedPhoto.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-white bg-opacity-20 text-white px-2 py-1 rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="absolute top-4 left-4 flex space-x-2">
              <button
                onClick={() => {
                  // 下载功能
                  const link = document.createElement('a')
                  link.href = selectedPhoto.url
                  link.download = `${cityName}-${selectedPhoto.alt}.jpg`
                  link.click()
                }}
                className="bg-white bg-opacity-20 text-white p-2 rounded-lg hover:bg-opacity-30 transition-all"
                title={t('cityGallery.download')}
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  // 分享功能
                  if (navigator.share) {
                    navigator.share({
                      title: `${cityName} - ${selectedPhoto.alt}`,
                      text: selectedPhoto.description || selectedPhoto.alt,
                      url: window.location.href
                    })
                  } else {
                    // 复制链接到剪贴板
                    navigator.clipboard.writeText(window.location.href)
                  }
                }}
                className="bg-white bg-opacity-20 text-white p-2 rounded-lg hover:bg-opacity-30 transition-all"
                title={t('cityGallery.share')}
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  // 收藏功能
                  // TODO: 实现收藏照片功能
                }}
                className="bg-white bg-opacity-20 text-white p-2 rounded-lg hover:bg-opacity-30 transition-all"
                title={t('cityGallery.favorite')}
              >
                <Heart className="h-4 w-4" />
              </button>
            </div>

            {/* 导航按钮 */}
            {displayedPhotos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 text-white p-2 rounded-lg hover:bg-opacity-30 transition-all"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 text-white p-2 rounded-lg hover:bg-opacity-30 transition-all"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* 照片计数器 */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {displayedPhotos.length}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
