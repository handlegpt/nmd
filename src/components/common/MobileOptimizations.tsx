import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  Text,
  Dimensions,
  InteractionManager,
  Platform,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import { useResponsive } from '../../utils/responsive';
import { shadowPresets } from '../../utils/platformStyles';

const { width, height } = Dimensions.get('window');

// Lazy loading image component
interface LazyImageProps {
  uri: string;
  width: number;
  height: number;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  style?: any;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  uri,
  width: imgWidth,
  height: imgHeight,
  placeholder = '',
  onLoad,
  onError,
  style,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const imageRef = useRef<Image>(null);

  useEffect(() => {
    // Delay loading to improve performance
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  if (!shouldLoad) {
    return (
      <View style={[styles.placeholder, { width: imgWidth, height: imgHeight }, style]}>
        <ActivityIndicator size="small" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={[styles.imageContainer, { width: imgWidth, height: imgHeight }, style]}>
      <Image
        ref={imageRef}
        source={{ uri: hasError ? placeholder : uri }}
        style={[styles.image, { width: imgWidth, height: imgHeight }]}
        onLoad={handleLoad}
        onError={handleError}
        resizeMode="cover"
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#6366f1" />
        </View>
      )}
    </View>
  );
};

// Virtualized list component for better performance
interface VirtualizedListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  onEndReached?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  loading?: boolean;
  emptyComponent?: React.ReactElement;
  headerComponent?: React.ReactElement;
  footerComponent?: React.ReactElement;
  initialNumToRender?: number;
  maxToRenderPerBatch?: number;
  windowSize?: number;
  removeClippedSubviews?: boolean;
}

export const VirtualizedList = <T extends any>({
  data,
  renderItem,
  keyExtractor,
  onEndReached,
  onRefresh,
  refreshing = false,
  loading = false,
  emptyComponent,
  headerComponent,
  footerComponent,
  initialNumToRender = 10,
  maxToRenderPerBatch = 10,
  windowSize = 10,
  removeClippedSubviews = true,
}: VirtualizedListProps<T>) => {
  const { isPhone } = useResponsive();

  const optimizedInitialNumToRender = isPhone ? 5 : initialNumToRender;
  const optimizedMaxToRenderPerBatch = isPhone ? 5 : maxToRenderPerBatch;
  const optimizedWindowSize = isPhone ? 5 : windowSize;

  const renderItemCallback = useCallback(
    ({ item, index }: { item: T; index: number }) => renderItem(item, index),
    [renderItem]
  );

  const keyExtractorCallback = useCallback(
    (item: T, index: number) => keyExtractor(item, index),
    [keyExtractor]
  );

  const onEndReachedCallback = useCallback(() => {
    if (onEndReached && !loading) {
      onEndReached();
    }
  }, [onEndReached, loading]);

  if (data.length === 0 && !loading) {
    return emptyComponent || (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No items found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      renderItem={renderItemCallback}
      keyExtractor={keyExtractorCallback}
      onEndReached={onEndReachedCallback}
      onEndReachedThreshold={0.1}
      onRefresh={onRefresh}
      refreshing={refreshing}
      ListHeaderComponent={headerComponent}
      ListFooterComponent={
        loading ? (
          <View style={styles.loadingFooter}>
            <ActivityIndicator size="small" />
            <Text style={styles.loadingText}>Loading more...</Text>
          </View>
        ) : (
          footerComponent
        )
      }
      initialNumToRender={optimizedInitialNumToRender}
      maxToRenderPerBatch={optimizedMaxToRenderPerBatch}
      windowSize={optimizedWindowSize}
      removeClippedSubviews={removeClippedSubviews}
      getItemLayout={(data, index) => ({
        length: 100, // Approximate item height
        offset: 100 * index,
        index,
      })}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    />
  );
};

// Memory management component
interface MemoryManagerProps {
  children: React.ReactNode;
  maxCacheSize?: number; // in MB
  enableImageCache?: boolean;
  enableDataCache?: boolean;
}

export const MemoryManager: React.FC<MemoryManagerProps> = ({
  children,
  maxCacheSize = 50,
  enableImageCache = true,
  enableDataCache = true,
}) => {
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [cacheSize, setCacheSize] = useState(0);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Web memory management
      const checkMemory = () => {
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          const usedMB = memory.usedJSHeapSize / 1024 / 1024;
          setMemoryUsage(usedMB);
        }
      };

      const interval = setInterval(checkMemory, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const clearCache = useCallback(() => {
    if (Platform.OS === 'web') {
      // Clear image cache
      if (enableImageCache) {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
          if (img.src.startsWith('blob:')) {
            URL.revokeObjectURL(img.src);
          }
        });
      }

      // Clear data cache
      if (enableDataCache) {
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              caches.delete(name);
            });
          });
        }
      }

      setCacheSize(0);
    }
  }, [enableImageCache, enableDataCache]);

  useEffect(() => {
    if (cacheSize > maxCacheSize) {
      clearCache();
    }
  }, [cacheSize, maxCacheSize, clearCache]);

  return (
    <View style={styles.memoryManager}>
      {children}
      {Platform.OS === 'web' && memoryUsage > 100 && (
        <View style={styles.memoryWarning}>
          <Text style={styles.memoryWarningText}>
            High memory usage: {memoryUsage.toFixed(1)}MB
          </Text>
          <Text style={styles.memoryWarningText} onPress={clearCache}>
            Clear Cache
          </Text>
        </View>
      )}
    </View>
  );
};

