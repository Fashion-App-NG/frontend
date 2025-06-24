// Base API URL - uses environment variables with fallback
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Debug logging in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 API Base URL:', API_BASE_URL);
  console.log('🔧 Environment:', process.env.NODE_ENV);
}

// Authentication service functions
class AuthService {
  // ✅ Simplified userId extraction from JWT
  extractUserIdFromToken(token) {
    try {
      if (!token) return null;
      
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = parts[1];
      const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
      const decodedPayload = atob(paddedPayload);
      const parsed = JSON.parse(decodedPayload);

      // Extract userId based on common JWT patterns
      return parsed.userId || parsed.id || parsed.sub || null;
    } catch (error) {
      console.error('Failed to extract userId from token:', error);
      return null;
    }
  }

  async register(userData) {
    try {
      console.log('🔄 Registering user:', userData.email, 'as', userData.role);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          role: userData.role || 'shopper',
          // ✅ Include storeName if present (for vendors)
          ...(userData.storeName && { storeName: userData.storeName })
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        const error = new Error(data.message || 'Registration failed');
        error.status = response.status;
        throw error;
      }

      // Extract userId from the JWT token
      const userId = data.token ? this.extractUserIdFromToken(data.token) : null;

      return {
        message: data.message,
        token: data.token,
        userId: userId,
        originalResponse: data
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(credentials) {
    try {
      console.log('🔄 Attempting login for:', credentials.identifier, 'as', credentials.role);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: credentials.identifier || credentials.email,
          password: credentials.password,
          role: credentials.role || 'shopper',
          // 🚨 TEMPORARY: Conditional spread for storeName
          // Only includes storeName property if credentials.storeName exists
          ...(credentials.storeName && { storeName: credentials.storeName })
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        const error = new Error(data.message || 'Login failed');
        error.status = response.status;
        throw error;
      }

      // Store token and user data
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
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

  // ✅ Add missing methods for token/user management
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

  // ✅ Add vendor methods
  async registerVendor(userData) {
    // Validate that storeName is provided for vendors
    if (!userData.storeName) {
      throw new Error('Store name is required for vendor registration');
    }

    return this.register({
      email: userData.email,
      password: userData.password,
      role: 'vendor',
      storeName: userData.storeName // ✅ Explicitly include storeName
    });
  }

  async loginVendor(credentials) {
    // ✅ Validate that storeName is provided for vendor login
    if (!credentials.storeName) {
      throw new Error('Store name is required for vendor login');
    }

    return this.login({
      identifier: credentials.identifier || credentials.email,
      password: credentials.password,
      role: 'vendor',
      storeName: credentials.storeName // ✅ Explicitly include storeName
    });
  }

  // ✅ Add admin methods
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

  // ✅ ADD MISSING createAdmin METHOD
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
          role: adminData.role || 'admin' // ✅ Default to 'admin' role
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        const error = new Error(data.message || 'Admin creation failed');
        error.status = response.status;
        throw error;
      }

      console.log('✅ Admin created successfully:', {
        ...data,
        // Don't log sensitive data
        admin: data.admin ? { ...data.admin, password: undefined } : undefined
      });

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

  // ✅ Add missing admin-specific methods if they don't exist
  setAdminToken(token) {
    if (token) {
      localStorage.setItem('adminToken', token);
    }
  }

  getAdminToken() {
    return localStorage.getItem('adminToken');
  }

  setAdminUser(user) {
    if (user) {
      localStorage.setItem('adminUser', JSON.stringify(user));
    }
  }

  getAdminUser() {
    const user = localStorage.getItem('adminUser');
    return user ? JSON.parse(user) : null;
  }
}

// ✅ FIXED: Assign to variable before exporting
const authServiceInstance = new AuthService();
export default authServiceInstance;
