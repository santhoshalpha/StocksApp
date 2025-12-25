import React, { useEffect, useState, useContext } from 'react';
import { 
  View, Text, ScrollView, StyleSheet, ActivityIndicator, 
  TouchableOpacity, TextInput, FlatList, Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fetchTopGainersLosers, searchStocks } from '../api/stockService';
import StockCard from '../components/StockCard';
import { AppContext } from '../context/AppContext';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function ExploreScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const { theme } = useContext(AppContext);
  const colors = Colors[theme];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await fetchTopGainersLosers();
    setData(res);
    setLoading(false);
  };

  // Debounced Search Handler
  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (text.length > 2) {
      setIsSearching(true);
      const results = await searchStocks(text);
      // Format search results to match StockCard expectation
      const formatted = results.map(r => ({
        ticker: r['1. symbol'],
        price: '-', // Search endpoint doesn't return price
        change_percentage: '0.00%'
      }));
      setSearchResults(formatted);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const renderSection = (title, items) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ViewAll', { title, items })}>
          <Text style={{ color: colors.tint, fontWeight: '600' }}>View All</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.grid}>
        {items?.slice(0, 4).map((item, index) => (
          <StockCard 
            key={index} 
            stock={item} 
            onPress={() => navigation.navigate('Details', { symbol: item.ticker })} 
          />
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header & Search */}
      <View style={styles.header}>
        <Text style={[styles.appTitle, { color: colors.text }]}>Stocks App</Text>
        <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput 
            placeholder="Search stocks..." 
            placeholderTextColor="#999"
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content */}
      {searchQuery.length > 0 ? (
        // Search Results View
        <View style={{ flex: 1, paddingHorizontal: 15 }}>
          {isSearching ? (
            <ActivityIndicator style={{ marginTop: 20 }} color={colors.tint} />
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={item => item.ticker}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.searchItem, { borderBottomColor: colors.card }]}
                  onPress={() => navigation.navigate('Details', { symbol: item.ticker })}
                >
                  <Text style={[styles.searchTicker, { color: colors.text }]}>{item.ticker}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      ) : (
        // Standard Explore View
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 50 }} />
          ) : (
            <>
              {data?.top_gainers && renderSection("Top Gainers", data.top_gainers)}
              {data?.top_losers && renderSection("Top Losers", data.top_losers)}
              
              {!data && (
                <View style={styles.errorContainer}>
                  <Text style={{ color: colors.text, textAlign: 'center' }}>
                    Limit reached or offline. Using cached data if available.
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 15, paddingBottom: 10 },
  appTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 15 },
  searchBar: { 
    flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 10 
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  section: { marginTop: 20, paddingHorizontal: 15 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  searchItem: { 
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1 
  },
  searchTicker: { fontSize: 16, fontWeight: 'bold' },
  errorContainer: { padding: 20, alignItems: 'center' }
});