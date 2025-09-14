'use client'

import { useState, useEffect } from 'react'
import { BatchImageProcessor, BatchProcessResult, CityData } from '@/lib/batchImageProcessor'
import { 
  Play, 
  Pause, 
  Square, 
  Download, 
  Upload, 
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Image as ImageIcon,
  BarChart3,
  RefreshCw
} from 'lucide-react'

interface ProcessingStats {
  total: number
  successful: number
  failed: number
  successRate: number
  totalImages: number
  avgProcessingTime: number
}

export default function BatchImagesPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [results, setResults] = useState<BatchProcessResult[]>([])
  const [currentBatch, setCurrentBatch] = useState(0)
  const [totalBatches, setTotalBatches] = useState(0)
  const [stats, setStats] = useState<ProcessingStats | null>(null)
  const [config, setConfig] = useState({
    batchSize: 10,
    delayBetweenBatches: 2000,
    delayBetweenRequests: 500,
    maxRetries: 3,
    useFallback: true
  })
  const [cities, setCities] = useState<CityData[]>([])

  // Load sample cities on component mount
  useEffect(() => {
    const sampleCities = BatchImageProcessor.generateSampleCities(50)
    setCities(sampleCities)
  }, [])

  // Update stats when results change
  useEffect(() => {
    if (results.length > 0) {
      const newStats = BatchImageProcessor.getProcessingStats(results)
      setStats(newStats)
    }
  }, [results])

  const startProcessing = async () => {
    if (cities.length === 0) {
      alert('No cities to process. Please load cities first.')
      return
    }

    setIsProcessing(true)
    setIsPaused(false)
    setResults([])
    setCurrentBatch(0)
    setTotalBatches(Math.ceil(cities.length / config.batchSize))

    try {
      const processingResults = await BatchImageProcessor.processAllCities(cities, config)
      setResults(processingResults)
    } catch (error) {
      console.error('Batch processing failed:', error)
      alert('Batch processing failed. Check console for details.')
    } finally {
      setIsProcessing(false)
    }
  }

  const pauseProcessing = () => {
    setIsPaused(true)
    // Note: In a real implementation, you'd need to implement proper pause/resume logic
  }

  const resumeProcessing = () => {
    setIsPaused(false)
    // Note: In a real implementation, you'd need to implement proper pause/resume logic
  }

  const stopProcessing = () => {
    setIsProcessing(false)
    setIsPaused(false)
    // Note: In a real implementation, you'd need to implement proper stop logic
  }

  const exportResults = () => {
    const dataStr = JSON.stringify(results, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `batch-processing-results-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const loadMoreCities = () => {
    const moreCities = BatchImageProcessor.generateSampleCities(100)
    setCities(prev => [...prev, ...moreCities])
  }

  const clearResults = () => {
    setResults([])
    setStats(null)
    setCurrentBatch(0)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Batch Image Processing
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Process images for 501+ cities automatically using Unsplash API
          </p>
        </div>

        {/* Configuration Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Processing Configuration
            </h2>
            <Settings className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Batch Size
              </label>
              <input
                type="number"
                value={config.batchSize}
                onChange={(e) => setConfig({ ...config, batchSize: parseInt(e.target.value) || 10 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                min="1"
                max="50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Batch Delay (ms)
              </label>
              <input
                type="number"
                value={config.delayBetweenBatches}
                onChange={(e) => setConfig({ ...config, delayBetweenBatches: parseInt(e.target.value) || 2000 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                min="0"
                max="10000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Request Delay (ms)
              </label>
              <input
                type="number"
                value={config.delayBetweenRequests}
                onChange={(e) => setConfig({ ...config, delayBetweenRequests: parseInt(e.target.value) || 500 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                min="0"
                max="5000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Retries
              </label>
              <input
                type="number"
                value={config.maxRetries}
                onChange={(e) => setConfig({ ...config, maxRetries: parseInt(e.target.value) || 3 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                min="0"
                max="10"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.useFallback}
                onChange={(e) => setConfig({ ...config, useFallback: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Use fallback images when API fails
              </span>
            </label>
          </div>
        </div>

        {/* Cities Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cities to Process
            </h2>
            <button
              onClick={loadMoreCities}
              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Load More Cities
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <ImageIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Total Cities
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {cities.length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Estimated Batches
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {Math.ceil(cities.length / config.batchSize)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Est. Time
                  </p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {Math.round((cities.length / config.batchSize) * (config.delayBetweenBatches / 1000))}s
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!isProcessing ? (
                <button
                  onClick={startProcessing}
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Processing
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  {!isPaused ? (
                    <button
                      onClick={pauseProcessing}
                      className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={resumeProcessing}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </button>
                  )}
                  <button
                    onClick={stopProcessing}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={exportResults}
                disabled={results.length === 0}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </button>
              <button
                onClick={clearResults}
                disabled={results.length === 0}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear
              </button>
            </div>
          </div>
          
          {isProcessing && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Processing Progress</span>
                <span>{currentBatch} / {totalBatches} batches</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentBatch / totalBatches) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {stats && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Processing Results
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      Successful
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.successful}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-900 dark:text-red-100">
                      Failed
                    </p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {stats.failed}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center">
                  <ImageIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Total Images
                    </p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.totalImages}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                      Success Rate
                    </p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {stats.successRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Table */}
        {results.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Processing Details
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      City
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Images
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Time (ms)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Error
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {results.map((result, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {result.cityName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {result.country}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {result.success ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                            <XCircle className="h-3 w-3 mr-1" />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {result.imagesCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {result.processingTime}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {result.error || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
