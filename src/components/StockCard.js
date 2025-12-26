import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

export default function StockCard({ item, type, onPress, onRemove }) {
  const [imageError, setImageError] = useState(false); // track if load fails

  const isGainer = type === 'gainer';
  const cardBackgroundColor = isGainer ? '#e6f4ea' : '#fce8e6'; 
  const textColor = isGainer ? '#137333' : '#c5221f'; 

  // robustly get ticker
  const ticker = item.ticker ? item.ticker.trim() : "---";
  
  //logo image api
  const logoUrl = `https://assets.parqet.com/logos/symbol/${ticker}?format=png`;

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: cardBackgroundColor }]} 
      onPress={onPress}
    >
      {onRemove && (
        <TouchableOpacity 
          style={styles.removeButton} 
          onPress={() => onRemove(item)}
        >
          <Ionicons name="trash-outline" size={20} color={textColor} />
        </TouchableOpacity>
      )}

      
      <View style={styles.logoContainer}>
        {!imageError ? (
          <Image 
            source={{ uri: logoUrl }}
            style={styles.logo}
            resizeMode="contain"
            onError={() => setImageError(true)} 
          />
        ) : (
          <View style={styles.circleFallback}>
             <Text style={styles.fallbackText}>{ticker.charAt(0)}</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.ticker}>{ticker}</Text>
      <Text style={styles.price}>${item.price}</Text>
      <Text style={[styles.change, { color: textColor }]}>
        {item.change_percentage}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: (screenWidth - 24) / 2 - 24, // 2 columns logic
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
    position: 'relative',
  },
  logoContainer: {
    marginBottom: 10,
    height: 44,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white', // clean look for transparent logos
  },
  circleFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
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
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    padding: 4, 
  }
});