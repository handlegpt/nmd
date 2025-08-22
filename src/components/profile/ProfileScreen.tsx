import React, { useState, useEffect } from 'react';
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
  Surface,
  Portal,
  Modal,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { shadowPresets } from '../../utils/platformStyles';
import { DatabaseService } from '../../services/databaseService';
import Toast from '../common/Toast';
import LoadingSpinner from '../common/LoadingSpinner';

export const ProfileScreen: React.FC = ({ navigation }: { navigation?: any }) => {
  const { user, updateProfile, signOut } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    nickname: '',
    full_name: '',
    bio: '',
    current_city: '',
    phone: '',
    website: '',
    skills: [] as string[],
  });

  // Toast state
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Load user profile data
  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const profile = await DatabaseService.getUserProfile(user.id);
      const followersList = await DatabaseService.getFollowers(user.id);
      const followingList = await DatabaseService.getFollowing(user.id);

      if (profile) {
        setUserProfile(profile);
        setFormData({
          nickname: profile.nickname || '',
          full_name: profile.full_name || '',
          bio: profile.bio || '',
          current_city: profile.current_city || '',
          phone: profile.phone || '',
          website: profile.website || '',
          skills: profile.skills || [],
        });
      }

      setFollowers(followersList);
      setFollowing(followingList);
    } catch (error) {
      console.error('Error loading user profile:', error);
      showToast('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  // Save profile changes
  const handleSave = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const updatedUser = await DatabaseService.updateUserProfile(user.id, {
        nickname: formData.nickname,
        full_name: formData.full_name,
        bio: formData.bio,
        current_city: formData.current_city,
        phone: formData.phone,
        website: formData.website,
        skills: formData.skills,
      });

      if (updatedUser) {
        await updateProfile(updatedUser);
        setUserProfile(updatedUser);
        setIsEditing(false);
        showToast('Profile updated successfully');
      } else {
        showToast('Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
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
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();
        const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
        
        const avatarUrl = await DatabaseService.uploadFile(file, `avatars/${user.id}/avatar.jpg`);
        
        if (avatarUrl) {
          const updatedUser = await DatabaseService.updateUser(user.id, {
            avatar_url: avatarUrl,
          });
          
          if (updatedUser) {
            await updateProfile({ avatar_url: avatarUrl });
            showToast('Avatar updated successfully');
          }
        } else {
          showToast('Failed to upload avatar', 'error');
        }
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      showToast('Failed to upload avatar', 'error');
    }
  };

  // Handle follow/unfollow
  const handleFollowToggle = async (targetUserId: string) => {
    if (!user) return;

    try {
      const isFollowing = await DatabaseService.isFollowing(user.id, targetUserId);
      
      if (isFollowing) {
        const success = await DatabaseService.unfollowUser(user.id, targetUserId);
        if (success) {
          showToast('Unfollowed successfully');
          loadUserProfile();
        }
      } else {
        const follow = await DatabaseService.followUser(user.id, targetUserId);
        if (follow) {
          showToast('Followed successfully');
          loadUserProfile();
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      showToast('Failed to update follow status', 'error');
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
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <Card style={styles.heroCard}>
            <Card.Content style={styles.heroContent}>
              <View style={styles.heroIcon}>
                <MaterialCommunityIcons 
                  name="account-group" 
                  size={80} 
                  color="#6366f1" 
                />
              </View>
              <Title style={styles.heroTitle}>Join the Nomad Community</Title>
              <Paragraph style={styles.heroSubtitle}>
                Connect with digital nomads worldwide, share experiences, and discover amazing places together
              </Paragraph>
            </Card.Content>
          </Card>

          {/* Features Section */}
          <Card style={styles.featuresCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Why Join NomadNow?</Title>
              
              <View style={styles.featureItem}>
                <MaterialCommunityIcons name="map-marker-radius" size={24} color="#6366f1" />
                <View style={styles.featureText}>
                  <Title style={styles.featureTitle}>Discover Amazing Places</Title>
                  <Paragraph style={styles.featureDescription}>
                    Find the best cities for digital nomads with detailed guides and community insights
                  </Paragraph>
                </View>
              </View>

              <View style={styles.featureItem}>
                <MaterialCommunityIcons name="account-multiple" size={24} color="#6366f1" />
                <View style={styles.featureText}>
                  <Title style={styles.featureTitle}>Connect with Nomads</Title>
                  <Paragraph style={styles.featureDescription}>
                    Meet fellow travelers, share experiences, and build meaningful connections
                  </Paragraph>
                </View>
              </View>

              <View style={styles.featureItem}>
                <MaterialCommunityIcons name="calendar-multiple" size={24} color="#6366f1" />
                <View style={styles.featureText}>
                  <Title style={styles.featureTitle}>Join Meetups & Events</Title>
                  <Paragraph style={styles.featureDescription}>
                    Participate in local meetups, coworking sessions, and community events
                  </Paragraph>
                </View>
              </View>

              <View style={styles.featureItem}>
                <MaterialCommunityIcons name="share-variant" size={24} color="#6366f1" />
                <View style={styles.featureText}>
                  <Title style={styles.featureTitle}>Share Your Journey</Title>
                  <Paragraph style={styles.featureDescription}>
                    Document your travels, share tips, and inspire others with your stories
                  </Paragraph>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Community Stats */}
          <Card style={styles.statsCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Our Community</Title>
              <View style={styles.communityStats}>
                <View style={styles.statItem}>
                  <Title style={styles.statNumber}>10K+</Title>
                  <Paragraph style={styles.statLabel}>Nomads</Paragraph>
                </View>
                <View style={styles.statItem}>
                  <Title style={styles.statNumber}>150+</Title>
                  <Paragraph style={styles.statLabel}>Cities</Paragraph>
                </View>
                <View style={styles.statItem}>
                  <Title style={styles.statNumber}>500+</Title>
                  <Paragraph style={styles.statLabel}>Meetups</Paragraph>
                </View>
                <View style={styles.statItem}>
                  <Title style={styles.statNumber}>50+</Title>
                  <Paragraph style={styles.statLabel}>Countries</Paragraph>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Testimonials */}
          <Card style={styles.testimonialsCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>What Nomads Say</Title>
              
              <View style={styles.testimonialItem}>
                <Avatar.Text size={40} label="S" style={{ backgroundColor: '#6366f1' }} />
                <View style={styles.testimonialContent}>
                  <Paragraph style={styles.testimonialText}>
                    "NomadNow helped me find amazing communities in every city I visited. The meetups are incredible!"
                  </Paragraph>
                  <Title style={styles.testimonialAuthor}>- Sarah, Digital Nomad</Title>
                </View>
              </View>

              <View style={styles.testimonialItem}>
                <Avatar.Text size={40} label="M" style={{ backgroundColor: '#10b981' }} />
                <View style={styles.testimonialContent}>
                  <Paragraph style={styles.testimonialText}>
                    "Finally found a platform that connects real nomads. The city guides are spot on!"
                  </Paragraph>
                  <Title style={styles.testimonialAuthor}>- Mike, Remote Developer</Title>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Call to Action */}
          <Card style={styles.ctaCard}>
            <Card.Content style={styles.ctaContent}>
              <Title style={styles.ctaTitle}>Ready to Start Your Journey?</Title>
              <Paragraph style={styles.ctaSubtitle}>
                Join thousands of digital nomads and start exploring the world together
              </Paragraph>
              
              <View style={styles.ctaButtons}>
                <Button 
                  mode="contained" 
                  onPress={handleSignIn} 
                  style={styles.ctaButton}
                  contentStyle={styles.ctaButtonContent}
                  icon="account-plus"
                >
                  Create Account
                </Button>
                
                <Button 
                  mode="outlined" 
                  onPress={() => navigation?.navigate('Login')} 
                  style={styles.ctaButton}
                  contentStyle={styles.ctaButtonContent}
                  icon="login"
                >
                  Sign In
                </Button>
              </View>

              <View style={styles.socialLogin}>
                <Button 
                  mode="outlined" 
                  onPress={() => showToast('Google login coming soon', 'info')} 
                  style={styles.socialButton}
                  contentStyle={styles.socialButtonContent}
                  icon="google"
                >
                  Continue with Google
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </View>
    );
  }

  if (loading) {
    return <LoadingSpinner visible={true} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header Section */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.header}>
              <View style={styles.avatarSection}>
                {user.avatar_url ? (
                  <Avatar.Image
                    size={100}
                    source={{ uri: user.avatar_url }}
                  />
                ) : (
                  <Avatar.Text
                    size={100}
                    label={user.nickname.charAt(0).toUpperCase()}
                    style={{ backgroundColor: '#6366f1' }}
                  />
                )}
                <IconButton
                  icon="camera"
                  size={20}
                  style={styles.cameraButton}
                  onPress={handlePickImage}
                />
              </View>
              
              <View style={styles.headerInfo}>
                <Title style={styles.userName}>
                  {userProfile?.full_name || user.nickname}
                </Title>
                <Paragraph style={styles.userLocation}>
                  {userProfile?.current_city || user.current_city}
                </Paragraph>
                {userProfile?.website && (
                  <Button
                    mode="text"
                    onPress={() => showToast('Website link coming soon', 'warning')}
                    icon="web"
                    style={styles.websiteButton}
                  >
                    Website
                  </Button>
                )}
              </View>
            </View>

            {/* Bio Section */}
            {userProfile?.bio && (
              <View style={styles.bioSection}>
                <Paragraph style={styles.bio}>{userProfile.bio}</Paragraph>
              </View>
            )}

            {/* Stats Section */}
            <View style={styles.statsSection}>
              <View style={styles.statItem}>
                <Title style={styles.statNumber}>0</Title>
                <Paragraph style={styles.statLabel}>Posts</Paragraph>
              </View>
              <View style={styles.statItem}>
                <Title style={styles.statNumber}>{followers.length}</Title>
                <Paragraph style={styles.statLabel}>Followers</Paragraph>
              </View>
              <View style={styles.statItem}>
                <Title style={styles.statNumber}>{following.length}</Title>
                <Paragraph style={styles.statLabel}>Following</Paragraph>
              </View>
              <View style={styles.statItem}>
                <Title style={styles.statNumber}>0</Title>
                <Paragraph style={styles.statLabel}>Countries</Paragraph>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                onPress={() => setIsEditing(true)}
                style={styles.editButton}
                icon="pencil"
              >
                Edit Profile
              </Button>
              
              <Button
                mode="outlined"
                onPress={() => setShowFollowersModal(true)}
                style={styles.followButton}
                icon="account-group"
              >
                Followers ({followers.length})
              </Button>
              
              <Button
                mode="outlined"
                onPress={() => setShowFollowingModal(true)}
                style={styles.followButton}
                icon="account-multiple"
              >
                Following ({following.length})
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Profile Content */}
        <Card style={styles.contentCard}>
          <Card.Content>
            {/* Skills Section */}
            {userProfile?.skills && userProfile.skills.length > 0 && (
              <View style={styles.section}>
                <Title style={styles.sectionTitle}>Skills</Title>
                <View style={styles.chipContainer}>
                  {userProfile.skills.map((skill: string, index: number) => (
                    <Chip key={index} style={styles.chip} mode="outlined">
                      {skill}
                    </Chip>
                  ))}
                </View>
              </View>
            )}

            {/* Languages Section */}
            {user.languages && user.languages.length > 0 && (
              <View style={styles.section}>
                <Title style={styles.sectionTitle}>Languages</Title>
                <View style={styles.chipContainer}>
                  {user.languages.map((lang: string, index: number) => (
                    <Chip key={index} style={styles.chip}>
                      {lang}
                    </Chip>
                  ))}
                </View>
              </View>
            )}

            {/* Interests Section */}
            {user.interests && user.interests.length > 0 && (
              <View style={styles.section}>
                <Title style={styles.sectionTitle}>Interests</Title>
                <View style={styles.chipContainer}>
                  {user.interests.map((interest: string, index: number) => (
                    <Chip key={index} style={styles.chip} mode="outlined">
                      {interest}
                    </Chip>
                  ))}
                </View>
              </View>
            )}

            {/* Privacy Settings */}
            <View style={styles.section}>
              <Title style={styles.sectionTitle}>Privacy Settings</Title>
              <View style={styles.settingItem}>
                <Paragraph>Visible on Map</Paragraph>
                <Switch value={user.is_visible} disabled />
              </View>
              <View style={styles.settingItem}>
                <Paragraph>Available for Meetup</Paragraph>
                <Switch value={user.is_available_for_meetup} disabled />
              </View>
            </View>

            {/* Sign Out Button */}
            <Button
              mode="outlined"
              onPress={handleSignOut}
              style={styles.signOutButton}
              icon="logout"
            >
              Sign Out
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Portal>
        <Modal
          visible={isEditing}
          onDismiss={() => setIsEditing(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView>
            <Title style={styles.modalTitle}>Edit Profile</Title>
            
            <TextInput
              label="Nickname"
              value={formData.nickname}
              onChangeText={(text) => setFormData(prev => ({ ...prev, nickname: text }))}
              style={styles.modalInput}
              mode="outlined"
            />

            <TextInput
              label="Full Name"
              value={formData.full_name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, full_name: text }))}
              style={styles.modalInput}
              mode="outlined"
            />

            <TextInput
              label="Bio"
              value={formData.bio}
              onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
              style={styles.modalInput}
              mode="outlined"
              multiline
              numberOfLines={3}
            />

            <TextInput
              label="Current City"
              value={formData.current_city}
              onChangeText={(text) => setFormData(prev => ({ ...prev, current_city: text }))}
              style={styles.modalInput}
              mode="outlined"
            />

            <TextInput
              label="Phone"
              value={formData.phone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
              style={styles.modalInput}
              mode="outlined"
              keyboardType="phone-pad"
            />

            <TextInput
              label="Website"
              value={formData.website}
              onChangeText={(text) => setFormData(prev => ({ ...prev, website: text }))}
              style={styles.modalInput}
              mode="outlined"
              keyboardType="url"
            />

            <View style={styles.modalActions}>
              <Button
                mode="contained"
                onPress={handleSave}
                style={styles.modalSaveButton}
                loading={loading}
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
          </ScrollView>
        </Modal>
      </Portal>

      {/* Followers Modal */}
      <Portal>
        <Modal
          visible={showFollowersModal}
          onDismiss={() => setShowFollowersModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Title style={styles.modalTitle}>Followers ({followers.length})</Title>
          <ScrollView>
            {followers.length > 0 ? (
              followers.map((follower: any) => (
                <Surface key={follower.id} style={styles.userItem}>
                  <View style={styles.userItemContent}>
                    <Avatar.Image
                      size={40}
                      source={{ uri: follower.avatar_url }}
                    />
                    <View style={styles.userItemInfo}>
                      <Title style={styles.userItemName}>{follower.nickname}</Title>
                      <Paragraph style={styles.userItemLocation}>{follower.current_city}</Paragraph>
                    </View>
                    <Button
                      mode="outlined"
                      onPress={() => handleFollowToggle(follower.id)}
                    >
                      Following
                    </Button>
                  </View>
                </Surface>
              ))
            ) : (
              <Paragraph style={styles.emptyText}>No followers yet</Paragraph>
            )}
          </ScrollView>
        </Modal>
      </Portal>

      {/* Following Modal */}
      <Portal>
        <Modal
          visible={showFollowingModal}
          onDismiss={() => setShowFollowingModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Title style={styles.modalTitle}>Following ({following.length})</Title>
          <ScrollView>
            {following.length > 0 ? (
              following.map((followed: any) => (
                <Surface key={followed.id} style={styles.userItem}>
                  <View style={styles.userItemContent}>
                    <Avatar.Image
                      size={40}
                      source={{ uri: followed.avatar_url }}
                    />
                    <View style={styles.userItemInfo}>
                      <Title style={styles.userItemName}>{followed.nickname}</Title>
                      <Paragraph style={styles.userItemLocation}>{followed.current_city}</Paragraph>
                    </View>
                    <Button
                      mode="outlined"
                      onPress={() => handleFollowToggle(followed.id)}
                    >
                      Unfollow
                    </Button>
                  </View>
                </Surface>
              ))
            ) : (
              <Paragraph style={styles.emptyText}>Not following anyone yet</Paragraph>
            )}
          </ScrollView>
        </Modal>
      </Portal>

      <Toast
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
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    margin: 16,
    ...shadowPresets.medium,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarSection: {
    position: 'relative',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6366f1',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userLocation: {
    color: '#666',
    marginBottom: 8,
  },
  websiteButton: {
    alignSelf: 'flex-start',
  },
  bioSection: {
    marginBottom: 16,
  },
  bio: {
    fontStyle: 'italic',
    lineHeight: 20,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  editButton: {
    flex: 1,
  },
  followButton: {
    flex: 1,
  },
  contentCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    ...shadowPresets.small,
    borderRadius: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  signOutButton: {
    marginTop: 16,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalSaveButton: {
    flex: 1,
    marginRight: 8,
  },
  userItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    ...shadowPresets.small,
  },
  userItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userItemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userItemLocation: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
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
  card: {
    margin: 16,
    ...shadowPresets.medium,
    borderRadius: 12,
  },
  heroCard: {
    margin: 16,
    ...shadowPresets.medium,
    borderRadius: 12,
  },
  heroContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  heroIcon: {
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  featuresCard: {
    margin: 16,
    ...shadowPresets.medium,
    borderRadius: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureText: {
    marginLeft: 15,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
  statsCard: {
    margin: 16,
    ...shadowPresets.medium,
    borderRadius: 12,
  },
  communityStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  testimonialsCard: {
    margin: 16,
    ...shadowPresets.medium,
    borderRadius: 12,
  },
  testimonialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  testimonialContent: {
    marginLeft: 15,
  },
  testimonialText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 5,
  },
  testimonialAuthor: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
  },
  ctaCard: {
    margin: 16,
    ...shadowPresets.medium,
    borderRadius: 12,
  },
  ctaContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  ctaButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    width: '100%',
  },
  ctaButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  ctaButtonContent: {
    height: 50,
  },
  socialLogin: {
    width: '100%',
  },
  socialButton: {
    marginTop: 10,
  },
  socialButtonContent: {
    height: 50,
  },
});
