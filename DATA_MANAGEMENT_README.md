# Data Management System

This document describes the free data management system implemented for NomadNow, which includes free API integration, manual data updates, and user feedback functionality.

## Overview

The data management system consists of four main components:

1. **Free API Service** - Integrates with free APIs to get city data
2. **User Feedback System** - Allows users to report data inaccuracies
3. **Manual Data Update System** - Handles manual updates to city data
4. **Data Quality Service** - Validates and monitors data quality

## Components

### 1. Free API Service (`src/lib/freeApiService.ts`)

Integrates with free APIs to get city data including cost of living and WiFi speed.

**Features:**
- Cities Cost of Living API integration (primary)
- Numbeo API integration (fallback, 1000 free requests/month)
- Ookla Speedtest API for WiFi speed data
- Manual data fallback
- Smart caching system (30-90 days cache)
- Popular cities 90-day cache, others 30-day cache
- Multiple data sources with fallback
- Preloading system for popular cities

**Usage:**
```typescript
import { freeApiService } from '@/lib/freeApiService';

// Get city data
const response = await freeApiService.getCityData('Bangkok', 'Thailand');
if (response.success) {
  console.log(response.data);
}

// Get multiple cities
const cities = await freeApiService.getMultipleCitiesData([
  { name: 'Bangkok', country: 'Thailand' },
  { name: 'Lisbon', country: 'Portugal' }
]);

// Preload popular cities (recommended for production)
await freeApiService.preloadPopularCities();

// Get cache information
const cacheInfo = freeApiService.getCacheInfo();
console.log(`Cached ${cacheInfo.totalCached} cities`);

// Refresh expired data
await freeApiService.refreshExpiredData();
```

### 2. User Feedback System (`src/lib/dataFeedbackService.ts`)

Allows users to report data inaccuracies and suggest corrections.

**Features:**
- Submit feedback for data inaccuracies
- Track feedback status (pending, reviewed, accepted, rejected)
- Priority levels (low, medium, high)
- Evidence support (URLs to sources)
- Local storage with backend sync

**Usage:**
```typescript
import { dataFeedbackService } from '@/lib/dataFeedbackService';

// Submit feedback
const feedbackId = dataFeedbackService.submitFeedback({
  cityId: 'city-123',
  cityName: 'Bangkok',
  country: 'Thailand',
  dataType: 'cost_of_living',
  field: 'cost_of_living',
  currentValue: 800,
  suggestedValue: 900,
  reason: 'Rent prices have increased recently',
  evidence: 'https://example.com/rent-data',
  priority: 'medium'
});

// Get feedback by city
const cityFeedback = dataFeedbackService.getFeedbackByCity('city-123');
```

### 3. Manual Data Update System (`src/lib/manualDataUpdateService.ts`)

Handles manual updates to city data with validation and approval workflow.

**Features:**
- Submit manual updates
- Approval workflow (pending, approved, rejected)
- Data validation
- Update history tracking
- Source tracking (admin, user_feedback, api_update, manual_research)

**Usage:**
```typescript
import { manualDataUpdateService } from '@/lib/manualDataUpdateService';

// Submit update
const updateId = manualDataUpdateService.submitUpdate({
  cityId: 'city-123',
  cityName: 'Bangkok',
  country: 'Thailand',
  field: 'cost_of_living',
  oldValue: 800,
  newValue: 900,
  reason: 'Updated based on recent market research',
  source: 'manual_research',
  updatedBy: 'admin'
});

// Approve update
manualDataUpdateService.approveUpdate(updateId, 'admin', 'Data verified');
```

### 4. Data Quality Service (`src/lib/dataQualityService.ts`)

Validates and monitors data quality with automated checks.

**Features:**
- Automated quality checks (accuracy, completeness, freshness, consistency)
- Quality scoring (0-100)
- Issue detection and recommendations
- Quality statistics and reporting
- Expected value ranges by country

