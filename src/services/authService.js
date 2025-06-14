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
class AuthService {
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          role: userData.role || 'shopper', // ✅ Ensure role is always included
          // Don't include storeName for shoppers
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        const error = new Error(data.message || 'Registration failed');
        error.status = response.status;
        throw error;
      }

      // ✅ API now returns user data in response
      return {
        message: data.message,
        token: data.token,
        user: data.user,
        extractedUserId: data.user?.id // For backward compatibility
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: credentials.identifier || credentials.email, // ✅ Use identifier
          password: credentials.password,
          role: credentials.role || 'shopper', // ✅ Include role
          // Don't include storeName for shoppers
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
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: otpData.userId, // ✅ Use userId instead of email
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

  async resendOTP(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email, // ✅ API accepts email or phone
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        const error = new Error(data.message || 'Failed to resend OTP');
        error.status = response.status;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Resend OTP error:', error);
      throw error;
    }
  }
}

export default AuthService;
