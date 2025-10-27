let socket = null;
let loading = false;

function deriveBaseUrl() {
  const api = (import.meta.env.VITE_url_api || 'http://localhost:4000/api/v1/').trim();
  return api.replace(/\/?api\/v1\/?$/, '');
}

async function ensureIo() {
  if (typeof window !== 'undefined' && window.io) return window.io;
  await new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.socket.io/4.7.5/socket.io.min.js';
    s.async = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Socket.IO CDN failed'));
    document.head.appendChild(s);
  });
  return window.io;
}

export function initSocket() {
  if (socket || loading) return socket;
  loading = true;
  (async () => {
    try {
      const io = await ensureIo();
      const base = deriveBaseUrl();
      socket = io(base, { transports: ['websocket'], autoConnect: true });
      try { window.__app_socket = socket; } catch {}

      socket.on('connect', () => {
        console.log('[socket] connected:', socket.id);
      });
      socket.on('disconnect', () => {
        console.log('[socket] disconnected');
      });
      socket.on('echo', (payload) => {
        console.log('[socket] echo:', payload);
      });
      socket.on('nouvelle_commande', (payload) => {
        console.log('[socket] nouvelle_commande:', payload);
        try { window.dispatchEvent(new Event('notif:new')); } catch { /* noop */ }
      });
      socket.on('commande_update', (payload) => {
        console.log('[socket] commande_update:', payload);
        try { window.dispatchEvent(new Event('notif:new')); } catch { /* noop */ }
      });
      socket.on('commande_deleted', (payload) => {
        console.log('[socket] commande_deleted:', payload);
        try { window.dispatchEvent(new Event('notif:new')); } catch { /* noop */ }
      });
    } catch (e) {
      console.error('[socket] init error:', e);
    } finally {
      loading = false;
    }
  })();
  return socket;
}

export function getSocket() { return socket; }
