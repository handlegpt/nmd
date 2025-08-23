import { useEffect, useRef } from 'react';
import { useNavigationState } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useResponsive } from '../utils/responsive';
import { navigationUtils } from '../utils/navigationUtils';

export const useUrlSync = () => {
  const navigationState = useNavigationState(state => state);
  const navigation = useNavigation();
  const { isWeb } = useResponsive();
  const isNavigatingRef = useRef(false);
  const lastPathRef = useRef('');
  const hasInitializedRef = useRef(false);

  // Handle page refresh and initial load
  useEffect(() => {
    if (!isWeb || hasInitializedRef.current) return;

    hasInitializedRef.current = true;
    const currentPath = window.location.pathname;
    
    // URL sync initial load logged silently in production
    
    // If we're on a specific path (not root), we need to restore navigation state
    if (currentPath !== '/') {
      const { routeName, params } = navigationUtils.getRouteFromPath(currentPath);
      // URL sync restore logged silently in production
      
      // Use setTimeout to ensure navigation is ready
      setTimeout(() => {
        if (routeName === 'Feed' || routeName === 'Map' || routeName === 'Activities' || routeName === 'Cities' || routeName === 'Notifications' || routeName === 'Profile') {
          (navigation as any).navigate('Main', { screen: routeName });
        } else {
          (navigation as any).navigate(routeName, params);
        }
      }, 100);
    }
  }, [isWeb, navigation]);

  useEffect(() => {
    if (!isWeb || !navigationState) return;

    // Get current route
    const getCurrentRoute = (state: any): any => {
      const route = state.routes[state.index];
      if (route.state) {
        return getCurrentRoute(route.state);
      }
      return route;
    };

    const currentRoute = getCurrentRoute(navigationState);
    
    if (currentRoute && !isNavigatingRef.current) {
      // Validate navigation state
      if (!navigationUtils.validateNavigationState(navigationState)) {
        return;
      }

      // Debug navigation state
      navigationUtils.debugNavigationState(navigationState);

      // Update URL based on current route
      const path = navigationUtils.getPathForRoute(currentRoute.name, currentRoute.params);
      
      // Update URL without page reload
      if (window.location.pathname !== path) {
        // URL sync update logged silently in production
        navigationUtils.updateUrl(path);
        lastPathRef.current = path;
      }
    }
  }, [navigationState, isWeb]);

  // Handle browser back/forward buttons
  useEffect(() => {
    if (!isWeb) return;

    const handlePopState = (event: PopStateEvent) => {
      isNavigatingRef.current = true;
      
      const path = window.location.pathname;
      // Browser navigation logged silently in production

      // Parse URL to determine route using navigation utils
      const { routeName, params } = navigationUtils.getRouteFromPath(path);
      // Navigation logged silently in production

      // Navigate to the correct route
      if (routeName === 'Feed' || routeName === 'Map' || routeName === 'Activities' || routeName === 'Cities' || routeName === 'Notifications' || routeName === 'Profile') {
        // For tab navigation, we need to navigate to Main first, then to the specific tab
        (navigation as any).navigate('Main', { screen: routeName });
      } else {
        (navigation as any).navigate(routeName, params);
      }

      // Reset the flag after a short delay
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 100);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isWeb, navigation]);

  // Handle beforeunload to store current state
  useEffect(() => {
    if (!isWeb) return;

    const handleBeforeUnload = () => {
      const currentPath = window.location.pathname;
      if (currentPath !== '/') {
        sessionStorage.setItem('nomadnow_last_path', currentPath);
        // URL sync store logged silently in production
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isWeb]);
};
