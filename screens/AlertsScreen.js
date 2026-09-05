import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { getChildren, getAlerts } from '../services/api';

export default function AlertsScreen() {
  const [selectedChild, setSelectedChild] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadAlerts = useCallback(async (child) => {
    const target = child || selectedChild;
    if (!target) return;
    const data = await getAlerts(target.id);
    setAlerts(data);
  }, [selectedChild]);

  useEffect(() => {
    (async () => {
      const children = await getChildren();
      if (children.length > 0) {
        setSelectedChild(children[0]);
        loadAlerts(children[0]);
      }
    })();
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alertes {selectedChild ? `- ${selectedChild.nom}` : ''}</Text>
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.time}>{new Date(item.created_at).toLocaleString('fr-FR')}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Aucune alerte pour le moment</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 16, fontWeight: '600', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  row: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  message: { fontSize: 15, color: '#333' },
  time: { fontSize: 12, color: '#666', marginTop: 4 },
  empty: { textAlign: 'center', color: '#666', marginTop: 40 },
});
