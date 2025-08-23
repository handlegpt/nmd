import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, borderRadius } from '../../utils/responsive';
import { shadowPresets } from '../../utils/platformStyles';

interface GoogleOAuthSimpleProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  style?: any;
}

const GoogleOAuthSimple: React.FC<GoogleOAuthSimpleProps> = ({ 
  onSuccess, 
  onError, 
  style 
}) => {
  const { setUser, setSession } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  // Mock Google OAuth for testing
  const handleMockGoogleLogin = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create mock user data
      const mockUser = {
        id: 'google-user-123',
        email: 'test@gmail.com',
        nickname: 'Test User',
        avatar_url: 'https://via.placeholder.com/150',
        bio: 'Digital nomad from the world!',
        current_city: 'San Francisco',
        languages: ['English', 'Chinese'],
        interests: ['Travel', 'Technology', 'Coffee'],
        is_visible: true,
        is_available_for_meetup: true,
        location: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Update auth store
      setUser(mockUser);
      setSession({ user: mockUser });
      
      // Call success callback
      onSuccess?.(mockUser);
      
      Alert.alert('Success', 'Mock Google login successful!');
      
    } catch (error) {
      console.error('Mock Google OAuth error:', error);
      onError?.('Mock authentication failed');
      Alert.alert('Error', 'Mock authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Button
        mode="contained"
        onPress={handleMockGoogleLogin}
        disabled={isLoading}
        loading={isLoading}
        icon="google"
        style={styles.googleButton}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
      >
        {isLoading ? 'Connecting...' : 'Continue with Gmail (Mock)'}
      </Button>
      
      <Button
        mode="text"
        onPress={() => {
          Alert.alert(
            'Debug Info',
            'This is a mock Google OAuth for testing.\n\nReal OAuth requires:\n- Google Cloud Console setup\n- Client ID and Secret\n- Redirect URI configuration',
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

export default GoogleOAuthSimple;
