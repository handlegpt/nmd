import { Dimensions, Platform, StatusBar } from 'react-native';
import { createShadowStyle } from './platformStyles';

const { width, height } = Dimensions.get('window');

// Screen dimensions
export const screenWidth = width;
export const screenHeight = height;

// Device type detection
export const isTablet = () => {
  const pixelDensity = width / height;
  return pixelDensity <= 1.6 && Math.max(width, height) >= 1000;
};

export const isPhone = () => !isTablet();

// Platform detection
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';

// Status bar height
export const statusBarHeight = StatusBar.currentHeight || 0;

// Safe area insets (approximate)
export const safeAreaInsets = {
  top: isIOS ? 44 : statusBarHeight,
  bottom: isIOS ? 34 : 0,
  left: 0,
  right: 0,
};

// Responsive dimensions
export const responsiveWidth = (percentage: number) => {
  return (screenWidth * percentage) / 100;
};

export const responsiveHeight = (percentage: number) => {
  return (screenHeight * percentage) / 100;
};

// Font sizes
export const fontSizes = {
  xs: isPhone() ? 10 : 12,
  sm: isPhone() ? 12 : 14,
  base: isPhone() ? 14 : 16,
  lg: isPhone() ? 16 : 18,
  xl: isPhone() ? 18 : 20,
  '2xl': isPhone() ? 20 : 24,
  '3xl': isPhone() ? 24 : 28,
  '4xl': isPhone() ? 28 : 32,
};

// Modern color palette - NomadNow inspired by nomads.com
export const colors = {
  // Primary colors - Warm orange/yellow theme
  primary: '#ff6b35', // Vibrant orange
  primaryLight: '#ff8a65',
  primaryDark: '#e55a2b',
  primaryGradient: ['#ff6b35', '#ffa726'],
  
  // Secondary colors
  secondary: '#ffd54f', // Warm yellow
  secondaryLight: '#ffe082',
  secondaryDark: '#ffb300',
  
  // Accent colors
  accent: '#4fc3f7', // Sky blue
  accentLight: '#81d4fa',
  accentDark: '#29b6f6',
  
  // Neutral colors - Warmer grays
  white: '#ffffff',
  gray50: '#fafafa',
  gray100: '#f5f5f5',
  gray200: '#eeeeee',
  gray300: '#e0e0e0',
  gray400: '#bdbdbd',
  gray500: '#9e9e9e',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  
  // Semantic colors
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  
  // Background colors - Warmer tones
  background: '#fafafa',
  surface: '#ffffff',
  surfaceVariant: '#f5f5f5',
  surfaceElevated: '#ffffff',
  
  // Text colors
  textPrimary: '#212121',
  textSecondary: '#757575',
  textTertiary: '#9e9e9e',
  textInverse: '#ffffff',
  
  // Special colors for nomad theme
  nomadOrange: '#ff6b35',
  nomadYellow: '#ffd54f',
  nomadBlue: '#4fc3f7',
  nomadGreen: '#81c784',
  nomadPurple: '#ba68c8',
};

// Modern spacing system
export const spacing = {
  xs: isPhone() ? 4 : 6,
  sm: isPhone() ? 8 : 12,
  base: isPhone() ? 16 : 20,
  lg: isPhone() ? 24 : 28,
  xl: isPhone() ? 32 : 36,
  '2xl': isPhone() ? 48 : 56,
  '3xl': isPhone() ? 64 : 72,
};

// Modern border radius
export const borderRadius = {
  none: 0,
  sm: isPhone() ? 4 : 6,
  base: isPhone() ? 8 : 10,
  lg: isPhone() ? 12 : 16,
  xl: isPhone() ? 16 : 20,
  '2xl': isPhone() ? 24 : 28,
  full: 9999,
};

