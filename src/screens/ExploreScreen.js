import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { MOCK_DATA } from '../constants/mockData';
import StockCard from '../components/StockCard';

export default function ExploreScreen({ navigation }) {
  
  const handlePress = (stock) => {
    navigation.navigate('Details', { stock });
  };

  const handleViewAll = (title, items, type) => {
    navigation.navigate('ViewAll', { title, items, type });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.header}>Stocks App</Text>

        {/* --- Top Gainers Section --- */}
        <View style={styles.section}>
          {/* Header Row with "View All" */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Gainers</Text>
            <TouchableOpacity onPress={() => handleViewAll("Top Gainers", MOCK_DATA.top_gainers, "gainer")}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {/* ONLY SHOW TOP 4 */}
            {MOCK_DATA.top_gainers.slice(0, 4).map((stock, index) => (
              <StockCard 
                key={index} 
                item={stock} 
                type="gainer"
                onPress={() => handlePress(stock)}
              />
            ))}
          </View>
        </View>

        {/* --- Top Losers Section --- */}
        <View style={styles.section}>
          {/* Header Row with "View All" */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Losers</Text>
            <TouchableOpacity onPress={() => handleViewAll("Top Losers", MOCK_DATA.top_losers, "loser")}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {/* ONLY SHOW TOP 4 */}
            {MOCK_DATA.top_losers.slice(0, 4).map((stock, index) => (
              <StockCard 
                key={index} 
                item={stock} 
                type="loser"
                onPress={() => handlePress(stock)}
              />
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
  },
  section: {
    marginBottom: 24,
  },
  // New Header Logic for "Title" + "View All"
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 8, // Align with the cards slightly
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF', // Standard iOS blue link color
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});