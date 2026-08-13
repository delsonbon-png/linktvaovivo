import React, { useContext } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, StatusBar, ScrollView, Platform
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { logout } from '../utils/storage';
import { ADMIN_CPF } from '../utils/constants';

function formatCPFDisplay(cpf) {
  if (!cpf || cpf.length !== 11) return cpf;
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}

export default function PerfilScreen({ navigation }) {
  const { user, setUser } = useContext(AuthContext);

  const performLogout = async () => {
    await logout();
    setUser(null);
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm('Deseja realmente encerrar a sessão?');
      if (confirm) {
        performLogout();
      }
    } else {
      Alert.alert('Sair', 'Deseja encerrar a sessão?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: performLogout,
        },
      ]);
    }
  };

  const isAdmin = user?.cpf === ADMIN_CPF;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Perfil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.name || 'U')[0].toUpperCase()}
            </Text>
          </View>
          {isAdmin && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>👑 Admin</Text>
            </View>
          )}
          <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
        </View>

        {/* Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informações da conta</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nome</Text>
            <Text style={styles.infoValue}>{user?.name || '—'}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>CPF</Text>
            <Text style={styles.infoValue}>{formatCPFDisplay(user?.cpf) || '—'}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tipo de conta</Text>
            <View style={[styles.typeBadge, isAdmin ? styles.adminType : styles.userType]}>
              <Text style={styles.typeBadgeText}>{isAdmin ? 'Administrador' : 'Usuário'}</Text>
            </View>
          </View>
        </View>

        {/* Admin Panel Button */}
        {isAdmin && (
          <TouchableOpacity
            style={styles.adminBtn}
            onPress={() => navigation.navigate('AdminPanel')}
            activeOpacity={0.85}
          >
            <Text style={styles.adminBtnIcon}>⚙️</Text>
            <Text style={styles.adminBtnText}>Painel Administrativo</Text>
            <Text style={{ color: '#aaa' }}>›</Text>
          </TouchableOpacity>
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  topBar: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 48,
    paddingBottom: 14,
    backgroundColor: '#0d0d1a',
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff0a',
  },
  topTitle: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: 2 },
  body: { padding: 20, paddingBottom: 40 },
  avatarContainer: { alignItems: 'center', marginVertical: 28 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#7c6aff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7c6aff',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarText: { fontSize: 36, fontWeight: '800', color: '#fff' },
  adminBadge: {
    backgroundColor: '#2a2044',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 10,
  },
  adminBadgeText: { color: '#c8a8ff', fontWeight: '700', fontSize: 12 },
  userName: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 10 },
  card: {
    backgroundColor: '#13131f',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ffffff0a',
    marginBottom: 16,
  },
  cardTitle: { color: '#666', fontSize: 12, fontWeight: '600', letterSpacing: 1, marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  infoLabel: { color: '#888', fontSize: 14 },
  infoValue: { color: '#fff', fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#ffffff08' },
  typeBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  adminType: { backgroundColor: '#3a1f6e' },
  userType: { backgroundColor: '#1a2a1a' },
  typeBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  adminBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#7c6aff40',
    gap: 12,
  },
  adminBtnIcon: { fontSize: 20 },
  adminBtnText: { flex: 1, color: '#c8a8ff', fontWeight: '600', fontSize: 15 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f1010',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ff444430',
    gap: 12,
    marginTop: 8,
  },
  logoutIcon: { fontSize: 20 },
  logoutText: { color: '#ff6b6b', fontWeight: '600', fontSize: 15 },
});
