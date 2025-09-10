'use client';

import { useState, useEffect, useCallback } from 'react';
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
  UserPlus,
  Users,
  Star,
  ArrowUp,
  ArrowDown,
  X
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/GlobalStateContext';
import { userDataSync } from '@/lib/userDataSync';

// Security utility functions
const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 1000); // Limit length
};

const validateDomainName = (domain: string): boolean => {
  if (!domain || typeof domain !== 'string') return false;
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return domainRegex.test(domain) && domain.length <= 253;
};

const validateNumericInput = (value: string, min: number = 0, max: number = 999999): number => {
  const num = parseFloat(value);
  if (isNaN(num) || num < min || num > max) {
    return min;
  }
  return num;
};

const validateDateInput = (dateString: string): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  const minDate = new Date('1900-01-01');
  const maxDate = new Date(now.getFullYear() + 10, 11, 31); // 10 years from now
  
  return date >= minDate && date <= maxDate && !isNaN(date.getTime());
};

// Encryption/Decryption utilities for localStorage
const encryptData = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    // Simple base64 encoding with obfuscation (for demo purposes)
    // In production, use proper encryption libraries like crypto-js
    const obfuscated = btoa(jsonString).split('').reverse().join('');
    return obfuscated;
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
};

const decryptData = (encryptedData: string): any => {
  try {
    if (!encryptedData) return null;
    // Reverse the obfuscation
    const deobfuscated = encryptedData.split('').reverse().join('');
    const jsonString = atob(deobfuscated);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

// Toast notification functions will be defined inside the component

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
  // Renewal cycle fields
  renewal_cycle_years: number; // 续费周期（年数）
  renewal_cycle_type: 'annual' | 'biennial' | 'triennial' | 'custom'; // 续费类型
  last_renewal_amount: number; // 上次续费金额
  last_renewal_date: string; // 上次续费日期
  next_renewal_amount: number; // 下次续费金额（可能因价格变动而不同）
  renewal_count: number; // 已续费次数（手动填写）
}

interface DomainTransaction {
  id: string;
  domain_id: string;
  type: 'buy' | 'renew' | 'sell' | 'transfer' | 'fee';
  amount: number; // 实际收到的金额（扣除手续费后）
  currency: string;
  date: string;
  notes: string;
  platform?: string; // 交易平台 (如: GoDaddy, Namecheap, Afternic, Sedo等)
  transaction_time?: string; // 具体交易时间 (可选，如果不填则使用date)
  // 新增手续费相关字段
  gross_amount?: number; // 总销售额（手续费前）
  fee_percentage?: number; // 手续费百分比
  fee_amount?: number; // 手续费金额
  // 分期付款相关字段
  payment_plan?: 'lump_sum' | 'installment'; // 付款方式：一次性付款 / 分期付款
  installment_period?: number; // 分期期数（月）
  installment_fee_percentage?: number; // 分期手续费百分比
  installment_fee_amount?: number; // 分期手续费金额
  monthly_payment?: number; // 每月应付款
  total_installment_amount?: number; // 分期总金额（包含手续费）
  payment_status?: 'completed' | 'in_progress' | 'overdue'; // 付款状态
  paid_installments?: number; // 已付期数
  remaining_installments?: number; // 剩余期数
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
    purchase_date: '',
    purchase_cost: 0,
    renewal_cost: 0,
    expiry_date: '',
    tags: [] as string[],
    // Renewal cycle fields
    renewal_cycle_years: 1,
    renewal_cycle_type: 'annual' as 'annual' | 'biennial' | 'triennial' | 'custom',
    last_renewal_amount: 0,
    last_renewal_date: '',
    next_renewal_amount: 0,
    renewal_count: 0 // 已续费次数
  });
  const [newTransaction, setNewTransaction] = useState({
    domain_id: '',
    type: 'buy' as 'buy' | 'renew' | 'sell' | 'transfer' | 'fee',
    amount: 0,
    currency: 'USD',
    notes: '',
    platform: '',
    transaction_time: '',
    // 手续费相关字段
    gross_amount: 0,
    fee_percentage: 0,
    fee_amount: 0,
    // 分期付款相关字段
    payment_plan: 'lump_sum' as 'lump_sum' | 'installment',
    installment_period: 0,
    installment_fee_percentage: 0,
    installment_fee_amount: 0,
    monthly_payment: 0,
    total_installment_amount: 0,
    payment_status: 'completed' as 'completed' | 'in_progress' | 'overdue',
    paid_installments: 0,
    remaining_installments: 0
  });

  // Portfolio filtering and batch operations
  const [filters, setFilters] = useState({
    search: '',
    registrar: '',
    status: '',
    tag: '',
    sortBy: 'domain_name',
    sortOrder: 'asc' as 'asc' | 'desc'
  });
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    show: false,
    message: '',
    type: 'info'
  });

  // Transaction filtering and analysis
  const [transactionFilters, setTransactionFilters] = useState({
    search: '',
    type: '',
    domain: '',
    dateRange: 'all', // all, thisMonth, lastMonth, thisYear, custom
    sortBy: 'date',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  // Analytics filtering and analysis
  const [analyticsFilters, setAnalyticsFilters] = useState({
    timeRange: '12months', // 3months, 6months, 12months, 24months, all
    registrar: '',
    tld: '',
    status: '',
    sortBy: 'roi', // roi, cost, revenue, age
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  // Cost view mode for hybrid renewal cycle management
  const [costViewMode, setCostViewMode] = useState<'annualized' | 'actual'>('annualized');

  // Platform fee presets
  const platformFeePresets = {
    'Afternic': 15,
    'Sedo': 10,
    'GoDaddy': 20,
    'Namecheap': 15,
    'Flippa': 10,
    'Dan.com': 9,
    'Epik': 10,
    'Uniregistry': 10,
    'Name.com': 15,
    'Spaceship.com': 0,
    'Atom.com': 0,
    '4.cn': 0,
    'Aliyun.com': 0,
    'Escrow.com': 0,
    'Other': 0
  };

  // Installment payment plans for different platforms
  const installmentPlans = {
    'Atom': {
      6: { fee: 0, description: '6个月免手续费' },
      12: { fee: 2.5, description: '12个月2.5%手续费' },
      24: { fee: 5.0, description: '24个月5%手续费' }
    },
    'Afternic': {
      6: { fee: 0, description: '6个月免手续费' },
      12: { fee: 3.0, description: '12个月3%手续费' },
      24: { fee: 6.0, description: '24个月6%手续费' }
    },
    'Dan.com': {
      6: { fee: 0, description: '6个月免手续费' },
      12: { fee: 3.0, description: '12个月3%手续费' },
      24: { fee: 6.0, description: '24个月6%手续费' }
    },
    'Sedo': {
      6: { fee: 0, description: '6个月免手续费' },
      12: { fee: 2.0, description: '12个月2%手续费' },
      24: { fee: 4.0, description: '24个月4%手续费' }
    },
    'Other': {
      6: { fee: 0, description: '6个月免手续费' },
      12: { fee: 3.0, description: '12个月3%手续费' },
      24: { fee: 6.0, description: '24个月6%手续费' }
    }
  };

  // Installment calculation functions
  const calculateInstallmentDetails = (grossAmount: number, platform: string, period: number) => {
    const platformPlans = installmentPlans[platform as keyof typeof installmentPlans] || installmentPlans.Other;
    const plan = platformPlans[period as keyof typeof platformPlans];
    
    if (!plan) return null;
    
    const installmentFeeAmount = grossAmount * (plan.fee / 100);
    const totalInstallmentAmount = grossAmount + installmentFeeAmount;
    const monthlyPayment = totalInstallmentAmount / period;
    
    return {
      installmentFeePercentage: plan.fee,
      installmentFeeAmount,
      totalInstallmentAmount,
      monthlyPayment,
      description: plan.description
    };
  };

  // Renewal reminder settings
  const [reminderSettings, setReminderSettings] = useState({
    enabled: true,
    daysBefore: [60, 30, 7, 1], // Days before expiry to send reminders
    emailNotifications: true,
    inAppNotifications: true
  });

  // Toast notification function
  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Calculate total cost including purchase cost and all renewal costs
  const calculateTotalCost = () => {
    return domains.reduce((total, domain) => {
      const purchaseCost = domain.purchase_cost || 0;
      const renewalCost = domain.total_renewal_paid || 0;
      
      // 如果total_renewal_paid为0，计算预期的续费费用
      let calculatedRenewalCost = 0;
      if (renewalCost > 0) {
        // 使用实际已支付的续费费用
        calculatedRenewalCost = renewalCost;
      } else if (domain.renewal_count && domain.renewal_count > 0) {
        // 使用手动填写的续费次数
        calculatedRenewalCost = domain.renewal_count * (domain.renewal_cost || 0);
      } else {
        // 根据域名年龄和续费周期计算预期的续费费用
        const purchaseDate = new Date(domain.purchase_date);
        const now = new Date();
        const ageInYears = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
        const renewalCycleYears = domain.renewal_cycle_years || 1;
        const expectedRenewals = Math.floor(ageInYears / renewalCycleYears);
        calculatedRenewalCost = expectedRenewals * (domain.renewal_cost || 0);
      }
      
      return total + purchaseCost + calculatedRenewalCost;
    }, 0);
  };

  // Calculate total revenue from sell transactions
  const calculateTotalRevenue = () => {
    return transactions
      .filter(t => t.type === 'sell')
      .reduce((total, t) => {
        // 对于分期付款，使用总分期金额（包含分期手续费）
        if (t.payment_plan === 'installment' && t.total_installment_amount) {
          return total + t.total_installment_amount;
        }
        // 对于一次性付款，使用实际收到的金额
        return total + t.amount;
      }, 0);
  };

  // Calculate total gross sales (before fees)
  const calculateTotalGrossSales = () => {
    return transactions
      .filter(t => t.type === 'sell')
      .reduce((total, t) => {
        // 对于分期付款，使用总分期金额（包含分期手续费）
        if (t.payment_plan === 'installment' && t.total_installment_amount) {
          return total + t.total_installment_amount;
        }
        // 对于一次性付款，使用总销售额
        return total + (t.gross_amount || t.amount);
      }, 0);
  };

  // Calculate total platform fees paid
  const calculateTotalPlatformFees = () => {
    return transactions
      .filter(t => t.type === 'sell')
      .reduce((total, t) => {
        // 对于分期付款，使用分期手续费
        if (t.payment_plan === 'installment' && t.installment_fee_amount) {
          return total + t.installment_fee_amount;
        }
        // 对于一次性付款，使用平台手续费
        return total + (t.fee_amount || 0);
      }, 0);
  };

  // Calculate overall ROI
  const calculateOverallROI = () => {
    const totalCost = calculateTotalCost();
    const totalRevenue = calculateTotalRevenue();
    return totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
  };

  // Update stats based on current data
  const updateStats = useCallback(() => {
    const totalCost = calculateTotalCost();
    const totalRevenue = calculateTotalRevenue();
    const totalProfit = totalRevenue - totalCost;
    const roi = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
    
    setStats({
      totalDomains: domains.length,
      totalCost,
      totalRevenue,
      totalProfit,
      roi,
      expiringSoon: domains.filter(d => {
        // Skip sold or expired domains
        if (d.status === 'sold' || d.status === 'expired') return false;
        const daysUntilExpiry = Math.ceil((new Date(d.next_renewal_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
      }).length,
      forSale: domains.filter(d => d.status === 'for_sale').length
    });
  }, [domains, transactions]);

  // Initialize data from server/localStorage
  useEffect(() => {
    const loadData = async () => {
      if (!user?.profile?.id) {
        setLoading(false);
        return;
      }

      try {
        // 1. 尝试从服务器加载数据
        const serverDomains = await userDataSync.loadToolData('domain_tracker_domains', user.profile.id);
        const serverTransactions = await userDataSync.loadToolData('domain_tracker_transactions', user.profile.id);
        const serverStats = await userDataSync.loadToolData('domain_tracker_stats', user.profile.id);

        if (serverDomains || serverTransactions || serverStats) {
          // 使用服务器数据
          if (serverDomains) setDomains(serverDomains);
          if (serverTransactions) setTransactions(serverTransactions);
          if (serverStats) setStats(serverStats);
        } else {
          // 2. 服务器没有数据，尝试从本地加载
          const savedDomains = localStorage.getItem('domainTracker_domains');
          if (savedDomains) {
            const decryptedDomains = decryptData(savedDomains);
            if (decryptedDomains) {
              setDomains(decryptedDomains);
              // 将本地数据同步到服务器
              await userDataSync.saveToolData('domain_tracker_domains', user.profile.id, decryptedDomains);
            }
          }

          const savedTransactions = localStorage.getItem('domainTracker_transactions');
          if (savedTransactions) {
            const decryptedTransactions = decryptData(savedTransactions);
            if (decryptedTransactions) {
              setTransactions(decryptedTransactions);
              // 将本地数据同步到服务器
              await userDataSync.saveToolData('domain_tracker_transactions', user.profile.id, decryptedTransactions);
            }
          }

          const savedStats = localStorage.getItem('domainTracker_stats');
          if (savedStats) {
            const decryptedStats = decryptData(savedStats);
            if (decryptedStats) {
              setStats(decryptedStats);
              // 将本地数据同步到服务器
              await userDataSync.saveToolData('domain_tracker_stats', user.profile.id, decryptedStats);
            }
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // 出错时回退到本地存储
        try {
          const savedDomains = localStorage.getItem('domainTracker_domains');
          if (savedDomains) {
            const decryptedDomains = decryptData(savedDomains);
            if (decryptedDomains) setDomains(decryptedDomains);
          }

          const savedTransactions = localStorage.getItem('domainTracker_transactions');
          if (savedTransactions) {
            const decryptedTransactions = decryptData(savedTransactions);
            if (decryptedTransactions) setTransactions(decryptedTransactions);
          }

          const savedStats = localStorage.getItem('domainTracker_stats');
          if (savedStats) {
            const decryptedStats = decryptData(savedStats);
            if (decryptedStats) setStats(decryptedStats);
          }
        } catch (localError) {
          console.error('Error loading data from localStorage:', localError);
        }
      }
      
      setLoading(false);
    };

    loadData();
  }, [user?.profile?.id]);

  // Save data to server and localStorage whenever domains, transactions, or stats change
  useEffect(() => {
    if (!loading && user?.profile?.id && (domains.length > 0 || transactions.length > 0)) {
      const saveData = async () => {
        try {
          console.log('Saving domain data:', { domains: domains.length, transactions: transactions.length });
          
          // 1. 保存到服务器
          await Promise.all([
            userDataSync.saveToolData('domain_tracker_domains', user.profile.id, domains),
            userDataSync.saveToolData('domain_tracker_transactions', user.profile.id, transactions),
            userDataSync.saveToolData('domain_tracker_stats', user.profile.id, stats)
          ]);

          // 2. 保存到本地作为缓存
          const encryptedDomains = encryptData(domains);
          const encryptedTransactions = encryptData(transactions);
          const encryptedStats = encryptData(stats);
          
          localStorage.setItem('domainTracker_domains', encryptedDomains);
          localStorage.setItem('domainTracker_transactions', encryptedTransactions);
          localStorage.setItem('domainTracker_stats', encryptedStats);
          
          console.log('Data saved successfully');
        } catch (error) {
          console.error('Error saving data:', error);
          // 即使服务器保存失败，也保存到本地
          try {
            const encryptedDomains = encryptData(domains);
            const encryptedTransactions = encryptData(transactions);
            const encryptedStats = encryptData(stats);
            
            localStorage.setItem('domainTracker_domains', encryptedDomains);
            localStorage.setItem('domainTracker_transactions', encryptedTransactions);
            localStorage.setItem('domainTracker_stats', encryptedStats);
            
            console.log('Data saved to localStorage as fallback');
          } catch (localError) {
            console.error('Error saving data to localStorage:', localError);
          }
        }
      };

      // 使用防抖来避免频繁保存
      const timeoutId = setTimeout(saveData, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [domains, transactions, loading, user?.profile?.id]);

  // Update stats whenever domains or transactions change
  useEffect(() => {
    if (!loading) {
      updateStats();
    }
  }, [domains, transactions, loading, updateStats]);

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

  // Renewal cycle cost calculation functions
  const getAnnualizedCost = (domain: Domain) => {
    return domain.renewal_cost / domain.renewal_cycle_years;
  };

  const getActualCost = (domain: Domain, year: number) => {
    const renewalYear = new Date(domain.next_renewal_date).getFullYear();
    return year === renewalYear ? domain.renewal_cost : 0;
  };

  const calculateAnnualizedRenewalCost = () => {
    return domains.reduce((total, domain) => {
      return total + getAnnualizedCost(domain);
    }, 0);
  };

  const calculateActualRenewalCost = (year: number) => {
    return domains.reduce((total, domain) => {
      return total + getActualCost(domain, year);
    }, 0);
  };

  // Get cost based on current view mode
  const getCostByViewMode = (domain: Domain) => {
    return costViewMode === 'annualized' ? getAnnualizedCost(domain) : domain.renewal_cost;
  };

  // Get total renewal cost based on current view mode
  const getTotalRenewalCostByViewMode = () => {
    if (costViewMode === 'annualized') {
      return calculateAnnualizedRenewalCost();
    } else {
      // For actual mode, calculate current year's actual renewal cost
      const currentYear = new Date().getFullYear();
      return calculateActualRenewalCost(currentYear);
    }
  };

  // Smart renewal reminder system based on renewal cycles
  const getRenewalReminders = () => {
    if (!reminderSettings.enabled) return [];

    const reminders: Array<{
      domain: string;
      daysUntilExpiry: number;
      renewalCost: number;
      cycleInfo: string;
      cycleType: string;
      priority: 'high' | 'medium' | 'low';
      expiryDate: string;
      registrar: string;
    }> = [];
    const now = new Date();

    domains.forEach(domain => {
      // Skip domains that are sold or expired
      if (domain.status === 'sold' || domain.status === 'expired') {
        return;
      }

      const expiryDate = new Date(domain.next_renewal_date);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Check if domain needs reminder
      reminderSettings.daysBefore.forEach(days => {
        if (daysUntilExpiry <= days && daysUntilExpiry > 0) {
          const renewalCost = domain.next_renewal_amount || domain.renewal_cost;
          const cycleInfo = domain.renewal_cycle_type === 'annual' ? '1 year' :
                           domain.renewal_cycle_type === 'biennial' ? '2 years' :
                           domain.renewal_cycle_type === 'triennial' ? '3 years' :
                           `${domain.renewal_cycle_years} years`;

          reminders.push({
            domain: domain.domain_name,
            daysUntilExpiry,
            renewalCost,
            cycleInfo,
            cycleType: domain.renewal_cycle_type,
            priority: daysUntilExpiry <= 7 ? 'high' : daysUntilExpiry <= 30 ? 'medium' : 'low',
            expiryDate: domain.next_renewal_date,
            registrar: domain.registrar
          });
        }
      });
    });

    return reminders.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  };

  // Calculate renewal cost forecast for next 12 months
  const getRenewalForecast = () => {
    const forecast = [];
    const now = new Date();

    for (let month = 0; month < 12; month++) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() + month, 1);
      const targetYear = targetDate.getFullYear();
      const targetMonth = targetDate.getMonth();

      let monthlyCost = 0;
      let domainCount = 0;

      domains.forEach(domain => {
        // Skip domains that are sold or expired
        if (domain.status === 'sold' || domain.status === 'expired') {
          return;
        }

        const expiryDate = new Date(domain.next_renewal_date);
        
        // Check if domain expires in this month
        if (expiryDate.getFullYear() === targetYear && expiryDate.getMonth() === targetMonth) {
          monthlyCost += domain.next_renewal_amount || domain.renewal_cost;
          domainCount++;
        }
      });

      forecast.push({
        month: targetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        cost: monthlyCost,
        domainCount,
        date: targetDate
      });
    }

    return forecast;
  };

  // 计算即将到期的域名数量（30天内）
  const calculateExpiringSoon = () => {
    return domains.filter(domain => {
      // Skip sold or expired domains
      if (domain.status === 'sold' || domain.status === 'expired') return false;
      const days = calculateDaysUntilExpiry(domain.next_renewal_date);
      return days <= 30 && days > 0;
    }).length;
  };

  // 计算平均ROI
  const calculateAverageROI = () => {
    if (domains.length === 0) return 0;
    const totalROI = domains.reduce((sum, domain) => {
      const totalCost = domain.purchase_cost + domain.total_renewal_paid;
      const sellTransactions = transactions.filter(t => t.domain_id === domain.id && t.type === 'sell');
      const totalRevenue = sellTransactions.reduce((sum, t) => sum + t.amount, 0);
      const profit = totalRevenue - totalCost;
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
        const sellTransactions = transactions.filter(t => t.domain_id === domain.id && t.type === 'sell');
        const totalRevenue = sellTransactions.reduce((sum, t) => sum + t.amount, 0);
        const profit = totalRevenue - totalCost;
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

  // 筛选和排序域名
  const getFilteredAndSortedDomains = () => {
    let filtered = domains.filter(domain => {
      // 搜索筛选
      if (filters.search && !domain.domain_name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      // 注册商筛选
      if (filters.registrar && domain.registrar !== filters.registrar) {
        return false;
      }
      // 状态筛选
      if (filters.status && domain.status !== filters.status) {
        return false;
      }
      // 标签筛选
      if (filters.tag && !domain.tags.includes(filters.tag)) {
        return false;
      }
      return true;
    });

    // 排序
    filtered.sort((a, b) => {
      let aValue: any = a[filters.sortBy as keyof Domain];
      let bValue: any = b[filters.sortBy as keyof Domain];

      // 处理特殊字段
      if (filters.sortBy === 'total_cost') {
        aValue = a.purchase_cost + a.total_renewal_paid;
        bValue = b.purchase_cost + b.total_renewal_paid;
      } else if (filters.sortBy === 'roi') {
        const aTotalCost = a.purchase_cost + a.total_renewal_paid;
        const bTotalCost = b.purchase_cost + b.total_renewal_paid;
        const aSellTransactions = transactions.filter(t => t.domain_id === a.id && t.type === 'sell');
        const bSellTransactions = transactions.filter(t => t.domain_id === b.id && t.type === 'sell');
        const aRevenue = aSellTransactions.reduce((sum, t) => sum + t.amount, 0);
        const bRevenue = bSellTransactions.reduce((sum, t) => sum + t.amount, 0);
        aValue = aTotalCost > 0 ? ((aRevenue - aTotalCost) / aTotalCost) * 100 : 0;
        bValue = bTotalCost > 0 ? ((bRevenue - bTotalCost) / bTotalCost) * 100 : 0;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  // 获取所有唯一的注册商
  const getUniqueRegistrars = () => {
    return [...new Set(domains.map(d => d.registrar))].sort();
  };

  // 获取所有唯一的标签
  const getUniqueTags = () => {
    const allTags = domains.flatMap(d => d.tags);
    return [...new Set(allTags)].sort();
  };

  // 批量操作函数
  const handleBulkAction = (action: string) => {
    if (selectedDomains.length === 0) return;

    switch (action) {
      case 'delete':
        if (confirm(`Are you sure you want to delete ${selectedDomains.length} domains?`)) {
          setDomains(prev => prev.filter(d => !selectedDomains.includes(d.id)));
          setTransactions(prev => prev.filter(t => !selectedDomains.includes(t.domain_id)));
          setSelectedDomains([]);
          setShowBulkActions(false);
          // Stats will be automatically updated by useEffect
        }
        break;
      case 'mark_for_sale':
        setDomains(prev => prev.map(d => 
          selectedDomains.includes(d.id) ? { ...d, status: 'for_sale' as const } : d
        ));
        setSelectedDomains([]);
        setShowBulkActions(false);
        break;
      case 'mark_active':
        setDomains(prev => prev.map(d => 
          selectedDomains.includes(d.id) ? { ...d, status: 'active' as const } : d
        ));
        setSelectedDomains([]);
        setShowBulkActions(false);
        break;
    }
  };

  // 选择/取消选择域名
  const toggleDomainSelection = (domainId: string) => {
    setSelectedDomains(prev => 
      prev.includes(domainId) 
        ? prev.filter(id => id !== domainId)
        : [...prev, domainId]
    );
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    const filteredDomains = getFilteredAndSortedDomains();
    if (selectedDomains.length === filteredDomains.length) {
      setSelectedDomains([]);
    } else {
      setSelectedDomains(filteredDomains.map(d => d.id));
    }
  };

  // 交易分析和统计函数
  const getFilteredAndSortedTransactions = () => {
    let filtered = transactions.filter(transaction => {
      // 搜索筛选
      if (transactionFilters.search && 
          !transaction.notes.toLowerCase().includes(transactionFilters.search.toLowerCase())) {
        return false;
      }
      // 类型筛选
      if (transactionFilters.type && transaction.type !== transactionFilters.type) {
        return false;
      }
      // 域名筛选
      if (transactionFilters.domain && transaction.domain_id !== transactionFilters.domain) {
        return false;
      }
      // 日期范围筛选
      if (transactionFilters.dateRange !== 'all') {
        const transactionDate = new Date(transaction.date);
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisYear = new Date(now.getFullYear(), 0, 1);
        
        switch (transactionFilters.dateRange) {
          case 'thisMonth':
            if (transactionDate < thisMonth) return false;
            break;
          case 'lastMonth':
            if (transactionDate < lastMonth || transactionDate >= thisMonth) return false;
            break;
          case 'thisYear':
            if (transactionDate < thisYear) return false;
            break;
        }
      }
      return true;
    });

    // 排序
    filtered.sort((a, b) => {
      let aValue: any = a[transactionFilters.sortBy as keyof DomainTransaction];
      let bValue: any = b[transactionFilters.sortBy as keyof DomainTransaction];

      if (transactionFilters.sortBy === 'date') {
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
      }

      if (transactionFilters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  // 获取交易统计
  const getTransactionStats = () => {
    const filtered = getFilteredAndSortedTransactions();
    const stats = {
      total: filtered.length,
      totalAmount: filtered.reduce((sum, t) => sum + t.amount, 0),
      buyAmount: filtered.filter(t => t.type === 'buy').reduce((sum, t) => sum + t.amount, 0),
      sellAmount: filtered.filter(t => t.type === 'sell').reduce((sum, t) => sum + t.amount, 0),
      renewAmount: filtered.filter(t => t.type === 'renew').reduce((sum, t) => sum + t.amount, 0),
      feeAmount: filtered.filter(t => t.type === 'fee').reduce((sum, t) => sum + t.amount, 0),
      transferAmount: filtered.filter(t => t.type === 'transfer').reduce((sum, t) => sum + t.amount, 0)
    };
    return stats;
  };

  // 获取月度交易趋势
  const getMonthlyTransactionTrend = () => {
    const monthlyData: { [key: string]: { buy: number, sell: number, renew: number, fee: number, transfer: number } } = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { buy: 0, sell: 0, renew: 0, fee: 0, transfer: 0 };
      }
      
      monthlyData[monthKey][transaction.type as keyof typeof monthlyData[string]] += transaction.amount;
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // 最近12个月
      .map(([month, data]) => ({
        month,
        ...data,
        total: data.buy + data.sell + data.renew + data.fee + data.transfer
      }));
  };

  // 获取交易类型分布
  const getTransactionTypeDistribution = () => {
    const distribution = transactions.reduce((acc, transaction) => {
      acc[transaction.type] = (acc[transaction.type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(distribution).map(([type, count]) => ({
      type,
      count,
      percentage: (count / transactions.length) * 100,
      amount: transactions.filter(t => t.type === type).reduce((sum, t) => sum + t.amount, 0)
    }));
  };

  // 获取交易类型颜色
  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'buy': return 'bg-red-100 text-red-800';
      case 'sell': return 'bg-green-100 text-green-800';
      case 'renew': return 'bg-blue-100 text-blue-800';
      case 'transfer': return 'bg-yellow-100 text-yellow-800';
      case 'fee': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Analytics helper functions
  const getROIAnalysis = () => {
    const domainROIs = domains.map(domain => {
      const domainTransactions = transactions.filter(t => t.domain_id === domain.id);
      const totalCost = domain.purchase_cost + domain.total_renewal_paid;
      const totalRevenue = domainTransactions
        .filter(t => t.type === 'sell')
        .reduce((sum, t) => sum + t.amount, 0);
      const roi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
      
      return {
        ...domain,
        totalCost,
        totalRevenue,
        roi,
        ageInMonths: Math.floor((Date.now() - new Date(domain.purchase_date).getTime()) / (1000 * 60 * 60 * 24 * 30))
      };
    });

    return domainROIs.sort((a, b) => b.roi - a.roi);
  };

  const getRenewalTrendAnalysis = () => {
    const monthlyRenewals: { [key: string]: number } = {};
    const monthlyNewDomains: { [key: string]: number } = {};
    
    if (costViewMode === 'annualized') {
      // 年化模式：显示每个月的年化续费成本
      domains.forEach(domain => {
        const annualizedCost = getAnnualizedCost(domain);
        const date = new Date(domain.purchase_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyRenewals[monthKey] = (monthlyRenewals[monthKey] || 0) + annualizedCost;
      });
    } else {
      // 实际模式：显示实际续费交易
      transactions.filter(t => t.type === 'renew').forEach(transaction => {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyRenewals[monthKey] = (monthlyRenewals[monthKey] || 0) + transaction.amount;
      });
    }

    // 分析新域名趋势
    domains.forEach(domain => {
      const date = new Date(domain.purchase_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyNewDomains[monthKey] = (monthlyNewDomains[monthKey] || 0) + 1;
    });

    return {
      renewals: Object.entries(monthlyRenewals)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12)
        .map(([month, amount]) => ({ month, amount })),
      newDomains: Object.entries(monthlyNewDomains)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12)
        .map(([month, count]) => ({ month, count }))
    };
  };

  const getRegistrarTLDAnalysis = () => {
    const registrarStats: { [key: string]: { count: number, totalCost: number, totalRevenue: number } } = {};
    const tldStats: { [key: string]: { count: number, totalCost: number, totalRevenue: number } } = {};

    domains.forEach(domain => {
      const domainTransactions = transactions.filter(t => t.domain_id === domain.id);
      // Use view mode appropriate cost calculation
      const totalCost = domain.purchase_cost + (costViewMode === 'annualized' ? getAnnualizedCost(domain) : domain.total_renewal_paid);
      const totalRevenue = domainTransactions
        .filter(t => t.type === 'sell')
        .reduce((sum, t) => sum + t.amount, 0);

      // 注册商统计
      if (!registrarStats[domain.registrar]) {
        registrarStats[domain.registrar] = { count: 0, totalCost: 0, totalRevenue: 0 };
      }
      registrarStats[domain.registrar].count += 1;
      registrarStats[domain.registrar].totalCost += totalCost;
      registrarStats[domain.registrar].totalRevenue += totalRevenue;

      // TLD统计
      const tld = domain.domain_name.split('.').pop() || 'unknown';
      if (!tldStats[tld]) {
        tldStats[tld] = { count: 0, totalCost: 0, totalRevenue: 0 };
      }
      tldStats[tld].count += 1;
      tldStats[tld].totalCost += totalCost;
      tldStats[tld].totalRevenue += totalRevenue;
    });

    return {
      registrars: Object.entries(registrarStats)
        .map(([name, stats]) => ({
          name,
          ...stats,
          roi: stats.totalCost > 0 ? ((stats.totalRevenue - stats.totalCost) / stats.totalCost) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count),
      tlds: Object.entries(tldStats)
        .map(([name, stats]) => ({
          name,
          ...stats,
          roi: stats.totalCost > 0 ? ((stats.totalRevenue - stats.totalCost) / stats.totalCost) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count)
    };
  };

  const getInvestmentStrategyInsights = () => {
    const roiAnalysis = getROIAnalysis();
    const registrarTLDAnalysis = getRegistrarTLDAnalysis();
    
    const insights = [];
    
    // ROI洞察
    const topPerformers = roiAnalysis.slice(0, 3);
    if (topPerformers.length > 0) {
      insights.push({
        type: 'success',
        title: 'Top Performing Domains',
        description: `Your best investments: ${topPerformers.map(d => d.domain_name).join(', ')} with average ROI of ${(topPerformers.reduce((sum, d) => sum + d.roi, 0) / topPerformers.length).toFixed(1)}%`
      });
    }

    // 注册商洞察
    const bestRegistrar = registrarTLDAnalysis.registrars[0];
    if (bestRegistrar && bestRegistrar.count > 1) {
      insights.push({
        type: 'info',
        title: 'Best Registrar Performance',
        description: `${bestRegistrar.name} shows the best performance with ${bestRegistrar.count} domains and ${bestRegistrar.roi.toFixed(1)}% ROI`
      });
    }

    // TLD洞察
    const bestTLD = registrarTLDAnalysis.tlds[0];
    if (bestTLD && bestTLD.count > 1) {
      insights.push({
        type: 'info',
        title: 'Best TLD Performance',
        description: `.${bestTLD.name} domains show strong performance with ${bestTLD.count} domains and ${bestTLD.roi.toFixed(1)}% ROI`
      });
    }

    // 续费提醒
    const expiringSoon = domains.filter(d => {
      // Skip sold or expired domains
      if (d.status === 'sold' || d.status === 'expired') return false;
      const expiryDate = new Date(d.next_renewal_date);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    });

    if (expiringSoon.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Renewal Reminder',
        description: `${expiringSoon.length} domains are expiring within 30 days. Consider renewing to maintain your portfolio.`
      });
    }

    return insights;
  };

  const handleAddDomain = () => {
    // Input validation and sanitization
    const sanitizedDomainName = sanitizeInput(newDomain.domain_name);
    const sanitizedRegistrar = sanitizeInput(newDomain.registrar);
    
    if (!sanitizedDomainName || !sanitizedRegistrar) {
      showToast('Please fill in required fields', 'error');
      return;
    }

    if (!validateDomainName(sanitizedDomainName)) {
      showToast('Please enter a valid domain name', 'error');
      return;
    }

    // Validate dates
    if (newDomain.purchase_date && !validateDateInput(newDomain.purchase_date)) {
      showToast('Please enter a valid purchase date', 'error');
      return;
    }

    // Expiry date is optional - if not provided, calculate based on purchase date and renewal cycle
    let expiryDate: Date;
    if (newDomain.expiry_date && validateDateInput(newDomain.expiry_date)) {
      expiryDate = new Date(newDomain.expiry_date);
    } else {
      // Calculate expiry date based on purchase date and renewal cycle
      const purchaseDate = newDomain.purchase_date ? new Date(newDomain.purchase_date) : new Date();
      const renewalYears = newDomain.renewal_cycle_years || 1;
      expiryDate = new Date(purchaseDate.getTime() + (renewalYears * 365 * 24 * 60 * 60 * 1000));
    }

    // Validate numeric inputs
    const validatedPurchaseCost = validateNumericInput(newDomain.purchase_cost.toString(), 0, 1000000);
    const validatedRenewalCost = validateNumericInput(newDomain.renewal_cost.toString(), 0, 1000000);

    // 使用用户提供的购入日期，如果没有提供则默认为今天
    const purchaseDate = newDomain.purchase_date ? new Date(newDomain.purchase_date) : new Date();

    const domain: Domain = {
      id: crypto.randomUUID(),
      domain_name: sanitizedDomainName,
      registrar: sanitizedRegistrar,
      purchase_date: purchaseDate.toISOString().split('T')[0],
      purchase_cost: validatedPurchaseCost,
      renewal_cost: validatedRenewalCost || validatedPurchaseCost,
      total_renewal_paid: 0,
      next_renewal_date: expiryDate.toISOString().split('T')[0],
      status: 'active',
      estimated_value: 0,
      tags: newDomain.tags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Renewal cycle fields
      renewal_cycle_years: newDomain.renewal_cycle_years,
      renewal_cycle_type: newDomain.renewal_cycle_type,
      last_renewal_amount: newDomain.last_renewal_amount,
      last_renewal_date: newDomain.last_renewal_date,
      next_renewal_amount: newDomain.next_renewal_amount || newDomain.renewal_cost,
      renewal_count: newDomain.renewal_count || 0
    };

    setDomains(prev => [...prev, domain]);
    
    // Add purchase transaction
    const transaction: DomainTransaction = {
      id: crypto.randomUUID(),
      domain_id: domain.id,
      type: 'buy',
      amount: validatedPurchaseCost,
      currency: 'USD',
      date: new Date().toISOString().split('T')[0],
      notes: 'Initial purchase'
    };
    
    setTransactions(prev => [...prev, transaction]);
    
    // 根据用户填写的续费次数或域名年龄自动创建续费交易
    const renewalCycleYears = newDomain.renewal_cycle_years || 1;
    let actualRenewalCount = 0;
    
    // 优先使用用户手动填写的续费次数
    if (newDomain.renewal_count && newDomain.renewal_count > 0) {
      actualRenewalCount = newDomain.renewal_count;
    } else {
      // 如果没有手动填写，则根据域名年龄和续费周期计算
      const ageInYears = (new Date().getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      actualRenewalCount = Math.floor(ageInYears / renewalCycleYears);
    }
    
    if (actualRenewalCount > 0) {
      // 为每次续费创建交易记录
      for (let i = 1; i <= actualRenewalCount; i++) {
        const renewalDate = new Date(purchaseDate.getTime() + (i * renewalCycleYears * 365 * 24 * 60 * 60 * 1000));
        const renewalTransaction: DomainTransaction = {
          id: crypto.randomUUID(),
          domain_id: domain.id,
          type: 'renew',
          amount: validatedRenewalCost || validatedPurchaseCost,
          currency: 'USD',
          date: renewalDate.toISOString().split('T')[0],
          notes: `Auto-calculated renewal #${i} (${renewalCycleYears} year cycle)`
        };
        setTransactions(prev => [...prev, renewalTransaction]);
      }
      
      // 更新域名的续费信息
      setDomains(prev => prev.map(d => 
        d.id === domain.id 
          ? { 
              ...d, 
              total_renewal_paid: actualRenewalCount * (validatedRenewalCost || validatedPurchaseCost),
              renewal_count: actualRenewalCount,
              last_renewal_date: new Date(purchaseDate.getTime() + (actualRenewalCount * renewalCycleYears * 365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
            }
          : d
      ));
    }
    
    // Stats will be automatically updated by useEffect

    // Reset form
    setNewDomain({
      domain_name: '',
      registrar: '',
      purchase_date: '',
      purchase_cost: 0,
      renewal_cost: 0,
      expiry_date: '',
      tags: [],
      // Renewal cycle fields
      renewal_cycle_years: 1,
      renewal_cycle_type: 'annual' as 'annual' | 'biennial' | 'triennial' | 'custom',
      last_renewal_amount: 0,
      last_renewal_date: '',
      next_renewal_amount: 0,
      renewal_count: 0
    });
    
    setShowAddDomainModal(false);
    showToast('Domain added successfully!', 'success');
  };

  const handleAddTransaction = () => {
    // Input validation and sanitization
    const sanitizedNotes = sanitizeInput(newTransaction.notes);
    const sanitizedPlatform = sanitizeInput(newTransaction.platform);
    const validatedAmount = validateNumericInput(newTransaction.amount.toString(), 0, 1000000);
    
    if (!newTransaction.domain_id || !validatedAmount) {
      showToast('Please fill in required fields', 'error');
      return;
    }

    // Validate transaction time if provided
    if (newTransaction.transaction_time && !validateDateInput(newTransaction.transaction_time)) {
      showToast('Please enter a valid transaction time', 'error');
      return;
    }

    // Calculate fee for sell transactions
    let grossAmount = validatedAmount;
    let feeAmount = 0;
    let feePercentage = 0;

    if (newTransaction.type === 'sell' && newTransaction.gross_amount > 0) {
      grossAmount = newTransaction.gross_amount;
      feeAmount = grossAmount - validatedAmount;
      feePercentage = grossAmount > 0 ? (feeAmount / grossAmount) * 100 : 0;
    } else if (newTransaction.type === 'sell' && newTransaction.fee_percentage > 0) {
      feePercentage = newTransaction.fee_percentage;
      feeAmount = (validatedAmount * feePercentage) / (100 - feePercentage);
      grossAmount = validatedAmount + feeAmount;
    }

    const transaction: DomainTransaction = {
      id: crypto.randomUUID(),
      domain_id: newTransaction.domain_id,
      type: newTransaction.type,
      amount: validatedAmount,
      currency: newTransaction.currency,
      date: new Date().toISOString().split('T')[0],
      notes: sanitizedNotes,
      platform: sanitizedPlatform || undefined,
      transaction_time: newTransaction.transaction_time || undefined,
      // 手续费相关字段
      gross_amount: newTransaction.type === 'sell' ? grossAmount : undefined,
      fee_percentage: newTransaction.type === 'sell' ? feePercentage : undefined,
      fee_amount: newTransaction.type === 'sell' ? feeAmount : undefined
    };

    setTransactions(prev => [...prev, transaction]);

    // Update domain based on transaction type
    if (newTransaction.type === 'sell') {
      setDomains(prev => prev.map(domain => 
        domain.id === newTransaction.domain_id 
          ? { ...domain, status: 'sold' as const }
          : domain
      ));
    } else if (newTransaction.type === 'renew') {
      setDomains(prev => prev.map(domain => {
        if (domain.id === newTransaction.domain_id) {
          // Calculate new expiry date based on renewal cycle
          const currentExpiry = new Date(domain.next_renewal_date);
          const renewalYears = domain.renewal_cycle_years || 1;
          const newExpiry = new Date(currentExpiry.getTime() + (renewalYears * 365 * 24 * 60 * 60 * 1000));
          
          return {
            ...domain, 
            total_renewal_paid: domain.total_renewal_paid + newTransaction.amount,
            next_renewal_date: newExpiry.toISOString().split('T')[0],
            last_renewal_amount: newTransaction.amount,
            last_renewal_date: new Date().toISOString().split('T')[0]
          };
        }
        return domain;
      }));
    }
    
    // Stats will be automatically updated by useEffect

    // Reset form
    setNewTransaction({
      domain_id: '',
      type: 'buy',
      amount: 0,
      currency: 'USD',
      notes: '',
      platform: '',
      transaction_time: '',
      // 手续费相关字段
      gross_amount: 0,
      fee_percentage: 0,
      fee_amount: 0,
      // 分期付款相关字段
      payment_plan: 'lump_sum',
      installment_period: 0,
      installment_fee_percentage: 0,
      installment_fee_amount: 0,
      monthly_payment: 0,
      total_installment_amount: 0,
      payment_status: 'completed',
      paid_installments: 0,
      remaining_installments: 0
    });
    
    setShowAddTransactionModal(false);
    showToast('Transaction added successfully!', 'success');
  };

  const handleEditDomain = (domain: Domain) => {
    setEditingDomain(domain);
    setNewDomain({
      domain_name: domain.domain_name,
      registrar: domain.registrar,
      purchase_date: domain.purchase_date,
      purchase_cost: domain.purchase_cost,
      renewal_cost: domain.renewal_cost,
      expiry_date: domain.next_renewal_date,
      tags: domain.tags,
      // Renewal cycle fields
      renewal_cycle_years: domain.renewal_cycle_years || 1,
      renewal_cycle_type: domain.renewal_cycle_type || 'annual',
      last_renewal_amount: domain.last_renewal_amount || 0,
      last_renewal_date: domain.last_renewal_date || '',
      next_renewal_amount: domain.next_renewal_amount || domain.renewal_cost,
      renewal_count: domain.renewal_count || 0
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
      purchase_date: newDomain.purchase_date,
      purchase_cost: newDomain.purchase_cost,
      renewal_cost: newDomain.renewal_cost,
      estimated_value: 0,
      next_renewal_date: newDomain.expiry_date,
      tags: newDomain.tags,
      updated_at: new Date().toISOString(),
      // Renewal cycle fields
      renewal_cycle_years: newDomain.renewal_cycle_years,
      renewal_cycle_type: newDomain.renewal_cycle_type,
      last_renewal_amount: newDomain.last_renewal_amount,
      last_renewal_date: newDomain.last_renewal_date,
      next_renewal_amount: newDomain.next_renewal_amount,
      renewal_count: newDomain.renewal_count
    };

    setDomains(prev => prev.map(domain => 
      domain.id === editingDomain.id ? updatedDomain : domain
    ));

    // Reset form and close modal
    setNewDomain({
      domain_name: '',
      registrar: '',
      purchase_date: '',
      purchase_cost: 0,
      renewal_cost: 0,
      expiry_date: '',
      tags: [],
      // Renewal cycle fields
      renewal_cycle_years: 1,
      renewal_cycle_type: 'annual' as 'annual' | 'biennial' | 'triennial' | 'custom',
      last_renewal_amount: 0,
      last_renewal_date: '',
      next_renewal_amount: 0,
      renewal_count: 0
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
      
      // Stats will be automatically updated by useEffect
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
              <p className="text-3xl font-bold text-gray-900">{domains.length}</p>
            </div>
            <Globe className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Investment Cost</p>
              <p className="text-3xl font-bold text-red-600">${calculateTotalCost().toFixed(2)}</p>
              
              {/* 详细成本分解 */}
              <div className="mt-3 bg-red-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-red-900 mb-2">💰 成本构成</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-800">购买成本</span>
                    <span className="text-sm font-medium text-red-900">
                      ${domains.reduce((sum, d) => sum + (d.purchase_cost || 0), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-800">已付续费</span>
                    <span className="text-sm font-medium text-red-900">
                      ${domains.reduce((sum, d) => sum + (d.total_renewal_paid || 0), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-red-200 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-red-900">总投资</span>
                      <span className="text-sm font-bold text-red-900">
                        ${calculateTotalCost().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-red-700 mt-2 space-y-1">
                  <div>💡 包含所有购买费用和已支付的续费费用</div>
                  {domains.filter(d => d.total_renewal_paid > 0).length > 0 ? (
                    <div>✅ 已记录 {domains.filter(d => d.total_renewal_paid > 0).length} 个域名的续费交易</div>
                  ) : (
                    <div>⚠️ 尚未记录任何续费交易，请添加续费交易以更新总成本</div>
                  )}
                </div>
              </div>
            </div>
            <DollarSign className="h-8 w-8 text-red-600 ml-4" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Net Revenue (净收入)</p>
              <p className="text-3xl font-bold text-green-600">${calculateTotalRevenue().toFixed(2)}</p>
              
              {/* 收入详细分解 */}
              <div className="mt-3 bg-green-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-green-900 mb-2">💵 收入构成</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-800">总销售额</span>
                    <span className="text-sm font-medium text-green-900">
                      ${calculateTotalGrossSales().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-800">平台手续费</span>
                    <span className="text-sm font-medium text-red-600">
                      -${calculateTotalPlatformFees().toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-green-200 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-green-900">净收入</span>
                      <span className="text-sm font-bold text-green-900">
                        ${calculateTotalRevenue().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-green-700 mt-2">
                  💡 扣除平台手续费后的实际收入
                </div>
              </div>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600 ml-4" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ROI</p>
              <p className={`text-3xl font-bold ${calculateOverallROI() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {calculateOverallROI().toFixed(1)}%
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
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-medium text-gray-600">Renewal Costs</p>
                <button
                  onClick={() => setCostViewMode(costViewMode === 'annualized' ? 'actual' : 'annualized')}
                  className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors"
                  title="Click to switch view mode"
                >
                  {costViewMode === 'annualized' ? 'Show Actual' : 'Show Annualized'}
                </button>
              </div>
              <p className="text-3xl font-bold text-orange-600">${getTotalRenewalCostByViewMode().toFixed(2)}</p>
              
              {/* 详细分解显示 */}
              <div className="mt-3 space-y-2">
                {costViewMode === 'annualized' ? (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-blue-900 mb-2">📊 Annualized View (平均年成本)</div>
                    <div className="text-xs text-blue-800 space-y-1">
                      {domains.filter(d => d.status !== 'sold' && d.status !== 'expired').map(domain => {
                        const annualizedCost = getAnnualizedCost(domain);
                        return (
                          <div key={domain.id} className="flex justify-between">
                            <span>{domain.domain_name}</span>
                            <span>${annualizedCost.toFixed(2)}/年</span>
                          </div>
                        );
                      }).slice(0, 3)}
                      {domains.filter(d => d.status !== 'sold' && d.status !== 'expired').length > 3 && (
                        <div className="text-blue-600">+{domains.filter(d => d.status !== 'sold' && d.status !== 'expired').length - 3} more domains...</div>
                      )}
                    </div>
                    <div className="text-xs text-blue-700 mt-2">
                      💡 将多年度续费成本平均到每年，便于预算规划
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-green-900 mb-2">📅 Actual View (今年实际成本)</div>
                    <div className="text-xs text-green-800 space-y-1">
                      {domains.filter(d => {
                        if (d.status === 'sold' || d.status === 'expired') return false;
                        const renewalYear = new Date(d.next_renewal_date).getFullYear();
                        return renewalYear === new Date().getFullYear();
                      }).map(domain => (
                        <div key={domain.id} className="flex justify-between">
                          <span>{domain.domain_name}</span>
                          <span>${domain.renewal_cost.toFixed(2)}</span>
                        </div>
                      )).slice(0, 3)}
                      {domains.filter(d => {
                        if (d.status === 'sold' || d.status === 'expired') return false;
                        const renewalYear = new Date(d.next_renewal_date).getFullYear();
                        return renewalYear === new Date().getFullYear();
                      }).length === 0 && (
                        <div className="text-green-600">今年没有域名需要续费</div>
                      )}
                    </div>
                    <div className="text-xs text-green-700 mt-2">
                      💡 只显示今年实际需要续费的域名成本
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Calendar className="h-8 w-8 text-orange-600 ml-4" />
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
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPortfolio = () => {
    const filteredDomains = getFilteredAndSortedDomains();
    
    return (
      <div className="space-y-6">
        {/* Advanced Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search domains..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Registrar Filter */}
            <select
              value={filters.registrar}
              onChange={(e) => setFilters(prev => ({ ...prev, registrar: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Registrars</option>
              {getUniqueRegistrars().map(registrar => (
                <option key={registrar} value={registrar}>{registrar}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="for_sale">For Sale</option>
              <option value="sold">Sold</option>
              <option value="expired">Expired</option>
            </select>

            {/* Tag Filter */}
            <select
              value={filters.tag}
              onChange={(e) => setFilters(prev => ({ ...prev, tag: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Tags</option>
              {getUniqueTags().map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="domain_name">Domain Name</option>
              <option value="registrar">Registrar</option>
              <option value="purchase_cost">Purchase Cost</option>
              <option value="total_cost">Total Cost</option>
              <option value="roi">ROI</option>
              <option value="next_renewal_date">Next Renewal</option>
            </select>
          </div>

          {/* Sort Order and Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {filters.sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                <span>{filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
              </button>
              
              {selectedDomains.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{selectedDomains.length} selected</span>
                  <button
                    onClick={() => setSelectedDomains([])}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear
                  </button>
                </div>
              )}
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
        </div>

        {/* Bulk Actions Bar */}
        {selectedDomains.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedDomains.length} domain{selectedDomains.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBulkAction('mark_for_sale')}
                    className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
                  >
                    Mark for Sale
                  </button>
                  <button
                    onClick={() => handleBulkAction('mark_active')}
                    className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                  >
                    Mark Active
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <button
                onClick={() => setSelectedDomains([])}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

      {/* Domains Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedDomains.length === filteredDomains.length && filteredDomains.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
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
                  ROI / Net Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Renewal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDomains.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center">
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
                
                const sellTransactions = transactions.filter(t => t.domain_id === domain.id && t.type === 'sell');
                const totalRevenue = sellTransactions.reduce((sum, t) => sum + t.amount, 0);
                const roi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
                
                return (
                  <tr key={domain.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedDomains.includes(domain.id)}
                        onChange={() => toggleDomainSelection(domain.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{domain.domain_name}</div>
                        <div className="text-sm text-gray-500">
                          Purchased: {new Date(domain.purchase_date).toLocaleDateString()}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {domain.status === 'sold' ? (
                        <div>
                          <div className={`font-medium ${totalRevenue - totalCost >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${(totalRevenue - totalCost).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            ROI: {roi.toFixed(1)}%
                          </div>
                        </div>
                      ) : (
                        <span className={`font-medium ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {roi.toFixed(1)}%
                        </span>
                      )}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {domain.tags.length > 0 ? (
                          domain.tags.map(tag => (
                            <span key={tag} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">No tags</span>
                        )}
                      </div>
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
  };

  const renderTransactions = () => {
    const filteredTransactions = getFilteredAndSortedTransactions();
    const transactionStats = getTransactionStats();
    const monthlyTrend = getMonthlyTransactionTrend();
    const typeDistribution = getTransactionTypeDistribution();
    
    return (
      <div className="space-y-6">
        {/* Header */}
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

        {/* Transaction Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-3xl font-bold text-gray-900">{transactionStats.total}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-3xl font-bold text-gray-900">${transactionStats.totalAmount.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Buy Amount</p>
                <p className="text-3xl font-bold text-red-600">${transactionStats.buyAmount.toFixed(2)}</p>
              </div>
              <ArrowDown className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sell Amount</p>
                <p className="text-3xl font-bold text-green-600">${transactionStats.sellAmount.toFixed(2)}</p>
              </div>
              <ArrowUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Advanced Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notes..."
                value={transactionFilters.search}
                onChange={(e) => setTransactionFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={transactionFilters.type}
              onChange={(e) => setTransactionFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
              <option value="renew">Renew</option>
              <option value="transfer">Transfer</option>
              <option value="fee">Fee</option>
            </select>

            {/* Domain Filter */}
            <select
              value={transactionFilters.domain}
              onChange={(e) => setTransactionFilters(prev => ({ ...prev, domain: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Domains</option>
              {domains.map(domain => (
                <option key={domain.id} value={domain.id}>{domain.domain_name}</option>
              ))}
            </select>

            {/* Date Range Filter */}
            <select
              value={transactionFilters.dateRange}
              onChange={(e) => setTransactionFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisYear">This Year</option>
            </select>

            {/* Sort By */}
            <select
              value={transactionFilters.sortBy}
              onChange={(e) => setTransactionFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="type">Type</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setTransactionFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {transactionFilters.sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                <span>{transactionFilters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
              </button>
              
              <span className="text-sm text-gray-600">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
              Monthly Transaction Trend
            </h3>
            <div className="space-y-3">
              {monthlyTrend.length > 0 ? (
                monthlyTrend.map((month, index) => (
                  <div key={month.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{month.month}</p>
                        <p className="text-sm text-gray-600">
                          Buy: ${month.buy.toFixed(0)} | Sell: ${month.sell.toFixed(0)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">${month.total.toFixed(0)}</p>
                      <p className="text-sm text-gray-600">Total</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No transaction data</p>
                  <p className="text-sm">Add transactions to see trends</p>
                </div>
              )}
            </div>
          </div>

          {/* Transaction Type Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 text-green-500 mr-2" />
              Transaction Type Distribution
            </h3>
            <div className="space-y-3">
              {typeDistribution.length > 0 ? (
                typeDistribution.map((item, index) => (
                  <div key={item.type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full" style={{
                        backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                      }}></div>
                      <span className="text-sm font-medium text-gray-900 capitalize">{item.type}</span>
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
                  <p className="text-sm">Add transactions to see distribution</p>
                </div>
              )}
            </div>
          </div>
        </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date/Time
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
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <DollarSign className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {transactions.length === 0 ? 'No transactions yet' : 'No transactions match your filters'}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {transactions.length === 0 
                          ? 'Add your first transaction to start tracking your domain investments.'
                          : 'Try adjusting your filters to see more transactions.'
                        }
                      </p>
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
                filteredTransactions.map((transaction) => {
                const domain = domains.find(d => d.id === transaction.domain_id);
                return (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.transaction_time 
                        ? new Date(transaction.transaction_time).toLocaleString()
                        : new Date(transaction.date).toLocaleDateString()
                      }
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
                      <div>
                        <div className="font-medium">${transaction.amount.toFixed(2)} {transaction.currency}</div>
                        {transaction.type === 'sell' && transaction.gross_amount && transaction.gross_amount > transaction.amount && (
                          <div className="text-xs text-gray-500">
                            Gross: ${transaction.gross_amount.toFixed(2)}
                            {transaction.fee_amount && transaction.fee_amount > 0 && (
                              <span> • Fee: ${transaction.fee_amount.toFixed(2)}</span>
                            )}
                          </div>
                        )}
                        {transaction.type === 'sell' && transaction.payment_plan === 'installment' && (
                          <div className="text-xs text-green-600 mt-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">分期付款</span>
                              <span className={`px-1 py-0.5 text-xs rounded ${
                                transaction.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                                transaction.payment_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {transaction.payment_status === 'completed' ? '已完成' :
                                 transaction.payment_status === 'in_progress' ? '进行中' : '逾期'}
                              </span>
                            </div>
                            {transaction.installment_period && (
                              <div className="text-xs text-gray-500">
                                {transaction.paid_installments || 0}/{transaction.installment_period} 期
                                {transaction.monthly_payment && (
                                  <span> • ${transaction.monthly_payment.toFixed(2)}/月</span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
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
  };

  const renderAnalytics = () => {
    const roiAnalysis = getROIAnalysis();
    const renewalTrends = getRenewalTrendAnalysis();
    const registrarTLDAnalysis = getRegistrarTLDAnalysis();
    const insights = getInvestmentStrategyInsights();

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>
          <div className="flex space-x-2">
            {/* Cost View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setCostViewMode('annualized')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  costViewMode === 'annualized'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Annualized
              </button>
              <button
                onClick={() => setCostViewMode('actual')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  costViewMode === 'actual'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Actual
              </button>
            </div>
            <select
              value={analyticsFilters.timeRange}
              onChange={(e) => setAnalyticsFilters(prev => ({ ...prev, timeRange: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="12months">Last 12 Months</option>
              <option value="24months">Last 24 Months</option>
              <option value="all">All Time</option>
            </select>
            <select
              value={analyticsFilters.sortBy}
              onChange={(e) => setAnalyticsFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="roi">Sort by ROI</option>
              <option value="cost">Sort by Cost</option>
              <option value="revenue">Sort by Revenue</option>
              <option value="age">Sort by Age</option>
            </select>
          </div>
        </div>

        {/* Investment Strategy Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {insights.map((insight, index) => (
            <div key={index} className={`rounded-lg p-4 ${
              insight.type === 'success' ? 'bg-green-50 border border-green-200' :
              insight.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  insight.type === 'success' ? 'bg-green-100' :
                  insight.type === 'warning' ? 'bg-yellow-100' :
                  'bg-blue-100'
                }`}>
                  {insight.type === 'success' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : insight.type === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  ) : (
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`text-sm font-semibold ${
                    insight.type === 'success' ? 'text-green-800' :
                    insight.type === 'warning' ? 'text-yellow-800' :
                    'text-blue-800'
                  }`}>
                    {insight.title}
                  </h4>
                  <p className={`text-sm mt-1 ${
                    insight.type === 'success' ? 'text-green-700' :
                    insight.type === 'warning' ? 'text-yellow-700' :
                    'text-blue-700'
                  }`}>
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ROI Analysis & Rankings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top ROI Domains</h3>
            <div className="space-y-3">
              {roiAnalysis.slice(0, 5).map((domain, index) => (
                <div key={domain.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{domain.domain_name}</div>
                      <div className="text-sm text-gray-500">{domain.registrar}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${
                      domain.roi > 0 ? 'text-green-600' : domain.roi < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {domain.roi > 0 ? '+' : ''}{domain.roi.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">${domain.totalRevenue.toFixed(0)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Renewal Trends</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  {costViewMode === 'annualized' ? 'Annualized Renewal Costs' : 'Actual Renewal Costs'}
                </h4>
                <p className="text-xs text-gray-500 mb-3">
                  {costViewMode === 'annualized' 
                    ? 'Shows annualized cost (renewal cost ÷ cycle years) for consistent comparison'
                    : 'Shows actual renewal cost when domains are due for renewal'
                  }
                </p>
                <div className="space-y-2">
                  {renewalTrends.renewals.slice(-6).map(({ month, amount }) => (
                    <div key={month} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{month}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min((amount / Math.max(...renewalTrends.renewals.map(r => r.amount))) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">${amount.toFixed(0)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">New Domain Acquisitions</h4>
                <div className="space-y-2">
                  {renewalTrends.newDomains.slice(-6).map(({ month, count }) => (
                    <div key={month} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{month}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${Math.min((count / Math.max(...renewalTrends.newDomains.map(d => d.count))) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Registrar & TLD Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Registrar Performance</h3>
            <div className="space-y-3">
              {registrarTLDAnalysis.registrars.slice(0, 5).map((registrar) => (
                <div key={registrar.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{registrar.name}</div>
                    <div className="text-sm text-gray-500">{registrar.count} domains</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${
                      registrar.roi > 0 ? 'text-green-600' : registrar.roi < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {registrar.roi > 0 ? '+' : ''}{registrar.roi.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">${registrar.totalCost.toFixed(0)} cost</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">TLD Performance</h3>
            <div className="space-y-3">
              {registrarTLDAnalysis.tlds.slice(0, 5).map((tld) => (
                <div key={tld.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">.{tld.name}</div>
                    <div className="text-sm text-gray-500">{tld.count} domains</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${
                      tld.roi > 0 ? 'text-green-600' : tld.roi < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {tld.roi > 0 ? '+' : ''}{tld.roi.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">${tld.totalCost.toFixed(0)} cost</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Portfolio Health Metrics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Health Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {roiAnalysis.filter(d => d.roi > 0).length}
              </div>
              <div className="text-sm text-gray-500">Profitable Domains</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {roiAnalysis.length > 0 ? (roiAnalysis.reduce((sum, d) => sum + d.roi, 0) / roiAnalysis.length).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-gray-500">Average ROI</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {domains.filter(d => {
                  const expiryDate = new Date(d.next_renewal_date);
                  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
                }).length}
              </div>
              <div className="text-sm text-gray-500">Expiring Soon</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {roiAnalysis.length > 0 ? (roiAnalysis.reduce((sum, d) => sum + d.ageInMonths, 0) / roiAnalysis.length).toFixed(0) : 0}
              </div>
              <div className="text-sm text-gray-500">Avg Age (months)</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAlerts = () => {
    const reminders = getRenewalReminders();
    const forecast = getRenewalForecast();

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Alerts & Reminders</h2>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={reminderSettings.enabled}
                onChange={(e) => setReminderSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Enable Reminders</span>
            </label>
          </div>
        </div>

        {/* Active Reminders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Renewal Reminders</h3>
          {reminders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No domains need renewal reminders at this time.</p>
          ) : (
            <div className="space-y-3">
              {reminders.map((reminder, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    reminder.priority === 'high' ? 'border-red-500 bg-red-50' :
                    reminder.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{reminder.domain}</h4>
                      <p className="text-sm text-gray-600">
                        Expires in {reminder.daysUntilExpiry} day{reminder.daysUntilExpiry !== 1 ? 's' : ''} 
                        ({new Date(reminder.expiryDate).toLocaleDateString()})
                      </p>
                      <p className="text-sm text-gray-600">
                        Renewal cost: ${reminder.renewalCost} for {reminder.cycleInfo}
                      </p>
                      <p className="text-xs text-gray-500">Registrar: {reminder.registrar}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        reminder.priority === 'high' ? 'bg-red-100 text-red-800' :
                        reminder.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {reminder.priority.toUpperCase()} PRIORITY
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Renewal Forecast */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">12-Month Renewal Forecast</h3>
          <div className="space-y-3">
            {forecast.map((month, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{month.month}</span>
                <div className="text-right">
                  <span className="text-lg font-semibold text-gray-900">${month.cost.toFixed(2)}</span>
                  <p className="text-sm text-gray-600">{month.domainCount} domain{month.domainCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reminder Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reminder Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Days</label>
              <div className="flex flex-wrap gap-2">
                {[60, 30, 14, 7, 3, 1].map(days => (
                  <label key={days} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reminderSettings.daysBefore.includes(days)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setReminderSettings(prev => ({
                            ...prev,
                            daysBefore: [...prev.daysBefore, days].sort((a, b) => b - a)
                          }));
                        } else {
                          setReminderSettings(prev => ({
                            ...prev,
                            daysBefore: prev.daysBefore.filter(d => d !== days)
                          }));
                        }
                      }}
                      className="mr-1"
                    />
                    <span className="text-sm text-gray-700">{days} days</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reminderSettings.emailNotifications}
                  onChange={(e) => setReminderSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Email Notifications</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reminderSettings.inAppNotifications}
                  onChange={(e) => setReminderSettings(prev => ({ ...prev, inAppNotifications: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">In-App Notifications</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add New Domain</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domain Name *</label>
                <input 
                  type="text" 
                  placeholder="example.com"
                  value={newDomain.domain_name}
                  onChange={(e) => setNewDomain(prev => ({ ...prev, domain_name: sanitizeInput(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registrar *</label>
                <input 
                  type="text" 
                  placeholder="Cloudflare, GoDaddy, etc."
                  value={newDomain.registrar}
                  onChange={(e) => setNewDomain(prev => ({ ...prev, registrar: sanitizeInput(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                <input 
                  type="date" 
                  value={newDomain.purchase_date}
                  onChange={(e) => setNewDomain(prev => ({ ...prev, purchase_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to set today's date</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Cost ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="12.99"
                  value={newDomain.purchase_cost || ''}
                  onChange={(e) => setNewDomain(prev => ({ ...prev, purchase_cost: validateNumericInput(e.target.value, 0, 1000000) }))}
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
                  onChange={(e) => setNewDomain(prev => ({ ...prev, renewal_cost: validateNumericInput(e.target.value, 0, 1000000) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Enter the total renewal cost for the entire renewal period</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Renewal Cycle</label>
                <select 
                  value={newDomain.renewal_cycle_type}
                  onChange={(e) => {
                    const cycleType = e.target.value as 'annual' | 'biennial' | 'triennial' | 'custom';
                    const cycleYears = cycleType === 'annual' ? 1 : cycleType === 'biennial' ? 2 : cycleType === 'triennial' ? 3 : newDomain.renewal_cycle_years;
                    setNewDomain(prev => ({ 
                      ...prev, 
                      renewal_cycle_type: cycleType,
                      renewal_cycle_years: cycleYears
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="annual">Annual (1 year)</option>
                  <option value="biennial">Biennial (2 years)</option>
                  <option value="triennial">Triennial (3 years)</option>
                  <option value="custom">Custom</option>
                </select>
                {newDomain.renewal_cycle_type === 'custom' && (
                  <input 
                    type="number" 
                    min="1"
                    max="10"
                    placeholder="Years"
                    value={newDomain.renewal_cycle_years}
                    onChange={(e) => setNewDomain(prev => ({ ...prev, renewal_cycle_years: Math.max(1, Math.min(10, parseInt(e.target.value) || 1)) }))}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {newDomain.renewal_cycle_type === 'annual' && 'Domain renews every 1 year (e.g., .com domains)'}
                  {newDomain.renewal_cycle_type === 'biennial' && 'Domain renews every 2 years (e.g., .ai domains)'}
                  {newDomain.renewal_cycle_type === 'triennial' && 'Domain renews every 3 years (e.g., .tt domains)'}
                  {newDomain.renewal_cycle_type === 'custom' && `Domain renews every ${newDomain.renewal_cycle_years} year(s)`}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">已续费次数 (Optional)</label>
                <input 
                  type="number" 
                  min="0"
                  max="20"
                  placeholder="0"
                  value={newDomain.renewal_count || ''}
                  onChange={(e) => setNewDomain(prev => ({ ...prev, renewal_count: Math.max(0, Math.min(20, parseInt(e.target.value) || 0)) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 填写域名已经续费了多少次。例如：we.ai在2019年3月注册，2020年5月购买，如果填写到期时间2021年3月，说明已经续费1次（2021年3月到期），所以这里填1
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
                <input 
                  type="date" 
                  value={newDomain.expiry_date}
                  onChange={(e) => setNewDomain(prev => ({ ...prev, expiry_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to auto-calculate based on purchase date and renewal cycle</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">已续费次数 (Optional)</label>
                <input 
                  type="number" 
                  min="0"
                  max="20"
                  placeholder="0"
                  value={newDomain.renewal_count || ''}
                  onChange={(e) => setNewDomain(prev => ({ ...prev, renewal_count: Math.max(0, Math.min(20, parseInt(e.target.value) || 0)) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 填写域名已经续费了多少次。例如：we.ai在2019年3月注册，2020年5月购买，如果填写到期时间2021年3月，说明已经续费1次（2021年3月到期），所以这里填1
                </p>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Domain</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domain Name *</label>
                <input 
                  type="text" 
                  placeholder="example.com"
                  value={newDomain.domain_name}
                  onChange={(e) => setNewDomain(prev => ({ ...prev, domain_name: sanitizeInput(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registrar *</label>
                <input 
                  type="text" 
                  placeholder="Cloudflare, GoDaddy, etc."
                  value={newDomain.registrar}
                  onChange={(e) => setNewDomain(prev => ({ ...prev, registrar: sanitizeInput(e.target.value) }))}
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
                  onChange={(e) => setNewDomain(prev => ({ ...prev, purchase_cost: validateNumericInput(e.target.value, 0, 1000000) }))}
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
                  onChange={(e) => setNewDomain(prev => ({ ...prev, renewal_cost: validateNumericInput(e.target.value, 0, 1000000) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Enter the total renewal cost for the entire renewal period</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Renewal Cycle</label>
                <select 
                  value={newDomain.renewal_cycle_type}
                  onChange={(e) => {
                    const cycleType = e.target.value as 'annual' | 'biennial' | 'triennial' | 'custom';
                    const cycleYears = cycleType === 'annual' ? 1 : cycleType === 'biennial' ? 2 : cycleType === 'triennial' ? 3 : newDomain.renewal_cycle_years;
                    setNewDomain(prev => ({ 
                      ...prev, 
                      renewal_cycle_type: cycleType,
                      renewal_cycle_years: cycleYears
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="annual">Annual (1 year)</option>
                  <option value="biennial">Biennial (2 years)</option>
                  <option value="triennial">Triennial (3 years)</option>
                  <option value="custom">Custom</option>
                </select>
                {newDomain.renewal_cycle_type === 'custom' && (
                  <input 
                    type="number" 
                    min="1"
                    max="10"
                    placeholder="Years"
                    value={newDomain.renewal_cycle_years}
                    onChange={(e) => setNewDomain(prev => ({ ...prev, renewal_cycle_years: Math.max(1, Math.min(10, parseInt(e.target.value) || 1)) }))}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {newDomain.renewal_cycle_type === 'annual' && 'Domain renews every 1 year (e.g., .com domains)'}
                  {newDomain.renewal_cycle_type === 'biennial' && 'Domain renews every 2 years (e.g., .ai domains)'}
                  {newDomain.renewal_cycle_type === 'triennial' && 'Domain renews every 3 years (e.g., .tt domains)'}
                  {newDomain.renewal_cycle_type === 'custom' && `Domain renews every ${newDomain.renewal_cycle_years} year(s)`}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
                <input 
                  type="date" 
                  value={newDomain.expiry_date}
                  onChange={(e) => setNewDomain(prev => ({ ...prev, expiry_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to auto-calculate based on purchase date and renewal cycle</p>
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
                    purchase_date: '',
                    purchase_cost: 0,
                    renewal_cost: 0,
                    expiry_date: '',
                    tags: [],
                    // Renewal cycle fields
                    renewal_cycle_years: 1,
                    renewal_cycle_type: 'annual' as 'annual' | 'biennial' | 'triennial' | 'custom',
                    last_renewal_amount: 0,
                    last_renewal_date: '',
                    next_renewal_amount: 0,
                    renewal_count: 0
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
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
              {/* 出售交易的特殊字段 - Gross Sale Price */}
              {newTransaction.type === 'sell' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gross Sale Price ($) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="1000.00"
                    value={newTransaction.gross_amount || ''}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, gross_amount: validateNumericInput(e.target.value, 0, 1000000) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    💵 Total sale price before platform fees
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {newTransaction.type === 'sell' ? 'Net Amount Received ($) *' : 'Amount ($) *'}
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder={newTransaction.type === 'sell' ? '850.00 (after fees)' : '12.99'}
                  value={newTransaction.amount || ''}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: validateNumericInput(e.target.value, 0, 1000000) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {newTransaction.type === 'sell' && (
                  <div className="text-xs text-gray-500 mt-1 space-y-1">
                    <div>💰 <strong>净收益:</strong> 扣除平台手续费后实际收到的金额</div>
                    <div>💡 例如: 总售价$1000，手续费15%，净收益$850</div>
                  </div>
                )}
              </div>

              {/* 手续费相关字段 - 仅在出售交易时显示 */}
              {newTransaction.type === 'sell' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                      <select 
                        value={newTransaction.platform}
                        onChange={(e) => {
                          const platform = e.target.value;
                          const feePercentage = platformFeePresets[platform as keyof typeof platformFeePresets] || 0;
                          setNewTransaction(prev => ({ 
                            ...prev, 
                            platform: platform,
                            fee_percentage: feePercentage
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="">Select...</option>
                        {Object.keys(platformFeePresets).map(platform => (
                          <option key={platform} value={platform}>
                            {platform}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fee (%)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        placeholder="15.0"
                        value={newTransaction.fee_percentage || ''}
                        onChange={(e) => setNewTransaction(prev => ({ ...prev, fee_percentage: validateNumericInput(e.target.value, 0, 100) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>

                  {/* 分期付款选项 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Plan</label>
                      <select 
                        value={newTransaction.payment_plan || 'lump_sum'}
                        onChange={(e) => {
                          const paymentPlan = e.target.value as 'lump_sum' | 'installment';
                          setNewTransaction(prev => ({ 
                            ...prev, 
                            payment_plan: paymentPlan,
                            // 如果选择一次性付款，清除分期相关字段
                            ...(paymentPlan === 'lump_sum' ? {
                              installment_period: undefined,
                              installment_fee_percentage: undefined,
                              installment_fee_amount: undefined,
                              monthly_payment: undefined,
                              total_installment_amount: undefined,
                              payment_status: 'completed',
                              paid_installments: undefined,
                              remaining_installments: undefined
                            } : {})
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="lump_sum">一次性付款</option>
                        <option value="installment">分期付款</option>
                      </select>
                    </div>
                    {newTransaction.payment_plan === 'installment' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Installment Period</label>
                        <select 
                          value={newTransaction.installment_period || ''}
                          onChange={(e) => {
                            const period = parseInt(e.target.value);
                            const installmentDetails = newTransaction.gross_amount && newTransaction.platform 
                              ? calculateInstallmentDetails(newTransaction.gross_amount, newTransaction.platform, period)
                              : null;
                            
                            setNewTransaction(prev => ({ 
                              ...prev, 
                              installment_period: period,
                              installment_fee_percentage: installmentDetails?.installmentFeePercentage || 0,
                              installment_fee_amount: installmentDetails?.installmentFeeAmount || 0,
                              monthly_payment: installmentDetails?.monthlyPayment || 0,
                              total_installment_amount: installmentDetails?.totalInstallmentAmount || 0,
                              payment_status: 'in_progress',
                              paid_installments: 0,
                              remaining_installments: period
                            }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                          <option value="">Select period...</option>
                          {newTransaction.platform && installmentPlans[newTransaction.platform as keyof typeof installmentPlans] ? 
                            Object.keys(installmentPlans[newTransaction.platform as keyof typeof installmentPlans]).map(period => {
                              const periodNum = parseInt(period);
                              const plan = installmentPlans[newTransaction.platform as keyof typeof installmentPlans];
                              const planDetails = plan[periodNum as keyof typeof plan];
                              return (
                                <option key={period} value={period}>
                                  {period} months - {planDetails?.description || ''}
                                </option>
                              );
                            }) : 
                            [6, 12, 24].map(period => (
                              <option key={period} value={period}>{period} months</option>
                            ))
                          }
                        </select>
                      </div>
                    )}
                  </div>

                  {/* 分期付款计算显示 */}
                  {newTransaction.payment_plan === 'installment' && newTransaction.installment_period && newTransaction.gross_amount && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-sm text-green-800 space-y-1">
                        <div className="flex justify-between">
                          <span>Gross Amount:</span>
                          <span className="font-medium">${newTransaction.gross_amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Installment Fee ({newTransaction.installment_fee_percentage}%):</span>
                          <span className="font-medium text-orange-600">+${(newTransaction.installment_fee_amount || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Installment Amount:</span>
                          <span className="font-medium">${(newTransaction.total_installment_amount || 0).toFixed(2)}</span>
                        </div>
                        <div className="border-t border-green-200 pt-1">
                          <div className="flex justify-between">
                            <span className="font-bold">Monthly Payment:</span>
                            <span className="font-bold text-green-600">${(newTransaction.monthly_payment || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 简化的费用计算显示 */}
                  {newTransaction.gross_amount > 0 && newTransaction.amount > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm text-blue-800 space-y-1">
                        <div className="flex justify-between">
                          <span>Gross:</span>
                          <span className="font-medium">${newTransaction.gross_amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fees:</span>
                          <span className="font-medium text-red-600">-${(newTransaction.gross_amount - newTransaction.amount).toFixed(2)}</span>
                        </div>
                        <div className="border-t border-blue-200 pt-1">
                          <div className="flex justify-between">
                            <span className="font-bold">Net:</span>
                            <span className="font-bold text-green-600">${newTransaction.amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* 非出售交易的Platform字段 */}
              {newTransaction.type !== 'sell' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                  <input 
                    type="text" 
                    placeholder="GoDaddy, Namecheap, Afternic, Sedo, etc."
                    value={newTransaction.platform}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, platform: sanitizeInput(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional: Where the transaction took place</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Time (Optional)</label>
                  <input 
                    type="datetime-local" 
                    value={newTransaction.transaction_time}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, transaction_time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to use current date</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select 
                    value={newTransaction.currency}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CNY">CNY</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea 
                  placeholder="Optional notes..."
                  value={newTransaction.notes}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, notes: sanitizeInput(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  rows={2}
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

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 ${
            toast.type === 'success' ? 'bg-green-500 text-white' :
            toast.type === 'error' ? 'bg-red-500 text-white' :
            toast.type === 'warning' ? 'bg-yellow-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            <div className="flex-1">
              <p className="font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(prev => ({ ...prev, show: false }))}
              className="text-white hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
