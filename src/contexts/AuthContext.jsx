import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ✅ Add token validation helper
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    // Check if token expires in less than 5 minutes
    return payload.exp <= now + 300;
  } catch (error) {
    console.error('Failed to validate token:', error);
    return true;
  }
};

const TOKEN_CHECK_INTERVAL_MS = 60 * 1000; // Every 1 minute

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Add token validation on mount and periodically
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // ✅ Try to detect which role is logged in by checking role-specific keys
        const roles = ['vendor', 'admin', 'superadmin', 'shopper'];
        let foundToken = null;
        let foundUser = null;
        let foundRole = null;

        for (const role of roles) {
          const roleToken = localStorage.getItem(`${role}_token`);
          const roleUser = localStorage.getItem(`${role}_user`);
          
          if (roleToken && roleUser) {
            foundToken = roleToken;
            foundUser = roleUser;
            foundRole = role;
            break;
          }
        }

        // Fallback to default keys if no role-specific found
        const token = foundToken || localStorage.getItem('token');
        const userData = foundUser || localStorage.getItem('user');
        
        // ✅ Check if token is expired
        if (token && isTokenExpired(token)) {
          if (process.env.NODE_ENV === 'development') {
            console.log('⏰ Token expired on init, redirecting immediately');
          }
          
          // Clear all storage
          roles.forEach(role => {
            localStorage.removeItem(`${role}_token`);
            localStorage.removeItem(`${role}_user`);
          });
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('guestSessionToken');
          
          window.location.href = '/user-type-selection';
          return;
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 AuthContext initialization:', {
            hasToken: !!token,
            hasUserData: !!userData,
            tokenLength: token?.length || 0,
            foundRole: foundRole || 'default'
          });
        }

        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          
          if (parsedUser && parsedUser.id && parsedUser.email) {
            setUser(parsedUser);
            
            if (process.env.NODE_ENV === 'development') {
              console.log('✅ User restored from localStorage:', {
                id: parsedUser.id,
                email: parsedUser.email,
                role: parsedUser.role || 'unknown',
                storeName: parsedUser.storeName,
                source: foundRole ? `${foundRole}_user` : 'user'
              });
            }
          } else {
            if (process.env.NODE_ENV === 'development') {
              console.warn('⚠️ Invalid user data found, clearing storage');
            }
            roles.forEach(role => {
              localStorage.removeItem(`${role}_token`);
              localStorage.removeItem(`${role}_user`);
            });
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('ℹ️ No valid auth data found in localStorage');
          }
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Failed to restore auth state:', error);
        const roles = ['vendor', 'admin', 'superadmin', 'shopper'];
        roles.forEach(role => {
          localStorage.removeItem(`${role}_token`);
          localStorage.removeItem(`${role}_user`);
        });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // ✅ Check token expiry every 1 minute (not 5) for faster detection
    const intervalId = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token && isTokenExpired(token)) {
        if (process.env.NODE_ENV === 'development') {
          console.log('⏰ Token expired during session, logging out');
        }
        logout();
      }
    }, TOKEN_CHECK_INTERVAL_MS); // Every 1 minute

    return () => clearInterval(intervalId);
  }, []);

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

      // ✅ Check if token is already expired
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
      
      // ✅ UPDATE STATE FIRST, then persist
      setUser(user);
      
      // Then save to localStorage as backup
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ AuthContext login successful with storeName:', user.storeName);
      }
      return true;
      
    } catch (error) {
      console.error('❌ AuthContext login error:', error);
      return false;
    }
  };

  // ✅ ADD: Register function (placeholder for now)
  const register = async (userData, token) => {
    // For now, register works the same as login
    // You can enhance this later with specific registration logic
    return login(userData, token);
  };

  const logout = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 AuthContext logout - clearing all auth data');
    }
    
    // ✅ Clear all role-specific keys
    const roles = ['shopper', 'vendor', 'admin', 'superadmin'];
    roles.forEach(role => {
      localStorage.removeItem(`${role}_token`);
      localStorage.removeItem(`${role}_user`);
    });
    
    // Clear legacy keys
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('guestSessionToken');
    
    setUser(null);
    
    window.location.href = '/user-type-selection';
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