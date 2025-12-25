import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  Dimensions, ActivityIndicator, ScrollView, Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWatchlist } from '../context/WatchlistContext';
import { LineChart } from "react-native-chart-kit";
import { Ionicons } from '@expo/vector-icons';
import { fetchStockDetails, fetchChartData } from '../api/stockService'; 

const RANGES = ['1D', '1W', '1M', '3M', '1Y'];

// --- HELPER: Format Big Numbers ---
const formatMarketCap = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return "-"; // Handle "N/A" or "-"

  // Option 1: US Standard (T/B/M) - BEST for Alpha Vantage/USD
  if (num >= 1.0e+12) return (num / 1.0e+12).toFixed(2) + "T";
  if (num >= 1.0e+9)  return (num / 1.0e+9).toFixed(2) + "B";
  if (num >= 1.0e+6)  return (num / 1.0e+6).toFixed(2) + "M";

  // Option 2: Indian Standard (Cr/L) - Uncomment if you strictly want this
  /*
  if (num >= 1.0e+7) return (num / 1.0e+7).toFixed(2) + " Cr";
  if (num >= 1.0e+5) return (num / 1.0e+5).toFixed(2) + " L";
  */

  return num.toString();
};

export default function DetailsScreen({ route }) {
  const { stock: initialStock } = route.params;
  const { watchlists, addToWatchlist, removeFromWatchlist } = useWatchlist();
  
  // State
  const [stockInfo, setStockInfo] = useState(initialStock); 
  const [chartData, setChartData] = useState(null); 
  const [selectedRange, setSelectedRange] = useState('1W'); 
  const [loadingChart, setLoadingChart] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const screenWidth = Dimensions.get("window").width;

  // 1. Fetch Basic Info
  useEffect(() => {
    let isMounted = true;
    const loadDetails = async () => {
      const data = await fetchStockDetails(initialStock.ticker);
      if (isMounted && data) {
        setStockInfo(prev => ({ ...prev, ...data })); 
      }
    };
    loadDetails();
    return () => { isMounted = false; };
  }, [initialStock.ticker]);

  // 2. Fetch Chart Data
  useEffect(() => {
    let isMounted = true;
    const loadChart = async () => {
      setLoadingChart(true);
      const data = await fetchChartData(initialStock.ticker, selectedRange);
      
      if (isMounted) {
        if (data && data.length > 0) {
          setChartData(data);
        } else {
            setChartData([]); 
        }
        setLoadingChart(false);
      }
    };
    loadChart();
    return () => { isMounted = false; };
  }, [selectedRange, initialStock.ticker]);

  // --- Prepare Chart Data ---
  const finalPrices = (chartData && chartData.length > 0) 
    ? chartData.map(d => d.value) 
    : [100, 100];
    
  const rawLabels = (chartData && chartData.length > 0) ? chartData.map(d => d.label) : ["-", "-"];
  const finalLabels = rawLabels.map((label, index) => {
      const step = Math.ceil(rawLabels.length / 5);
      return index % step === 0 ? label : "";
  });

  // UI Helpers
  const price = parseFloat(stockInfo.price || 0).toFixed(2);
  const changePct = stockInfo.change_percentage || "0.00%";
  const isGainer = !changePct.includes('-');
  const color = isGainer ? '#137333' : '#c5221f';

  // Watchlist Logic
  const currentTicker = stockInfo.Symbol || initialStock.ticker;
  const isSavedInAny = watchlists.some(wl => wl.stocks.some(s => s.ticker === currentTicker));

  const toggleStockInList = (watchlistId) => {
    const targetList = watchlists.find(wl => wl.id === watchlistId);
    const isPresent = targetList.stocks.some(s => s.ticker === currentTicker);
    
    const stockToSave = { 
        ticker: currentTicker, 
        price: price, 
        change_percentage: changePct,
        name: stockInfo.Name || initialStock.name
    };

    if (isPresent) {
      removeFromWatchlist(watchlistId, currentTicker);
    } else {
      addToWatchlist(watchlistId, stockToSave);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.ticker}>{currentTicker}</Text>
            <Text style={styles.name}>{stockInfo.Name}</Text> 
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${price}</Text>
            <Text style={[styles.change, { color: color }]}>{changePct}</Text>
          </View>
        </View>

        {/* --- CHART SECTION --- */}
        <View style={styles.chartContainer}>
           {loadingChart ? (
             <ActivityIndicator size="large" color="#000" style={{height: 220}} />
           ) : (
             <LineChart
              data={{
                labels: finalLabels,
                datasets: [{ data: finalPrices }]
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
                style: { borderRadius: 16 },
                propsForDots: { r: "0" },
              }}
              bezier
              withVerticalLines={false}
            />
           )}
        </View>

        {/* --- TIME RANGE SELECTOR --- */}
        <View style={styles.rangeContainer}>
          {RANGES.map((range) => (
            <TouchableOpacity 
              key={range} 
              style={[styles.rangeButton, selectedRange === range && styles.activeRange]}
              onPress={() => setSelectedRange(range)}
            >
              <Text style={[styles.rangeText, selectedRange === range && styles.activeRangeText]}>
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* --- ABOUT SECTION (Updated with Formatting) --- */}
        <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{stockInfo.Description}</Text>
            
            <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Market Cap</Text>
                    {/* APPLYING FORMATTER HERE */}
                    <Text style={styles.statValue}>
                      {formatMarketCap(stockInfo.MarketCapitalization)}
                    </Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>52W High</Text>
                    <Text style={styles.statValue}>{stockInfo['52WeekHigh']}</Text>
                </View>
                 <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Sector</Text>
                    <Text style={styles.statValue}>{stockInfo.Sector}</Text>
                </View>
                 <View style={styles.statItem}>
                    <Text style={styles.statLabel}>P/E Ratio</Text>
                    <Text style={styles.statValue}>{stockInfo.PERatio}</Text>
                </View>
            </View>
        </View>

        {/* --- WATCHLIST BUTTON --- */}
        <TouchableOpacity 
          style={[styles.addButton, isSavedInAny && styles.savedButton]} 
          onPress={() => setModalVisible(true)}
        >
          <Text style={[styles.addButtonText, isSavedInAny && styles.savedButtonText]}>
            {isSavedInAny ? "Manage Watchlists" : "+ Add to Watchlist"}
          </Text>
        </TouchableOpacity>

        {/* --- SELECTION MODAL --- */}
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
                  const isChecked = wl.stocks.some(s => s.ticker === currentTicker);
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

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  ticker: { fontSize: 24, fontWeight: 'bold' },
  name: { fontSize: 14, color: '#666' },
  priceContainer: { alignItems: 'flex-end' },
  price: { fontSize: 24, fontWeight: 'bold' },
  change: { fontSize: 16, fontWeight: 'bold' },
  chartContainer: { alignItems: 'center', marginVertical: 10 },
  
  // Range Selector
  rangeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, backgroundColor: '#f0f0f0', borderRadius: 8, padding: 4 },
  rangeButton: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 6 },
  activeRange: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  rangeText: { fontSize: 14, color: '#666', fontWeight: '600' },
  activeRangeText: { color: '#000', fontWeight: 'bold' },

  // About Section
  aboutSection: { marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  description: { fontSize: 14, color: '#444', lineHeight: 20, marginBottom: 15 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statItem: { width: '48%', backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8, marginBottom: 10 },
  statLabel: { fontSize: 12, color: '#888' },
  statValue: { fontSize: 14, fontWeight: '600', marginTop: 4 },

  // Watchlist Button
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