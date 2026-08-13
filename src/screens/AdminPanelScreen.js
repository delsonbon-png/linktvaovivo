import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Alert, ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { addChannel, deleteChannel, getLocalChannels } from '../utils/storage';
import { fetchChannelsFromGithub, pushChannelsToGithub } from '../utils/github';
import { getGithubToken, saveGithubToken } from '../utils/storage';

export default function AdminPanelScreen({ navigation }) {
  const [channels, setChannels] = useState([]);
  const [channelName, setChannelName] = useState('');
  const [channelUrl, setChannelUrl] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [sha, setSha] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const token = await getGithubToken();
    setGithubToken(token);
    const result = await fetchChannelsFromGithub();
    setChannels(result.channels || []);
    if (result.sha) setSha(result.sha);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAddChannel = async () => {
    if (!channelName.trim() || !channelUrl.trim())
      return Alert.alert('Atenção', 'Informe o nome e o link do canal.');
    if (!channelUrl.startsWith('http'))
      return Alert.alert('Link inválido', 'O link deve começar com http:// ou https://');

    const updated = await addChannel(channelName.trim(), channelUrl.trim());
    setChannels(updated);
    setChannelName('');
    setChannelUrl('');
    Alert.alert('Canal adicionado!', 'Deseja sincronizar com o GitHub agora?', [
      { text: 'Depois', style: 'cancel' },
      { text: 'Sincronizar', onPress: () => syncToGitHub(updated) },
    ]);
  };

  const handleDelete = (id) => {
    Alert.alert('Remover canal', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          const updated = await deleteChannel(id);
          setChannels(updated);
        },
      },
    ]);
  };

  const syncToGitHub = async (list) => {
    const token = await getGithubToken();
    if (!token) {
      Alert.alert('Token necessário', 'Configure o GitHub Token na seção abaixo.');
      return;
    }
    setSyncing(true);
    const result = await pushChannelsToGithub(list || channels, sha);
    setSyncing(false);
    if (result.success) {
      Alert.alert('✅ Sincronizado!', 'Canais enviados ao GitHub com sucesso.');
      loadData();
    } else {
      Alert.alert('Erro', result.message);
    }
  };

  const saveToken = async () => {
    await saveGithubToken(githubToken.trim());
    Alert.alert('Salvo!', 'Token GitHub salvo com sucesso.');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ color: '#7c6aff', fontSize: 20 }}>‹</Text>
          <Text style={{ color: '#7c6aff', fontSize: 14, fontWeight: '600' }}>Perfil</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Painel Admin</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Add Channel */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>➕ Adicionar Canal</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome do Canal</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Globo HD"
                placeholderTextColor="#444"
                value={channelName}
                onChangeText={setChannelName}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Link do Canal (m3u8, rtmp, etc.)</Text>
              <TextInput
                style={styles.input}
                placeholder="https://..."
                placeholderTextColor="#444"
                value={channelUrl}
                onChangeText={setChannelUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={handleAddChannel} activeOpacity={0.85}>
              <Text style={styles.addBtnText}>Adicionar Canal</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.addBtn, { backgroundColor: '#25D366', marginTop: 12 }]} 
              onPress={async () => {
                const { DEFAULT_CHANNELS } = require('../utils/constants');
                const { saveLocalChannels } = require('../utils/storage');
                await saveLocalChannels(DEFAULT_CHANNELS);
                loadData();
                Alert.alert('Sucesso!', 'Canais brasileiros importados. Volte para a tela de TV.');
              }} 
              activeOpacity={0.85}
            >
              <Text style={styles.addBtnText}>🇧🇷 Importar Canais Brasileiros</Text>
            </TouchableOpacity>
          </View>

          {/* GitHub Sync */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>☁️ Sincronização GitHub</Text>
            <Text style={styles.hint}>
              Cole seu Personal Access Token do GitHub para sincronizar os canais com o repositório.
            </Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>GitHub Token</Text>
              <TextInput
                style={styles.input}
                placeholder="ghp_xxxxxxxxxxxx"
                placeholderTextColor="#444"
                value={githubToken}
                onChangeText={setGithubToken}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
            <View style={styles.row}>
              <TouchableOpacity style={styles.saveTokenBtn} onPress={saveToken} activeOpacity={0.85}>
                <Text style={styles.saveTokenText}>Salvar Token</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.syncBtn, syncing && { opacity: 0.6 }]}
                onPress={() => syncToGitHub()}
                disabled={syncing}
                activeOpacity={0.85}
              >
                {syncing ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.syncText}>🔄 Sincronizar</Text>}
              </TouchableOpacity>
            </View>
          </View>

          {/* Channel List */}
          <View style={styles.section}>
            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>📋 Canais ({channels.length})</Text>
              <TouchableOpacity onPress={loadData}>
                <Text style={{ color: '#7c6aff', fontSize: 13 }}>Atualizar</Text>
              </TouchableOpacity>
            </View>
            {loading ? (
              <ActivityIndicator color="#7c6aff" style={{ marginTop: 20 }} />
            ) : channels.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum canal cadastrado ainda.</Text>
            ) : (
              channels.map((ch) => (
                <View key={ch.id} style={styles.channelRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.chName}>{ch.name}</Text>
                    <Text style={styles.chUrl} numberOfLines={1}>{ch.url}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(ch.id)} style={styles.deleteBtn}>
                    <Text style={{ color: '#ff6b6b', fontSize: 18 }}>🗑</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: '#0d0d1a',
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff0a',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 60 },
  topTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  scroll: { padding: 16, paddingBottom: 40 },
  section: {
    backgroundColor: '#13131f',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffffff0a',
  },
  sectionTitle: { color: '#fff', fontWeight: '700', fontSize: 15, marginBottom: 14 },
  hint: { color: '#666', fontSize: 12, lineHeight: 18, marginBottom: 12 },
  inputGroup: { marginBottom: 12 },
  label: { color: '#888', fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 6 },
  input: {
    backgroundColor: '#0d0d1a',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ffffff14',
  },
  addBtn: {
    backgroundColor: '#7c6aff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#7c6aff',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  row: { flexDirection: 'row', gap: 10 },
  saveTokenBtn: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7c6aff40',
  },
  saveTokenText: { color: '#c8a8ff', fontWeight: '600' },
  syncBtn: {
    flex: 1,
    backgroundColor: '#2a1f4e',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  syncText: { color: '#fff', fontWeight: '600' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d0d1a',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ffffff08',
  },
  chName: { color: '#fff', fontWeight: '600', fontSize: 13 },
  chUrl: { color: '#555', fontSize: 11, marginTop: 2 },
  deleteBtn: { padding: 6 },
  emptyText: { color: '#444', textAlign: 'center', marginTop: 16 },
});
