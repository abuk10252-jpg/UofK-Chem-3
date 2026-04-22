import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiCall } from '../utils/api';

export interface User {
  id: string;
  email: string;
  name: string;
  status: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      // 1. شيك أولاً لو في مستخدم محفوظ "محلياً" في الموبايل
      const cachedUser = await AsyncStorage.getItem('user_data');
      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
      }

      // 2. حاول تحديث البيانات من السيرفر بس بمهلة قصيرة (3 ثواني)
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const data = await Promise.race([
          apiCall('/api/auth/me'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
        ]) as any;

        if (data && data.user) {
          setUser(data.user);
          // حدث المخزن المحلي بالبيانات الجديدة
          await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
        }
      }
    } catch (err) {
      console.log("Offline mode: Using cached user data or login required.");
    } finally {
      setLoading(false); 
    }
  }

  async function logout() {
    await AsyncStorage.multiRemove(['token', 'user_data']);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
