import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  FAB,
} from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import { useResponsive } from '../../utils/responsive';
import { colors, spacing } from '../../utils/responsive';
import ResponsiveContainer from '../common/ResponsiveContainer';
import { ToastOptimized } from '../common/ToastOptimized';
import LoadingSpinner from '../common/LoadingSpinner';
import { DatabaseService } from '../../services/databaseService';
import { PostService, Post } from '../../services/postService';
import { FeedCardOptimized } from './FeedCardOptimized';
import { CreatePostOptimized } from './CreatePostOptimized';
import CommentModal from './CommentModal';
import ShareModal from './ShareModal';

const FeedScreenOptimized: React.FC = () => {
  const { user } = useAuthStore();
  const { isPhone } = useResponsive();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' | 'warning' });

  // Show toast message
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ visible: true, message, type });
  };

  // Hide toast message
  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Load posts from PostService
  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const postsData = await PostService.getPosts();
      setPosts(postsData);
    } catch (error) {
      console.error('Error loading posts:', error);
      showToast('加载帖子失败', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadPosts();
    } finally {
      setRefreshing(false);
    }
  }, [loadPosts]);

  // Handle like post
  const handleLikePost = async (postId: string) => {
    if (!user) {
      showToast('请先登录后点赞', 'warning');
      return;
    }

    try {
      const success = await DatabaseService.likePost(postId);
      if (success) {
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return { ...post, likes: (post.likes || 0) + 1 };
          }
          return post;
        }));
        showToast('点赞成功', 'success');
      }
    } catch (error) {
      console.error('Error liking post:', error);
      showToast('点赞失败', 'error');
    }
  };

  // Handle comment
  const handleComment = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setSelectedPost(post);
      setCommentModalVisible(true);
    }
  };

  // Handle share
  const handleShare = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setSelectedPost(post);
      setShareModalVisible(true);
    }
  };

  // Handle create post
  const handleCreatePost = async (postData: any) => {
    if (!user) {
      showToast('请先登录', 'warning');
      return;
    }

    try {
      const newPost = await DatabaseService.createPost({
        user_id: user.id,
        content: postData.content,
        media_urls: postData.media?.map((item: any) => item.uri) || [],
        location: postData.locationDetails ? {
          latitude: postData.locationDetails.coordinates.latitude,
          longitude: postData.locationDetails.coordinates.longitude,
          city: postData.locationDetails.name,
          country: postData.locationDetails.address.split(', ').pop() || '',
        } : undefined,
        meetup_details: postData.isMeetupRequest ? {
          title: postData.meetupDetails.title,
          date_time: postData.meetupDetails.date,
          location: {
            latitude: postData.locationDetails?.coordinates?.latitude || 0,
            longitude: postData.locationDetails?.coordinates?.longitude || 0,
            city: postData.locationDetails?.name || '',
            country: postData.locationDetails?.address?.split(', ').pop() || '',
          },
          max_participants: postData.meetupDetails.maxPeople,
          current_participants: 1,
        } : undefined,
        likes: 0,
        comments: [],
      });

      if (newPost) {
        const transformedPost: Post = {
          id: newPost.id,
          userId: newPost.user_id,
          userNickname: user.nickname,
          userAvatar: user.avatar_url || '',
          content: newPost.content,
          location: newPost.location?.city || '未知位置',
          locationDetails: newPost.location ? {
            name: newPost.location.city,
            address: `${newPost.location.city}, ${newPost.location.country}`,
            coordinates: {
              latitude: newPost.location.latitude,
              longitude: newPost.location.longitude,
            },
          } : undefined,
          media: newPost.media_urls?.map((url, index) => ({
            id: `${newPost.id}-media-${index}`,
            uri: url,
            type: 'image' as const,
            filename: `media-${index}.jpg`,
            size: 0,
          })) || [],
          isMeetupRequest: !!newPost.meetup_details,
          meetupDetails: newPost.meetup_details ? {
            title: newPost.meetup_details.title,
            date: newPost.meetup_details.date_time,
            location: `${newPost.meetup_details.location.city}, ${newPost.meetup_details.location.country}`,
            maxPeople: newPost.meetup_details.max_participants,
            currentPeople: newPost.meetup_details.current_participants,
          } : undefined,
          likes: newPost.likes,
          comments: newPost.comments || [],
          createdAt: newPost.created_at,
          tags: [],
          emotion: undefined,
          topic: undefined,
        };

        setPosts([transformedPost, ...posts]);
        setModalVisible(false);
        showToast('发布成功', 'success');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      showToast('发布失败', 'error');
    }
  };

  // Load posts on mount
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  if (loading) {
    return (
      <ResponsiveContainer>
        <LoadingSpinner visible={true} message="加载中..." />
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer>
      <View style={styles.container}>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FeedCardOptimized
              post={item}
              onLike={handleLikePost}
              onComment={handleComment}
              onShare={handleShare}
              compact={isPhone}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />

        {/* Create Post FAB */}
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        />

        {/* Create Post Modal */}
        <CreatePostOptimized
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={handleCreatePost}
          loading={false}
        />

        <CommentModal
          visible={commentModalVisible}
          post={selectedPost}
          onDismiss={() => {
            setCommentModalVisible(false);
            setSelectedPost(null);
          }}
          onCommentAdded={() => {
            // Refresh posts to show new comment count
            loadPosts();
          }}
        />

        <ShareModal
          visible={shareModalVisible}
          post={selectedPost}
          onDismiss={() => {
            setShareModalVisible(false);
            setSelectedPost(null);
          }}
        />

        <ToastOptimized
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />
      </View>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    padding: spacing.md,
  },
  fab: {
    position: 'absolute',
    margin: spacing.base,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    borderRadius: 9999,
    zIndex: 1000,
  },
});

export default FeedScreenOptimized;
