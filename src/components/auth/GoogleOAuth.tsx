import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, borderRadius } from '../../utils/responsive';
import { shadowPresets } from '../../utils/platformStyles';

// Complete the auth session for web
WebBrowser.maybeCompleteAuthSession();

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
}

interface GoogleOAuthProps {
  onSuccess?: (user: GoogleUser) => void;
  onError?: (error: string) => void;
  style?: any;
}

const GoogleOAuth: React.FC<GoogleOAuthProps> = ({ 
  onSuccess, 
  onError, 
  style 
}) => {
  const { setUser, setSession } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestReady, setIsRequestReady] = useState(false);

  // Google OAuth configuration
  const googleConfig = {
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
    redirectUri: process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI || 
                 (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
                   ? 'http://localhost:19006/auth/callback'
                   : 'https://nomad.now/auth/callback'),
    scopes: ['openid', 'profile', 'email'],
    responseType: AuthSession.ResponseType.Code,
    additionalParameters: {
      access_type: 'offline',
      prompt: 'consent',
    },
  };

  // Debug configuration
  console.log('🔍 Google OAuth Config:', {
    clientId: googleConfig.clientId ? 'Set' : 'Missing',
    redirectUri: googleConfig.redirectUri,
    scopes: googleConfig.scopes,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
    protocol: typeof window !== 'undefined' ? window.location.protocol : 'unknown',
  });

  // Create auth request
  const [request, response, promptAsync] = AuthSession.useAuthRequest(googleConfig);

  // Check if request is ready
  useEffect(() => {
    if (request) {
      setIsRequestReady(true);
      console.log('🔍 OAuth request ready');
    } else {
      setIsRequestReady(false);
      console.log('🔍 OAuth request not ready');
    }
  }, [request]);

  // Add timeout for request initialization
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isRequestReady && googleConfig.clientId) {
        console.log('🔍 OAuth request timeout - forcing ready state');
        setIsRequestReady(true);
      }
    }, 3000); // 3 second timeout

    return () => clearTimeout(timeout);
  }, [isRequestReady, googleConfig.clientId]);

  // Handle OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      if (__DEV__) {
        console.log('🔍 OAuth success response');
      }
      handleAuthSuccess(response.params.code);
    } else if (response?.type === 'error') {
      if (__DEV__) {
        console.log('🔍 OAuth error response:', response.error);
      }
      handleAuthError(response.error?.message || 'Authentication failed');
    }
  }, [response]);

  // Handle successful authentication
  const handleAuthSuccess = async (code: string) => {
    try {
      setIsLoading(true);
      
      if (__DEV__) {
        console.log('🔍 Exchanging code for tokens...');
      }
      
      // Exchange code for tokens
      const tokenResponse = await exchangeCodeForTokens(code);
      
      if (__DEV__) {
        console.log('🔍 Fetching user info...');
      }
      
      // Get user info
      const userInfo = await fetchGoogleUserInfo(tokenResponse.access_token);
      
      // Store tokens securely
      await SecureStore.setItemAsync('google_access_token', tokenResponse.access_token);
      if (tokenResponse.refresh_token) {
        await SecureStore.setItemAsync('google_refresh_token', tokenResponse.refresh_token);
      }
      
      // Transform user data
      const nomadUser = {
        id: userInfo.id,
        email: userInfo.email,
        nickname: userInfo.name,
        avatar_url: userInfo.picture,
        bio: `Digital nomad from ${userInfo.family_name || 'the world'}!`,
        current_city: '',
        languages: ['English'],
        interests: ['Travel', 'Technology'],
        is_visible: true,
        is_available_for_meetup: true,
        location: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Update auth store
      setUser(nomadUser);
      setSession({ user: nomadUser });
      
      // Call success callback
      onSuccess?.(userInfo);
      
    } catch (error) {
      console.error('Google OAuth error:', error);
      handleAuthError('Failed to complete authentication');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle authentication error
  const handleAuthError = (error: string) => {
    console.error('Google OAuth error:', error);
    setIsLoading(false);
    onError?.(error);
    Alert.alert('Authentication Error', error);
  };

  // Exchange authorization code for tokens
  const exchangeCodeForTokens = async (code: string) => {
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const params = new URLSearchParams({
      code,
      client_id: googleConfig.clientId,
      client_secret: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET || '',
      redirect_uri: googleConfig.redirectUri,
      grant_type: 'authorization_code',
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token exchange error:', errorText);
      throw new Error('Failed to exchange code for tokens');
    }

    return await response.json();
  };

  // Fetch user information from Google
  const fetchGoogleUserInfo = async (accessToken: string): Promise<GoogleUser> => {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    return await response.json();
  };

  // Handle login button press
  const handleLogin = async () => {
    console.log('🔍 Google OAuth button clicked');
    console.log('🔍 Client ID:', googleConfig.clientId ? 'Set' : 'Missing');
    console.log('🔍 Redirect URI:', googleConfig.redirectUri);
    
    if (!googleConfig.clientId) {
      const errorMsg = 'Google OAuth not configured. Please check server environment variables.';
      console.error('🔍', errorMsg);
      Alert.alert(
        'Configuration Error',
        errorMsg + '\n\nRequired:\nEXPO_PUBLIC_GOOGLE_CLIENT_ID\nEXPO_PUBLIC_GOOGLE_CLIENT_SECRET',
        [{ text: 'OK', style: 'default' }]
      );
      onError?.(errorMsg);
      return;
    }

    // Check if request is ready
    if (!request || !isRequestReady) {
      console.log('🔍 OAuth request not ready, retrying...');
      Alert.alert(
        'OAuth Not Ready',
        'Please wait a moment and try again.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔍 Starting Google OAuth flow...');
      
      const result = await promptAsync();
      console.log('🔍 OAuth result:', result.type);
      
      if (result.type === 'error') {
        console.error('🔍 OAuth error:', result.error);
        handleAuthError(`OAuth error: ${result.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('🔍 Failed to start OAuth flow:', error);
      handleAuthError('Failed to start authentication');
    } finally {
      setIsLoading(false);
    }
  };

  // Get button text based on state
  const getButtonText = () => {
    if (isLoading) {
      return 'Connecting to Google...';
    }
    if (!googleConfig.clientId) {
      return 'Google OAuth Not Configured';
    }
    if (!isRequestReady) {
      return 'Initializing...';
    }
    return 'Continue with Gmail';
  };

  // Check if button should be disabled
  const isButtonDisabled = () => {
    const disabled = isLoading || !googleConfig.clientId || !isRequestReady;
    console.log('🔍 Button disabled:', {
      isLoading,
      hasClientId: !!googleConfig.clientId,
      isRequestReady,
      disabled
    });
    return disabled;
  };

  return (
    <View style={[styles.container, style]}>
      <Button
        mode="contained"
        onPress={handleLogin}
        disabled={isButtonDisabled()}
        loading={isLoading}
        icon="google"
        style={styles.googleButton}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
      >
        {getButtonText()}
      </Button>
      
      <Button
        mode="text"
        onPress={() => {
          Alert.alert(
            'Debug Info',
            `Client ID: ${googleConfig.clientId ? 'Set' : 'Missing'}\nRedirect URI: ${googleConfig.redirectUri}\nHostname: ${typeof window !== 'undefined' ? window.location.hostname : 'unknown'}\nRequest Ready: ${isRequestReady}\nLoading: ${isLoading}`,
            [{ text: 'OK' }]
          );
        }}
        style={styles.debugButton}
      >
        Debug Info
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  googleButton: {
    backgroundColor: '#4285f4',
    borderRadius: borderRadius.lg,
    marginVertical: spacing.sm,
    ...shadowPresets.small,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  debugButton: {
    marginTop: spacing.xs,
  },
});

export default GoogleOAuth;
