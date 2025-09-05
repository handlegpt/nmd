'use client';

import { useState } from 'react';
import { 
  Wrench, 
  Calculator, 
  Globe,
  Clock,
  MapPin,
  DollarSign,
  Wifi,
  Calendar
} from 'lucide-react';

export default function ToolsPage() {
  const [activeCategory, setActiveCategory] = useState('calculators');

  const tools = {
    calculators: {
      title: 'Calculators',
      description: 'Essential calculators for digital nomads',
      items: [
        {
          title: 'Cost of Living Calculator',
          description: 'Compare living costs between cities',
          icon: DollarSign,
          features: ['Monthly expenses', 'City comparisons', 'Currency conversion', 'Budget planning'],
          status: 'Available'
        },
        {
          title: 'Visa Day Counter',
          description: 'Track your visa days and plan extensions',
          icon: Calendar,
          features: ['Day counting', 'Extension planning', 'Multiple visas', 'Alerts'],
          status: 'Available'
        },
        {
          title: 'Tax Calculator',
          description: 'Calculate potential tax obligations',
          icon: Calculator,
          features: ['Multi-country support', 'Tax treaties', 'Residency rules', 'Reporting'],
          status: 'Coming Soon'
        }
      ]
    },
    trackers: {
      title: 'Trackers',
      description: 'Track important information and metrics',
      items: [
        {
          title: 'Travel Tracker',
          description: 'Track your travels and stays',
          icon: MapPin,
          features: ['Location logging', 'Duration tracking', 'Visa compliance', 'History export'],
          status: 'Available'
        },
        {
          title: 'WiFi Speed Tracker',
          description: 'Monitor internet speeds worldwide',
          icon: Wifi,
          features: ['Speed testing', 'Location tagging', 'Provider info', 'Speed history'],
          status: 'Available'
        },
        {
          title: 'Time Zone Manager',
          description: 'Manage multiple time zones',
          icon: Clock,
          features: ['Multiple zones', 'Meeting planner', 'World clock', 'Notifications'],
          status: 'Coming Soon'
        }
      ]
    },
    planners: {
      title: 'Planners',
      description: 'Planning tools for your nomad journey',
      items: [
        {
          title: 'Trip Planner',
          description: 'Plan your next destination',
          icon: Globe,
          features: ['Route planning', 'Budget estimation', 'Visa requirements', 'Accommodation'],
          status: 'Coming Soon'
        },
        {
          title: 'Budget Planner',
          description: 'Plan and track your expenses',
          icon: DollarSign,
          features: ['Expense tracking', 'Category management', 'Monthly reports', 'Savings goals'],
          status: 'Coming Soon'
        },
        {
          title: 'Work Schedule Planner',
          description: 'Plan your work schedule across time zones',
          icon: Clock,
          features: ['Time zone coordination', 'Meeting scheduling', 'Availability tracking', 'Calendar sync'],
          status: 'Coming Soon'
        }
      ]
    }
  };

  const categories = [
    { key: 'calculators', label: 'Calculators', icon: Calculator },
    { key: 'trackers', label: 'Trackers', icon: MapPin },
    { key: 'planners', label: 'Planners', icon: Globe }
  ];

  const selectedTools = tools[activeCategory as keyof typeof tools];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Coming Soon':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Tools</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Essential tools and calculators to help you navigate the digital nomad lifestyle
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-colors ${
                  activeCategory === category.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tools Content */}
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedTools.title}</h2>
            <p className="text-xl text-gray-600">{selectedTools.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedTools.items.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tool.status)}`}>
                      {tool.status}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{tool.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{tool.description}</p>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Features:</h4>
                    <ul className="space-y-1">
                      {tool.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="text-sm text-gray-600 flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button 
                    className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      tool.status === 'Available'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={tool.status !== 'Available'}
                  >
                    {tool.status === 'Available' ? 'Launch Tool' : 'Coming Soon'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Access Tools */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Access</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center">
              <Wifi className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">WiFi Speed</span>
            </button>
            
            <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center">
              <Calculator className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Cost Calculator</span>
            </button>
            
            <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center">
              <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Visa Counter</span>
            </button>
            
            <button className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-center">
              <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Time Zones</span>
            </button>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
          <div className="text-center">
            <Wrench className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">More Tools Coming Soon</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              We're constantly developing new tools to make your digital nomad life easier. 
              Stay tuned for more calculators, trackers, and planning tools.
            </p>
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Get Notified
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 