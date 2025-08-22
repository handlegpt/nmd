import { useNavigation } from '@react-navigation/native';
import { navigationUtils } from '../utils/navigationUtils';
import { Platform } from 'react-native';

// Custom navigation hook that ensures URL sync
export const useNavigationWithUrlSync = () => {
  const navigation = useNavigation();

  const navigateWithUrlSync = (routeName: string, params?: any) => {
    // Navigate using React Navigation
    (navigation as any).navigate(routeName, params);
    
    // Update URL for web
    if (Platform.OS === 'web') {
      const path = navigationUtils.getPathForRoute(routeName, params);
      console.log(`🔄 NavigationWithUrlSync: Navigating to ${routeName} -> ${path}`);
      navigationUtils.updateUrl(path);
    }
  };

  const navigateToTab = (tabName: string) => {
    // For tab navigation, navigate to Main first, then to the specific tab
    (navigation as any).navigate('Main', { screen: tabName });
    
    // Update URL for web
    if (Platform.OS === 'web') {
      const path = navigationUtils.getPathForRoute(tabName);
      console.log(`🔄 NavigationWithUrlSync: Navigating to tab ${tabName} -> ${path}`);
      navigationUtils.updateUrl(path);
    }
  };

  const goBack = () => {
    navigation.goBack();
    
    // For web, we don't need to manually update URL as it will be handled by popstate
    if (Platform.OS === 'web') {
      console.log(`🔄 NavigationWithUrlSync: Going back`);
    }
  };

  const reset = (routeName: string, params?: any) => {
    (navigation as any).reset({
      index: 0,
      routes: [{ name: routeName, params }],
    });
    
    // Update URL for web
    if (Platform.OS === 'web') {
      const path = navigationUtils.getPathForRoute(routeName, params);
      console.log(`🔄 NavigationWithUrlSync: Resetting to ${routeName} -> ${path}`);
      navigationUtils.forceUrlSync(routeName, params);
    }
  };

  return {
    navigate: navigateWithUrlSync,
    navigateToTab,
    goBack,
    reset,
    navigation, // Original navigation object for other methods
  };
};
