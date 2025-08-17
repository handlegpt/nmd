import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { IconButton } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';
import { useResponsive } from '../utils/responsive';
import { shadowPresets } from '../utils/platformStyles';
import { colors, spacing, borderRadius } from '../utils/responsive';

// Import screens
import FeedScreen from '../components/feed/FeedScreen';
import { MapScreen } from '../components/map/MapScreen';
import { ActivityScreen } from '../components/activities/ActivityScreen';
import { NotificationScreen } from '../components/notifications/NotificationScreen';
import { ProfileScreen } from '../components/profile/ProfileScreen';
import { LoginScreen } from '../components/auth/LoginScreen';
import { SettingsScreen } from '../components/settings/SettingsScreen';
import { ChatScreen } from '../components/chat/ChatScreen';
import { MessageScreen } from '../components/messages/MessageScreen';
import ResponsiveContainer from '../components/common/ResponsiveContainer';
import { useUrlSync } from '../hooks/useUrlSync';

// URL sync wrapper component that uses the hook inside NavigationContainer
const UrlSyncWrapper = () => {
  useUrlSync();
  return null;
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Simplified login prompt with modern design
const LoginPrompt = ({ navigation }: { navigation: any }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.primary,
    color: colors.white,
    padding: `${spacing.sm}px ${spacing.base}px`,
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: `0 0 ${borderRadius.lg}px ${borderRadius.lg}px`,
    ...shadowPresets.small,
  }}>
    <span style={{ fontSize: '14px', fontWeight: '500' }}>Sign in to access all features</span>
    <button 
      onClick={() => navigation.navigate('Login')}
      style={{
        backgroundColor: colors.white,
        color: colors.primary,
        border: 'none',
        padding: `${spacing.xs}px ${spacing.sm}px`,
        borderRadius: `${borderRadius.base}px`,
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
        transition: 'all 0.2s ease',
        ...shadowPresets.subtle,
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = colors.gray50;
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = colors.white;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      Sign In
    </button>
  </div>
);

// Main app tabs
const MainTabs = ({ navigation }: { navigation: any }) => {
  const { user } = useAuthStore();
  const { isPhone } = useResponsive();
  
  return (
    <>
      {!user && <LoginPrompt navigation={navigation} />}
      <div style={{ 
        paddingTop: !user ? '60px' : '0px',
        minHeight: '100vh'
      }}>
        <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: string;

            if (route.name === 'Feed') {
              iconName = 'home';
            } else if (route.name === 'Map') {
              iconName = 'map';
            } else if (route.name === 'Activities') {
              iconName = 'calendar';
            } else if (route.name === 'Notifications') {
              iconName = 'bell';
            } else if (route.name === 'Profile') {
              iconName = 'account';
            } else {
              iconName = 'circle';
            }

            return <IconButton icon={iconName} size={size} iconColor={color} />;
          },
          tabBarActiveTintColor: colors.primary,
                     tabBarInactiveTintColor: colors.gray500,
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopWidth: 1,
            borderTopColor: colors.gray200,
            paddingBottom: Platform.OS === 'ios' ? 20 : 8,
            paddingTop: 8,
            height: Platform.OS === 'ios' ? 80 : 60,
            ...shadowPresets.medium,
          },
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen 
          name="Feed" 
          component={FeedScreen}
          options={{ title: 'Nomad Now' }}
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
      </div>
    </>
  );
};

// Main app navigator
const AppNavigator = () => {
  const { user } = useAuthStore();
  const { isWeb } = useResponsive();

  return (
    <NavigationContainer>
      {/* URL sync hook must be inside NavigationContainer */}
      {isWeb && <UrlSyncWrapper />}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
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