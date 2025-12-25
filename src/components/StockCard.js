import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import the icon library

const screenWidth = Dimensions.get('window').width;

// Add 'onRemove' to the props
export default function StockCard({ item, type, onPress, onRemove }) {
  
  const isGainer = type === 'gainer';
  const cardBackgroundColor = isGainer ? '#e6f4ea' : '#fce8e6'; 
  const textColor = isGainer ? '#137333' : '#c5221f'; 

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: cardBackgroundColor }]} 
      onPress={onPress}
    >
      {/* Only show this button if onRemove is provided (i.e., in Watchlist) */}
      {onRemove && (
        <TouchableOpacity 
          style={styles.removeButton} 
          onPress={() => onRemove(item)}
        >
          <Ionicons name="trash-outline" size={20} color={textColor} />
        </TouchableOpacity>
      )}

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
    // We stick to your grid logic here
    width: (screenWidth - 24) / 2 - 24, // Adjusted for 2 columns with spacing
    padding: 16,
    margin: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative', // Needed for the absolute position of the trash icon
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
  // New Style for the Trash Button
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10, // Ensure it sits on top of the card
    padding: 4, // Makes the touch area slightly bigger
  }
});