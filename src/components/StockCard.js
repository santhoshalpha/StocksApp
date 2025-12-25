import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

// 1. Get the screen width so we can calculate exact card size
const screenWidth = Dimensions.get('window').width;

export default function StockCard({ item, type, onPress }) {
  
  // 2. Dynamic Styling: Green for gainers, Red for losers
  const isGainer = type === 'gainer';
  const cardBackgroundColor = isGainer ? '#e6f4ea' : '#fce8e6'; 
  const textColor = isGainer ? '#137333' : '#c5221f'; 

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: cardBackgroundColor }]} 
      onPress={onPress}
    >
      {/* The circular placeholder from the wireframe */}
      <View style={styles.circle} />
      
      <Text style={styles.ticker}>{item.ticker}</Text>
      <Text style={styles.price}>${item.price}</Text>
      <Text style={[styles.change, { color: textColor }]}>
        {item.change_percentage}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    // 3. The Grid Logic: Screen Width / 2 columns - margins
    width: (screenWidth / 2) - 24, 
    padding: 16,
    margin: 8,
    borderRadius: 12,
    alignItems: 'center', // Centers text horizontally
    justifyContent: 'center',
    // Adding shadow for depth
    elevation: 3,            // Android shadow
    shadowColor: '#000',     // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 8,
  },
  ticker: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: '#333',
  },
  change: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
});