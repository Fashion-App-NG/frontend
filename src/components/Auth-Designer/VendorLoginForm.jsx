import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import { PasswordInput } from './PasswordInput';
import { SocialLogin } from './SocialLogin';

export const VendorLoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setIsAuthenticated } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Check if there's a success message from OTP verification
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after showing it
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
      storeName: formData.get('storeName'),
      password: formData.get('password')
    };

    // Client-side validation
    if (!data.email || !data.storeName || !data.password) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.loginVendor({
        identifier: data.email,
        password: data.password,
        role: "vendor",
        storeName: data.storeName
      });

      console.log('✅ Vendor login successful:', response);

      // Store authentication data
      if (response.token) {
        authService.setAuthToken(response.token);
      }

      if (response.user) {
        authService.setUser(response.user);
        setUser(response.user);
      }

      setIsAuthenticated(true);

      // ✅ React Router: Navigate to VENDOR dashboard specifically
      navigate('/vendor/dashboard', { 
        state: { 
          message: `Welcome back, ${response.user?.storeName || data.storeName}!` 
        }
      });

    } catch (error) {
      console.error('❌ Vendor login failed:', error);

      // Handle new error codes
      if (error.status === 401) {
        if (error.message.includes('storeName')) {
          setError('Incorrect store name. Please check your store name and try again.');
        } else {
          setError('Invalid credentials. Please check your email and password.');
        }
      } else if (error.status === 403) {
        setError('Please verify your email address before logging in.');
      } else {
        setError(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
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
        <p className="text-[rgba(46,46,46,1)] text-base font-normal leading-[1.2] mt-[5px]">
          Welcome back to your business dashboard!
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mt-4">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
          {error}
        </div>
      )}

      {/* Store Name Field */}
      <label className="text-[rgba(46,46,46,1)] text-sm font-normal leading-[1.2] mt-[42px] max-md:mt-10">
        Store Name
      </label>
      <input
        type="text"
        name="storeName"
        placeholder="Enter Store name"
        required
        disabled={isLoading}
        className="self-stretch bg-[rgba(242,242,242,1)] border min-h-[61px] gap-[5px] text-base text-[rgba(180,180,180,1)] font-normal leading-[1.2] mt-4 px-4 py-[21px] rounded-[5px] border-[rgba(203,203,203,1)] border-solid disabled:opacity-50"
      />

      {/* Email Address Field */}
      <label className="text-[rgba(46,46,46,1)] text-sm font-normal leading-[1.2] mt-[9px]">
        Email Address
      </label>
      <input
        type="email"
        name="email"
        placeholder="Enter your email"
        required
        disabled={isLoading}
        className="self-stretch bg-[rgba(242,242,242,1)] border min-h-[61px] gap-[5px] text-base text-[rgba(180,180,180,1)] font-normal leading-[1.2] mt-4 px-4 py-[21px] rounded-[5px] border-[rgba(203,203,203,1)] border-solid disabled:opacity-50"
      />

      {/* Password Field */}
      <label className="text-[rgba(46,46,46,1)] text-sm font-normal leading-[1.2] mt-[9px]">
        Password
      </label>
      <PasswordInput 
        name="password"
        placeholder="Enter Password" 
        disabled={isLoading}
      />

      <div className="flex justify-end mt-2">
        <button 
          type="button" 
          onClick={() => navigate('/forgot-password')}
          disabled={isLoading}
          className="text-[rgba(46,46,46,1)] text-sm font-normal underline hover:no-underline disabled:opacity-50"
        >
          Forgot Password
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="self-stretch bg-[rgba(46,46,46,1)] min-h-[52px] text-base text-[rgba(237,255,140,1)] font-bold leading-[1.2] mt-[29px] px-4 py-[21px] rounded-[26px] max-md:max-w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>

      {/* Navigation Link */}
      <div className="self-center flex items-center text-sm text-[rgba(46,46,46,1)] font-normal leading-[1.2] mt-[11px]">
        <span className="self-stretch my-auto">New here?</span>
        <button 
          type="button"
          onClick={() => navigate('/register/vendor')}  // ✅ Routes to vendor registration
          disabled={isLoading}
          className="self-stretch my-auto font-bold ml-1 disabled:opacity-50"
        >
          Sign up
        </button>
      </div>

      <SocialLogin isLogin={true} />
    </form>
  );
};

export default VendorLoginForm;