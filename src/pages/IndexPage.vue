<script setup lang="ts">
import { ref, computed } from 'vue';
import ConnectionStatus from 'components/ConnectionStatus.vue';
import {
  CryptoService,
  ExchangeRatesService,
  type CryptoData,
  type ExchangeRatesData,
} from '../services/apiService';

const cryptoData = ref<Record<string, CryptoData>>({});
const exchangeRates = ref<ExchangeRatesData | null>(null);
const cryptoError = ref<string | null>(null);
const exchangeError = ref<string | null>(null);
const isLoading = ref(false);
const selectedCurrency = ref('USD');

const fetchCryptoQuotes = async () => {
  isLoading.value = true;
  try {
    const response = await CryptoService.getCryptoQuotes(['BTC', 'ETH']);
    cryptoData.value = response.data;
    cryptoError.value = null;
  } catch (err) {
    cryptoError.value = err instanceof Error ? err.message : 'Failed to fetch crypto data';
  } finally {
    isLoading.value = false;
  }
};

const fetchExchangeRates = async () => {
  isLoading.value = true;
  try {
    const response = await ExchangeRatesService.getExchangeRates(['USD', 'EUR']);
    exchangeRates.value = response.data;
    exchangeError.value = null;
  } catch (err) {
    exchangeError.value = err instanceof Error ? err.message : 'Failed to fetch exchange rates';
  } finally {
    isLoading.value = false;
  }
};

const convertedPrices = computed(() => {
  if (!exchangeRates.value || !cryptoData.value) return {};
  const rates = exchangeRates.value.rates as Record<string, number | undefined>;
  const converted: Record<string, { price: number; currency: string }> = {};
  for (const [symbol, data] of Object.entries(cryptoData.value)) {
    const usdPrice = data.quote.USD.price;
    const selectedRate = rates[selectedCurrency.value];
    const usdRate = rates.USD;
    if (!rates || selectedRate === undefined || usdRate === undefined || usdRate === 0) {
      console.warn(`Missing or invalid rates for ${selectedCurrency.value} or USD`);
      converted[symbol] = { price: usdPrice, currency: 'USD' };
      continue;
    }
    const convertedPrice =
      selectedCurrency.value === 'USD' ? usdPrice : usdPrice * (selectedRate / usdRate);
    converted[symbol] = { price: convertedPrice, currency: selectedCurrency.value };
  }
  return converted;
});

void fetchCryptoQuotes();
void fetchExchangeRates();
</script>

<template>
  <div>
    <ConnectionStatus />
    <div v-if="isLoading" class="loading">Loading...</div>
    <div v-else-if="cryptoError || exchangeError" class="error">
      <div v-if="cryptoError">{{ cryptoError }}</div>
      <div v-if="exchangeError">{{ exchangeError }}</div>
    </div>
    <div v-else>
      <h2>Trading Dashboard</h2>
      <div>
        <label for="currency">Select Currency: </label>
        <select v-model="selectedCurrency" id="currency">
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>
      </div>
      <h3>Cryptocurrency Prices</h3>
      <ul>
        <li v-for="[symbol, data] in Object.entries(convertedPrices)" :key="symbol">
          {{ cryptoData[symbol]?.name ?? symbol }} ({{ symbol }}): {{ data.price.toFixed(2) }}
          {{ data.currency }}
        </li>
      </ul>
      <h3>Exchange Rates (Base: EUR)</h3>
      <ul v-if="exchangeRates">
        <li v-for="[currency, rate] in Object.entries(exchangeRates.rates)" :key="currency">
          {{ currency }}: {{ rate.toFixed(4) }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.error {
  color: red;
}
.loading {
  color: blue;
}
select {
  margin: 10px 0;
  padding: 5px;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  margin: 5px 0;
}
</style>
