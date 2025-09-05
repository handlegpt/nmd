'use client';

import { useState } from 'react';
import { 
  BookOpen, 
  MapPin, 
  Calendar,
  Globe,
  Users,
  Star
} from 'lucide-react';

export default function GuidesPage() {
  const [activeCategory, setActiveCategory] = useState('visa');

  const guides = {
    visa: {
      title: 'Visa Guides',
      description: 'Comprehensive guides for different types of visas',
      items: [
        {
          title: 'Digital Nomad Visa Guide',
          description: 'Complete guide to digital nomad visas worldwide',
          author: 'Nomad List Team',
          rating: 4.8,
          readTime: '15 min',
          category: 'Visa',
          features: ['Country-specific requirements', 'Application process', 'Required documents', 'Timeline']
        },
        {
          title: 'Schengen Visa Application',
          description: 'Step-by-step guide for Schengen visa application',
          author: 'Travel Expert',
          rating: 4.6,
          readTime: '12 min',
          category: 'Visa',
          features: ['Document checklist', 'Interview tips', 'Processing time', 'Common mistakes']
        },
        {
          title: 'Tourist Visa Extensions',
          description: 'How to extend tourist visas in popular countries',
          author: 'Legal Advisor',
          rating: 4.4,
          readTime: '8 min',
          category: 'Visa',
          features: ['Extension process', 'Requirements', 'Fees', 'Alternatives']
        }
      ]
    },
    city: {
      title: 'City Guides',
      description: 'Detailed guides for popular digital nomad cities',
      items: [
        {
          title: 'Chiang Mai Complete Guide',
          description: 'Everything you need to know about living in Chiang Mai',
          author: 'Local Expert',
          rating: 4.9,
          readTime: '20 min',
          category: 'City',
          features: ['Neighborhoods', 'Cost of living', 'Coworking spaces', 'Local culture']
        },
        {
          title: 'Lisbon Digital Nomad Guide',
          description: 'Comprehensive guide to Lisbon for digital nomads',
          author: 'Portuguese Nomad',
          rating: 4.7,
          readTime: '18 min',
          category: 'City',
          features: ['Accommodation', 'Internet quality', 'Food scene', 'Transportation']
        },
        {
          title: 'Mexico City Survival Guide',
          description: 'Essential tips for living in Mexico City',
          author: 'Mexico Expert',
          rating: 4.5,
          readTime: '14 min',
          category: 'City',
          features: ['Safety tips', 'Best areas', 'Local customs', 'Practical info']
        }
      ]
    },
    lifestyle: {
      title: 'Lifestyle Guides',
      description: 'Tips for maintaining a healthy digital nomad lifestyle',
      items: [
        {
          title: 'Remote Work Productivity',
          description: 'How to stay productive while working remotely',
          author: 'Productivity Coach',
          rating: 4.6,
          readTime: '10 min',
          category: 'Lifestyle',
          features: ['Time management', 'Workspace setup', 'Focus techniques', 'Work-life balance']
        },
        {
          title: 'Health & Wellness on the Road',
          description: 'Maintaining health while traveling constantly',
          author: 'Health Coach',
          rating: 4.5,
          readTime: '12 min',
          category: 'Lifestyle',
          features: ['Exercise routines', 'Healthy eating', 'Mental health', 'Medical care']
        },
        {
          title: 'Building Relationships as a Nomad',
          description: 'How to maintain and build relationships while traveling',
          author: 'Relationship Expert',
          rating: 4.3,
          readTime: '8 min',
          category: 'Lifestyle',
          features: ['Long-distance relationships', 'Making friends', 'Community building', 'Communication']
        }
      ]
    }
  };

  const categories = [
    { key: 'visa', label: 'Visa Guides', icon: BookOpen },
    { key: 'city', label: 'City Guides', icon: MapPin },
    { key: 'lifestyle', label: 'Lifestyle', icon: Users }
  ];

  const selectedGuides = guides[activeCategory as keyof typeof guides];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Guides</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive guides to help you navigate the digital nomad lifestyle
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

        {/* Guides Content */}
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedGuides.title}</h2>
            <p className="text-xl text-gray-600">{selectedGuides.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedGuides.items.map((guide, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {guide.category}
                    </span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{guide.rating}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{guide.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{guide.description}</p>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>By {guide.author}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{guide.readTime} read</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">What you'll learn:</h4>
                  <ul className="space-y-1">
                    {guide.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="text-sm text-gray-600 flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    Read Guide
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Guide */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
          <div className="text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Featured Guide</h2>
            <h3 className="text-xl font-semibold mb-2">The Complete Digital Nomad Handbook</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Everything you need to know to start and succeed as a digital nomad. From choosing your first destination to building a sustainable lifestyle.
            </p>
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Get Free Access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 