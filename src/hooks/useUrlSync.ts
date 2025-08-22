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
        console.log(`🔄 URL Sync: Updating URL from ${window.location.pathname} to ${path}`);
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
      console.log(`🔄 Browser Navigation: ${path}`);

      // Parse URL to determine route using navigation utils
      const { routeName, params } = navigationUtils.getRouteFromPath(path);
      console.log(`🔄 Navigating to: ${routeName}`, params);

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

  // Initialize URL on first load
  useEffect(() => {
    if (!isWeb) return;

    const currentPath = window.location.pathname;
    if (currentPath !== '/' && currentPath !== lastPathRef.current) {
      console.log(`🔄 Initial URL Sync: ${currentPath}`);
      lastPathRef.current = currentPath;
    }
  }, [isWeb]);
};