**Usage:**
```typescript
import { dataQualityService } from '@/lib/dataQualityService';

// Check city data quality
const report = await dataQualityService.checkCityDataQuality(cityData);
console.log(`Overall Score: ${report.overallScore}%`);
console.log(`Issues: ${report.issues.length}`);
console.log(`Recommendations: ${report.recommendations.length}`);

// Get quality statistics
const stats = dataQualityService.getQualityStats();
console.log(`Average Score: ${stats.averageScore}%`);
```

### 5. Data Management Panel (`src/components/DataManagementPanel.tsx`)

React component that provides a UI for managing city data quality.

**Features:**
- Quality report display
- Feedback submission form
- Update history view
- API data display
- Real-time data refresh

**Usage:**
```tsx
import DataManagementPanel from '@/components/DataManagementPanel';

<DataManagementPanel
  cityId="city-123"
  cityName="Bangkok"
  country="Thailand"
  onDataUpdate={(data) => console.log('Data updated:', data)}
/>
```

## Setup Instructions

### 1. Environment Variables

Add the following to your `.env.local` file:

```env
# Free API Services
CITIES_API_KEY=your_cities_api_key_here
NUMBEO_API_KEY=your_numbeo_api_key_here
```

### 2. API Keys

#### Cities Cost of Living API (Primary)
1. Visit [Cities Cost of Living API](https://cities-cost-of-living.com)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add to environment variables as `CITIES_API_KEY`

#### Numbeo API (Fallback)
1. Visit [Numbeo API](https://www.numbeo.com/api/)
2. Sign up for a free account
3. Get your API key (1000 free requests/month)
4. Add to environment variables as `NUMBEO_API_KEY`

#### Ookla Speedtest API (WiFi Speed)
- No API key required
- Free to use for WiFi speed data
- Automatically integrated

### 3. Integration

The system is designed to work with your existing city data structure. It will:

1. Try to fetch data from Cities Cost of Living API (primary)
2. Fall back to Numbeo API if primary fails
3. Enhance with WiFi speed data from Ookla Speedtest
4. Fall back to manual data if all APIs are unavailable
5. Allow users to submit feedback about data accuracy
6. Provide quality checks and recommendations

## Data Flow

```
User Request → Free API Service → Cities API (Primary)
                    ↓
              Numbeo API (Fallback)
                    ↓
              Ookla Speedtest (WiFi Data)
                    ↓
              Manual Data (Final Fallback)
                    ↓
              Data Quality Check
                    ↓
              User Feedback System
                    ↓
              Manual Update System
                    ↓
              Updated Data
```

## Benefits

### Cost-Effective
- Uses free API tiers
- No monthly subscription costs
- Manual data as fallback
- Smart caching reduces API calls by 90%+

### User-Driven
- Community feedback improves data quality
- Users can report inaccuracies
- Transparent data sources

### Quality-Focused
- Automated quality checks
- Data validation
- Continuous monitoring

### Scalable
- Can easily add more API sources
- Supports multiple data types
- Extensible architecture

### Smart Caching
- 30-90 day cache for cost of living data
- Popular cities cached for 90 days
- Other cities cached for 30 days
- Preloading system for better performance
- Automatic cache refresh for expired data

## Future Enhancements

1. **More API Sources**: Add additional free APIs
2. **Automated Updates**: Schedule regular data updates
3. **Machine Learning**: Use ML to predict data quality
4. **Real-time Sync**: Sync with backend database
5. **Advanced Analytics**: More detailed quality metrics

## Monitoring

The system provides several monitoring capabilities:

- Quality scores for each city
- Feedback statistics
- Update history
- API usage tracking
- Data freshness monitoring

## Troubleshooting

### Common Issues

1. **API Rate Limits**: Free APIs have rate limits
   - Solution: Use caching and fallback to manual data

2. **Data Inconsistencies**: Different APIs may have different data
   - Solution: Use quality checks and user feedback

3. **Missing Data**: Some cities may not have data in free APIs
   - Solution: Use manual data and encourage user contributions

### Debugging

Enable debug logging by setting:
```env
DEBUG=true
```

This will log API calls, quality checks, and data updates to the console.

## Support

For issues or questions:
1. Check the console for error messages
2. Verify API keys are correct
3. Check network connectivity
4. Review data quality reports

## License

This data management system is part of the NomadNow project and follows the same license terms.
