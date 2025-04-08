import { getAccessToken, resetAuth } from '@/store/authStore';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

// Configuration for the API client
const API_CONFIG: AxiosRequestConfig = {
  headers: {
    'Content-Type': 'application/json'
  },
  // You could add baseURL here if needed
  // baseURL: process.env.NEXT_PUBLIC_API_URL,
};

/**
 * Creates and configures an Axios client with authentication interceptors
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create(API_CONFIG);
  
  // Request interceptor to add authorization header
  client.interceptors.request.use(
    (config) => {
      const accessToken = getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor to handle auth errors
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      // Handle authentication errors
      if (error.response && [401, 403].includes(error.response.status)) {
        // Log auth failure - could be expanded with more detailed info
        console.log(`Authentication error (${error.response.status}): ${error.response.statusText}`);
        // Reset auth state
        resetAuth();
        
        // Only redirect in browser environment
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      
      return Promise.reject(error);
    }
  );

  return client;
};

// Create and export a singleton instance
const apiClient = createApiClient();

export default apiClient;
