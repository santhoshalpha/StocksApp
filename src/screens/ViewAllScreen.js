import React from 'react';
import { View, StyleSheet, FlatList} from 'react-native';
import StockCard from '../components/StockCard';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function ViewAllScreen({ route, navigation }) {
  // Get the data passed from ExploreScreen
  const { items, type } = route.params;

  const handlePress = (stock) => {
    navigation.navigate('Details', { stock });
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.ticker}
        contentContainerStyle={styles.listContent}
        numColumns={2} // Grid layout (2 columns)
        renderItem={({ item }) => (
          <StockCard 
            item={item} 
            type={type} 
            onPress={() => handlePress(item)} 
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
    // Add some bottom padding so the last items aren't cut off
    paddingBottom: 40,
  },
});