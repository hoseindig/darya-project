// src/composables/useWebSocket.ts
import { ref, onUnmounted } from 'vue';
import { usePriceStore } from 'src/stores/usePriceStore';

export function useWebSocket(url: string) {
  const store = usePriceStore();
  const isConnected = ref(false);

  let socket: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let pingTimer: ReturnType<typeof setInterval> | null = null;

  const connect = () => {
    socket = new WebSocket(url);

    socket.onopen = () => {
      isConnected.value = true;
      console.log('WebSocket connected:', url);

      // Send ping every 30s
      pingTimer = setInterval(() => {
        if (socket?.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.symbol && data.price) {
          store.updatePrice(data.symbol, data.price);
        }
      } catch {
        console.warn('Non-JSON message received:', event.data);
      }
    };

    socket.onerror = () => {
      console.error('WebSocket error');
    };

    socket.onclose = () => {
      isConnected.value = false;
      console.warn('WebSocket disconnected. Reconnecting in 3s...');
      cleanup();
      reconnectTimer = setTimeout(connect, 3000);
    };
  };

  const cleanup = () => {
    if (pingTimer) {
      clearInterval(pingTimer);
      pingTimer = null;
    }
    if (socket) {
      socket.close();
      socket = null;
    }
  };

  onUnmounted(() => {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    cleanup();
  });

  // ✅ Return reactive state & actions
  return {
    isConnected,
    connect,
  };
}
