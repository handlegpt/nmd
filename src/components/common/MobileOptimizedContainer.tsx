import React from 'react';
import { View, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useResponsive } from '../../utils/responsive';
import { colors, spacing, safeAreaInsets } from '../../utils/responsive';

interface MobileOptimizedContainerProps {
  children: React.ReactNode;
  style?: any;
  showStatusBar?: boolean;
  statusBarStyle?: 'light-content' | 'dark-content' | 'default';
  backgroundColor?: string;
  paddingTop?: number;
  paddingBottom?: number;
  paddingHorizontal?: number;
}

const MobileOptimizedContainer: React.FC<MobileOptimizedContainerProps> = ({
  children,
  style,
  showStatusBar = true,
  statusBarStyle = 'dark-content',
  backgroundColor = colors.background,
  paddingTop,
  paddingBottom,
  paddingHorizontal,
}) => {
  const { isPhone, isIOS, isAndroid } = useResponsive();

  // Only apply mobile optimizations on phone devices
  if (!isPhone) {
    return (
      <View style={[styles.container, { backgroundColor }, style]}>
        {children}
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      {showStatusBar && (
        <StatusBar
          barStyle={statusBarStyle}
          backgroundColor={backgroundColor}
          translucent={false}
        />
      )}
      <View
        style={[
          styles.mobileContainer,
          {
            backgroundColor,
            paddingTop: paddingTop ?? safeAreaInsets.top,
            paddingBottom: paddingBottom ?? safeAreaInsets.bottom,
            paddingHorizontal: paddingHorizontal ?? spacing.base,
          },
          style,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  mobileContainer: {
    flex: 1,
  },
});

export default MobileOptimizedContainer;
