import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";

if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

const AuthContext = createContext(null);

const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null; 
  }
};

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("token");
        const savedTheme = await AsyncStorage.getItem("theme");

        if (savedToken) {
          setTokenState(savedToken);
          setUser(decodeJWT(savedToken));
        }
        if (savedTheme) {
          setTheme(savedTheme);
        }
      } catch (e) {
        console.error("Failed to restore session:", e);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      return next;
    });
  };

  const setToken = async (newToken) => {
    if (newToken) {
      await AsyncStorage.setItem("token", newToken);
      setTokenState(newToken);
      setUser(decodeJWT(newToken));
    } else {
      await AsyncStorage.removeItem("token");
      setTokenState(null);
      setUser(null);
    }
  };

  const handleSetToken = async (newToken) => {
    await setToken(newToken);
  };

  const login = async (userData, newToken) => {
    await AsyncStorage.setItem("token", newToken);
    setTokenState(newToken);
    setUser(userData);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, setToken, handleSetToken, login, user, setUser, theme, toggleTheme, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
