import React from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Haptic feedback types
export type HapticType = 
  | 'light' 
  | 'medium' 
  | 'heavy' 
  | 'soft' 
  | 'rigid' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'selection';

// Haptic feedback utility class
export class HapticFeedback {
  static async trigger(type: HapticType) {
    if (Platform.OS === 'web') return;

    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'soft':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
          break;
        case 'rigid':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'selection':
          await Haptics.selectionAsync();
          break;
        default:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  // Common haptic patterns
  static async buttonPress() {
    await this.trigger('light');
  }

  static async cardSwipe() {
    await this.trigger('medium');
  }

  static async success() {
    await this.trigger('success');
  }

  static async error() {
    await this.trigger('error');
  }

  static async warning() {
    await this.trigger('warning');
  }

  static async selection() {
    await this.trigger('selection');
  }

  static async longPress() {
    await this.trigger('heavy');
  }

  static async refresh() {
    await this.trigger('soft');
  }
}

// Hook for easy haptic feedback usage
export const useHapticFeedback = () => {
  return {
    trigger: HapticFeedback.trigger,
    buttonPress: HapticFeedback.buttonPress,
    cardSwipe: HapticFeedback.cardSwipe,
    success: HapticFeedback.success,
    error: HapticFeedback.error,
    warning: HapticFeedback.warning,
    selection: HapticFeedback.selection,
    longPress: HapticFeedback.longPress,
    refresh: HapticFeedback.refresh,
  };
};

// Haptic feedback wrapper component
interface HapticWrapperProps {
  children: React.ReactNode;
  onPress?: () => void;
  hapticType?: HapticType;
  disabled?: boolean;
}

export const HapticWrapper: React.FC<HapticWrapperProps> = ({
  children,
  onPress,
  hapticType = 'light',
  disabled = false,
}) => {
  const handlePress = async () => {
    if (!disabled) {
      await HapticFeedback.trigger(hapticType);
      onPress?.();
    }
  };

  return (
    <div onClick={handlePress} style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
      {children}
    </div>
  );
};
