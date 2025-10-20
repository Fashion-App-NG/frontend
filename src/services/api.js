import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

// ✅ Token validation helper
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    // Token is expired if it expires in less than 1 minute
    return payload.exp <= now + 60;
  } catch (error) {
    console.error('Failed to validate token:', error);
    return true;
  }
};

// ✅ Force logout and redirect
const handleExpiredSession = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔒 Session expired - redirecting to login');
  }
  
  // Clear all auth data
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('guestSessionToken');
  
  // Redirect to login
  window.location.href = '/user-type-selection';
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token and validate expiry
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // ✅ Check if token is expired before making request
    if (token && isTokenExpired(token)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⏰ Token expired, blocking request and logging out');
      }
      handleExpiredSession();
      // Reject the request
      return Promise.reject(new Error('Session expired'));
    }
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔒 401 Unauthorized - session expired');
      }
      handleExpiredSession();
    }
    return Promise.reject(error);
  }
);

export default api;