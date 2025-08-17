import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import {
  Surface,
  Text,
  IconButton,
} from 'react-native-paper';
import { shadowPresets } from '../../utils/platformStyles';

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
  const translateY = new Animated.Value(-100);
  const opacity = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      // Show toast
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return { backgroundColor: '#10b981', icon: 'check-circle' };
      case 'error':
        return { backgroundColor: '#ef4444', icon: 'alert-circle' };
      case 'warning':
        return { backgroundColor: '#f59e0b', icon: 'alert' };
      case 'info':
      default:
        return { backgroundColor: '#6366f1', icon: 'information' };
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
            iconColor="#ffffff"
            size={20}
            style={styles.icon}
          />
          <Text style={styles.message}>{message}</Text>
        </View>
        <IconButton
          icon="close"
          iconColor="#ffffff"
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  toast: {
    borderRadius: 12,
    padding: 16,
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
    marginRight: 8,
  },
  message: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    margin: 0,
    marginLeft: 8,
  },
});

export default Toast; 