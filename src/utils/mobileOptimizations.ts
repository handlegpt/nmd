import { Platform, Dimensions } from 'react-native';
import { colors, spacing, borderRadius } from './responsive';

const { width, height } = Dimensions.get('window');

// Mobile-specific optimizations
export const mobileOptimizations = {
  // Check if device is a small phone
  isSmallPhone: () => {
    return width < 375 || height < 667;
  },

  // Check if device is a large phone
  isLargePhone: () => {
    return width >= 414 || height >= 896;
  },

  // Get optimal font size for mobile
  getOptimalFontSize: (baseSize: number) => {
    if (mobileOptimizations.isSmallPhone()) {
      return baseSize - 2;
    } else if (mobileOptimizations.isLargePhone()) {
      return baseSize + 1;
    }
    return baseSize;
  },

  // Get optimal spacing for mobile
  getOptimalSpacing: (baseSpacing: number) => {
    if (mobileOptimizations.isSmallPhone()) {
      return baseSpacing - 2;
    } else if (mobileOptimizations.isLargePhone()) {
      return baseSpacing + 2;
    }
    return baseSpacing;
  },

  // Get optimal padding for mobile
  getOptimalPadding: () => {
    if (mobileOptimizations.isSmallPhone()) {
      return spacing.sm;
    } else if (mobileOptimizations.isLargePhone()) {
      return spacing.lg;
    }
    return spacing.base;
  },

  // Get optimal card height for mobile
  getOptimalCardHeight: () => {
    if (mobileOptimizations.isSmallPhone()) {
      return 120;
    } else if (mobileOptimizations.isLargePhone()) {
      return 160;
    }
    return 140;
  },

  // Get optimal avatar size for mobile
  getOptimalAvatarSize: () => {
    if (mobileOptimizations.isSmallPhone()) {
      return 40;
    } else if (mobileOptimizations.isLargePhone()) {
      return 56;
    }
    return 48;
  },

  // Get optimal button height for mobile
  getOptimalButtonHeight: () => {
    if (mobileOptimizations.isSmallPhone()) {
      return 40;
    } else if (mobileOptimizations.isLargePhone()) {
      return 52;
    }
    return 44;
  },

  // Get optimal input height for mobile
  getOptimalInputHeight: () => {
    if (mobileOptimizations.isSmallPhone()) {
      return 40;
    } else if (mobileOptimizations.isLargePhone()) {
      return 52;
    }
    return 44;
  },

  // Get optimal header height for mobile
  getOptimalHeaderHeight: () => {
    if (mobileOptimizations.isSmallPhone()) {
      return 80;
    } else if (mobileOptimizations.isLargePhone()) {
      return 100;
    }
    return 90;
  },

  // Get optimal tab bar height for mobile
  getOptimalTabBarHeight: () => {
    if (mobileOptimizations.isSmallPhone()) {
      return 50;
    } else if (mobileOptimizations.isLargePhone()) {
      return 70;
    }
    return 60;
  },

  // Get optimal list item height for mobile
  getOptimalListItemHeight: () => {
    if (mobileOptimizations.isSmallPhone()) {
      return 80;
    } else if (mobileOptimizations.isLargePhone()) {
      return 100;
    }
    return 90;
  },

  // Get optimal modal dimensions for mobile
  getOptimalModalDimensions: () => {
    if (mobileOptimizations.isSmallPhone()) {
      return {
        width: '95%',
        maxHeight: '85%',
        borderRadius: borderRadius.lg,
      };
    } else if (mobileOptimizations.isLargePhone()) {
      return {
        width: '85%',
        maxHeight: '75%',
        borderRadius: borderRadius.xl,
      };
    }
    return {
      width: '90%',
      maxHeight: '80%',
      borderRadius: borderRadius.lg,
    };
  },

  // Get optimal bottom sheet height for mobile
  getOptimalBottomSheetHeight: () => {
    if (mobileOptimizations.isSmallPhone()) {
      return '65%';
    } else if (mobileOptimizations.isLargePhone()) {
      return '55%';
    }
    return '60%';
  },

  // Get optimal grid columns for mobile
  getOptimalGridColumns: () => {
    if (mobileOptimizations.isSmallPhone()) {
      return 1;
    } else if (mobileOptimizations.isLargePhone()) {
      return 2;
    }
    return 1;
  },

  // Get optimal image dimensions for mobile
  getOptimalImageDimensions: () => {
    if (mobileOptimizations.isSmallPhone()) {
      return {
        width: width - 32,
        height: 200,
        borderRadius: borderRadius.md,
      };
    } else if (mobileOptimizations.isLargePhone()) {
      return {
        width: width - 48,
        height: 250,
        borderRadius: borderRadius.lg,
      };
    }
    return {
      width: width - 40,
      height: 220,
      borderRadius: borderRadius.md,
    };
  },

  // Get optimal search bar height for mobile
  getOptimalSearchBarHeight: () => {
    if (mobileOptimizations.isSmallPhone()) {
      return 44;
    } else if (mobileOptimizations.isLargePhone()) {
      return 52;
    }
    return 48;
  },

  // Get optimal chip height for mobile
  getOptimalChipHeight: () => {
    if (mobileOptimizations.isSmallPhone()) {
      return 28;
    } else if (mobileOptimizations.isLargePhone()) {
      return 36;
    }
    return 32;
  },

  // Get optimal icon size for mobile
  getOptimalIconSize: () => {
    if (mobileOptimizations.isSmallPhone()) {
      return 20;
    } else if (mobileOptimizations.isLargePhone()) {
      return 28;
    }
    return 24;
  },

  // Get optimal badge size for mobile
  getOptimalBadgeSize: () => {
    if (mobileOptimizations.isSmallPhone()) {
      return 12;
    } else if (mobileOptimizations.isLargePhone()) {
      return 18;
    }
    return 16;
  },

  // Get optimal shadow for mobile
  getOptimalShadow: () => {
    if (mobileOptimizations.isSmallPhone()) {
      return {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      };
    } else if (mobileOptimizations.isLargePhone()) {
      return {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
      };
    }
    return {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: 3,
    };
  },

  // Get optimal animation duration for mobile
  getOptimalAnimationDuration: () => {
    if (mobileOptimizations.isSmallPhone()) {
      return 200; // Faster for small screens
    } else if (mobileOptimizations.isLargePhone()) {
      return 300; // Slightly slower for large screens
    }
    return 250; // Default
  },

  // Get optimal touch target size for mobile
  getOptimalTouchTargetSize: () => {
    if (mobileOptimizations.isSmallPhone()) {
      return 44; // Minimum touch target
    } else if (mobileOptimizations.isLargePhone()) {
      return 56; // Larger touch target for large screens
    }
    return 48; // Default
  },

  // Get optimal scroll indicator size for mobile
  getOptimalScrollIndicatorSize: () => {
    if (mobileOptimizations.isSmallPhone()) {
      return 4;
    } else if (mobileOptimizations.isLargePhone()) {
      return 8;
    }
    return 6;
  },

  // Get optimal refresh control size for mobile
  getOptimalRefreshControlSize: () => {
    if (mobileOptimizations.isSmallPhone()) {
      return 20;
    } else if (mobileOptimizations.isLargePhone()) {
      return 28;
    }
    return 24;
  },
};

