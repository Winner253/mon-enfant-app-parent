import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { getChildren, getPositionHistory } from '../services/api';

export default function HistoryScreen() {
  const [selectedChild, setSelectedChild] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    (async () => {
      const children = await getChildren();
      if (children.length > 0) {
        setSelectedChild(children[0]);
        // dernières 24h par défaut
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const data = await getPositionHistory(children[0].id, since);
        setHistory(data.reverse());
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Historique {selectedChild ? `- ${selectedChild.nom}` : ''} (24 dernières heures)
      </Text>
      <FlatList
        data={history}
        keyExtractor={(item, index) => `${item.recorded_at}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.time}>{new Date(item.recorded_at).toLocaleString('fr-FR')}</Text>
            <Text style={styles.coords}>
              {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Aucune position enregistrée</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 16, fontWeight: '600', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  row: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  time: { fontSize: 14, color: '#333' },
  coords: { fontSize: 12, color: '#666', marginTop: 2 },
  empty: { textAlign: 'center', color: '#666', marginTop: 40 },
});
