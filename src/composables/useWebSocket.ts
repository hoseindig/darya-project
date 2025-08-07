// src/composables/useWebSocket.ts
import { onUnmounted } from 'vue';
import { usePriceStore } from 'stores/usePriceStore';

let socket: WebSocket | null = null;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
let reconnectAttempts = 0;
//API Key  access_key 0c1c47f6-d567-4dac-b09d-1da8a7210228
// X-CMC_PRO_API_KEY
export function useWebSocket() {
  const store = usePriceStore();

  const connect = () => {
    store.setConnectionStatus('connecting');
    socket = new WebSocket('wss://example.com'); // برای تست می‌تونی ws://localhost:3000 بزاری یا mock server بسازی

    socket.onopen = () => {
      store.setConnectionStatus('connected');
      reconnectAttempts = 0;
      startHeartbeat();
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      store.updatePrice(data.symbol, data.price);
    };

    socket.onclose = () => {
      store.setConnectionStatus('disconnected');
      stopHeartbeat();
      retryConnection();
    };

    socket.onerror = () => {
      socket?.close();
    };
  };

  const startHeartbeat = () => {
    heartbeatInterval = setInterval(() => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 2000);
  };

  const stopHeartbeat = () => {
    if (heartbeatInterval !== null) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  };

  const retryConnection = () => {
    if (reconnectAttempts >= 5) return;
    const timeout = Math.pow(2, reconnectAttempts) * 1000;
    reconnectAttempts++;
    setTimeout(() => connect(), timeout);
  };

  connect();

  onUnmounted(() => {
    socket?.close();
    stopHeartbeat();
  });
}
