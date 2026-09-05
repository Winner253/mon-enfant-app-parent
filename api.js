import AsyncStorage from '@react-native-async-storage/async-storage';

// URL du backend déployé sur Railway (à remplacer après déploiement)
export const API_URL = 'https://mon-enfant-backend-production.up.railway.app/api';

async function authHeaders() {
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function register(email, password, nom) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, nom }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur inscription');
  await AsyncStorage.setItem('token', data.token);
  return data;
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur connexion');
  await AsyncStorage.setItem('token', data.token);
  return data;
}

export async function logout() {
  await AsyncStorage.removeItem('token');
}

export async function getChildren() {
  const res = await fetch(`${API_URL}/children`, { headers: await authHeaders() });
  return res.json();
}

export async function createChild(nom) {
  const res = await fetch(`${API_URL}/children`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ nom }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur création enfant');
  return data;
}

export async function getLatestPosition(childId) {
  const res = await fetch(`${API_URL}/positions/${childId}/latest`, { headers: await authHeaders() });
  if (res.status === 404) return null;
  return res.json();
}

export async function getPositionHistory(childId, since) {
  const url = since
    ? `${API_URL}/positions/${childId}/history?since=${encodeURIComponent(since)}`
    : `${API_URL}/positions/${childId}/history`;
  const res = await fetch(url, { headers: await authHeaders() });
  return res.json();
}

export async function getZones(childId) {
  const res = await fetch(`${API_URL}/zones/${childId}`, { headers: await authHeaders() });
  return res.json();
}

export async function createZone(childId, zone) {
  const res = await fetch(`${API_URL}/zones/${childId}`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(zone),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur création zone');
  return data;
}

export async function deleteZone(childId, zoneId) {
  await fetch(`${API_URL}/zones/${childId}/${zoneId}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
}

export async function getAlerts(childId) {
  const res = await fetch(`${API_URL}/alerts/${childId}`, { headers: await authHeaders() });
  return res.json();
}
