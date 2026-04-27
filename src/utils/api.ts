import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = Constants.expoConfig?.extra?.API_URL;

if (!BASE_URL) {
  console.error('⚠️ API_URL not configured in app.json');
}

export async function apiCall(endpoint: string, options: any = {}) {
  try {
    const token = await AsyncStorage.getItem('userToken');
    
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(options.headers || {})
      },
      ...options
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `API Error: ${res.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
}
