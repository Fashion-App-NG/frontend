import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

export const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.target);
    const email = formData.get('email');

    // Client-side validation
    if (!email) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.forgotPassword(email);
      
      console.log('✅ Forgot password request successful:', response);
      
      // Store email for password reset flow
      sessionStorage.setItem('passwordResetEmail', email);
      
      setSuccess(response.message || 'An OTP has been sent to your email. Please check your email.');
      
      // Redirect to password reset OTP page after 2 seconds
      setTimeout(() => {
        navigate('/reset-password');
      }, 2000);

    } catch (error) {
      console.error('❌ Forgot password failed:', error);
      
      // Handle specific error cases based on API spec
      if (error.message.includes('Missing email') || error.message.includes('400')) {
        setError('Email address is required');
      } else if (error.message.includes('User not found') || error.message.includes('404')) {
        setError('No account found with this email address. Please check your email or create a new account.');
      } else if (error.message.includes('500')) {
        setError('Unable to send reset code at this time. Please try again later.');
      } else {
        setError(error.message || 'Failed to send reset code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      {/* Shopper Password Reset Indicator */}
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-[#3b82f6] text-white px-3 py-1 rounded-full text-xs font-semibold">
          Password Reset
        </div>
        <span className="text-[rgba(46,46,46,0.6)] text-sm">Account Recovery</span>
      </div>

      <div className="flex flex-col items-stretch mt-[32px] max-md:ml-1 max-md:mt-6">
        <h1 className="text-black text-[32px] font-bold">
          Forgot Password
        </h1>
        <p className="text-[rgba(46,46,46,1)] text-base font-normal leading-[1.2] mt-[5px]">
          Enter your email to receive a password reset code
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mt-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {success}
          </div>
        </div>
      )}

      {/* Email Address Field */}
      <label className="text-[rgba(46,46,46,1)] text-sm font-normal leading-[1.2] mt-[42px] max-md:mt-10">
        Email Address
      </label>
      <input
        type="email"
        name="email"
        placeholder="Enter your email address"
        required
        disabled={isLoading}
        className="self-stretch bg-[rgba(242,242,242,1)] border min-h-[61px] gap-[5px] text-base text-[rgba(180,180,180,1)] font-normal leading-[1.2] mt-4 px-4 py-[21px] rounded-[5px] border-[rgba(203,203,203,1)] border-solid disabled:opacity-50"
      />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="self-stretch bg-[rgba(46,46,46,1)] min-h-[52px] text-base text-[rgba(237,255,140,1)] font-bold leading-[1.2] mt-[29px] px-4 py-[21px] rounded-[26px] max-md:max-w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Sending Reset Code...' : 'Send Reset Code'}
      </button>

      {/* Navigation Links */}
      <div className="self-center flex items-center text-sm text-[rgba(46,46,46,1)] font-normal leading-[1.2] mt-[11px]">
        <span className="self-stretch my-auto">Remember your password?</span>
        <button 
          type="button"
          onClick={() => navigate('/login')}
          disabled={isLoading}
          className="self-stretch my-auto font-bold ml-1 disabled:opacity-50"
        >
          Sign in
        </button>
      </div>

      <div className="self-center flex items-center text-sm text-[rgba(46,46,46,1)] font-normal leading-[1.2] mt-2">
        <span className="self-stretch my-auto">Don't have an account?</span>
        <button 
          type="button"
          onClick={() => navigate('/register/shopper')}
          disabled={isLoading}
          className="self-stretch my-auto font-bold ml-1 disabled:opacity-50"
        >
          Sign up
        </button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;