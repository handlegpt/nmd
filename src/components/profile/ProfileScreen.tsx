import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Avatar,
  Button,
  Switch,
  TextInput,
  Chip,
  IconButton,
  Badge,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/authStore';
import { shadowPresets } from '../../utils/platformStyles';
import { DatabaseService } from '../../services/databaseService';

export const ProfileScreen: React.FC = ({ navigation }: { navigation?: any }) => {
  const { user, updateProfile, signOut } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [currentCity, setCurrentCity] = useState(user?.current_city || '');
  const [isVisible, setIsVisible] = useState(user?.is_visible ?? true);
  const [isAvailableForMeetup, setIsAvailableForMeetup] = useState(
    user?.is_available_for_meetup ?? true
  );
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load notification count
  const loadNotificationCount = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const notifications = await DatabaseService.getNotifications(user.id);
      const unreadCount = notifications.filter(n => !n.is_read).length;
      setNotificationCount(unreadCount);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load notification count on component mount
  React.useEffect(() => {
    loadNotificationCount();
  }, [user]);

  // Save profile changes
  const handleSave = async () => {
    if (!user) return;
    
    try {
      // Update in database
      const updatedUser = await DatabaseService.updateUser(user.id, {
        nickname,
        bio,
        current_city: currentCity,
        is_visible: isVisible,
        is_available_for_meetup: isAvailableForMeetup,
      });

      if (updatedUser) {
        // Update local state
        await updateProfile({
          nickname,
          bio,
          current_city: currentCity,
          is_visible: isVisible,
          is_available_for_meetup: isAvailableForMeetup,
        });
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  // Handle image picker for avatar
  const handlePickImage = async () => {
    if (!user) return;
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // Create a file object from the image URI
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();
        const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
        
        // Upload to database storage
        const avatarUrl = await DatabaseService.uploadFile(file, `avatars/${user.id}/avatar.jpg`);
        
        if (avatarUrl) {
          // Update user profile with new avatar URL
          const updatedUser = await DatabaseService.updateUser(user.id, {
            avatar_url: avatarUrl,
          });
          
          if (updatedUser) {
            await updateProfile({ avatar_url: avatarUrl });
            Alert.alert('Success', 'Avatar updated successfully');
          }
        } else {
          Alert.alert('Error', 'Failed to upload avatar');
        }
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', 'Failed to upload avatar');
    }
  };

  // Handle sign out
  const handleSignOut = () => {
    Alert.alert(
      'Confirm Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: signOut },
      ]
    );
  };

  // Handle sign in navigation
  const handleSignIn = () => {
    if (navigation) {
      navigation.navigate('Login');
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Welcome to NomadNow</Title>
            <Paragraph style={styles.subtitle}>
              Sign in to access your profile and connect with fellow digital nomads
            </Paragraph>
            <Button 
              mode="contained" 
              onPress={handleSignIn} 
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              Sign In
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.avatarSection}>
              {user.avatar_url ? (
                <Avatar.Image
                  size={80}
                  source={{ uri: user.avatar_url }}
                />
              ) : (
                <Avatar.Text
                  size={80}
                  label={user.nickname.charAt(0).toUpperCase()}
                  style={{ backgroundColor: '#6366f1' }}
                />
              )}
              <View style={styles.headerInfo}>
                <Title>{user.nickname}</Title>
                <Paragraph>{user.current_city}</Paragraph>
                <Button
                  mode="text"
                  onPress={handlePickImage}
                  style={styles.changeAvatarButton}
                >
                  Change Avatar
                </Button>
              </View>
            </View>
            <View style={styles.notificationSection}>
              <IconButton
                icon="bell"
                size={24}
                onPress={async () => {
                  if (!user) return;
                  
                  try {
                    const notifications = await DatabaseService.getNotifications(user.id);
                    const notificationList = notifications
                      .slice(0, 5)
                      .map(n => `${n.title}: ${n.message}`)
                      .join('\n\n');
                    
                    Alert.alert(
                      'Notifications', 
                      notifications.length > 0 
                        ? notificationList 
                        : 'No notifications'
                    );
                  } catch (error) {
                    console.error('Error loading notifications:', error);
                    Alert.alert('Error', 'Failed to load notifications');
                  }
                }}
              />
              {notificationCount > 0 && (
                <Badge
                  size={20}
                  style={styles.notificationBadge}
                >
                  {notificationCount}
                </Badge>
              )}
            </View>
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              <TextInput
                label="Nickname"
                value={nickname}
                onChangeText={setNickname}
                style={styles.input}
                mode="outlined"
              />

              <TextInput
                label="Bio"
                value={bio}
                onChangeText={setBio}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={3}
              />

              <TextInput
                label="Current City"
                value={currentCity}
                onChangeText={setCurrentCity}
                style={styles.input}
                mode="outlined"
              />

              <View style={styles.switchContainer}>
                <Paragraph>Visible on Map</Paragraph>
                <Switch
                  value={isVisible}
                  onValueChange={setIsVisible}
                />
              </View>

              <View style={styles.switchContainer}>
                <Paragraph>Available for Meetup</Paragraph>
                <Switch
                  value={isAvailableForMeetup}
                  onValueChange={setIsAvailableForMeetup}
                />
              </View>

              <View style={styles.editActions}>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  style={styles.saveButton}
                >
                  Save
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </View>
            </View>
          ) : (
            <View style={styles.info}>
              {user.bio && (
                <Paragraph style={styles.bio}>{user.bio}</Paragraph>
              )}

              <View style={styles.languagesContainer}>
                <Title style={styles.sectionTitle}>Languages</Title>
                <View style={styles.chipContainer}>
                  {user.languages.map((lang, index) => (
                    <Chip key={index} style={styles.chip}>
                      {lang}
                    </Chip>
                  ))}
                </View>
              </View>

              <View style={styles.interestsContainer}>
                <Title style={styles.sectionTitle}>Interests</Title>
                <View style={styles.chipContainer}>
                  {user.interests.map((interest, index) => (
                    <Chip key={index} style={styles.chip} mode="outlined">
                      {interest}
                    </Chip>
                  ))}
                </View>
              </View>

              <View style={styles.statusContainer}>
                <View style={styles.statusItem}>
                  <Paragraph>Map Visible</Paragraph>
                  <Switch value={user.is_visible} disabled />
                </View>
                <View style={styles.statusItem}>
                  <Paragraph>Available for Meetup</Paragraph>
                  <Switch value={user.is_available_for_meetup} disabled />
                </View>
              </View>

              <Button
                mode="contained"
                onPress={() => setIsEditing(true)}
                style={styles.editButton}
              >
                Edit Profile
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Account Settings</Title>
          <Button
            mode="outlined"
            onPress={handleSignOut}
            style={styles.signOutButton}
          >
            Sign Out
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    ...shadowPresets.medium,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationSection: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#F44336',
  },
  headerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  changeAvatarButton: {
    marginTop: 8,
  },
  editForm: {
    marginTop: 16,
  },
  input: {
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  saveButton: {
    flex: 1,
    marginRight: 8,
  },
  info: {
    marginTop: 16,
  },
  bio: {
    marginBottom: 16,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  languagesContainer: {
    marginBottom: 16,
  },
  interestsContainer: {
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 8,
    marginBottom: 4,
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  editButton: {
    marginTop: 8,
  },
  signOutButton: {
    marginTop: 8,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  button: {
    marginTop: 10,
  },
  buttonContent: {
    height: 50,
  },
}); 