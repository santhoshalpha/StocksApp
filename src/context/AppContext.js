import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const systemTheme = useColorScheme();
  const [theme, setTheme] = useState(systemTheme || 'light');
  
  // Watchlists structure: { "Favorites": [...], "Tech Stocks": [...] }
  const [watchlists, setWatchlists] = useState({ "Favorites": [] }); 

  useEffect(() => {
    loadWatchlists();
  }, []);

  const loadWatchlists = async () => {
    try {
      const stored = await AsyncStorage.getItem('watchlists');
      if (stored) setWatchlists(JSON.parse(stored));
    } catch (e) { console.error("Failed to load watchlists"); }
  };

  const saveWatchlists = async (newWatchlists) => {
    setWatchlists(newWatchlists);
    await AsyncStorage.setItem('watchlists', JSON.stringify(newWatchlists));
  };

  // Create a new empty list
  const createWatchlist = (name) => {
    if (!name || watchlists[name]) return; // Prevent duplicates or empty names
    const updated = { ...watchlists, [name]: [] };
    saveWatchlists(updated);
  };

  // Add stock to a specific list
  const addToWatchlist = (listName, stock) => {
    const currentList = watchlists[listName] || [];
    // Prevent duplicate stocks in the same list
    if (!currentList.some(s => s.ticker === stock.ticker)) {
      const updatedList = [...currentList, stock];
      const updatedWatchlists = { ...watchlists, [listName]: updatedList };
      saveWatchlists(updatedWatchlists);
    }
  };

  const removeFromWatchlist = (listName, ticker) => {
    const list = watchlists[listName];
    if (!list) return;
    const updatedList = list.filter(s => s.ticker !== ticker);
    saveWatchlists({ ...watchlists, [listName]: updatedList });
  };

  return (
    <AppContext.Provider value={{ 
      theme, setTheme, watchlists, addToWatchlist, createWatchlist, removeFromWatchlist 
    }}>
      {children}
    </AppContext.Provider>
  );
};