import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { getChildren, getLatestPosition, getZones } from '../services/api';

export default function MapScreen() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [position, setPosition] = useState(null);
  const [zones, setZones] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadChildren = useCallback(async () => {
    const data = await getChildren();
    setChildren(data);
    if (data.length > 0 && !selectedChild) {
      setSelectedChild(data[0]);
    }
  }, [selectedChild]);

  const loadPosition = useCallback(async () => {
    if (!selectedChild) return;
    const pos = await getLatestPosition(selectedChild.id);
    setPosition(pos);
    const z = await getZones(selectedChild.id);
    setZones(z);
  }, [selectedChild]);

  useEffect(() => { loadChildren(); }, []);
  useEffect(() => { loadPosition(); }, [selectedChild]);

  // Rafraîchit automatiquement toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(loadPosition, 30000);
    return () => clearInterval(interval);
  }, [loadPosition]);

  async function onRefresh() {
    setRefreshing(true);
    await loadPosition();
    setRefreshing(false);
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal style={styles.childSelector} showsHorizontalScrollIndicator={false}>
        {children.map((child) => (
          <TouchableOpacity
            key={child.id}
            style={[styles.childChip, selectedChild?.id === child.id && styles.childChipActive]}
            onPress={() => setSelectedChild(child)}
          >
            <Text style={[styles.childChipText, selectedChild?.id === child.id && styles.childChipTextActive]}>
              {child.nom}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {position ? (
        <MapView
          style={styles.map}
          region={{
            latitude: position.latitude,
            longitude: position.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{ latitude: position.latitude, longitude: position.longitude }}
            title={selectedChild?.nom}
            description={`Mis à jour: ${new Date(position.recorded_at).toLocaleString('fr-FR')}`}
          />
          {zones.map((zone) => (
            <Circle
              key={zone.id}
              center={{ latitude: zone.latitude, longitude: zone.longitude }}
              radius={zone.rayon_metres}
              strokeColor="rgba(37,99,235,0.8)"
              fillColor="rgba(37,99,235,0.15)"
            />
          ))}
        </MapView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {selectedChild ? 'Aucune position reçue pour le moment' : 'Ajoute un enfant pour commencer'}
          </Text>
        </View>
      )}

      {position && (
        <View style={styles.infoBar}>
          <Text style={styles.infoText}>
            Dernière position : {new Date(position.recorded_at).toLocaleString('fr-FR')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  childSelector: { padding: 12, backgroundColor: '#fff', maxHeight: 60 },
  childChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#f1f5f9', marginRight: 8,
  },
  childChipActive: { backgroundColor: '#2563eb' },
  childChipText: { color: '#333' },
  childChipTextActive: { color: '#fff', fontWeight: '600' },
  map: { flex: 1 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { color: '#666', textAlign: 'center' },
  infoBar: { padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  infoText: { textAlign: 'center', color: '#333' },
});
