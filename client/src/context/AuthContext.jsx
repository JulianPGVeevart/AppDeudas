import { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail'));


  const login = ({id, email}) => {
    localStorage.setItem('userId', id);
    localStorage.setItem('userEmail', email);
    setUserId(id);
    setUserEmail(email);
  };

  const logout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    setUserId(null);
    setUserEmail(null);
  };

  return (
    <AuthContext.Provider value={{ userId, userEmail, login, logout, isAuthenticated: !!userId }}>
      {children}
    </AuthContext.Provider>
  );
};