// Base API URL - uses environment variables with fallback
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Debug logging in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 API Base URL:', API_BASE_URL);
  console.log('🔧 Environment:', process.env.NODE_ENV);
}

// Authentication service functions
class AuthService {
  extractUserIdFromToken(token) {
    try {
      if (!token) return null;
      
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = parts[1];
      const paddedPayload = payload.padEnd(payload.length + (4 - payload.length % 4) % 4, '=');
      const decodedPayload = atob(paddedPayload);
      const parsed = JSON.parse(decodedPayload);

      // Add debug log
      console.log('[DEBUG] Decoded JWT payload:', parsed);

      // Check for userId, id, or sub
      return parsed.userId || parsed.id || parsed.sub || null;
    } catch (error) {
      console.error('Failed to extract userId from token:', error);
      return null;
    }
  }

  async register(userData) {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Registering user:', userData.email, 'as', userData.role);
      }
      
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Change 'email' to 'identifier' to match API expectations
          identifier: userData.email, // This will accept either email or phone
          password: userData.password,
          role: userData.role || 'shopper',
          ...(userData.storeName && { storeName: userData.storeName })
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        const error = new Error(data.message || 'Registration failed');
        error.status = response.status;
        throw error;
      }

      const token = data.token || (data.data && data.data.token);
      const userId = token ? this.extractUserIdFromToken(token) : null;

      return {
        message: data.message,
        token,
        userId,
        originalResponse: data
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Registration error:', error);
      }
      throw error;
    }
  }

  async login(credentials) {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Attempting login for:', credentials.identifier, 'as', credentials.role);
      }
      
      const requestBody = {
        identifier: credentials.identifier || credentials.email,
        password: credentials.password,
        role: credentials.role || 'shopper'
      };

      if (credentials.role === 'vendor' && credentials.storeName) {
        requestBody.storeName = credentials.storeName;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      if (!response.ok) {
        const error = new Error(data.message || 'Login failed');
        error.status = response.status;
        throw error;
      }

      // ✅ ENHANCED: Debug response structure with request context
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Auth service response analysis:', {
          requestRole: requestBody.role,           // ✅ What we sent
          responseHasRole: !!data.role,            // ✅ Does response have role?
          responseRole: data.role,                 // ✅ What role if any
          responseHasUser: !!data.user,            // ✅ Nested structure?
          responseUserRole: data.user?.role,       // ✅ Role in user object?
          responseKeys: Object.keys(data),         // ✅ All response fields
          tokenLength: data.token?.length,
          tokenStart: data.token?.substring(0, 20)
        });
      }

      // ✅ Option 1: Update Response Parsing
      // Extract token and user from data or data.data (for nested API responses)
      let token, user;
      if (data.data && typeof data.data === 'object') {
        token = data.data.token;
        user = data.data.user;
      } else {
        token = data.token;
        user = data.user;
      }

      // Normalize user object and preserve role
      const normalizedUser = user
        ? { ...user, role: user.role || requestBody.role }
        : null;

      // Debug sanity check
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Normalized login response:', { token, user: normalizedUser });
      }

      // Validate final normalized response
      if (!token || !normalizedUser || !normalizedUser.role) {
        console.error('❌ Critical: Missing token or user role in login response!', {
          token,
          user: normalizedUser,
          originalData: data
        });
        throw new Error('Authentication failed: missing token or user role');
      }

      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Token and user stored successfully');
      }

      return { token, user: normalizedUser };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Login error:', error);
      }
      throw error;
    }
  }

  async verifyOTP(otpData) {
    try {
      console.log('🔄 Verifying OTP for user:', otpData.userId);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: otpData.userId,
          code: otpData.code,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        const error = new Error(data.message || 'OTP verification failed');
        error.status = response.status;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  }

  async resendOTP(requestData) {
    try {
      console.log('🔄 Resending OTP to:', requestData.email || requestData.phone);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: requestData.email,
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        const error = new Error(responseData.message || 'Failed to resend OTP');
        error.status = response.status;
        throw error;
      }

      return responseData;
    } catch (error) {
      console.error('Resend OTP error:', error);
      throw error;
    }
  }

  setAuthToken(token) {
    if (token) {
      localStorage.setItem('token', token);
    }
  }

  removeAuthToken() {
    localStorage.removeItem('token');
  }

  getAuthToken() {
    return localStorage.getItem('token');
  }

  setUser(user) {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  removeUser() {
    localStorage.removeItem('user');
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  async logout() {
    this.removeAuthToken();
    this.removeUser();
  }

  async registerVendor(userData) {
    if (!userData.storeName) {
      throw new Error('Store name is required for vendor registration');
    }

    return this.register({
      email: userData.email,
      password: userData.password,
      role: 'vendor',
      storeName: userData.storeName
    });
  }

  async adminLogin(credentials) {
    try {
      console.log('🔄 Admin login attempt for:', credentials.email);
      
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (!response.ok) {
        const error = new Error(data.message || 'Admin login failed');
        error.status = response.status;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  }

  async createAdmin(adminData) {
    try {
      console.log('🔄 Creating admin:', adminData.email);
      
      const response = await fetch(`${API_BASE_URL}/api/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          email: adminData.email,
          password: adminData.password,
          firstName: adminData.firstName,
          lastName: adminData.lastName,
          phone: adminData.phone,
          role: adminData.role || 'admin'
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        const error = new Error(data.message || 'Admin creation failed');
        error.status = response.status;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Create admin error:', error);
      throw error;
    }
  }

  async forgotPassword(requestData) {
    try {
      console.log('🔄 Forgot password request for:', requestData.email);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        const error = new Error(responseData.message || 'Forgot password failed');
        error.status = response.status;
        throw error;
      }

      return responseData;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  async resetPassword(resetData) {
    try {
      console.log('🔄 Resetting password for:', resetData.email);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetData)
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        const error = new Error(responseData.message || 'Password reset failed');
        error.status = response.status;
        throw error;
      }

      return responseData;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }
}

/**
 * Authenticated fetch wrapper
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 */
export const authFetch = async (url, options = {}) => {
  const token = authServiceInstance.getAuthToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 AuthFetch request:', { url, method: config.method || 'GET' });
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401) {
        authServiceInstance.logout();
        throw new Error('Authentication required');
      }
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ AuthFetch error:', error);
    }
    throw error;
  }
};

const authServiceInstance = new AuthService();
export default authServiceInstance;
