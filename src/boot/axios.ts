import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios';
import type { App } from 'vue';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: typeof axios;
    $api: AxiosInstance;
    $coinMarketCapApi: AxiosInstance;
    $exchangeRatesApi: AxiosInstance;
  }
}

const api = axios.create({ baseURL: 'https://api.example.com' });
const coinMarketCapApi = axios.create({ baseURL: '/api/coinmarketcap' });
const exchangeRatesApi = axios.create({ baseURL: '/api/exchangerates' });

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

export class ApiService {
  protected baseEndpoint: string;
  protected axiosInstance: AxiosInstance;

  constructor(endpoint: string, axiosInstance: AxiosInstance = api) {
    this.baseEndpoint = endpoint;
    this.axiosInstance = axiosInstance;
  }

  async create<T>(data: T): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.post(this.baseEndpoint, data);
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async getAll<T>(params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.get(this.baseEndpoint, {
        params,
      });
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async getById<T>(id: number | string): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.get(`${this.baseEndpoint}/${id}`);
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async update<T>(id: number | string, data: Partial<T>): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.put(
        `${this.baseEndpoint}/${id}`,
        data,
      );
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async delete(id: number | string): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<void> = await this.axiosInstance.delete(
        `${this.baseEndpoint}/${id}`,
      );
      return {
        data: undefined,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  protected handleError(error: unknown): Error {
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

export const UserService = new ApiService('/users');
export const ProductService = new ApiService('/products');
// Note: These are base ApiService instances, not used by IndexPage.vue
export const CryptoService = new ApiService('/v1/cryptocurrency', coinMarketCapApi);
export const ExchangeRatesService = new ApiService('/v1', exchangeRatesApi);

export default defineBoot(({ app }: { app: App }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
  app.config.globalProperties.$coinMarketCapApi = coinMarketCapApi;
  app.config.globalProperties.$exchangeRatesApi = exchangeRatesApi;
});

export { api, coinMarketCapApi, exchangeRatesApi };
