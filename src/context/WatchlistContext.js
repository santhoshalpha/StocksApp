import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Create the "Cloud"
const WatchlistContext = createContext();

// 2. Create the "Provider" (The component that wraps the whole app)
export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState([]);

  // Load data from phone storage when app starts
  useEffect(() => {
    loadWatchlist();
  }, []);

  // Save to storage whenever watchlist changes
  useEffect(() => {
    saveWatchlist();
  }, [watchlist]);

  const loadWatchlist = async () => {
    try {
      const storedList = await AsyncStorage.getItem('my-watchlist');
      if (storedList) {
        setWatchlist(JSON.parse(storedList));
      }
    } catch (e) {
      console.error("Failed to load watchlist", e);
    }
  };

  const saveWatchlist = async () => {
    try {
      await AsyncStorage.setItem('my-watchlist', JSON.stringify(watchlist));
    } catch (e) {
      console.error("Failed to save watchlist", e);
    }
  };

  // Function to add a stock
  const addToWatchlist = (stock) => {
    // Check if it's already there to avoid duplicates
    const exists = watchlist.find(item => item.ticker === stock.ticker);
    if (!exists) {
      setWatchlist([...watchlist, stock]);
      console.log("Added:", stock.ticker);
    }
  };

  // Function to remove a stock
  const removeFromWatchlist = (ticker) => {
    setWatchlist(watchlist.filter(item => item.ticker !== ticker));
  };

  return (
    <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  );
};

// 3. Create a custom hook so it's easy to use
export const useWatchlist = () => useContext(WatchlistContext);