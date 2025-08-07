import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import {
  api,
  coinMarketCapApi,
  exchangeRatesApi,
  // type ApiResponse,
  // type CryptoData,
  // type ExchangeRatesData,
  ApiService as BaseApiService,
} from '../boot/axios';

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

export interface CryptoData {
  id: number;
  name: string;
  symbol: string;
  quote: {
    USD: {
      price: number;
      market_cap?: number;
      volume_24h?: number;
    };
  };
}

export interface ExchangeRatesData {
  success: boolean;
  timestamp: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

export class ExtendedApiService extends BaseApiService {
  private cache: Map<
    string,
    { data: ApiResponse<Record<string, CryptoData> | ExchangeRatesData>; timestamp: number }
  > = new Map();
  private readonly CACHE_DURATION = 60 * 1000;

  constructor(endpoint: string, axiosInstance: AxiosInstance = api) {
    super(endpoint, axiosInstance);
  }

  async getCryptoQuotes(symbols: string[]): Promise<ApiResponse<Record<string, CryptoData>>> {
    const cacheKey = `crypto-quotes-${symbols.join(',')}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as ApiResponse<Record<string, CryptoData>>;
    }

    try {
      const response: AxiosResponse<{ data: Record<string, CryptoData> }> =
        await this.axiosInstance.get(`${this.baseEndpoint}/quotes/latest`, {
          headers: {
            'X-CMC_PRO_API_KEY': import.meta.env.VITE_CMC_API_KEY,
          },
          params: { symbol: symbols.join(',') },
        });
      const result = {
        data: response.data.data,
        status: response.status,
        statusText: response.statusText,
      };
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async getExchangeRates(symbols?: string[]): Promise<ApiResponse<ExchangeRatesData>> {
    const cacheKey = `exchange-rates-${symbols?.join(',') || 'all'}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as ApiResponse<ExchangeRatesData>;
    }

    try {
      const response: AxiosResponse<ExchangeRatesData> = await this.axiosInstance.get(
        `${this.baseEndpoint}/latest`,
        {
          params: {
            access_key: import.meta.env.VITE_EXCHANGE_RATES_API_KEY,
            symbols: symbols?.join(','),
            format: 1,
          },
        },
      );
      const result = {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
      };
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  protected override handleError(error: unknown): Error {
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as AxiosError;
      return new Error(
        `API Error: ${axiosError.response?.status} - ${
          (axiosError.response?.data as { message?: string })?.message ||
          axiosError.response?.statusText
        }`,
      );
    } else if (error instanceof Error && 'request' in error) {
      return new Error('API Error: No response received from server');
    }
    return new Error(`API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const CryptoService = new ExtendedApiService('/v1/cryptocurrency', coinMarketCapApi);
export const ExchangeRatesService = new ExtendedApiService('/v1', exchangeRatesApi);
