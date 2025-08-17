import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';
import { LoginScreen } from '../components/auth/LoginScreen';
import { MapScreen } from '../components/map/MapScreen';
import { ProfileScreen } from '../components/profile/ProfileScreen';
import { ActivityScreen } from '../components/activities/ActivityScreen';
import { NotificationScreen } from '../components/notifications/NotificationScreen';
import { ChatScreen } from '../components/chat/ChatScreen';
import { FeedScreen } from '../components/feed/FeedScreen';
import { SettingsScreen } from '../components/settings/SettingsScreen';
import { IconButton } from 'react-native-paper';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Login prompt component for guest users
const LoginPrompt = ({ navigation }: { navigation: any }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#6366f1',
    color: 'white',
    padding: '12px 16px',
    textAlign: 'center',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row'
  }}>
    <span style={{ fontSize: '14px' }}>
      👋 Welcome to NomadNow! Join us to connect with fellow digital nomads
    </span>
    <button
      onClick={() => navigation.navigate('Login')}
      style={{
        backgroundColor: 'white',
        color: '#6366f1',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = '#f8fafc';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = 'white';
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
  
  return (
    <>
      {!user && <LoginPrompt navigation={navigation} />}
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
          tabBarActiveTintColor: '#6366f1',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
            paddingBottom: Platform.OS === 'ios' ? 20 : 8,
            paddingTop: 8,
            height: Platform.OS === 'ios' ? 80 : 60,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          headerStyle: {
            backgroundColor: '#6366f1',
          },
          headerTintColor: '#ffffff',
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
                iconColor="#ffffff"
                size={24}
                onPress={() => navigation.navigate('Settings')}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </>
  );
};

// Main app navigator
const AppNavigator = () => {
  const { user } = useAuthStore();

  return (
    <NavigationContainer>
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
              backgroundColor: '#6366f1',
            },
            headerTintColor: '#ffffff',
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
              backgroundColor: '#6366f1',
            },
            headerTintColor: '#ffffff',
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
              backgroundColor: '#6366f1',
            },
            headerTintColor: '#ffffff',
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