import axios from 'axios';

const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(
  (config) => {
    const accessToken = "ok"
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
