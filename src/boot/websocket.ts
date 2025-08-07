// src/boot/websocket.ts
import { boot } from 'quasar/wrappers';
import { useWebSocket } from 'src/composables/useWebSocket';

export default boot(() => {
  useWebSocket();
});
