import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import { PasswordInput } from './PasswordInput';
import SocialLogin from './SocialLogin';

export const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // ✅ Use login instead of setUser, setIsAuthenticated
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Check if there's a success message from OTP verification or registration
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
      password: formData.get('password')
    };

    // Client-side validation
    if (!data.email || !data.password) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔐 Shopper login attempt:', { email: data.email, password: '***' });
      
      // ✅ Use regular login for shoppers (not vendor-specific)
      const response = await authService.login({
        identifier: data.email, // Can be email or username
        password: data.password,
        role: "shopper" // Specify shopper role
      });

      console.log('✅ Shopper login successful:', response);

      // ✅ Use the new login function from AuthContext
      if (response.user && response.token) {
        await login(response.user, response.token);
        
        // Navigate to SHOPPER dashboard
        navigate('/shopper/dashboard', { 
          state: { 
            message: `Welcome back, ${response.user?.firstName || response.user?.email || 'Shopper'}!`,
            type: 'success'
          }
        });
      } else {
        setError('Invalid response from server. Please try again.');
      }

    } catch (error) {
      console.error('❌ Shopper login failed:', error);

      // Handle error codes
      if (error.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (error.status === 403) {
        setError('Please verify your email address before logging in.');
      } else if (error.status === 404) {
        setError('Account not found. Please check your email or sign up.');
      } else {
        setError(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 LoginForm rendering');
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      {/* Shopper Indicator */}
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-[#0ea5e9] text-white px-3 py-1 rounded-full text-xs font-semibold">
          Shopper Account
        </div>
        <span className="text-[rgba(46,46,46,0.6)] text-sm">Personal Sign In</span>
      </div>

      <div className="flex flex-col items-stretch mt-[32px] max-md:ml-1 max-md:mt-6">
        <h1 className="text-black text-[32px] font-bold">
          Sign In to Your Account
        </h1>
        <p className="text-[rgba(46,46,46,1)] text-base font-normal leading-[1.2] mt-[5px]">
          Welcome back!
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

      {/* Email Address Field */}
      <label className="text-[rgba(46,46,46,1)] text-sm font-normal leading-[1.2] mt-[42px] max-md:mt-10">
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

      {/* Forgot Password Link */}
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
          onClick={() => navigate('/register')}
          disabled={isLoading}
          className="self-stretch my-auto font-bold ml-1 disabled:opacity-50"
        >
          Sign up
        </button>
      </div>

      {/* ✅ Social Login - Only render once with default import */}
      <SocialLogin isLogin={true} />
    </form>
  );
};

export default LoginForm;