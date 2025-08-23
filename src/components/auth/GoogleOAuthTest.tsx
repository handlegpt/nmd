import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { colors, spacing, borderRadius } from '../../utils/responsive';
import { shadowPresets } from '../../utils/platformStyles';

interface GoogleOAuthTestProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  style?: any;
}

const GoogleOAuthTest: React.FC<GoogleOAuthTestProps> = ({ 
  onSuccess, 
  onError, 
  style 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Test configuration
  const testConfig = {
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
    redirectUri: process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI || 
                 (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
                   ? 'http://localhost:19006/auth/callback'
                   : 'https://nomad.now/auth/callback'),
  };

  // Debug info
  console.log('🔍 Test Config:', {
    clientId: testConfig.clientId ? 'Set' : 'Missing',
    redirectUri: testConfig.redirectUri,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
    protocol: typeof window !== 'undefined' ? window.location.protocol : 'unknown',
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
  });

  // Simple test function
  const handleTestClick = () => {
    console.log('🔍 Test button clicked');
    setIsLoading(true);
    
    // Simulate a delay
    setTimeout(() => {
      setIsLoading(false);
      
      if (!testConfig.clientId) {
        Alert.alert(
          'Configuration Error',
          'Google OAuth Client ID is missing!\n\nPlease configure:\nEXPO_PUBLIC_GOOGLE_CLIENT_ID\nEXPO_PUBLIC_GOOGLE_CLIENT_SECRET',
          [{ text: 'OK' }]
        );
        onError?.('Client ID missing');
        return;
      }

      // Test if we can create a Google OAuth URL
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(testConfig.clientId)}&` +
        `redirect_uri=${encodeURIComponent(testConfig.redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent('openid profile email')}&` +
        `access_type=offline&` +
        `prompt=consent`;

      console.log('🔍 Generated Auth URL:', authUrl);
      
      Alert.alert(
        'Test Success',
        `Configuration looks good!\n\nClient ID: ${testConfig.clientId ? 'Set' : 'Missing'}\nRedirect URI: ${testConfig.redirectUri}\n\nAuth URL generated successfully.`,
        [{ text: 'OK' }]
      );
      
      onSuccess?.({ message: 'Test successful' });
    }, 1000);
  };

  return (
    <View style={[styles.container, style]}>
      <Button
        mode="contained"
        onPress={handleTestClick}
        disabled={isLoading}
        loading={isLoading}
        icon="google"
        style={styles.googleButton}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
      >
        {isLoading ? 'Testing...' : 'Test Google OAuth Config'}
      </Button>
      
      <Button
        mode="text"
        onPress={() => {
          Alert.alert(
            'Debug Info',
            `Client ID: ${testConfig.clientId ? 'Set' : 'Missing'}\nRedirect URI: ${testConfig.redirectUri}\nHostname: ${typeof window !== 'undefined' ? window.location.hostname : 'unknown'}\nProtocol: ${typeof window !== 'undefined' ? window.location.protocol : 'unknown'}`,
            [{ text: 'OK' }]
          );
        }}
        style={styles.debugButton}
      >
        Show Debug Info
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

export default GoogleOAuthTest;
