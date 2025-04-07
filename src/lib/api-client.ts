import { getAccessToken, resetAuth } from '@/store/authStore';
import axios from 'axios';

const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken()
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log('Authentication error occurred, redirecting to login');
      
      // Reset auth state
      resetAuth();
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
