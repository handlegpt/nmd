// Place Data Cleanup Service
// 清理和修复地点数据问题

import { Place } from './supabase'
import { logInfo, logError } from './logger'

export interface PlaceDataIssue {
  type: 'duplicate_id' | 'missing_data' | 'invalid_data' | 'test_data'
  description: string
  placeId: string
  placeName: string
  severity: 'low' | 'medium' | 'high'
}

export class PlaceDataCleanupService {
  // 检测数据问题
  static detectIssues(places: Place[]): PlaceDataIssue[] {
    const issues: PlaceDataIssue[] = []
    const seenIds = new Set<string>()
    const seenNames = new Set<string>()
    
    places.forEach(place => {
      // 检测重复ID
      if (seenIds.has(place.id)) {
        issues.push({
          type: 'duplicate_id',
          description: `Duplicate ID found: ${place.id}`,
          placeId: place.id,
          placeName: place.name,
          severity: 'high'
        })
      } else {
        seenIds.add(place.id)
      }
      
      // 检测重复名称
      if (seenNames.has(place.name)) {
        issues.push({
          type: 'duplicate_id',
          description: `Duplicate name found: ${place.name}`,
          placeId: place.id,
          placeName: place.name,
          severity: 'medium'
        })
      } else {
        seenNames.add(place.name)
      }
      
      // 检测测试数据
      if (this.isTestData(place)) {
        issues.push({
          type: 'test_data',
          description: `Test data detected: ${place.name}`,
          placeId: place.id,
          placeName: place.name,
          severity: 'medium'
        })
      }
      
      // 检测缺失数据
      if (this.hasMissingData(place)) {
        issues.push({
          type: 'missing_data',
          description: `Missing essential data: ${place.name}`,
          placeId: place.id,
          placeName: place.name,
          severity: 'low'
        })
      }
      
      // 检测无效数据
      if (this.hasInvalidData(place)) {
        issues.push({
          type: 'invalid_data',
          description: `Invalid data detected: ${place.name}`,
          placeId: place.id,
          placeName: place.name,
          severity: 'medium'
        })
      }
    })
    
    return issues
  }
  
  // 判断是否为测试数据
  private static isTestData(place: Place): boolean {
    // 检查是否为已知的测试数据特征
    const testDataIndicators = [
      '2baab562-1b6d-4f6f-a0c8-86e2d4167b5e', // 已知的测试UUID
      '550e8400-e29b-41d4-a716-446655440018', // 另一个测试UUID
      '550e8400-e29b-41d4-a716-446655440017', // 另一个测试UUID
      '550e8400-e29b-41d4-a716-446655440008', // 另一个测试UUID
      '550e8400-e29b-41d4-a716-446655440007', // 另一个测试UUID
      '550e8400-e29b-41d4-a716-446655440005'  // 另一个测试UUID
    ]
    
    return testDataIndicators.includes(place.id) || 
           testDataIndicators.includes(place.city_id) ||
           place.rating === 0 ||
           place.wifi_speed === undefined ||
           place.price_level === undefined
  }
  
  // 检查缺失数据
  private static hasMissingData(place: Place): boolean {
    return !place.name || 
           !place.category || 
           !place.city_id || 
           !place.address ||
           place.latitude === 0 ||
           place.longitude === 0
  }
  
  // 检查无效数据
  private static hasInvalidData(place: Place): boolean {
    return (place.rating !== undefined && (place.rating < 0 || place.rating > 5)) ||
           (place.wifi_speed !== undefined && place.wifi_speed < 0) ||
           (place.price_level !== undefined && (place.price_level < 1 || place.price_level > 5))
  }
  
  // 清理数据
  static cleanPlaces(places: Place[]): Place[] {
    const issues = this.detectIssues(places)
    logInfo('Place data cleanup started', { 
      totalPlaces: places.length, 
      issuesFound: issues.length 
    }, 'PlaceDataCleanupService')
    
    // 过滤掉测试数据
    const cleanedPlaces = places.filter(place => {
      const isTest = this.isTestData(place)
      if (isTest) {
        logInfo('Removing test data', { 
          placeId: place.id, 
          placeName: place.name 
        }, 'PlaceDataCleanupService')
      }
      return !isTest
    })
    
    // 去重（基于ID）
    const uniquePlaces = cleanedPlaces.filter((place, index, self) => 
      index === self.findIndex(p => p.id === place.id)
    )
    
    // 修复缺失数据
    const fixedPlaces = uniquePlaces.map(place => this.fixPlaceData(place))
    
    logInfo('Place data cleanup completed', { 
      originalCount: places.length,
      cleanedCount: fixedPlaces.length,
      removedCount: places.length - fixedPlaces.length
    }, 'PlaceDataCleanupService')
    
    return fixedPlaces
  }
  
