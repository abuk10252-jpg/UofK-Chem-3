import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
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
      // أولاً: حاول تجيب مستخدم من الكاش مع حماية من الكاش التالف
      const cachedUserStr = await AsyncStorage.getItem('user_data');
      if (cachedUserStr) {
        try {
          setUser(JSON.parse(cachedUserStr));
        } catch (e) {
          await AsyncStorage.removeItem('user_data');
          setUser(null);
        }
      }

      // إذا عندك توكن، حاول تحدث المستخدم من السيرفر ومعك Timeout 3 ثواني
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const data = await Promise.race([
          apiCall('/api/auth/me'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
        ]) as any;

        if (data && data.user) {
          setUser(data.user);
          await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
        }
      }
    } catch (err) {
      console.log("Offline mode: Using cached user data or login required.");
      Alert.alert(
        "تنبيه",
        "لا يمكن الاتصال بالسيرفر.\nسيتم استخدام البيانات القديمة أو يجب تسجيل الدخول مجدداً.",
        [{ text: "حسناً" }]
      );
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
