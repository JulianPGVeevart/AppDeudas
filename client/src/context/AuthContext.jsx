import { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(localStorage.getItem('userId'));

  const login = (id) => {
    localStorage.setItem('userId', id);
    setUserId(id);
  };

  const logout = () => {
    localStorage.removeItem('userId');
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ userId, login, logout, isAuthenticated: !!userId }}>
      {children}
    </AuthContext.Provider>
  );
};