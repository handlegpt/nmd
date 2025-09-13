'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react'
import { PlaceDataCleanupService, PlaceDataIssue } from '@/lib/placeDataCleanup'
import { Place } from '@/lib/supabase'

interface DataQualityIndicatorProps {
  places: Place[]
  onDismiss?: () => void
}

export default function DataQualityIndicator({ places, onDismiss }: DataQualityIndicatorProps) {
  const [report, setReport] = useState<{
    totalPlaces: number
    issues: PlaceDataIssue[]
    summary: {
      duplicateIds: number
      testData: number
      missingData: number
      invalidData: number
    }
  } | null>(null)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (places.length > 0) {
      const qualityReport = PlaceDataCleanupService.generateReport(places)
      setReport(qualityReport)
    }
  }, [places])

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible || !report || report.issues.length === 0) {
    return null
  }

  const hasHighSeverityIssues = report.issues.some(issue => issue.severity === 'high')
  const hasMediumSeverityIssues = report.issues.some(issue => issue.severity === 'medium')

  return (
    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {hasHighSeverityIssues ? (
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
          ) : hasMediumSeverityIssues ? (
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          ) : (
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          )}
          
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              数据质量报告
            </h3>
            
            <div className="text-sm text-gray-600 mb-3">
              检测到 {report.issues.length} 个数据问题，已自动清理 {report.summary.testData} 个测试数据项。
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {report.summary.duplicateIds > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600">
                    {report.summary.duplicateIds} 重复ID
                  </span>
                </div>
              )}
              
              {report.summary.testData > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-600">
                    {report.summary.testData} 测试数据
                  </span>
                </div>
              )}
              
              {report.summary.missingData > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">
                    {report.summary.missingData} 缺失数据
                  </span>
                </div>
              )}
              
              {report.summary.invalidData > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-600">
                    {report.summary.invalidData} 无效数据
                  </span>
                </div>
              )}
            </div>
            
            {report.summary.testData > 0 && (
              <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-800">
                    已自动移除 {report.summary.testData} 个测试数据项，现在显示 {report.totalPlaces - report.summary.testData} 个真实地点
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
