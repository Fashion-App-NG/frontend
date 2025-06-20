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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const storedUser = localStorage.getItem('user');
      const vendorToken = localStorage.getItem('vendorToken');
      const authToken = localStorage.getItem('authToken');

      if (storedUser && (vendorToken || authToken)) {
        const userData = JSON.parse(storedUser);
        
        // Ensure vendor has required fields
        if (userData.role === 'vendor' && !userData.id) {
          // Generate a temporary vendor ID if missing
          userData.id = userData._id || userData.vendorId || `vendor_${Date.now()}`;
        }

        setUser(userData);
        setIsAuthenticated(true);
        console.log('✅ User authenticated:', userData);
      } else {
        console.log('❌ No valid authentication found');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Login function - add return value for success indication
  const login = async (userData, token) => {
    try {
      console.log('🔐 AuthContext login called with:', { 
        userData: userData, 
        token: token ? `${token.substring(0, 20)}...` : 'None' 
      });
      
      // Store user data
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Store token with proper key based on user role
      if (token) {
        if (userData.role === 'vendor') {
          localStorage.setItem('vendorToken', token);
          console.log('✅ Stored vendor token');
        } else if (userData.role === 'admin') {
          localStorage.setItem('adminToken', token); // ✅ Add admin token support
          localStorage.setItem('authToken', token); // Also store as authToken for compatibility
          console.log('✅ Stored admin token');
        } else {
          localStorage.setItem('authToken', token);
          console.log('✅ Stored auth token');
        }
      } else {
        console.warn('⚠️ No token provided during login');
      }
      
      setIsAuthenticated(true);
      
      // Log all stored tokens for debugging
      console.log('🔍 All stored tokens:', {
        vendorToken: localStorage.getItem('vendorToken') ? 'Present' : 'None',
        authToken: localStorage.getItem('authToken') ? 'Present' : 'None',
        adminToken: localStorage.getItem('adminToken') ? 'Present' : 'None'
      });
      
      return true; // ✅ Return success indicator
      
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminToken'); // Clear admin token on logout
    localStorage.removeItem('vendorProducts'); // Clear cached products
    
    console.log('✅ User logged out');
  };

  // Update user data
  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
    checkAuthStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;