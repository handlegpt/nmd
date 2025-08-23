import React, { useEffect, useRef } from 'react';
import { useResponsive } from '../../utils/responsive';
import { navigationUtils } from '../../utils/navigationUtils';

interface PageRefreshHandlerProps {
  children: React.ReactNode;
}

export const PageRefreshHandler: React.FC<PageRefreshHandlerProps> = ({ children }) => {
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

      // Use window.location to navigate instead of React Navigation
      // This will trigger the URL sync mechanism in useUrlSync
      setTimeout(() => {
        window.history.pushState({}, '', storedPath);
        // Trigger a popstate event to activate URL sync
        window.dispatchEvent(new PopStateEvent('popstate'));
        
        // Clear stored path
        sessionStorage.removeItem('nomadnow_last_path');
      }, 200);
    }
  }, [isWeb]);

  return <>{children}</>;
};

export default PageRefreshHandler;
