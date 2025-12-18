import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ✅ Token expiration checker
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    // Token expires in less than 5 minutes
    return payload.exp <= now + 300;
  } catch (error) {
    console.error('Failed to validate token:', error);
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ FIXED: Now we use setLoading

  // ✅ FIXED: Initialize user from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const roles = ['vendor', 'admin', 'superadmin', 'shopper'];
        let foundToken = null;
        let foundUser = null;

        // Check for role-specific tokens
        for (const role of roles) {
          const roleToken = localStorage.getItem(`${role}_token`);
          if (roleToken) {
            foundToken = roleToken;
            foundUser = localStorage.getItem(`${role}_user`);
            break;
          }
        }

        // Fallback to default keys
        if (!foundToken) {
          foundToken = localStorage.getItem('token');
          foundUser = localStorage.getItem('user');
        }

        // ✅ Validate token and restore user
        if (foundToken && !isTokenExpired(foundToken)) {
          if (foundUser) {
            const userData = JSON.parse(foundUser);
            console.log('✅ User restored from localStorage:', userData);
            setUser(userData);
          }
        } else if (foundToken) {
          // Token expired, clear it
          console.log('⏰ Token expired on mount, clearing storage');
          roles.forEach(role => {
            localStorage.removeItem(`${role}_token`);
            localStorage.removeItem(`${role}_user`);
          });
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('❌ Failed to initialize auth:', error);
      } finally {
        // ✅ FIXED: Always set loading to false after initialization
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ✅ Check token expiration periodically
  useEffect(() => {
    const checkTokenExpiration = () => {
      // ✅ FIX: Early return if no user logged in
      if (!user) return false;

      const roles = ['vendor', 'admin', 'superadmin', 'shopper'];
      let foundToken = null;

      for (const role of roles) {
        const roleToken = localStorage.getItem(`${role}_token`);
        if (roleToken) {
          foundToken = roleToken;
          break;
        }
      }

      const token = foundToken || localStorage.getItem('token');

      if (token && isTokenExpired(token)) {
        console.log('⏰ Token expired, clearing session');
        
        // Clear ALL auth tokens
        roles.forEach(role => {
          localStorage.removeItem(`${role}_token`);
          localStorage.removeItem(`${role}_user`);
        });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Keep guest session if it exists
        const guestToken = localStorage.getItem('guestSessionToken');
        if (!guestToken) {
          console.log('No guest session, redirecting to browse');
        }
        
        setUser(null);
        window.location.href = '/browse';
        return true;
      }
      
      return false;
    };

    // ✅ FIX: Only set interval if user is logged in
    if (!user) return;

    // Check every 60 seconds
    const interval = setInterval(() => {
      if (checkTokenExpiration()) {
        clearInterval(interval);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [user]); // ✅ FIX: Add user as dependency

  const login = (userData, token) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 AuthContext login called with:', {
          userData: userData ? {
            id: userData.id,
            email: userData.email,
            role: userData.role,
            storeName: userData.storeName
          } : null,
          token: token ? `${token.substring(0, 20)}...` : 'none'
        });
      }
      
      if (!userData || !token) {
        console.error('❌ AuthContext login: Missing userData or token');
        return false;
      }

      // Check if token is already expired
      if (isTokenExpired(token)) {
        console.error('❌ Cannot login with expired token');
        return false;
      }

      const user = {
        ...userData,
        profileCompleted: userData.profileCompleted || false
      };
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 AuthContext processed user with storeName:', user.storeName);
      }
      
      if (!user.id || !user.email) {
        console.error('❌ AuthContext login: Invalid user data after processing', user);
        return false;
      }
      
      // Update state first
      setUser(user);
      
      // Then save to localStorage as backup
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Also save role-specific if role exists
      if (user.role) {
        localStorage.setItem(`${user.role}_token`, token);
        localStorage.setItem(`${user.role}_user`, JSON.stringify(user));
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ AuthContext login successful with storeName:', user.storeName);
      }
      return true;
      
    } catch (error) {
      console.error('❌ AuthContext login error:', error);
      return false;
    }
  };

  const register = async (userData, token) => {
    // For now, register works the same as login
    return login(userData, token);
  };

  const logout = async () => {
    try {
      const roles = ['vendor', 'admin', 'superadmin', 'shopper'];
      
      // Clear all role-specific tokens
      roles.forEach(role => {
        localStorage.removeItem(`${role}_token`);
        localStorage.removeItem(`${role}_user`);
      });
      
      // Clear default tokens
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Keep guest session for cart persistence
      const guestToken = localStorage.getItem('guestSessionToken');
      console.log(guestToken ? '✅ Guest session preserved' : 'ℹ️ No guest session to preserve');
      
      setUser(null);
      
      return true; // Signal successful logout
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    updateUser: (updatedUserData) => {
      const mergedUser = { ...user, ...updatedUserData };
      setUser(mergedUser);
      
      // Update localStorage
      const userRole = mergedUser.role || 'shopper';
      
      localStorage.setItem(`${userRole}_user`, JSON.stringify(mergedUser));
      localStorage.setItem('user', JSON.stringify(mergedUser));
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ User data updated in context and localStorage:', mergedUser);
      }
    }
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('🔐 AuthContext current state:', {
      user: user ? {
        id: user.id,
        role: user.role,
        email: user.email,
        storeName: user.storeName
      } : null,
      isAuthenticated: value.isAuthenticated,
      loading
    });
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
export default AuthProvider;