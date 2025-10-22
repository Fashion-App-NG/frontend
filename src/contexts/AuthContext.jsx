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
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        // ✅ Check if token is expired
        if (token && isTokenExpired(token)) {
          if (process.env.NODE_ENV === 'development') {
            console.log('⏰ Token expired on init, redirecting immediately');
          }
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('guestSessionToken');
          
          // ✅ IMMEDIATE redirect, no setState
          window.location.href = '/user-type-selection';
          return; // Stop execution
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 AuthContext initialization:', {
            hasToken: !!token,
            hasUserData: !!userData,
            tokenLength: token?.length || 0
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
                storeName: parsedUser.storeName
              });
            }
          } else {
            if (process.env.NODE_ENV === 'development') {
              console.warn('⚠️ Invalid user data found, clearing storage');
            }
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
            role: userData.role
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

      const processedUser = {
        id: userData.id || userData._id,
        email: userData.email,
        role: userData.role || (userData.storeName ? 'vendor' : 'user'),
        storeName: userData.storeName,
        firstName: userData.firstName,
        lastName: userData.lastName,
        ...userData
      };
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 AuthContext processed user:', processedUser);
      }
      
      if (!processedUser.id || !processedUser.email) {
        console.error('❌ AuthContext login: Invalid user data after processing', processedUser);
        return false;
      }
      
      setUser(processedUser);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(processedUser));
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ AuthContext login successful');
      }
      return true;
      
    } catch (error) {
      console.error('❌ AuthContext login error:', error);
      return false;
    }
  };

  const logout = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 AuthContext logout - clearing all auth data');
    }
    
    // ✅ Clear everything first
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('guestSessionToken');
    
    setUser(null);
    
    // ✅ Immediate redirect, no timeout
    window.location.href = '/user-type-selection';
  };

  const value = {
    user,
    isAuthenticated: !!user && !!user.id,
    loading,
    login,
    logout
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