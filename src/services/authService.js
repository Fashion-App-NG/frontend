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

// Authentication service functions
export const authService = {
  // Register new user
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        password: userData.password
      }),
    });
  },

  // Verify OTP - based on API docs, no Authorization header needed
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

  // Logout user
  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },
};

export default authService;