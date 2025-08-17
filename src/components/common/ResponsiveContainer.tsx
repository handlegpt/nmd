import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useResponsive } from '../../utils/responsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: any;
  maxWidth?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ 
  children, 
  style, 
  maxWidth 
}) => {
  const { isWeb, isTablet, isPhone } = useResponsive();

  // Calculate max width based on device type
  const getMaxWidth = () => {
    if (maxWidth) return maxWidth;
    
    if (isWeb) {
      if (isTablet) return 768;
      if (isPhone) return 480;
      return 1200; // Desktop
    }
    
    return screenWidth; // Mobile native
  };

  const containerStyle = [
    styles.container,
    { maxWidth: getMaxWidth() },
    style
  ];

  return (
    <View style={styles.wrapper}>
      <View style={containerStyle}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
  },
});
