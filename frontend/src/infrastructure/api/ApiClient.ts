import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../../core/constants/api.constants';

/**
 * ApiClient
 * HTTP client for backend API communication
 */
export class ApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    // Ensure baseURL always ends with '/' so axios joins paths correctly.
    // axios strips the path component when a URL starts with '/', so we
    // normalize here once rather than touching every endpoint file.
    const baseURL = API_BASE_URL.endsWith('/') ? API_BASE_URL : API_BASE_URL + '/';

    this.client = axios.create({
      baseURL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<any>) => {
        const data = error.response?.data;
        const apiError = {
          detail: data?.detail
            || data?.error?.message
            || error.message
            || 'Unknown error occurred',
          error_code: data?.error_code || data?.error?.code,
          timestamp: data?.timestamp
        };
        return Promise.reject(apiError);
      }
    );
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private rel(url: string): string {
    return url.startsWith('/') ? url.slice(1) : url;
  }

  async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.get<T>(this.rel(url), config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post<T>(this.rel(url), data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.put<T>(this.rel(url), data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete<T>(this.rel(url), config);
    return response.data;
  }
}

// Singleton instance
export const apiClient = new ApiClient();
