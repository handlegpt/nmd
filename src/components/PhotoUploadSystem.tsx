'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { 
  UploadIcon, 
  X, 
  ImageIcon, 
  CameraIcon,
  EditIcon,
  TrashIcon,
  RotateCwIcon,
  DownloadIcon
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useUser } from '@/contexts/GlobalStateContext'
import { useNotifications } from '@/contexts/GlobalStateContext'
import realtimeService from '@/lib/realtimeUpdateService'
import { cityPhotosService } from '@/lib/cityPhotosService'

interface UploadedPhoto {
  id: string
  file: File
  preview: string
  name: string
  description: string
  tags: string[]
  photographer: string
  location: string
  uploadedAt: string
  size: number
  width: number
  height: number
}

interface PhotoUploadSystemProps {
  cityName: string
  onPhotosUploaded?: (photos: UploadedPhoto[]) => void
  maxPhotos?: number
  maxFileSize?: number // in MB
  acceptedTypes?: string[]
}

export default function PhotoUploadSystem({
  cityName,
  onPhotosUploaded,
  maxPhotos = 10,
  maxFileSize = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
}: PhotoUploadSystemProps) {
  const { t } = useTranslation()
  const { user } = useUser()
  const { addNotification } = useNotifications()
  
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [editingPhoto, setEditingPhoto] = useState<UploadedPhoto | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 加载现有照片
  useEffect(() => {
    const loadExistingPhotos = async () => {
      if (!user.isAuthenticated || !user.profile?.id) return

      setLoading(true)
      try {
        const existingPhotos = await cityPhotosService.getCityPhotos(
          user.profile.id, 
          cityName.toLowerCase().replace(/\s+/g, '-')
        )

        // 将数据库照片转换为组件格式
        const convertedPhotos: UploadedPhoto[] = existingPhotos.map(photo => ({
          id: photo.id,
          file: new File([], photo.photo_url), // 占位符文件
          preview: photo.photo_url,
          name: photo.photo_description || 'Photo',
          description: photo.photo_description || '',
          tags: [],
          photographer: user.profile?.name || 'Anonymous',
          location: photo.city_name,
          uploadedAt: photo.upload_date,
          size: photo.file_size || 0,
          width: 0,
          height: 0
        }))

        setPhotos(convertedPhotos)
      } catch (error) {
        console.error('Error loading existing photos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadExistingPhotos()
  }, [user.isAuthenticated, user.profile?.id, cityName])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }, [])

  const handleFiles = async (files: File[]) => {
    if (!user.isAuthenticated) {
      addNotification({
        type: 'error',
        message: t('photoUpload.loginRequired')
      })
      return
    }

    if (photos.length + files.length > maxPhotos) {
      addNotification({
        type: 'error',
        message: t('photoUpload.maxPhotosExceeded', { max: maxPhotos.toString() })
      })
      return
    }

    setUploading(true)
    const newPhotos: UploadedPhoto[] = []

    for (const file of files) {
      try {
        // 验证文件类型
        if (!acceptedTypes.includes(file.type)) {
          addNotification({
            type: 'error',
            message: t('photoUpload.invalidFileType', { file: file.name })
          })
          continue
        }

        // 验证文件大小
        if (file.size > maxFileSize * 1024 * 1024) {
                  addNotification({
          type: 'error',
          message: t('photoUpload.fileTooLarge', { file: file.name, max: maxFileSize.toString() })
        })
          continue
        }

        // 创建预览
        const preview = await createImagePreview(file)
        const dimensions = await getImageDimensions(file)

        const photo: UploadedPhoto = {
          id: `photo_${Date.now()}_${Math.random()}`,
          file,
          preview,
          name: file.name.replace(/\.[^/.]+$/, ''),
          description: '',
          tags: [],
          photographer: user.profile?.name || 'Anonymous',
          location: cityName,
          uploadedAt: new Date().toISOString(),
          size: file.size,
          width: dimensions.width,
          height: dimensions.height
        }

        newPhotos.push(photo)
      } catch (error) {
        console.error('Error processing file:', error)
        addNotification({
          type: 'error',
          message: t('photoUpload.processingError', { file: file.name })
        })
      }
    }

    setPhotos(prev => [...prev, ...newPhotos])
    setUploading(false)

    if (newPhotos.length > 0) {
      addNotification({
        type: 'success',
        message: t('photoUpload.uploadSuccess', { count: newPhotos.length.toString() })
      })
    }
  }

  const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.width, height: img.height })
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const removePhoto = async (photoId: string) => {
    if (!user.isAuthenticated || !user.profile?.id) {
      addNotification({
        type: 'error',
        message: t('photoUpload.loginRequired')
      })
      return
    }

    try {
      const success = await cityPhotosService.deleteCityPhoto(user.profile.id, photoId)
      
      if (success) {
        setPhotos(prev => prev.filter(photo => photo.id !== photoId))
        addNotification({
          type: 'success',
          message: t('photoUpload.photoRemoved')
        })
      } else {
        addNotification({
          type: 'error',
          message: t('photoUpload.removeError')
        })
      }
    } catch (error) {
      console.error('Error removing photo:', error)
      addNotification({
        type: 'error',
        message: t('photoUpload.removeError')
      })
    }
  }

  const updatePhoto = async (photoId: string, updates: Partial<UploadedPhoto>) => {
    if (!user.isAuthenticated || !user.profile?.id) {
      addNotification({
        type: 'error',
        message: t('photoUpload.loginRequired')
      })
      return
    }

    try {
      const updateData = {
        photo_description: updates.description,
        photo_url: updates.preview
      }

      const updatedPhoto = await cityPhotosService.updateCityPhoto(
        user.profile.id, 
        photoId, 
        updateData
      )

      if (updatedPhoto) {
        setPhotos(prev => prev.map(photo => 
          photo.id === photoId ? { ...photo, ...updates } : photo
        ))
        addNotification({
          type: 'success',
          message: t('photoUpload.photoUpdated')
        })
      } else {
        addNotification({
          type: 'error',
          message: t('photoUpload.updateError')
        })
      }
    } catch (error) {
      console.error('Error updating photo:', error)
      addNotification({
        type: 'error',
        message: t('photoUpload.updateError')
      })
    }
  }

  const addTag = (photoId: string, tag: string) => {
    if (tag.trim()) {
      setPhotos(prev => prev.map(photo => 
        photo.id === photoId 
          ? { ...photo, tags: [...photo.tags, tag.trim()] }
          : photo
      ))
    }
  }

  const removeTag = (photoId: string, tagIndex: number) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId 
        ? { ...photo, tags: photo.tags.filter((_, index) => index !== tagIndex) }
        : photo
    ))
  }

  const handleSubmit = async () => {
    if (photos.length === 0) {
      addNotification({
        type: 'error',
        message: t('photoUpload.noPhotosToSubmit')
      })
      return
    }

    if (!user.isAuthenticated || !user.profile?.id) {
      addNotification({
        type: 'error',
        message: t('photoUpload.loginRequired')
      })
      return
    }

    setUploading(true)

    try {
      // 保存到数据库
      const photosToSave = photos.map(photo => ({
        city_id: cityName.toLowerCase().replace(/\s+/g, '-'),
        city_name: cityName,
        photo_url: photo.preview, // 这里应该是实际的上传URL
        photo_description: photo.description,
        file_size: photo.size,
        file_type: photo.file.type
      }))

      const savedPhotos = await cityPhotosService.addCityPhotos(user.profile.id, photosToSave)

      if (savedPhotos.length > 0) {
        // 发布实时更新
        photos.forEach(photo => {
          realtimeService.publish({
            type: 'photo',
            action: 'create',
            data: {
              id: photo.id,
              cityId: cityName,
              cityName: cityName,
              photographer: photo.photographer,
              name: photo.name,
              description: photo.description
            },
            userId: user.profile?.id
          })
        })

        onPhotosUploaded?.(photos)
        
        addNotification({
          type: 'success',
          message: t('photoUpload.submitSuccess', { count: photos.length.toString() })
        })

        // 清空当前上传的照片
        setPhotos([])
      } else {
        addNotification({
          type: 'error',
          message: t('photoUpload.submitError')
        })
      }
    } catch (error) {
      console.error('Error saving photos:', error)
      addNotification({
        type: 'error',
        message: t('photoUpload.submitError')
      })
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <CameraIcon className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {t('photoUpload.title')} - {cityName}
            </h2>
            <p className="text-sm text-gray-600">
              {t('photoUpload.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      {photos.length < maxPhotos && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-purple-400 bg-purple-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <UploadIcon className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                {t('photoUpload.dragDropTitle')}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {t('photoUpload.dragDropDescription')}
              </p>
            </div>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-primary"
                disabled={uploading}
              >
                {uploading ? t('photoUpload.uploading') : t('photoUpload.selectFiles')}
              </button>
              <span className="text-sm text-gray-500">
                {t('photoUpload.or')}
              </span>
              <span className="text-sm text-gray-500">
                {t('photoUpload.dragDrop')}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {t('photoUpload.fileTypes')}: JPG, PNG, WebP • {t('photoUpload.maxSize')}: {maxFileSize}MB • {t('photoUpload.maxPhotos')}: {maxPhotos}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Uploaded Photos */}
      {photos.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('photoUpload.uploadedPhotos')} ({photos.length}/{maxPhotos})
            </h3>
            <button
              onClick={handleSubmit}
              className="btn btn-primary"
            >
              {t('photoUpload.submitPhotos')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Photo Preview */}
                <div className="relative aspect-video bg-gray-100">
                  <img
                    src={photo.preview}
                    alt={photo.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button
                      onClick={() => setEditingPhoto(photo)}
                      className="p-1 bg-white bg-opacity-80 rounded hover:bg-opacity-100"
                      title={t('photoUpload.edit')}
                    >
                      <EditIcon className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="p-1 bg-white bg-opacity-80 rounded hover:bg-opacity-100"
                      title={t('photoUpload.remove')}
                    >
                      <TrashIcon className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Photo Info */}
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 truncate">{photo.name}</h4>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(photo.size)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {photo.width} × {photo.height}px
                  </div>
                  
                  {/* Tags */}
                  {photo.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {photo.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quick Edit */}
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={photo.description}
                      onChange={(e) => updatePhoto(photo.id, { description: e.target.value })}
                      placeholder={t('photoUpload.descriptionPlaceholder')}
                      className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                      maxLength={100}
                    />
                    <div className="flex space-x-1">
                      <input
                        type="text"
                        placeholder={t('photoUpload.addTag')}
                        className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addTag(photo.id, e.currentTarget.value)
                            e.currentTarget.value = ''
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Photo Modal */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('photoUpload.editPhoto')}
                </h3>
                <button
                  onClick={() => setEditingPhoto(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Photo Preview */}
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={editingPhoto.preview}
                    alt={editingPhoto.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Edit Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('photoUpload.name')}
                    </label>
                    <input
                      type="text"
                      value={editingPhoto.name}
                      onChange={(e) => updatePhoto(editingPhoto.id, { name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('photoUpload.description')}
                    </label>
                    <textarea
                      value={editingPhoto.description}
                      onChange={(e) => updatePhoto(editingPhoto.id, { description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder={t('photoUpload.descriptionPlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('photoUpload.tags')}
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {editingPhoto.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center space-x-1"
                        >
                          <span>#{tag}</span>
                          <button
                            onClick={() => removeTag(editingPhoto.id, index)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder={t('photoUpload.addTag')}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addTag(editingPhoto.id, e.currentTarget.value)
                            e.currentTarget.value = ''
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('photoUpload.photographer')}
                      </label>
                      <input
                        type="text"
                        value={editingPhoto.photographer}
                        onChange={(e) => updatePhoto(editingPhoto.id, { photographer: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('photoUpload.location')}
                      </label>
                      <input
                        type="text"
                        value={editingPhoto.location}
                        onChange={(e) => updatePhoto(editingPhoto.id, { location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setEditingPhoto(null)}
                    className="btn btn-outline"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={() => setEditingPhoto(null)}
                    className="btn btn-primary"
                  >
                    {t('common.save')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
