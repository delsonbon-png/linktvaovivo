import React, { useContext } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, AuthContext } from './src/context/AuthContext';
import AuthScreen from './src/screens/AuthScreen';
import TvScreen from './src/screens/TvScreen';
import AssinanteScreen from './src/screens/AssinanteScreen';
import PerfilScreen from './src/screens/PerfilScreen';
import AdminPanelScreen from './src/screens/AdminPanelScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ name, focused }) {
  const icons = { Tv: '📺', Assinante: '💬', Perfil: '👤' };
  return (
    <Text style={{ fontSize: focused ? 22 : 18, opacity: focused ? 1 : 0.5 }}>
      {icons[name]}
    </Text>
  );
}

function PerfilStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PerfilMain" component={PerfilScreen} />
      <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarLabel: ({ focused }) => (
          <Text style={{
            fontSize: 10,
            fontWeight: focused ? '700' : '400',
            color: focused ? '#7c6aff' : '#555',
            marginBottom: 2,
          }}>
            {route.name}
          </Text>
        ),
        tabBarStyle: {
          backgroundColor: '#0d0d1a',
          borderTopColor: '#ffffff0a',
          borderTopWidth: 1,
          height: 72,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#7c6aff',
        tabBarInactiveTintColor: '#555',
      })}
    >
      <Tab.Screen name="Tv" component={TvScreen} />
      <Tab.Screen name="Assinante" component={AssinanteScreen} />
      <Tab.Screen name="Perfil" component={PerfilStack} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0f', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 48 }}>📺</Text>
        <ActivityIndicator color="#7c6aff" style={{ marginTop: 20 }} />
      </View>
    );
  }

  return user ? <MainTabs /> : <AuthScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
