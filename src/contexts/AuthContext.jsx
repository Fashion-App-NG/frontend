import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
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

      // ✅ Enhanced user data processing with better role handling
      const processedUser = {
        id: userData.id || userData._id,
        email: userData.email,
        role: userData.role || (userData.storeName ? 'vendor' : 'user'), // ✅ Infer role from context
        storeName: userData.storeName,
        firstName: userData.firstName,
        lastName: userData.lastName,
        // Preserve all other fields
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
    
    setUser(null);
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('adminToken');
    
    setTimeout(() => {
      window.location.href = '/user-type-selection';
    }, 100);
  };

  const value = {
    user,
    isAuthenticated: !!user && !!user.id,
    loading,
    login,
    logout
  };

  // ✅ Enhanced debug logging (dev only)
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

// ✅ Make sure AuthContext is exported
export { AuthContext };
export default AuthProvider;