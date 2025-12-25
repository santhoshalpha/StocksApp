import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { WatchlistProvider } from './src/context/WatchlistContext';

export default function App() {
  return (
    <WatchlistProvider>
      <AppNavigator />
    </WatchlistProvider>
  );
}