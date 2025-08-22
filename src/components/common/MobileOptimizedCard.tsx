import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Avatar,
  Chip,
  IconButton,
} from 'react-native-paper';
import { colors, spacing, borderRadius, shadowPresets } from '../../utils/responsive';
import { useResponsive } from '../../utils/responsive';

interface MobileOptimizedCardProps {
  title?: string;
  subtitle?: string;
  content?: React.ReactNode;
  avatar?: string;
  avatarLabel?: string;
  chips?: string[];
  onPress?: () => void;
  style?: any;
  compact?: boolean;
  showShadow?: boolean;
  backgroundColor?: string;
}

export const MobileOptimizedCard: React.FC<MobileOptimizedCardProps> = ({
  title,
  subtitle,
  content,
  avatar,
  avatarLabel,
  chips,
  onPress,
  style,
  compact = false,
  showShadow = true,
  backgroundColor = colors.white,
}) => {
  const { isPhone } = useResponsive();

  const cardContent = (
    <Card
      style={[
        styles.card,
        compact && styles.compactCard,
        showShadow && shadowPresets.small,
        { backgroundColor },
        style,
      ]}
      mode="outlined"
    >
      <Card.Content style={[
        styles.cardContent,
        compact && styles.compactCardContent
      ]}>
        {(title || subtitle || avatar) && (
          <View style={styles.header}>
            {avatar && (
              <Avatar.Image
                size={compact ? 40 : 48}
                source={{ uri: avatar }}
                style={styles.avatar}
              />
            )}
            {avatarLabel && !avatar && (
              <Avatar.Text
                size={compact ? 40 : 48}
                label={avatarLabel}
                style={[styles.avatar, { backgroundColor: colors.primary }]}
              />
            )}
            
            {(title || subtitle) && (
              <View style={styles.textContent}>
                {title && (
                  <Title style={[
                    styles.title,
                    compact && styles.compactTitle
                  ]}>
                    {title}
                  </Title>
                )}
                {subtitle && (
                  <Paragraph style={[
                    styles.subtitle,
                    compact && styles.compactSubtitle
                  ]}>
                    {subtitle}
                  </Paragraph>
                )}
              </View>
            )}
          </View>
        )}

        {content && (
          <View style={[
            styles.content,
            compact && styles.compactContent
          ]}>
            {content}
          </View>
        )}

        {chips && chips.length > 0 && (
          <View style={[
            styles.chipsContainer,
            compact && styles.compactChipsContainer
          ]}>
            {chips.slice(0, 3).map((chip, index) => (
              <Chip
                key={index}
                style={[
                  styles.chip,
                  compact && styles.compactChip
                ]}
                textStyle={[
                  styles.chipText,
                  compact && styles.compactChipText
                ]}
              >
                {chip}
              </Chip>
            ))}
            {chips.length > 3 && (
              <Chip
                style={[styles.chip, styles.moreChip]}
                textStyle={styles.chipText}
              >
                +{chips.length - 3}
              </Chip>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={styles.touchable}
        activeOpacity={0.7}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

// Specialized mobile cards
export const MobileUserCard: React.FC<{
  user: {
    nickname: string;
    bio?: string;
    avatar_url?: string;
    current_city?: string;
    skills?: string[];
    is_available_for_meetup?: boolean;
  };
  onPress?: () => void;
}> = ({ user, onPress }) => (
  <MobileOptimizedCard
    title={user.nickname}
    subtitle={user.current_city || 'Location not set'}
    avatar={user.avatar_url}
    avatarLabel={user.nickname.charAt(0).toUpperCase()}
    chips={user.skills?.slice(0, 3) || []}
    onPress={onPress}
    compact={true}
    content={
      user.bio && (
        <Paragraph style={styles.bioText} numberOfLines={2}>
          {user.bio}
        </Paragraph>
      )
    }
  />
);

export const MobileMeetupCard: React.FC<{
  meetup: {
    title: string;
    description: string;
    location: string;
    date: string;
    time: string;
    currentParticipants: number;
    maxParticipants: number;
    tags: string[];
  };
  onPress?: () => void;
}> = ({ meetup, onPress }) => (
  <MobileOptimizedCard
    title={meetup.title}
    subtitle={`${meetup.date} at ${meetup.time}`}
    chips={meetup.tags}
    onPress={onPress}
    compact={true}
    content={
      <View style={styles.meetupContent}>
        <Paragraph style={styles.meetupDescription} numberOfLines={2}>
          {meetup.description}
        </Paragraph>
        <View style={styles.meetupMeta}>
          <Paragraph style={styles.meetupLocation}>
            📍 {meetup.location}
          </Paragraph>
          <Paragraph style={styles.meetupParticipants}>
            👥 {meetup.currentParticipants}/{meetup.maxParticipants}
          </Paragraph>
        </View>
      </View>
    }
  />
);

export const MobileCityCard: React.FC<{
  city: {
    name: string;
    country: string;
    description: string;
    nomadScore: number;
    costOfLiving: string;
    image?: string;
  };
  onPress?: () => void;
}> = ({ city, onPress }) => (
  <MobileOptimizedCard
    title={city.name}
    subtitle={city.country}
    onPress={onPress}
    compact={true}
    content={
      <View style={styles.cityContent}>
        <Paragraph style={styles.cityDescription} numberOfLines={2}>
          {city.description}
        </Paragraph>
        <View style={styles.cityMeta}>
          <Chip style={styles.scoreChip} textStyle={styles.scoreChipText}>
            ⭐ {city.nomadScore}/10
          </Chip>
          <Chip style={styles.costChip} textStyle={styles.costChipText}>
            💰 {city.costOfLiving}
          </Chip>
        </View>
      </View>
    }
  />
);

const styles = StyleSheet.create({
  touchable: {
    marginBottom: spacing.sm,
  },
  card: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  compactCard: {
    marginBottom: spacing.xs,
  },
  cardContent: {
    padding: spacing.md,
  },
  compactCardContent: {
    padding: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatar: {
    marginRight: spacing.sm,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  compactTitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  compactSubtitle: {
    fontSize: 12,
  },
  content: {
    marginBottom: spacing.sm,
  },
  compactContent: {
    marginBottom: spacing.xs,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  compactChipsContainer: {
    gap: 4,
  },
  chip: {
    backgroundColor: colors.primaryLight,
    marginBottom: spacing.xs,
  },
  compactChip: {
    backgroundColor: colors.primaryLight,
    marginBottom: 2,
  },
  chipText: {
    fontSize: 11,
    color: colors.primary,
  },
  compactChipText: {
    fontSize: 10,
  },
  moreChip: {
    backgroundColor: colors.gray200,
  },
  bioText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  meetupContent: {
    marginBottom: spacing.sm,
  },
  meetupDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  meetupMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meetupLocation: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  meetupParticipants: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  cityContent: {
    marginBottom: spacing.sm,
  },
  cityDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  cityMeta: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  scoreChip: {
    backgroundColor: colors.successLight,
  },
  scoreChipText: {
    fontSize: 11,
    color: colors.success,
  },
  costChip: {
    backgroundColor: colors.warningLight,
  },
  costChipText: {
    fontSize: 11,
    color: colors.warning,
  },
});
