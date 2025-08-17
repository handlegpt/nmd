import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  PanGestureHandler,
  TapGestureHandler,
  LongPressGestureHandler,
  State,
  Animated,
} from 'react-native';
import { useResponsive } from '../../utils/responsive';
import { shadowPresets } from '../../utils/platformStyles';

interface GestureProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  swipeThreshold?: number;
  longPressDelay?: number;
  enabled?: boolean;
}

export const MobileGestures: React.FC<GestureProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onTap,
  onDoubleTap,
  onLongPress,
  swipeThreshold = 50,
  longPressDelay = 500,
  enabled = true,
}) => {
  const { isPhone } = useResponsive();
  const [lastTap, setLastTap] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  // Only enable gestures on mobile devices
  if (!isPhone || !enabled) {
    return <View style={styles.container}>{children}</View>;
  }

  const handlePanGesture = (event: any) => {
    const { translationX, translationY, state } = event.nativeEvent;

    if (state === State.ACTIVE) {
      translateX.setValue(translationX);
      translateY.setValue(translationY);
    } else if (state === State.END) {
      // Check swipe direction
      if (Math.abs(translationX) > Math.abs(translationY)) {
        if (translationX > swipeThreshold && onSwipeRight) {
          onSwipeRight();
        } else if (translationX < -swipeThreshold && onSwipeLeft) {
          onSwipeLeft();
        }
      } else {
        if (translationY > swipeThreshold && onSwipeDown) {
          onSwipeDown();
        } else if (translationY < -swipeThreshold && onSwipeUp) {
          onSwipeUp();
        }
      }

      // Reset position
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleTapGesture = (event: any) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (lastTap && now - lastTap < DOUBLE_TAP_DELAY) {
      // Double tap
      if (onDoubleTap) {
        onDoubleTap();
      }
      setLastTap(0);
    } else {
      // Single tap
      setLastTap(now);
      if (onTap) {
        onTap();
      }
    }
  };

  const handleLongPressGesture = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      // Scale down effect
      Animated.spring(scale, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    } else if (event.nativeEvent.state === State.END) {
      // Scale back up
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
      
      if (onLongPress) {
        onLongPress();
      }
    }
  };

  return (
    <View style={styles.container}>
      <PanGestureHandler onGestureEvent={handlePanGesture}>
        <Animated.View
          style={[
            styles.gestureContainer,
            {
              transform: [
                { translateX },
                { translateY },
                { scale },
              ],
            },
          ]}
        >
          <TapGestureHandler onHandlerStateChange={handleTapGesture}>
            <Animated.View style={styles.tapContainer}>
              <LongPressGestureHandler
                onHandlerStateChange={handleLongPressGesture}
                minDurationMs={longPressDelay}
              >
                <Animated.View style={styles.longPressContainer}>
                  {children}
                </Animated.View>
              </LongPressGestureHandler>
            </Animated.View>
          </TapGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

// Swipeable card component
interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  swipeThreshold?: number;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  swipeThreshold = 100,
}) => {
  const { isPhone } = useResponsive();
  const translateX = useRef(new Animated.Value(0)).current;
  const [swiped, setSwiped] = useState(false);

  if (!isPhone) {
    return <View style={styles.cardContainer}>{children}</View>;
  }

  const handlePanGesture = (event: any) => {
    const { translationX, state } = event.nativeEvent;

    if (state === State.ACTIVE) {
      translateX.setValue(translationX);
    } else if (state === State.END) {
      if (translationX > swipeThreshold && onSwipeRight) {
        // Swipe right
        Animated.timing(translateX, {
          toValue: 300,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onSwipeRight();
          setSwiped(true);
        });
      } else if (translationX < -swipeThreshold && onSwipeLeft) {
        // Swipe left
        Animated.timing(translateX, {
          toValue: -300,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onSwipeLeft();
          setSwiped(true);
        });
      } else {
        // Reset position
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  if (swiped) {
    return null;
  }

  return (
    <View style={styles.cardContainer}>
      {/* Action indicators */}
      {leftAction && (
        <View style={[styles.actionIndicator, styles.leftAction]}>
          {leftAction}
        </View>
      )}
      {rightAction && (
        <View style={[styles.actionIndicator, styles.rightAction]}>
          {rightAction}
        </View>
      )}

      <PanGestureHandler onGestureEvent={handlePanGesture}>
        <Animated.View
          style={[
            styles.swipeableCard,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          {children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

// Pull to refresh component
interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => void;
  refreshing: boolean;
  threshold?: number;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  refreshing,
  threshold = 100,
}) => {
  const { isPhone } = useResponsive();
  const translateY = useRef(new Animated.Value(0)).current;
  const [canRefresh, setCanRefresh] = useState(false);

  if (!isPhone) {
    return <View style={styles.container}>{children}</View>;
  }

  const handlePanGesture = (event: any) => {
    const { translationY: ty, state } = event.nativeEvent;

    if (state === State.ACTIVE && ty > 0) {
      translateY.setValue(ty);
      setCanRefresh(ty > threshold);
    } else if (state === State.END) {
      if (canRefresh && !refreshing) {
        onRefresh();
      }
      
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
      setCanRefresh(false);
    }
  };

  return (
    <View style={styles.container}>
      <PanGestureHandler onGestureEvent={handlePanGesture}>
        <Animated.View
          style={[
            styles.pullToRefreshContainer,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          {children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gestureContainer: {
    flex: 1,
  },
  tapContainer: {
    flex: 1,
  },
  longPressContainer: {
    flex: 1,
  },
  cardContainer: {
    position: 'relative',
  },
  swipeableCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    ...shadowPresets.small,
  },
  actionIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    zIndex: 1,
  },
  leftAction: {
    left: 0,
  },
  rightAction: {
    right: 0,
  },
  pullToRefreshContainer: {
    flex: 1,
  },
});
