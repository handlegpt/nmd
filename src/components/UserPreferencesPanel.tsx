'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, 
  Wifi, 
  DollarSign, 
  Sun, 
  Users, 
  FileText,
  Save,
  RotateCcw,
  Sliders,
  Target,
  Globe,
  Clock,
  Bell,
  Palette
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { userDataService, UserPreferences } from '@/lib/userDataService'
import { useUser } from '@/contexts/GlobalStateContext'

interface ExtendedUserPreferences extends UserPreferences {
  // 新增偏好设置
  timezone: string
  language: string
  theme: 'light' | 'dark' | 'auto'
  notifications: {
    email: boolean
    push: boolean
    cityUpdates: boolean
    visaReminders: boolean
    meetupInvites: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private'
    showLocation: boolean
    showOnlineStatus: boolean
  }
  travel: {
    preferredTransport: 'walking' | 'cycling' | 'public' | 'car'
    budgetRange: 'budget' | 'moderate' | 'luxury'
    accommodationType: 'hostel' | 'hotel' | 'apartment' | 'any'
  }
}

const defaultPreferences: ExtendedUserPreferences = {
  wifi: 20,
  cost: 25,
  climate: 20,
  social: 15,
  visa: 20,
  timezone: 'UTC',
  language: 'en',
  theme: 'auto',
  notifications: {
    email: true,
    push: true,
    cityUpdates: true,
    visaReminders: true,
    meetupInvites: true
  },
  privacy: {
    profileVisibility: 'public',
    showLocation: true,
    showOnlineStatus: true
  },
  travel: {
    preferredTransport: 'public',
    budgetRange: 'moderate',
    accommodationType: 'any'
  }
}

