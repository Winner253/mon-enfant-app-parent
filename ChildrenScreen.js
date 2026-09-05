import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { getChildren, createChild } from '../services/api';

export default function ChildrenScreen() {
  const [children, setChildren] = useState([]);
  const [nom, setNom] = useState('');

  useEffect(() => { refresh(); }, []);

  async function refresh() {
    const data = await getChildren();
    setChildren(data);
  }

  async function handleAdd() {
    if (!nom.trim()) {
      Alert.alert('Nom manquant', "Entre le nom de l'enfant.");
      return;
    }
    try {
      const child = await createChild(nom.trim());
      setNom('');
      refresh();
      Alert.alert(
        'Enfant ajouté',
        `Code à saisir dans l'app installée sur le téléphone de ${child.nom} :\n\n${child.code_appareil}`
      );
    } catch (err) {
      Alert.alert('Erreur', err.message);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nom de l'enfant"
          value={nom}
          onChangeText={setNom}
        />
        <TouchableOpacity style={styles.button} onPress={handleAdd}>
          <Text style={styles.buttonText}>Ajouter un enfant</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={children}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.nom}>{item.nom}</Text>
            <Text style={styles.code}>Code appareil : {item.code_appareil}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Aucun enfant ajouté pour le moment</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  form: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 8 },
  button: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  row: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  nom: { fontSize: 16, fontWeight: '600' },
  code: { fontSize: 13, color: '#666', marginTop: 4 },
  empty: { textAlign: 'center', color: '#666', marginTop: 40 },
});
