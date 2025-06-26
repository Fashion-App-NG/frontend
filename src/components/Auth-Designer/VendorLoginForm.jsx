import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import SocialLogin from './SocialLogin';

export const VendorLoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    const formData = new FormData(e.target);
    const data = {
      email: formData.get('email'),
      password: formData.get('password')
    };

    // ✅ Enhanced validation with debug info (dev only)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 VendorLoginForm validation:', {
        email: data.email ? 'Present' : 'Missing',
        password: data.password ? 'Present' : 'Missing'
      });
    }

    if (!data.email || !data.password) {
      const missingFields = [];
      if (!data.email) missingFields.push('email');
      if (!data.password) missingFields.push('password');
      
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setIsLoading(false);
      return;
    }

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 VendorLoginForm: Attempting vendor login');
      }

      const response = await authService.login({
        identifier: data.email,
        password: data.password,
        role: 'vendor'
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Vendor login API response:', {
          hasToken: !!response.token,
          hasUser: !!response.user,
          userRole: response.user?.role,
          userEmail: response.user?.email,
          userId: response.user?.id,
          userStoreName: response.user?.storeName,
          fullUserObject: response.user,
          // ✅ ENHANCED: Debug the actual response structure
          rawResponse: response,
          responseKeys: Object.keys(response),
          responseType: typeof response,
          directRole: response.role,
          directEmail: response.email,
          directId: response.id,
          directStoreName: response.storeName
        });
      }

      // ✅ FIXED: Handle both nested and flat response structures
      const userData = response.user || response;
      const token = response.token;

      if (!userData || !token) {
        console.error('❌ Invalid response structure:', response);
        setError('Invalid response from server. Please try again.');
        return;
      }

      if (!userData.id || !userData.email) {
        console.error('❌ User missing required fields:', userData);
        setError('Invalid user data received. Please contact support.');
        return;
      }

      // ✅ ENHANCED: Role validation debug with fallback context
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Role validation debug:', {
          userDataRole: userData.role,
          userDataEmail: userData.email,
          userId: userData.id,
          userDataType: typeof userData.role,
          roleCheck: userData.role !== 'vendor',
          roleComparison: `"${userData.role}" !== "vendor"`,
          roleLength: userData.role?.length,
          expectedRole: 'vendor',
          expectedLength: 'vendor'.length,
          allUserDataKeys: Object.keys(userData),
          // ✅ ADD: Context about where role came from
          originalRequestRole: 'vendor',
          rolePresentInResponse: 'role' in (response.user || response)
        });
      }

      if (userData.role !== 'vendor') {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Account validation failed:', {
            actualRole: userData.role,
            expectedRole: 'vendor',
            email: userData.email,
            id: userData.id,
            roleType: typeof userData.role,
            fullUserData: userData,
            rawResponse: response,
            rawResponseRole: response.role,
            rawResponseEmail: response.email,
            rawResponseId: response.id,
            // ✅ ENHANCED: Show what we sent vs what we got
            sentRole: 'vendor',
            receivedRole: userData.role,
            rolePreservedFromRequest: !response.role && !response.user?.role
          });
        }
        setError('This account is not registered as a vendor. Please check your credentials or register as a vendor.');
        return;
      }

      // ✅ FIXED: Clean up storeName if it's the string "undefined"
      const userWithCleanData = {
        ...userData,
        storeName: userData.storeName === 'undefined' ? null : userData.storeName
      };

      const loginSuccess = login(userWithCleanData, token);
      
      if (loginSuccess) {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ VendorLoginForm: Login successful, navigating to dashboard');
        }
        navigate('/vendor/dashboard', { 
          state: { 
            message: `Welcome back, ${userWithCleanData?.storeName || userWithCleanData?.email || 'Vendor'}!` 
          }
        });
      } else {
        console.error('❌ VendorLoginForm: AuthContext login returned false');
        setError('Failed to authenticate user. Please try again.');
      }

    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Vendor login failed:', error);
        console.error('❌ Error details:', {
          message: error.message,
          status: error.status,
          stack: error.stack
        });
      }

      let errorMessage = 'Login failed. Please try again.';
      
      if (error.status === 401) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.status === 403) {
        errorMessage = 'Please verify your email address before logging in.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      {/* ✅ Enhanced debug display for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-2 bg-blue-100 text-xs text-blue-800 rounded">
          <div>Debug Info:</div>
          <div>Error: {error || 'none'}</div>
          <div>Loading: {isLoading.toString()}</div>
          <div>Environment: {process.env.NODE_ENV}</div>
          <div>API URL: {process.env.REACT_APP_API_BASE_URL}</div>
        </div>
      )}

      {/* Vendor Onboarding Indicator */}
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-[#22c55e] text-white px-3 py-1 rounded-full text-xs font-semibold">
          Vendor Portal
        </div>
        <span className="text-[rgba(46,46,46,0.6)] text-sm">Business Sign In</span>
      </div>

      <div className="flex flex-col items-stretch mt-[32px] max-md:ml-1 max-md:mt-6">
        <h1 className="text-black text-[32px] font-bold">
          Sign In to Vendor Portal
        </h1>
        <h2 className="text-[rgba(46,46,46,0.6)] text-[15px] mt-2">
          Welcome back to your business dashboard!
        </h2>

        {/* Success Message */}
        {successMessage && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Form Fields */}
        <div className="mt-8 space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="vendor@example.com"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>

        {/* Links */}
        <div className="mt-6 text-center text-sm">
          <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700">
            Forgot Password?
          </Link>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          New vendor?{' '}
          <Link to="/register/vendor" className="text-blue-600 hover:text-blue-700">
            Sign up here
          </Link>
        </div>
      </div>

      <SocialLogin isLogin={true} />
    </form>
  );
};

export default VendorLoginForm;