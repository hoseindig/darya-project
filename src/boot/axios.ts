// src/boot/axios.ts
import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios';
import type { App } from 'vue';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: typeof axios;
    $api: AxiosInstance;
    $coinMarketCapApi: AxiosInstance;
  }
}

// Create Axios instance for the main API
const api = axios.create({ baseURL: 'https://api.example.com' });

// Separate Axios instance for CoinMarketCap API
const coinMarketCapApi = axios.create({ baseURL: '/api/coinmarketcap' }); // Use proxy path

// Define a generic interface for API responses
export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

// Define interface for CoinMarketCap data
export interface CryptoData {
  id: number;
  name: string;
  symbol: string;
  quote: {
    USD: {
      price: number;
    };
  };
}

// Generic CRUD service class
export class ApiService {
  private baseEndpoint: string;
  private axiosInstance: AxiosInstance;

  constructor(endpoint: string, axiosInstance: AxiosInstance = api) {
    this.baseEndpoint = endpoint;
    this.axiosInstance = axiosInstance;
  }

  // Create: POST request to create a new resource
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

  // Read: GET request to fetch all resources
  async getAll<T>(params?: Record<string, string | number | boolean>): Promise<ApiResponse<T[]>> {
    try {
      const response: AxiosResponse<T[]> = await this.axiosInstance.get(this.baseEndpoint, {
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

  // Read: GET request to fetch a single resource by ID
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

  // Update: PUT request to update an existing resource
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

  // Delete: DELETE request to remove a resource
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

  // Error handling utility
  private handleError(error: unknown): Error {
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

// Export instances of ApiService for specific resources
export const UserService = new ApiService('/users');
export const ProductService = new ApiService('/products');
export const CryptoService = new ApiService('/v1/cryptocurrency', coinMarketCapApi);

// Boot function to inject Axios instances into Vue app
export default defineBoot(({ app }: { app: App }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
  app.config.globalProperties.$coinMarketCapApi = coinMarketCapApi;
});

export { api, coinMarketCapApi };
