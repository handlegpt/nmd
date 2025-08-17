import React, { useEffect, Suspense } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/authStore';
import { supabase, isMockMode } from './src/lib/supabase';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { PerformanceMonitor } from './src/components/common/MobileOptimizations';
import { useResponsive } from './src/utils/responsive';
import { colors, spacing } from './src/utils/responsive';
import './src/utils/cryptoPolyfill';

// Note: Lazy loading is commented out due to TypeScript module configuration
// const LazyAppNavigator = React.lazy(() => import('./src/navigation/AppNavigator'));

// Loading fallback component
const LoadingFallback = () => (
  <View style={{ 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: colors.background 
  }}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

export default function App() {
  const { setUser, setSession } = useAuthStore();
  const { isPhone } = useResponsive();

  useEffect(() => {
    // Only log in development
    if (__DEV__) {
      console.log('Environment check:');
      console.log('EXPO_PUBLIC_SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
      console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
      console.log('Running in mock mode:', isMockMode);
    }
    
    // Skip auth state change listener in mock mode
    if (isMockMode) {
      if (__DEV__) {
        console.log('Skipping auth state change listener in mock mode');
      }
      return;
    }
    
    // Listen for auth state changes (only in non-mock mode)
    if (!isMockMode && 'auth' in supabase) {
      const { data: { subscription } } = (supabase as any).auth.onAuthStateChange(
        async (event: any, session: any) => {
          if (__DEV__) {
            console.log('Auth state change:', event, session?.user?.id);
          }
          
          if (session?.user) {
            // Fetch user profile
            const { data: userData } = await (supabase as any)
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            setUser(userData);
            setSession(session);
          } else {
            setUser(null);
            setSession(null);
          }
        }
      );

      return () => subscription.unsubscribe();
    }
  }, [setUser, setSession]);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <PaperProvider>
            <PerformanceMonitor enableMonitoring={__DEV__}>
              <Suspense fallback={<LoadingFallback />}>
                <AppNavigator />
              </Suspense>
              <StatusBar style="auto" />
            </PerformanceMonitor>
          </PaperProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
} 