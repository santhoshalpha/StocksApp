import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, StatusBar, Image } from 'react-native';

const { width, height } = Dimensions.get('window');

const DARK_BG = '#121212'; 

export default function AnimatedSplashScreen({ onFinish }) {
  const scaleValue = useRef(new Animated.Value(0)).current; 
  const opacityValue = useRef(new Animated.Value(0)).current; 
  const textTranslateY = useRef(new Animated.Value(20)).current; 

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      onFinish(); 
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      
      <Animated.View style={{ 
        transform: [{ scale: scaleValue }], 
        opacity: opacityValue,
        marginBottom: 20 
      }}>
        <Image 
          source={require('../../assets/growwnb.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View style={{ 
        opacity: opacityValue, 
        transform: [{ translateY: textTranslateY }] 
      }}>
        <Text style={styles.appName}>Groww</Text>
        <Text style={styles.tagline}>Simple Demat & Stock Trading</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG, 
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    height: height,
  },
  logoImage: {
    width: 300,  
    height: 120,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    textAlign: 'center',
  },
  tagline: {
    marginTop: 8,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    letterSpacing: 0.5,
  }
});