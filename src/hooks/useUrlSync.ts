import { useEffect } from 'react';
import { useNavigationState } from '@react-navigation/native';
import { useResponsive } from '../utils/responsive';

export const useUrlSync = () => {
  const navigationState = useNavigationState(state => state);
  const { isWeb } = useResponsive();

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
    
    if (currentRoute) {
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
};
