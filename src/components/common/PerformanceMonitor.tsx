import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../utils/responsive';

interface PerformanceMetrics {
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
}

interface PerformanceMonitorProps {
  children: React.ReactNode;
  enableMonitoring?: boolean;
  onMetrics?: (metrics: PerformanceMetrics) => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  children,
  enableMonitoring = false,
  onMetrics,
}) => {
  const metricsRef = useRef<PerformanceMetrics>({});
  const observerRef = useRef<PerformanceObserver | null>(null);

  useEffect(() => {
    if (!enableMonitoring || typeof window === 'undefined') {
      return;
    }

    const metrics: PerformanceMetrics = {};

    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        observerRef.current = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
              metrics.firstContentfulPaint = entry.startTime;
              metricsRef.current.firstContentfulPaint = entry.startTime;
            }
          });
        });
        observerRef.current.observe({ entryTypes: ['paint'] });
      } catch (e) {
        console.warn('PerformanceObserver not supported');
      }
    }

    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            metrics.largestContentfulPaint = lastEntry.startTime;
            metricsRef.current.largestContentfulPaint = lastEntry.startTime;
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP observer not supported');
      }
    }

    // First Input Delay
    if ('PerformanceObserver' in window) {
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'first-input') {
              metrics.firstInputDelay = entry.processingStart - entry.startTime;
              metricsRef.current.firstInputDelay = entry.processingStart - entry.startTime;
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID observer not supported');
      }
    }

    // Cumulative Layout Shift
    if ('PerformanceObserver' in window) {
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          });
          metrics.cumulativeLayoutShift = clsValue;
          metricsRef.current.cumulativeLayoutShift = clsValue;
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS observer not supported');
      }
    }

    // Report metrics after 5 seconds
    const timer = setTimeout(() => {
      if (onMetrics) {
        onMetrics(metricsRef.current);
      }
      
      if (__DEV__) {
        // Performance metrics (silent in production)
      }
    }, 5000);

    return () => {
      clearTimeout(timer);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enableMonitoring, onMetrics]);

  return <>{children}</>;
};

// Performance Debug Component (only in development)
export const PerformanceDebug: React.FC = () => {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>({});

  if (!__DEV__) {
    return null;
  }

  return (
    <View style={styles.debugContainer}>
      <Text style={styles.debugTitle}>Performance Metrics</Text>
      {metrics.firstContentfulPaint && (
        <Text style={styles.debugText}>
          FCP: {metrics.firstContentfulPaint.toFixed(2)}ms
        </Text>
      )}
      {metrics.largestContentfulPaint && (
        <Text style={styles.debugText}>
          LCP: {metrics.largestContentfulPaint.toFixed(2)}ms
        </Text>
      )}
      {metrics.firstInputDelay && (
        <Text style={styles.debugText}>
          FID: {metrics.firstInputDelay.toFixed(2)}ms
        </Text>
      )}
      {metrics.cumulativeLayoutShift && (
        <Text style={styles.debugText}>
          CLS: {metrics.cumulativeLayoutShift.toFixed(3)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  debugContainer: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: spacing.sm,
    borderRadius: 8,
    zIndex: 1000,
  },
  debugTitle: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  debugText: {
    color: colors.white,
    fontSize: 10,
    marginBottom: 2,
  },
});
