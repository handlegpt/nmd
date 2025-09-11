'use client';

import { useState, useMemo } from 'react';
import { 
  Wrench, 
  Calculator, 
  Globe,
  Clock,
  MapPin,
  DollarSign,
  Wifi,
  Calendar,
  Search,
  Filter,
  Star,
  Pin,
  TrendingUp,
  Users,
  Zap,
  Target,
  Plane,
  CreditCard,
  Briefcase,
  Heart,
  Eye,
  ChevronRight,
  Brain,
  BarChart3
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ToolsPage() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pinnedTools, setPinnedTools] = useState<string[]>(['domain-tracker', 'ai-recommendations', 'city-comparison', 'tax-calculator']);

  // 工具元数据配置 - 便于快速增减工具
  const toolsData = [
    // Trackers - Domain Tracker (First Priority)
    {
      id: 'domain-tracker',
      title: t('tools.tools.domainTracker.title'),
      description: t('tools.tools.domainTracker.description'),
      icon: Globe,
      emoji: '🌐',
      category: 'trackers',
      status: 'live',
      tags: ['domains', 'investment', 'tracking', 'analytics'],
      features: ['Portfolio management', 'Cost tracking', 'ROI calculations', 'Renewal reminders'],
      popularity: 95,
      lastUpdated: '2024-01-24'
    },
    
    // Calculators
    {
      id: 'cost-calculator',
      title: t('tools.tools.costCalculator.title'),
      description: t('tools.tools.costCalculator.description'),
      icon: DollarSign,
      emoji: '🧮',
      category: 'calculators',
      status: 'coming-soon',
      tags: ['budget', 'cost', 'comparison', 'planning'],
      features: ['Monthly expenses', 'City comparisons', 'Currency conversion', 'Budget planning'],
      popularity: 95,
      lastUpdated: '2024-01-15'
    },
    {
      id: 'visa-counter',
      title: t('tools.tools.visaCounter.title'),
      description: t('tools.tools.visaCounter.description'),
      icon: Calendar,
      emoji: '📅',
      category: 'calculators',
      status: 'coming-soon',
      tags: ['visa', 'tracking', 'compliance', 'days'],
      features: ['Day counting', 'Extension planning', 'Multiple visas', 'Alerts'],
      popularity: 88,
      lastUpdated: '2024-01-10'
    },
    {
      id: 'tax-calculator',
      title: t('tools.tools.taxCalculator.title'),
      description: t('tools.tools.taxCalculator.description'),
      icon: Calculator,
      emoji: '📊',
      category: 'calculators',
      status: 'live',
      tags: ['tax', 'calculation', 'compliance', 'multi-country'],
      features: ['Multi-country support', 'Tax treaties', 'Residency rules', 'Reporting'],
      popularity: 76,
      lastUpdated: '2024-01-20'
    },
    
    // Trackers
    {
      id: 'travel-tracker',
      title: t('tools.tools.travelTracker.title'),
      description: t('tools.tools.travelTracker.description'),
      icon: MapPin,
      emoji: '📍',
      category: 'trackers',
      status: 'coming-soon',
      tags: ['travel', 'tracking', 'location', 'history'],
      features: ['Location logging', 'Duration tracking', 'Visa compliance', 'History export'],
      popularity: 82,
      lastUpdated: '2024-01-12'
    },
    {
      id: 'wifi-tracker',
      title: t('tools.tools.wifiTracker.title'),
      description: t('tools.tools.wifiTracker.description'),
      icon: Wifi,
      emoji: '📶',
      category: 'trackers',
      status: 'live',
      tags: ['wifi', 'speed', 'internet', 'testing'],
      features: ['Speed testing', 'Location tagging', 'Provider info', 'Speed history'],
      popularity: 91,
      lastUpdated: '2024-01-08'
    },
    {
      id: 'time-zones',
      title: t('tools.tools.timeZoneManager.title'),
      description: t('tools.tools.timeZoneManager.description'),
      icon: Clock,
      emoji: '🌍',
      category: 'trackers',
      status: 'coming-soon',
      tags: ['timezone', 'scheduling', 'global', 'meetings'],
      features: ['Multiple zones', 'Meeting planner', 'World clock', 'Notifications'],
      popularity: 73,
      lastUpdated: '2024-01-18'
    },
    
    // Planners
    {
      id: 'trip-planner',
      title: t('tools.tools.tripPlanner.title'),
      description: t('tools.tools.tripPlanner.description'),
      icon: Globe,
      emoji: '✈️',
      category: 'planners',
      status: 'in-design',
      tags: ['trip', 'planning', 'destination', 'travel'],
      features: ['Route planning', 'Budget estimation', 'Visa requirements', 'Accommodation'],
      popularity: 68,
      lastUpdated: '2024-01-22'
    },
    {
      id: 'budget-planner',
      title: t('tools.tools.budgetPlanner.title'),
      description: t('tools.tools.budgetPlanner.description'),
      icon: CreditCard,
      emoji: '💰',
      category: 'planners',
      status: 'coming-soon',
      tags: ['budget', 'expenses', 'tracking', 'financial'],
      features: ['Expense tracking', 'Category management', 'Monthly reports', 'Savings goals'],
      popularity: 71,
      lastUpdated: '2024-01-19'
    },
    {
      id: 'work-scheduler',
      title: t('tools.tools.workScheduler.title'),
      description: t('tools.tools.workScheduler.description'),
      icon: Briefcase,
      emoji: '🗓️',
      category: 'planners',
      status: 'coming-soon',
      tags: ['work', 'schedule', 'timezone', 'productivity'],
      features: ['Time zone coordination', 'Meeting scheduling', 'Availability tracking', 'Calendar sync'],
      popularity: 65,
      lastUpdated: '2024-01-21'
    },
    
    // AI Tools
    {
      id: 'ai-recommendations',
      title: 'AI Recommendations',
      description: 'Get personalized city and place recommendations based on your preferences and lifestyle',
      icon: Brain,
      emoji: '🧠',
      category: 'planners',
      status: 'live',
      tags: ['ai', 'recommendations', 'personalized', 'lifestyle'],
      features: ['Smart matching', 'Preference analysis', 'Lifestyle insights', 'Personalized suggestions'],
      popularity: 92,
      lastUpdated: '2024-01-24'
    },
    {
      id: 'city-comparison',
      title: 'City Comparison Tool',
      description: 'Compare multiple cities side-by-side to find the best fit for your digital nomad journey',
      icon: BarChart3,
      emoji: '📊',
      category: 'planners',
      status: 'live',
      tags: ['comparison', 'cities', 'analysis', 'decision-making'],
      features: ['Side-by-side comparison', 'Cost analysis', 'Quality of life metrics', 'Decision support'],
      popularity: 89,
      lastUpdated: '2024-01-24'
    }
  ];

  const categories = [
    { key: 'all', label: t('tools.categories.all'), icon: Wrench },
    { key: 'calculators', label: t('tools.categories.calculators'), icon: Calculator },
    { key: 'trackers', label: t('tools.categories.trackers'), icon: MapPin },
    { key: 'planners', label: t('tools.categories.planners'), icon: Globe }
  ];

  // 过滤和搜索逻辑
  const filteredTools = useMemo(() => {
    let filtered = toolsData;
    
    // 按分类过滤
    if (activeCategory !== 'all') {
      filtered = filtered.filter(tool => tool.category === activeCategory);
    }
    
    // 按搜索查询过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tool => 
        tool.title.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // 按受欢迎程度排序
    return filtered.sort((a, b) => b.popularity - a.popularity);
  }, [activeCategory, searchQuery]);

  // 获取置顶工具
  const pinnedToolsData = useMemo(() => {
    return toolsData.filter(tool => pinnedTools.includes(tool.id));
  }, [pinnedTools]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'live':
        return { 
          label: t('tools.status.live'), 
          color: 'bg-green-100 text-green-800 border-green-200',
          bgColor: 'bg-green-50'
        };
      case 'coming-soon':
        return { 
          label: t('tools.status.comingSoon'), 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          bgColor: 'bg-yellow-50'
        };
      case 'in-design':
        return { 
          label: t('tools.status.inDesign'), 
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          bgColor: 'bg-blue-50'
        };
      default:
        return { 
          label: t('tools.status.planned'), 
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          bgColor: 'bg-gray-50'
        };
    }
  };

  const handleToolClick = (tool: any) => {
    if (tool.status === 'live') {
      // Route to specific tool pages
      switch (tool.id) {
        case 'domain-tracker':
          window.location.href = '/nomadtools/domains';
          break;
        case 'ai-recommendations':
          // Show AI recommendations component inline
          window.location.href = '/nomadtools/ai-recommendations';
          break;
        case 'city-comparison':
          // Show city comparison component inline
          window.location.href = '/nomadtools/city-comparison';
          break;
        case 'tax-calculator':
          // Route to tax calculator
          window.location.href = '/nomadtools/nomadtax';
          break;
        case 'cost-calculator':
          // Route to cost calculator when implemented
          console.log('Cost calculator coming soon');
          break;
        case 'visa-counter':
          // Route to visa counter when implemented
          console.log('Visa counter coming soon');
          break;
        case 'wifi-tracker':
          // Route to wifi tracker when implemented
          console.log('WiFi tracker coming soon');
          break;
        case 'travel-tracker':
          // Route to travel tracker when implemented
          console.log('Travel tracker coming soon');
          break;
        default:
          console.log(`Launching ${tool.title}`);
      }
    } else {
      // Show waitlist modal
      console.log(`Show waitlist for ${tool.title}`);
    }
  };

  const togglePin = (toolId: string) => {
    setPinnedTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Wrench className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('tools.title')}
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('tools.subtitle')}
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('tools.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">{t('tools.filterByCategory')}</span>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  activeCategory === category.key
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100 hover:shadow-md'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Access Section */}
        {pinnedToolsData.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Star className="h-6 w-6 text-yellow-500 mr-2" />
                {t('tools.quickAccess.title')}
              </h2>
              <span className="text-sm text-gray-500">{t('tools.quickAccess.subtitle')}</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {pinnedToolsData.map((tool) => {
                const Icon = tool.icon;
                const statusConfig = getStatusConfig(tool.status);
                return (
                  <div key={tool.id} className="relative group">
                    <button
                      onClick={() => handleToolClick(tool)}
                      className={`w-full p-4 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg ${statusConfig.bgColor} border-2 border-transparent hover:border-blue-200`}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">{tool.emoji}</div>
                        <Icon className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900 block">{tool.title}</span>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => togglePin(tool.id)}
                      className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    >
                      <Pin className="h-4 w-4 text-blue-600" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tools Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {activeCategory === 'all' ? t('tools.categories.all') : categories.find(c => c.key === activeCategory)?.label}
            </h2>
            <span className="text-sm text-gray-500">
              {filteredTools.length} {t('tools.toolsFound')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTools.map((tool) => {
              const Icon = tool.icon;
              const statusConfig = getStatusConfig(tool.status);
              const isPinned = pinnedTools.includes(tool.id);
              
              return (
                <div key={tool.id} className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* Popularity Badge */}
                  {tool.popularity > 85 && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {t('tools.popular')}
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{tool.emoji}</div>
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => togglePin(tool.id)}
                          className={`p-1 rounded-full transition-colors ${
                            isPinned ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          <Pin className="h-4 w-4" />
                        </button>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{tool.description}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {tool.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                      {tool.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{tool.tags.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Features Preview */}
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-2">{t('tools.features.keyFeatures')}</div>
                      <ul className="space-y-1">
                        {tool.features.slice(0, 2).map((feature, index) => (
                          <li key={index} className="text-xs text-gray-600 flex items-center">
                            <div className="w-1 h-1 bg-blue-500 rounded-full mr-2"></div>
                            {feature}
                          </li>
                        ))}
                        {tool.features.length > 2 && (
                          <li className="text-xs text-gray-500">
                            +{tool.features.length - 2} {t('tools.features.moreFeatures')}
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleToolClick(tool)}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                        tool.status === 'live'
                          ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span>
                        {tool.status === 'live' ? t('tools.actions.launchTool') : 
                         tool.status === 'in-design' ? t('tools.actions.joinWaitlist') : t('tools.actions.getNotified')}
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTools.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('tools.noToolsFound.title')}</h3>
              <p className="text-gray-600">{t('tools.noToolsFound.description')}</p>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative text-center">
            <div className="flex items-center justify-center mb-4">
              <Target className="h-8 w-8 mr-3" />
              <h2 className="text-3xl font-bold">{t('tools.cta.title')}</h2>
            </div>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto text-lg">
              {t('tools.cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>{t('tools.cta.voteForTools')}</span>
              </button>
              <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>{t('tools.cta.viewRoadmap')}</span>
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 