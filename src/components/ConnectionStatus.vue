<!-- src/components/ConnectionStatus.vue -->
<script setup lang="ts">
import { useWebSocket } from 'src/composables/useWebSocket';

const { isConnected, connect } = useWebSocket('wss://echo.websocket.org');
connect();
</script>

<template>
  <div :class="{ 'text-green': isConnected, 'text-red': !isConnected }">
    {{ isConnected ? 'Online' : 'Offline' }}
  </div>
</template>

<style scoped>
.text-green {
  color: green;
}
.text-red {
  color: red;
}
</style>