export default function UserPreferencesPanel() {
  const { t } = useTranslation()
  const { user } = useUser()
  const [preferences, setPreferences] = useState<ExtendedUserPreferences>(defaultPreferences)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    try {
      setLoading(true)
      const userPrefs = await userDataService.getUserPreferences()
      if (userPrefs) {
        setPreferences(prev => ({
          ...prev,
          ...userPrefs
        }))
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    try {
      setSaving(true)
      const success = await userDataService.saveUserPreferences({
        wifi: preferences.wifi,
        cost: preferences.cost,
        climate: preferences.climate,
        social: preferences.social,
        visa: preferences.visa
      })
      
      if (success) {
        // 这里可以添加成功通知
        console.log('Preferences saved successfully')
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setSaving(false)
    }
  }

  const handlePreferenceChange = (key: keyof UserPreferences, value: number) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleExtendedPreferenceChange = (category: string, key: string, value: any) => {
    setPreferences(prev => {
      const updatedPreferences = { ...prev }
      
      if (category === 'notifications') {
        updatedPreferences.notifications = {
          ...prev.notifications,
          [key]: value
        }
      } else if (category === 'privacy') {
        updatedPreferences.privacy = {
          ...prev.privacy,
          [key]: value
        }
      } else if (category === 'travel') {
        updatedPreferences.travel = {
          ...prev.travel,
          [key]: value
        }
      }
      
      return updatedPreferences
    })
  }

  const resetToDefaults = () => {
    setPreferences(defaultPreferences)
  }

  const tabs = [
    { id: 'basic', label: t('preferences.basic'), icon: Sliders },
    { id: 'notifications', label: t('preferences.notificationsTab'), icon: Bell },
    { id: 'privacy', label: t('preferences.privacyTab'), icon: Target },
    { id: 'travel', label: t('preferences.travelTab'), icon: Globe },
    { id: 'appearance', label: t('preferences.appearanceTab'), icon: Palette }
  ]

  const renderBasicPreferences = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WiFi Quality */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-blue-500" />
            <label className="font-medium">{t('preferences.wifiQuality')}</label>
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={preferences.wifi}
              onChange={(e) => handlePreferenceChange('wifi', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t('preferences.low')}</span>
              <span>{preferences.wifi}%</span>
              <span>{t('preferences.high')}</span>
            </div>
          </div>
        </div>

        {/* Cost of Living */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <label className="font-medium">{t('preferences.costOfLiving')}</label>
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={preferences.cost}
              onChange={(e) => handlePreferenceChange('cost', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t('preferences.expensive')}</span>
              <span>{preferences.cost}%</span>
              <span>{t('preferences.cheap')}</span>
            </div>
          </div>
        </div>

        {/* Climate Comfort */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-yellow-500" />
            <label className="font-medium">{t('preferences.climateComfort')}</label>
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={preferences.climate}
              onChange={(e) => handlePreferenceChange('climate', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t('preferences.cold')}</span>
              <span>{preferences.climate}%</span>
              <span>{t('preferences.hot')}</span>
            </div>
          </div>
        </div>

        {/* Social Atmosphere */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            <label className="font-medium">{t('preferences.socialAtmosphere')}</label>
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={preferences.social}
              onChange={(e) => handlePreferenceChange('social', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t('preferences.quiet')}</span>
              <span>{preferences.social}%</span>
              <span>{t('preferences.social')}</span>
            </div>
          </div>
        </div>

        {/* Visa Convenience */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-500" />
            <label className="font-medium">{t('preferences.visaConvenience')}</label>
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={preferences.visa}
              onChange={(e) => handlePreferenceChange('visa', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t('preferences.complex')}</span>
              <span>{preferences.visa}%</span>
              <span>{t('preferences.easy')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotificationsPreferences = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(preferences.notifications).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-blue-500" />
              <span className="font-medium">{t(`preferences.notifications.${key}`)}</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handleExtendedPreferenceChange('notifications', key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  )

  const renderPrivacyPreferences = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-3">
          <label className="font-medium">{t('preferences.privacy.profileVisibility')}</label>
          <select
            value={preferences.privacy.profileVisibility}
            onChange={(e) => handleExtendedPreferenceChange('privacy', 'profileVisibility', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="public">{t('preferences.privacy.public')}</option>
            <option value="friends">{t('preferences.privacy.friends')}</option>
            <option value="private">{t('preferences.privacy.private')}</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-green-500" />
            <span className="font-medium">{t('preferences.privacy.showLocation')}</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.privacy.showLocation}
              onChange={(e) => handleExtendedPreferenceChange('privacy', 'showLocation', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-purple-500" />
            <span className="font-medium">{t('preferences.privacy.showOnlineStatus')}</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.privacy.showOnlineStatus}
              onChange={(e) => handleExtendedPreferenceChange('privacy', 'showOnlineStatus', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  )

  const renderTravelPreferences = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="font-medium">{t('preferences.travel.preferredTransport')}</label>
          <select
            value={preferences.travel.preferredTransport}
            onChange={(e) => handleExtendedPreferenceChange('travel', 'preferredTransport', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="walking">{t('preferences.travel.walking')}</option>
            <option value="cycling">{t('preferences.travel.cycling')}</option>
            <option value="public">{t('preferences.travel.public')}</option>
            <option value="car">{t('preferences.travel.car')}</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className="font-medium">{t('preferences.travel.budgetRange')}</label>
          <select
            value={preferences.travel.budgetRange}
            onChange={(e) => handleExtendedPreferenceChange('travel', 'budgetRange', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="budget">{t('preferences.travel.budget')}</option>
            <option value="moderate">{t('preferences.travel.moderate')}</option>
            <option value="luxury">{t('preferences.travel.luxury')}</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className="font-medium">{t('preferences.travel.accommodationType')}</label>
          <select
            value={preferences.travel.accommodationType}
            onChange={(e) => handleExtendedPreferenceChange('travel', 'accommodationType', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="hostel">{t('preferences.travel.hostel')}</option>
            <option value="hotel">{t('preferences.travel.hotel')}</option>
            <option value="apartment">{t('preferences.travel.apartment')}</option>
            <option value="any">{t('preferences.travel.any')}</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderAppearancePreferences = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="font-medium">{t('preferences.appearance.theme')}</label>
          <select
            value={preferences.theme}
            onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' | 'auto' }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="light">{t('preferences.appearance.light')}</option>
            <option value="dark">{t('preferences.appearance.dark')}</option>
            <option value="auto">{t('preferences.appearance.auto')}</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className="font-medium">{t('preferences.appearance.language')}</label>
          <select
            value={preferences.language}
            onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="en">English</option>
            <option value="zh">中文</option>
            <option value="es">Español</option>
            <option value="ja">日本語</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className="font-medium">{t('preferences.appearance.timezone')}</label>
          <select
            value={preferences.timezone}
            onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="UTC">UTC</option>
            <option value="Asia/Shanghai">Asia/Shanghai</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
            <option value="Asia/Tokyo">Asia/Tokyo</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return renderBasicPreferences()
      case 'notifications':
        return renderNotificationsPreferences()
      case 'privacy':
        return renderPrivacyPreferences()
      case 'travel':
        return renderTravelPreferences()
      case 'appearance':
        return renderAppearancePreferences()
      default:
        return renderBasicPreferences()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold">{t('preferences.title')}</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            {t('preferences.reset')}
          </button>
          <button
            onClick={savePreferences}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? t('preferences.saving') : t('preferences.save')}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  )
}
