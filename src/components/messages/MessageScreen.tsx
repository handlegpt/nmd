import React, { useState, useEffect } from 'react';
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
} from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import { Message } from '../../types';
import Toast from '../common/Toast';
import LoadingSpinner from '../common/LoadingSpinner';

export const MessageScreen: React.FC = () => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' | 'warning' });

  useEffect(() => {
    loadMessages();
  }, []);

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
    if (!user) return;

    setLoading(true);
    try {
      // TODO: Implement actual message loading from Supabase
      // For now, using mock data
      const mockMessages: Message[] = [
        {
          id: '1',
          from_user_id: user.id,
          to_user_id: 'other-user-id',
          content: 'Hi! I saw you\'re also a digital nomad in this area.',
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '2',
          from_user_id: 'other-user-id',
          to_user_id: user.id,
          content: 'Hey! Yes, I\'ve been here for a few weeks. How about you?',
          created_at: new Date(Date.now() - 1800000).toISOString(),
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
    if (!newMessage.trim() || !user) return;

    const message: Message = {
      id: Date.now().toString(),
      from_user_id: user.id,
      to_user_id: 'other-user-id',
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
    };

    try {
      // TODO: Implement actual message sending to Supabase
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      showToast('Message sent!', 'success');
    } catch (error) {
      showToast('Failed to send message', 'error');
    }
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

  // Render message item
  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.from_user_id === user?.id;
    
    return (
      <View style={[styles.messageContainer, isOwnMessage ? styles.ownMessage : styles.otherMessage]}>
        <Card style={[styles.messageCard, isOwnMessage ? styles.ownMessageCard : styles.otherMessageCard]}>
          <Card.Content>
            <Paragraph style={styles.messageText}>{item.content}</Paragraph>
            <Paragraph style={styles.messageTime}>
              {formatTime(item.created_at)}
            </Paragraph>
          </Card.Content>
        </Card>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Messages */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        inverted
        showsVerticalScrollIndicator={false}
      />

      {/* Message input */}
      <View style={styles.inputContainer}>
        <TextInput
          mode="outlined"
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          style={styles.messageInput}
          multiline
          maxLength={500}
        />
        <Button
          mode="contained"
          onPress={sendMessage}
          disabled={!newMessage.trim()}
          style={styles.sendButton}
        >
          Send
        </Button>
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
  messagesList: {
    flex: 1,
    padding: 8,
  },
  messageContainer: {
    marginVertical: 4,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageCard: {
    maxWidth: '80%',
  },
  ownMessageCard: {
    backgroundColor: '#2196f3',
  },
  otherMessageCard: {
    backgroundColor: 'white',
  },
  messageText: {
    color: 'white',
  },
  messageTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: 'white',
    alignItems: 'flex-end',
  },
  messageInput: {
    flex: 1,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    paddingHorizontal: 16,
  },
});

export default MessageScreen; 