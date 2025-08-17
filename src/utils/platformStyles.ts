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

// Modern shadow presets with subtle, elegant shadows
export const shadowPresets = {
  none: createShadowStyle({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  }),
  subtle: createShadowStyle({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  }),
  small: createShadowStyle({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  }),
  medium: createShadowStyle({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  }),
  large: createShadowStyle({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  }),
  card: createShadowStyle({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  }),
  button: createShadowStyle({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }),
} as const;
