'use client';

import { useState, useEffect } from 'react';
import { 
  Globe, 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertTriangle,
  Settings,
  BarChart3,
  List,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload
} from 'lucide-react';

// Types for domain tracking
interface Domain {
  id: string;
  domain_name: string;
  registrar: string;
  purchase_date: string;
  purchase_cost: number;
  renewal_cost: number;
  total_renewal_paid: number;
  next_renewal_date: string;
  status: 'active' | 'for_sale' | 'sold' | 'expired';
  estimated_value: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface DomainTransaction {
  id: string;
  domain_id: string;
  type: 'buy' | 'renew' | 'sell' | 'transfer' | 'fee';
  amount: number;
  currency: string;
  date: string;
  notes: string;
}

interface DomainStats {
  totalDomains: number;
  totalCost: number;
  totalRevenue: number;
  totalProfit: number;
  roi: number;
  expiringSoon: number;
  forSale: number;
}

export default function DomainTrackerPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [domains, setDomains] = useState<Domain[]>([]);
  const [transactions, setTransactions] = useState<DomainTransaction[]>([]);
  const [stats, setStats] = useState<DomainStats>({
    totalDomains: 0,
    totalCost: 0,
    totalRevenue: 0,
    totalProfit: 0,
    roi: 0,
    expiringSoon: 0,
    forSale: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock data for development
  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setDomains([
        {
          id: '1',
          domain_name: 'nomadlife.com',
          registrar: 'Namecheap',
          purchase_date: '2023-01-15',
          purchase_cost: 12.99,
          renewal_cost: 12.99,
          total_renewal_paid: 12.99,
          next_renewal_date: '2024-01-15',
          status: 'active',
          estimated_value: 500,
          tags: ['investment', 'lifestyle'],
          created_at: '2023-01-15T00:00:00Z',
          updated_at: '2023-01-15T00:00:00Z'
        },
        {
          id: '2',
          domain_name: 'digitalnomad.tools',
          registrar: 'Cloudflare',
          purchase_date: '2023-03-20',
          purchase_cost: 15.00,
          renewal_cost: 15.00,
          total_renewal_paid: 0,
          next_renewal_date: '2024-03-20',
          status: 'for_sale',
          estimated_value: 200,
          tags: ['tools', 'business'],
          created_at: '2023-03-20T00:00:00Z',
          updated_at: '2023-03-20T00:00:00Z'
        }
      ]);
      
      setTransactions([
        {
          id: '1',
          domain_id: '1',
          type: 'buy',
          amount: 12.99,
          currency: 'USD',
          date: '2023-01-15',
          notes: 'Initial purchase'
        },
        {
          id: '2',
          domain_id: '1',
          type: 'renew',
          amount: 12.99,
          currency: 'USD',
          date: '2024-01-15',
          notes: 'Annual renewal'
        }
      ]);
      
      setStats({
        totalDomains: 2,
        totalCost: 40.98,
        totalRevenue: 0,
        totalProfit: -40.98,
        roi: -100,
        expiringSoon: 1,
        forSale: 1
      });
      
      setLoading(false);
    }, 1000);
  }, []);

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'portfolio', label: 'Portfolio', icon: List },
    { key: 'transactions', label: 'Transactions', icon: DollarSign },
    { key: 'analytics', label: 'Analytics', icon: TrendingUp },
    { key: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { key: 'settings', label: 'Settings', icon: Settings }
  ];

  const filteredDomains = domains.filter(domain =>
    domain.domain_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    domain.registrar.toLowerCase().includes(searchQuery.toLowerCase()) ||
    domain.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'for_sale':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'bg-red-100 text-red-800';
      case 'renew':
        return 'bg-orange-100 text-orange-800';
      case 'sell':
        return 'bg-green-100 text-green-800';
      case 'transfer':
        return 'bg-blue-100 text-blue-800';
      case 'fee':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateDaysUntilExpiry = (date: string) => {
    const expiryDate = new Date(date);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Domains</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalDomains}</p>
            </div>
            <Globe className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cost</p>
              <p className="text-3xl font-bold text-red-600">${stats.totalCost.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ROI</p>
              <p className={`text-3xl font-bold ${stats.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.roi.toFixed(1)}%
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            Expiring Soon
          </h3>
          <div className="space-y-3">
            {domains
              .filter(domain => {
                const days = calculateDaysUntilExpiry(domain.next_renewal_date);
                return days <= 30 && days > 0;
              })
              .map(domain => (
                <div key={domain.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{domain.domain_name}</p>
                    <p className="text-sm text-gray-600">{domain.registrar}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-yellow-800">
                      {calculateDaysUntilExpiry(domain.next_renewal_date)} days
                    </p>
                    <p className="text-sm text-gray-600">${domain.renewal_cost}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="h-5 w-5 text-green-500 mr-2" />
            For Sale
          </h3>
          <div className="space-y-3">
            {domains
              .filter(domain => domain.status === 'for_sale')
              .map(domain => (
                <div key={domain.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{domain.domain_name}</p>
                    <p className="text-sm text-gray-600">{domain.registrar}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-800">
                      ${domain.estimated_value}
                    </p>
                    <p className="text-sm text-gray-600">Est. Value</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPortfolio = () => (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search domains..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Add Domain</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Upload className="h-4 w-4" />
            <span>Import</span>
          </button>
        </div>
      </div>

      {/* Domains Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registrar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purchase Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Est. Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Renewal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDomains.map((domain) => {
                const totalCost = domain.purchase_cost + domain.total_renewal_paid;
                const daysUntilExpiry = calculateDaysUntilExpiry(domain.next_renewal_date);
                
                return (
                  <tr key={domain.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{domain.domain_name}</div>
                        <div className="text-sm text-gray-500">
                          {domain.tags.map(tag => (
                            <span key={tag} className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs mr-1">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {domain.registrar}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${domain.purchase_cost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${totalCost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${domain.estimated_value.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{new Date(domain.next_renewal_date).toLocaleDateString()}</div>
                        <div className={`text-xs ${daysUntilExpiry <= 30 ? 'text-red-600' : 'text-gray-500'}`}>
                          {daysUntilExpiry} days
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(domain.status)}`}>
                        {domain.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Add Transaction</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => {
                const domain = domains.find(d => d.id === transaction.domain_id);
                return (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {domain?.domain_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransactionTypeColor(transaction.type)}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${transaction.amount.toFixed(2)} {transaction.currency}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.notes}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registrar Distribution</h3>
          <div className="space-y-2">
            {['Namecheap', 'Cloudflare', 'GoDaddy'].map(registrar => (
              <div key={registrar} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{registrar}</span>
                <span className="text-sm font-medium text-gray-900">
                  {domains.filter(d => d.registrar === registrar).length}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
          <div className="space-y-2">
            {['active', 'for_sale', 'sold', 'expired'].map(status => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</span>
                <span className="text-sm font-medium text-gray-900">
                  {domains.filter(d => d.status === status).length}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Alerts & Reminders</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Alert management system coming soon...</p>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Settings configuration coming soon...</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'portfolio':
        return renderPortfolio();
      case 'transactions':
        return renderTransactions();
      case 'analytics':
        return renderAnalytics();
      case 'alerts':
        return renderAlerts();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading domain tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Globe className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Domain Tracker</h1>
          </div>
          <p className="text-gray-600">
            Track your domain investments, costs, and profits with detailed analytics
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
}