  // 修复单个地点数据
  private static fixPlaceData(place: Place): Place {
    const fixed = { ...place }
    
    // 修复缺失的评分
    if (!fixed.rating || fixed.rating === 0) {
      fixed.rating = 4.0 + Math.random() * 1.0 // 4.0-5.0之间的随机评分
    }
    
    // 修复缺失的WiFi速度
    if (!fixed.wifi_speed) {
      const baseSpeed = this.getBaseWifiSpeedByCategory(fixed.category)
      fixed.wifi_speed = baseSpeed + Math.floor(Math.random() * 20) // 添加随机变化
    }
    
    // 修复缺失的价格等级
    if (!fixed.price_level) {
      fixed.price_level = this.getBasePriceLevelByCategory(fixed.category) as 1 | 2 | 3 | 4 | 5
    }
    
    // 修复缺失的噪音等级
    if (!fixed.noise_level) {
      fixed.noise_level = this.getBaseNoiseLevelByCategory(fixed.category) as 'quiet' | 'moderate' | 'loud'
    }
    
    // 修复缺失的社交氛围
    if (!fixed.social_atmosphere) {
      fixed.social_atmosphere = this.getBaseSocialAtmosphereByCategory(fixed.category) as 'low' | 'medium' | 'high'
    }
    
    // 修复缺失的标签
    if (!fixed.tags || fixed.tags.length === 0) {
      fixed.tags = this.generateTagsByCategory(fixed.category)
    }
    
    // 修复缺失的坐标
    if (fixed.latitude === 0 && fixed.longitude === 0) {
      const coordinates = this.getCoordinatesByCity(fixed.city_id)
      if (coordinates) {
        fixed.latitude = coordinates.lat
        fixed.longitude = coordinates.lng
      }
    }
    
    return fixed
  }
  
  // 根据类别获取基础WiFi速度
  private static getBaseWifiSpeedByCategory(category: string): number {
    const speedMap: Record<string, number> = {
      'coworking': 100,
      'cafe': 80,
      'coliving': 90,
      'restaurant': 60,
      'hotel': 70,
      'library': 85,
      'other': 75
    }
    return speedMap[category] || 75
  }
  
  // 根据类别获取基础价格等级
  private static getBasePriceLevelByCategory(category: string): number {
    const priceMap: Record<string, number> = {
      'coworking': 4,
      'cafe': 3,
      'coliving': 3,
      'restaurant': 3,
      'hotel': 4,
      'library': 1,
      'other': 2
    }
    return priceMap[category] || 3
  }
  
  // 根据类别获取基础噪音等级
  private static getBaseNoiseLevelByCategory(category: string): string {
    const noiseMap: Record<string, string> = {
      'coworking': 'moderate',
      'cafe': 'moderate',
      'coliving': 'moderate',
      'restaurant': 'high',
      'hotel': 'quiet',
      'library': 'quiet',
      'other': 'moderate'
    }
    return noiseMap[category] || 'moderate'
  }
  
  // 根据类别获取基础社交氛围
  private static getBaseSocialAtmosphereByCategory(category: string): string {
    const socialMap: Record<string, string> = {
      'coworking': 'high',
      'cafe': 'medium',
      'coliving': 'high',
      'restaurant': 'high',
      'hotel': 'low',
      'library': 'low',
      'other': 'medium'
    }
    return socialMap[category] || 'medium'
  }
  
  // 根据类别生成标签
  private static generateTagsByCategory(category: string): string[] {
    const tagMap: Record<string, string[]> = {
      'coworking': ['professional', 'amenities', 'community'],
      'cafe': ['coffee', 'wifi', 'quiet'],
      'coliving': ['nomad', 'social', 'accommodation'],
      'restaurant': ['food', 'social', 'local'],
      'hotel': ['accommodation', 'comfort', 'service'],
      'library': ['quiet', 'study', 'free'],
      'other': ['local', 'interesting', 'unique']
    }
    return tagMap[category] || ['local', 'interesting']
  }
  
  // 根据城市获取坐标
  private static getCoordinatesByCity(cityId: string): { lat: number; lng: number } | null {
    // 这里可以添加城市坐标映射
    // 暂时返回null，让调用方处理
    return null
  }
  
  // 生成报告
  static generateReport(places: Place[]): {
    totalPlaces: number
    issues: PlaceDataIssue[]
    summary: {
      duplicateIds: number
      testData: number
      missingData: number
      invalidData: number
    }
  } {
    const issues = this.detectIssues(places)
    
    return {
      totalPlaces: places.length,
      issues,
      summary: {
        duplicateIds: issues.filter(i => i.type === 'duplicate_id').length,
        testData: issues.filter(i => i.type === 'test_data').length,
        missingData: issues.filter(i => i.type === 'missing_data').length,
        invalidData: issues.filter(i => i.type === 'invalid_data').length
      }
    }
  }
}
