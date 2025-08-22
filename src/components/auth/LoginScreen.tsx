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
import { shadowPresets } from '../../utils/platformStyles';
import { colors, spacing, borderRadius } from '../../utils/responsive';
import ResponsiveContainer from '../common/ResponsiveContainer';
import { ToastOptimized } from '../common/ToastOptimized';
import LoadingSpinner from '../common/LoadingSpinner';
import GoogleOAuth from './GoogleOAuth';
import { 
  sendVerificationEmail, 
  verifyCode, 
  resendVerificationCode,
  generateVerificationCode
} from '../../utils/emailService';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [nickname, setNickname] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' | 'warning' });
  const { signIn, signUp, loading, setUser, setSession } = useAuthStore();

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

  // Handle Google OAuth success
  const handleGoogleSuccess = (user: any) => {
    showToast('Successfully signed in with Gmail!', 'success');
  };

  // Handle Google OAuth error
  const handleGoogleError = (error: string) => {
    showToast(`Gmail login failed: ${error}`, 'error');
  };

  // Handle form submission for login/signup
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (isLogin) {
        await signIn(email, password);
        showToast('Successfully signed in!', 'success');
      } else {
        // For signup, send verification email
        const code = generateVerificationCode();
        const success = await sendVerificationEmail(email, code);
        if (success) {
          setShowVerification(true);
          showToast('Verification code sent to your email!', 'success');
        } else {
          showToast('Failed to send verification code. Please try again.', 'error');
        }
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
      // Verify the code using email service
      const isValid = verifyCode(email, verificationCode);
      if (isValid) {
        await signUp(email, password, nickname);
        showToast('Account created successfully!', 'success');
        setShowVerification(false);
        setVerificationCode('');
      } else {
        showToast('Invalid or expired verification code. Please try again.', 'error');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      showToast('Verification failed. Please try again.', 'error');
    }
  };

  // Handle resend verification code
  const handleResendCode = async () => {
    try {
      const success = await resendVerificationCode(email);
      if (success) {
        showToast('Verification code resent to your email!', 'success');
      } else {
        showToast('Failed to resend verification code. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Resend error:', error);
      showToast('Failed to resend verification code. Please try again.', 'error');
    }
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
    <ResponsiveContainer>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>
                {showVerification ? 'Verify Your Email' : (isLogin ? 'Welcome Back' : 'Join NomadNow')}
              </Title>
              
              <Paragraph style={styles.subtitle}>
                {showVerification 
                  ? 'Enter the verification code sent to your email'
                  : (isLogin 
                    ? 'Sign in to continue your journey' 
                    : 'Create your account to start exploring'
                  )
                }
              </Paragraph>

              {!showVerification && (
                <>
                  {/* Google OAuth Button */}
                  <GoogleOAuth
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    style={styles.googleButton}
                  />

                  <View style={styles.dividerContainer}>
                    <Divider style={styles.divider} />
                    <Text style={styles.dividerText}>or</Text>
                    <Divider style={styles.divider} />
                  </View>

                  {/* Email/Password Form */}
                  <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                    outlineColor={colors.gray300}
                    activeOutlineColor={colors.primary}
                  />

                  <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry
                    style={styles.input}
                    outlineColor={colors.gray300}
                    activeOutlineColor={colors.primary}
                  />

                  {!isLogin && (
                    <TextInput
                      label="Nickname"
                      value={nickname}
                      onChangeText={setNickname}
                      mode="outlined"
                      style={styles.input}
                      outlineColor={colors.gray300}
                      activeOutlineColor={colors.primary}
                    />
                  )}

                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    style={styles.submitButton}
                    contentStyle={styles.submitButtonContent}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                  </Button>

                  <Button
                    mode="text"
                    onPress={handleToggleMode}
                    style={styles.toggleButton}
                  >
                    {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                  </Button>
                </>
              )}

              {showVerification && (
                <>
                  <TextInput
                    label="Verification Code"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.input}
                    outlineColor={colors.gray300}
                    activeOutlineColor={colors.primary}
                  />

                  <Button
                    mode="contained"
                    onPress={handleVerification}
                    style={styles.submitButton}
                    contentStyle={styles.submitButtonContent}
                  >
                    Verify Code
                  </Button>

                  <Button
                    mode="text"
                    onPress={handleResendCode}
                    style={styles.resendButton}
                  >
                    Resend Code
                  </Button>

                  <Button
                    mode="text"
                    onPress={handleBackToSignup}
                    style={styles.backButton}
                  >
                    Back to Sign Up
                  </Button>
                </>
              )}
            </Card.Content>
          </Card>
        </ScrollView>

        <ToastOptimized
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />

        <LoadingSpinner visible={loading} />
      </KeyboardAvoidingView>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.base,
  },
  card: {
    ...shadowPresets.medium,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.lg,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  input: {
    marginBottom: spacing.base,
    backgroundColor: colors.white,
  },
  submitButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
  },
  submitButtonContent: {
    paddingVertical: spacing.sm,
  },
  toggleButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
  },
  googleButton: {
    marginTop: spacing.sm,
    borderColor: '#4285f4',
    borderWidth: 2,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.base,
  },
  divider: {
    flex: 1,
    backgroundColor: colors.gray200,
  },
  dividerText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: spacing.base,
  },
  resendButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
  },
  backButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
  },
}); 