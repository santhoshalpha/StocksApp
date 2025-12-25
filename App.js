import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { WatchlistProvider } from './src/context/WatchlistContext'; // Import the Provider

export default function App() {
  return (
    // Wrap the Navigator inside the Provider
    <WatchlistProvider>
      <AppNavigator />
    </WatchlistProvider>
  );
}