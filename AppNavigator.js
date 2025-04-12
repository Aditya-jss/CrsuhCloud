// navigation/AppNavigator.js - Navigation structure
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens
import SwipeScreen from '../screens/main/SwipeScreen';
import MatchesScreen from '../screens/main/MatchesScreen';
import MessagesScreen from '../screens/main/MessagesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import ChatbotScreen from '../screens/main/ChatbotScreen';

const AuthStack = createStackNavigator();
const MainTab = createBottomTabNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Swipe') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Matches') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Assistant') {
            iconName = focused ? 'help-circle' : 'help-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
      tabBarOptions={{
        activeTintColor: '#6200ee',
        inactiveTintColor: 'gray',
      }}
    >
      <MainTab.Screen name="Swipe" component={SwipeScreen} />
      <MainTab.Screen name="Matches" component={MatchesScreen} />
      <MainTab.Screen name="Messages" component={MessagesScreen} />
      <MainTab.Screen name="Profile" component={ProfileScreen} />
      <MainTab.Screen name="Assistant" component={ChatbotScreen} />
    </MainTab.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useAuth();
  
  return user ? <MainNavigator /> : <AuthNavigator />;
}