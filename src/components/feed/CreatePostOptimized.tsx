import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import {
  Surface,
  Title,
  Paragraph,
  Button,
  IconButton,
  TextInput,
  Avatar,
  Chip,
  Portal,
  Modal,
} from 'react-native-paper';
import { colors, spacing, borderRadius } from '../../utils/responsive';
import { shadowPresets } from '../../utils/platformStyles';
import { useAuthStore } from '../../store/authStore';
import { LocationShare } from '../common/LocationShare';
import { MediaPicker } from '../common/MediaPicker';
import { PostEnhancer } from '../common/PostEnhancer';
import { ToastOptimized } from '../common/ToastOptimized';

const { width } = Dimensions.get('window');

interface MediaItem {
  id: string;
  uri: string;
  type: 'image' | 'video';
  filename: string;
  size: number;
}

interface CreatePostOptimizedProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (postData: any) => void;
  loading?: boolean;
}

export const CreatePostOptimized: React.FC<CreatePostOptimizedProps> = ({
  visible,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [locationDetails, setLocationDetails] = useState<any>(null);
  const [isMeetupRequest, setIsMeetupRequest] = useState(false);
  const [meetupDetails, setMeetupDetails] = useState({
    title: '',
    date: '',
    maxPeople: 10,
  });
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' | 'warning' });

  const textInputRef = useRef<any>(null);

  // Show toast
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ visible: true, message, type });
  };

  // Hide toast
  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Handle media selection
  const handleMediaSelect = (selectedMedia: MediaItem[]) => {
    setMedia(selectedMedia);
  };

  // Handle location selection
  const handleLocationSelect = (location: any) => {
    setLocationDetails(location);
  };

  // Handle meetup toggle
  const handleMeetupToggle = () => {
    setIsMeetupRequest(!isMeetupRequest);
  };

  // Handle submit
  const handleSubmit = () => {
    if (!content.trim() && media.length === 0) {
      showToast('请输入内容或添加图片', 'warning');
      return;
    }

    if (isMeetupRequest && (!meetupDetails.title || !meetupDetails.date)) {
      showToast('请填写聚会标题和日期', 'warning');
      return;
    }

    const postData = {
      content: content.trim(),
      media,
      locationDetails,
      isMeetupRequest,
      meetupDetails: isMeetupRequest ? meetupDetails : undefined,
    };

    onSubmit(postData);
  };

  // Handle close
  const handleClose = () => {
    setContent('');
    setMedia([]);
    setLocationDetails(null);
    setIsMeetupRequest(false);
    setMeetupDetails({ title: '', date: '', maxPeople: 10 });
    onClose();
  };

  // Remove media item
  const removeMedia = (mediaId: string) => {
    setMedia(media.filter(item => item.id !== mediaId));
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleClose}
        contentContainerStyle={styles.modalContainer}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <Surface style={styles.modalSurface}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <IconButton icon="close" size={24} iconColor={colors.textSecondary} />
              </TouchableOpacity>
              
              <Title style={styles.headerTitle}>分享动态</Title>
              
              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading || (!content.trim() && media.length === 0)}
                style={styles.submitButton}
                labelStyle={styles.submitButtonLabel}
              >
                发布
              </Button>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* User Info */}
              <View style={styles.userInfo}>
                <Avatar.Image
                  size={48}
                  source={user?.avatar_url ? { uri: user.avatar_url } : undefined}
                  style={styles.userAvatar}
                />
                <View style={styles.userDetails}>
                  <Title style={styles.userName}>{user?.nickname || '用户'}</Title>
                  <Paragraph style={styles.userLocation}>
                    {locationDetails?.name || '选择位置'}
                  </Paragraph>
                </View>
              </View>

              {/* Content Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  ref={textInputRef}
                  mode="outlined"
                  placeholder="分享你的想法..."
                  value={content}
                  onChangeText={setContent}
                  multiline
                  numberOfLines={4}
                  style={styles.textInput}
                  outlineStyle={styles.textInputOutline}
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              {/* Media Preview */}
              {media.length > 0 && (
                <View style={styles.mediaPreviewContainer}>
                  <View style={styles.mediaPreview}>
                    {media.map((item) => (
                      <View key={item.id} style={styles.mediaItem}>
                        <Image source={{ uri: item.uri }} style={styles.mediaImage} />
                        <TouchableOpacity
                          style={styles.removeMediaButton}
                          onPress={() => removeMedia(item.id)}
                        >
                          <IconButton icon="close" size={16} iconColor={colors.white} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Meetup Details */}
              {isMeetupRequest && (
                <View style={styles.meetupContainer}>
                  <Surface style={styles.meetupCard}>
                    <Title style={styles.meetupTitle}>聚会详情</Title>
                    
                    <TextInput
                      mode="outlined"
                      placeholder="聚会标题"
                      value={meetupDetails.title}
                      onChangeText={(text) => setMeetupDetails(prev => ({ ...prev, title: text }))}
                      style={styles.meetupInput}
                      outlineStyle={styles.meetupInputOutline}
                    />
                    
                    <TextInput
                      mode="outlined"
                      placeholder="聚会日期"
                      value={meetupDetails.date}
                      onChangeText={(text) => setMeetupDetails(prev => ({ ...prev, date: text }))}
                      style={styles.meetupInput}
                      outlineStyle={styles.meetupInputOutline}
                    />
                    
                    <TextInput
                      mode="outlined"
                      placeholder="最大人数"
                      value={meetupDetails.maxPeople.toString()}
                      onChangeText={(text) => setMeetupDetails(prev => ({ ...prev, maxPeople: parseInt(text) || 10 }))}
                      keyboardType="numeric"
                      style={styles.meetupInput}
                      outlineStyle={styles.meetupInputOutline}
                    />
                  </Surface>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <MediaPicker onSelect={handleMediaSelect} />
                  <Paragraph style={styles.actionButtonText}>图片</Paragraph>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <LocationShare onLocationSelect={handleLocationSelect} />
                  <Paragraph style={styles.actionButtonText}>位置</Paragraph>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionButton, isMeetupRequest && styles.activeActionButton]}
                  onPress={handleMeetupToggle}
                >
                  <IconButton 
                    icon="calendar-multiple" 
                    size={24} 
                    iconColor={isMeetupRequest ? colors.primary : colors.textSecondary} 
                  />
                  <Paragraph style={[styles.actionButtonText, isMeetupRequest && styles.activeActionButtonText]}>
                    聚会
                  </Paragraph>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Surface>
        </KeyboardAvoidingView>

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
    margin: 0,
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  modalSurface: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  closeButton: {
    marginRight: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.textPrimary,
  },
  submitButton: {
    borderRadius: borderRadius.lg,
    marginLeft: spacing.sm,
  },
  submitButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  userAvatar: {
    marginRight: spacing.md,
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
  userLocation: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  textInput: {
    backgroundColor: colors.white,
    fontSize: 16,
    lineHeight: 24,
  },
  textInputOutline: {
    borderRadius: borderRadius.lg,
    borderColor: colors.gray200,
  },
  mediaPreviewContainer: {
    marginBottom: spacing.lg,
  },
  mediaPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  mediaItem: {
    position: 'relative',
    width: (width - spacing.md * 2 - spacing.sm * 2) / 3,
    height: (width - spacing.md * 2 - spacing.sm * 2) / 3,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.md,
  },
  removeMediaButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: borderRadius.full,
  },
  meetupContainer: {
    marginBottom: spacing.lg,
  },
  meetupCard: {
    backgroundColor: colors.gray50,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  meetupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  meetupInput: {
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
  },
  meetupInputOutline: {
    borderRadius: borderRadius.md,
    borderColor: colors.gray200,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  activeActionButton: {
    backgroundColor: colors.primaryLight,
  },
  actionButtonText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  activeActionButtonText: {
    color: colors.primary,
    fontWeight: '500',
  },
});
