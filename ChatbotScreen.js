// screens/main/ChatbotScreen.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import ChatBot from '../../components/ChatBot';

export default function ChatbotScreen() {
  return (
    <View style={styles.container}>
      <ChatBot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});