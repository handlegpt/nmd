import React from 'react';
import { View, StyleSheet, Modal, Text } from 'react-native';
import { ActivityIndicator, Surface } from 'react-native-paper';
import { shadowPresets } from '../../utils/platformStyles';
import { colors, spacing, borderRadius } from '../../utils/responsive';

interface LoadingSpinnerProps {
  visible: boolean;
  message?: string;
  size?: 'small' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  visible,
  message = 'Loading...',
  size = 'large',
}) => {
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <Surface style={styles.container}>
          <ActivityIndicator 
            size={size} 
            color={colors.primary}
            style={styles.spinner}
          />
          {message && (
            <Text style={styles.message}>{message}</Text>
          )}
        </Surface>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    ...shadowPresets.large,
  },
  spinner: {
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default LoadingSpinner; 