import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  FAB,
  Card,
  Title,
  Paragraph,
  Avatar,
  Chip,
  Button,
  IconButton,
  useTheme,
  Divider,
  Surface,
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import { useMapStore } from '../../store/mapStore';
import { useAuthStore } from '../../store/authStore';
import { User } from '../../types';
import ResponsiveContainer from '../common/ResponsiveContainer';
import { shadowPresets } from '../../utils/platformStyles';
import Toast from '../common/Toast';
import LoadingSpinner from '../common/LoadingSpinner';
import { DatabaseService } from '../../services/databaseService';
import { LazyImage } from '../common/LazyImage';
import { colors, spacing, borderRadius } from '../../utils/responsive';
import { debounce } from '../../utils/performance';

const { width, height } = Dimensions.get('window');

export const MapScreenOptimized: React.FC = () => {
  const { 
    currentLocation, 
    nearbyUsers, 
    selectedUser, 
    loading, 
    getCurrentLocation, 
    fetchNearbyUsers, 
    setSelectedUser 
  } = useMapStore();
  
  const { user } = useAuthStore();
  const theme = useTheme();
  
  const [toast, setToast] = useState({ 
    visible: false, 
    message: '', 
    type: 'info' as 'success' | 'error' | 'info' | 'warning' 
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Categories for filtering users
  const categories = [
    { id: 'all', label: 'All', icon: 'account-group' },
    { id: 'nearby', label: 'Nearby', icon: 'map-marker-radius' },
    { id: 'online', label: 'Online', icon: 'circle' },
    { id: 'available', label: 'Available', icon: 'calendar-check' },
  ];

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (!query.trim()) {
        setFilteredUsers(nearbyUsers);
        return;
      }

      const filtered = nearbyUsers.filter(user => 
        user.nickname?.toLowerCase().includes(query.toLowerCase()) ||
        user.current_city?.toLowerCase().includes(query.toLowerCase()) ||
        user.skills?.some(skill => skill.toLowerCase().includes(query.toLowerCase())) ||
        user.interests?.some(interest => interest.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }, 300),
    [nearbyUsers]
  );

  // Filter users by category
  const filterUsersByCategory = useCallback((category: string) => {
    setSelectedCategory(category);
    
    switch (category) {
      case 'nearby':
        // Users within 5km (this would need distance calculation)
        setFilteredUsers(nearbyUsers.slice(0, 5));
        break;
      case 'online':
        // Users who were active in the last 30 minutes
        const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
        const onlineUsers = nearbyUsers.filter(user => 
          user.last_active && new Date(user.last_active).getTime() > thirtyMinutesAgo
        );
        setFilteredUsers(onlineUsers);
        break;
      case 'available':
        // Users available for meetups
        const availableUsers = nearbyUsers.filter(user => user.is_available_for_meetup);
        setFilteredUsers(availableUsers);
        break;
      default:
        setFilteredUsers(nearbyUsers);
    }
  }, [nearbyUsers]);

  // Initialize map with current location
  const initializeMap = useCallback(async () => {
    try {
      await getCurrentLocation();
      if (currentLocation && user) {
        // Update user location in database
        await DatabaseService.updateUserLocation(user.id, currentLocation);
        
        // Fetch nearby users from database
        await fetchNearbyUsers(currentLocation.latitude, currentLocation.longitude, 20);
        showToast('Location updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      showToast('Unable to get location. Please check permissions.', 'error');
    }
  }, [currentLocation, user, getCurrentLocation, fetchNearbyUsers]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await initializeMap();
    } finally {
      setIsRefreshing(false);
    }
  }, [initializeMap]);

  // Handle user selection with animation
  const handleUserPress = useCallback((selectedUser: User) => {
    setSelectedUser(selectedUser);
    setShowUserDetails(true);
    
    // Auto-hide details after 5 seconds
    setTimeout(() => {
      setShowUserDetails(false);
    }, 5000);
  }, [setSelectedUser]);

  // Handle greeting functionality
  const handleGreet = useCallback(async (targetUser: User) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) {
      showToast('Please sign in to greet users', 'info');
      return;
    }
    
    try {
      // Create a notification for the greeted user
      await DatabaseService.createNotification({
        user_id: targetUser.id,
        from_user_id: currentUser.id,
        type: 'message',
        title: 'New Greeting',
        message: `${currentUser.nickname} sent you a greeting!`,
        is_read: false,
      });
      
      showToast(`Greeting sent to ${targetUser.nickname}!`, 'success');
    } catch (error) {
      console.error('Error sending greeting:', error);
      showToast('Failed to send greeting', 'error');
    }
  }, []);

  // Handle chat functionality
  const handleChat = useCallback(async (targetUser: User) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) {
      showToast('Please sign in to chat with users', 'info');
      return;
    }
    
    try {
      // Create a notification for the user being chatted with
      await DatabaseService.createNotification({
        user_id: targetUser.id,
        from_user_id: currentUser.id,
        type: 'message',
        title: 'New Message',
        message: `${currentUser.nickname} wants to chat with you!`,
        is_read: false,
      });
      
      showToast(`Opening chat with ${targetUser.nickname}...`, 'info');
      // TODO: Navigate to chat screen
    } catch (error) {
      console.error('Error opening chat:', error);
      showToast('Failed to open chat', 'error');
    }
  }, []);

  // Show toast message
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ visible: true, message, type });
  }, []);

  // Hide toast message
  const hideToast = useCallback(() => {
    setToast({ ...toast, visible: false });
  }, [toast]);

  // Initialize on mount
  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  // Update filtered users when nearbyUsers changes
  useEffect(() => {
    setFilteredUsers(nearbyUsers);
  }, [nearbyUsers]);

  // Handle search query changes
  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // Memoized user cards for better performance
  const userCards = useMemo(() => {
    return filteredUsers.map((user) => (
      <TouchableOpacity
        key={user.id}
        onPress={() => handleUserPress(user)}
        style={styles.userCardContainer}
      >
        <Card style={[styles.userCard, shadowPresets.medium]} mode="outlined">
          <Card.Content style={styles.userCardContent}>
            <View style={styles.userCardHeader}>
              <LazyImage
                source={user.avatar_url ? { uri: user.avatar_url } : undefined}
                width={50}
                height={50}
                priority="normal"
                borderRadius={25}
                placeholder="https://via.placeholder.com/50x50/6366f1/ffffff?text=U"
              />
              <View style={styles.userCardInfo}>
                <Title style={styles.userCardName}>{user.nickname}</Title>
                <Paragraph style={styles.userCardLocation}>
                  {user.current_city || 'Location not set'}
                </Paragraph>
                {user.is_available_for_meetup && (
                  <Chip 
                    icon="calendar-check" 
                    style={styles.availableChip}
                    textStyle={styles.availableChipText}
                  >
                    Available
                  </Chip>
                )}
              </View>
              <View style={styles.userCardActions}>
                <IconButton
                  icon="hand-wave"
                  size={20}
                  onPress={() => handleGreet(user)}
                  iconColor={colors.primary}
                />
                <IconButton
                  icon="message"
                  size={20}
                  onPress={() => handleChat(user)}
                  iconColor={colors.secondary}
                />
              </View>
            </View>
            
            {user.skills && user.skills.length > 0 && (
              <View style={styles.skillsContainer}>
                {user.skills.slice(0, 3).map((skill, index) => (
                  <Chip key={index} style={styles.skillChip} textStyle={styles.skillChipText}>
                    {skill}
                  </Chip>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    ));
  }, [filteredUsers, handleUserPress, handleGreet, handleChat]);

  if (loading) {
    return <LoadingSpinner visible={true} message="Loading nearby nomads..." />;
  }

  return (
    <ResponsiveContainer>
      <View style={styles.container}>
        {/* Header */}
        <Surface style={styles.header} elevation={2}>
          <View style={styles.headerContent}>
            <View style={styles.locationInfo}>
              <IconButton icon="map-marker" size={24} iconColor={colors.primary} />
              <View>
                <Text style={styles.locationTitle}>Nearby Nomads</Text>
                <Text style={styles.locationSubtitle}>
                  {currentLocation ? `${currentLocation.city}, ${currentLocation.country}` : 'Getting location...'}
                </Text>
              </View>
            </View>
            <IconButton
              icon="refresh"
              size={24}
              onPress={handleRefresh}
              iconColor={colors.primary}
            />
          </View>
        </Surface>

        {/* Category Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map((category) => (
            <Chip
              key={category.id}
              selected={selectedCategory === category.id}
              onPress={() => filterUsersByCategory(category.id)}
              style={styles.categoryChip}
              textStyle={styles.categoryChipText}
              icon={category.icon}
            >
              {category.label}
            </Chip>
          ))}
        </ScrollView>

        {/* User List */}
        <ScrollView
          style={styles.userList}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {filteredUsers.length > 0 ? (
            <View style={styles.userListContent}>
              {userCards}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <IconButton icon="account-group" size={64} iconColor={colors.gray} />
              <Text style={styles.emptyTitle}>No nomads nearby</Text>
              <Text style={styles.emptyText}>
                Try refreshing or expanding your search area
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Selected User Details Modal */}
        {selectedUser && showUserDetails && (
          <Surface style={styles.userDetailsModal} elevation={8}>
            <View style={styles.userDetailsContent}>
              <View style={styles.userDetailsHeader}>
                <LazyImage
                  source={selectedUser.avatar_url ? { uri: selectedUser.avatar_url } : undefined}
                  width={80}
                  height={80}
                  priority="high"
                  borderRadius={40}
                  placeholder="https://via.placeholder.com/80x80/6366f1/ffffff?text=U"
                />
                <View style={styles.userDetailsInfo}>
                  <Title style={styles.userDetailsName}>{selectedUser.nickname}</Title>
                  <Paragraph style={styles.userDetailsLocation}>
                    {selectedUser.current_city || 'Location not set'}
                  </Paragraph>
                  {selectedUser.bio && (
                    <Paragraph style={styles.userDetailsBio} numberOfLines={3}>
                      {selectedUser.bio}
                    </Paragraph>
                  )}
                </View>
              </View>
              
              <View style={styles.userDetailsActions}>
                <Button
                  mode="contained"
                  onPress={() => handleGreet(selectedUser)}
                  style={styles.actionButton}
                  icon="hand-wave"
                >
                  Greet
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => handleChat(selectedUser)}
                  style={styles.actionButton}
                  icon="message"
                >
                  Message
                </Button>
              </View>
            </View>
          </Surface>
        )}

        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onDismiss={hideToast}
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
  header: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  locationSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  categoryContainer: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
  },
  categoryContent: {
    paddingHorizontal: spacing.md,
  },
  categoryChip: {
    marginRight: spacing.sm,
  },
  categoryChipText: {
    fontSize: 12,
  },
  userList: {
    flex: 1,
  },
  userListContent: {
    padding: spacing.md,
  },
  userCardContainer: {
    marginBottom: spacing.md,
  },
  userCard: {
    backgroundColor: colors.surface,
  },
  userCardContent: {
    padding: spacing.md,
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  userCardInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  userCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  userCardLocation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  userCardActions: {
    flexDirection: 'row',
  },
  availableChip: {
    backgroundColor: colors.successLight,
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  availableChipText: {
    fontSize: 11,
    color: colors.success,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  skillChip: {
    backgroundColor: colors.primaryLight,
  },
  skillChipText: {
    fontSize: 11,
    color: colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  userDetailsModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  userDetailsContent: {
    alignItems: 'center',
  },
  userDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  userDetailsInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  userDetailsName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  userDetailsLocation: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  userDetailsBio: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  userDetailsActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
