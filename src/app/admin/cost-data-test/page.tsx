'use client'

import { useState } from 'react'
import { costDataValidator, CityMatchResult, DataValidationResult } from '@/lib/costDataValidator'
import { availableCostDataService } from '@/lib/availableCostDataService'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Search,
  RefreshCw,
  MapPin,
  DollarSign,
  Database,
  Globe
} from 'lucide-react'

export default function CostDataTestPage() {
  const [testCity, setTestCity] = useState('Bangkok')
  const [testCountry, setTestCountry] = useState('Thailand')
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<{
    cityMatch: CityMatchResult
    dataValidation: DataValidationResult
    testResults: {
      numbeoTest: boolean
      benchmarkTest: boolean
      exchangeTest: boolean
    }
    costData: any
  } | null>(null)

  const handleTest = async () => {
    setIsLoading(true)
    try {
      // 测试数据验证
      const validationResults = await costDataValidator.testDataFetching(testCity, testCountry)
      
      // 获取实际成本数据
      const costData = await availableCostDataService.getCostData(testCity, testCountry)
      
      setTestResults({
        ...validationResults,
        costData
      })
    } catch (error) {
      console.error('Test failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    )
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Cost Data Validation & Testing
        </h1>

        {/* Test Input */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                City
              </label>
              <input
                type="text"
                value={testCity}
                onChange={(e) => setTestCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter city name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Country
              </label>
              <input
                type="text"
                value={testCountry}
                onChange={(e) => setTestCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter country name"
              />
            </div>
          </div>
          <button
            onClick={handleTest}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            {isLoading ? 'Testing...' : 'Run Test'}
          </button>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="space-y-6">
            {/* City Match Results */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                City Match Results
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Exact Match</p>
                  <p className={`text-lg font-semibold ${testResults.cityMatch.isExactMatch ? 'text-green-600' : 'text-red-600'}`}>
                    {testResults.cityMatch.isExactMatch ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Similarity Score</p>
                  <p className={`text-lg font-semibold ${getConfidenceColor(testResults.cityMatch.similarity)}`}>
                    {(testResults.cityMatch.similarity * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              
              {testResults.cityMatch.matchedCity && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Matched:</strong> {testResults.cityMatch.matchedCity}, {testResults.cityMatch.matchedCountry}
                  </p>
                </div>
              )}

              {testResults.cityMatch.alternatives.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Alternative Matches:</p>
                  <div className="space-y-1">
                    {testResults.cityMatch.alternatives.map((alt, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{alt.city}, {alt.country}</span>
                        <span className={getConfidenceColor(alt.similarity)}>
                          {(alt.similarity * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Data Source Tests */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Data Source Tests
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {getStatusIcon(testResults.testResults.numbeoTest)}
                  <div>
                    <p className="font-medium">Numbeo API</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Free tier access</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {getStatusIcon(testResults.testResults.benchmarkTest)}
                  <div>
                    <p className="font-medium">Benchmark Data</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Preset city data</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {getStatusIcon(testResults.testResults.exchangeTest)}
                  <div>
                    <p className="font-medium">Exchange API</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Currency conversion</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Validation */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Data Validation
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Overall Validity</p>
                  <p className={`text-lg font-semibold ${testResults.dataValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {testResults.dataValidation.isValid ? 'Valid' : 'Invalid'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Confidence Score</p>
                  <p className={`text-lg font-semibold ${getConfidenceColor(testResults.dataValidation.confidence)}`}>
                    {(testResults.dataValidation.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {testResults.dataValidation.issues.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium text-red-600 mb-2">Issues:</h3>
                  <ul className="space-y-1">
                    {testResults.dataValidation.issues.map((issue, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-red-600">
                        <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {testResults.dataValidation.warnings.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium text-yellow-600 mb-2">Warnings:</h3>
                  <ul className="space-y-1">
                    {testResults.dataValidation.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-yellow-600">
                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {testResults.dataValidation.suggestions.length > 0 && (
                <div>
                  <h3 className="font-medium text-blue-600 mb-2">Suggestions:</h3>
                  <ul className="space-y-1">
                    {testResults.dataValidation.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-blue-600">
                        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Cost Data Display */}
            {testResults.costData && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Retrieved Cost Data
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Accommodation</p>
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                      ${testResults.costData.accommodation?.monthly || 0}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {testResults.costData.accommodation?.source} ({Math.round((testResults.costData.accommodation?.confidence || 0) * 100)}%)
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">Food</p>
                    <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                      ${testResults.costData.food?.monthly || 0}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {testResults.costData.food?.source} ({Math.round((testResults.costData.food?.confidence || 0) * 100)}%)
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Transport</p>
                    <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                      ${testResults.costData.transport?.monthly || 0}
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                      {testResults.costData.transport?.source} ({Math.round((testResults.costData.transport?.confidence || 0) * 100)}%)
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Coworking</p>
                    <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                      ${testResults.costData.coworking?.monthly || 0}
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      {testResults.costData.coworking?.source} ({Math.round((testResults.costData.coworking?.confidence || 0) * 100)}%)
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Monthly Cost:</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${testResults.costData.total?.monthly || 0}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Data Quality: <span className="capitalize font-medium">{testResults.costData.dataQuality}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Test Cities */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Quick Test Cities</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { city: 'Bangkok', country: 'Thailand' },
              { city: 'Lisbon', country: 'Portugal' },
              { city: 'Berlin', country: 'Germany' },
              { city: 'Mexico City', country: 'Mexico' },
              { city: 'Barcelona', country: 'Spain' },
              { city: 'Prague', country: 'Czech Republic' },
              { city: 'Budapest', country: 'Hungary' },
              { city: 'Tallinn', country: 'Estonia' }
            ].map((testCase, index) => (
              <button
                key={index}
                onClick={() => {
                  setTestCity(testCase.city)
                  setTestCountry(testCase.country)
                }}
                className="p-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                {testCase.city}, {testCase.country}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
