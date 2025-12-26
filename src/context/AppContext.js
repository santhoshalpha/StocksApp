import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

//main context 
const WatchlistContext = createContext();

// provider to wrap the memory
export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState([]);

  //load the data when app loads from the mobile storage
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
    // Check for duplicates
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

// custom hook
export const useWatchlist = () => useContext(WatchlistContext);