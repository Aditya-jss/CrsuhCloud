// screens/main/SwipeScreen.js - Tinder-like swiping interface
import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Animated, PanResponder, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { fetchProfiles, sendInteraction } from '../../services/api';

export default function SwipeScreen() {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user } = useAuth();
  
  // Animation setup
  const position = new Animated.ValueXY();
  
  useEffect(() => {
    loadProfiles();
  }, []);
  
  const loadProfiles = async () => {
    try {
      const data = await fetchProfiles(user.id);
      setProfiles(data);
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };
  
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > 120) {
        swipeRight(); // Like (friendship)
      } else if (gesture.dx < -120) {
        swipeLeft(); // Pass
      } else if (gesture.dy < -120) {
        swipeUp(); // Love (romantic)
      } else {
        resetPosition();
      }
    }
  });
  
  const swipeRight = () => {
    Animated.timing(position, {
      toValue: { x: 500, y: 0 },
      duration: 300,
      useNativeDriver: true
    }).start(() => handleSwipe('like'));
  };
  
  const swipeLeft = () => {
    Animated.timing(position, {
      toValue: { x: -500, y: 0 },
      duration: 300,
      useNativeDriver: true
    }).start(() => handleSwipe('pass'));
  };
  
  const swipeUp = () => {
    Animated.timing(position, {
      toValue: { x: 0, y: -500 },
      duration: 300,
      useNativeDriver: true
    }).start(() => handleSwipe('love'));
  };
  
  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 4,
      useNativeDriver: true
    }).start();
  };
  
  const handleSwipe = async (type) => {
    try {
      if (profiles[currentIndex]) {
        await sendInteraction(user.id, profiles[currentIndex].id, type);
      }
      setCurrentIndex(currentIndex + 1);
      position.setValue({ x: 0, y: 0 });
    } catch (error) {
      console.error('Error handling swipe:', error);
    }
  };
  
  // Manual button handlers
  const handleLikePress = () => {
    swipeRight();
  };
  
  const handlePassPress = () => {
    swipeLeft();
  };
  
  const handleLovePress = () => {
    swipeUp();
  };
  
  if (!profiles.length || currentIndex >= profiles.length) {
    return (
      <View style={styles.noMoreProfiles}>
        <Text style={styles.noMoreText}>No more profiles to show</Text>
        <TouchableOpacity 
          style={styles.reloadButton}
          onPress={loadProfiles}
        >
          <Text style={styles.reloadButtonText}>Refresh Profiles</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const rotateCard = position.x.interpolate({
    inputRange: [-300, 0, 300],
    outputRange: ['-30deg', '0deg', '30deg'],
    extrapolate: 'clamp'
  });
  
  const animatedCardStyle = {
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { rotate: rotateCard }
    ]
  };
  
  const currentProfile = profiles[currentIndex];
  
  return (
    <View style={styles.container}>
      <Animated.View 
        style={[styles.card, animatedCardStyle]} 
        {...panResponder.panHandlers}
      >
        <Image source={{ uri: currentProfile.photos[0] }} style={styles.photo} />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{currentProfile.name}, {currentProfile.age}</Text>
          <Text style={styles.bio}>{currentProfile.bio}</Text>
          
          {/* Matrimony specific details */}
          {currentProfile.matrimonyDetails && (
            <View style={styles.matrimonyDetails}>
              <Text style={styles.detailText}>Education: {currentProfile.matrimonyDetails.education}</Text>
              <Text style={styles.detailText}>Profession: {currentProfile.matrimonyDetails.profession}</Text>
              <Text style={styles.detailText}>Family: {currentProfile.matrimonyDetails.familyDetails}</Text>
            </View>
          )}
        </View>
      </Animated.View>
      
      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.button, styles.passButton]} onPress={handlePassPress}>
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.likeButton]} onPress={handleLikePress}>
          <Ionicons name="thumbs-up" size={30} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.loveButton]} onPress={handleLovePress}>
          <Ionicons name="heart" size={30} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <Ionicons name="thumbs-up" size={20} color="#3498db" />
          <Text style={styles.legendText}>Like (Friend)</Text>
        </View>
        <View style={styles.legendItem}>
          <Ionicons name="heart" size={20} color="#e74c3c" />
          <Text style={styles.legendText}>Love (Romance)</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  card: {
    width: '90%',
    height: '70%',
    borderRadius: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '70%',
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  bio: {
    fontSize: 16,
    marginTop: 5,
    color: '#666',
  },
  matrimonyDetails: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginHorizontal: 10,
  },
  passButton: {
    backgroundColor: '#e74c3c',
  },
  likeButton: {
    backgroundColor: '#3498db',
  },
  loveButton: {
    backgroundColor: '#e84393',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#666',
  },
  noMoreProfiles: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noMoreText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  reloadButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  reloadButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});