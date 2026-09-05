import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { getChildren, getLatestPosition, getZones } from '../services/api';

function buildMapHtml(lat, lng, childName, zones) {
  const zonesJs = zones.map(z =>
    `L.circle([${z.latitude}, ${z.longitude}], {radius: ${z.rayon_metres}, color: '#2563eb', fillOpacity: 0.15}).addTo(map);`
  ).join('\n');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map').setView([${lat}, ${lng}], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    L.marker([${lat}, ${lng}]).addTo(map).bindPopup('${childName}').openPopup();
    ${zonesJs}
  </script>
</body>
</html>
  `;
}

export default function MapScreen() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [position, setPosition] = useState(null);
  const [zones, setZones] = useState([]);

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

  useEffect(() => {
    const interval = setInterval(loadPosition, 30000);
    return () => clearInterval(interval);
  }, [loadPosition]);

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
        <WebView
          style={styles.map}
          originWhitelist={['*']}
          source={{ html: buildMapHtml(position.latitude, position.longitude, selectedChild?.nom || '', zones) }}
        />
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
                           
