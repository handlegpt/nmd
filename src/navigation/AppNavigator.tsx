import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { useResponsive } from '../utils/responsive';
import { shadowPresets } from '../utils/platformStyles';
import { colors, spacing, borderRadius } from '../utils/responsive';

// Import screens
import FeedScreen from '../components/feed/FeedScreen';
import { MapScreen } from '../components/map/MapScreen';
import { ActivityScreen } from '../components/activities/ActivityScreen';
import { CityScreen } from '../components/cities/CityScreen';
import { ProfileScreen } from '../components/profile/ProfileScreen';
import { LoginScreen } from '../components/auth/LoginScreen';
import NotificationScreen from '../components/notifications/NotificationScreen';
import { SettingsScreen } from '../components/settings/SettingsScreen';
import { ChatScreen } from '../components/chat/ChatScreen';
import { MessageScreen } from '../components/messages/MessageScreen';
import { GlobalSearchScreen } from '../components/search/GlobalSearchScreen';
import ResponsiveContainer from '../components/common/ResponsiveContainer';
import { useUrlSync } from '../hooks/useUrlSync';
import { navigationUtils } from '../utils/navigationUtils';
import { useEffect } from 'react';

// URL sync wrapper component that uses the hook inside NavigationContainer
const UrlSyncWrapper = () => {
  useUrlSync();
  return null;
};

// Enhanced URL sync wrapper with better error handling
const EnhancedUrlSyncWrapper = () => {
  const { isWeb } = useResponsive();
  
  useEffect(() => {
    if (isWeb) {
      // Force initial URL sync on mount
      const currentPath = window.location.pathname;
      console.log(`🔄 EnhancedUrlSync: Initial path: ${currentPath}`);
      
      // If we're on a specific path, ensure navigation state matches
      if (currentPath !== '/') {
        const { routeName, params } = navigationUtils.getRouteFromPath(currentPath);
        console.log(`🔄 EnhancedUrlSync: Ensuring route matches: ${routeName}`);
      }
    }
  }, [isWeb]);

  useUrlSync();
  return null;
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();



// Main app tabs
const MainTabs = ({ navigation }: { navigation: any }) => {
  const { user } = useAuthStore();
  const { isPhone } = useResponsive();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap;

          if (route.name === 'Feed') {
            iconName = 'home';
          } else if (route.name === 'Map') {
            iconName = 'map-marker';
          } else if (route.name === 'Activities') {
            iconName = 'calendar';
          } else if (route.name === 'Cities') {
            iconName = 'city';
          } else if (route.name === 'Notifications') {
            iconName = 'bell';
          } else if (route.name === 'Profile') {
            iconName = 'account';
          } else {
            iconName = 'circle';
          }

          return (
            <MaterialCommunityIcons
              name={iconName}
              size={size}
              color={focused ? colors.primary : colors.gray400}
            />
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.gray200,
          borderTopWidth: 1,
          paddingBottom: isPhone ? 0 : 10,
          paddingTop: 10,
          height: isPhone ? 60 : 80,
          ...shadowPresets.small,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        headerShown: false,
      })}>
      <Tab.Screen 
        name="Feed" 
        component={FeedScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen}
        options={{ title: 'Discover' }}
      />
      <Tab.Screen 
        name="Activities" 
        component={ActivityScreen}
        options={{ title: 'Meetups' }}
      />
      <Tab.Screen 
        name="Cities" 
        component={CityScreen}
        options={{ title: 'Cities' }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationScreen}
        options={{ title: 'Notifications' }}
      />
      <Tab.Screen 
        name="Profile"
        component={ProfileScreen}
        options={{ 
          title: 'Profile',
          headerRight: () => (
            <IconButton
              icon="cog"
              iconColor={colors.white}
              size={24}
              onPress={() => navigation.navigate('Settings')}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Main app navigator
const AppNavigator = () => {
  const { user } = useAuthStore();
  const { isWeb } = useResponsive();

  return (
    <NavigationContainer>
      {/* Enhanced URL sync hook must be inside NavigationContainer */}
      {isWeb && <EnhancedUrlSyncWrapper />}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Always show main app, but with different header based on auth status */}
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen}
          options={{ 
            headerShown: true,
            title: 'Chat',
            headerBackTitle: 'Back',
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTintColor: colors.white,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ 
            headerShown: true,
            title: 'Sign In',
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTintColor: colors.white,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ 
            headerShown: true,
            title: 'Settings',
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTintColor: colors.white,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 