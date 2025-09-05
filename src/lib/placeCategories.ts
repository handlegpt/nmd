export interface PlaceCategory {
  id: string
  name: string
  icon: string
  color: string
  description: string
  translationKey: string
}

export const PLACE_CATEGORIES: PlaceCategory[] = [
  {
    id: 'cafe',
    name: 'Cafe',
    icon: '☕',
    color: 'bg-orange-100 text-orange-700',
    description: 'Work-friendly cafes',
    translationKey: 'home.placeCategories.cafe'
  },
  {
    id: 'coworking',
    name: 'Coworking',
    icon: '💻',
    color: 'bg-blue-100 text-blue-700',
    description: 'Professional coworking spaces',
    translationKey: 'home.placeCategories.coworking'
  },
  {
    id: 'coliving',
    name: 'Coliving',
    icon: '🏠',
    color: 'bg-green-100 text-green-700',
    description: 'Digital nomad accommodation',
    translationKey: 'home.placeCategories.coliving'
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    icon: '🍽',
    color: 'bg-red-100 text-red-700',
    description: 'Food and dining',
    translationKey: 'home.placeCategories.restaurant'
  },
  {
    id: 'hospital',
    name: 'Hospital',
    icon: '🏥',
    color: 'bg-red-100 text-red-700',
    description: 'Medical facilities',
    translationKey: 'home.placeCategories.hospital'
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy',
    icon: '💊',
    color: 'bg-green-100 text-green-700',
    description: 'Pharmacies and clinics',
    translationKey: 'home.placeCategories.pharmacy'
  },
  {
    id: 'hotel',
    name: 'Hotel',
    icon: '🏨',
    color: 'bg-purple-100 text-purple-700',
    description: 'Hotels and hostels',
    translationKey: 'home.placeCategories.hotel'
  },
  {
    id: 'transport',
    name: 'Transport',
    icon: '🚇',
    color: 'bg-yellow-100 text-yellow-700',
    description: 'Public transport stations',
    translationKey: 'home.placeCategories.transport'
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: '🛒',
    color: 'bg-pink-100 text-pink-700',
    description: 'Supermarkets and malls',
    translationKey: 'home.placeCategories.shopping'
  },
  {
    id: 'bank',
    name: 'Bank',
    icon: '🏦',
    color: 'bg-gray-100 text-gray-700',
    description: 'Banking and financial services',
    translationKey: 'home.placeCategories.bank'
  },
  {
    id: 'park',
    name: 'Park',
    icon: '🌳',
    color: 'bg-green-100 text-green-700',
    description: 'Parks and recreational areas',
    translationKey: 'home.placeCategories.park'
  },
  {
    id: 'library',
    name: 'Library',
    icon: '📚',
    color: 'bg-indigo-100 text-indigo-700',
    description: 'Libraries and study spaces',
    translationKey: 'home.placeCategories.library'
  },
  {
    id: 'other',
    name: 'Other',
    icon: '📍',
    color: 'bg-gray-100 text-gray-700',
    description: 'Other places',
    translationKey: 'home.placeCategories.other'
  }
]

export const getCategoryById = (id: string): PlaceCategory => {
  return PLACE_CATEGORIES.find(cat => cat.id === id) || PLACE_CATEGORIES[PLACE_CATEGORIES.length - 1]
}

export const getCategoryIcon = (categoryId: string): string => {
  return getCategoryById(categoryId).icon
}

export const getCategoryName = (categoryId: string, t?: (key: string) => string): string => {
  const category = getCategoryById(categoryId)
  
  // 如果有翻译函数，使用翻译键；否则使用默认名称
  if (t && category.translationKey) {
    return t(category.translationKey)
  }
  
  return category.name
}

export const getCategoryColor = (categoryId: string): string => {
  return getCategoryById(categoryId).color
}
