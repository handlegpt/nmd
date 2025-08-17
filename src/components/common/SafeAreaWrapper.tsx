import React from 'react';
import {
  View,
  StyleSheet,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '../../utils/responsive';
import { shadowPresets } from '../../utils/platformStyles';

const { width, height } = Dimensions.get('window');

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: any;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  backgroundColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content' | 'default';
  statusBarHidden?: boolean;
}

export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  style,
  edges = ['top', 'bottom', 'left', 'right'],
  backgroundColor = '#ffffff',
  statusBarStyle = 'dark-content',
  statusBarHidden = false,
}) => {
  const insets = useSafeAreaInsets();
  const { isPhone, isIOS } = useResponsive();

  // Calculate safe area padding
  const getSafeAreaPadding = () => {
    const padding: any = {};

    if (edges.includes('top')) {
      padding.paddingTop = isPhone ? insets.top : 0;
    }
    if (edges.includes('bottom')) {
      padding.paddingBottom = isPhone ? insets.bottom : 0;
    }
    if (edges.includes('left')) {
      padding.paddingLeft = isPhone ? insets.left : 0;
    }
    if (edges.includes('right')) {
      padding.paddingRight = isPhone ? insets.right : 0;
    }

    return padding;
  };

  // Get status bar height for web
  const getStatusBarHeight = () => {
    if (Platform.OS === 'web') {
      return isIOS ? 44 : 24;
    }
    return StatusBar.currentHeight || 0;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          ...getSafeAreaPadding(),
        },
        style,
      ]}
    >
      {/* Status bar for web */}
      {Platform.OS === 'web' && edges.includes('top') && (
        <View
          style={[
            styles.statusBar,
            {
              height: getStatusBarHeight(),
              backgroundColor,
            },
          ]}
        />
      )}
      
      {/* Status bar configuration */}
      {Platform.OS !== 'web' && (
        <StatusBar
          barStyle={statusBarStyle}
          hidden={statusBarHidden}
          backgroundColor={backgroundColor}
          translucent={true}
        />
      )}
      
      {children}
    </View>
  );
};

// Safe area hook for custom implementations
export const useSafeArea = () => {
  const insets = useSafeAreaInsets();
  const { isPhone } = useResponsive();

  return {
    top: isPhone ? insets.top : 0,
    bottom: isPhone ? insets.bottom : 0,
    left: isPhone ? insets.left : 0,
    right: isPhone ? insets.right : 0,
    isPhone,
  };
};

// Screen wrapper with safe area
interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: any;
  backgroundColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content' | 'default';
  statusBarHidden?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  style,
  backgroundColor = '#f8fafc',
  statusBarStyle = 'dark-content',
  statusBarHidden = false,
  edges = ['top', 'bottom'],
}) => {
  return (
    <SafeAreaWrapper
      style={[styles.screen, style]}
      backgroundColor={backgroundColor}
      statusBarStyle={statusBarStyle}
      statusBarHidden={statusBarHidden}
      edges={edges}
    >
      {children}
    </SafeAreaWrapper>
  );
};

// Modal wrapper with safe area
interface ModalWrapperProps {
  children: React.ReactNode;
  style?: any;
  backgroundColor?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({
  children,
  style,
  backgroundColor = '#ffffff',
  edges = ['top', 'bottom'],
}) => {
  return (
    <SafeAreaWrapper
      style={[styles.modal, style]}
      backgroundColor={backgroundColor}
      edges={edges}
    >
      {children}
    </SafeAreaWrapper>
  );
};

// Bottom sheet wrapper
interface BottomSheetWrapperProps {
  children: React.ReactNode;
  style?: any;
  backgroundColor?: string;
}

export const BottomSheetWrapper: React.FC<BottomSheetWrapperProps> = ({
  children,
  style,
  backgroundColor = '#ffffff',
}) => {
  return (
    <SafeAreaWrapper
      style={[styles.bottomSheet, style]}
      backgroundColor={backgroundColor}
      edges={['bottom']}
    >
      {children}
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBar: {
    width: '100%',
  },
  screen: {
    flex: 1,
  },
  modal: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...shadowPresets.large,
  },
});
