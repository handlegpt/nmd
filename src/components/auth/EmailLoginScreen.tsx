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

import { EmailAuthService } from '../../services/emailAuthService';

export const EmailLoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
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
      showToast('请输入您的邮箱地址', 'error');
      return false;
    }
    if (!validateEmail(email)) {
      showToast('请输入有效的邮箱地址', 'error');
      return false;
    }
    if (isSignup && !nickname.trim()) {
      showToast('请输入您的昵称', 'error');
      return false;
    }
    return true;
  };

  // Handle email submission
  const handleSubmitEmail = async () => {
    if (!validateForm()) return;

    try {
      showToast('正在发送验证码到您的邮箱...', 'info');
      
      // Check if user exists for login mode
      if (!isSignup) {
        const userExists = await EmailAuthService.checkUserExists(email);
        if (!userExists) {
          showToast('账户不存在，请先注册', 'error');
          setIsSignup(true);
          return;
        }
      }
      
      const success = await EmailAuthService.sendVerificationCode(email, nickname, isSignup);
      
      if (success) {
        showToast('验证码已发送到您的邮箱！', 'success');
        setShowVerification(true);
      } else {
        showToast('发送验证码失败，请重试。', 'error');
      }
    } catch (error: any) {
      console.error('Email submission error:', error);
      showToast('发送验证码失败，请重试。', 'error');
    }
  };

  // Handle verification code submission
  const handleVerification = async () => {
    if (!verificationCode.trim()) {
      showToast('请输入验证码', 'error');
      return;
    }

    try {
      // Verify and authenticate using email auth service
      const result = await EmailAuthService.verifyAndAuthenticate(verificationCode);
      
      if (result.user) {
        // Set user in auth store
        setUser(result.user);
        showToast(isSignup ? '账户创建成功！' : '登录成功！', 'success');
        setShowVerification(false);
        setVerificationCode('');
      } else {
        showToast(result.error || '验证失败，请重试。', 'error');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      showToast('验证失败，请重试。', 'error');
    }
  };

  // Handle resend verification code
  const handleResendCode = async () => {
    try {
      const success = await EmailAuthService.sendVerificationCode(email, nickname, isSignup);
      if (success) {
        showToast('验证码已重新发送到您的邮箱！', 'success');
      } else {
        showToast('重新发送验证码失败，请重试。', 'error');
      }
    } catch (error) {
      console.error('Resend error:', error);
      showToast('重新发送验证码失败，请重试。', 'error');
    }
  };

  // Clear form when switching between login/signup
  const handleToggleMode = () => {
    setIsSignup(!isSignup);
    setEmail('');
    setNickname('');
    setVerificationCode('');
    setShowVerification(false);
  };

  // Go back to email input
  const handleBackToEmail = () => {
    setShowVerification(false);
    setVerificationCode('');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ResponsiveContainer>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={[styles.card, shadowPresets.medium]}>
            <Card.Content style={styles.cardContent}>
              <Title style={styles.title}>
                {isSignup ? '注册账户' : '邮箱登录'}
              </Title>
              <Paragraph style={styles.subtitle}>
                {isSignup 
                  ? '使用邮箱验证码创建您的账户' 
                  : '输入邮箱地址，我们将发送验证码给您'
                }
              </Paragraph>

              {!showVerification ? (
                // Email input form
                <View style={styles.form}>
                  <TextInput
                    label="邮箱地址"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.input}
                    theme={{ colors: { primary: colors.primary } }}
                  />

                  {isSignup && (
                    <TextInput
                      label="昵称"
                      value={nickname}
                      onChangeText={setNickname}
                      mode="outlined"
                      style={styles.input}
                      theme={{ colors: { primary: colors.primary } }}
                    />
                  )}

                  <Button
                    mode="contained"
                    onPress={handleSubmitEmail}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                    disabled={loading}
                  >
                    {isSignup ? '发送验证码' : '发送验证码'}
                  </Button>

                  <Divider style={styles.divider} />

                  <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>
                      {isSignup ? '已有账户？' : '没有账户？'}
                    </Text>
                    <Button
                      mode="text"
                      onPress={handleToggleMode}
                      style={styles.toggleButton}
                    >
                      {isSignup ? '立即登录' : '立即注册'}
                    </Button>
                  </View>
                </View>
              ) : (
                // Verification code form
                <View style={styles.form}>
                  <Text style={styles.verificationText}>
                    验证码已发送到：
                  </Text>
                  <Chip
                    mode="outlined"
                    style={styles.emailChip}
                    textStyle={styles.emailChipText}
                  >
                    {email}
                  </Chip>

                  <TextInput
                    label="验证码"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    mode="outlined"
                    keyboardType="numeric"
                    maxLength={6}
                    style={styles.input}
                    theme={{ colors: { primary: colors.primary } }}
                  />

                  <Button
                    mode="contained"
                    onPress={handleVerification}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                    disabled={loading || !verificationCode.trim()}
                  >
                    {isSignup ? '创建账户' : '登录'}
                  </Button>

                  <View style={styles.verificationActions}>
                    <Button
                      mode="text"
                      onPress={handleResendCode}
                      style={styles.actionButton}
                      disabled={loading}
                    >
                      重新发送验证码
                    </Button>
                    <Button
                      mode="text"
                      onPress={handleBackToEmail}
                      style={styles.actionButton}
                      disabled={loading}
                    >
                      返回修改邮箱
                    </Button>
                  </View>
                </View>
              )}
            </Card.Content>
          </Card>
        </ScrollView>

        <ToastOptimized
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onDismiss={hideToast}
        />
      </KeyboardAvoidingView>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.large,
  },
  card: {
    borderRadius: borderRadius.large,
    backgroundColor: colors.surface,
  },
  cardContent: {
    padding: spacing.large,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.small,
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.large,
    color: colors.textSecondary,
    fontSize: 16,
  },
  form: {
    gap: spacing.medium,
  },
  input: {
    marginBottom: spacing.small,
  },
  button: {
    marginTop: spacing.medium,
    borderRadius: borderRadius.medium,
  },
  buttonContent: {
    paddingVertical: spacing.small,
  },
  divider: {
    marginVertical: spacing.large,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.small,
  },
  toggleText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  toggleButton: {
    margin: 0,
    padding: 0,
  },
  verificationText: {
    textAlign: 'center',
    marginBottom: spacing.small,
    color: colors.textSecondary,
    fontSize: 16,
  },
  emailChip: {
    alignSelf: 'center',
    marginBottom: spacing.medium,
  },
  emailChipText: {
    color: colors.primary,
    fontWeight: '500',
  },
  verificationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.medium,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.small,
  },
});
