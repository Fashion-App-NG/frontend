import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';

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

    if (!data.username || !data.password) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔐 Admin login attempt:', { email: data.username, password: '***' });
      
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
        
        const userData = {
          id: response.user?.id || response.user?._id,
          email: response.user?.email,
          role: response.user?.role || 'admin',
          firstName: response.user?.firstName,
          lastName: response.user?.lastName,
          ...response.user
        };

        authService.setAuthToken(response.token, userData.role);
        authService.setUser(userData);
        
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
          {/* Logo Section - Updated to Fáàrí */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <img
                src="/favicon.svg"
                alt="Fáàrí Logo"
                className="h-12 w-12 object-contain"
              />
              <div className="flex flex-col">
                <div className="text-2xl font-bold text-gray-900">Fáàrí</div>
                <div className="text-sm text-gray-600">Admin Portal</div>
              </div>
            </button>
          </div>

          {/* Title */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Admin Login
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Access the administrative dashboard
            </p>
          </div>

          {/* Form Container */}
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
                      placeholder="••••••••"
                      className="appearance-none block w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent rounded-md shadow-sm text-sm sm:text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>
              </form>

              {/* Back to Home Link */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate('/')}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  ← Back to home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginForm;