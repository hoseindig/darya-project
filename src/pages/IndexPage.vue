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
import axios from 'src/boot/axios';

const store = usePriceStore();
const prices = store.prices;

const testApi =()=>{
  let response = null;
new Promise(async (resolve, reject) => {
  try {
    response = await axios.get('https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
      headers: {
        'X-CMC_PRO_API_KEY': '0c1c47f6-d567-4dac-b09d-1da8a7210228',
      },
    });
  } catch(ex) {
    response = null;
    // error
    console.log(ex);
    reject(ex);
  }
  if (response) {
    // success
    const json = response.data;
    console.log(json);
    resolve(json);
  }
}
</script>
