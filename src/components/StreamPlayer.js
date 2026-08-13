import React, { useRef } from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

/**
 * Player universal para streams ao vivo:
 * - HLS (m3u8) via hls.js
 * - MP4, DASH e outros formatos via HTML5 video
 * - Funciona na web e no Android/iOS via WebView
 */
export default function StreamPlayer({ url, height = 220 }) {
  const webviewRef = useRef(null);

  if (!url) return null;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
    video {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: #000;
    }
    #error {
      display: none;
      position: absolute;
      inset: 0;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      background: #0a0a0f;
      color: #ff6b6b;
      font-family: sans-serif;
      text-align: center;
      padding: 20px;
    }
    #error.show { display: flex; }
    #error .icon { font-size: 36px; margin-bottom: 12px; }
    #error .msg { font-size: 14px; }
    #error .url { font-size: 10px; color: #555; margin-top: 8px; word-break: break-all; }
    #retry {
      margin-top: 16px;
      background: #7c6aff;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 8px 20px;
      font-size: 14px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <video id="video" controls autoplay playsinline></video>
  <div id="error">
    <div class="icon">⚠️</div>
    <div class="msg">Erro ao reproduzir o canal</div>
    <div class="url" id="errurl"></div>
    <button id="retry" onclick="initPlayer()">Tentar novamente</button>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js"></script>
  <script>
    var videoUrl = ${JSON.stringify(url)};
    var video = document.getElementById('video');
    var errorDiv = document.getElementById('error');
    var errurl = document.getElementById('errurl');

    function showError() {
      errorDiv.classList.add('show');
      errurl.textContent = videoUrl;
    }

    function hideError() {
      errorDiv.classList.remove('show');
    }

    function initPlayer() {
      hideError();

      var isHLS = videoUrl.includes('.m3u8') || videoUrl.includes('m3u8');
      var isDASH = videoUrl.includes('.mpd');

      if (isHLS && typeof Hls !== 'undefined' && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
          video.play().catch(function() {});
        });
        hls.on(Hls.Events.ERROR, function(event, data) {
          if (data.fatal) {
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else {
              showError();
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari nativo
        video.src = videoUrl;
        video.play().catch(showError);
      } else {
        // Tenta direto (mp4, rtsp via proxy, etc)
        video.src = videoUrl;
        video.play().catch(showError);
      }
    }

    video.addEventListener('error', function() {
      showError();
    });

    window.addEventListener('load', function() {
      initPlayer();
    });
  </script>
</body>
</html>
`;

  // Na web, usa iframe inline; no nativo, usa WebView
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { height }]}>
        <iframe
          srcDoc={html}
          style={{ width: '100%', height: '100%', border: 'none', background: '#000' }}
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        ref={webviewRef}
        source={{ html }}
        style={styles.webview}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        mixedContentMode="always"
        onError={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', backgroundColor: '#000' },
  webview: { flex: 1, backgroundColor: '#000' },
});
