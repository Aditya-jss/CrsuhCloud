// components/ChatBot.js - Chatbot Interface Component
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sendMessageToBot } from '../services/chatbotService';

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hi! I\'m your CrushCloud assistant. I can help with profile tips, conversation starters, or dating advice. What can I help with today?', sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = async () => {
    if (inputText.trim() === '') return;
    
    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user'
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      // Call the backend service to get response from AI
      const botResponse = await sendMessageToBot(inputText);
      
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot'
      };
      
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error getting bot response:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I\'m having trouble responding right now. Please try again later.',
        sender: 'bot'
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[
      styles.messageBubble,
      item.sender === 'user' ? styles.userBubble : styles.botBubble
    ]}>
      <Text style={[
        styles.messageText,
        item.sender === 'user' ? styles.userText : styles.botText
      ]}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        
        {isLoading ? (
          <ActivityIndicator size="small" color="#6200ee" style={styles.sendButton} />
        ) : (
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={24} color="#6200ee" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messageList: {
    padding: 15,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
  },
  userBubble: {
    backgroundColor: '#6200ee',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
  },
  userText: {
    color: 'white',
  },
  botText: {
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});