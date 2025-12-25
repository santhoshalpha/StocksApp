import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  Dimensions, ActivityIndicator, ScrollView, Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from "react-native-chart-kit";

// Contexts & API
import { useWatchlist } from '../context/WatchlistContext';
import { fetchStockDetails, fetchChartData } from '../api/stockService'; 

const RANGES = ['1D', '1W', '1M', '3M', '1Y'];

// --- HELPER: Formatting ---
const formatNumber = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return "-";
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatLargeNumber = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return "-"; 
  if (num >= 1.0e+12) return (num / 1.0e+12).toFixed(2) + "T";
  if (num >= 1.0e+9)  return (num / 1.0e+9).toFixed(2) + "B";
  if (num >= 1.0e+6)  return (num / 1.0e+6).toFixed(2) + "M";
  return num.toString();
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || "-"}</Text>
  </View>
);

const Section = ({ title, children }) => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionHeader}>{title}</Text>
    <View style={styles.sectionContent}>
      {children}
    </View>
  </View>
);

export default function DetailsScreen({ route }) {
  const { stock: initialStock } = route.params;
  const screenWidth = Dimensions.get("window").width;
  const { watchlists, addToWatchlist, removeFromWatchlist } = useWatchlist();
  
  const [stockInfo, setStockInfo] = useState(initialStock); 
  const [chartData, setChartData] = useState(null); 
  const [selectedRange, setSelectedRange] = useState('1W'); 
  const [loadingChart, setLoadingChart] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // --- FETCH DETAILS ---
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

  // --- FETCH CHART ---
  useEffect(() => {
    let isMounted = true;
    const loadChart = async () => {
      setLoadingChart(true);
      const data = await fetchChartData(initialStock.ticker, selectedRange);
      if (isMounted) {
        setChartData(data && data.length > 0 ? data : []);
        setLoadingChart(false);
      }
    };
    loadChart();
    return () => { isMounted = false; };
  }, [selectedRange, initialStock.ticker]);

  // Chart Data Preparation
  const finalPrices = (chartData && chartData.length > 0) ? chartData.map(d => d.value) : [100, 100];
  const rawLabels = (chartData && chartData.length > 0) ? chartData.map(d => d.label) : ["-", "-"];
  const finalLabels = rawLabels.map((label, index) => {
      const step = Math.ceil(rawLabels.length / 5);
      return index % step === 0 ? label : "";
  });

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
        ticker: currentTicker, price: price, change_percentage: changePct, name: stockInfo.Name || initialStock.name
    };
    isPresent ? removeFromWatchlist(watchlistId, currentTicker) : addToWatchlist(watchlistId, stockToSave);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={{flex: 1}}>
            <Text style={styles.ticker}>{currentTicker}</Text>
            <Text style={styles.name} numberOfLines={1}>{stockInfo.Name}</Text> 
            <Text style={styles.exchange}>{stockInfo.Exchange} • {stockInfo.Currency}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${price}</Text>
            <Text style={[styles.change, { color: color }]}>{changePct}</Text>
          </View>
        </View>

        {/* CHART */}
        <View style={styles.chartContainer}>
           {loadingChart ? <ActivityIndicator size="large" color="#000" style={{height: 220}} /> : (
             <LineChart
              data={{ labels: finalLabels, datasets: [{ data: finalPrices }] }}
              width={screenWidth - 40} height={220}
              yAxisLabel="$"
              chartConfig={{
                backgroundColor: "#fff", backgroundGradientFrom: "#fff", backgroundGradientTo: "#fff",
                decimalPlaces: 2, color: (opacity = 1) => isGainer ? `rgba(19, 115, 51, ${opacity})` : `rgba(197, 34, 31, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                propsForDots: { r: "0" },
              }}
              bezier withVerticalLines={false} withHorizontalLines={true}
            />
           )}
        </View>

        {/* RANGES */}
        <View style={styles.rangeContainer}>
          {RANGES.map((range) => (
            <TouchableOpacity key={range} 
              style={[styles.rangeButton, selectedRange === range && styles.activeRange]}
              onPress={() => setSelectedRange(range)}>
              <Text style={[styles.rangeText, selectedRange === range && styles.activeRangeText]}>{range}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ABOUT */}
        <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>
              {stockInfo.Description || "Description unavailable."}
            </Text>
            <Text style={styles.subDetail}>Industry: {stockInfo.Industry}</Text>
            <Text style={styles.subDetail}>Sector: {stockInfo.Sector}</Text>
            <Text style={styles.subDetail}>Address: {stockInfo.Address}</Text>
        </View>

        {/* --- DETAILED STATS GRID --- */}
        <View style={styles.statsContainer}>
          
          <Section title="Valuation">
            <InfoRow label="Market Cap" value={formatLargeNumber(stockInfo.MarketCapitalization)} />
            <InfoRow label="P/E Ratio" value={stockInfo.PERatio} />
            <InfoRow label="Forward P/E" value={stockInfo.ForwardPE} />
            <InfoRow label="PEG Ratio" value={stockInfo.PEGRatio} />
            <InfoRow label="Book Value" value={stockInfo.BookValue} />
            <InfoRow label="Price/Book" value={stockInfo.PriceToBookRatio} />
            <InfoRow label="EPS" value={stockInfo.EPS} />
            <InfoRow label="Beta" value={stockInfo.Beta} />
          </Section>

          <Section title="Trading Information">
            <InfoRow label="52W High" value={formatNumber(stockInfo['52WeekHigh'])} />
            <InfoRow label="52W Low" value={formatNumber(stockInfo['52WeekLow'])} />
            <InfoRow label="50 Day MA" value={formatNumber(stockInfo['50DayMovingAverage'])} />
            <InfoRow label="200 Day MA" value={formatNumber(stockInfo['200DayMovingAverage'])} />
            <InfoRow label="Analyst Target" value={formatNumber(stockInfo.AnalystTargetPrice)} />
          </Section>

          <Section title="Dividends & Income">
            <InfoRow label="Dividend Yield" value={stockInfo.DividendYield ? `${(stockInfo.DividendYield * 100).toFixed(2)}%` : "-"} />
            <InfoRow label="Div. Per Share" value={stockInfo.DividendPerShare} />
            <InfoRow label="Ex-Div Date" value={stockInfo.ExDividendDate} />
            <InfoRow label="Payout Date" value={stockInfo.DividendDate} />
          </Section>

          <Section title="Financial Performance">
            <InfoRow label="Revenue (TTM)" value={formatLargeNumber(stockInfo.RevenueTTM)} />
            <InfoRow label="Gross Profit" value={formatLargeNumber(stockInfo.GrossProfitTTM)} />
            <InfoRow label="EBITDA" value={formatLargeNumber(stockInfo.EBITDA)} />
            <InfoRow label="Profit Margin" value={stockInfo.ProfitMargin ? `${(stockInfo.ProfitMargin * 100).toFixed(2)}%` : "-"} />
            <InfoRow label="Fiscal Year End" value={stockInfo.FiscalYearEnd} />
          </Section>

        </View>

        {/* WATCHLIST BUTTON */}
        <TouchableOpacity style={[styles.addButton, isSavedInAny && styles.savedButton]} onPress={() => setModalVisible(true)}>
          <Text style={[styles.addButtonText, isSavedInAny && styles.savedButtonText]}>
            {isSavedInAny ? "Manage Watchlists" : "+ Add to Watchlist"}
          </Text>
        </TouchableOpacity>

        {/* MODAL (Keep Existing) */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Save to...</Text>
              <ScrollView style={{maxHeight: 200}}>
                {watchlists.map((wl) => {
                  const isChecked = wl.stocks.some(s => s.ticker === currentTicker);
                  return (
                    <TouchableOpacity key={wl.id} style={styles.checkRow} onPress={() => toggleStockInList(wl.id)}>
                      <Text style={styles.listName}>{wl.name}</Text>
                      <Ionicons name={isChecked ? "checkbox" : "square-outline"} size={24} color={isChecked ? "black" : "#ccc"} />
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
  content: { padding: 20, paddingBottom: 60 },
  
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  ticker: { fontSize: 28, fontWeight: 'bold' },
  name: { fontSize: 16, color: '#333', fontWeight: '500' },
  exchange: { fontSize: 12, color: '#888', marginTop: 2 },
  priceContainer: { alignItems: 'flex-end' },
  price: { fontSize: 28, fontWeight: 'bold' },
  change: { fontSize: 18, fontWeight: '600' },
  
  // Chart & Range
  chartContainer: { alignItems: 'center', marginVertical: 10 },
  rangeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, backgroundColor: '#f5f5f5', borderRadius: 8, padding: 4 },
  rangeButton: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 6 },
  activeRange: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  rangeText: { fontSize: 13, color: '#666', fontWeight: '600' },
  activeRangeText: { color: '#000', fontWeight: 'bold' },

  // Sections
  aboutSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 14, color: '#444', lineHeight: 22, marginBottom: 12 },
  subDetail: { fontSize: 13, color: '#666', marginBottom: 2 },

  statsContainer: { marginBottom: 20 },
  sectionContainer: { marginBottom: 24, backgroundColor: '#fafafa', padding: 16, borderRadius: 12 },
  sectionHeader: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#000' },
  sectionContent: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  
  infoRow: { width: '48%', marginBottom: 12 },
  infoLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#000' },

  // Buttons & Modal
  addButton: { backgroundColor: '#000', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  savedButton: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#000' },
  savedButtonText: { color: '#000' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 30 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  checkRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  listName: { fontSize: 16 },
  doneBtn: { marginTop: 20, alignItems: 'center', padding: 10 },
  doneText: { fontWeight: 'bold', fontSize: 16 }
});