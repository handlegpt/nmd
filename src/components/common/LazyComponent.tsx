import React, { Suspense, lazy } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { colors, spacing, borderRadius } from '../../utils/responsive';

interface LazyComponentProps {
  component: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  props?: any;
}

const LazyComponent: React.FC<LazyComponentProps> = ({ 
  component, 
  fallback,
  props = {} 
}) => {
  const LazyLoadedComponent = lazy(component);

  const defaultFallback = (
    <View style={styles.fallback}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <LazyLoadedComponent {...props} />
    </Suspense>
  );
};

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
});

export default LazyComponent;
