// Base API URL - uses environment variables with fallback
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002/api';

// Debug logging in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 API Base URL:', API_BASE_URL);
  console.log('🔧 Environment:', process.env.NODE_ENV);
}

// Helper function for making HTTP requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`🚀 API Request: ${options.method || 'GET'} ${url}`);
    console.log('📤 Headers:', config.headers);
    console.log('📤 Body:', options.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (process.env.NODE_ENV === 'development') {
      console.log(`📥 Response [${response.status}]:`, data);
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('💥 API request failed:', error);
    throw error;
  }
};

// JWT decoder function to extract userId from token
const extractUserIdFromToken = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const payload = parts[1];
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decodedPayload = atob(paddedPayload);
    const parsed = JSON.parse(decodedPayload);

    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Decoded JWT payload:', parsed);
    }

    const userId = parsed.userId || parsed.id || parsed.sub;

    if (!userId) {
      console.error('❌ No userId found in token payload');
      return null;
    }

    const cleanUserId = String(userId).trim();

    if (cleanUserId.length !== 24) {
      console.error(`❌ Invalid userId length: ${cleanUserId.length} characters. Expected 24.`);
      return null;
    }

    if (!/^[0-9a-fA-F]{24}$/.test(cleanUserId)) {
      console.error(`❌ Invalid userId format: "${cleanUserId}". Must be 24 hex characters.`);
      return null;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Valid userId extracted: "${cleanUserId}"`);
    }
    return cleanUserId;

  } catch (error) {
    console.error('❌ Failed to extract userId from token:', error);
    return null;
  }
};

// Authentication service functions
export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        password: userData.password
      }),
    });

    // Extract userId from token for OTP verification
    if (response.token) {
      const userId = extractUserIdFromToken(response.token);
      response.extractedUserId = userId;
    }

    return response;
  },

  // Login user
  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier: credentials.email,
        password: credentials.password
      }),
    });
  },

  // Vendor login
  loginVendor: async (credentials) => {
    return apiRequest('/auth/vendor/login', {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email,
        storeName: credentials.storeName,
        password: credentials.password
      }),
    });
  },

  // Verify OTP - no Authorization header needed per your tests
  verifyOTP: async (otpData) => {
    return apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        userId: otpData.userId,
        code: otpData.code
      }),
    });
  },

  // Resend OTP - API expects email or phone, not userId
  resendOTP: async (email) => {
    return apiRequest('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({
        email: email
      }),
    });
  },

  // Logout user
  logout: async () => {
    try {
      // Call backend logout API (optional - for server-side session cleanup)
      await apiRequest('/auth/logout', {
        method: 'POST',
      });
      
      console.log('✅ Server logout successful');
    } catch (error) {
      // Don't throw error here - we still want to clear local data
      console.warn('⚠️ Server logout failed (continuing with local cleanup):', error);
    } finally {
      // Always clear local authentication data
      authService.removeAuthToken();
      authService.removeUser();
      
      console.log('✅ Local authentication data cleared');
    }
  },

  // Forgot Password - Request OTP for password reset
  forgotPassword: async (email) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({
        email: email
      }),
    });
  },

  // Reset Password - Submit OTP and new password
  resetPassword: async (resetData) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        email: resetData.email,
        code: resetData.code,
        password: resetData.password
      }),
    });
  },

  // Helper functions for token management
  setAuthToken: (token) => {
    localStorage.setItem('authToken', token);
  },

  getAuthToken: () => {
    return localStorage.getItem('authToken');
  },

  removeAuthToken: () => {
    localStorage.removeItem('authToken');
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  removeUser: () => {
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = authService.getAuthToken();
    const user = authService.getUser();
    return !!(token && user);
  }
};

export default authService;
