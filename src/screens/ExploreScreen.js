import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { MOCK_DATA } from '../constants/mockData'; // Import our data
import StockCard from '../components/StockCard';   // Import our component

export default function ExploreScreen({ navigation }) {
  
  // Helper function to handle card click
  const handlePress = (stock) => {
    // Navigate to Details screen and pass the stock data
    navigation.navigate('Details', { stock }); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.header}>Stocks App</Text>

        {/* --- Top Gainers Section --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Gainers</Text>
          <View style={styles.grid}>
            {MOCK_DATA.top_gainers.map((stock, index) => (
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
          <Text style={styles.sectionTitle}>Top Losers</Text>
          <View style={styles.grid}>
            {MOCK_DATA.top_losers.map((stock, index) => (
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 8,
  },
  grid: {
    flexDirection: 'row', // Lay out items horizontally
    flexWrap: 'wrap',     // Wrap to next line
  },
});