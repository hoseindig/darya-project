<!-- src/components/ConnectionStatus.vue -->
<script setup lang="ts">
import { ref } from 'vue';

const isOnline = ref(navigator.onLine);

window.addEventListener('online', () => (isOnline.value = true));
window.addEventListener('offline', () => (isOnline.value = false));
</script>

<template>
  <div :class="{ 'text-green': isOnline, 'text-red': !isOnline }">
    {{ isOnline ? 'Online' : 'Offline' }}
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
