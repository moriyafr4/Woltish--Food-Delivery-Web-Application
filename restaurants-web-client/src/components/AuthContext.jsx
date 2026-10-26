import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null; 
  }
};

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem("token");
    return savedToken ? decodeJWT(savedToken) : null;
  });
  
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      return next;
    });
  };

  const setToken = (newToken) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
      setTokenState(newToken);
      setUser(decodeJWT(newToken)); 
    } else {
      localStorage.removeItem("token");
      setTokenState(null);
      setUser(null);
    }
  };

  const handleSetToken = (newToken) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
  };

  const login = (userData, newToken) => {
      localStorage.setItem("token", newToken);
      setTokenState(newToken);
      setUser(userData);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };


  return (
    <AuthContext.Provider value={{ token, setToken ,handleSetToken, login, user, setUser, theme, toggleTheme, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}