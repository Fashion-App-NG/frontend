import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PasswordInput } from './PasswordInput';

export const AdminLoginForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const data = {
      username: formData.get('username'),
      password: formData.get('password')
    };

    // Client-side validation
    if (!data.username || !data.password) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    try {
      // TODO: Replace with actual admin login API call
      console.log('🔐 Admin login attempt:', { username: data.username, password: '***' });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock success response for now
      const mockResponse = {
        success: true,
        user: {
          id: 'admin_1',
          username: data.username,
          role: 'admin',
          permissions: ['user_management', 'system_settings', 'analytics']
        },
        token: 'mock_admin_token_' + Date.now()
      };

      console.log('✅ Admin login successful (mock):', mockResponse);

      // TODO: Store admin authentication data when API is ready
      // authService.setAuthToken(mockResponse.token);
      // authService.setUser(mockResponse.user);
      
      // Navigate to admin dashboard (to be created)
      navigate('/admin/dashboard', {
        state: {
          message: `Welcome back, Admin ${data.username}!`,
          user: mockResponse.user
        }
      });

    } catch (error) {
      console.error('❌ Admin login failed:', error);
      setError('Invalid admin credentials. Please try again.');
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

          {/* Username Field */}
          <div className="space-y-2">
            <label className="block text-[#2e2e2e] text-base font-['Urbanist',Helvetica]">
              Username
            </label>
            <input
              type="text"
              name="username"
              placeholder="Email Address"
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
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="******************"
                required
                disabled={isLoading}
                className="w-full h-[57px] px-4 py-3 pr-12 bg-[#efefef] border border-[rgba(212,212,212,0.22)] rounded-[5px] backdrop-blur-[4px] text-[#c7c7c7] placeholder-[#c7c7c7] focus:outline-none focus:ring-2 focus:ring-[#303030] focus:border-transparent disabled:opacity-50 font-['Urbanist',Helvetica] text-[20px] font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-30 hover:opacity-70 transition-opacity focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <img
                  src={showPassword ? "/icons/eye-open.svg" : "/icons/eye-closed.svg"}
                  alt={showPassword ? "Hide password" : "Show password"}
                  className="w-6 h-6"
                  onError={(e) => {
                    // Fallback to Unicode symbols if SVG fails to load
                    e.target.style.display = 'none';
                    e.target.parentNode.textContent = showPassword ? '👁️' : '👁️‍🗨️';
                  }}
                />
              </button>
            </div>
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

        {/* Development Notice */}
        <div className="mt-8 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
          <p className="text-yellow-800 text-sm text-center">
            <strong>Development Mode:</strong> Admin authentication is not yet connected to backend API
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginForm;