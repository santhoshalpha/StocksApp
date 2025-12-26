import React, { useState } from 'react';
import { View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator'; 
import { WatchlistProvider } from './src/context/WatchlistContext'; 
import AnimatedSplashScreen from './src/screens/AnimatedSplashScreen'; 

export default function App() {
  const [isShowSplash, setIsShowSplash] = useState(true);

  //splash
  if (isShowSplash) {
    return (
      <AnimatedSplashScreen onFinish={() => setIsShowSplash(false)} />
    );
  }

  // Once splash finishes, show the main app
  return (
    <WatchlistProvider>
      <AppNavigator />
    </WatchlistProvider>
  );
}