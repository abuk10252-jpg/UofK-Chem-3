import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// إضافة التوكن إلى الطلبات
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error reading token:', error);
  }
  return config;
});

// معالجة الأخطاء والاستجابات
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.data);
    return response.data;
  },
  (error: AxiosError) => {
    const message = 
      (error.response?.data as any)?.message || 
      error.message || 
      'An error occurred';
    console.error('API Error:', message);
    throw new Error(message);
  }
);

export async function apiCall(
  endpoint: string,
  options?: {
    method?: string;
    body?: string;
  }
) {
  try {
    if (options?.method === 'POST') {
      return await api.post(endpoint, JSON.parse(options.body || '{}'));
    }
    return await api.get(endpoint);
  } catch (error: any) {
    throw error;
  }
}

export default api;
