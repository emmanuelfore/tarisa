import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSessionCookie, clearSessionCookie } from './auth-storage';
import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    try {
      const cookie = await getSessionCookie();
      if (cookie) {
        console.log('[AUTH] Found session cookie, verifying with server...');
        // Try to fetch user data to verify the session is still valid
        const response = await api.get('/api/user');
        if (response.data) {
          console.log('[AUTH] Session valid, logging in user:', response.data.username);
          setUser(response.data);
          await AsyncStorage.setItem('user_data', JSON.stringify(response.data));
          return;
        }
      }
      
      // Fallback to stored data if offline or cookie is missing (optional, but safer to check server)
      const storedUser = await AsyncStorage.getItem('user_data');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.log('[AUTH] Session validation failed or no session:', e);
      // If validation fails, we should stay logged out
      setUser(null);
      await AsyncStorage.removeItem('user_data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (userData: User) => {
    setUser(userData);
    await AsyncStorage.setItem('user_data', JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    await clearSessionCookie();
    await AsyncStorage.removeItem('user_data');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
