import { Platform } from 'react-native';

// Animation configuration to handle useNativeDriver compatibility
export const animationConfig = {
  // Check if native driver is supported
  useNativeDriver: Platform.OS !== 'web',
  
  // Fallback configuration for web
  webConfig: {
    useNativeDriver: false,
    duration: 300,
    easing: 'ease-in-out',
  },
  
  // Native configuration for mobile
  nativeConfig: {
    useNativeDriver: true,
    duration: 300,
    easing: 'ease-in-out',
  },
  
  // Get appropriate config based on platform
  getConfig() {
    return Platform.OS === 'web' ? this.webConfig : this.nativeConfig;
  },
  
  // Fade animation
  fade: {
    in: {
      opacity: 1,
      duration: 300,
      useNativeDriver: Platform.OS !== 'web',
    },
    out: {
      opacity: 0,
      duration: 300,
      useNativeDriver: Platform.OS !== 'web',
    },
  },
  
  // Slide animation
  slide: {
    up: {
      transform: [{ translateY: 0 }],
      opacity: 1,
      duration: 300,
      useNativeDriver: Platform.OS !== 'web',
    },
    down: {
      transform: [{ translateY: 50 }],
      opacity: 0,
      duration: 300,
      useNativeDriver: Platform.OS !== 'web',
    },
  },
  
  // Scale animation
  scale: {
    in: {
      transform: [{ scale: 1 }],
      opacity: 1,
      duration: 300,
      useNativeDriver: Platform.OS !== 'web',
    },
    out: {
      transform: [{ scale: 0.9 }],
      opacity: 0,
      duration: 300,
      useNativeDriver: Platform.OS !== 'web',
    },
  },
};

// Hook for safe animation usage
export const useSafeAnimation = () => {
  return {
    useNativeDriver: Platform.OS !== 'web',
    duration: 300,
    easing: 'ease-in-out',
  };
};
