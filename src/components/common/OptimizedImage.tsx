import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, ImageURISource } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { colors, spacing, borderRadius } from '../../utils/responsive';

interface OptimizedImageProps {
  source: ImageURISource;
  width: number;
  height: number;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  priority?: 'low' | 'normal' | 'high';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  width,
  height,
  placeholder,
  onLoad,
  onError,
  style,
  resizeMode = 'cover',
  priority = 'normal',
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority === 'high');
  const imageRef = useRef<Image>(null);

  useEffect(() => {
    if (priority === 'high') {
      setShouldLoad(true);
      return;
    }

    // Intersection Observer for lazy loading (web only)
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setShouldLoad(true);
              observer.disconnect();
            }
          });
        },
        { threshold: 0.1 }
      );

      if (imageRef.current) {
        observer.observe(imageRef.current);
      }

      return () => observer.disconnect();
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
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  const imageSource = hasError && placeholder ? { uri: placeholder } : source;

  if (!shouldLoad) {
    return (
      <View style={[styles.placeholder, { width, height }, style]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { width, height }, style]}>
      <Image
        ref={imageRef}
        source={imageSource}
        style={[styles.image, { width, height }]}
        onLoad={handleLoad}
        onError={handleError}
        resizeMode={resizeMode}
        // Web-specific optimizations
        {...(typeof window !== 'undefined' && {
          loading: priority === 'high' ? 'eager' : 'lazy',
          decoding: 'async',
        })}
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: borderRadius.base,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.base,
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
});

export default OptimizedImage;
