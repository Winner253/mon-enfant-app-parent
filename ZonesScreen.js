import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, FlatList } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { getChildren, getZones, createZone, deleteZone } from '../services/api';

export default function ZonesScreen() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [zones, setZones] = useState([]);
  const [pendingPoint, setPendingPoint] = useState(null);
  const [nomZone, setNomZone] = useState('');
  const [rayon, setRayon] = useState('200');

  useEffect(() => {
    (async () => {
      const data = await getChildren();
      setChildren(data);
      if (data.length > 0) setSelectedChild(data[0]);
    })();
  }, []);

  useEffect(() => {
    if (selectedChild) refreshZones();
  }, [selectedChild]);

  async function refreshZones() {
    const data = await getZones(selectedChild.id);
    setZones(data);
  }

  async function handleCreateZone() {
    if (!pendingPoint || !nomZone) {
      Alert.alert('Champs manquants', 'Touche la carte pour choisir un point et donne un nom à la zone.');
      return;
    }
    try {
      await createZone(selectedChild.id, {
        nom: nomZone,
        latitude: pendingPoint.latitude,
        longitude: pendingPoint.longitude,
        rayon_metres: Number(rayon) || 200,
      });
      setPendingPoint(null);
      setNomZone('');
      refreshZones();
    } catch (err) {
      Alert.alert('Erreur', err.message);
    }
  }

  async function handleDeleteZone(zoneId) {
    await deleteZone(selectedChild.id, zoneId);
    refreshZones();
  }

  if (!selectedChild) {
    return (
      <View style={styles.emptyState}>
        <Text>Ajoute d'abord un enfant.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: pendingPoint?.latitude || 0,
          longitude: pendingPoint?.longitude || 0,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={(e) => setPendingPoint(e.nativeEvent.coordinate)}
      >
        {zones.map((zone) => (
          <Circle
            key={zone.id}
            center={{ latitude: zone.latitude, longitude: zone.longitude }}
            radius={zone.rayon_metres}
            strokeColor="rgba(37,99,235,0.8)"
            fillColor="rgba(37,99,235,0.15)"
          />
        ))}
        {pendingPoint && (
          <Marker coordinate={pendingPoint} pinColor="orange" title="Nouvelle zone" />
        )}
      </MapView>

      <View style={styles.form}>
        <Text style={styles.hint}>Touche la carte pour placer le centre de la zone</Text>
        <TextInput
          style={styles.input}
          placeholder="Nom de la zone (ex: École)"
          value={nomZone}
          onChangeText={setNomZone}
        />
        <TextInput
          style={styles.input}
          placeholder="Rayon en mètres"
          value={rayon}
          onChangeText={setRayon}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button} onPress={handleCreateZone}>
          <Text style={styles.buttonText}>Créer la zone</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.list}
        data={zones}
        keyExtractor={(z) => z.id}
        renderItem={({ item }) => (
          <View style={styles.zoneRow}>
            <Text>{item.nom} ({item.rayon_metres}m)</Text>
            <TouchableOpacity onPress={() => handleDeleteZone(item.id)}>
              <Text style={styles.deleteText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { height: '45%' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  form: { padding: 12, backgroundColor: '#fff' },
  hint: { color: '#666', marginBottom: 8, fontSize: 13 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 8 },
  button: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  list: { flex: 1, padding: 12 },
  zoneRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  deleteText: { color: '#dc2626' },
});
