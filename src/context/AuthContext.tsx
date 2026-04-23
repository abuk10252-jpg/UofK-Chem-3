import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiCall } from '../utils/api';

export interface User {
  id?: string;
  email: string;
  name: string;
  status: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  setUser: (u: User | null) => void;
  login: (email: string, password: string) => Promise<User>;
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

      const data = await Promise.race([
        apiCall('/api/auth/me'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
      ]);

      if (data && data.user) {
        setUser(data.user);
        await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
      }

    } catch {
      console.log("Offline mode: using cached user only.");
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string): Promise<User> {
    // هنا بنفترض إن الـ apiCall بيرجع { user, token } من /api/auth/login
    const data = await apiCall('/api/auth/login', 'POST', { email, password });

    if (!data || !data.user) {
      throw new Error('Login failed');
    }

    const loggedInUser: User = data.user;

    setUser(loggedInUser);
    await AsyncStorage.setItem('user_data', JSON.stringify(loggedInUser));

    if (data.token) {
      await AsyncStorage.setItem('token', data.token);
    }

    return loggedInUser;
  }

  async function logout() {
    await AsyncStorage.multiRemove(['token', 'user_data']);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, setUser, login }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
