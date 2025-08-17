import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Title,
  Paragraph,
} from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import { isMockMode } from '../../lib/supabase';
import Toast from '../common/Toast';
import LoadingSpinner from '../common/LoadingSpinner';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [nickname, setNickname] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' | 'warning' });
  const { signIn, signUp, loading, setUser } = useAuthStore();

  // Show toast message
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ visible: true, message, type });
  };

  // Hide toast message
  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  // Validate form inputs
  const validateForm = () => {
    if (!email.trim()) {
      showToast('Please enter your email', 'error');
      return false;
    }
    if (!password.trim()) {
      showToast('Please enter your password', 'error');
      return false;
    }
    if (!isLogin && !nickname.trim()) {
      showToast('Please enter your nickname', 'error');
      return false;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return false;
    }
    return true;
  };

  // Handle form submission for login/signup
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (isLogin) {
        await signIn(email, password);
        showToast('Successfully signed in!', 'success');
      } else {
        await signUp(email, password, nickname);
        showToast('Account created successfully!', 'success');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      const errorMessage = error?.message || 'Authentication failed. Please try again.';
      showToast(errorMessage, 'error');
    }
  };

  // Handle demo mode
  const handleDemoMode = () => {
    if (isMockMode) {
      // Import mock user data
      const mockUser = {
        id: 'mock-user-id',
        email: 'demo@nomadnow.com',
        nickname: 'Demo Nomad',
        avatar_url: 'https://via.placeholder.com/80x80/2196f3/ffffff?text=D',
        bio: 'Digital nomad exploring the world!',
        current_city: 'Bali, Indonesia',
        languages: ['English', 'Spanish'],
        interests: ['Coding', 'Travel', 'Coffee'],
        is_visible: true,
        is_available_for_meetup: true,
        location: { latitude: -8.3405, longitude: 115.0920 },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser(mockUser);
      showToast('Welcome to NomadNow Demo!', 'success');
    } else {
      showToast('Demo mode only available when Supabase is not configured', 'info');
    }
  };

  // Clear form when switching between login/signup
  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setNickname('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>
              {isLogin ? 'Welcome Back' : 'Join NomadNow'}
            </Title>
            <Paragraph style={styles.subtitle}>
              {isLogin
                ? 'Sign in to discover nearby digital nomads'
                : 'Create account to start your digital nomad journey'}
            </Paragraph>

            {/* Nickname field for signup only */}
            {!isLogin && (
              <TextInput
                label="Nickname"
                value={nickname}
                onChangeText={setNickname}
                style={styles.input}
                mode="outlined"
                autoCapitalize="none"
                placeholder="Enter your nickname"
              />
            )}

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Enter your email"
              autoComplete="email"
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              mode="outlined"
              secureTextEntry
              placeholder="Enter your password"
              autoComplete={isLogin ? "current-password" : "new-password"}
            />

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
              loading={loading}
              disabled={loading}
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>

            <Button
              mode="text"
              onPress={handleToggleMode}
              style={styles.toggleButton}
              disabled={loading}
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </Button>

            {/* Demo mode button */}
            <Button
              mode="outlined"
              onPress={handleDemoMode}
              style={styles.demoButton}
              disabled={loading}
            >
              {isMockMode ? 'Enter Demo Mode' : 'Demo Mode Unavailable'}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Toast for user feedback */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {/* Loading spinner */}
      <LoadingSpinner visible={loading} message="Authenticating..." />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 24,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 8,
  },
  toggleButton: {
    marginTop: 8,
  },
  demoButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
});

export default LoginScreen; 