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
import FeedScreenOptimized from '../components/feed/FeedScreenOptimized';
import { MapScreen } from '../components/map/MapScreen';
import { ActivityScreen } from '../components/activities/ActivityScreen';
import { CityScreen } from '../components/cities/CityScreen';
import { ProfileScreen } from '../components/profile/ProfileScreen';
import { LoginScreen } from '../components/auth/LoginScreen';
import { EmailLoginScreen } from '../components/auth/EmailLoginScreen';
import NotificationScreen from '../components/notifications/NotificationScreen';
import { SettingsScreen } from '../components/settings/SettingsScreen';
import { ChatScreen } from '../components/chat/ChatScreen';
import { MessageScreen } from '../components/messages/MessageScreen';
import { GlobalSearchScreen } from '../components/search/GlobalSearchScreen';
import ResponsiveContainer from '../components/common/ResponsiveContainer';
import { useUrlSync } from '../hooks/useUrlSync';
import { navigationUtils } from '../utils/navigationUtils';
import { useEffect, useRef } from 'react';

// Enhanced URL sync wrapper with page refresh handling
const EnhancedUrlSyncWrapper = () => {
  const { isWeb } = useResponsive();
  const hasInitializedRef = useRef(false);
  
  useEffect(() => {
    if (isWeb && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      
      // Handle page refresh - restore navigation state from URL
      const currentPath = window.location.pathname;
      // Enhanced URL sync refresh logged silently in production
      
      // Store the current path for navigation restoration
      if (currentPath !== '/') {
        // Use sessionStorage to persist the path across refreshes
        sessionStorage.setItem('nomadnow_last_path', currentPath);
        // Enhanced URL sync store logged silently in production
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
          backgroundColor: colors.surfaceElevated,
          borderTopWidth: 0,
          paddingBottom: isPhone ? 5 : 10,
          elevation: 8,
          shadowColor: colors.gray800,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          paddingTop: isPhone ? 5 : 10,
          height: isPhone ? 60 : 70,
          ...shadowPresets.medium,
        },
        tabBarLabelStyle: {
          fontSize: isPhone ? 10 : 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Feed" 
        component={FeedScreenOptimized}
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
          name="EmailLogin" 
          component={EmailLoginScreen}
          options={{ 
            headerShown: true,
            title: '邮箱登录',
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