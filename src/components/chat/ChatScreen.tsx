import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Avatar,
  IconButton,
  Divider,
} from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import { Message, User } from '../../types';
import Toast from '../common/Toast';
import LoadingSpinner from '../common/LoadingSpinner';
import { supabase } from '../../lib/supabase';

export const ChatScreen: React.FC<any> = ({ route }) => {
  const { selectedUser } = route?.params || {};
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' | 'warning' });
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (selectedUser) {
      loadMessages();
      // Set up real-time subscription
      const subscription = supabase
        .channel('messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `from_user_id=eq.${user?.id} OR to_user_id=eq.${user?.id}`,
        }, (payload) => {
          const newMessage = payload.new as Message;
          if (newMessage.from_user_id === selectedUser.id || newMessage.to_user_id === selectedUser.id) {
            setMessages(prev => [...prev, newMessage]);
            scrollToBottom();
          }
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedUser?.id]);

  // Show toast message
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ visible: true, message, type });
  };

  // Hide toast message
  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  // Load messages from database
  const loadMessages = async () => {
    if (!user || !selectedUser) return;

    setLoading(true);
    try {
      // TODO: Implement actual message loading from Supabase
      // For now, using mock data
      const mockMessages: Message[] = [
        {
          id: '1',
          from_user_id: selectedUser.id,
          to_user_id: user.id,
          content: 'Hi! I saw you\'re also a digital nomad in this area.',
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '2',
          from_user_id: user.id,
          to_user_id: selectedUser.id,
          content: 'Hey! Yes, I\'ve been here for a few weeks. How about you?',
          created_at: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          id: '3',
          from_user_id: selectedUser.id,
          to_user_id: user.id,
          content: 'Great! Would you like to meet for coffee sometime?',
          created_at: new Date(Date.now() - 900000).toISOString(),
        },
      ];
      setMessages(mockMessages);
    } catch (error) {
      showToast('Failed to load messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedUser) return;

    setSending(true);
    const message: Message = {
      id: Date.now().toString(),
      from_user_id: user.id,
      to_user_id: selectedUser.id,
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
    };

    try {
      // TODO: Implement actual message sending to Supabase
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      showToast('Message sent!', 'success');
      scrollToBottom();
    } catch (error) {
      showToast('Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Check if message is from current user
  const isFromCurrentUser = (message: Message) => {
    return message.from_user_id === user?.id;
  };

  // Render message item
  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      isFromCurrentUser(item) ? styles.sentMessage : styles.receivedMessage
    ]}>
      <Card style={[
        styles.messageCard,
        isFromCurrentUser(item) ? styles.sentCard : styles.receivedCard
      ]}>
        <Card.Content style={styles.messageContent}>
          <Paragraph style={styles.messageText}>{item.content}</Paragraph>
          <Paragraph style={styles.timestamp}>
            {formatTime(item.created_at)}
          </Paragraph>
        </Card.Content>
      </Card>
    </View>
  );

  if (!selectedUser) {
    return (
      <View style={styles.container}>
        <Card style={styles.headerCard}>
          <Card.Content>
            <Title>No User Selected</Title>
            <Paragraph>Please select a user to start chatting.</Paragraph>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <Card style={styles.headerCard}>
        <Card.Content style={styles.headerContent}>
          <Avatar.Image
            size={40}
            source={{ uri: selectedUser.avatar_url || 'https://via.placeholder.com/40' }}
          />
          <View style={styles.headerInfo}>
            <Title style={styles.headerTitle}>{selectedUser.nickname}</Title>
            <Paragraph style={styles.headerSubtitle}>{selectedUser.current_city}</Paragraph>
          </View>
        </Card.Content>
      </Card>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          style={styles.textInput}
          mode="outlined"
          multiline
          maxLength={500}
        />
        <IconButton
          icon="send"
          size={24}
          onPress={sendMessage}
          disabled={!newMessage.trim() || sending}
          loading={sending}
          style={styles.sendButton}
        />
      </View>

      {/* Toast for user feedback */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {/* Loading spinner */}
      <LoadingSpinner visible={loading} message="Loading messages..." />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    margin: 16,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginVertical: 4,
  },
  sentMessage: {
    alignItems: 'flex-end',
  },
  receivedMessage: {
    alignItems: 'flex-start',
  },
  messageCard: {
    maxWidth: '80%',
  },
  sentCard: {
    backgroundColor: '#2196f3',
  },
  receivedCard: {
    backgroundColor: '#fff',
  },
  messageContent: {
    padding: 8,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    marginRight: 8,
  },
  sendButton: {
    margin: 0,
  },
});

export default ChatScreen; 