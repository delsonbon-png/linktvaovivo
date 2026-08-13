import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, StatusBar, Alert, Platform
} from 'react-native';
import StreamPlayer from '../components/StreamPlayer';
import { fetchChannelsFromGithub } from '../utils/github';
import { deleteChannel, getLocalChannels } from '../utils/storage';
import { AuthContext } from '../context/AuthContext';
import { ADMIN_CPF } from '../utils/constants';

const PLAYER_HEIGHT = 220;

export default function TvScreen() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.cpf === ADMIN_CPF;
  const [channels, setChannels] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const shaRef = React.useRef(null);

  const loadChannels = useCallback(async () => {
    setLoading(true);
    const result = await fetchChannelsFromGithub();
    const list = result.channels || [];
    if (result.sha) shaRef.current = result.sha;

    // Se GitHub não retornou, usa canais locais
    const finalList = list.length ? list : await getLocalChannels();

    setChannels(finalList);
    setFiltered(finalList);
    if (finalList.length && !selected) setSelected(finalList[0]);
    setLoading(false);
  }, []);

  const handleDelete = (id, name) => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm(`Deseja realmente apagar "${name}"?`);
      if (confirm) {
        executeDelete(id);
      }
    } else {
      Alert.alert('Apagar Canal', `Deseja realmente apagar "${name}"?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: () => executeDelete(id) },
      ]);
    }
  };

  const executeDelete = async (id) => {
    const updated = await deleteChannel(id);
    setChannels(updated);
    setFiltered(updated);
    if (selected?.id === id) {
      setSelected(updated.length > 0 ? updated[0] : null);
    }
    // Sincronizar com GitHub se for admin e tiver token
    if (isAdmin) {
      const { getGithubToken } = require('../utils/storage');
      const token = await getGithubToken();
      if (token && shaRef.current) {
        const { pushChannelsToGithub } = require('../utils/github');
        const pushResult = await pushChannelsToGithub(updated, shaRef.current);
        if (pushResult.success) {
           // Atualizar o sha após sucesso
           const { fetchChannelsFromGithub } = require('../utils/github');
           const refresh = await fetchChannelsFromGithub();
           if (refresh.sha) shaRef.current = refresh.sha;
        }
      }
    }
  };

  useEffect(() => { loadChannels(); }, [loadChannels]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(channels);
    } else {
      setFiltered(channels.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      ));
    }
  }, [search, channels]);

  const selectChannel = (ch) => {
    setSelected(ch);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />

      {/* ── Top Bar ── */}
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Link TV</Text>
      </View>

      {/* ── Player ── */}
      <View style={styles.playerWrapper}>
        {selected ? (
          <StreamPlayer url={selected.url} height={PLAYER_HEIGHT} />
        ) : (
          <View style={[styles.playerWrapper, styles.emptyPlayer]}>
            <Text style={styles.emptyIcon}>📺</Text>
            <Text style={styles.emptyText}>
              {loading ? 'Carregando canais...' : 'Selecione um canal'}
            </Text>
          </View>
        )}
      </View>

      {/* ── Agora assistindo ── */}
      {selected && (
        <View style={styles.nowPlaying}>
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>AO VIVO</Text>
          </View>
          <Text style={styles.nowText} numberOfLines={1}>{selected.name}</Text>
        </View>
      )}

      {/* ── Pesquisa ── */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar canal..."
            placeholderTextColor="#555"
            value={search}
            onChangeText={setSearch}
            clearButtonMode="while-editing"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: '#555', fontSize: 16, paddingLeft: 8 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadChannels}>
          <Text style={{ fontSize: 18 }}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* ── Lista de Canais ── */}
      {loading ? (
        <ActivityIndicator color="#7c6aff" size="large" style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.emptyList}>
          <Text style={styles.emptyListIcon}>📡</Text>
          <Text style={styles.emptyListText}>
            {channels.length === 0 ? 'Nenhum canal cadastrado' : 'Nenhum resultado'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const isActive = selected?.id === item.id;
            return (
              <TouchableOpacity
                style={[styles.channelItem, isActive && styles.channelActive]}
                onPress={() => selectChannel(item)}
                activeOpacity={0.8}
              >
                <View style={[styles.channelIconBox, isActive && styles.channelIconActive]}>
                  <Text style={{ fontSize: 18 }}>📺</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.channelName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.channelUrl} numberOfLines={1}>{item.url}</Text>
                </View>
                
                {isAdmin && (
                  <TouchableOpacity
                    style={styles.deleteBtnOnTv}
                    onPress={() => handleDelete(item.id, item.name)}
                    activeOpacity={0.7}
                  >
                    <Text style={{ color: '#ff6b6b', fontSize: 16 }}>🗑️</Text>
                  </TouchableOpacity>
                )}

                {isActive && !isAdmin && <View style={styles.playingDot} />}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },

  topBar: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: '#0d0d1a',
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff0a',
  },
  topTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 2,
  },

  playerWrapper: {
    width: '100%',
    height: PLAYER_HEIGHT,
    backgroundColor: '#000',
  },
  emptyPlayer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyText: { color: '#555', fontSize: 14 },

  nowPlaying: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#0d0d1a',
    gap: 8,
  },
  liveBadge: {
    backgroundColor: '#ff4444',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  liveText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  nowText: { color: '#ccc', fontSize: 13, flex: 1 },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#13131f',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ffffff14',
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1,
    color: '#fff',
    paddingVertical: 10,
    fontSize: 14,
  },
  refreshBtn: {
    backgroundColor: '#13131f',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ffffff14',
  },

  list: { paddingHorizontal: 14, paddingBottom: 24 },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#13131f',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ffffff0a',
    gap: 12,
  },
  channelActive: {
    borderColor: '#7c6aff',
    backgroundColor: '#1a1a2e',
  },
  channelIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#0d0d1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelIconActive: { backgroundColor: '#2a1f4e' },
  channelName: { color: '#fff', fontWeight: '600', fontSize: 14 },
  channelUrl: { color: '#555', fontSize: 11, marginTop: 2 },
  playingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7c6aff',
  },

  emptyList: { alignItems: 'center', marginTop: 50, gap: 10 },
  emptyListIcon: { fontSize: 36 },
  emptyListText: { color: '#444', fontSize: 15 },
  deleteBtnOnTv: { padding: 8, marginLeft: 8 },
});
