// src/stores/usePriceStore.ts
import { defineStore } from 'pinia';

type PriceUpdate = {
  symbol: string;
  price: number;
  sequence: number;
};

export const usePriceStore = defineStore('price', {
  state: () => ({
    connectionStatus: 'disconnected', // 'connected' | 'disconnected' | 'connecting'
    prices: {} as Record<string, number>,
    missedUpdates: [] as PriceUpdate[],
  }),
  actions: {
    updatePrice(symbol: string, price: number) {
      this.prices[symbol] = price;
    },
    setConnectionStatus(status: string) {
      this.connectionStatus = status;
    },
  },
});

// import { defineStore } from 'pinia';
// import { ref } from 'vue';
// import type { CryptoData, ExchangeRatesData } from '../services/apiService';

// export const usePriceStore = defineStore('price', () => {
//   const cryptoData = ref<Record<string, CryptoData>>({});
//   const exchangeRates = ref<ExchangeRatesData | null>(null);

//   function setCryptoData(data: Record<string, CryptoData>) {
//     cryptoData.value = data;
//   }

//   function setExchangeRates(data: ExchangeRatesData) {
//     exchangeRates.value = data;
//   }

//   return { cryptoData, exchangeRates, setCryptoData, setExchangeRates };
// });
