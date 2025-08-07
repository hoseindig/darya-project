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
