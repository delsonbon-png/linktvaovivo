import AsyncStorage from '@react-native-async-storage/async-storage';
import { ADMIN_CPF, ADMIN_PASSWORD, DEFAULT_CHANNELS } from './constants';

const USERS_KEY = '@linktv_users';
const SESSION_KEY = '@linktv_session';
const CHANNELS_KEY = '@linktv_channels';
const GITHUB_TOKEN_KEY = '@linktv_github_token';

// ────── USERS ──────
export async function getUsers() {
  try {
    const data = await AsyncStorage.getItem(USERS_KEY);
    const users = data ? JSON.parse(data) : [];
    // garante que o admin sempre existe
    const hasAdmin = users.find((u) => u.cpf === ADMIN_CPF);
    if (!hasAdmin) {
      users.unshift({ cpf: ADMIN_CPF, password: ADMIN_PASSWORD, name: 'Administrador', isAdmin: true });
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    return users;
  } catch {
    return [{ cpf: ADMIN_CPF, password: ADMIN_PASSWORD, name: 'Administrador', isAdmin: true }];
  }
}

export async function registerUser(cpf, password, name) {
  const users = await getUsers();
  const exists = users.find((u) => u.cpf === cpf);
  if (exists) return { success: false, message: 'usuario existente' };
  users.push({ cpf, password, name: name || cpf, isAdmin: false });
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  return { success: true };
}

export async function loginUser(cpf, password) {
  const users = await getUsers();
  const user = users.find((u) => u.cpf === cpf && u.password === password);
  if (!user) return { success: false, message: 'CPF ou senha incorretos.' };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return { success: true, user };
}

export async function getSession() {
  try {
    const data = await AsyncStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function logout() {
  await AsyncStorage.removeItem(SESSION_KEY);
}

// ────── CHANNELS ──────
export async function getLocalChannels() {
  try {
    const data = await AsyncStorage.getItem(CHANNELS_KEY);
    const parsed = data ? JSON.parse(data) : [];
    if (parsed.length === 0) {
      await saveLocalChannels(DEFAULT_CHANNELS);
      return DEFAULT_CHANNELS;
    }
    return parsed;
  } catch {
    return DEFAULT_CHANNELS;
  }
}

export async function saveLocalChannels(channels) {
  await AsyncStorage.setItem(CHANNELS_KEY, JSON.stringify(channels));
}

export async function addChannel(name, url) {
  const channels = await getLocalChannels();
  const newChannel = { id: Date.now().toString(), name, url };
  channels.push(newChannel);
  await saveLocalChannels(channels);
  return channels;
}

export async function deleteChannel(id) {
  const channels = await getLocalChannels();
  const updated = channels.filter((c) => c.id !== id);
  await saveLocalChannels(updated);
  return updated;
}

// ────── GITHUB TOKEN ──────
export async function getGithubToken() {
  try {
    const data = await AsyncStorage.getItem(GITHUB_TOKEN_KEY);
    return data || '';
  } catch {
    return '';
  }
}

export async function saveGithubToken(token) {
  await AsyncStorage.setItem(GITHUB_TOKEN_KEY, token);
}
