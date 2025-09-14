'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  MapPin, 
  Heart,
  Share2,
  Download,
  Eye,
  Plus,
  Upload
} from 'lucide-react'
import { CityImageService, CityImageData } from '@/lib/cityImageService'

// Use the CityImageData interface from the service
type CityImage = CityImageData

interface CityImageGalleryProps {
  cityData: {
    name: string
    country: string
    latitude: number
    longitude: number
  }
}

export default function CityImageGallery({ cityData }: CityImageGalleryProps) {
  const { t } = useTranslation()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [images, setImages] = useState<CityImage[]>([])

  useEffect(() => {
    // Use the CityImageService to generate city-specific images
    const cityImages = CityImageService.generateCityImages({
      cityName: cityData.name,
      country: cityData.country,
      region: (cityData as any).region,
      tags: (cityData as any).tags
    })
    
    setImages(cityImages)
  }, [cityData.name, cityData.country])

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  if (images.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {t('cityDetail.gallery.title')}
        </h3>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    )
  }

  const currentImage = images[currentImageIndex]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* 图片轮播区域 */}
      <div className="relative">
        <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
          <img
            src={currentImage.url}
            alt={currentImage.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          
          {/* 图片信息覆盖层 */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-bold text-lg mb-1">{currentImage.title}</h4>
                <p className="text-gray-200 text-sm mb-2">{currentImage.description}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-300">
                  <span className="flex items-center space-x-1">
                    <Camera className="h-3 w-3" />
                    <span>{currentImage.photographer}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{currentImage.location}</span>
                  </span>
                  {currentImage.isUserUploaded && (
                    <span className="bg-blue-500 text-white px-2 py-1 rounded-full">
                      {t('cityDetail.gallery.userUploaded')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                  <Heart className="h-4 w-4 text-white" />
                </button>
                <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                  <Share2 className="h-4 w-4 text-white" />
                </button>
                <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                  <Download className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* 导航按钮 */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* 图片计数器 */}
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>
      </div>

      {/* 缩略图导航 */}
      {images.length > 1 && (
        <div className="p-4">
          <div className="flex space-x-2 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToImage(index)}
                className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentImageIndex
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 图片统计和操作 */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>{currentImage.likes} {t('cityDetail.gallery.likes')}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{Math.floor(Math.random() * 1000) + 100} {t('cityDetail.gallery.views')}</span>
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
              <Plus className="h-4 w-4 mr-1" />
              Add Photo
            </button>
            <button className="inline-flex items-center text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium transition-colors">
              <Upload className="h-4 w-4 mr-1" />
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
