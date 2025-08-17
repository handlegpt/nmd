import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useResponsive } from '../../utils/responsive';
import { colors } from '../../utils/responsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: any;
  maxWidth?: number;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  style,
  maxWidth = 1200,
}) => {
  const { isWeb, screenWidth } = useResponsive();

  const containerStyle = {
    maxWidth: isWeb ? Math.min(screenWidth, maxWidth) : '100%',
    alignSelf: 'center' as const,
    width: '100%',
  };

  return (
    <View style={[styles.container, containerStyle, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default ResponsiveContainer;
