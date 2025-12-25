// src/screens/WatchlistScreen.js
import React, { useContext } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet } from 'react-native';
import { AppContext } from '../context/AppContext';
import { Colors } from '../theme/colors';

export default function WatchlistScreen({ navigation }) {
  const { watchlists, theme } = useContext(AppContext);
  const colors = Colors[theme];

  const sections = Object.keys(watchlists).map(name => ({
    title: name,
    data: watchlists[name]
  }));

  if (sections.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>No watchlists created yet.</Text>
      </View>
    );
  }

  return (
    <SectionList
      style={{ flex: 1, backgroundColor: colors.background }}
      sections={sections}
      keyExtractor={(item, index) => item.ticker + index}
      renderSectionHeader={({ section: { title } }) => (
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <Text style={[styles.headerText, { color: colors.text }]}>{title}</Text>
        </View>
      )}
      renderItem={({ item }) => (
        <TouchableOpacity 
          style={styles.item}
          onPress={() => navigation.navigate('Details', { symbol: item.ticker })}
        >
          <Text style={{ color: colors.text, fontSize: 16 }}>{item.ticker}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  headerText: { fontSize: 18, fontWeight: 'bold' },
  item: { padding: 15, borderBottomWidth: 0.5, borderBottomColor: '#eee' }
});