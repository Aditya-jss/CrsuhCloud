// services/chatbotService.js - Service to handle communication with the chatbot API
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://api.crushcloud.com/chatbot'; // Your backend endpoint

// Function to send user message to the chatbot and get response
export const sendMessageToBot = async (message) => {
  try {
    // Get the auth token
    const token = await AsyncStorage.getItem('authToken');
    
    // Get conversation history (last 10 messages for context)
    const history = await getChatHistory();
    
    const response = await axios.post(API_URL, {
      message,
      history
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Save the new messages to history
    await saveChatHistory([
      { role: 'user', content: message },
      { role: 'assistant', content: response.data.reply }
    ]);
    
    return response.data.reply;
  } catch (error) {
    console.error('Error in chatbot service:', error);
    throw error;
  }
};

// Function to get chat history from local storage
const getChatHistory = async () => {
  try {
    const historyJson = await AsyncStorage.getItem('chatHistory');
    if (historyJson) {
      const history = JSON.parse(historyJson);
      // Return only last 10 messages to keep context manageable
      return history.slice(-10);
    }
    return [];
  } catch (error) {
    console.error('Error getting chat history:', error);
    return [];
  }
};

// Function to save chat history to local storage
const saveChatHistory = async (newMessages) => {
  try {
    const historyJson = await AsyncStorage.getItem('chatHistory');
    let history = [];
    
    if (historyJson) {
      history = JSON.parse(historyJson);
    }
    
    // Add new messages to history
    history = [...history, ...newMessages];
    
    // Keep only last 50 messages to manage storage
    if (history.length > 50) {
      history = history.slice(-50);
    }
    
    await AsyncStorage.setItem('chatHistory', JSON.stringify(history));
  } catch (error) {
    console.error('Error saving chat history:', error);
  }
};

// Common dating advice topics that the AI might handle
export const suggestedTopics = [
  {
    id: '1',
    title: 'Profile Tips',
    description: 'Get advice on improving your dating profile'
  },
  {
    id: '2',
    title: 'Conversation Starters',
    description: 'Ideas for breaking the ice with new matches'
  },
  {
    id: '3',
    title: 'Dating Etiquette',
    description: 'Tips for successful first dates'
  },
  {
    id: '4',
    title: 'Relationship Advice',
    description: 'Guidance for building healthy relationships'
  }
];