// Component sizes
export const componentSizes = {
  // Avatar sizes
  avatar: {
    xs: isPhone() ? 24 : 28,
    sm: isPhone() ? 32 : 36,
    base: isPhone() ? 40 : 44,
    lg: isPhone() ? 48 : 52,
    xl: isPhone() ? 56 : 60,
  },
  
  // Button sizes
  button: {
    height: isPhone() ? 44 : 48,
    paddingHorizontal: isPhone() ? 16 : 20,
  },
  
  // Input sizes
  input: {
    height: isPhone() ? 44 : 48,
    paddingHorizontal: isPhone() ? 12 : 16,
  },
  
  // Card sizes
  card: {
    padding: isPhone() ? 16 : 20,
    margin: isPhone() ? 8 : 12,
  },
  
  // Tab bar
  tabBar: {
    height: isPhone() ? 60 : 70,
    iconSize: isPhone() ? 24 : 28,
  },
  
  // Header
  header: {
    height: isPhone() ? 56 : 64,
    titleSize: isPhone() ? 18 : 20,
  },
};

// Media query breakpoints
export const breakpoints = {
  phone: 480,
  tablet: 768,
  desktop: 1024,
};

// Responsive media queries
export const mediaQuery = {
  phone: `@media (max-width: ${breakpoints.phone}px)`,
  tablet: `@media (min-width: ${breakpoints.phone + 1}px) and (max-width: ${breakpoints.tablet}px)`,
  desktop: `@media (min-width: ${breakpoints.tablet + 1}px)`,
};

// Platform-specific styles
export const platformStyles = {
  shadow: createShadowStyle({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  }),
  
  cardShadow: createShadowStyle({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  }),
  
  buttonShadow: createShadowStyle({
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  }),
};

// Web-specific styles (for React Native Web)
export const webStyles = {
  shadow: {
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  cardShadow: {
    boxShadow: '0 1px 10px rgba(0, 0, 0, 0.05)',
  },
  buttonShadow: {
    boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)',
  },
};

// Responsive grid
export const grid = {
  columns: isPhone() ? 1 : isTablet() ? 2 : 3,
  gap: isPhone() ? 8 : 12,
  padding: isPhone() ? 16 : 20,
};

// Responsive layout helpers
export const layout = {
  // Container padding
  containerPadding: {
    horizontal: isPhone() ? 16 : 20,
    vertical: isPhone() ? 16 : 20,
  },
  
  // Section spacing
  sectionSpacing: {
    vertical: isPhone() ? 24 : 32,
  },
  
  // List item spacing
  listItemSpacing: {
    vertical: isPhone() ? 8 : 12,
  },
  
  // Modal dimensions
  modal: {
    width: isPhone() ? '90%' : isTablet() ? '70%' : '50%',
    maxHeight: isPhone() ? '80%' : '70%',
  },
  
  // Bottom sheet
  bottomSheet: {
    height: isPhone() ? '60%' : '50%',
  },
};

// Responsive typography
export const typography = {
  h1: {
    fontSize: fontSizes['4xl'],
    lineHeight: fontSizes['4xl'] * 1.2,
    fontWeight: '700' as const,
  },
  h2: {
    fontSize: fontSizes['3xl'],
    lineHeight: fontSizes['3xl'] * 1.2,
    fontWeight: '600' as const,
  },
  h3: {
    fontSize: fontSizes['2xl'],
    lineHeight: fontSizes['2xl'] * 1.3,
    fontWeight: '600' as const,
  },
  h4: {
    fontSize: fontSizes.xl,
    lineHeight: fontSizes.xl * 1.4,
    fontWeight: '500' as const,
  },
  body: {
    fontSize: fontSizes.base,
    lineHeight: fontSizes.base * 1.5,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm * 1.4,
    fontWeight: '400' as const,
  },
  button: {
    fontSize: fontSizes.base,
    lineHeight: fontSizes.base * 1.2,
    fontWeight: '600' as const,
  },
};

// Responsive spacing utilities
export const createResponsiveStyle = (baseStyle: any, phoneOverrides?: any, tabletOverrides?: any) => {
  if (isPhone() && phoneOverrides) {
    return { ...baseStyle, ...phoneOverrides };
  }
  if (isTablet() && tabletOverrides) {
    return { ...baseStyle, ...tabletOverrides };
  }
  return baseStyle;
};

// Responsive hook for dynamic updates
export const useResponsive = () => {
  return {
    isPhone: isPhone(),
    isTablet: isTablet(),
    isIOS,
    isAndroid,
    isWeb,
    screenWidth,
    screenHeight,
    fontSizes,
    spacing,
    borderRadius,
    componentSizes,
    layout,
    typography,
  };
};
