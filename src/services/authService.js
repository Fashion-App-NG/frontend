// Base API URL - you can move this to environment variables later
const API_BASE_URL = 'http://localhost:3002/api';

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

  console.log(`🚀 API Request: ${options.method || 'GET'} ${url}`);
  console.log('📤 Headers:', config.headers);
  console.log('📤 Body:', options.body);

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    console.log(`📥 Response [${response.status}]:`, data);

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
    
    console.log('🔍 Decoded JWT payload:', parsed);
    
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
    
    console.log(`✅ Valid userId extracted: "${cleanUserId}"`);
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
    return apiRequest('/auth/logout', {
      method: 'POST',
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
