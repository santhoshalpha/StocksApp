import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, SafeAreaView, 
  TouchableOpacity, TextInput, FlatList, ActivityIndicator, Keyboard 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StockCard from '../components/StockCard';
import { MOCK_DATA } from '../constants/mockData'; 

// --- FIX: Import the named function directly ---
import { searchStocks } from '../api/stockService'; 

export default function ExploreScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Search Logic ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 0) {
        setLoading(true);
        try {
          // --- FIX: Call the function directly ---
          const results = await searchStocks(searchQuery);
          
          // Map API results to the format StockCard expects
          const formattedResults = results.map(item => ({
            ticker: item["1. symbol"],
            price: "N/A", 
            change_percentage: "0.00%", 
            name: item["2. name"]
          }));
          
          setSearchResults(formattedResults);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handlePress = (stock) => {
    navigation.navigate('Details', { stock });
  };

  const handleViewAll = (title, items, type) => {
    navigation.navigate('ViewAll', { title, items, type });
  };

  // --- Render Search Results ---
  const renderSearchResults = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />;
    }

    if (searchResults.length === 0 && searchQuery.length > 0) {
      return (
        <View style={styles.centerMsg}>
          <Text style={styles.msgText}>No stocks found.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.ticker}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <StockCard 
            item={item} 
            type="gainer" // Default style for search results
            onPress={() => handlePress(item)}
          />
        )}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* --- Header & Search Bar --- */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Stocks App</Text>
        
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={{ marginRight: 8 }} />
          <TextInput 
            style={styles.input}
            placeholder="Search (e.g., NVDA, TSLA)..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="characters"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); Keyboard.dismiss(); }}>
               <Ionicons name="close-circle" size={20} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* --- Conditional Rendering --- */}
      {searchQuery.length > 0 ? (
        renderSearchResults()
      ) : (
        // SHOW DASHBOARD
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Top Gainers */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Gainers</Text>
              <TouchableOpacity onPress={() => handleViewAll("Top Gainers", MOCK_DATA.top_gainers, "gainer")}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.grid}>
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

          {/* Top Losers */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Losers</Text>
              <TouchableOpacity onPress={() => handleViewAll("Top Losers", MOCK_DATA.top_losers, "loser")}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.grid}>
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
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  
  // Header Styles
  headerContainer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, backgroundColor: '#fff', zIndex: 1 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 15 },
  
  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 5, 
  },
  input: { flex: 1, fontSize: 16 },

  // Content
  scrollContent: { padding: 16, paddingTop: 10 },
  listContent: { padding: 16 },
  centerMsg: { alignItems: 'center', marginTop: 50 },
  msgText: { fontSize: 16, color: '#888' },

  // Sections
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 8, 
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold' },
  viewAllText: { fontSize: 14, color: '#007AFF', fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});