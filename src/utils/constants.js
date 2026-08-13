// Credenciais do administrador
export const ADMIN_CPF = '09131915663';
export const ADMIN_PASSWORD = '132435';

// GitHub configuração para armazenar canais
export const GITHUB_OWNER = 'seu-usuario-github'; // Altere para seu usuário GitHub
export const GITHUB_REPO = 'linktv-canais';
export const GITHUB_FILE_PATH = 'canais.json';
export const GITHUB_BRANCH = 'main';

// WhatsApp do assinante
export const WHATSAPP_NUMBER = '5538999179868';

// Fallback de canais (caso GitHub não esteja configurado)
export const DEFAULT_CHANNELS = [
  { id: '1', name: 'TV Cultura', url: 'https://tv.tvang.com.br/c/tv-cultura/playlist.m3u8' },
  { id: '2', name: 'TV Brasil (Estável)', url: 'https://stream.tvbrasil.ebc.com.br/tvbrasil/smil:tvbrasil.smil/playlist.m3u8' },
  { id: '3', name: 'CNN Brasil', url: 'https://cnn-cnnbrasil-1-br.samsung.wurl.tv/playlist.m3u8' },
  { id: '4', name: 'Jovem Pan News', url: 'https://jovempan-jovempannews-1-br.samsung.wurl.tv/playlist.m3u8' },
  { id: '5', name: 'TV Aparecida', url: 'https://tvaparecida.live/tvaparecida/playlist.m3u8' }
];
