'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  MessageCircle, 
  Send, 
  MapPin, 
  DollarSign, 
  Clock, 
  Globe, 
  Wifi, 
  Users, 
  ChevronDown, 
  ChevronUp,
  Download,
  Share2,
  RefreshCw,
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import PageLayout from '@/components/PageLayout'
import FixedLink from '@/components/FixedLink'

// Message types for chat interface
interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  isTyping?: boolean
}

// User preferences extracted from conversation
interface UserPreferences {
  budget?: number
  region?: string
  climate?: string[]
  minStayDays?: number
  maxCities?: number
  visaDaysNeeded?: number
  wifiPriority?: 'low' | 'medium' | 'high'
  socialPreference?: 'low' | 'medium' | 'high'
  nationality?: string
  totalDuration?: number
}

// City recommendation structure
interface CityRecommendation {
  id: string
  name: string
  country: string
  region: string
  costPerMonth: number
  wifiSpeed: number
  visaFeasibility: 'easy' | 'moderate' | 'difficult'
  climate: string
  communityScore: number
  stayDays: number
  reasoning: string[]
  seasonality: string
}

// Route structure
interface RoutePlan {
  cities: CityRecommendation[]
  totalDuration: number
  totalBudget: number
  averageWifi: number
  visaNotes: string[]
}