// Performance monitoring component
interface PerformanceMonitorProps {
  children: React.ReactNode;
  enableMonitoring?: boolean;
  onPerformanceIssue?: (issue: string) => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  children,
  enableMonitoring = true,
  onPerformanceIssue,
}) => {
  const [showPerformanceInfo, setShowPerformanceInfo] = useState(false);
  const [fps, setFps] = useState(60);
  const [renderTime, setRenderTime] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(Date.now());

  useEffect(() => {
    if (!enableMonitoring) return;

    const measurePerformance = () => {
      const now = Date.now();
      frameCount.current++;

      if (now - lastTime.current >= 1000) {
        const currentFps = Math.round((frameCount.current * 1000) / (now - lastTime.current));
        setFps(currentFps);

        if (currentFps < 30 && onPerformanceIssue) {
          onPerformanceIssue(`Low FPS detected: ${currentFps}`);
        }

        frameCount.current = 0;
        lastTime.current = now;
      }

      requestAnimationFrame(measurePerformance);
    };

    const animationId = requestAnimationFrame(measurePerformance);
    return () => cancelAnimationFrame(animationId);
  }, [enableMonitoring, onPerformanceIssue]);

  const measureRenderTime = useCallback((callback: () => void) => {
    const startTime = performance.now();
    callback();
    const endTime = performance.now();
    const renderTimeMs = endTime - startTime;
    setRenderTime(renderTimeMs);

    if (renderTimeMs > 16 && onPerformanceIssue) {
      onPerformanceIssue(`Slow render detected: ${renderTimeMs.toFixed(2)}ms`);
    }
  }, [onPerformanceIssue]);

  return (
    <View style={styles.performanceMonitor}>
      {children}
      {enableMonitoring && Platform.OS === 'web' && showPerformanceInfo && (
        <View style={styles.performanceInfo}>
          <Text style={styles.performanceText}>FPS: {fps}</Text>
          <Text style={styles.performanceText}>Render: {renderTime.toFixed(1)}ms</Text>
        </View>
      )}
      {/* Hidden toggle button for development */}
      {enableMonitoring && Platform.OS === 'web' && __DEV__ && (
        <View 
          style={styles.performanceToggle}
          onTouchEnd={() => setShowPerformanceInfo(!showPerformanceInfo)}
        >
          <Text style={styles.performanceToggleText}>⚡</Text>
        </View>
      )}
    </View>
  );
};

// Optimized card component
interface OptimizedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  shadowPreset?: 'small' | 'medium' | 'large' | 'card' | 'button';
  loading?: boolean;
}

export const OptimizedCard: React.FC<OptimizedCardProps> = ({
  children,
  onPress,
  style,
  shadowPreset = 'small',
  loading = false,
}) => {
  const { isPhone, platformStyles } = useResponsive();

  if (loading) {
    return (
      <Card style={[styles.optimizedCard, style, { ...shadowPresets[shadowPreset] }]}>
        <Card.Content>
          <ActivityIndicator size="small" />
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card
      style={[
        styles.optimizedCard,
        isPhone ? { ...shadowPresets.small } : { ...shadowPresets[shadowPreset] },
        style,
      ]}
      onPress={onPress}
    >
      <Card.Content>{children}</Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    borderRadius: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  memoryManager: {
    flex: 1,
  },
  memoryWarning: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ff6b6b',
    padding: 8,
    borderRadius: 4,
  },
  memoryWarningText: {
    color: 'white',
    fontSize: 12,
  },
  performanceMonitor: {
    flex: 1,
  },
  performanceInfo: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 4,
  },
  performanceText: {
    color: 'white',
    fontSize: 12,
  },
  performanceToggle: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 8,
    borderRadius: 4,
    cursor: 'pointer',
  },
  performanceToggleText: {
    color: 'white',
    fontSize: 16,
  },
  optimizedCard: {
    margin: 8,
    borderRadius: 12,
  },
});
