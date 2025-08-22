import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, borderRadius } from '../../utils/responsive';
import { shadowPresets } from '../../utils/platformStyles';
import { useNavigation } from '@react-navigation/native';

const FeedScreen: React.FC = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation();

  console.log('FeedScreen rendering, user:', user);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Guest Card for non-logged in users */}
        {!user && (
          <Card style={styles.guestCard}>
            <Card.Content>
              <Title style={styles.guestTitle}>Welcome to NomadNow! 🌍</Title>
              <Paragraph style={styles.guestSubtitle}>
                Discover amazing digital nomads and connect with fellow travelers around the world
              </Paragraph>
              <Button
                mode="contained"
                onPress={() => (navigation as any).navigate('Login')}
                style={styles.guestButton}
              >
                Sign In to Start Sharing
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Debug info */}
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>Debug: FeedScreen is rendering</Text>
          <Text style={styles.debugText}>User logged in: {user ? 'Yes' : 'No'}</Text>
        </View>

        {/* Simple test content */}
        <Card style={styles.postCard}>
          <Card.Content>
            <Title style={styles.postTitle}>Test Post 1</Title>
            <Paragraph style={styles.postContent}>
              This is a test post to verify that the FeedScreen is rendering correctly.
            </Paragraph>
            <Text style={styles.postMeta}>Posted by Test User • 2 hours ago</Text>
          </Card.Content>
        </Card>

        <Card style={styles.postCard}>
          <Card.Content>
            <Title style={styles.postTitle}>Test Post 2</Title>
            <Paragraph style={styles.postContent}>
              This is another test post to ensure the component is working properly.
            </Paragraph>
            <Text style={styles.postMeta}>Posted by Another User • 4 hours ago</Text>
          </Card.Content>
        </Card>

        <Card style={styles.postCard}>
          <Card.Content>
            <Title style={styles.postTitle}>Test Post 3</Title>
            <Paragraph style={styles.postContent}>
              This is a third test post with different content to make sure everything is visible.
            </Paragraph>
            <Text style={styles.postMeta}>Posted by Third User • 6 hours ago</Text>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
};

export default React.memo(FeedScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  content: {
    padding: spacing.base,
  },
  guestCard: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary,
    ...shadowPresets.card,
  },
  guestTitle: {
    color: colors.white,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  guestSubtitle: {
    color: colors.white,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    opacity: 0.9,
    fontSize: 16,
    lineHeight: 24,
  },
  guestButton: {
    marginTop: spacing.base,
    backgroundColor: colors.white,
    color: colors.primary,
    borderRadius: borderRadius.lg,
    ...shadowPresets.small,
  },
  postCard: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    ...shadowPresets.card,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
    marginBottom: spacing.base,
  },
  postMeta: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  debugInfo: {
    marginTop: spacing.lg,
    padding: spacing.base,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  debugText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
});
