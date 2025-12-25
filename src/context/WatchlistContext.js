import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WatchlistContext = createContext();

export const WatchlistProvider = ({ children }) => {
  // State is now an array of "Watchlist Objects"
  // Example: [{ id: '1', name: 'My First List', stocks: [] }]
  const [watchlists, setWatchlists] = useState([]);

  useEffect(() => {
    loadWatchlists();
  }, []);

  useEffect(() => {
    saveWatchlists();
  }, [watchlists]);

  const loadWatchlists = async () => {
    try {
      const stored = await AsyncStorage.getItem('my-watchlists-v2');
      if (stored) {
        setWatchlists(JSON.parse(stored));
      } else {
        // Initialize with a default list if nothing exists
        setWatchlists([{ id: 'default', name: 'Main Watchlist', stocks: [] }]);
      }
    } catch (e) {
      console.error("Failed to load watchlists", e);
    }
  };

  const saveWatchlists = async () => {
    try {
      await AsyncStorage.setItem('my-watchlists-v2', JSON.stringify(watchlists));
    } catch (e) {
      console.error("Failed to save watchlists", e);
    }
  };

  // --- Actions ---

  const createWatchlist = (name) => {
    const newWatchlist = {
      id: Date.now().toString(), // Simple unique ID
      name: name,
      stocks: []
    };
    setWatchlists([...watchlists, newWatchlist]);
  };

  const deleteWatchlist = (id) => {
    // Prevent deleting the last remaining list if you want
    if (watchlists.length <= 1) {
      alert("You must have at least one watchlist.");
      return;
    }
    setWatchlists(watchlists.filter(wl => wl.id !== id));
  };

  const addToWatchlist = (watchlistId, stock) => {
    setWatchlists(prevLists => {
      return prevLists.map(wl => {
        if (wl.id === watchlistId) {
          // Check for duplicates in this specific list
          const exists = wl.stocks.find(s => s.ticker === stock.ticker);
          if (!exists) {
            return { ...wl, stocks: [...wl.stocks, stock] };
          }
        }
        return wl;
      });
    });
  };

  const removeFromWatchlist = (watchlistId, ticker) => {
    setWatchlists(prevLists => {
      return prevLists.map(wl => {
        if (wl.id === watchlistId) {
          return { ...wl, stocks: wl.stocks.filter(s => s.ticker !== ticker) };
        }
        return wl;
      });
    });
  };

  return (
    <WatchlistContext.Provider value={{ 
      watchlists, 
      createWatchlist, 
      deleteWatchlist, 
      addToWatchlist, 
      removeFromWatchlist 
    }}>
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => useContext(WatchlistContext);