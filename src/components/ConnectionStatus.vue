<template>
  <q-banner :color="color" dense class="text-white text-center">
    Connection Status: {{ status }}
  </q-banner>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePriceStore } from 'stores/usePriceStore';

const store = usePriceStore();

const status = computed(() => store.connectionStatus);
const color = computed(() => {
  if (status.value === 'connected') return 'green';
  if (status.value === 'connecting') return 'orange';
  return 'red';
});
</script>
