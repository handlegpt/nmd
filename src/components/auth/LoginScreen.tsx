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
  Chip,
  Divider,
} from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import Toast from '../common/Toast';
import LoadingSpinner from '../common/LoadingSpinner';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [nickname, setNickname] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
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

  // Validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate form inputs
  const validateForm = () => {
    if (!email.trim()) {
      showToast('Please enter your email', 'error');
      return false;
    }
    if (!validateEmail(email)) {
      showToast('Please enter a valid email address', 'error');
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
        // For signup, show verification step
        setShowVerification(true);
        showToast('Verification code sent to your email!', 'success');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      const errorMessage = error?.message || 'Authentication failed. Please try again.';
      showToast(errorMessage, 'error');
    }
  };

  // Handle verification code submission
  const handleVerification = async () => {
    if (!verificationCode.trim()) {
      showToast('Please enter the verification code', 'error');
      return;
    }

    try {
      // Mock verification - in real app, this would verify with backend
      if (verificationCode === '123456') { // Mock code
        await signUp(email, password, nickname);
        showToast('Account created successfully!', 'success');
        setShowVerification(false);
        setVerificationCode('');
      } else {
        showToast('Invalid verification code. Please try again.', 'error');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      showToast('Verification failed. Please try again.', 'error');
    }
  };

  // Handle resend verification code
  const handleResendCode = () => {
    showToast('Verification code resent to your email!', 'success');
  };

  // Clear form when switching between login/signup
  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setNickname('');
    setShowVerification(false);
    setVerificationCode('');
  };

  // Handle back to signup form
  const handleBackToSignup = () => {
    setShowVerification(false);
    setVerificationCode('');
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
              {showVerification ? 'Verify Your Email' : (isLogin ? 'Welcome Back' : 'Join NomadNow')}
            </Title>
            <Paragraph style={styles.subtitle}>
              {showVerification 
                ? 'Enter the 6-digit code sent to your email'
                : (isLogin
                  ? 'Sign in to discover nearby digital nomads'
                  : 'Create your account and start your journey')
              }
            </Paragraph>

            {!showVerification ? (
              <>
                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  outlineColor="#e5e7eb"
                  activeOutlineColor="#6366f1"
                />

                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  style={styles.input}
                  secureTextEntry
                  outlineColor="#e5e7eb"
                  activeOutlineColor="#6366f1"
                />

                {!isLogin && (
                  <TextInput
                    label="Nickname"
                    value={nickname}
                    onChangeText={setNickname}
                    mode="outlined"
                    style={styles.input}
                    placeholder="Enter your preferred nickname"
                    outlineColor="#e5e7eb"
                    activeOutlineColor="#6366f1"
                  />
                )}

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.button}
                  loading={loading}
                  disabled={loading}
                  contentStyle={styles.buttonContent}
                >
                  {isLogin ? 'Sign In' : 'Continue'}
                </Button>

                <Button
                  mode="text"
                  onPress={handleToggleMode}
                  style={styles.toggleButton}
                  disabled={loading}
                >
                  {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                </Button>
              </>
            ) : (
              <>
                <View style={styles.verificationContainer}>
                  <Paragraph style={styles.verificationText}>
                    We've sent a verification code to:
                  </Paragraph>
                  <Chip style={styles.emailChip} textStyle={styles.emailChipText}>
                    {email}
                  </Chip>
                </View>

                <TextInput
                  label="Verification Code"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  outlineColor="#e5e7eb"
                  activeOutlineColor="#6366f1"
                />

                <Button
                  mode="contained"
                  onPress={handleVerification}
                  style={styles.button}
                  loading={loading}
                  disabled={loading}
                  contentStyle={styles.buttonContent}
                >
                  Verify & Create Account
                </Button>

                <Divider style={styles.divider} />

                <View style={styles.verificationActions}>
                  <Button
                    mode="text"
                    onPress={handleResendCode}
                    style={styles.actionButton}
                    disabled={loading}
                  >
                    Resend Code
                  </Button>
                  <Button
                    mode="text"
                    onPress={handleBackToSignup}
                    style={styles.actionButton}
                    disabled={loading}
                  >
                    Back to Sign Up
                  </Button>
                </View>

                <View style={styles.verificationInfo}>
                  <Paragraph style={styles.infoText}>
                    💡 Demo code: <Text style={styles.codeText}>123456</Text>
                  </Paragraph>
                </View>
              </>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    borderRadius: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#64748b',
    fontWeight: '500',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  button: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#6366f1',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  toggleButton: {
    marginTop: 8,
    paddingVertical: 8,
  },
  verificationContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  verificationText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 12,
    textAlign: 'center',
  },
  emailChip: {
    backgroundColor: '#eef2ff',
    borderRadius: 20,
  },
  emailChipText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  divider: {
    marginVertical: 20,
    backgroundColor: '#e2e8f0',
  },
  verificationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
  },
  verificationInfo: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  codeText: {
    fontWeight: '700',
    color: '#6366f1',
  },
}); 