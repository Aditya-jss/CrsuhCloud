// services/api.js - API service for the dating app
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://api.crushcloud.com'; // Your API base URL

// Create axios instance with auth interceptor
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    await AsyncStorage.setItem('authToken', response.data.token);
    return response.data.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    await AsyncStorage.setItem('authToken', response.data.token);
    return response.data.user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Profile Management

export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    const response = await api.put(`/users/${userId}`, profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const uploadProfilePhoto = async (userId, photoUri) => {
  try {
    const formData = new FormData();
    formData.append('photo', {
      uri: photoUri,
      type: 'image/jpeg',
      name: 'profile-photo.jpg',
    });
    
    const response = await axios.post(
      `${API_URL}/users/${userId}/photos`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}`,
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};

// Profiles for Swiping

export const fetchProfiles = async () => {
  try {
    const response = await api.get('/profiles');
    return response.data;
  } catch (error) {
    console.error('Error fetching profiles:', error);
    throw error;
  }
};

// Interactions (Like, Love, Pass)

export const sendInteraction = async (targetUserId, type) => {
  try {
    const response = await api.post('/interactions', {
      targetUserId,
      type, // 'like', 'love', or 'pass'
    });
    return response.data;
  } catch (error) {
    console.error('Error sending interaction:', error);
    throw error;
  }
};

// Matches

export const getMatches = async () => {
  try {
    const response = await api.get('/matches');
    return response.data;
  } catch (error) {
    console.error('Error fetching matches:', error);
    throw error;
  }
};

// Messages

export const getMessages = async (matchId) => {
  try {
    const response = await api.get(`/matches/${matchId}/messages`);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const sendMessage = async (matchId, content) => {
  try {
    const response = await api.post(`/matches/${matchId}/messages`, {
      content,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Settings

export const updateUserPreferences = async (preferences) => {
  try {
    const response = await api.put('/users/preferences', preferences);
    return response.data;
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw error;
  }
};