export default function NomadAgentPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your Digital Nomad Assistant. Tell me your budget, visa days, and preferred climate, and I'll give you 3 cities + a route plan.",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferences>({})
  const [routePlan, setRoutePlan] = useState<RoutePlan | null>(null)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Quick chips for common preferences
  const quickChips = [
    { label: '$1500/month', value: 'budget:1500' },
    { label: 'Island vibes', value: 'climate:tropical,coastal' },
    { label: '90 days stay', value: 'visa:90' },
    { label: 'Asia region', value: 'region:Asia' },
    { label: 'Low taxes', value: 'tax:low' },
    { label: 'Social scene', value: 'social:high' }
  ]

  // Advanced form fields
  const [advancedForm, setAdvancedForm] = useState({
    nationality: '',
    minStayDays: 30,
    maxCities: 3,
    totalDuration: 6,
    wifiPriority: 'medium' as 'low' | 'medium' | 'high',
    socialPreference: 'medium' as 'low' | 'medium' | 'high'
  })

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle quick chip clicks
  const handleQuickChip = (chipValue: string) => {
    const [key, value] = chipValue.split(':')
    let message = ''
    
    switch (key) {
      case 'budget':
        message = `My budget is $${value} per month`
        break
      case 'climate':
        message = `I prefer ${value.replace(',', ' and ')} climate`
        break
      case 'visa':
        message = `I can stay for ${value} days`
        break
      case 'region':
        message = `I want to visit ${value}`
        break
      case 'tax':
        message = `I prefer ${value} tax burden`
        break
      case 'social':
        message = `I want ${value} social scene`
        break
    }
    
    setInputMessage(message)
  }

  // Parse user message and extract preferences
  const parseUserMessage = (message: string): Partial<UserPreferences> => {
    const newPreferences: Partial<UserPreferences> = {}
    
    // Budget parsing
    const budgetMatch = message.match(/\$?(\d+)(?:\/month|\/mo)?/i)
    if (budgetMatch) {
      newPreferences.budget = parseInt(budgetMatch[1])
    }
    
    // Visa days parsing
    const visaMatch = message.match(/(\d+)\s*days?/i)
    if (visaMatch) {
      newPreferences.visaDaysNeeded = parseInt(visaMatch[1])
    }
    
    // Region parsing
    if (message.toLowerCase().includes('asia')) newPreferences.region = 'Asia'
    if (message.toLowerCase().includes('europe')) newPreferences.region = 'Europe'
    if (message.toLowerCase().includes('america')) newPreferences.region = 'Americas'
    
    // Climate parsing
    const climateKeywords = ['tropical', 'coastal', 'island', 'beach', 'mountain', 'urban', 'desert']
    const foundClimates = climateKeywords.filter(keyword => 
      message.toLowerCase().includes(keyword)
    )
    if (foundClimates.length > 0) {
      newPreferences.climate = foundClimates
    }
    
    return newPreferences
  }

  // Generate route plan based on preferences
  const generateRoutePlan = async (prefs: UserPreferences): Promise<RoutePlan> => {
    // Mock data - in real implementation, this would call your city database
    const mockCities: CityRecommendation[] = [
      {
        id: '1',
        name: 'Da Nang',
        country: 'Vietnam',
        region: 'Asia',
        costPerMonth: 1200,
        wifiSpeed: 85,
        visaFeasibility: 'easy',
        climate: 'tropical',
        communityScore: 8,
        stayDays: 60,
        reasoning: ['Low cost of living', 'Excellent WiFi infrastructure', 'Easy visa for most nationalities'],
        seasonality: 'Best: Mar-Oct'
      },
      {
        id: '2',
        name: 'Penang',
        country: 'Malaysia',
        region: 'Asia',
        costPerMonth: 1400,
        wifiSpeed: 75,
        visaFeasibility: 'easy',
        climate: 'tropical',
        communityScore: 7,
        stayDays: 45,
        reasoning: ['Great food scene', 'Strong expat community', 'Affordable healthcare'],
        seasonality: 'Year-round'
      },
      {
        id: '3',
        name: 'Bali',
        country: 'Indonesia',
        region: 'Asia',
        costPerMonth: 1600,
        wifiSpeed: 65,
        visaFeasibility: 'moderate',
        climate: 'tropical',
        communityScore: 9,
        stayDays: 75,
        reasoning: ['Vibrant nomad community', 'Beautiful beaches', 'Rich culture'],
        seasonality: 'Best: Apr-Oct'
      }
    ]

    // Filter and score cities based on preferences
    let filteredCities = mockCities.filter(city => {
      if (prefs.region && city.region !== prefs.region) return false
      if (prefs.climate && !prefs.climate.some(c => city.climate.includes(c))) return false
      if (prefs.budget && city.costPerMonth > prefs.budget * 1.2) return false
      return true
    })

    // Sort by score (simplified scoring)
    filteredCities.sort((a, b) => {
      let scoreA = 0, scoreB = 0
      
      if (prefs.budget) {
        scoreA += Math.max(0, 10 - (a.costPerMonth - prefs.budget) / 100)
        scoreB += Math.max(0, 10 - (b.costPerMonth - prefs.budget) / 100)
      }
      
      scoreA += a.communityScore
      scoreB += b.communityScore
      
      return scoreB - scoreA
    })

    // Take top 3 cities
    const selectedCities = filteredCities.slice(0, 3)
    
    // Calculate route details
    const totalDuration = selectedCities.reduce((sum, city) => sum + city.stayDays, 0)
    const totalBudget = selectedCities.reduce((sum, city) => sum + city.costPerMonth * (city.stayDays / 30), 0)
    const averageWifi = selectedCities.reduce((sum, city) => sum + city.wifiSpeed, 0) / selectedCities.length

    return {
      cities: selectedCities,
      totalDuration,
      totalBudget,
      averageWifi,
      visaNotes: ['Check visa requirements for your nationality', 'Consider visa runs if needed']
    }
  }

  // Handle sending message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setIsTyping(true)

    // Parse preferences from message
    const newPreferences = parseUserMessage(inputMessage)
    const updatedPreferences = { ...preferences, ...newPreferences }
    setPreferences(updatedPreferences)

    // Simulate AI response delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    try {
      // Generate route plan
      const plan = await generateRoutePlan(updatedPreferences)
      setRoutePlan(plan)

      // Generate AI response
      let response = "Based on your preferences, here's my recommendation:\n\n"
      
      plan.cities.forEach((city, index) => {
        response += `**${index + 1}. ${city.name}, ${city.country}** (${city.stayDays} days)\n`
        response += `💰 $${city.costPerMonth}/month | 📶 ${city.wifiSpeed} Mbps | 👥 Community: ${city.communityScore}/10\n`
        response += `Why: ${city.reasoning.join(', ')}\n\n`
      })

      response += `**Total Route:** ${Math.round(plan.totalDuration / 30)} months, ~$${Math.round(plan.totalBudget)} total budget\n`
      response += `**Average WiFi:** ${Math.round(plan.averageWifi)} Mbps\n\n`
      response += "You can ask me to adjust any city, change duration, or modify your budget!"

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error generating plan:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "Sorry, I encountered an error. Please try again with your preferences.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Export functions
  const exportToJSON = () => {
    if (!routePlan) return
    const dataStr = JSON.stringify(routePlan, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'nomad-route-plan.json'
    link.click()
  }

  const exportToCSV = () => {
    if (!routePlan) return
    const csvContent = [
      ['City', 'Country', 'Stay Days', 'Cost/Month', 'WiFi Speed', 'Community Score'],
      ...routePlan.cities.map(city => [
        city.name,
        city.country,
        city.stayDays,
        city.costPerMonth,
        city.wifiSpeed,
        city.communityScore
      ])
    ].map(row => row.join(',')).join('\n')
    
    const dataBlob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'nomad-route-plan.csv'
    link.click()
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Digital Nomad Assistant</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Chat with me to plan your perfect digital nomad journey. I'll recommend cities and create a route based on your preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 h-[600px] flex flex-col">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Chips */}
              <div className="px-6 py-3 border-t border-gray-200">
                <div className="flex flex-wrap gap-2 mb-3">
                  {quickChips.map((chip, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickChip(chip.value)}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm hover:bg-blue-100 transition-colors"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tell me your preferences..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Route Preview */}
          <div className="space-y-6">
            {/* Advanced Options */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900">Advanced Options</h3>
                {showAdvancedOptions ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              
              {showAdvancedOptions && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                    <input
                      type="text"
                      value={advancedForm.nationality}
                      onChange={(e) => setAdvancedForm(prev => ({ ...prev, nationality: e.target.value }))}
                      placeholder="e.g., US, UK, CA"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Stay Days</label>
                    <input
                      type="number"
                      value={advancedForm.minStayDays}
                      onChange={(e) => setAdvancedForm(prev => ({ ...prev, minStayDays: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Cities</label>
                    <input
                      type="number"
                      value={advancedForm.maxCities}
                      onChange={(e) => setAdvancedForm(prev => ({ ...prev, maxCities: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Duration (months)</label>
                    <input
                      type="number"
                      value={advancedForm.totalDuration}
                      onChange={(e) => setAdvancedForm(prev => ({ ...prev, totalDuration: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Route Preview */}
            {routePlan && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Your Route</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={exportToJSON}
                      className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                      title="Export JSON"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={exportToCSV}
                      className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                      title="Export CSV"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Route Summary */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                    <div className="text-sm text-gray-600">Duration</div>
                    <div className="font-semibold text-gray-900">{Math.round(routePlan.totalDuration / 30)} months</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
                    <div className="text-sm text-gray-600">Total Budget</div>
                    <div className="font-semibold text-gray-900">${Math.round(routePlan.totalBudget)}</div>
                  </div>
                </div>

                {/* Cities */}
                <div className="space-y-3">
                  {routePlan.cities.map((city, index) => (
                    <div key={city.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{city.name}, {city.country}</h4>
                        <span className="text-sm text-gray-500">{city.stayDays} days</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 mb-2">
                        <div className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          ${city.costPerMonth}/mo
                        </div>
                        <div className="flex items-center">
                          <Wifi className="h-3 w-3 mr-1" />
                          {city.wifiSpeed} Mbps
                        </div>
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {city.communityScore}/10
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        {city.reasoning.join(' • ')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Visa Notes */}
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <div className="font-medium mb-1">Visa Requirements</div>
                      <ul className="text-xs space-y-1">
                        {routePlan.visaNotes.map((note, index) => (
                          <li key={index}>• {note}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  <RefreshCw className="h-4 w-4" />
                  <span>Regenerate Route</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Share2 className="h-4 w-4" />
                  <span>Share Route</span>
                </button>
                <FixedLink 
                  href="/nomadcities" 
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Browse All Cities</span>
                </FixedLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}