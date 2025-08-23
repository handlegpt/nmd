import { Platform } from 'react-native';

// Navigation utility functions for better URL sync
export const navigationUtils = {
  // Get the correct path for a route
  getPathForRoute: (routeName: string, params?: any): string => {
    switch (routeName) {
      case 'Feed':
        return '/feed';
      case 'Map':
        return '/discover';
      case 'Activities':
        return '/meetups';
      case 'Cities':
        return '/cities';
      case 'Notifications':
        return '/notifications';
      case 'Profile':
        return '/profile';
      case 'Login':
        return '/login';
      case 'Settings':
        return '/settings';
      case 'Chat':
        return `/chat/${params?.userId || ''}`;
      default:
        return '/';
    }
  },

  // Get route name from path
  getRouteFromPath: (path: string): { routeName: string; params: any } => {
    if (path === '/feed' || path === '/') {
      return { routeName: 'Feed', params: {} };
    } else if (path === '/discover') {
      return { routeName: 'Map', params: {} };
    } else if (path === '/meetups') {
      return { routeName: 'Activities', params: {} };
    } else if (path === '/cities') {
      return { routeName: 'Cities', params: {} };
    } else if (path === '/notifications') {
      return { routeName: 'Notifications', params: {} };
    } else if (path === '/profile') {
      return { routeName: 'Profile', params: {} };
    } else if (path === '/login') {
      return { routeName: 'Login', params: {} };
    } else if (path === '/settings') {
      return { routeName: 'Settings', params: {} };
    } else if (path.startsWith('/chat/')) {
      const userId = path.split('/chat/')[1];
      return { routeName: 'Chat', params: { userId } };
    }
    
    return { routeName: 'Feed', params: {} };
  },

  // Update URL safely
  updateUrl: (path: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (window.location.pathname !== path) {
        // Navigation utils URL update logged silently in production
        window.history.pushState({}, '', path);
      }
    }
  },

  // Check if current path matches expected path
  isPathCorrect: (expectedRoute: string, params?: any): boolean => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return true;
    }

    const expectedPath = navigationUtils.getPathForRoute(expectedRoute, params);
    const currentPath = window.location.pathname;
    
    return currentPath === expectedPath;
  },

  // Force URL sync for a specific route
  forceUrlSync: (routeName: string, params?: any) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const path = navigationUtils.getPathForRoute(routeName, params);
      // Navigation utils force sync logged silently in production
      window.history.replaceState({}, '', path);
    }
  },

  // Get current route info
  getCurrentRouteInfo: () => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return { routeName: 'Feed', params: {}, path: '/' };
    }

    const path = window.location.pathname;
    const { routeName, params } = navigationUtils.getRouteFromPath(path);
    
    return { routeName, params, path };
  },

  // Validate navigation state
  validateNavigationState: (state: any): boolean => {
    if (!state || !state.routes || !Array.isArray(state.routes)) {
      console.warn('⚠️ NavigationUtils: Invalid navigation state');
      return false;
    }
    return true;
  },

  // Debug navigation state
  debugNavigationState: (state: any) => {
    if (Platform.OS === 'web') {
      // Navigation utils state logged silently in production
      const debugInfo = {
        routes: state?.routes?.map((route: any) => route.name),
        index: state?.index,
        currentRoute: state?.routes?.[state?.index]?.name,
        path: window.location.pathname
      };
      // Debug info available but not logged in production
    }
  }
};
