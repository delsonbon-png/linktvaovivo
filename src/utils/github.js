import { GITHUB_OWNER, GITHUB_REPO, GITHUB_FILE_PATH, GITHUB_BRANCH } from './constants';
import { getGithubToken, getLocalChannels, saveLocalChannels } from './storage';

const BASE_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;

export async function fetchChannelsFromGithub() {
  try {
    const token = await getGithubToken();
    const headers = { Accept: 'application/vnd.github.v3+json' };
    if (token) headers['Authorization'] = `token ${token}`;

    const res = await fetch(`${BASE_URL}?ref=${GITHUB_BRANCH}&t=${Date.now()}`, { headers });
    if (!res.ok) throw new Error(`GitHub status ${res.status}`);
    const json = await res.json();
    const decoded = atob(json.content.replace(/\n/g, ''));
    const channels = JSON.parse(decoded);
    await saveLocalChannels(channels);
    return { success: true, channels, sha: json.sha };
  } catch (e) {
    console.warn('GitHub fetch falhou, usando local:', e.message);
    const channels = await getLocalChannels();
    return { success: false, channels };
  }
}

export async function pushChannelsToGithub(channels, sha) {
  try {
    const token = await getGithubToken();
    if (!token) return { success: false, message: 'Token GitHub não configurado.' };

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(channels, null, 2))));
    const body = {
      message: 'Atualização de canais via LinkTV',
      content,
      branch: GITHUB_BRANCH,
    };
    if (sha) body.sha = sha;

    const res = await fetch(BASE_URL, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      return { success: false, message: err.message || 'Erro ao salvar no GitHub.' };
    }

    await saveLocalChannels(channels);
    return { success: true };
  } catch (e) {
    return { success: false, message: e.message };
  }
}
