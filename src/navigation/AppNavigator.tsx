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
      {/* URL sync hook must be inside NavigationContainer */}
      {isWeb && <UrlSyncWrapper />}
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