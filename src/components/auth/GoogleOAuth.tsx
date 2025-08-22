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

  // Google OAuth configuration
  const googleConfig = {
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
    redirectUri: process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI || 
                 process.env.EXPO_PUBLIC_GOOGLE_DEV_REDIRECT_URI || 
                 'http://localhost:19006/auth/callback',
    scopes: ['openid', 'profile', 'email'],
    responseType: AuthSession.ResponseType.Code,
    additionalParameters: {
      access_type: 'offline',
      prompt: 'consent',
    },
  };

  // Create auth request
  const [request, response, promptAsync] = AuthSession.useAuthRequest(googleConfig);

  // Handle OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      handleAuthSuccess(response.params.code);
    } else if (response?.type === 'error') {
      handleAuthError(response.error?.message || 'Authentication failed');
    }
  }, [response]);

  // Handle successful authentication
  const handleAuthSuccess = async (code: string) => {
    try {
      setIsLoading(true);
      
      // Exchange code for tokens
      const tokenResponse = await exchangeCodeForTokens(code);
      
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
    if (!googleConfig.clientId) {
      Alert.alert(
        'Configuration Error', 
        'Google OAuth is not configured. Please set up your Google Client ID.'
      );
      return;
    }

    try {
      setIsLoading(true);
      await promptAsync();
    } catch (error) {
      console.error('Failed to start OAuth flow:', error);
      handleAuthError('Failed to start authentication');
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Button
        mode="contained"
        onPress={handleLogin}
        disabled={isLoading || !request}
        loading={isLoading}
        icon="google"
        style={styles.googleButton}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
      >
        {isLoading ? 'Connecting to Google...' : 'Continue with Gmail'}
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
});

export default GoogleOAuth;
