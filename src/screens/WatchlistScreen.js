import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet,  ScrollView, 
  TouchableOpacity, Modal, TextInput, Alert 
} from 'react-native';
import { useWatchlist } from '../context/WatchlistContext';
import StockCard from '../components/StockCard';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WatchlistScreen({ navigation }) {
  const { watchlists, createWatchlist, deleteWatchlist, removeFromWatchlist } = useWatchlist();
  
  const [activeListId, setActiveListId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newListName, setNewListName] = useState('');

  // Set default active list
  useEffect(() => {
    if (activeListId === null && watchlists && watchlists.length > 0) {
      setActiveListId(watchlists[0].id);
    }
  }, [watchlists]);

  const safeWatchlists = watchlists || [];
  const activeList = safeWatchlists.find(wl => wl.id === activeListId) || { stocks: [] };

  const handleCreate = () => {
    if (newListName.trim().length === 0) return;
    createWatchlist(newListName);
    setNewListName('');
    setModalVisible(false);
  };

  const handleDeleteList = () => {
    Alert.alert("Delete List", "Are you sure you want to delete this entire list?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => {
          deleteWatchlist(activeListId);
          if (safeWatchlists.length > 1) setActiveListId(safeWatchlists[0].id);
      }}
    ]);
  };

 //remove stock-
  const handleRemoveStock = (stock) => {
    Alert.alert(
      "Remove Stock", 
      `Remove ${stock.ticker} from ${activeList.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive", 
          onPress: () => removeFromWatchlist(activeListId, stock.ticker) 
        }
      ]
    );
  };

  const handlePressStock = (stock) => {
    navigation.navigate('Home', { screen: 'Details', params: { stock } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.header}>My Watchlist</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle-outline" size={28} color="black" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        {safeWatchlists.length > 0 && (
          <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {safeWatchlists.map(wl => {
                const isActive = wl.id === activeListId;
                return (
                  <TouchableOpacity 
                    key={wl.id} 
                    style={[styles.tab, isActive && styles.activeTab]}
                    onPress={() => setActiveListId(wl.id)}
                  >
                    <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                      {wl.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Grid */}
        {activeList.stocks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No stocks here yet.</Text>
            <Text style={styles.subText}>Go to Explore to add some!</Text>
            <TouchableOpacity onPress={handleDeleteList} style={{marginTop: 20}}>
                <Text style={{color: 'red', fontSize: 14}}>Delete this list</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.grid}>
            {activeList.stocks.map((stock, index) => {
              const isLoser = stock.change_percentage.includes('-');
              return (
                <StockCard 
                  key={index} 
                  item={stock} 
                  type={isLoser ? 'loser' : 'gainer'}
                  onPress={() => handlePressStock(stock)}
                  onRemove={handleRemoveStock} // <--- Pass the function here
                />
              );
            })}
          </View>
        )}

      </ScrollView>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Watchlist</Text>
            <TextInput 
              style={styles.input}
              placeholder="List Name (e.g. Risky Bets)"
              value={newListName}
              onChangeText={setNewListName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreate} style={styles.createBtn}>
                <Text style={{color: '#fff', fontWeight: 'bold'}}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  header: { fontSize: 28, fontWeight: 'bold' },
  tabsContainer: { marginBottom: 20, height: 40 },
  tab: { marginRight: 10, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#f0f0f0', justifyContent: 'center' },
  activeTab: { backgroundColor: '#000' },
  tabText: { color: '#666', fontWeight: '600' },
  activeTabText: { color: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  emptyContainer: { marginTop: 50, alignItems: 'center' },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  subText: { fontSize: 14, color: '#888', marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  cancelBtn: { padding: 12 },
  createBtn: { backgroundColor: '#000', padding: 12, borderRadius: 8 },
});