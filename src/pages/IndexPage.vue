<template>
  <q-page class="q-pa-md">
    <connection-status />
    <q-list bordered class="q-mt-md">
      <q-item v-for="(price, symbol) in prices" :key="symbol">
        <q-item-section>{{ symbol }}</q-item-section>
        <q-item-section>{{ price }}</q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup lang="ts">
import { usePriceStore } from 'stores/usePriceStore';
import ConnectionStatus from 'components/ConnectionStatus.vue';
import { ref } from 'vue';
import { CryptoService, type CryptoData } from '../services/apiService';

const store = usePriceStore();
const prices = store.prices;
const data = ref<CryptoData[]>([]);
const error = ref<string | null>(null);

const fetchCryptoListings = async () => {
  try {
    const response = await CryptoService.getListings({
      limit: 10,
    });
    data.value = response.data;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch data';
  }
};

// Call the function with proper promise handling
void fetchCryptoListings();
</script>
