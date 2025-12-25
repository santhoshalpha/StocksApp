import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { useWatchlist } from '../context/WatchlistContext';
import { LineChart } from "react-native-chart-kit"; // <--- 1. Import the Chart

export default function DetailsScreen({ route }) {
  const { stock } = route.params;
  const { addToWatchlist, removeFromWatchlist, watchlist } = useWatchlist();
  
  const isSaved = watchlist.some((item) => item.ticker === stock.ticker);

  const handleToggleWatchlist = () => {
    if (isSaved) {
      removeFromWatchlist(stock.ticker);
    } else {
      addToWatchlist(stock);
    }
  };

  const isGainer = stock.change_percentage.includes('+') || !stock.change_percentage.includes('-');
  const color = isGainer ? '#137333' : '#c5221f';
  const screenWidth = Dimensions.get("window").width;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.ticker}>{stock.ticker}</Text>
            <Text style={styles.name}>Company Name</Text> 
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${stock.price}</Text>
            <Text style={[styles.change, { color: color }]}>
              {stock.change_percentage}
            </Text>
          </View>
        </View>

        {/* 2. The Line Graph */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Price History (Mock)</Text>
          <LineChart
            data={{
              labels: ["1H", "24H", "1W", "1M", "3M", "1Y"], // Timeframes
              datasets: [
                {
                  // We are fake-generating data based on the stock price to make it look realistic
                  data: [
                    parseFloat(stock.price) * 0.95,
                    parseFloat(stock.price) * 0.98,
                    parseFloat(stock.price) * 1.02,
                    parseFloat(stock.price) * 0.96,
                    parseFloat(stock.price) * 1.05,
                    parseFloat(stock.price)
                  ]
                }
              ]
            }}
            width={screenWidth - 40} // Width of screen minus padding
            height={220}
            yAxisLabel="$"
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 2, 
              color: (opacity = 1) => isGainer ? `rgba(19, 115, 51, ${opacity})` : `rgba(197, 34, 31, ${opacity})`, // Green or Red line
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: "4",
                strokeWidth: "2",
                stroke: isGainer ? "#137333" : "#c5221f"
              }
            }}
            bezier // Makes the line curvy instead of sharp
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
          />
        </View>

        {/* Watchlist Button */}
        <TouchableOpacity 
          style={[styles.addButton, isSaved && styles.removeButton]} 
          onPress={handleToggleWatchlist}
        >
          <Text style={[styles.addButtonText, isSaved && styles.removeButtonText]}>
            {isSaved ? "Remove from Watchlist" : "+ Add to Watchlist"}
          </Text>
        </TouchableOpacity>

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
  
  chartContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  chartTitle: {
    alignSelf: 'flex-start',
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 10
  },
  
  addButton: { backgroundColor: '#000', padding: 16, borderRadius: 12, alignItems: 'center' },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  removeButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#c5221f' },
  removeButtonText: { color: '#c5221f' },
});