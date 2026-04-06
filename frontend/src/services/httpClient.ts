import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL, API_TIMEOUT_MS } from '../config/env';

// Force production to use relative API paths
const getBaseUrl = () => {
  // In production (Vercel), always use relative paths
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api';
  }
  return API_BASE_URL;
};

const httpClient: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getAccessToken = (): string | null => {
  try {
    return localStorage.getItem('accessToken');
  } catch (error) {
    console.error('Unable to read access token from storage', error);
    return null;
  }
};

httpClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn('Received 401 from API', error.response);
      // Future enhancement: trigger refresh-token flow / logout
    }
    return Promise.reject(error);
  },
);

export default httpClient;
