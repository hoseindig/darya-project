// 0c1c47f6-d567-4dac-b09d-1da8a7210228
// src/services/apiService.ts
import { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios';
import {
  api,
  coinMarketCapApi,
  exchangeRatesApi,
  type ApiResponse,
  type CryptoData,
  type ExchangeRatesData,
} from '../boot/axios';

export * from '../boot/axios'; // Export CryptoData and ExchangeRatesData for use in other files

export class ApiService {
  private baseEndpoint: string;
  private axiosInstance: AxiosInstance;

  constructor(endpoint: string, axiosInstance: AxiosInstance = api) {
    this.baseEndpoint = endpoint;
    this.axiosInstance = axiosInstance;
  }

  async getListings(
    params?: Record<string, string | number | boolean>,
  ): Promise<ApiResponse<CryptoData[]>> {
    try {
      const response: AxiosResponse<CryptoData[]> = await this.axiosInstance.get(
        `${this.baseEndpoint}/listings/latest`,
        {
          headers: {
            'X-CMC_PRO_API_KEY': 'b54bcf4d-1bca-4e8e-9a24-22ff2c3d462c', // Your provided CoinMarketCap API key
          },
          params,
        },
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

  async getExchangeRates(
    params?: Record<string, string | number | boolean>,
  ): Promise<ApiResponse<ExchangeRatesData>> {
    try {
      const response: AxiosResponse<ExchangeRatesData> = await this.axiosInstance.get(
        `${this.baseEndpoint}/latest`,
        {
          params: {
            access_key: '7845a621855c3c0ef62a8707e3c0db53', // Your provided Exchange Rates API key
            format: 1,
            ...params,
          },
        },
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

// Export instances for services
export const CryptoService = new ApiService('/v1/cryptocurrency', coinMarketCapApi);
export const ExchangeRatesService = new ApiService('/v1', exchangeRatesApi);
