// src/components/StockCard.js
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AppContext } from '../context/AppContext';
import { Colors } from '../theme/colors';

export default function StockCard({ stock, onPress }) {
  const { theme } = useContext(AppContext);
  const styles = getStyles(Colors[theme]);
  const isGainer = parseFloat(stock.change_percentage) >= 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View>
        <Text style={styles.symbol}>{stock.ticker}</Text>
        <Text style={styles.price}>${stock.price}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: isGainer ? '#E8F5E9' : '#FFEBEE' }]}>
        <Text style={{ color: isGainer ? 'green' : 'red' }}>
          {stock.change_percentage}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const getStyles = (colors) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '48%', // For Grid Layout
  },
  symbol: { color: colors.text, fontWeight: 'bold', fontSize: 16 },
  price: { color: colors.text, marginTop: 4 },
  badge: { padding: 5, borderRadius: 5 }
});