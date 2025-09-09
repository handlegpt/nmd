// Data Management Panel for city data updates and quality monitoring
// This component provides an interface for managing city data quality

import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Eye, 
  Download,
  Upload,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { freeApiService, CityData } from '@/lib/freeApiService';
import { dataFeedbackService, DataFeedback } from '@/lib/dataFeedbackService';
import { manualDataUpdateService, ManualUpdate } from '@/lib/manualDataUpdateService';
import { dataQualityService, DataQualityReport } from '@/lib/dataQualityService';

interface DataManagementPanelProps {
  cityId?: string;
  cityName?: string;
  country?: string;
  onDataUpdate?: (data: any) => void;
}

export default function DataManagementPanel({ 
  cityId, 
  cityName, 
  country, 
  onDataUpdate 
}: DataManagementPanelProps) {
  const [activeTab, setActiveTab] = useState<'quality' | 'feedback' | 'updates' | 'api'>('quality');
  const [loading, setLoading] = useState(false);
  const [qualityReport, setQualityReport] = useState<DataQualityReport | null>(null);
  const [feedback, setFeedback] = useState<DataFeedback[]>([]);
  const [updates, setUpdates] = useState<ManualUpdate[]>([]);
  const [apiData, setApiData] = useState<CityData | null>(null);
  const [newFeedback, setNewFeedback] = useState({
    dataType: 'cost_of_living' as const,
    field: 'cost_of_living',
    currentValue: '',
    suggestedValue: '',
    reason: '',
    evidence: ''
  });

  useEffect(() => {
    if (cityId) {
      loadData();
    }
  }, [cityId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load quality report
      if (cityId) {
        const cityData = { id: cityId, name: cityName, country };
        const report = await dataQualityService.checkCityDataQuality(cityData);
        setQualityReport(report);
      }

      // Load feedback
      const cityFeedback = cityId ? dataFeedbackService.getFeedbackByCity(cityId) : [];
      setFeedback(cityFeedback);

      // Load updates
      const cityUpdates = cityId ? manualDataUpdateService.getUpdatesByCity(cityId) : [];
      setUpdates(cityUpdates);

      // Load API data
      if (cityName && country) {
        const apiResponse = await freeApiService.getCityData(cityName, country);
        if (apiResponse.success) {
          setApiData(apiResponse.data!);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = () => {
    if (!cityId || !cityName || !country) return;

    const feedbackData = {
      cityId,
      cityName,
      country,
      dataType: newFeedback.dataType,
      field: newFeedback.field,
      currentValue: newFeedback.currentValue,
      suggestedValue: newFeedback.suggestedValue,
      reason: newFeedback.reason,
      evidence: newFeedback.evidence,
      priority: 'medium' as const
    };

    dataFeedbackService.submitFeedback(feedbackData);
    setNewFeedback({
      dataType: 'cost_of_living',
      field: 'cost_of_living',
      currentValue: '',
      suggestedValue: '',
      reason: '',
      evidence: ''
    });
    loadData();
  };

  const handleRefreshData = async () => {
    setLoading(true);
    try {
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail':
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
      case 'approved':
        return 'text-green-600 bg-green-50';
      case 'fail':
      case 'rejected':
        return 'text-red-600 bg-red-50';
      case 'warning':
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Data Management</h2>
        <button
          onClick={handleRefreshData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'quality', label: 'Quality', icon: BarChart3 },
          { id: 'feedback', label: 'Feedback', icon: MessageSquare },
          { id: 'updates', label: 'Updates', icon: Edit3 },
          { id: 'api', label: 'API Data', icon: Download }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
              activeTab === id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Quality Tab */}
      {activeTab === 'quality' && qualityReport && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Data Quality Report</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Overall Score:</span>
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                qualityReport.overallScore >= 80 ? 'bg-green-100 text-green-800' :
                qualityReport.overallScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {qualityReport.overallScore}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {qualityReport.checks.map((check) => (
              <div key={check.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{check.field}</span>
                  {getStatusIcon(check.status)}
                </div>
                <p className="text-sm text-gray-600 mb-2">{check.message}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Score:</span>
                  <span className="text-sm font-medium">{check.score}%</span>
                </div>
                {check.suggestions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Suggestions:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {check.suggestions.map((suggestion, index) => (
                        <li key={index}>• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {qualityReport.issues.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">Issues Found:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {qualityReport.issues.map((issue, index) => (
                  <li key={index}>• {issue}</li>
                ))}
              </ul>
            </div>
          )}

          {qualityReport.recommendations.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Recommendations:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {qualityReport.recommendations.map((rec, index) => (
                  <li key={index}>• {rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Feedback Tab */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Submit Data Feedback</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Type
                </label>
                <select
                  value={newFeedback.dataType}
                  onChange={(e) => setNewFeedback({ ...newFeedback, dataType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="cost_of_living">Cost of Living</option>
                  <option value="wifi_speed">WiFi Speed</option>
                  <option value="visa_info">Visa Information</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field
                </label>
                <input
                  type="text"
                  value={newFeedback.field}
                  onChange={(e) => setNewFeedback({ ...newFeedback, field: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Value
                </label>
                <input
                  type="text"
                  value={newFeedback.currentValue}
                  onChange={(e) => setNewFeedback({ ...newFeedback, currentValue: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Suggested Value
                </label>
                <input
                  type="text"
                  value={newFeedback.suggestedValue}
                  onChange={(e) => setNewFeedback({ ...newFeedback, suggestedValue: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason
              </label>
              <textarea
                value={newFeedback.reason}
                onChange={(e) => setNewFeedback({ ...newFeedback, reason: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Explain why this data needs to be updated..."
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Evidence (Optional)
              </label>
              <input
                type="url"
                value={newFeedback.evidence}
                onChange={(e) => setNewFeedback({ ...newFeedback, evidence: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="URL to evidence or source..."
              />
            </div>
            <button
              onClick={handleSubmitFeedback}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Submit Feedback
            </button>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Feedback</h3>
            <div className="space-y-3">
              {feedback.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{item.field}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{item.reason}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Current: {item.currentValue}</span>
                    <span>Suggested: {item.suggestedValue}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Updates Tab */}
      {activeTab === 'updates' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Manual Updates</h3>
          <div className="space-y-3">
            {updates.map((update) => (
              <div key={update.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{update.field}</span>
                  {getStatusIcon(update.status)}
                </div>
                <p className="text-sm text-gray-600 mb-2">{update.reason}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>From: {update.oldValue}</span>
                  <span>To: {update.newValue}</span>
                  <span>Source: {update.source}</span>
                  <span>{new Date(update.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API Data Tab */}
      {activeTab === 'api' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">API Data</h3>
          {apiData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Cost of Living</h4>
                <div className="space-y-1 text-sm">
                  <div>Monthly: ${apiData.costOfLiving.monthly}</div>
                  <div>Currency: {apiData.costOfLiving.currency}</div>
                  <div>Source: {apiData.costOfLiving.source}</div>
                  <div>Updated: {new Date(apiData.costOfLiving.lastUpdated).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">WiFi Speed</h4>
                <div className="space-y-1 text-sm">
                  <div>Speed: {apiData.wifiSpeed.average} {apiData.wifiSpeed.unit}</div>
                  <div>Source: {apiData.wifiSpeed.source}</div>
                  <div>Updated: {new Date(apiData.wifiSpeed.lastUpdated).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No API data available</p>
          )}
        </div>
      )}
    </div>
  );
}
