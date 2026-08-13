import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert, StatusBar } from 'react-native';
import { WHATSAPP_NUMBER } from '../utils/constants';

export default function AssinanteScreen() {
  const openWhatsApp = async () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('WhatsApp não encontrado', 'Instale o WhatsApp para continuar.');
    }
  };

  useEffect(() => {
    // Abre automaticamente quando a tela é montada
    const timer = setTimeout(() => { openWhatsApp(); }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Assinante</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.card}>
          <Text style={styles.iconBig}>💬</Text>
          <Text style={styles.title}>Fale com o Suporte</Text>
          <Text style={styles.sub}>
            Entre em contato diretamente com o administrador pelo WhatsApp para assinar, renovar ou tirar dúvidas.
          </Text>

          <View style={styles.contactBox}>
            <Text style={styles.contactLabel}>Contato</Text>
            <Text style={styles.contactNumber}>+55 (38) 99917-9868</Text>
          </View>

          <TouchableOpacity style={styles.whatsappBtn} onPress={openWhatsApp} activeOpacity={0.85}>
            <Text style={styles.whatsappIcon}>📱</Text>
            <Text style={styles.whatsappText}>Abrir no WhatsApp</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>📺</Text>
            <Text style={styles.infoLabel}>Canais ao vivo</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>🔄</Text>
            <Text style={styles.infoLabel}>Atualização em tempo real</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>🔒</Text>
            <Text style={styles.infoLabel}>Acesso seguro</Text>
          </View>
        </View>
      </View>
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
  body: { flex: 1, padding: 20, justifyContent: 'center' },
  card: {
    backgroundColor: '#13131f',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#25D366' + '30',
    shadowColor: '#25D366',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  iconBig: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 10 },
  sub: { color: '#888', textAlign: 'center', fontSize: 14, lineHeight: 22, marginBottom: 24 },
  contactBox: {
    backgroundColor: '#0d0d1a',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffffff10',
  },
  contactLabel: { color: '#666', fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 4 },
  contactNumber: { color: '#fff', fontSize: 20, fontWeight: '700' },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    gap: 10,
    shadowColor: '#25D366',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  whatsappIcon: { fontSize: 20 },
  whatsappText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 32,
  },
  infoItem: { alignItems: 'center', gap: 6 },
  infoIcon: { fontSize: 28 },
  infoLabel: { color: '#555', fontSize: 11, textAlign: 'center', maxWidth: 80 },
});
