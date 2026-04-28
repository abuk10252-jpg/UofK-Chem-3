import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiCall } from '../utils/api';

export interface User {
  id?: string;
  _id?: string;
  email: string;
  name: string;
  status: string;
  role?: string;
  language?: string;
  subscribed_courses?: string[];
  university_id?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  setUser: (u: User | null) => void;
  login: (email: string, password: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  // تحميل بيانات المستخدم المحفوظة
  async function checkAuth() {
    try {
      const cachedUserStr = await AsyncStorage.getItem('user_data');
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      if (cachedUserStr) {
        try {
          setUser(JSON.parse(cachedUserStr));
        } catch {
          await AsyncStorage.removeItem('user_data');
        }
      }

      // محاولة تحديث البيانات من السرفر
      try {
        const data = await Promise.race([
          apiCall('/api/auth/me'),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('timeout')), 5000)
          ),
        ]);

        if (data && data.user) {
          setUser(data.user);
          await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
        }
      } catch (error) {
        console.log('Could not refresh user from server, using cached data');
      }

    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  }

  // تحديث بيانات المستخدم
  async function refreshUser() {
    try {
      const data = await apiCall('/api/auth/me');
      if (data && data.user) {
        setUser(data.user);
        await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
      }
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  }

  // تسجيل الدخول
  async function login(email: string, password: string): Promise<User> {
    try {
      const data = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!data || !data.user) {
        throw new Error(data?.message || 'Login failed - no user data received');
      }

      const loggedInUser: User = data.user;

      // حفظ البيانات
      setUser(loggedInUser);
      await AsyncStorage.setItem('user_data', JSON.stringify(loggedInUser));

      if (data.token) {
        await AsyncStorage.setItem('token', data.token);
      }

      return loggedInUser;

    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // التسجيل الجديد
  async function register(data: any): Promise<User> {
    try {
      const res = await apiCall('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!res || !res.user) {
        throw new Error(res?.message || 'Registration failed - no user data received');
      }

      const newUser: User = res.user;

      // حفظ البيانات
      setUser(newUser);
      await AsyncStorage.setItem('user_data', JSON.stringify(newUser));

      if (res.token) {
        await AsyncStorage.setItem('token', res.token);
      }

      return newUser;

    } catch (error: any) {
      console.error('Register error:', error);
      throw error;
    }
  }

  // تسجيل الخروج
  async function logout() {
    try {
      await AsyncStorage.multiRemove(['token', 'user_data']);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, logout, setUser, login, register, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
