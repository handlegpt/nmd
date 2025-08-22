import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ActivityIndicator,
  Platform,
  ImageURISource,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { colors, spacing, borderRadius } from '../../utils/responsive';

interface LazyImageProps {
  source: ImageURISource;
  width: number;
  height: number;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  priority?: 'low' | 'normal' | 'high';
  borderRadius?: number;
  showLoadingIndicator?: boolean;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  source,
  width,
  height,
  placeholder,
  onLoad,
  onError,
  style,
  resizeMode = 'cover',
  priority = 'normal',
  borderRadius: customBorderRadius,
  showLoadingIndicator = true,
}) => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority === 'high');
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<Image>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (priority === 'high') {
      setShouldLoad(true);
      return;
    }

    // Intersection Observer for lazy loading (web only)
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setShouldLoad(true);
              if (observerRef.current) {
                observerRef.current.disconnect();
              }
            }
          });
        },
        { 
          threshold: 0.1,
          rootMargin: '50px',
        }
      );

      if (imageRef.current) {
        observerRef.current.observe(imageRef.current);
      }

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    } else {
      // Fallback for mobile or older browsers
      const timer = setTimeout(() => {
        setShouldLoad(true);
      }, priority === 'normal' ? 100 : 500);

      return () => clearTimeout(timer);
    }
  }, [priority]);

  const handleLoad = () => {
    setIsLoading(false);
    setImageLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  const getImageSource = () => {
    if (hasError && placeholder) {
      return { uri: placeholder };
    }
    return source;
  };

  const getBorderRadius = () => {
    if (customBorderRadius !== undefined) {
      return customBorderRadius;
    }
    return borderRadius.md;
  };

  if (!shouldLoad) {
    return (
      <View 
        style={[
          styles.placeholder, 
          { 
            width, 
            height, 
            borderRadius: getBorderRadius(),
            backgroundColor: colors.surface,
          }, 
          style
        ]}
      >
        {showLoadingIndicator && (
          <ActivityIndicator size="small" color={colors.primary} />
        )}
      </View>
    );
  }

  return (
    <View 
      style={[
        styles.container, 
        { 
          width, 
          height, 
          borderRadius: getBorderRadius(),
        }, 
        style
      ]}
    >
      <Image
        ref={imageRef}
        source={getImageSource()}
        style={[
          styles.image, 
          { 
            width, 
            height, 
            borderRadius: getBorderRadius(),
          }
        ]}
        onLoad={handleLoad}
        onError={handleError}
        resizeMode={resizeMode}
        // Web-specific optimizations
        {...(Platform.OS === 'web' && {
          loading: priority === 'high' ? 'eager' : 'lazy',
          decoding: 'async',
        })}
      />
      
      {isLoading && showLoadingIndicator && (
        <View style={[styles.loadingOverlay, { borderRadius: getBorderRadius() }]}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}

      {hasError && !placeholder && (
        <View style={[styles.errorOverlay, { borderRadius: getBorderRadius() }]}>
          <View style={styles.errorIcon}>
            {/* Error icon placeholder */}
          </View>
        </View>
      )}
    </View>
  );
};

// Optimized image list component for better performance
interface LazyImageListProps {
  images: Array<{
    id: string;
    source: ImageURISource;
    width: number;
    height: number;
  }>;
  columns?: number;
  spacing?: number;
  onImagePress?: (imageId: string) => void;
}

export const LazyImageList: React.FC<LazyImageListProps> = ({
  images,
  columns = 2,
  spacing = spacing.sm,
  onImagePress,
}) => {
  const containerWidth = 100; // This should be calculated based on screen width
  const imageWidth = (containerWidth - (columns - 1) * spacing) / columns;
  const imageHeight = imageWidth * 0.75; // 4:3 aspect ratio

  return (
    <View style={styles.imageListContainer}>
      {images.map((image, index) => (
        <View
          key={image.id}
          style={[
            styles.imageListItem,
            {
              width: imageWidth,
              height: imageHeight,
              marginRight: (index + 1) % columns === 0 ? 0 : spacing,
              marginBottom: spacing,
            },
          ]}
        >
          <LazyImage
            source={image.source}
            width={imageWidth}
            height={imageHeight}
            priority={index < 4 ? 'high' : 'normal'}
            onLoad={() => {
              // Optional: Track image load
            }}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.errorLight,
  },
  errorIcon: {
    width: 24,
    height: 24,
    backgroundColor: colors.error,
    borderRadius: 12,
  },
  imageListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageListItem: {
    overflow: 'hidden',
  },
});
