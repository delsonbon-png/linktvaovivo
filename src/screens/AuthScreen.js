import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { loginUser, registerUser, getSession } from '../utils/storage';
import { AuthContext } from '../context/AuthContext';

export default function AuthScreen() {
  const { setUser } = useContext(AuthContext);
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  function formatCPF(text) {
    const digits = text.replace(/\D/g, '').slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
  }

  function rawCPF(formatted) {
    return formatted.replace(/\D/g, '');
  }

  async function handleLogin() {
    if (!cpf || !password) {
      if (Platform.OS === 'web') {
        window.alert('Preencha todos os campos.');
      } else {
        Alert.alert('Atenção', 'Preencha todos os campos.');
      }
      return;
    }
    setLoading(true);
    const result = await loginUser(rawCPF(cpf), password);
    setLoading(false);
    if (!result.success) {
      if (Platform.OS === 'web') {
        window.alert(result.message);
      } else {
        Alert.alert('Erro', result.message);
      }
      return;
    }
    setUser(result.user);
  }

  async function handleRegister() {
    if (!cpf || !password || !name) {
      if (Platform.OS === 'web') {
        window.alert('Preencha todos os campos.');
      } else {
        Alert.alert('Atenção', 'Preencha todos os campos.');
      }
      return;
    }
    if (rawCPF(cpf).length !== 11) {
      if (Platform.OS === 'web') {
        window.alert('CPF inválido.');
      } else {
        Alert.alert('Atenção', 'CPF inválido.');
      }
      return;
    }
    setLoading(true);
    const result = await registerUser(rawCPF(cpf), password, name);
    setLoading(false);

    if (!result.success) {
      if (Platform.OS === 'web') {
        window.alert(result.message);
      } else {
        Alert.alert('Erro', result.message);
      }
      return;
    }

    if (Platform.OS === 'web') {
      window.alert('cadastrado com sucesso');
      setMode('login');
    } else {
      Alert.alert('Sucesso', 'cadastrado com sucesso', [
        { text: 'OK', onPress: () => setMode('login') }
      ]);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo / Header */}
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>📺</Text>
          <Text style={styles.appName}>Link TV</Text>
          <Text style={styles.tagline}>Sua TV ao vivo</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, mode === 'login' && styles.tabActive]}
              onPress={() => setMode('login')}
            >
              <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Entrar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'register' && styles.tabActive]}
              onPress={() => setMode('register')}
            >
              <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>Cadastrar</Text>
            </TouchableOpacity>
          </View>

          {mode === 'register' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={styles.input}
                placeholder="Seu nome completo"
                placeholderTextColor="#666"
                value={name}
                onChangeText={setName}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CPF</Text>
            <TextInput
              style={styles.input}
              placeholder="000.000.000-00"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={cpf}
              onChangeText={(t) => setCpf(formatCPF(t))}
              maxLength={14}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor="#666"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={styles.btn}
            onPress={mode === 'login' ? handleLogin : handleRegister}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>{mode === 'login' ? 'Entrar' : 'Criar conta'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoBox: { alignItems: 'center', marginBottom: 36 },
  logoText: { fontSize: 64 },
  appName: { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: 2, marginTop: 8 },
  tagline: { fontSize: 14, color: '#7c6aff', marginTop: 4 },
  card: {
    backgroundColor: '#13131f',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: '#ffffff12',
    shadowColor: '#7c6aff',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  tabs: { flexDirection: 'row', backgroundColor: '#0a0a14', borderRadius: 14, padding: 4, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  tabActive: { backgroundColor: '#7c6aff' },
  tabText: { color: '#777', fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  inputGroup: { marginBottom: 16 },
  label: { color: '#aaa', fontSize: 12, marginBottom: 6, fontWeight: '600', letterSpacing: 1 },
  input: {
    backgroundColor: '#0d0d1a',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ffffff18',
  },
  btn: {
    backgroundColor: '#7c6aff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#7c6aff',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },
});
