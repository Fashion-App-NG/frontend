import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';

export const AdminLoginForm = () => {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const data = {
      username: formData.get('username'), // Will be treated as email
      password: formData.get('password')
    };

    // Client-side validation
    if (!data.username || !data.password) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔐 Admin login attempt:', { email: data.username, password: '***' });
      
      // ✅ Use real API endpoint
      const response = await authService.adminLogin({
        email: data.username, // API expects email field
        password: data.password
      });

      console.log('✅ Admin login successful:', response);

      // Store admin authentication data
      if (response.token) {
        authService.setAuthToken(response.token);
        authService.setAdminToken(response.token);
      }

      if (response.admin) {
        authService.setUser(response.admin);
        authService.setAdminUser(response.admin);
        setUser(response.admin);
      }

      setIsAuthenticated(true);

      // Navigate to admin dashboard
      navigate('/admin/dashboard', {
        state: {
          message: response.message || `Welcome back, Admin ${response.admin?.email || data.username}!`,
          user: response.admin
        }
      });

    } catch (error) {
      console.error('❌ Admin login failed:', error);
      
      // Enhanced error handling based on API responses
      if (error.message.includes('Invalid email or password') || error.message.includes('401')) {
        setError('Invalid admin credentials. Please check your email and password.');
      } else if (error.message.includes('403')) {
        setError('Access denied. This account does not have admin privileges.');
      } else if (error.message.includes('429')) {
        setError('Too many login attempts. Please wait 5 minutes before trying again.');
      } else if (error.message.includes('500')) {
        setError('Server temporarily unavailable. Please try again in a few minutes.');
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-1">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/ea356ae0f1da43fbbc02727416114024/eee8f71bfde6a3b1e04aa9edd9c252a82b00ff2c?placeholderIfAbsent=true"
              alt="Fashion App Logo"
              className="w-[38px] h-[31px] object-contain"
            />
            <div className="font-['Urbanist',Helvetica] font-bold text-black text-base leading-[19.2px]">
              <div className="whitespace-pre-wrap">FASHION  </div>
              <div>CULTURE</div>
            </div>
          </div>
        </div>

        {/* Admin Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Admin Login Header */}
          <div className="text-center mb-8">
            <h1 className="font-['Urbanist',Helvetica] font-bold text-[#000] text-[32px] leading-normal">
              Admin Login
            </h1>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label className="block text-[#2e2e2e] text-base font-['Urbanist',Helvetica]">
              Email Address
            </label>
            <input
              type="email"
              name="username"
              placeholder="admin@example.com"
              required
              disabled={isLoading}
              className="w-full h-[57px] px-4 py-3 bg-[#efefef] border border-[rgba(212,212,212,0.22)] rounded-[5px] backdrop-blur-[4px] text-[#c7c7c7] placeholder-[#c7c7c7] focus:outline-none focus:ring-2 focus:ring-[#303030] focus:border-transparent disabled:opacity-50 font-['Urbanist',Helvetica]"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="block text-[#2e2e2e] text-base font-['Urbanist',Helvetica]">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                name="password"
                placeholder="SecurePass123!"
                required
                disabled={isLoading}
                className="w-full h-[57px] px-4 py-3 pr-12 bg-[#efefef] border border-[rgba(212,212,212,0.22)] rounded-[5px] backdrop-blur-[4px] text-[#c7c7c7] placeholder-[#c7c7c7] focus:outline-none focus:ring-2 focus:ring-[#303030] focus:border-transparent disabled:opacity-50 font-['Urbanist',Helvetica] text-[20px] font-medium"
              />
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/admin/forgot-password')}
              disabled={isLoading}
              className="text-sm text-[#2e2e2e] hover:underline disabled:opacity-50"
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#303030] text-[#edff8c] h-[60px] rounded-[50px] font-['Urbanist',Helvetica] font-bold text-[20px] leading-[120.05%] hover:bg-[#404040] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Signing in...
              </span>
            ) : (
              'Login'
            )}
          </button>

          {/* Navigation Links */}
          <div className="text-center space-y-2 pt-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              disabled={isLoading}
              className="text-[#2e2e2e] text-sm hover:underline disabled:opacity-50 font-['Urbanist',Helvetica]"
            >
              ← Back to Main Site
            </button>
          </div>
        </form>

        {/* Test Credentials Notice */}
        <div className="mt-8 p-4 bg-blue-100 border border-blue-400 rounded-lg">
          <p className="text-blue-800 text-sm text-center">
            <strong>Test Credentials:</strong><br />
            Email: admin@example.com<br />
            Password: SecurePass123!
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginForm;