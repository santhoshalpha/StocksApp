import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  Dimensions, Modal, ScrollView 
} from 'react-native';
import { useWatchlist } from '../context/WatchlistContext';
import { LineChart } from "react-native-chart-kit";
import { Ionicons } from '@expo/vector-icons';

export default function DetailsScreen({ route }) {
  const { stock } = route.params;
  const { watchlists, addToWatchlist, removeFromWatchlist } = useWatchlist();
  
  const [modalVisible, setModalVisible] = useState(false);

  // Check if stock is in ANY list to determine button style
  const isSavedInAny = watchlists.some(wl => wl.stocks.some(s => s.ticker === stock.ticker));

  const isGainer = stock.change_percentage.includes('+') || !stock.change_percentage.includes('-');
  const color = isGainer ? '#137333' : '#c5221f';
  const screenWidth = Dimensions.get("window").width;

  const toggleStockInList = (watchlistId) => {
    const targetList = watchlists.find(wl => wl.id === watchlistId);
    const isPresent = targetList.stocks.some(s => s.ticker === stock.ticker);

    if (isPresent) {
      removeFromWatchlist(watchlistId, stock.ticker);
    } else {
      addToWatchlist(watchlistId, stock);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* Header (Same as before) */}
        <View style={styles.header}>
          <View>
            <Text style={styles.ticker}>{stock.ticker}</Text>
            <Text style={styles.name}>Company Name</Text> 
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${stock.price}</Text>
            <Text style={[styles.change, { color: color }]}>{stock.change_percentage}</Text>
          </View>
        </View>

        {/* Chart (Same as before) */}
        <View style={styles.chartContainer}>
           {/* ... Chart code remains exactly the same ... */}
           <LineChart
            data={{
              labels: ["1H", "24H", "1W", "1M", "3M", "1Y"],
              datasets: [{ data: [
                    parseFloat(stock.price) * 0.95,
                    parseFloat(stock.price) * 0.98,
                    parseFloat(stock.price) * 1.02,
                    parseFloat(stock.price) * 0.96,
                    parseFloat(stock.price) * 1.05,
                    parseFloat(stock.price)
              ]}]
            }}
            width={screenWidth - 40}
            height={220}
            yAxisLabel="$"
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 2,
              color: (opacity = 1) => isGainer ? `rgba(19, 115, 51, ${opacity})` : `rgba(197, 34, 31, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              propsForDots: { r: "0" } // Hiding dots for cleaner look
            }}
            bezier
          />
        </View>

        {/* --- Manage Watchlist Button --- */}
        <TouchableOpacity 
          style={[styles.addButton, isSavedInAny && styles.savedButton]} 
          onPress={() => setModalVisible(true)}
        >
          <Text style={[styles.addButtonText, isSavedInAny && styles.savedButtonText]}>
            {isSavedInAny ? "Manage Watchlists" : "+ Add to Watchlist"}
          </Text>
        </TouchableOpacity>

        {/* --- Selection Modal --- */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setModalVisible(false)}
          >
            <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
              <Text style={styles.modalTitle}>Save to...</Text>
              
              <ScrollView style={{maxHeight: 200}}>
                {watchlists.map((wl) => {
                  const isChecked = wl.stocks.some(s => s.ticker === stock.ticker);
                  return (
                    <TouchableOpacity 
                      key={wl.id} 
                      style={styles.checkRow}
                      onPress={() => toggleStockInList(wl.id)}
                    >
                      <Text style={styles.listName}>{wl.name}</Text>
                      <Ionicons 
                        name={isChecked ? "checkbox" : "square-outline"} 
                        size={24} 
                        color={isChecked ? "black" : "#ccc"} 
                      />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <TouchableOpacity style={styles.doneBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  ticker: { fontSize: 24, fontWeight: 'bold' },
  name: { fontSize: 14, color: '#666' },
  priceContainer: { alignItems: 'flex-end' },
  price: { fontSize: 24, fontWeight: 'bold' },
  change: { fontSize: 16, fontWeight: 'bold' },
  chartContainer: { alignItems: 'center', marginBottom: 30 },
  
  addButton: { backgroundColor: '#000', padding: 16, borderRadius: 12, alignItems: 'center' },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  savedButton: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#000' },
  savedButtonText: { color: '#000' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 30 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  checkRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  listName: { fontSize: 16 },
  doneBtn: { marginTop: 20, alignItems: 'center', padding: 10 },
  doneText: { fontWeight: 'bold', fontSize: 16 }
});