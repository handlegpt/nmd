import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text, ScrollView } from 'react-native';
import { Surface, IconButton } from 'react-native-paper';
import { shadowPresets } from '../../utils/platformStyles';
import { colors, spacing, borderRadius } from '../../utils/responsive';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onHide: () => void;
}

const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onHide,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show toast animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      onHide();
    });
  };

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return { backgroundColor: colors.success, icon: 'check-circle' };
      case 'error':
        return { backgroundColor: colors.error, icon: 'alert-circle' };
      case 'warning':
        return { backgroundColor: colors.warning, icon: 'alert' };
      case 'info':
      default:
        return { backgroundColor: colors.primary, icon: 'information' };
    }
  };

  const toastStyle = getToastStyle();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Surface style={[styles.toast, { backgroundColor: toastStyle.backgroundColor }]}>
        <View style={styles.content}>
          <IconButton
            icon={toastStyle.icon}
            iconColor={colors.white}
            size={20}
            style={styles.icon}
          />
          <ScrollView 
            style={styles.messageContainer}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            <Text style={styles.message}>{message}</Text>
          </ScrollView>
        </View>
        <IconButton
          icon="close"
          iconColor={colors.white}
          size={20}
          onPress={hideToast}
          style={styles.closeButton}
        />
      </Surface>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
  },
  toast: {
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadowPresets.medium,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    margin: 0,
    marginRight: spacing.sm,
  },
  messageContainer: {
    flex: 1,
    maxHeight: 200,
  },
  message: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  closeButton: {
    margin: 0,
    marginLeft: spacing.sm,
  },
});

export default Toast; 