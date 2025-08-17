import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/authStore';
import { supabase, isMockMode } from './src/lib/supabase';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { PerformanceMonitor } from './src/components/common/MobileOptimizations';
import { useResponsive } from './src/utils/responsive';
import './src/utils/cryptoPolyfill';

export default function App() {
  const { setUser, setSession } = useAuthStore();

  useEffect(() => {
    // Debug: Log environment variables
    console.log('Environment check:');
    console.log('EXPO_PUBLIC_SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
    console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
    console.log('Running in mock mode:', isMockMode);
    
    // Skip auth state change listener in mock mode
    if (isMockMode) {
      console.log('Skipping auth state change listener in mock mode');
      return;
    }
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        if (session?.user) {
          // Fetch user profile
          const { data: userData } = await supabase
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
  }, []);

  const { isPhone } = useResponsive();

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <PaperProvider>
            <PerformanceMonitor enableMonitoring={false}>
              <AppNavigator />
              <StatusBar style="auto" />
            </PerformanceMonitor>
          </PaperProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
} 