// Mobile-specific style helpers
export const mobileStyles = {
  // Compact styles for small phones
  compact: {
    padding: mobileOptimizations.getOptimalPadding(),
    margin: mobileOptimizations.getOptimalSpacing(8),
    fontSize: mobileOptimizations.getOptimalFontSize(14),
    lineHeight: mobileOptimizations.getOptimalFontSize(14) * 1.4,
  },

  // Comfortable styles for large phones
  comfortable: {
    padding: mobileOptimizations.getOptimalPadding() + 4,
    margin: mobileOptimizations.getOptimalSpacing(12),
    fontSize: mobileOptimizations.getOptimalFontSize(16),
    lineHeight: mobileOptimizations.getOptimalFontSize(16) * 1.5,
  },

  // Touch-friendly styles
  touchFriendly: {
    minHeight: mobileOptimizations.getOptimalTouchTargetSize(),
    minWidth: mobileOptimizations.getOptimalTouchTargetSize(),
    paddingVertical: mobileOptimizations.getOptimalSpacing(8),
    paddingHorizontal: mobileOptimizations.getOptimalSpacing(12),
  },

  // Mobile-optimized shadows
  shadow: mobileOptimizations.getOptimalShadow(),

  // Mobile-optimized card styles
  card: {
    borderRadius: borderRadius.lg,
    marginBottom: mobileOptimizations.getOptimalSpacing(8),
    ...mobileOptimizations.getOptimalShadow(),
  },

  // Mobile-optimized button styles
  button: {
    height: mobileOptimizations.getOptimalButtonHeight(),
    borderRadius: borderRadius.md,
    paddingHorizontal: mobileOptimizations.getOptimalSpacing(16),
  },

  // Mobile-optimized input styles
  input: {
    height: mobileOptimizations.getOptimalInputHeight(),
    borderRadius: borderRadius.md,
    paddingHorizontal: mobileOptimizations.getOptimalSpacing(12),
  },

  // Mobile-optimized header styles
  header: {
    height: mobileOptimizations.getOptimalHeaderHeight(),
    paddingHorizontal: mobileOptimizations.getOptimalPadding(),
  },

  // Mobile-optimized list styles
  list: {
    paddingHorizontal: mobileOptimizations.getOptimalPadding(),
  },

  // Mobile-optimized grid styles
  grid: {
    columns: mobileOptimizations.getOptimalGridColumns(),
    gap: mobileOptimizations.getOptimalSpacing(8),
    padding: mobileOptimizations.getOptimalPadding(),
  },
};
