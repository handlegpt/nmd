import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Share,
  Platform,
} from 'react-native';
import {
  Modal,
  Portal,
  Surface,
  Title,
  Paragraph,
  Button,
  IconButton,
  Divider,
  List,
} from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { colors, spacing, borderRadius } from '../../utils/responsive';
import { shadowPresets } from '../../utils/platformStyles';
import { Post } from '../../services/postService';
import { ToastOptimized } from '../common/ToastOptimized';

interface ShareModalProps {
  visible: boolean;
  post: Post | null;
  onDismiss: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  post,
  onDismiss,
}) => {
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' | 'warning' });

  // Show toast
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ visible: true, message, type });
  };

  // Hide toast
  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Generate share content
  const generateShareContent = () => {
    if (!post) return { title: '', message: '', url: '' };

    const title = `NomadNow - ${post.userNickname}'s Post`;
    const message = `${post.content}\n\nFrom NomadNow - Digital Nomad Community`;
    const url = `https://nomadnow.app/post/${post.id}`;

    return { title, message, url };
  };

  // Share to native share sheet
  const handleNativeShare = async () => {
    if (!post) return;

    try {
      const { title, message, url } = generateShareContent();
      
      const result = await Share.share({
        title,
        message: `${message}\n\n${url}`,
        url: Platform.OS === 'ios' ? url : undefined,
      });

      if (result.action === Share.sharedAction) {
        showToast('Shared successfully', 'success');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      showToast('Share failed', 'error');
    }
  };

  // Copy link to clipboard
  const handleCopyLink = async () => {
    if (!post) return;

    try {
      const { url } = generateShareContent();
      await Clipboard.setStringAsync(url);
      showToast('Link copied to clipboard', 'success');
    } catch (error) {
      console.error('Error copying link:', error);
      showToast('Copy failed', 'error');
    }
  };

  // Share to social media
  const handleSocialShare = async (platform: string) => {
    if (!post) return;

    try {
      const { title, message, url } = generateShareContent();
      
      let shareUrl = '';
      switch (platform) {
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`;
          break;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
          break;
        case 'weibo':
          shareUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
          break;
        default:
          return;
      }

      // Open URL in browser
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(shareUrl);
      } else {
        // Fallback to native share
        await Share.share({
          title,
          message: `${message}\n\n${url}`,
          url: Platform.OS === 'ios' ? url : undefined,
        });
      }

      showToast(`Shared to ${platform} successfully`, 'success');
    } catch (error) {
      console.error(`Error sharing to ${platform}:`, error);
      showToast(`Share to ${platform} failed`, 'error');
    }
  };

  // Share as image (future feature)
  const handleShareAsImage = () => {
    showToast('Image share feature coming soon', 'info');
  };

  // Share to contacts (future feature)
  const handleShareToContacts = () => {
    showToast('Contact share feature coming soon', 'info');
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Title style={styles.headerTitle}>Share</Title>
            <IconButton
              icon="close"
              size={24}
              onPress={onDismiss}
              style={styles.closeButton}
            />
          </View>

          <Divider />

          {/* Share Options */}
          <View style={styles.shareOptions}>
            {/* Native Share */}
            <List.Item
              title="Share to..."
              description="Use system share function"
              left={(props) => <List.Icon {...props} icon="share-variant" />}
              onPress={handleNativeShare}
              style={styles.shareOption}
            />

            <Divider />

            {/* Copy Link */}
            <List.Item
              title="Copy Link"
              description="Copy post link to clipboard"
              left={(props) => <List.Icon {...props} icon="link" />}
              onPress={handleCopyLink}
              style={styles.shareOption}
            />

            <Divider />

            {/* Social Media */}
            <List.Item
              title="Share to Twitter"
              description="Share to Twitter"
              left={(props) => <List.Icon {...props} icon="twitter" />}
              onPress={() => handleSocialShare('twitter')}
              style={styles.shareOption}
            />

            <List.Item
              title="Share to Facebook"
              description="Share to Facebook"
              left={(props) => <List.Icon {...props} icon="facebook" />}
              onPress={() => handleSocialShare('facebook')}
              style={styles.shareOption}
            />

            <List.Item
              title="Share to LinkedIn"
              description="Share to LinkedIn"
              left={(props) => <List.Icon {...props} icon="linkedin" />}
              onPress={() => handleSocialShare('linkedin')}
              style={styles.shareOption}
            />

            <List.Item
              title="Share to Weibo"
              description="Share to Weibo"
              left={(props) => <List.Icon {...props} icon="weibo" />}
              onPress={() => handleSocialShare('weibo')}
              style={styles.shareOption}
            />

            <Divider />

            {/* Future Features */}
            <List.Item
              title="Share as Image"
              description="Generate image share (coming soon)"
              left={(props) => <List.Icon {...props} icon="image" />}
              onPress={handleShareAsImage}
              style={[styles.shareOption, styles.disabledOption]}
            />

            <List.Item
              title="Share to Contacts"
              description="Share to phone contacts (coming soon)"
              left={(props) => <List.Icon {...props} icon="account-multiple" />}
              onPress={handleShareToContacts}
              style={[styles.shareOption, styles.disabledOption]}
            />
          </View>

          {/* Cancel Button */}
          <View style={styles.cancelContainer}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
          </View>
        </Surface>

        <ToastOptimized
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    margin: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadowPresets.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  closeButton: {
    margin: 0,
  },
  shareOptions: {
    maxHeight: 400,
  },
  shareOption: {
    paddingVertical: spacing.xs,
  },
  disabledOption: {
    opacity: 0.6,
  },
  cancelContainer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  cancelButton: {
    borderRadius: borderRadius.lg,
  },
});

export default ShareModal;
