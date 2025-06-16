import { createContext, useContext, useState } from 'react';
import authService from '../services/authService'; // ✅ Default import (no curly braces)

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ Add logout function
  const logout = async () => {
    try {
      // Call backend logout API (optional - clears server-side sessions)
      await authService.logout(); // ✅ Now uses default import
    } catch (error) {
      // Even if API call fails, we still want to clear local data
      console.warn('Logout API call failed, but clearing local data:', error);
    } finally {
      // Always clear local authentication state
      authService.removeAuthToken(); // ✅ Now uses default import
      authService.removeUser(); // ✅ Now uses default import
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    setUser,
    setIsAuthenticated,
    logout // ✅ Add logout to context value
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};