'use client'

import { useState, useEffect } from 'react'
import { 
  UserIcon, MapPinIcon, GlobeIcon, BellIcon, 
  ShieldIcon, PaletteIcon, SaveIcon, CheckIcon,
  UploadIcon, DownloadIcon, SettingsIcon, 
  CalendarIcon, CreditCardIcon, WifiIcon,
  TrendingUpIcon, TargetIcon, ZapIcon
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

interface UserSettings {
  profile: {
    name: string
    email: string
    avatar: string
    currentLocation: string
    timezone: string
    bio: string
    profession: string
    skills: string[]
    interests: string[]
  }
  preferences: {
    language: string
    theme: 'light' | 'dark' | 'auto'
    currency: string
    units: 'metric' | 'imperial'
    notifications: {
      visaReminders: boolean
      cityRecommendations: boolean
      weeklyDigest: boolean
      emailUpdates: boolean
      priceAlerts: boolean
      weatherUpdates: boolean
    }
  }
  visa: {
    currentCountry: string
    visaType: string
    expiryDate: string
    passportCountry: string
    multipleEntries: boolean
    workPermit: boolean
  }
  travel: {
    budget: {
      min: number
      max: number
      currency: string
    }
    preferences: {
      climate: string[]
      activities: string[]
      accommodation: string[]
      transport: string[]
    }
    experience: {
      countriesVisited: number
      yearsNomading: number
      preferredStayDuration: string
    }
  }
  privacy: {
    showLocation: boolean
    showTravelHistory: boolean
    allowDataCollection: boolean
    marketingEmails: boolean
  }
}

export default function SetupPage() {
  const { t, locale, changeLocale } = useTranslation()
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'visa' | 'travel' | 'privacy'>('profile')
  const [saving, setSaving] = useState(false)
  const [autoSave, setAutoSave] = useState(false)
  const [completionProgress, setCompletionProgress] = useState(0)
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      name: '',
      email: '',
      avatar: '',
      currentLocation: '',
      timezone: 'Asia/Tokyo',
      bio: '',
      profession: '',
      skills: [],
      interests: []
    },
    preferences: {
      language: locale,
      theme: 'light',
      currency: 'USD',
      units: 'metric',
      notifications: {
        visaReminders: true,
        cityRecommendations: true,
        weeklyDigest: false,
        emailUpdates: true,
        priceAlerts: false,
        weatherUpdates: true
      }
    },
    visa: {
      currentCountry: '',
      visaType: '',
      expiryDate: '',
      passportCountry: '',
      multipleEntries: false,
      workPermit: false
    },
    travel: {
      budget: {
        min: 1000,
        max: 5000,
        currency: 'USD'
      },
      preferences: {
        climate: [],
        activities: [],
        accommodation: [],
        transport: []
      },
      experience: {
        countriesVisited: 0,
        yearsNomading: 0,
        preferredStayDuration: '1-3 months'
      }
    },
    privacy: {
      showLocation: true,
      showTravelHistory: false,
      allowDataCollection: true,
      marketingEmails: false
    }
  })

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
      } catch (error) {
        console.error('Failed to parse saved settings:', error)
      }
    }
  }, [])

  // Calculate completion progress
  useEffect(() => {
    let completed = 0
    let total = 0

    // Profile completion
    total += 5
    if (settings.profile.name) completed++
    if (settings.profile.email) completed++
    if (settings.profile.currentLocation) completed++
    if (settings.profile.timezone) completed++
    if (settings.profile.profession) completed++

    // Visa completion
    total += 4
    if (settings.visa.passportCountry) completed++
    if (settings.visa.currentCountry) completed++
    if (settings.visa.visaType) completed++
    if (settings.visa.expiryDate) completed++

    // Travel preferences
    total += 3
    if (settings.travel.budget.min > 0) completed++
    if (settings.travel.preferences.climate.length > 0) completed++
    if (settings.travel.experience.yearsNomading > 0) completed++

    setCompletionProgress(Math.round((completed / total) * 100))
  }, [settings])

  // Auto-save functionality
  useEffect(() => {
    if (autoSave) {
      const timer = setTimeout(() => {
        handleSave()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [settings, autoSave])

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

  const handleExport = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'nomad-settings.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string)
          setSettings(imported)
        } catch (error) {
          alert('Invalid file format')
        }
      }
      reader.readAsText(file)
    }
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

  const TabButton = ({ id, label, icon: Icon, completed }: { id: string, label: string, icon: any, completed?: boolean }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
        activeTab === id
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
      {completed && (
        <CheckIcon className="h-3 w-3 text-green-600 ml-1" />
      )}
    </button>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('setup.title')}</h1>
            <p className="text-gray-600">{t('setup.subtitle')}</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Progress Bar */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{t('setup.profileCompletion')}:</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionProgress}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900">{completionProgress}%</span>
            </div>
            
            {/* Auto-save Toggle */}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">{t('setup.autoSave')}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        <TabButton 
          id="profile" 
          label={t('setup.tabs.profile')} 
          icon={UserIcon} 
          completed={!!(settings.profile.name && settings.profile.email && settings.profile.currentLocation)}
        />
        <TabButton 
          id="preferences" 
          label={t('setup.tabs.preferences')} 
          icon={PaletteIcon}
          completed={!!(settings.preferences.language && settings.preferences.theme)}
        />
        <TabButton 
          id="visa" 
          label={t('setup.tabs.visa')} 
          icon={ShieldIcon}
          completed={!!(settings.visa.passportCountry && settings.visa.currentCountry && settings.visa.visaType)}
        />
        <TabButton 
          id="travel" 
          label={t('setup.tabs.travel')} 
          icon={MapPinIcon}
          completed={!!(settings.travel.budget.min > 0 && settings.travel.preferences.climate.length > 0)}
        />
        <TabButton 
          id="privacy" 
          label={t('setup.tabs.privacy')} 
          icon={SettingsIcon}
        />
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              {t('setup.profile.title')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('setup.profile.name')} *
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
                  {t('setup.profile.email')} *
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
                  {t('setup.profile.currentLocation')} *
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
                  {t('setup.profile.timezone')}
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
                  <option value="Asia/Bangkok">Asia/Bangkok (UTC+7)</option>
                  <option value="Europe/Berlin">Europe/Berlin (UTC+1)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (UTC-8)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profession
                </label>
                <input
                  type="text"
                  value={settings.profile.profession}
                  onChange={(e) => updateSettings('profile', 'profession', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Software Developer, Designer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={settings.profile.bio}
                  onChange={(e) => updateSettings('profile', 'bio', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            {/* Skills and Interests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills
                </label>
                <input
                  type="text"
                  value={settings.profile.skills.join(', ')}
                  onChange={(e) => updateSettings('profile', 'skills', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="JavaScript, React, Design, Marketing"
                />
                <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interests
                </label>
                <input
                  type="text"
                  value={settings.profile.interests.join(', ')}
                  onChange={(e) => updateSettings('profile', 'interests', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Photography, Hiking, Coffee, Technology"
                />
                <p className="text-xs text-gray-500 mt-1">Separate interests with commas</p>
              </div>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <PaletteIcon className="h-5 w-5 mr-2" />
              Preferences & Settings
            </h2>
            
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
                  <option value="en">English</option>
                  <option value="zh">中文</option>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={settings.preferences.currency}
                  onChange={(e) => updateSettings('preferences', 'currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CNY">CNY (¥)</option>
                  <option value="THB">THB (฿)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Units
                </label>
                <select
                  value={settings.preferences.units}
                  onChange={(e) => updateSettings('preferences', 'units', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="metric">Metric (Celsius, km)</option>
                  <option value="imperial">Imperial (Fahrenheit, miles)</option>
                </select>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <BellIcon className="h-5 w-5 mr-2" />
                Notification Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'visaReminders', label: 'Visa Expiry Reminders', icon: CalendarIcon },
                  { key: 'cityRecommendations', label: 'City Recommendations', icon: MapPinIcon },
                  { key: 'weeklyDigest', label: 'Weekly Digest', icon: TrendingUpIcon },
                  { key: 'emailUpdates', label: 'Email Updates', icon: GlobeIcon },
                  { key: 'priceAlerts', label: 'Price Alerts', icon: CreditCardIcon },
                  { key: 'weatherUpdates', label: 'Weather Updates', icon: WifiIcon }
                ].map(({ key, label, icon: Icon }) => (
                  <label key={key} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={settings.preferences.notifications[key as keyof typeof settings.preferences.notifications]}
                      onChange={(e) => updateNestedSettings('preferences', 'notifications', key, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Icon className="h-4 w-4 text-gray-500" />
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
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <ShieldIcon className="h-5 w-5 mr-2" />
              Visa & Immigration Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passport Country *
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
                  <option value="TH">Thailand</option>
                  <option value="MY">Malaysia</option>
                  <option value="ID">Indonesia</option>
                  <option value="PH">Philippines</option>
                  <option value="VN">Vietnam</option>
                  <option value="IN">India</option>
                  <option value="GB">United Kingdom</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="ES">Spain</option>
                  <option value="IT">Italy</option>
                  <option value="PT">Portugal</option>
                  <option value="NL">Netherlands</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="NZ">New Zealand</option>
                  <option value="BR">Brazil</option>
                  <option value="MX">Mexico</option>
                  <option value="AR">Argentina</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Country *
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
                  <option value="MY">Malaysia</option>
                  <option value="ID">Indonesia</option>
                  <option value="PH">Philippines</option>
                  <option value="VN">Vietnam</option>
                  <option value="SG">Singapore</option>
                  <option value="KR">South Korea</option>
                  <option value="CN">China</option>
                  <option value="IN">India</option>
                  <option value="GB">United Kingdom</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="IT">Italy</option>
                  <option value="NL">Netherlands</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="NZ">New Zealand</option>
                  <option value="BR">Brazil</option>
                  <option value="AR">Argentina</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visa Type *
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
                  <option value="retirement">Retirement Visa</option>
                  <option value="investment">Investment Visa</option>
                  <option value="family">Family Visa</option>
                  <option value="transit">Transit Visa</option>
                  <option value="visa_free">Visa-Free Entry</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  value={settings.visa.expiryDate}
                  onChange={(e) => updateSettings('visa', 'expiryDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Additional Visa Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="multipleEntries"
                  checked={settings.visa.multipleEntries}
                  onChange={(e) => updateSettings('visa', 'multipleEntries', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="multipleEntries" className="text-sm text-gray-700">
                  Multiple Entry Visa
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="workPermit"
                  checked={settings.visa.workPermit}
                  onChange={(e) => updateSettings('visa', 'workPermit', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="workPermit" className="text-sm text-gray-700">
                  Work Permit Included
                </label>
              </div>
            </div>

            {settings.visa.expiryDate && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Visa Status
                </h4>
                <p className="text-blue-700">
                  Days until visa expiry: {Math.ceil((new Date(settings.visa.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                </p>
                {Math.ceil((new Date(settings.visa.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) < 30 && (
                  <p className="text-red-600 text-sm mt-2 font-medium">
                    ⚠️ Your visa expires soon! Consider renewing or extending it.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Travel Tab */}
        {activeTab === 'travel' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2" />
              Travel Preferences & Budget
            </h2>
            
            {/* Budget Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CreditCardIcon className="h-5 w-5 mr-2" />
                Budget Range
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Budget (per month)
                  </label>
                  <input
                    type="number"
                    value={settings.travel.budget.min}
                    onChange={(e) => updateNestedSettings('travel', 'budget', 'min', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Budget (per month)
                  </label>
                  <input
                    type="number"
                    value={settings.travel.budget.max}
                    onChange={(e) => updateNestedSettings('travel', 'budget', 'max', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={settings.travel.budget.currency}
                    onChange={(e) => updateNestedSettings('travel', 'budget', 'currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="THB">THB (฿)</option>
                    <option value="CNY">CNY (¥)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Travel Experience */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Countries Visited
                </label>
                <input
                  type="number"
                  value={settings.travel.experience.countriesVisited}
                  onChange={(e) => updateNestedSettings('travel', 'experience', 'countriesVisited', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years Nomading
                </label>
                <input
                  type="number"
                  value={settings.travel.experience.yearsNomading}
                  onChange={(e) => updateNestedSettings('travel', 'experience', 'yearsNomading', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Stay Duration
                </label>
                <select
                  value={settings.travel.experience.preferredStayDuration}
                  onChange={(e) => updateNestedSettings('travel', 'experience', 'preferredStayDuration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="1-2 weeks">1-2 weeks</option>
                  <option value="1-3 months">1-3 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="6-12 months">6-12 months</option>
                  <option value="1+ years">1+ years</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <SettingsIcon className="h-5 w-5 mr-2" />
              Privacy & Data Settings
            </h2>
            
            <div className="space-y-4">
              {[
                { key: 'showLocation', label: 'Show my current location to other users', description: 'Allow other nomads to see your current city' },
                { key: 'showTravelHistory', label: 'Show my travel history', description: 'Display your visited cities and countries' },
                { key: 'allowDataCollection', label: 'Allow data collection for recommendations', description: 'Help improve our recommendations by sharing usage data' },
                { key: 'marketingEmails', label: 'Receive marketing emails', description: 'Get updates about new features and promotions' }
              ].map(({ key, label, description }) => (
                <div key={key} className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200">
                  <input
                    type="checkbox"
                    checked={settings.privacy[key as keyof typeof settings.privacy]}
                    onChange={(e) => updateSettings('privacy', key, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                  />
                  <div>
                    <label className="text-sm font-medium text-gray-700">{label}</label>
                    <p className="text-xs text-gray-500 mt-1">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="border-t border-gray-200 pt-6 mt-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <DownloadIcon className="h-4 w-4" />
                <span>{t('setup.actions.exportSettings')}</span>
              </button>
              
              <label className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                <UploadIcon className="h-4 w-4" />
                <span>{t('setup.actions.importSettings')}</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <SaveIcon className="h-4 w-4" />
              <span>{saving ? t('setup.actions.saving') : t('setup.actions.saveSettings')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
