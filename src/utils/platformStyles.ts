import { Platform } from 'react-native';

// Platform-specific shadow styles
export const createShadowStyle = (options: {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
}) => {
  const {
    shadowColor = '#000',
    shadowOffset = { width: 0, height: 2 },
    shadowOpacity = 0.1,
    shadowRadius = 4,
    elevation = 2
  } = options;

  if (Platform.OS === 'web') {
    // For web, only return boxShadow, no shadow* properties
    return {
      boxShadow: `${shadowOffset.width}px ${shadowOffset.height}px ${shadowRadius}px rgba(0, 0, 0, ${shadowOpacity})`,
    };
  }

  // For native platforms, return shadow* properties and elevation
  return {
    shadowColor,
    shadowOffset,
    shadowOpacity,
    shadowRadius,
    elevation,
  };
};

// Platform-specific pointer events
export const createPointerStyle = (pointerEvents: 'auto' | 'none' | 'box-none' | 'box-only') => {
  if (Platform.OS === 'web') {
    return {
      style: { pointerEvents },
    };
  }

  return {
    pointerEvents,
  };
};

// Common shadow presets
export const shadowPresets = {
  small: createShadowStyle({
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  }),
  medium: createShadowStyle({
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  }),
  large: createShadowStyle({
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  }),
  card: createShadowStyle({
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  }),
  button: createShadowStyle({
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  }),
} as const;
