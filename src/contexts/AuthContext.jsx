import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ✅ Token expiration checker (already exists, enhance it)
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    // ✅ Token expires in less than 5 minutes
    return payload.exp <= now + 300;
  } catch (error) {
    console.error('Failed to validate token:', error);
    return true;
  }
};

//const TOKEN_CHECK_INTERVAL_MS = 60 * 1000; // Every 1 minute

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading] = useState(true);//, setLoading

  // ✅ Check token expiration on mount AND periodically
  useEffect(() => {
    const checkTokenExpiration = () => {
      const roles = ['vendor', 'admin', 'superadmin', 'shopper'];
      let foundToken = null;
      //let foundRole = null;

      for (const role of roles) {
        const roleToken = localStorage.getItem(`${role}_token`);
        if (roleToken) {
          foundToken = roleToken;
          //foundRole = role;
          break;
        }
      }

      const token = foundToken || localStorage.getItem('token');

      if (token && isTokenExpired(token)) {
        console.log('⏰ Token expired, clearing session');
        
        // ✅ Clear ALL auth tokens
        roles.forEach(role => {
          localStorage.removeItem(`${role}_token`);
          localStorage.removeItem(`${role}_user`);
        });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // ✅ Keep guest session if it exists
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

    // Initial check
    checkTokenExpiration();

    // ✅ Check every 60 seconds
    const interval = setInterval(() => {
      if (checkTokenExpiration()) {
        clearInterval(interval);
      }
    }, 60000);

    return () => clearInterval(interval);
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

  // ✅ Enhanced logout
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
      
      // ✅ IMPORTANT: Keep guest session for cart persistence
      const guestToken = localStorage.getItem('guestSessionToken');
      console.log(guestToken ? '✅ Guest session preserved' : 'ℹ️ No guest session to preserve');
      
      setUser(null);
      
      // ✅ FIX: Use navigate instead of window.location for proper React Router handling
      // This allows the App.jsx route to handle the redirect
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