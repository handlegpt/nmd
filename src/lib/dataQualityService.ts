// Data quality service for validating and monitoring city data quality
// This service checks data accuracy, completeness, and freshness

export interface DataQualityCheck {
  id: string;
  cityId: string;
  cityName: string;
  field: string;
  checkType: 'accuracy' | 'completeness' | 'freshness' | 'consistency';
  status: 'pass' | 'fail' | 'warning';
  score: number; // 0-100
  message: string;
  suggestions: string[];
  checkedAt: string;
  checkedBy: string;
}

export interface DataQualityReport {
  cityId: string;
  cityName: string;
  overallScore: number;
  checks: DataQualityCheck[];
  lastUpdated: string;
  issues: string[];
  recommendations: string[];
}

export interface QualityStats {
  totalCities: number;
  averageScore: number;
  citiesWithIssues: number;
  criticalIssues: number;
  byField: Record<string, { average: number; count: number }>;
  byCheckType: Record<string, { pass: number; fail: number; warning: number }>;
}

class DataQualityService {
  private qualityChecks: DataQualityCheck[] = [];
  private readonly STORAGE_KEY = 'nomadnow_data_quality';

  constructor() {
    this.loadQualityChecks();
  }

  // Load quality checks from localStorage
  private loadQualityChecks(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.qualityChecks = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading quality checks:', error);
      this.qualityChecks = [];
    }
  }

  // Save quality checks to localStorage
  private saveQualityChecks(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.qualityChecks));
    } catch (error) {
      console.error('Error saving quality checks:', error);
    }
  }

  // Check data quality for a city
  async checkCityDataQuality(cityData: any): Promise<DataQualityReport> {
    const checks: DataQualityCheck[] = [];
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check cost of living
    const costCheck = this.checkCostOfLiving(cityData);
    checks.push(costCheck);
    if (costCheck.status === 'fail') issues.push(costCheck.message);
    if (costCheck.suggestions.length > 0) recommendations.push(...costCheck.suggestions);

    // Check WiFi speed
    const wifiCheck = this.checkWifiSpeed(cityData);
    checks.push(wifiCheck);
    if (wifiCheck.status === 'fail') issues.push(wifiCheck.message);
    if (wifiCheck.suggestions.length > 0) recommendations.push(...wifiCheck.suggestions);

    // Check visa information
    const visaCheck = this.checkVisaInfo(cityData);
    checks.push(visaCheck);
    if (visaCheck.status === 'fail') issues.push(visaCheck.message);
    if (visaCheck.suggestions.length > 0) recommendations.push(...visaCheck.suggestions);

    // Check data freshness
    const freshnessCheck = this.checkDataFreshness(cityData);
    checks.push(freshnessCheck);
    if (freshnessCheck.status === 'fail') issues.push(freshnessCheck.message);
    if (freshnessCheck.suggestions.length > 0) recommendations.push(...freshnessCheck.suggestions);

    // Check data completeness
    const completenessCheck = this.checkDataCompleteness(cityData);
    checks.push(completenessCheck);
    if (completenessCheck.status === 'fail') issues.push(completenessCheck.message);
    if (completenessCheck.suggestions.length > 0) recommendations.push(...completenessCheck.suggestions);

    // Calculate overall score
    const overallScore = checks.reduce((sum, check) => sum + check.score, 0) / checks.length;

    // Save checks
    this.qualityChecks.push(...checks);
    this.saveQualityChecks();

    return {
      cityId: cityData.id || cityData.cityId,
      cityName: cityData.name || cityData.cityName,
      overallScore: Math.round(overallScore),
      checks,
      lastUpdated: new Date().toISOString(),
      issues,
      recommendations
    };
  }

  // Check cost of living data
  private checkCostOfLiving(cityData: any): DataQualityCheck {
    const cost = cityData.cost_of_living || cityData.costOfLiving?.monthly;
    const country = cityData.country;
    
    let status: 'pass' | 'fail' | 'warning' = 'pass';
    let score = 100;
    let message = 'Cost of living data is valid';
    const suggestions: string[] = [];

    // Check if cost exists
    if (!cost || cost === 0) {
      status = 'fail';
      score = 0;
      message = 'Cost of living data is missing';
      suggestions.push('Add cost of living data from reliable sources');
      return this.createQualityCheck(cityData, 'cost_of_living', 'completeness', status, score, message, suggestions);
    }

    // Check if cost is reasonable
    if (cost < 100) {
      status = 'warning';
      score = 60;
      message = 'Cost of living seems unusually low';
      suggestions.push('Verify cost of living data with multiple sources');
    } else if (cost > 10000) {
      status = 'warning';
      score = 60;
      message = 'Cost of living seems unusually high';
      suggestions.push('Verify cost of living data with multiple sources');
    }

    // Check if cost is realistic for the country
    const expectedRanges = this.getExpectedCostRanges(country);
    if (expectedRanges && (cost < expectedRanges.min || cost > expectedRanges.max)) {
      status = 'warning';
      score = Math.min(score, 70);
      message = `Cost of living ($${cost}) is outside expected range for ${country}`;
      suggestions.push(`Expected range: $${expectedRanges.min}-$${expectedRanges.max}`);
    }

    return this.createQualityCheck(cityData, 'cost_of_living', 'accuracy', status, score, message, suggestions);
  }

  // Check WiFi speed data
  private checkWifiSpeed(cityData: any): DataQualityCheck {
    const wifiSpeed = cityData.wifi_speed || cityData.wifiSpeed?.average;
    const country = cityData.country;
    
    let status: 'pass' | 'fail' | 'warning' = 'pass';
    let score = 100;
    let message = 'WiFi speed data is valid';
    const suggestions: string[] = [];

    // Check if WiFi speed exists
    if (!wifiSpeed || wifiSpeed === 0) {
      status = 'fail';
      score = 0;
      message = 'WiFi speed data is missing';
      suggestions.push('Add WiFi speed data from speed test results');
      return this.createQualityCheck(cityData, 'wifi_speed', 'completeness', status, score, message, suggestions);
    }

    // Check if WiFi speed is reasonable
    if (wifiSpeed < 1) {
      status = 'fail';
      score = 0;
      message = 'WiFi speed is too low to be realistic';
      suggestions.push('Verify WiFi speed data with local speed tests');
    } else if (wifiSpeed > 1000) {
      status = 'warning';
      score = 80;
      message = 'WiFi speed seems unusually high';
      suggestions.push('Verify WiFi speed data with multiple sources');
    }

    // Check if WiFi speed is realistic for the country
    const expectedRanges = this.getExpectedWifiRanges(country);
    if (expectedRanges && (wifiSpeed < expectedRanges.min || wifiSpeed > expectedRanges.max)) {
      status = 'warning';
      score = Math.min(score, 70);
      message = `WiFi speed (${wifiSpeed} Mbps) is outside expected range for ${country}`;
      suggestions.push(`Expected range: ${expectedRanges.min}-${expectedRanges.max} Mbps`);
    }

    return this.createQualityCheck(cityData, 'wifi_speed', 'accuracy', status, score, message, suggestions);
  }

  // Check visa information
  private checkVisaInfo(cityData: any): DataQualityCheck {
    const visaDays = cityData.visa_days;
    const visaType = cityData.visa_type;
    const country = cityData.country;
    
    let status: 'pass' | 'fail' | 'warning' = 'pass';
    let score = 100;
    let message = 'Visa information is valid';
    const suggestions: string[] = [];

    // Check if visa days exists
    if (!visaDays || visaDays === 0) {
      status = 'fail';
      score = 0;
      message = 'Visa days information is missing';
      suggestions.push('Add visa information from official sources');
      return this.createQualityCheck(cityData, 'visa_days', 'completeness', status, score, message, suggestions);
    }

    // Check if visa type exists
    if (!visaType) {
      status = 'warning';
      score = 70;
      message = 'Visa type information is missing';
      suggestions.push('Add visa type information');
    }

    // Check if visa days is reasonable
    if (visaDays > 365) {
      status = 'warning';
      score = Math.min(score, 80);
      message = 'Visa days seems unusually long';
      suggestions.push('Verify visa information with official sources');
    }

    return this.createQualityCheck(cityData, 'visa_days', 'accuracy', status, score, message, suggestions);
  }

  // Check data freshness
  private checkDataFreshness(cityData: any): DataQualityCheck {
    const lastUpdated = cityData.updated_at || cityData.lastUpdated;
    const now = new Date();
    const updatedDate = new Date(lastUpdated);
    const daysSinceUpdate = Math.floor((now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let status: 'pass' | 'fail' | 'warning' = 'pass';
    let score = 100;
    let message = 'Data is fresh';
    const suggestions: string[] = [];

    if (daysSinceUpdate > 365) {
      status = 'fail';
      score = 0;
      message = 'Data is over 1 year old';
      suggestions.push('Update data with recent information');
    } else if (daysSinceUpdate > 180) {
      status = 'warning';
      score = 60;
      message = 'Data is over 6 months old';
      suggestions.push('Consider updating data with recent information');
    } else if (daysSinceUpdate > 90) {
      status = 'warning';
      score = 80;
      message = 'Data is over 3 months old';
      suggestions.push('Monitor for updates');
    }

    return this.createQualityCheck(cityData, 'data_freshness', 'freshness', status, score, message, suggestions);
  }

  // Check data completeness
  private checkDataCompleteness(cityData: any): DataQualityCheck {
    const requiredFields = ['name', 'country', 'cost_of_living', 'wifi_speed', 'visa_days'];
    const missingFields: string[] = [];
    
    requiredFields.forEach(field => {
      if (!cityData[field] && !cityData[field.toLowerCase()]) {
        missingFields.push(field);
      }
    });

    let status: 'pass' | 'fail' | 'warning' = 'pass';
    let score = 100;
    let message = 'All required fields are present';
    const suggestions: string[] = [];

    if (missingFields.length > 0) {
      status = missingFields.length > 2 ? 'fail' : 'warning';
      score = Math.max(0, 100 - (missingFields.length * 20));
      message = `Missing required fields: ${missingFields.join(', ')}`;
      suggestions.push(`Add missing fields: ${missingFields.join(', ')}`);
    }

    return this.createQualityCheck(cityData, 'data_completeness', 'completeness', status, score, message, suggestions);
  }

  // Create quality check object
  private createQualityCheck(
    cityData: any,
    field: string,
    checkType: DataQualityCheck['checkType'],
    status: DataQualityCheck['status'],
    score: number,
    message: string,
    suggestions: string[]
  ): DataQualityCheck {
    return {
      id: this.generateId(),
      cityId: cityData.id || cityData.cityId,
      cityName: cityData.name || cityData.cityName,
      field,
      checkType,
      status,
      score,
      message,
      suggestions,
      checkedAt: new Date().toISOString(),
      checkedBy: 'system'
    };
  }

  // Get expected cost ranges by country
  private getExpectedCostRanges(country: string): { min: number; max: number } | null {
    const ranges: Record<string, { min: number; max: number }> = {
      'Thailand': { min: 400, max: 1500 },
      'Portugal': { min: 800, max: 2000 },
      'Spain': { min: 1000, max: 2500 },
      'Mexico': { min: 500, max: 1500 },
      'Colombia': { min: 300, max: 1200 },
      'Indonesia': { min: 400, max: 1200 },
      'Japan': { min: 1500, max: 3000 },
      'Georgia': { min: 400, max: 1200 }
    };
    return ranges[country] || null;
  }

  // Get expected WiFi ranges by country
  private getExpectedWifiRanges(country: string): { min: number; max: number } | null {
    const ranges: Record<string, { min: number; max: number }> = {
      'Thailand': { min: 20, max: 100 },
      'Portugal': { min: 50, max: 200 },
      'Spain': { min: 50, max: 200 },
      'Mexico': { min: 20, max: 100 },
      'Colombia': { min: 20, max: 80 },
      'Indonesia': { min: 10, max: 80 },
      'Japan': { min: 100, max: 300 },
      'Georgia': { min: 20, max: 100 }
    };
    return ranges[country] || null;
  }

  // Get quality statistics
  getQualityStats(): QualityStats {
    const stats: QualityStats = {
      totalCities: 0,
      averageScore: 0,
      citiesWithIssues: 0,
      criticalIssues: 0,
      byField: {},
      byCheckType: { accuracy: { pass: 0, fail: 0, warning: 0 }, completeness: { pass: 0, fail: 0, warning: 0 }, freshness: { pass: 0, fail: 0, warning: 0 }, consistency: { pass: 0, fail: 0, warning: 0 } }
    };

    const cityScores = new Map<string, number[]>();
    const citiesWithIssues = new Set<string>();

    this.qualityChecks.forEach(check => {
      // Track city scores
      if (!cityScores.has(check.cityId)) {
        cityScores.set(check.cityId, []);
      }
      cityScores.get(check.cityId)!.push(check.score);

      // Track issues
      if (check.status === 'fail' || check.status === 'warning') {
        citiesWithIssues.add(check.cityId);
        if (check.status === 'fail') {
          stats.criticalIssues++;
        }
      }

      // Track by field
      if (!stats.byField[check.field]) {
        stats.byField[check.field] = { average: 0, count: 0 };
      }
      stats.byField[check.field].count++;
      stats.byField[check.field].average += check.score;

      // Track by check type
      stats.byCheckType[check.checkType][check.status]++;
    });

    // Calculate averages
    stats.totalCities = cityScores.size;
    stats.citiesWithIssues = citiesWithIssues.size;
    
    if (stats.totalCities > 0) {
      const allScores = Array.from(cityScores.values()).flat();
      stats.averageScore = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
    }

    // Calculate field averages
    Object.keys(stats.byField).forEach(field => {
      if (stats.byField[field].count > 0) {
        stats.byField[field].average = stats.byField[field].average / stats.byField[field].count;
      }
    });

    return stats;
  }

  // Generate unique ID
  private generateId(): string {
    return `quality_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get quality checks by city
  getQualityChecksByCity(cityId: string): DataQualityCheck[] {
    return this.qualityChecks.filter(check => check.cityId === cityId);
  }

  // Get quality checks by status
  getQualityChecksByStatus(status: DataQualityCheck['status']): DataQualityCheck[] {
    return this.qualityChecks.filter(check => check.status === status);
  }

  // Clear old quality checks
  clearOldChecks(daysOld: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    this.qualityChecks = this.qualityChecks.filter(check => 
      new Date(check.checkedAt) > cutoffDate
    );
    
    this.saveQualityChecks();
  }
}

export const dataQualityService = new DataQualityService();
