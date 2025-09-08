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
  Upload,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/GlobalStateContext';

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
  const { t } = useLanguage();
  const { user } = useUser();
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
  const [showAddDomainModal, setShowAddDomainModal] = useState(false);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [showEditDomainModal, setShowEditDomainModal] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [newDomain, setNewDomain] = useState({
    domain_name: '',
    registrar: '',
    purchase_cost: 0,
    renewal_cost: 0,
    estimated_value: 0,
    tags: [] as string[]
  });
  const [newTransaction, setNewTransaction] = useState({
    domain_id: '',
    type: 'buy' as 'buy' | 'renew' | 'sell' | 'transfer' | 'fee',
    amount: 0,
    currency: 'USD',
    notes: ''
  });

  // Initialize empty state
  useEffect(() => {
    // Set loading to false immediately since we start with empty data
    setLoading(false);
  }, []);

  const tabs = [
    { key: 'overview', label: t('domainTracker.tabs.overview'), icon: BarChart3 },
    { key: 'portfolio', label: t('domainTracker.tabs.portfolio'), icon: List },
    { key: 'transactions', label: t('domainTracker.tabs.transactions'), icon: DollarSign },
    { key: 'analytics', label: t('domainTracker.tabs.analytics'), icon: TrendingUp },
    { key: 'alerts', label: t('domainTracker.tabs.alerts'), icon: AlertTriangle },
    { key: 'settings', label: t('domainTracker.tabs.settings'), icon: Settings }
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

  // 计算年度续费成本
  const calculateAnnualRenewalCost = () => {
    return domains.reduce((total, domain) => {
      return total + domain.renewal_cost;
    }, 0);
  };

  // 计算即将到期的域名数量（30天内）
  const calculateExpiringSoon = () => {
    return domains.filter(domain => {
      const days = calculateDaysUntilExpiry(domain.next_renewal_date);
      return days <= 30 && days > 0;
    }).length;
  };

  // 计算平均ROI
  const calculateAverageROI = () => {
    if (domains.length === 0) return 0;
    const totalROI = domains.reduce((sum, domain) => {
      const totalCost = domain.purchase_cost + domain.total_renewal_paid;
      const profit = domain.estimated_value - totalCost;
      return sum + (totalCost > 0 ? (profit / totalCost) * 100 : 0);
    }, 0);
    return totalROI / domains.length;
  };

  // 计算活跃vs已售比例
  const calculateActiveVsSoldRatio = () => {
    const active = domains.filter(d => d.status === 'active' || d.status === 'for_sale').length;
    const sold = domains.filter(d => d.status === 'sold').length;
    const total = active + sold;
    return total > 0 ? { active: (active / total) * 100, sold: (sold / total) * 100 } : { active: 0, sold: 0 };
  };

  // 获取Top 5 ROI域名
  const getTopROIDomains = () => {
    return domains
      .map(domain => {
        const totalCost = domain.purchase_cost + domain.total_renewal_paid;
        const profit = domain.estimated_value - totalCost;
        const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;
        return { ...domain, roi };
      })
      .sort((a, b) => b.roi - a.roi)
      .slice(0, 5);
  };

  // 获取注册商分布
  const getRegistrarDistribution = () => {
    const distribution: { [key: string]: number } = {};
    domains.forEach(domain => {
      distribution[domain.registrar] = (distribution[domain.registrar] || 0) + 1;
    });
    return Object.entries(distribution)
      .map(([registrar, count]) => ({ registrar, count, percentage: (count / domains.length) * 100 }))
      .sort((a, b) => b.count - a.count);
  };

  const handleAddDomain = () => {
    if (!newDomain.domain_name || !newDomain.registrar) {
      alert('Please fill in required fields');
      return;
    }

    const domain: Domain = {
      id: Date.now().toString(),
      domain_name: newDomain.domain_name,
      registrar: newDomain.registrar,
      purchase_date: new Date().toISOString().split('T')[0],
      purchase_cost: newDomain.purchase_cost,
      renewal_cost: newDomain.renewal_cost || newDomain.purchase_cost,
      total_renewal_paid: 0,
      next_renewal_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      estimated_value: newDomain.estimated_value,
      tags: newDomain.tags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setDomains(prev => [...prev, domain]);
    
    // Add purchase transaction
    const transaction: DomainTransaction = {
      id: Date.now().toString() + '_tx',
      domain_id: domain.id,
      type: 'buy',
      amount: newDomain.purchase_cost,
      currency: 'USD',
      date: new Date().toISOString().split('T')[0],
      notes: 'Initial purchase'
    };
    
    setTransactions(prev => [...prev, transaction]);
    
    // Update stats
    setStats(prev => ({
      ...prev,
      totalDomains: prev.totalDomains + 1,
      totalCost: prev.totalCost + newDomain.purchase_cost,
      totalProfit: prev.totalProfit - newDomain.purchase_cost,
      roi: prev.totalCost > 0 ? ((prev.totalRevenue - prev.totalCost) / prev.totalCost) * 100 : 0
    }));

    // Reset form
    setNewDomain({
      domain_name: '',
      registrar: '',
      purchase_cost: 0,
      renewal_cost: 0,
      estimated_value: 0,
      tags: []
    });
    
    setShowAddDomainModal(false);
  };

  const handleAddTransaction = () => {
    if (!newTransaction.domain_id || !newTransaction.amount) {
      alert('Please fill in required fields');
      return;
    }

    const transaction: DomainTransaction = {
      id: Date.now().toString(),
      domain_id: newTransaction.domain_id,
      type: newTransaction.type,
      amount: newTransaction.amount,
      currency: newTransaction.currency,
      date: new Date().toISOString().split('T')[0],
      notes: newTransaction.notes
    };

    setTransactions(prev => [...prev, transaction]);

    // Update domain and stats based on transaction type
    if (newTransaction.type === 'sell') {
      setDomains(prev => prev.map(domain => 
        domain.id === newTransaction.domain_id 
          ? { ...domain, status: 'sold' as const }
          : domain
      ));
      
      setStats(prev => ({
        ...prev,
        totalRevenue: prev.totalRevenue + newTransaction.amount,
        totalProfit: prev.totalProfit + newTransaction.amount,
        roi: prev.totalCost > 0 ? ((prev.totalRevenue + newTransaction.amount - prev.totalCost) / prev.totalCost) * 100 : 0
      }));
    } else if (newTransaction.type === 'renew') {
      setDomains(prev => prev.map(domain => 
        domain.id === newTransaction.domain_id 
          ? { 
              ...domain, 
              total_renewal_paid: domain.total_renewal_paid + newTransaction.amount,
              next_renewal_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
          : domain
      ));
      
      setStats(prev => ({
        ...prev,
        totalCost: prev.totalCost + newTransaction.amount,
        totalProfit: prev.totalProfit - newTransaction.amount,
        roi: prev.totalCost > 0 ? ((prev.totalRevenue - (prev.totalCost + newTransaction.amount)) / (prev.totalCost + newTransaction.amount)) * 100 : 0
      }));
    }

    // Reset form
    setNewTransaction({
      domain_id: '',
      type: 'buy',
      amount: 0,
      currency: 'USD',
      notes: ''
    });
    
    setShowAddTransactionModal(false);
  };

  const handleEditDomain = (domain: Domain) => {
    setEditingDomain(domain);
    setNewDomain({
      domain_name: domain.domain_name,
      registrar: domain.registrar,
      purchase_cost: domain.purchase_cost,
      renewal_cost: domain.renewal_cost,
      estimated_value: domain.estimated_value,
      tags: domain.tags
    });
    setShowEditDomainModal(true);
  };

  const handleUpdateDomain = () => {
    if (!editingDomain || !newDomain.domain_name || !newDomain.registrar) {
      alert('Please fill in required fields');
      return;
    }

    const updatedDomain: Domain = {
      ...editingDomain,
      domain_name: newDomain.domain_name,
      registrar: newDomain.registrar,
      purchase_cost: newDomain.purchase_cost,
      renewal_cost: newDomain.renewal_cost,
      estimated_value: newDomain.estimated_value,
      tags: newDomain.tags,
      updated_at: new Date().toISOString()
    };

    setDomains(prev => prev.map(domain => 
      domain.id === editingDomain.id ? updatedDomain : domain
    ));

    // Reset form and close modal
    setNewDomain({
      domain_name: '',
      registrar: '',
      purchase_cost: 0,
      renewal_cost: 0,
      estimated_value: 0,
      tags: []
    });
    setEditingDomain(null);
    setShowEditDomainModal(false);
  };

  const handleDeleteDomain = (domainId: string) => {
    if (window.confirm('Are you sure you want to delete this domain? This action cannot be undone.')) {
      // Remove domain
      setDomains(prev => prev.filter(domain => domain.id !== domainId));
      
      // Remove related transactions
      setTransactions(prev => prev.filter(transaction => transaction.domain_id !== domainId));
      
      // Update stats
      const domainToDelete = domains.find(d => d.id === domainId);
      if (domainToDelete) {
        const totalCost = domainToDelete.purchase_cost + domainToDelete.total_renewal_paid;
        setStats(prev => ({
          ...prev,
          totalDomains: prev.totalDomains - 1,
          totalCost: prev.totalCost - totalCost,
          totalProfit: prev.totalProfit + totalCost,
          roi: prev.totalCost > totalCost ? ((prev.totalRevenue - (prev.totalCost - totalCost)) / (prev.totalCost - totalCost)) * 100 : 0
        }));
      }
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards - Row 1 */}
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

      {/* Key Metrics Cards - Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Annual Renewal Cost</p>
              <p className="text-3xl font-bold text-orange-600">${calculateAnnualRenewalCost().toFixed(2)}</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-3xl font-bold text-yellow-600">{calculateExpiringSoon()}</p>
              <p className="text-xs text-gray-500">Next 30 days</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average ROI</p>
              <p className={`text-3xl font-bold ${calculateAverageROI() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {calculateAverageROI().toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active vs Sold</p>
              <div className="flex items-center space-x-2">
                <div className="text-lg font-bold text-blue-600">{calculateActiveVsSoldRatio().active.toFixed(0)}%</div>
                <div className="text-sm text-gray-500">/</div>
                <div className="text-lg font-bold text-gray-600">{calculateActiveVsSoldRatio().sold.toFixed(0)}%</div>
              </div>
              <p className="text-xs text-gray-500">Active / Sold</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 ROI Domains */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="h-5 w-5 text-yellow-500 mr-2" />
            Top 5 ROI Domains
          </h3>
          <div className="space-y-3">
            {getTopROIDomains().length > 0 ? (
              getTopROIDomains().map((domain, index) => (
                <div key={domain.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{domain.domain_name}</p>
                      <p className="text-sm text-gray-600">{domain.registrar}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${domain.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {domain.roi.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">${domain.estimated_value.toFixed(0)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Star className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No domains yet</p>
                <p className="text-sm">Add domains to see ROI rankings</p>
              </div>
            )}
          </div>
        </div>

        {/* Registrar Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
            Registrar Distribution
          </h3>
          <div className="space-y-3">
            {getRegistrarDistribution().length > 0 ? (
              getRegistrarDistribution().map((item, index) => (
                <div key={item.registrar} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full" style={{
                      backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                    }}></div>
                    <span className="text-sm font-medium text-gray-900">{item.registrar}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{item.count}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No data available</p>
                <p className="text-sm">Add domains to see distribution</p>
              </div>
            )}
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
          <button 
            onClick={() => setShowAddDomainModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{t('domainTracker.portfolio.addDomain')}</span>
          </button>
          <button 
            onClick={() => console.log('Import domains functionality coming soon')}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>{t('domainTracker.portfolio.import')}</span>
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
              {filteredDomains.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Globe className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No domains yet</h3>
                      <p className="text-gray-600 mb-4">Start tracking your domain investments by adding your first domain.</p>
                      <button 
                        onClick={() => setShowAddDomainModal(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Your First Domain</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDomains.map((domain) => {
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
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditDomain(domain)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit Domain"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteDomain(domain.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Domain"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('domainTracker.transactions.title')}</h2>
        <button 
          onClick={() => setShowAddTransactionModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>{t('domainTracker.transactions.addTransaction')}</span>
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
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <DollarSign className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                      <p className="text-gray-600 mb-4">Add your first transaction to start tracking your domain investments.</p>
                      <button 
                        onClick={() => setShowAddTransactionModal(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Transaction</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => {
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
                })
              )}
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

  // Show login prompt if user is not authenticated
  if (!user.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <Globe className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('domainTracker.auth.loginRequired')}</h2>
            <p className="text-gray-600">{t('domainTracker.auth.loginMessage')}</p>
          </div>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.href = '/login'}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              <span>{t('domainTracker.auth.loginButton')}</span>
            </button>
            <button 
              onClick={() => window.location.href = '/signup'}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              <span>{t('domainTracker.auth.signupButton')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t('domainTracker.title')}</h1>
                <p className="text-gray-600">{t('domainTracker.subtitle')}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <button 
                onClick={() => setShowAddDomainModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>{t('domainTracker.portfolio.addDomain')}</span>
              </button>
            </div>
          </div>
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

      {/* Add Domain Modal */}
      {showAddDomainModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Domain</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domain Name *</label>
                <input 
                  type="text" 
                  placeholder="example.com"
                  value={newDomain.domain_name}
                  onChange={(e) => setNewDomain(prev => ({ ...prev, domain_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registrar *</label>
                <input 
                  type="text" 
                  placeholder="Cloudflare, GoDaddy, etc."
                  value={newDomain.registrar}
                  onChange={(e) => setNewDomain(prev => ({ ...prev, registrar: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Cost ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="12.99"
                  value={newDomain.purchase_cost || ''}
                  onChange={(e) => setNewDomain(prev => ({ ...prev, purchase_cost: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Renewal Cost ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="12.99"
                  value={newDomain.renewal_cost || ''}
                  onChange={(e) => setNewDomain(prev => ({ ...prev, renewal_cost: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Value ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="500"
                  value={newDomain.estimated_value || ''}
                  onChange={(e) => setNewDomain(prev => ({ ...prev, estimated_value: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setShowAddDomainModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddDomain}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Domain
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Domain Modal */}
      {showEditDomainModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Domain</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domain Name *</label>
                <input 
                  type="text" 
                  placeholder="example.com"
                  value={newDomain.domain_name}
                  onChange={(e) => setNewDomain(prev => ({ ...prev, domain_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registrar *</label>
                <input 
                  type="text" 
                  placeholder="Cloudflare, GoDaddy, etc."
                  value={newDomain.registrar}
                  onChange={(e) => setNewDomain(prev => ({ ...prev, registrar: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Cost ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="12.99"
                  value={newDomain.purchase_cost || ''}
                  onChange={(e) => setNewDomain(prev => ({ ...prev, purchase_cost: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Renewal Cost ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="12.99"
                  value={newDomain.renewal_cost || ''}
                  onChange={(e) => setNewDomain(prev => ({ ...prev, renewal_cost: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Value ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="500"
                  value={newDomain.estimated_value || ''}
                  onChange={(e) => setNewDomain(prev => ({ ...prev, estimated_value: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => {
                  setShowEditDomainModal(false);
                  setEditingDomain(null);
                  setNewDomain({
                    domain_name: '',
                    registrar: '',
                    purchase_cost: 0,
                    renewal_cost: 0,
                    estimated_value: 0,
                    tags: []
                  });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateDomain}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Domain
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Transaction</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domain *</label>
                <select 
                  value={newTransaction.domain_id}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, domain_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select domain...</option>
                  {domains.map(domain => (
                    <option key={domain.id} value={domain.id}>{domain.domain_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                <select 
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="buy">Buy</option>
                  <option value="renew">Renew</option>
                  <option value="sell">Sell</option>
                  <option value="transfer">Transfer</option>
                  <option value="fee">Fee</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($) *</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="12.99"
                  value={newTransaction.amount || ''}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea 
                  placeholder="Optional notes..."
                  value={newTransaction.notes}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setShowAddTransactionModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddTransaction}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
