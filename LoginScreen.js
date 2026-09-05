import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { login, register } from '../services/api';

export default function LoginScreen({ onLoggedIn }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email || !password) {
      Alert.alert('Champs manquants', 'Entre ton email et ton mot de passe.');
      return;
    }
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password, nom);
      } else {
        await login(email, password);
      }
      onLoggedIn();
    } catch (err) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mon Enfant</Text>
      <Text style={styles.subtitle}>{isRegister ? 'Créer un compte parent' : 'Connexion'}</Text>

      {isRegister && (
        <TextInput
          style={styles.input}
          placeholder="Votre nom"
          value={nom}
          onChangeText={setNom}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Patiente...' : isRegister ? "S'inscrire" : 'Se connecter'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
        <Text style={styles.switchText}>
          {isRegister ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? Créer un compte'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 24 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 12, fontSize: 16, marginBottom: 12,
  },
  button: { backgroundColor: '#2563eb', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  switchText: { color: '#2563eb', textAlign: 'center', marginTop: 16 },
});
