import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const AdminLoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
      console.log('🔐 Admin login attempt:', { email: data.username, password: '***' });
      
      // ✅ Import authService dynamically
      const authService = (await import('../../services/authService')).default;
      
      const response = await authService.adminLogin({
        email: data.username,
        password: data.password
      });

      console.log('✅ Admin login successful:', response);

      if (response.admin && response.token) {
        const adminWithRole = {
          ...response.admin,
          role: response.admin.role || 'admin'
        };
        
        console.log('🔑 Admin user being stored:', adminWithRole);
        
        await login(adminWithRole, response.token);
        
        // After successful login response
        const userData = {
          id: response.user?.id || response.user?._id,
          email: response.user?.email,
          role: response.user?.role || 'admin',
          firstName: response.user?.firstName,
          lastName: response.user?.lastName,
          ...response.user
        };

        // ✅ authService already imported above
        authService.setAuthToken(response.token, userData.role);
        authService.setUser(userData);
        
        // Navigate to admin dashboard
        navigate('/admin/dashboard', {
          state: {
            message: `Welcome back, ${response.admin?.name || response.admin?.email || 'Admin'}!`,
            type: 'success'
          }
        });
      } else {
        setError('Invalid response from server. Please try again.');
      }

    } catch (error) {
      console.error('❌ Admin login failed:', error);
      
      // Handle specific error cases
      if (error.status === 401) {
        setError('Invalid email or password. Please check your credentials.');
      } else if (error.status === 403) {
        setError('Access denied. Please contact the system administrator.');
      } else {
        setError(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[rgba(249,249,249,1)] overflow-hidden min-h-screen">
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-full max-w-md">
          {/* Logo Section - Clickable to home */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <img
                src="https://cdn.builder.io/api/v1/image/assets/ea356ae0f1da43fbbc02727416114024/eee8f71bfde6a3b1e04aa9edd9c252a82b00ff2c?placeholderIfAbsent=true"
                alt="Fashion App Logo"
                className="w-[38px] h-[31px] object-contain"
              />
              <div className="font-['Urbanist',Helvetica] font-bold text-black text-base sm:text-lg leading-[19.2px]">
                <div className="whitespace-pre-wrap">FASHION  </div>
                <div>CULTURE</div>
              </div>
            </button>
          </div>

          {/* Title - Better responsive scaling */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Admin Login
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Access the administrative dashboard
            </p>
          </div>

          {/* Form Container - Properly responsive */}
          <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md lg:max-w-lg">
            <div className="bg-white py-6 sm:py-8 px-4 sm:px-6 lg:px-10 shadow-md sm:rounded-lg">
              
              {/* Error Message */}
              {error && (
                <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Admin Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1">
                    <input
                      id="username"
                      name="username"
                      type="email"
                      autoComplete="email"
                      required
                      disabled={isLoading}
                      placeholder="admin@example.com"
                      className="appearance-none block w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      disabled={isLoading}
                      placeholder="Enter your password"
                      className="appearance-none block w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="flex items-center justify-end">
                  <div className="text-sm">
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')} // ✅ Use regular forgot password
                      disabled={isLoading}
                      className="font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                    >
                      Forgot your password?
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </div>

                {/* Navigation Link */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    disabled={isLoading}
                    className="text-indigo-600 text-sm hover:text-indigo-500 disabled:opacity-50"
                  >
                    ← Back to Main Site
                  </button>
                </div>
              </form>

              {/* ✅ TEST CREDENTIALS - Always visible with better responsive design */}
              <div className="mt-6 sm:mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Development Access</span>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Test Credentials</h3>
                  <div className="text-xs sm:text-sm text-blue-700 space-y-1">
                    <div><strong>Email:</strong> admin@example.com</div>
                    <div><strong>Password:</strong> SecurePass123!</div>
                  </div>
                  <p className="text-xs sm:text-sm text-blue-600 mt-2">
                    Use these credentials for development and testing
                  </p>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginForm;