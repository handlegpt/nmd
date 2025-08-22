import React from 'react';
import {
  View,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import {
  Title,
  Paragraph,
  IconButton,
  Surface,
  Badge,
} from 'react-native-paper';
import { colors, spacing, borderRadius, safeAreaInsets } from '../../utils/responsive';
import { shadowPresets } from '../../utils/platformStyles';
import { useResponsive } from '../../utils/responsive';

interface MobileOptimizedHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  backgroundColor?: string;
  showBadge?: boolean;
  badgeCount?: number;
  onIconPress?: () => void;
  rightAction?: React.ReactNode;
  showStatusBar?: boolean;
  statusBarStyle?: 'light-content' | 'dark-content' | 'default';
  compact?: boolean;
}

export const MobileOptimizedHeader: React.FC<MobileOptimizedHeaderProps> = ({
  title,
  subtitle,
  icon,
  iconColor = colors.primary,
  backgroundColor = colors.white,
  showBadge = false,
  badgeCount = 0,
  onIconPress,
  rightAction,
  showStatusBar = true,
  statusBarStyle = 'dark-content',
  compact = false,
}) => {
  const { isPhone, isIOS } = useResponsive();

  // Only apply mobile optimizations on phone devices
  if (!isPhone) {
    return null; // Use regular ModernHeader on non-phone devices
  }

  return (
    <Surface 
      style={[
        styles.header,
        { 
          backgroundColor,
          paddingTop: showStatusBar ? safeAreaInsets.top : spacing.sm,
        },
        shadowPresets.medium,
      ]}
    >
      {showStatusBar && (
        <StatusBar
          barStyle={statusBarStyle}
          backgroundColor={backgroundColor}
          translucent={false}
        />
      )}
      
      <View style={[
        styles.headerContent,
        compact && styles.compactHeaderContent
      ]}>
        <View style={styles.leftSection}>
          {icon && (
            <View style={styles.iconContainer}>
              <IconButton
                icon={icon}
                size={compact ? 24 : 28}
                iconColor={iconColor}
                onPress={onIconPress}
                style={styles.iconButton}
              />
              {showBadge && badgeCount > 0 && (
                <Badge 
                  size={14} 
                  style={styles.badge}
                  visible={true}
                >
                  {badgeCount > 99 ? '99+' : badgeCount}
                </Badge>
              )}
            </View>
          )}
          
          <View style={styles.titleSection}>
            <Title style={[
              styles.title,
              compact && styles.compactTitle
            ]}>
              {title}
            </Title>
            {subtitle && (
              <Paragraph style={[
                styles.subtitle,
                compact && styles.compactSubtitle
              ]}>
                {subtitle}
              </Paragraph>
            )}
          </View>
        </View>

        {rightAction && (
          <View style={styles.rightSection}>
            {rightAction}
          </View>
        )}
      </View>

      {/* Mobile-specific decorative elements */}
      <View style={styles.decorationContainer}>
        <View style={[styles.decorationCircle, { backgroundColor: iconColor }]} />
        <View style={[styles.decorationLine, { backgroundColor: iconColor }]} />
      </View>
    </Surface>
  );
};

// Mobile-optimized specialized headers
export const MobileDiscoverHeader: React.FC<{ userCount?: number }> = ({ userCount = 0 }) => (
  <MobileOptimizedHeader
    title="Discover"
    subtitle="Find nomads nearby"
    icon="map-marker-radius"
    iconColor="#6366f1"
    backgroundColor="#f8fafc"
    showBadge={userCount > 0}
    badgeCount={userCount}
    compact={true}
  />
);

export const MobileMeetupsHeader: React.FC<{ meetupCount?: number }> = ({ meetupCount = 0 }) => (
  <MobileOptimizedHeader
    title="Meetups"
    subtitle="Join activities"
    icon="calendar-multiple"
    iconColor="#10b981"
    backgroundColor="#f0fdf4"
    showBadge={meetupCount > 0}
    badgeCount={meetupCount}
    compact={true}
  />
);

export const MobileCitiesHeader: React.FC<{ cityCount?: number }> = ({ cityCount = 0 }) => (
  <MobileOptimizedHeader
    title="Cities"
    subtitle="Best nomad spots"
    icon="city"
    iconColor="#f59e0b"
    backgroundColor="#fffbeb"
    showBadge={cityCount > 0}
    badgeCount={cityCount}
    compact={true}
  />
);

export const MobileNotificationsHeader: React.FC<{ notificationCount?: number }> = ({ notificationCount = 0 }) => (
  <MobileOptimizedHeader
    title="Notifications"
    subtitle="Stay updated"
    icon="bell"
    iconColor="#ef4444"
    backgroundColor="#fef2f2"
    showBadge={notificationCount > 0}
    badgeCount={notificationCount}
    compact={true}
  />
);

const styles = StyleSheet.create({
  header: {
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
  },
  compactHeaderContent: {
    minHeight: 48,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    position: 'relative',
    marginRight: spacing.sm,
  },
  iconButton: {
    margin: 0,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.error,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    letterSpacing: -0.3,
  },
  compactTitle: {
    fontSize: 18,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    lineHeight: 18,
  },
  compactSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  decorationContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 80,
    height: 80,
    opacity: 0.08,
  },
  decorationCircle: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  decorationLine: {
    position: 'absolute',
    top: 40,
    right: 25,
    width: 30,
    height: 2,
    borderRadius: 1,
  },
});
