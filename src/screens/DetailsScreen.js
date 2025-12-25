import React, { useEffect, useState, useContext } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, StyleSheet, 
  ActivityIndicator, Dimensions, Modal, TextInput, FlatList, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';
import { fetchStockDetails } from '../api/stockService';
import { AppContext } from '../context/AppContext';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function DetailsScreen({ route, navigation }) {
  const { symbol } = route.params;
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false); // Controls the Popup
  const [newListName, setNewListName] = useState(''); // For creating new lists
  
  const { theme, watchlists, addToWatchlist, createWatchlist } = useContext(AppContext);
  const colors = Colors[theme];

  // Check if stock is already in ANY watchlist to decide icon style
  const isWatchlisted = Object.values(watchlists).flat().some(item => item.ticker === symbol);

  useEffect(() => {
    loadDetails();
  }, []);

  const loadDetails = async () => {
    const data = await fetchStockDetails(symbol);
    setStockData(data);
    setLoading(false);
  };

  // --- Watchlist Logic ---
  
  const handleAddToWatchlist = (listName) => {
    addToWatchlist(listName, { 
      ticker: symbol, 
      price: stockData?.info?.AnalystTargetPrice || '-',
      change_percentage: '0.00%' 
    });
    setModalVisible(false);
    Alert.alert("Success", `Added ${symbol} to ${listName}`);
  };

  const handleCreateAndAdd = () => {
    if (newListName.trim() === "") {
      Alert.alert("Error", "Please enter a watchlist name");
      return;
    }
    if (watchlists[newListName]) {
      Alert.alert("Error", "Watchlist already exists");
      return;
    }
    createWatchlist(newListName);
    handleAddToWatchlist(newListName); // Automatically add to the new list
    setNewListName("");
  };

  // --- Rendering ---

  if (loading) return <ActivityIndicator size="large" color={colors.tint} style={styles.center} />;
  if (!stockData || !stockData.info) return null;

  const { info, prices } = stockData;
  const currentPrice = parseFloat(Object.values(prices || {})[0]?.['4. close'] || 0);
  const chartPoints = prices ? Object.values(prices).slice(0, 30).map(p => ({ value: parseFloat(p['4. close']) })).reverse() : [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.navTitle, { color: colors.text }]}>{symbol}</Text>
          
          {/* Bookmark Button triggers Modal */}
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons 
              name={isWatchlisted ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color={colors.tint} 
            />
          </TouchableOpacity>
        </View>

        {/* ... (Existing Stock Info, Chart, and Stats code remains same as before) ... */}
        {/* I am omitting the chart/stats code here for brevity, paste the previous DetailsScreen logic here */}
        
        <View style={styles.headerContainer}>
           <Text style={[styles.companyName, { color: colors.text }]}>{info.Name}</Text>
           <Text style={[styles.priceText, { color: colors.text }]}>${currentPrice.toFixed(2)}</Text>
        </View>

        <View style={styles.chartContainer}>
          <LineChart 
            data={chartPoints} 
            thickness={2} 
            color={colors.tint} 
            hideDataPoints 
            hideRules 
            hideAxesAndRules 
            width={width} 
            height={200} 
          />
        </View>

      </ScrollView>

      {/* --- ADD TO WATCHLIST MODAL --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add to Watchlist</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* List Existing Watchlists */}
            <Text style={{ color: '#888', marginBottom: 10 }}>Select a list:</Text>
            <View style={{ maxHeight: 200 }}>
              <FlatList
                data={Object.keys(watchlists)}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[styles.listItem, { borderBottomColor: colors.background }]} 
                    onPress={() => handleAddToWatchlist(item)}
                  >
                    <Ionicons name="list" size={20} color={colors.tint} style={{ marginRight: 10 }} />
                    <Text style={{ color: colors.text, fontSize: 16 }}>{item}</Text>
                    <Ionicons name="add-circle-outline" size={24} color={colors.text} style={{ marginLeft: 'auto' }} />
                  </TouchableOpacity>
                )}
              />
            </View>

            {/* Create New Watchlist Section */}
            <View style={[styles.createSection, { borderTopColor: colors.background }]}>
              <Text style={{ color: '#888', marginBottom: 5 }}>Or create new:</Text>
              <View style={styles.inputRow}>
                <TextInput
                  placeholder="New List Name (e.g. Risky)"
                  placeholderTextColor="#999"
                  style={[styles.input, { color: colors.text, borderColor: colors.text }]}
                  value={newListName}
                  onChangeText={setNewListName}
                />
                <TouchableOpacity style={styles.createBtn} onPress={handleCreateAndAdd}>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  navTitle: { fontSize: 18, fontWeight: 'bold' },
  headerContainer: { paddingHorizontal: 20 },
  companyName: { fontSize: 22, fontWeight: 'bold' },
  priceText: { fontSize: 28, fontWeight: 'bold', marginTop: 5 },
  chartContainer: { marginVertical: 20 },
  
  // Modal Styles
  modalOverlay: { 
    flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' 
  },
  modalContent: { 
    borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 
  },
  modalHeader: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  listItem: { 
    flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1 
  },
  createSection: { marginTop: 20, paddingTop: 15, borderTopWidth: 1 },
  inputRow: { flexDirection: 'row', marginTop: 10 },
  input: { 
    flex: 1, borderWidth: 1, borderRadius: 8, padding: 10, marginRight: 10 
  },
  createBtn: { 
    backgroundColor: '#2196F3', borderRadius: 8, justifyContent: 'center', paddingHorizontal: 20 
  }
});