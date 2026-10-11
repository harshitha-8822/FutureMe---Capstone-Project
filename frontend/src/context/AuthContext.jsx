import { createContext, useContext, useEffect, useState } from 'react';
import { loginUser, registerUser } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('futureme_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [ready, setReady] = useState(true);

  const persist = (token, u) => {
    localStorage.setItem('futureme_token', token);
    localStorage.setItem('futureme_user', JSON.stringify(u));
    setUser(u);
  };

  const login = async (email, password) => {
    const { token, user: u } = await loginUser({ email, password });
    persist(token, u);
    return u;
  };

  const register = async (name, email, password) => {
    const { token, user: u } = await registerUser({ name, email, password });
    persist(token, u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('futureme_token');
    localStorage.removeItem('futureme_user');
    setUser(null);
  };

  useEffect(() => setReady(true), []);

  return (
    <AuthContext.Provider value={{ user, isAuthed: !!user, ready, login, register, logout, updateSession: persist }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
