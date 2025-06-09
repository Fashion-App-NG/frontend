import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PasswordInput } from './PasswordInput';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

export const LoginForm = () => {
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
      password: formData.get('password')
    };

    // Client-side validation
    if (!data.email || !data.password) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    try {
      // Call the login API
      const response = await authService.login({
        email: data.email,
        password: data.password
      });

      console.log('✅ Login successful:', response);

      // Store authentication data
      if (response.token) {
        authService.setAuthToken(response.token);
      }

      if (response.user) {
        authService.setUser(response.user);
        setUser(response.user);
      }

      setIsAuthenticated(true);

      // Navigate to home page or dashboard after successful login
      navigate('/', { 
        state: { 
          message: `Welcome back, ${response.user?.email || 'User'}!` 
        }
      });

    } catch (error) {
      console.error('❌ Login failed:', error);

      // Handle specific error cases based on API docs
      if (error.message.includes('verify OTP')) {
        setError('Please verify your email address before logging in. Check your email for the verification code.');
        // You could also redirect to OTP verification here if needed
      } else if (error.message.includes('Invalid credentials')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="flex flex-col items-stretch mt-[66px] max-md:ml-1 max-md:mt-10">
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

      <label className="text-[rgba(46,46,46,1)] text-sm font-normal leading-[1.2] mt-[9px]">
        Password
      </label>
      <PasswordInput 
        name="password"
        placeholder="Enter Password" 
        eyeIconUrl="https://cdn.builder.io/api/v1/image/assets/ea356ae0f1da43fbbc02727416114024/fa61a7ea2e8a3f0de0c22adc1913896bf9ccc751?placeholderIfAbsent=true"
        disabled={isLoading}
      />

      <div className="flex justify-end mt-2">
        <button 
          type="button" 
          disabled={isLoading}
          className="text-[rgba(46,46,46,1)] text-sm font-normal underline hover:no-underline disabled:opacity-50"
        >
          Forgot Password
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="self-stretch bg-[rgba(46,46,46,1)] min-h-[52px] text-base text-[rgba(237,255,140,1)] font-bold leading-[1.2] mt-[29px] px-4 py-[21px] rounded-[26px] max-md:max-w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>

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
    </form>
  );
};

export default LoginForm;