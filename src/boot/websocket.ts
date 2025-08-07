// // src/boot/websocket.ts
// import { boot } from 'quasar/wrappers';
// import { useWebSocket } from 'src/composables/useWebSocket';

// export default boot(() => {
//   useWebSocket();
// });
// src/useWebSocket.ts
import { ref } from 'vue';

export function useWebSocket(url: string) {
  const ws = ref<WebSocket | null>(null);
  const isConnected = ref(false);
  const error = ref<string | null>(null);

  const connect = () => {
    try {
      ws.value = new WebSocket(url); // Replace with your actual WebSocket server URL
      ws.value.onopen = () => {
        isConnected.value = true;
        console.log('WebSocket connected');
      };
      ws.value.onerror = (event) => {
        isConnected.value = false;
        error.value = 'WebSocket error occurred';
        console.error('WebSocket error:', event);
      };
      ws.value.onclose = () => {
        isConnected.value = false;
        console.log('WebSocket disconnected');
      };
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to connect to WebSocket';
      console.error('WebSocket connection error:', err);
    }
  };

  return {
    ws,
    isConnected,
    error,
    connect,
  };
}
