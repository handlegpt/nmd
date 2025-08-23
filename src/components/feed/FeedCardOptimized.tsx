import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Avatar,
  Surface,
  Divider,
} from 'react-native-paper';
import SmartIcon from '../common/SmartIcon';
import { colors, spacing, borderRadius } from '../../utils/responsive';
import { shadowPresets } from '../../utils/platformStyles';
import { Post } from '../../services/postService';
// Native date formatting utility
const formatDistanceToNow = (date: Date, options?: { addSuffix?: boolean; locale?: any }) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return '刚刚';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小时前`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}天前`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}个月前`;
  return `${Math.floor(diffInSeconds / 31536000)}年前`;
};

const { width } = Dimensions.get('window');

interface FeedCardOptimizedProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onPress?: (post: Post) => void;
  compact?: boolean;
}

export const FeedCardOptimized: React.FC<FeedCardOptimizedProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onPress,
  compact = false,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  // Format time
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return '刚刚';
    }
  };

  // Handle like
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike?.(post.id);
  };

  // Handle comment
  const handleComment = () => {
    onComment?.(post.id);
  };

  // Handle share
  const handleShare = () => {
    onShare?.(post.id);
  };

  // Handle card press
  const handleCardPress = () => {
    onPress?.(post);
  };

  const cardContent = (
    <Surface style={[styles.card, compact && styles.compactCard]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Avatar.Image
            size={compact ? 36 : 44}
            source={post.userAvatar ? { uri: post.userAvatar } : undefined}
            style={styles.avatar}
          />
          <View style={styles.userDetails}>
            <Title style={[styles.userName, compact && styles.compactUserName]}>
              {post.userNickname}
            </Title>
            <Paragraph style={[styles.timeText, compact && styles.compactTimeText]}>
              {formatTime(post.createdAt)}
            </Paragraph>
          </View>
        </View>
        
        {post.location && (
          <View style={styles.locationContainer}>
            <Paragraph style={[styles.locationText, compact && styles.compactLocationText]}>
              📍 {post.location}
            </Paragraph>
          </View>
        )}
      </View>

      {/* Content */}
      {post.content && (
        <View style={styles.contentContainer}>
          <Paragraph style={[styles.contentText, compact && styles.compactContentText]}>
            {post.content}
          </Paragraph>
        </View>
      )}

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <View style={styles.mediaContainer}>
          {post.media.length === 1 ? (
            <Image
              source={{ uri: post.media[0].uri }}
              style={[styles.singleImage, compact && styles.compactSingleImage]}
              resizeMode="cover"
            />
          ) : post.media.length === 2 ? (
            <View style={styles.twoImageContainer}>
              {post.media.slice(0, 2).map((media, index) => (
                <Image
                  key={media.id}
                  source={{ uri: media.uri }}
                  style={[styles.twoImage, compact && styles.compactTwoImage]}
                  resizeMode="cover"
                />
              ))}
            </View>
          ) : (
            <View style={styles.multiImageContainer}>
              {post.media.slice(0, 3).map((media, index) => (
                <Image
                  key={media.id}
                  source={{ uri: media.uri }}
                  style={[
                    styles.multiImage,
                    compact && styles.compactMultiImage,
                    index === 2 && post.media.length > 3 && styles.lastImage
                  ]}
                  resizeMode="cover"
                />
              ))}
              {post.media.length > 3 && (
                <View style={[styles.moreImagesOverlay, compact && styles.compactMoreImagesOverlay]}>
                  <Paragraph style={styles.moreImagesText}>
                    +{post.media.length - 3}
                  </Paragraph>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* Meetup Details */}
      {post.isMeetupRequest && post.meetupDetails && (
        <View style={styles.meetupContainer}>
          <Surface style={styles.meetupCard}>
            <Title style={[styles.meetupTitle, compact && styles.compactMeetupTitle]}>
              🎯 {post.meetupDetails.title}
            </Title>
            <Paragraph style={[styles.meetupDetails, compact && styles.compactMeetupDetails]}>
              📅 {post.meetupDetails.date}
            </Paragraph>
            <Paragraph style={[styles.meetupDetails, compact && styles.compactMeetupDetails]}>
              📍 {post.meetupDetails.location}
            </Paragraph>
            <Paragraph style={[styles.meetupDetails, compact && styles.compactMeetupDetails]}>
              👥 {post.meetupDetails.currentPeople}/{post.meetupDetails.maxPeople} 人
            </Paragraph>
          </Surface>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLike}
          activeOpacity={0.7}
        >
          <SmartIcon
            icon={isLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={isLiked ? colors.error : colors.textSecondary}
            style={styles.actionIcon}
          />
          <Paragraph style={[styles.actionText, isLiked && styles.likedText]}>
            {likeCount}
          </Paragraph>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleComment}
          activeOpacity={0.7}
        >
          <SmartIcon
            icon="comment-outline"
            size={20}
            color={colors.textSecondary}
            style={styles.actionIcon}
          />
          <Paragraph style={styles.actionText}>
            {post.comments?.length || 0}
          </Paragraph>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <SmartIcon
            icon="share-outline"
            size={20}
            color={colors.textSecondary}
            style={styles.actionIcon}
          />
          <Paragraph style={styles.actionText}>
            分享
          </Paragraph>
        </TouchableOpacity>
      </View>
    </Surface>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={handleCardPress}
        activeOpacity={0.95}
        style={styles.touchableContainer}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  touchableContainer: {
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 0,
    elevation: 4,
    shadowColor: colors.gray800,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  compactCard: {
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    marginRight: spacing.sm,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  compactUserName: {
    fontSize: 14,
  },
  timeText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  compactTimeText: {
    fontSize: 12,
  },
  locationContainer: {
    alignItems: 'flex-end',
  },
  locationText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  compactLocationText: {
    fontSize: 11,
  },
  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  compactContentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  mediaContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  singleImage: {
    width: '100%',
    height: 300,
    borderRadius: borderRadius.lg,
  },
  compactSingleImage: {
    height: 250,
  },
  twoImageContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  twoImage: {
    flex: 1,
    height: 200,
    borderRadius: borderRadius.lg,
  },
  compactTwoImage: {
    height: 160,
  },
  multiImageContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    position: 'relative',
  },
  multiImage: {
    flex: 1,
    height: 150,
    borderRadius: borderRadius.lg,
  },
  compactMultiImage: {
    height: 120,
  },
  lastImage: {
    position: 'relative',
  },
  moreImagesOverlay: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '33.33%',
    height: 150,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactMoreImagesOverlay: {
    height: 120,
  },
  moreImagesText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  meetupContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  meetupCard: {
    backgroundColor: colors.primaryLight,
    borderWidth: 0,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  meetupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  compactMeetupTitle: {
    fontSize: 14,
  },
  meetupDetails: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  compactMeetupDetails: {
    fontSize: 13,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    backgroundColor: colors.surfaceVariant,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 0,
    elevation: 1,
    shadowColor: colors.gray800,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  actionIcon: {
    margin: 0,
    marginRight: spacing.xs,
  },
  actionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  likedText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
