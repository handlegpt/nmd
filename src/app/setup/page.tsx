'use client'

import { useState } from 'react'
import { 
  UserIcon, MapPinIcon, GlobeIcon, BellIcon, 
  ShieldIcon, PaletteIcon, SaveIcon 
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

interface UserSettings {
  profile: {
    name: string
    email: string
    avatar: string
    currentLocation: string
    timezone: string
  }
  preferences: {
    language: string
    theme: 'light' | 'dark' | 'auto'
    notifications: {
      visaReminders: boolean
      cityRecommendations: boolean
      weeklyDigest: boolean
      emailUpdates: boolean
    }
  }
  visa: {
    currentCountry: string
    visaType: string
    expiryDate: string
    passportCountry: string
  }
}

export default function SetupPage() {
  const { t, locale, changeLocale } = useTranslation()
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'visa'>('profile')
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      name: '',
      email: '',
      avatar: '',
      currentLocation: '',
      timezone: 'Asia/Tokyo'
    },
    preferences: {
      language: locale,
      theme: 'light',
      notifications: {
        visaReminders: true,
        cityRecommendations: true,
        weeklyDigest: false,
        emailUpdates: true
      }
    },
    visa: {
      currentCountry: '',
      visaType: '',
      expiryDate: '',
      passportCountry: ''
    }
  })

  const handleSave = async () => {
    setSaving(true)
    
    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Save to local storage
    localStorage.setItem('userSettings', JSON.stringify(settings))
    
    // Update language settings
    if (settings.preferences.language !== locale) {
      changeLocale(settings.preferences.language as any)
    }
    
    setSaving(false)
    
    // Show success message
    alert(t('setup.settingsSaved'))
  }

  const updateSettings = (section: keyof UserSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }))
  }

  const updateNestedSettings = (section: keyof UserSettings, subsection: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [subsection]: {
          ...((prev[section] as any)[subsection] as any),
          [field]: value
        }
      }
    }))
  }

  const TabButton = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        activeTab === id
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Personal Settings</h1>
        <p className="text-gray-600">Configure your personal information and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-8">
        <TabButton id="profile" label="Profile" icon={UserIcon} />
        <TabButton id="preferences" label="Preferences" icon={PaletteIcon} />
        <TabButton id="visa" label="Visa Info" icon={ShieldIcon} />
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={settings.profile.name}
                  onChange={(e) => updateSettings('profile', 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) => updateSettings('profile', 'email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Location
                </label>
                <input
                  type="text"
                  value={settings.profile.currentLocation}
                  onChange={(e) => updateSettings('profile', 'currentLocation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Osaka, Japan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={settings.profile.timezone}
                  onChange={(e) => updateSettings('profile', 'timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
                  <option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</option>
                  <option value="Europe/London">Europe/London (UTC+0)</option>
                  <option value="America/New_York">America/New_York (UTC-5)</option>
                  <option value="Europe/Lisbon">Europe/Lisbon (UTC+0)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={settings.preferences.language}
                  onChange={(e) => updateSettings('preferences', 'language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="zh">中文</option>
                  <option value="es">Español</option>
                  <option value="ja">日本語</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <select
                  value={settings.preferences.theme}
                  onChange={(e) => updateSettings('preferences', 'theme', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <BellIcon className="h-5 w-5 mr-2" />
                Notification Settings
              </h3>
              
              <div className="space-y-4">
                {[
                  { key: 'visaReminders', label: 'Visa Expiry Reminders' },
                  { key: 'cityRecommendations', label: 'City Recommendations' },
                  { key: 'weeklyDigest', label: 'Weekly Digest' },
                  { key: 'emailUpdates', label: 'Email Updates' }
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.preferences.notifications[key as keyof typeof settings.preferences.notifications]}
                      onChange={(e) => updateNestedSettings('preferences', 'notifications', key, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Visa Tab */}
        {activeTab === 'visa' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Visa Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passport Country
                </label>
                <select
                  value={settings.visa.passportCountry}
                  onChange={(e) => updateSettings('visa', 'passportCountry', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Country</option>
                  <option value="CN">China</option>
                  <option value="US">United States</option>
                  <option value="JP">Japan</option>
                  <option value="KR">South Korea</option>
                  <option value="SG">Singapore</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Country
                </label>
                <select
                  value={settings.visa.currentCountry}
                  onChange={(e) => updateSettings('visa', 'currentCountry', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Country</option>
                  <option value="JP">Japan</option>
                  <option value="TH">Thailand</option>
                  <option value="PT">Portugal</option>
                  <option value="ES">Spain</option>
                  <option value="MX">Mexico</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visa Type
                </label>
                <select
                  value={settings.visa.visaType}
                  onChange={(e) => updateSettings('visa', 'visaType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Visa Type</option>
                  <option value="tourist">Tourist Visa</option>
                  <option value="business">Business Visa</option>
                  <option value="student">Student Visa</option>
                  <option value="work">Work Visa</option>
                  <option value="digital_nomad">Digital Nomad Visa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={settings.visa.expiryDate}
                  onChange={(e) => updateSettings('visa', 'expiryDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {settings.visa.expiryDate && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Visa Status</h4>
                <p className="text-blue-700">
                  Days until visa expiry: {Math.ceil((new Date(settings.visa.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Save Button */}
        <div className="border-t border-gray-200 pt-6 mt-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <SaveIcon className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
