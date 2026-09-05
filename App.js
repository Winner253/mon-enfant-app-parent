import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './screens/LoginScreen';
import MapScreen from './screens/MapScreen';
import HistoryScreen from './screens/HistoryScreen';
import ZonesScreen from './screens/ZonesScreen';
import AlertsScreen from './screens/AlertsScreen';
import ChildrenScreen from './screens/ChildrenScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('token');
      setLoggedIn(!!token);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!loggedIn) {
    return <LoginScreen onLoggedIn={() => setLoggedIn(true)} />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
        <Tab.Screen name="Carte" component={MapScreen} />
        <Tab.Screen name="Historique" component={HistoryScreen} />
        <Tab.Screen name="Zones" component={ZonesScreen} />
        <Tab.Screen name="Alertes" component={AlertsScreen} />
        <Tab.Screen name="Enfants" component={ChildrenScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
