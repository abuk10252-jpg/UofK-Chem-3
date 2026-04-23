import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.API_URL;

export async function apiCall(endpoint: string, options: any = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  return res.json();
}
