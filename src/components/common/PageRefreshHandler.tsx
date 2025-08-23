import React, { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useResponsive } from '../../utils/responsive';
import { navigationUtils } from '../../utils/navigationUtils';

interface PageRefreshHandlerProps {
  children: React.ReactNode;
}

export const PageRefreshHandler: React.FC<PageRefreshHandlerProps> = ({ children }) => {
  const navigation = useNavigation();
  const { isWeb } = useResponsive();
  const hasHandledRefreshRef = useRef(false);

  useEffect(() => {
    if (!isWeb || hasHandledRefreshRef.current) return;

    hasHandledRefreshRef.current = true;

    // Check if this is a page refresh by looking for stored path
    const storedPath = sessionStorage.getItem('nomadnow_last_path');
    const currentPath = window.location.pathname;

    console.log(`🔄 PageRefreshHandler: Stored path: ${storedPath}, Current path: ${currentPath}`);

    // If we have a stored path and it's different from current, restore it
    if (storedPath && storedPath !== currentPath) {
      const { routeName, params } = navigationUtils.getRouteFromPath(storedPath);
      console.log(`🔄 PageRefreshHandler: Restoring to ${routeName}`);

      // Navigate to the stored route
      setTimeout(() => {
        if (routeName === 'Feed' || routeName === 'Map' || routeName === 'Activities' || routeName === 'Cities' || routeName === 'Notifications' || routeName === 'Profile') {
          (navigation as any).navigate('Main', { screen: routeName });
        } else {
          (navigation as any).navigate(routeName, params);
        }

        // Update URL to match
        navigationUtils.updateUrl(storedPath);

        // Clear stored path
        sessionStorage.removeItem('nomadnow_last_path');
      }, 200);
    }
  }, [isWeb, navigation]);

  return <>{children}</>;
};

export default PageRefreshHandler;
