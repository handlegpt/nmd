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
    name: '咖啡店',
    icon: '☕',
    color: 'bg-orange-100 text-orange-700',
    description: '适合工作的咖啡店',
    translationKey: 'home.placeCategories.cafe'
  },
  {
    id: 'coworking',
    name: '联合办公',
    icon: '💻',
    color: 'bg-blue-100 text-blue-700',
    description: '专业的联合办公空间',
    translationKey: 'home.placeCategories.coworking'
  },
  {
    id: 'coliving',
    name: '共居空间',
    icon: '🏠',
    color: 'bg-green-100 text-green-700',
    description: '数字游民住宿',
    translationKey: 'home.placeCategories.coliving'
  },
  {
    id: 'restaurant',
    name: '餐厅',
    icon: '🍽',
    color: 'bg-red-100 text-red-700',
    description: '美食餐厅',
    translationKey: 'home.placeCategories.restaurant'
  },
  {
    id: 'hospital',
    name: '医院',
    icon: '🏥',
    color: 'bg-red-100 text-red-700',
    description: '医疗设施',
    translationKey: 'home.placeCategories.hospital'
  },
  {
    id: 'pharmacy',
    name: '药店',
    icon: '💊',
    color: 'bg-green-100 text-green-700',
    description: '药店和诊所',
    translationKey: 'home.placeCategories.pharmacy'
  },
  {
    id: 'hotel',
    name: '酒店',
    icon: '🏨',
    color: 'bg-purple-100 text-purple-700',
    description: '酒店和旅馆',
    translationKey: 'home.placeCategories.hotel'
  },
  {
    id: 'transport',
    name: '交通',
    icon: '🚇',
    color: 'bg-yellow-100 text-yellow-700',
    description: '公交、地铁站',
    translationKey: 'home.placeCategories.transport'
  },
  {
    id: 'shopping',
    name: '购物',
    icon: '🛒',
    color: 'bg-pink-100 text-pink-700',
    description: '超市、商场',
    translationKey: 'home.placeCategories.shopping'
  },
  {
    id: 'bank',
    name: '银行',
    icon: '🏦',
    color: 'bg-gray-100 text-gray-700',
    description: '银行和金融服务',
    translationKey: 'home.placeCategories.bank'
  },
  {
    id: 'park',
    name: '公园',
    icon: '🌳',
    color: 'bg-green-100 text-green-700',
    description: '公园和休闲场所',
    translationKey: 'home.placeCategories.park'
  },
  {
    id: 'library',
    name: '图书馆',
    icon: '📚',
    color: 'bg-indigo-100 text-indigo-700',
    description: '图书馆和学习空间',
    translationKey: 'home.placeCategories.library'
  },
  {
    id: 'other',
    name: '其他',
    icon: '📍',
    color: 'bg-gray-100 text-gray-700',
    description: '其他场所',
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
