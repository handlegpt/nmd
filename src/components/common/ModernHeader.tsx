import React from 'react';
import {
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  Title,
  Paragraph,
  IconButton,
  Surface,
  Badge,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../utils/responsive';
import { shadowPresets } from '../../utils/platformStyles';

interface ModernHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  backgroundColor?: string;
  showBadge?: boolean;
  badgeCount?: number;
  onIconPress?: () => void;
  rightAction?: React.ReactNode;
  gradient?: boolean;
  elevation?: number;
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({
  title,
  subtitle,
  icon,
  iconColor = colors.primary,
  backgroundColor = colors.white,
  showBadge = false,
  badgeCount = 0,
  onIconPress,
  rightAction,
  gradient = false,
  elevation = 2,
}) => {
  return (
    <Surface 
      style={[
        styles.header,
        { 
          backgroundColor,
          elevation: Platform.OS === 'android' ? elevation : 0,
        },
        gradient && styles.gradientHeader,
        shadowPresets.medium,
      ]}
    >
      <View style={styles.headerContent}>
        <View style={styles.leftSection}>
          {icon && (
            <View style={styles.iconContainer}>
              <IconButton
                icon={icon}
                size={28}
                iconColor={iconColor}
                onPress={onIconPress}
                style={styles.iconButton}
              />
              {showBadge && badgeCount > 0 && (
                <Badge 
                  size={16} 
                  style={styles.badge}
                  visible={true}
                >
                  {badgeCount > 99 ? '99+' : badgeCount}
                </Badge>
              )}
            </View>
          )}
          
          <View style={styles.titleSection}>
            <Title style={styles.title}>{title}</Title>
            {subtitle && (
              <Paragraph style={styles.subtitle}>{subtitle}</Paragraph>
            )}
          </View>
        </View>

        {rightAction && (
          <View style={styles.rightSection}>
            {rightAction}
          </View>
        )}
      </View>

      {/* Decorative elements */}
      <View style={styles.decorationContainer}>
        <View style={[styles.decorationCircle, { backgroundColor: iconColor }]} />
        <View style={[styles.decorationLine, { backgroundColor: iconColor }]} />
      </View>
    </Surface>
  );
};

// Specialized header components for different pages
export const DiscoverHeader: React.FC<{ userCount?: number }> = ({ userCount = 0 }) => (
  <ModernHeader
    title="Discover Nomads"
    subtitle="Find fellow travelers nearby"
    icon="map-marker-radius"
    iconColor="#6366f1"
    backgroundColor="#f8fafc"
    showBadge={userCount > 0}
    badgeCount={userCount}
  />
);

export const MeetupsHeader: React.FC<{ meetupCount?: number }> = ({ meetupCount = 0 }) => (
  <ModernHeader
    title="Meetups & Events"
    subtitle="Join exciting activities with fellow nomads"
    icon="calendar-multiple"
    iconColor="#10b981"
    backgroundColor="#f0fdf4"
    showBadge={meetupCount > 0}
    badgeCount={meetupCount}
  />
);

export const CitiesHeader: React.FC<{ cityCount?: number }> = ({ cityCount = 0 }) => (
  <ModernHeader
    title="Nomad Cities"
    subtitle="Discover the best cities for digital nomads"
    icon="city"
    iconColor="#f59e0b"
    backgroundColor="#fffbeb"
    showBadge={cityCount > 0}
    badgeCount={cityCount}
  />
);

export const NotificationsHeader: React.FC<{ notificationCount?: number }> = ({ notificationCount = 0 }) => (
  <ModernHeader
    title="Notifications"
    subtitle="Stay updated with your community"
    icon="bell"
    iconColor="#ef4444"
    backgroundColor="#fef2f2"
    showBadge={notificationCount > 0}
    badgeCount={notificationCount}
  />
);

export const ProfileHeader: React.FC<{ user?: any }> = ({ user }) => (
  <ModernHeader
    title="Profile"
    subtitle={user ? `Welcome back, ${user.nickname}` : "Manage your account"}
    icon="account-circle"
    iconColor="#8b5cf6"
    backgroundColor="#faf5ff"
  />
);

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'web' ? spacing.lg : spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  gradientHeader: {
    // Add gradient background if needed
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  iconButton: {
    margin: 0,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
    lineHeight: 22,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  decorationContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 120,
    height: 120,
    opacity: 0.1,
  },
  decorationCircle: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  decorationLine: {
    position: 'absolute',
    top: 60,
    right: 40,
    width: 40,
    height: 2,
    borderRadius: 1,
  },
});
