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

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [nickname, setNickname] = useState('');
  const { signIn, signUp, loading } = useAuthStore();

  // Handle form submission for login/signup
  const handleSubmit = async () => {
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, nickname);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      // TODO: Show error message to user
    }
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
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              mode="outlined"
              secureTextEntry
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
              onPress={() => setIsLogin(!isLogin)}
              style={styles.switchButton}
            >
              {isLogin ? 'No account? Sign up' : 'Have account? Sign in'}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
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
    borderRadius: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 24,
    fontWeight: 'bold',
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
  switchButton: {
    marginTop: 8,
  },
}); 