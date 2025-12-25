import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useWatchlist } from '../context/WatchlistContext'; // <--- Import this

export default function DetailsScreen({ route }) {
  const { stock } = route.params;
  
  // 1. Get our tools from the global context
  const { addToWatchlist, removeFromWatchlist, watchlist } = useWatchlist();

  // 2. Check if this specific stock is already saved
  const isSaved = watchlist.some((item) => item.ticker === stock.ticker);

  const handleToggleWatchlist = () => {
    if (isSaved) {
      removeFromWatchlist(stock.ticker);
    } else {
      addToWatchlist(stock);
    }
  };

  // Color logic
  const isGainer = stock.change_percentage.includes('+') || !stock.change_percentage.includes('-');
  const color = isGainer ? '#137333' : '#c5221f';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* Header (Same as before) */}
        <View style={styles.header}>
          <View>
            <Text style={styles.ticker}>{stock.ticker}</Text>
            <Text style={styles.name}>Company Name</Text> 
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${stock.price}</Text>
            <Text style={[styles.change, { color: color }]}>
              {stock.change_percentage}
            </Text>
          </View>
        </View>

        {/* Graph Placeholder */}
        <View style={styles.graphPlaceholder}>
          <Text style={styles.graphText}>Chart Area</Text>
        </View>

        {/* 3. The Interactive Button */}
        <TouchableOpacity 
          style={[styles.addButton, isSaved && styles.removeButton]} // Change style if saved
          onPress={handleToggleWatchlist}
        >
          <Text style={[styles.addButtonText, isSaved && styles.removeButtonText]}>
            {isSaved ? "Remove from Watchlist" : "+ Add to Watchlist"}
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  ticker: { fontSize: 24, fontWeight: 'bold' },
  name: { fontSize: 14, color: '#666' },
  priceContainer: { alignItems: 'flex-end' },
  price: { fontSize: 24, fontWeight: 'bold' },
  change: { fontSize: 16, fontWeight: 'bold' },
  
  graphPlaceholder: { height: 250, backgroundColor: '#f5f5f5', borderRadius: 16, marginBottom: 30, justifyContent: 'center', alignItems: 'center' },
  graphText: { color: '#aaa' },
  
  // Button Styles
  addButton: { backgroundColor: '#000', padding: 16, borderRadius: 12, alignItems: 'center' },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  // Styles for when the item is already saved
  removeButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#c5221f' },
  removeButtonText: { color: '#c5221f' },
});