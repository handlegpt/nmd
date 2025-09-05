// 税务年度
export interface TaxYear {
  year: number
  start_date: string
  end_date: string
  is_current: boolean
  filing_deadline: string
  extension_deadline?: string
}

// 国家税务信息
export interface CountryTaxInfo {
  country_code: string
  country_name: string
  tax_system: TaxSystem
  tax_year: TaxYear
  currency: string
  
  // 税率信息
  tax_rates: TaxRate[]
  
  // 免税额度
  tax_free_allowance: number
  personal_allowance: number
  
  // 特殊规定
  digital_nomad_visa_available: boolean
  tax_treaty_countries: string[]
  
  // 申报要求
  filing_requirements: FilingRequirement[]
  
  // 截止日期
  deadlines: TaxDeadline[]
}

// 税务系统类型
export type TaxSystem = 
  | 'territorial' | 'residence_based' | 'citizenship_based'
  | 'hybrid' | 'other'

// 税率结构
export interface TaxRate {
  bracket: string
  min_income: number
  max_income?: number
  rate: number
  description?: string
}

// 申报要求
export interface FilingRequirement {
  type: FilingType
  threshold: number
  description: string
  required_documents: string[]
}

// 申报类型
export type FilingType = 
  | 'income_tax' | 'vat' | 'corporate_tax' | 'social_security'
  | 'property_tax' | 'other'

// 税务截止日期
export interface TaxDeadline {
  id: string
  country_code: string
  type: FilingType
  deadline: string
  description: string
  is_extended: boolean
  extended_deadline?: string
  penalty_rate?: number
  is_holiday_adjusted: boolean
}

// 个人税务情况
export interface PersonalTaxSituation {
  user_id: string
  country_code: string
  tax_year: number
  
  // 收入信息
  total_income: number
  taxable_income: number
  income_sources: IncomeSource[]
  
  // 扣除和减免
  deductions: Deduction[]
  credits: TaxCredit[]
  
  // 计算结果
  tax_liability: number
  tax_paid: number
  tax_refund: number
  balance_due: number
  
  // 状态
  filing_status: FilingStatus
  filing_date?: string
  payment_date?: string
  
  // 时间信息
  created_at: string
  updated_at: string
}

// 收入来源
export interface IncomeSource {
  id: string
  type: IncomeType
  description: string
  amount: number
  country: string
  is_foreign: boolean
  exchange_rate?: number
  converted_amount?: number
}

// 收入类型
export type IncomeType = 
  | 'employment' | 'self_employment' | 'business'
  | 'investment' | 'rental' | 'royalties'
  | 'pension' | 'social_benefits' | 'other'

// 扣除项目
export interface Deduction {
  id: string
  type: DeductionType
  description: string
  amount: number
  is_standard: boolean
  documentation_required: boolean
}

// 扣除类型
export type DeductionType = 
  | 'standard' | 'itemized' | 'business_expenses'
  | 'home_office' | 'travel' | 'education'
  | 'health_care' | 'charitable' | 'other'

// 税务抵免
export interface TaxCredit {
  id: string
  type: CreditType
  description: string
  amount: number
  is_refundable: boolean
  documentation_required: boolean
}

// 抵免类型
export type CreditType = 
  | 'child_tax_credit' | 'earned_income_credit'
  | 'education_credit' | 'retirement_credit'
  | 'foreign_tax_credit' | 'other'

// 申报状态
export type FilingStatus = 
  | 'not_filed' | 'filed' | 'processing' | 'completed'
  | 'amended' | 'extended' | 'late' | 'cancelled'

// 税务计算参数
export interface TaxCalculationParams {
  country_code: string
  tax_year: number
  income: number
  deductions: number
  credits: number
  foreign_income?: number
  foreign_tax_paid?: number
  exchange_rate?: number
}

// 税务计算器配置
export interface TaxCalculatorConfig {
  country_code: string
  tax_year: number
  include_state_tax: boolean
  include_local_tax: boolean
  include_social_security: boolean
  include_health_care: boolean
  rounding_method: 'round' | 'floor' | 'ceil'
  decimal_places: number
}
