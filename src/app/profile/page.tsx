'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { useUser } from '@/contexts/GlobalStateContext'
import MobileNavigation from '@/components/MobileNavigation'
import ThemeToggle from '@/components/ThemeToggle'
import { 
  User, 
  MapPin, 
  Briefcase, 
  Heart,
  Globe,
  Camera,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Link,
  Mail,
  Phone,
  Instagram,
  Twitter,
  Linkedin,
  Github,
  CheckCircle,
  Award,
  Star,
  ExternalLink,
  Wifi,
  WifiOff
} from 'lucide-react'

interface ProfileData {
  id: string
  name: string
  email: string
  avatar_url: string
  bio: string
  current_city: string
  profession: string
  company: string
  skills: string[]
  interests: string[]
  social_links: {
    website?: string
    instagram?: string
    twitter?: string
    linkedin?: string
    github?: string
  }
  contact: {
    phone?: string
    whatsapp?: string
  }
  travel_preferences: {
    budget_range: 'budget' | 'moderate' | 'luxury'
    preferred_climate: 'tropical' | 'temperate' | 'cold'
    travel_style: 'backpacker' | 'digital_nomad' | 'luxury_traveler'
    accommodation_type: 'hostel' | 'hotel' | 'apartment' | 'any'
  }
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  const { t } = useTranslation()
  const { user } = useUser()
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isOnline, setIsOnline] = useState(true) // 模拟在线状态
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    // 给认证检查一些时间，避免强制刷新时立即跳转
    const timer = setTimeout(() => {
      if (!user.isAuthenticated) {
        router.push('/auth/login')
        return
      }
      loadProfile()
    }, 1000)

    return () => clearTimeout(timer)
  }, [user.isAuthenticated, router])

  const loadProfile = async () => {
    try {
      setLoading(true)
      // 从用户上下文或本地存储加载用户资料
      const userProfile = user.profile
      if (!userProfile) {
        throw new Error('No user profile found')
      }

      // 从本地存储获取用户详细资料，如果没有则使用默认值
      const storedProfile = localStorage.getItem('user_profile_details')
      let profileData: ProfileData

      if (storedProfile) {
        profileData = JSON.parse(storedProfile)
      } else {
        // 创建默认资料
        profileData = {
          id: userProfile.id,
          name: userProfile.name || userProfile.email?.split('@')[0] || 'Nomad',
          email: userProfile.email || '',
          avatar_url: userProfile.avatar_url || '',
          bio: '',
          current_city: '',
          profession: '',
          company: '',
          skills: [],
          interests: [],
          social_links: {},
          contact: {},
          travel_preferences: {
            budget_range: 'moderate',
            preferred_climate: 'temperate',
            travel_style: 'digital_nomad',
            accommodation_type: 'apartment'
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        localStorage.setItem('user_profile_details', JSON.stringify(profileData))
      }

      setProfile(profileData)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!profile) return

    try {
      setSaving(true)
      // 保存到本地存储
      localStorage.setItem('user_profile_details', JSON.stringify(profile))
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsEditing(false)
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !profile) return

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    // 检查文件大小 (5MB限制)
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB')
      return
    }

    try {
      setUploadingAvatar(true)
      
      // 创建FileReader来读取文件
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (result) {
          // 更新profile中的avatar_url
          const updatedProfile = { ...profile, avatar_url: result }
          setProfile(updatedProfile)
          
          // 保存到localStorage
          localStorage.setItem('user_profile_details', JSON.stringify(updatedProfile))
          
          // 显示成功消息
          setShowSuccessMessage(true)
          setTimeout(() => setShowSuccessMessage(false), 3000)
        }
      }
      reader.readAsDataURL(file)
      
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('头像上传失败，请重试')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const calculateCompletion = () => {
    if (!profile) return { percentage: 0, missingFields: [] }
    
    const fields = [
      { key: 'name', value: profile.name, label: t('profile.name') },
      { key: 'current_city', value: profile.current_city, label: t('profile.currentCity') },
      { key: 'bio', value: profile.bio, label: t('profile.personalBio') },
      { key: 'profession', value: profile.profession, label: t('profile.profession') },
      { key: 'company', value: profile.company, label: t('profile.company') },
      { key: 'skills', value: profile.skills.length, label: t('profile.skills') },
      { key: 'interests', value: profile.interests.length, label: t('profile.interests') },
      { key: 'social_links', value: Object.values(profile.social_links).filter(Boolean).length, label: t('profile.socialLinks') },
      { key: 'contact', value: Object.values(profile.contact).filter(Boolean).length, label: t('profile.contactInfo') }
    ]
    
    const completedFields = fields.filter(field => 
      typeof field.value === 'string' ? field.value.trim() !== '' : field.value > 0
    )
    
    const missingFields = fields.filter(field => 
      typeof field.value === 'string' ? field.value.trim() === '' : field.value === 0
    ).map(f => f.label)
    
    const percentage = Math.round((completedFields.length / fields.length) * 100)
    
    return { percentage, missingFields }
  }

  const getCompletionReward = (percentage: number) => {
    if (percentage >= 90) return { badge: t('profile.badges.profileMaster'), color: 'text-yellow-600' }
    if (percentage >= 80) return { badge: t('profile.badges.profileExpert'), color: 'text-purple-600' }
    if (percentage >= 70) return { badge: t('profile.badges.profilePro'), color: 'text-blue-600' }
    if (percentage >= 60) return { badge: t('profile.badges.profileStarter'), color: 'text-green-600' }
    return { badge: t('profile.newNomad'), color: 'text-gray-600' }
  }

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'github': return <Github className="w-5 h-5" />
      case 'linkedin': return <Linkedin className="w-5 h-5" />
      case 'instagram': return <Instagram className="w-5 h-5" />
      case 'twitter': return <Twitter className="w-5 h-5" />
      case 'website': return <Globe className="w-5 h-5" />
      default: return <Link className="w-5 h-5" />
    }
  }

  const getSocialColor = (platform: string) => {
    switch (platform) {
      case 'github': return 'hover:bg-gray-800 hover:text-white'
      case 'linkedin': return 'hover:bg-blue-600 hover:text-white'
      case 'instagram': return 'hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white'
      case 'twitter': return 'hover:bg-blue-400 hover:text-white'
      case 'website': return 'hover:bg-green-600 hover:text-white'
      default: return 'hover:bg-gray-600 hover:text-white'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('profile.loadingProfile')}</p>
        </div>
      </div>
    )
  }

  const { percentage, missingFields } = calculateCompletion()
  const reward = getCompletionReward(percentage)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MobileNavigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-green-800">{t('profile.profileSaved')}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('profile.title')}</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{t('profile.subtitle')}</p>
            </div>
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {profile && (
          <div className="space-y-6">
            {/* Hero Section - 头像 + 背景 + 状态 */}
            <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl overflow-hidden">
              {/* 背景装饰 */}
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute top-4 right-4">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm`}>
                  {isOnline ? (
                    <>
                      <Wifi className="w-4 h-4" />
                      <span>Available</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4" />
                      <span>Offline</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="relative p-8 text-white">
                <div className="flex items-center space-x-6">
                  {/* 头像 */}
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                      {profile.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={profile.name}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-white" />
                      )}
                    </div>
                    {/* 在线状态指示器 */}
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${
                      isOnline ? 'bg-green-400' : 'bg-gray-400'
                    }`}></div>
                    
                    {/* 头像上传按钮 */}
                    <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                          disabled={uploadingAvatar}
                        />
                        <div className="flex flex-col items-center text-white">
                          {uploadingAvatar ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <Camera className="w-6 h-6 mb-1" />
                              <span className="text-xs">{t('profile.uploadAvatar')}</span>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  {/* 基本信息 */}
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold mb-2">{profile.name}</h2>
                    {profile.profession && (
                      <p className="text-lg text-white/90 mb-1">
                        💼 {profile.profession}
                        {profile.company && ` @ ${profile.company}`}
                      </p>
                    )}
                    {profile.current_city && (
                      <p className="text-lg text-white/90 flex items-center">
                        📍 {profile.current_city}
                      </p>
                    )}
                  </div>
                  
                  {/* 编辑按钮 */}
                  <div className="hidden lg:block">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2"
                    >
                      <Edit3 className="w-5 h-5" />
                      <span>{t('profile.editProfile')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 资料完整度激励 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t('profile.profileCompleteness')}</h3>
                  <span className={`text-lg font-medium ${reward.color}`}>{reward.badge}</span>
                </div>
                <span className="text-3xl font-bold text-blue-600">{percentage}%</span>
              </div>
              
              {/* 进度条 */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              
              {/* 激励提示 */}
              {missingFields.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Award className="w-6 h-6 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-blue-800 dark:text-blue-200 font-medium mb-2">
                        🎯 {t('profile.unlockMoreBadges')}!
                      </p>
                      <p className="text-blue-700 dark:text-blue-300 text-sm mb-2">
                        {t('profile.completeInfoToUpgrade')}:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {missingFields.map((field, index) => (
                          <span key={index} className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 个人简介 */}
            {profile.bio && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  {t('profile.personalBio')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* 技能和兴趣 */}
            {(profile.skills.length > 0 || profile.interests.length > 0) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* 技能 */}
                  {profile.skills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <Star className="w-5 h-5 mr-2 text-yellow-600" />
                        {t('profile.skills')}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, index) => (
                          <span key={index} className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 px-3 py-2 rounded-lg text-sm font-medium border border-yellow-200 dark:border-yellow-800">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* 兴趣 */}
                  {profile.interests.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <Heart className="w-5 h-5 mr-2 text-red-600" />
                        {t('profile.interests')}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest, index) => (
                          <span key={index} className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-3 py-2 rounded-lg text-sm font-medium border border-red-200 dark:border-red-800">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 社交链接 */}
            {Object.values(profile.social_links).some(Boolean) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-green-600" />
                  {t('profile.socialLinks')}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(profile.social_links).map(([platform, url]) => {
                    if (!url) return null
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 transition-all duration-200 ${getSocialColor(platform)}`}
                      >
                        {getSocialIcon(platform)}
                      </a>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 联系方式 */}
            {Object.values(profile.contact).some(Boolean) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-blue-600" />
                  {t('profile.contactInfo')}
                </h3>
                <div className="space-y-3">
                  {profile.contact.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">{profile.contact.phone}</span>
                    </div>
                  )}
                  {profile.contact.whatsapp && (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">W</span>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{profile.contact.whatsapp}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 移动端编辑按钮 */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <Edit3 className="w-5 h-5" />
                <span>{t('profile.editProfile')}</span>
              </button>
            </div>
          </div>
        )}

        {/* 编辑模式 */}
        {isEditing && profile && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t('profile.editProfile')}</h3>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* 基本信息 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('profile.name')}
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('profile.currentCity')}
                    </label>
                    <input
                      type="text"
                      value={profile.current_city}
                      onChange={(e) => setProfile({ ...profile, current_city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder={t('profile.currentCityExample')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('profile.profession')}
                    </label>
                    <input
                      type="text"
                      value={profile.profession}
                      onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder={t('profile.professionExample')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('profile.company')}
                    </label>
                    <input
                      type="text"
                      value={profile.company}
                      onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder={t('profile.companyExample')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('profile.personalBio')}
                    </label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder={t('profile.bioPlaceholder')}
                    />
                  </div>

                  {/* 技能管理 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('profile.skills')}
                    </label>
                    <div className="space-y-2">
                      {profile.skills.map((skill, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={skill}
                            onChange={(e) => {
                              const newSkills = [...profile.skills]
                              newSkills[index] = e.target.value
                              setProfile({ ...profile, skills: newSkills })
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                          <button
                            onClick={() => {
                              const newSkills = profile.skills.filter((_, i) => i !== index)
                              setProfile({ ...profile, skills: newSkills })
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => setProfile({ ...profile, skills: [...profile.skills, ''] })}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{t('profile.addSkill')}</span>
                      </button>
                    </div>
                  </div>

                  {/* 兴趣管理 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('profile.interests')}
                    </label>
                    <div className="space-y-2">
                      {profile.interests.map((interest, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={interest}
                            onChange={(e) => {
                              const newInterests = [...profile.interests]
                              newInterests[index] = e.target.value
                              setProfile({ ...profile, interests: newInterests })
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                          <button
                            onClick={() => {
                              const newInterests = profile.interests.filter((_, i) => i !== index)
                              setProfile({ ...profile, interests: newInterests })
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => setProfile({ ...profile, interests: [...profile.interests, ''] })}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{t('profile.addInterest')}</span>
                      </button>
                    </div>
                  </div>

                  {/* 社交链接 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('profile.socialLinks')}
                    </label>
                    <div className="space-y-3">
                      {Object.entries(profile.social_links).map(([platform, url]) => (
                        <div key={platform} className="flex items-center space-x-2">
                          <span className="w-20 text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {platform}:
                          </span>
                          <input
                            type="url"
                            value={url || ''}
                            onChange={(e) => setProfile({
                              ...profile,
                              social_links: {
                                ...profile.social_links,
                                [platform]: e.target.value
                              }
                            })}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder={`https://${platform}.com/username`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 联系方式 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('profile.contactInfo')}
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="w-20 text-sm text-gray-600 dark:text-gray-400">{t('profile.phone')}:</span>
                        <input
                          type="tel"
                          value={profile.contact.phone || ''}
                          onChange={(e) => setProfile({
                            ...profile,
                            contact: {
                              ...profile.contact,
                              phone: e.target.value
                            }
                          })}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="+1 234 567 8900"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-20 text-sm text-gray-600 dark:text-gray-400">WhatsApp:</span>
                        <input
                          type="tel"
                          value={profile.contact.whatsapp || ''}
                          onChange={(e) => setProfile({
                            ...profile,
                            contact: {
                              ...profile.contact,
                              whatsapp: e.target.value
                            }
                          })}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="+1 234 567 8900"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {t('profile.cancel')}
                  </button>
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{t('profile.saving')}</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{t('profile.save')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
