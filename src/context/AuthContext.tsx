import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiCall } from '../utils/api';

export interface User {
  id: string;
  email: string;
  university_id: string;
  name: string;
  role: string;
  status: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
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
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // سباق بين السيرفر وبين 3 ثواني أمان
        const data = await Promise.race([
          apiCall('/api/auth/me'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
        ]) as any;
        
        if (data && data.user) {
          setUser(data.user);
        }
      }
    } catch (err) {
      console.log("Auth Check bypassed due to server timeout or no token.");
    } finally {
      setLoading(false); // فك التعليقة إجبارياً
    }
  }

  async function login(email: string, password: string) {
    const data = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await AsyncStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await AsyncStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
