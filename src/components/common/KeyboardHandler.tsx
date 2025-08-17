import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  StyleProp,
  ViewStyle,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useResponsive } from '../../utils/responsive';

const { height: screenHeight } = Dimensions.get('window');

interface KeyboardHandlerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  behavior?: 'height' | 'position' | 'padding';
  keyboardVerticalOffset?: number;
  enableOnAndroid?: boolean;
  dismissOnTap?: boolean;
  onKeyboardShow?: (keyboardHeight: number) => void;
  onKeyboardHide?: () => void;
}

export const KeyboardHandler: React.FC<KeyboardHandlerProps> = ({
  children,
  style,
  behavior = Platform.OS === 'ios' ? 'padding' : 'height',
  keyboardVerticalOffset = 0,
  enableOnAndroid = true,
  dismissOnTap = true,
  onKeyboardShow,
  onKeyboardHide,
}) => {
  const { isPhone } = useResponsive();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const keyboardAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isPhone) return;

    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        const height = event.endCoordinates.height;
        setKeyboardHeight(height);
        setIsKeyboardVisible(true);
        onKeyboardShow?.(height);

        Animated.timing(keyboardAnimation, {
          toValue: height,
          duration: Platform.OS === 'ios' ? event.duration : 250,
          useNativeDriver: false,
        }).start();
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (event) => {
        setIsKeyboardVisible(false);
        onKeyboardHide?.();

        Animated.timing(keyboardAnimation, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? event.duration : 250,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShowListener?.remove();
      keyboardWillHideListener?.remove();
    };
  }, [isPhone, onKeyboardShow, onKeyboardHide, keyboardAnimation]);

  const dismissKeyboard = () => {
    if (dismissOnTap) {
      Keyboard.dismiss();
    }
  };

  if (!isPhone) {
    return <View style={[styles.container, style]}>{children}</View>;
  }

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        style={[styles.container, style]}
        behavior={behavior}
        keyboardVerticalOffset={keyboardVerticalOffset}
        enabled={Platform.OS === 'ios' || enableOnAndroid}
      >
        <Animated.View
          style={[
            styles.content,
            {
              paddingBottom: keyboardAnimation,
            },
          ]}
        >
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

// Keyboard aware scroll view
interface KeyboardAwareScrollViewProps {
  children: React.ReactNode;
  style?: any;
  contentContainerStyle?: any;
  keyboardShouldPersistTaps?: 'handled' | 'always' | 'never';
  showsVerticalScrollIndicator?: boolean;
  onScroll?: (event: any) => void;
  scrollEnabled?: boolean;
}

export const KeyboardAwareScrollView: React.FC<KeyboardAwareScrollViewProps> = ({
  children,
  style,
  contentContainerStyle,
  keyboardShouldPersistTaps = 'handled',
  showsVerticalScrollIndicator = false,
  onScroll,
  scrollEnabled = true,
}) => {
  const { isPhone } = useResponsive();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!isPhone) return;

    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener?.remove();
      keyboardWillHideListener?.remove();
    };
  }, [isPhone]);

  if (!isPhone) {
    return (
      <View style={[styles.scrollContainer, style]}>
        {children}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.scrollContainer,
        {
          paddingBottom: keyboardHeight,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

// Keyboard aware input
interface KeyboardAwareInputProps {
  children: React.ReactNode;
  style?: any;
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
}

export const KeyboardAwareInput: React.FC<KeyboardAwareInputProps> = ({
  children,
  style,
  onFocus,
  onBlur,
  autoFocus = false,
  returnKeyType = 'done',
  onSubmitEditing,
  blurOnSubmit = true,
}) => {
  const { isPhone } = useResponsive();

  const handleFocus = () => {
    onFocus?.();
  };

  const handleBlur = () => {
    onBlur?.();
  };

  if (!isPhone) {
    return <View style={[styles.inputContainer, style]}>{children}</View>;
  }

  return (
    <View style={[styles.inputContainer, style]}>
      {React.cloneElement(children as React.ReactElement, {
        onFocus: handleFocus,
        onBlur: handleBlur,
        autoFocus,
        returnKeyType,
        onSubmitEditing,
        blurOnSubmit,
      })}
    </View>
  );
};

// Keyboard dismiss on tap
interface KeyboardDismissViewProps {
  children: React.ReactNode;
  style?: any;
  enabled?: boolean;
}

export const KeyboardDismissView: React.FC<KeyboardDismissViewProps> = ({
  children,
  style,
  enabled = true,
}) => {
  const { isPhone } = useResponsive();

  const handlePress = () => {
    if (enabled && isPhone) {
      Keyboard.dismiss();
    }
  };

  if (!isPhone) {
    return <View style={[styles.container, style]}>{children}</View>;
  }

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={[styles.container, style]}>{children}</View>
    </TouchableWithoutFeedback>
  );
};

// Keyboard height hook
export const useKeyboardHeight = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const { isPhone } = useResponsive();

  useEffect(() => {
    if (!isPhone) return;

    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
        setIsKeyboardVisible(true);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardWillShowListener?.remove();
      keyboardWillHideListener?.remove();
    };
  }, [isPhone]);

  return {
    keyboardHeight,
    isKeyboardVisible,
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  inputContainer: {
    width: '100%',
  },
});
