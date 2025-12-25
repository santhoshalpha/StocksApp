// src/screens/ViewAllScreen.js
import React, { useState, useContext } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import StockCard from '../components/StockCard';
import { AppContext } from '../context/AppContext';
import { Colors } from '../theme/colors';

export default function ViewAllScreen({ route, navigation }) {
  const { items } = route.params;
  const { theme } = useContext(AppContext);
  const colors = Colors[theme];
  
  // Simulated Pagination (Client-side for this API)
  const [displayCount, setDisplayCount] = useState(10);
  const dataToShow = items.slice(0, displayCount);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 10 }}>
      <FlatList
        data={dataToShow}
        keyExtractor={item => item.ticker}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => (
          <StockCard 
            stock={item} 
            onPress={() => navigation.navigate('Details', { symbol: item.ticker })} 
          />
        )}
        onEndReached={() => setDisplayCount(prev => prev + 10)}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}