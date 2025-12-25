import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useWatchlist } from '../context/WatchlistContext'; // 1. Import the "Brain"
import StockCard from '../components/StockCard'; // 2. Import the "Brick"

export default function WatchlistScreen({ navigation }) {
  // 3. Get the list of saved stocks from our global state
  const { watchlist } = useWatchlist();

  const handlePress = (stock) => {
  // Tell the navigator:
  // 1. Go to the 'Home' tab (which holds the stack)
  // 2. Find the screen named 'Details' inside that stack
  // 3. Pass the params
  navigation.navigate('Home', { 
    screen: 'Details', 
    params: { stock } 
  });
};

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>My Watchlist</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 4. The "Empty State" - Show this if list is empty */}
        {watchlist.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No stocks added yet.</Text>
            <Text style={styles.subText}>Go to Explore to add some!</Text>
          </View>
        ) : (
          // 5. The Grid - Same layout as Explore Screen
          <View style={styles.grid}>
            {watchlist.map((stock, index) => {
              // Calculate if it's a gainer or loser based on the "-" sign
              const isLoser = stock.change_percentage.includes('-');
              const type = isLoser ? 'loser' : 'gainer';

              return (
                <StockCard 
                  key={index} 
                  item={stock} 
                  type={type}
                  onPress={() => handlePress(stock)}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    padding: 20,
    marginTop: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  subText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  }
});