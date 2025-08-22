import { useEffect, useRef } from 'react';
import { useNavigationState } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useResponsive } from '../utils/responsive';

export const useUrlSync = () => {
  const navigationState = useNavigationState(state => state);
  const navigation = useNavigation();
  const { isWeb } = useResponsive();
  const isNavigatingRef = useRef(false);

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
      // Update URL based on current route
      const updateUrl = () => {
        const baseUrl = window.location.origin;
        let path = '/';
        
        switch (currentRoute.name) {
          case 'Feed':
            path = '/feed';
            break;
          case 'Map':
            path = '/discover';
            break;
          case 'Activities':
            path = '/meetups';
            break;
          case 'Cities':
            path = '/cities';
            break;
          case 'Profile':
            path = '/profile';
            break;
          case 'Login':
            path = '/login';
            break;
          case 'Settings':
            path = '/settings';
            break;
          case 'Chat':
            path = `/chat/${currentRoute.params?.userId || ''}`;
            break;
          default:
            path = '/';
        }

        // Update URL without page reload
        if (window.location.pathname !== path) {
          window.history.pushState({}, '', path);
        }
      };

      updateUrl();
    }
  }, [navigationState, isWeb]);

  // Handle browser back/forward buttons
  useEffect(() => {
    if (!isWeb) return;

    const handlePopState = (event: PopStateEvent) => {
      isNavigatingRef.current = true;
      
      const path = window.location.pathname;
      let routeName = 'Feed';
      let params = {};

      // Parse URL to determine route
      if (path === '/feed' || path === '/') {
        routeName = 'Feed';
      } else if (path === '/discover') {
        routeName = 'Map';
      } else if (path === '/meetups') {
        routeName = 'Activities';
      } else if (path === '/cities') {
        routeName = 'Cities';
      } else if (path === '/profile') {
        routeName = 'Profile';
      } else if (path === '/login') {
        routeName = 'Login';
      } else if (path === '/settings') {
        routeName = 'Settings';
      } else if (path.startsWith('/chat/')) {
        routeName = 'Chat';
        const userId = path.split('/chat/')[1];
        params = { userId };
      }

      // Navigate to the correct route
      if (routeName === 'Feed' || routeName === 'Map' || routeName === 'Activities' || routeName === 'Cities' || routeName === 'Profile') {
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
};
