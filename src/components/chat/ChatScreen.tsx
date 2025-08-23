import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import {
  Surface,
  Title,
  Paragraph,
  TextInput,
  Button,
  Avatar,
  IconButton,
  Divider,
} from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, borderRadius } from '../../utils/responsive';
import { shadowPresets } from '../../utils/platformStyles';
import { ToastOptimized } from '../common/ToastOptimized';
import LoadingSpinner from '../common/LoadingSpinner';
import { DatabaseService } from '../../services/databaseService';

const { width, height } = Dimensions.get('window');

interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  is_read: boolean;
}

interface ChatUser {
  id: string;
  nickname: string;
  avatar_url?: string;
  is_online: boolean;
  last_seen: string;
}

interface ChatScreenProps {
  route?: {
    params?: {
      userId?: string;
      userNickname?: string;
      userAvatar?: string;
    };
  };
  navigation?: any;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [chatUser, setChatUser] = useState<ChatUser | null>(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' | 'warning' });

  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  // Show toast
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ visible: true, message, type });
  };

  // Hide toast
  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Initialize chat user from route params
  useEffect(() => {
    if (route?.params?.userId) {
      setChatUser({
        id: route.params.userId,
        nickname: route.params.userNickname || 'Unknown User',
        avatar_url: route.params.userAvatar,
        is_online: true,
        last_seen: new Date().toISOString(),
      });
    }
  }, [route?.params]);

  // Load messages
  const loadMessages = async () => {
    if (!user || !chatUser) return;

    setLoading(true);
    try {
      // Get messages between current user and chat user
      const messagesData = await DatabaseService.getMessages(user.id, chatUser.id);
      setMessages(messagesData);
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
      showToast('Failed to load messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load messages on mount and when chat user changes
  useEffect(() => {
    loadMessages();
  }, [user, chatUser]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !chatUser || sending) return;

    setSending(true);
    try {
      const messageData = {
        from_user_id: user.id,
        to_user_id: chatUser.id,
        content: newMessage.trim(),
      };

      const newMsg = await DatabaseService.sendMessage(messageData);
      
      if (newMsg) {
        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
        
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  // Format time
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '--:--';
    }
  };

  // Render message item
  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwnMessage = item.sender_id === user?.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        <Surface style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble
        ]}>
          <Paragraph style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Paragraph>
          <Paragraph style={[
            styles.messageTime,
            isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
          ]}>
            {formatTime(item.created_at)}
          </Paragraph>
        </Surface>
      </View>
    );
  };

  // Render header
  const renderHeader = () => (
    <Surface style={styles.header}>
      <View style={styles.headerContent}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation?.goBack()}
          style={styles.backButton}
        />
        
        <Avatar.Image
          size={40}
          source={chatUser?.avatar_url ? { uri: chatUser.avatar_url } : undefined}
          style={styles.headerAvatar}
        />
        
        <View style={styles.headerInfo}>
          <Title style={styles.headerTitle}>{chatUser?.nickname}</Title>
          <Paragraph style={styles.headerStatus}>
            {chatUser?.is_online ? '在线' : '离线'}
          </Paragraph>
        </View>
        
        <IconButton
          icon="dots-vertical"
          size={24}
          onPress={() => showToast('更多选项功能开发中', 'info')}
        />
      </View>
    </Surface>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <LoadingSpinner visible={true} message="加载消息中..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <Surface style={styles.inputSurface}>
          <TextInput
            mode="outlined"
            placeholder="输入消息..."
            value={newMessage}
            onChangeText={setNewMessage}
            style={styles.textInput}
            outlineStyle={styles.textInputOutline}
            multiline
            maxLength={500}
            disabled={sending}
          />
          
          <IconButton
            icon="send"
            size={24}
            onPress={sendMessage}
            disabled={!newMessage.trim() || sending}
            style={styles.sendButton}
            iconColor={newMessage.trim() && !sending ? colors.primary : colors.textTertiary}
          />
        </Surface>
      </KeyboardAvoidingView>

      <ToastOptimized
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    ...shadowPresets.small,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  backButton: {
    marginRight: spacing.sm,
  },
  headerAvatar: {
    marginRight: spacing.sm,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerStatus: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
  },
  messageContainer: {
    marginBottom: spacing.sm,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: width * 0.7,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  ownBubble: {
    backgroundColor: colors.primary,
  },
  otherBubble: {
    backgroundColor: colors.gray100,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  ownMessageText: {
    color: colors.white,
  },
  otherMessageText: {
    color: colors.textPrimary,
  },
  messageTime: {
    fontSize: 10,
    marginTop: spacing.xs,
  },
  ownMessageTime: {
    color: colors.white,
    opacity: 0.8,
  },
  otherMessageTime: {
    color: colors.textSecondary,
  },
  inputContainer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  inputSurface: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.sm,
  },
  textInput: {
    flex: 1,
    marginRight: spacing.sm,
    backgroundColor: colors.white,
  },
  textInputOutline: {
    borderRadius: borderRadius.lg,
    borderColor: colors.gray200,
  },
  sendButton: {
    margin: 0,
  },
});

export default ChatScreen; 