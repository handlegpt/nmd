'use client'

import { useState, useEffect } from 'react'
import { CityImageService, CityImageData } from '@/lib/cityImageService'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Save, 
  X,
  Search,
  Filter,
  Upload,
  Image as ImageIcon
} from 'lucide-react'

interface CityImageManagerProps {
  cityName: string
  country: string
  images: CityImageData[]
  onImagesUpdate: (images: CityImageData[]) => void
}

function CityImageManager({ cityName, country, images, onImagesUpdate }: CityImageManagerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingImage, setEditingImage] = useState<CityImageData | null>(null)
  const [newImage, setNewImage] = useState<Partial<CityImageData>>({
    title: '',
    description: '',
    photographer: '',
    location: '',
    tags: []
  })

  const handleAddImage = () => {
    if (newImage.url && newImage.title) {
      const image: CityImageData = {
        id: `new-${Date.now()}`,
        url: newImage.url,
        title: newImage.title,
        description: newImage.description || '',
        photographer: newImage.photographer || 'User',
        location: newImage.location || 'Unknown',
        likes: 0,
        isUserUploaded: true,
        tags: newImage.tags || [],
        source: 'user'
      }
      
      onImagesUpdate([...images, image])
      setNewImage({
        title: '',
        description: '',
        photographer: '',
        location: '',
        tags: []
      })
    }
  }

  const handleEditImage = (image: CityImageData) => {
    setEditingImage(image)
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    if (editingImage) {
      const updatedImages = images.map(img => 
        img.id === editingImage.id ? editingImage : img
      )
      onImagesUpdate(updatedImages)
      setIsEditing(false)
      setEditingImage(null)
    }
  }

  const handleDeleteImage = (imageId: string) => {
    const updatedImages = images.filter(img => img.id !== imageId)
    onImagesUpdate(updatedImages)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {cityName} Images
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage images for {cityName}, {country}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {images.length} images
          </span>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Add Image
          </button>
        </div>
      </div>

      {/* Add New Image Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Add New Image
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Image URL
            </label>
            <input
              type="url"
              value={newImage.url || ''}
              onChange={(e) => setNewImage({ ...newImage, url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={newImage.title || ''}
              onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Image title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={newImage.description || ''}
              onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="Image description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location
            </label>
            <input
              type="text"
              value={newImage.location || ''}
              onChange={(e) => setNewImage({ ...newImage, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Location in city"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleAddImage}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Image
          </button>
        </div>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <div key={image.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative">
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex space-x-1">
                <button
                  onClick={() => handleEditImage(image)}
                  className="p-1 bg-white/80 dark:bg-gray-800/80 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors"
                >
                  <Edit className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => handleDeleteImage(image.id)}
                  className="p-1 bg-white/80 dark:bg-gray-800/80 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {image.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {image.description}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{image.location}</span>
                <span>{image.likes} likes</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {isEditing && editingImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Edit Image
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editingImage.title}
                  onChange={(e) => setEditingImage({ ...editingImage, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={editingImage.description}
                  onChange={(e) => setEditingImage({ ...editingImage, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Photographer
                  </label>
                  <input
                    type="text"
                    value={editingImage.photographer}
                    onChange={(e) => setEditingImage({ ...editingImage, photographer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editingImage.location}
                    onChange={(e) => setEditingImage({ ...editingImage, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CityImagesAdminPage() {
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [cityImages, setCityImages] = useState<CityImageData[]>([])
  const [availableCities] = useState(CityImageService.getAvailableCities())

  const handleCitySelect = (citySlug: string) => {
    setSelectedCity(citySlug)
    // Generate sample images for the selected city
    const images = CityImageService.generateCityImages({
      cityName: citySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      country: 'Sample Country'
    })
    setCityImages(images)
  }

  const handleImagesUpdate = (images: CityImageData[]) => {
    setCityImages(images)
    // Here you would typically save to your database
    console.log('Updated images:', images)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            City Images Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and curate images for different cities
          </p>
        </div>

        {/* City Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Select City
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {availableCities.map((city) => (
              <button
                key={city}
                onClick={() => handleCitySelect(city)}
                className={`p-3 rounded-lg border transition-colors ${
                  selectedCity === city
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                }`}
              >
                {city.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* City Image Manager */}
        {selectedCity && (
          <CityImageManager
            cityName={selectedCity.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            country="Sample Country"
            images={cityImages}
            onImagesUpdate={handleImagesUpdate}
          />
        )}
      </div>
    </div>
  )
}
