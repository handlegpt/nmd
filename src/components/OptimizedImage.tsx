'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // 检测WebP支持
  const [supportsWebP, setSupportsWebP] = useState(false)

  useEffect(() => {
    // 检查WebP支持
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
    }
    setSupportsWebP(checkWebPSupport())
  }, [])

  // 优化图片URL
  const getOptimizedSrc = (originalSrc: string) => {
    // 如果是外部图片，使用图片优化服务
    if (originalSrc.startsWith('http') && !originalSrc.includes('nomad.now')) {
      // 使用Cloudinary或其他图片优化服务
      return `https://res.cloudinary.com/nomadnow/image/fetch/f_auto,q_${quality},w_${width || 800}/${encodeURIComponent(originalSrc)}`
    }
    
    // 如果是本地图片，直接返回
    return originalSrc
  }

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width: width || '100%', height: height || '200px' }}
      >
        <div className="text-gray-500 text-sm">图片加载失败</div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        src={getOptimizedSrc(src)}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        priority={priority}
        sizes={sizes}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
      />
      
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}
