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
      const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
      const decodedPayload = atob(paddedPayload);
      const parsed = JSON.parse(decodedPayload);

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
          email: userData.email,
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

      const userId = data.token ? this.extractUserIdFromToken(data.token) : null;

      return {
        message: data.message,
        token: data.token,
        userId: userId,
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

      // ✅ FIXED: Improved response normalization with role preservation
      let normalizedResponse;
      
      if (data.user && typeof data.user === 'object') {
        // Nested structure: { user: {...}, token: "..." }
        console.log('📦 Using nested response structure');
        normalizedResponse = {
          user: {
            ...data.user,
            // ✅ Preserve role from request if not in response
            role: data.user.role || requestBody.role
          },
          token: data.token
        };
      } else if (data.email && data.id && data.token) {
        // ✅ FIXED: Flat structure - extract user data AND preserve role
        console.log('📦 Using flat response structure - extracting user data');
        const { token, ...userData } = data;
        normalizedResponse = {
          user: {
            ...userData,
            // ✅ CRITICAL: Use role from response OR preserve from request
            role: userData.role || requestBody.role
          },
          token: token
        };
      } else {
        // Final fallback
        console.log('📦 Using fallback response structure');
        const { token, ...userData } = data;
        normalizedResponse = {
          user: {
            ...(userData.user || userData),
            // ✅ Always preserve role from request as final fallback
            role: (userData.user?.role || userData.role || requestBody.role)
          },
          token: token || data.token
        };
      }

      // ✅ ENHANCED: Detailed post-normalization debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Normalized response with role preservation:', {
          originalRequestRole: requestBody.role,
          responseIncludedRole: !!data.role || !!data.user?.role,
          finalUserRole: normalizedResponse.user?.role,
          userEmail: normalizedResponse.user?.email,
          userId: normalizedResponse.user?.id,
          userStoreName: normalizedResponse.user?.storeName,
          roleSource: data.role || data.user?.role ? 'response' : 'preserved_from_request'
        });
      }

      // Validate final normalized response
      if (!normalizedResponse.user?.role) {
        console.error('❌ Critical: No role in final normalized response!', {
          requestRole: requestBody.role,
          responseData: data,
          normalizedResponse
        });
        throw new Error('Authentication failed: missing user role');
      }

      // Store token and user data
      if (normalizedResponse.token) {
        localStorage.setItem('token', normalizedResponse.token);
        console.log('✅ Token stored successfully');
      }
      
      if (normalizedResponse.user) {
        localStorage.setItem('user', JSON.stringify(normalizedResponse.user));
        console.log('✅ User data stored successfully:', {
          id: normalizedResponse.user.id,
          role: normalizedResponse.user.role,
          email: normalizedResponse.user.email
        });
      }

      return normalizedResponse;
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

const authServiceInstance = new AuthService();
export default authServiceInstance;
