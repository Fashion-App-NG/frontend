import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PasswordInput } from './PasswordInput';
import { SocialLogin } from './SocialLogin';
import { authService } from '../../services/authService';

// JWT decoder function to extract userId from token
const extractUserIdFromToken = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    // Get the payload (second part)
    const payload = parts[1];
    
    // Fix base64 padding if needed
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    
    // Decode from base64
    const decodedPayload = atob(paddedPayload);
    
    // Parse JSON
    const parsed = JSON.parse(decodedPayload);
    console.log('🔍 Decoded JWT payload:', parsed);
    
    // Extract userId and validate
    const userId = parsed.userId || parsed.id || parsed.sub;
    
    if (!userId) {
      console.error('❌ No userId found in token payload');
      return null;
    }
    
    // Ensure userId is exactly 24 characters (MongoDB ObjectId)
    const cleanUserId = String(userId).trim();
    
    if (cleanUserId.length !== 24) {
      console.error(`❌ Invalid userId length: ${cleanUserId.length} characters. Expected 24.`);
      return null;
    }
    
    // Validate hex characters
    if (!/^[0-9a-fA-F]{24}$/.test(cleanUserId)) {
      console.error(`❌ Invalid userId format: "${cleanUserId}". Must be 24 hex characters.`);
      return null;
    }
    
    console.log(`✅ Valid userId extracted: "${cleanUserId}"`);
    return cleanUserId;
    
  } catch (error) {
    console.error('❌ Failed to extract userId from token:', error);
    return null;
  }
};

export const RegisterForm = () => {
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
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
      repeatPassword: formData.get('repeatPassword'),
      terms: formData.get('terms')
    };

    // Client-side validation
    if (!data.email || !data.password || !data.repeatPassword) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    if (data.password !== data.repeatPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!data.terms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      setIsLoading(false);
      return;
    }

    try {
      // Call the registration API
      const response = await authService.register({
        email: data.email,
        password: data.password
      });

      console.log('🔥 Registration response:', response);

      // Extract userId from JWT token (actual backend implementation)
      let userId = null;
      if (response.token) {
        userId = extractUserIdFromToken(response.token);
      }

      if (!userId) {
        setError('Registration successful but verification setup failed. Invalid user ID format. Please try again.');
        setIsLoading(false);
        return;
      }

      // Handle delivery failure
      if (response.error === 'DELIVERY_FAILED') {
        setError(response.message || 'Failed to send verification code. Please check your email and try again.');
        setIsLoading(false);
        return;
      }

      setSuccess('Registration successful! Please check your email for verification code.');
      
      // Store email and userId for OTP verification
      sessionStorage.setItem('pendingVerificationEmail', data.email);
      sessionStorage.setItem('pendingVerificationUserId', userId);
      
      console.log(`✅ Stored in session - Email: ${data.email}, UserId: "${userId}"`);
      
      // Redirect to OTP verification page after successful registration
      setTimeout(() => {
        navigate('/verify-otp');
      }, 2000);

    } catch (error) {
      console.error('❌ Registration error:', error);
      
      // Handle specific error cases
      if (error.message.includes('already exists')) {
        setError('This email is already registered. Please use a different email or try logging in.');
      } else if (error.message.includes('DELIVERY_FAILED')) {
        setError('Failed to send verification code. Please check your email address and try again.');
      } else {
        setError(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="flex flex-col items-stretch mt-[66px] max-md:ml-1 max-md:mt-10">
        <h1 className="text-black text-[32px] font-bold">
          Create Your Account
        </h1>
        <p className="text-[rgba(46,46,46,1)] text-base font-normal leading-[1.2] mt-[5px]">
          Get started for free
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
          {success}
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

      <label className="text-[rgba(46,46,46,1)] text-sm font-normal leading-[1.2] mt-[9px]">
        Repeat Password
      </label>
      <PasswordInput 
        name="repeatPassword"
        placeholder="Repeat Password" 
        eyeIconUrl="https://cdn.builder.io/api/v1/image/assets/ea356ae0f1da43fbbc02727416114024/721587a1008fbb598d4b26f6f18fcdb426762d83?placeholderIfAbsent=true"
        disabled={isLoading}
      />

      <div className="flex items-center gap-[5px] text-xs text-[rgba(46,46,46,1)] font-normal leading-[1.2] mt-2.5 max-md:ml-0.5">
        <input
          type="checkbox"
          name="terms"
          required
          disabled={isLoading}
          className="border w-[17px] h-[17px] rounded-sm border-[rgba(46,46,46,1)] border-solid disabled:opacity-50"
        />
        <label className="self-stretch my-auto">
          I agree to the <span className="underline">Terms of Service</span> and{' '}
          <span className="underline">Privacy Policy</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="self-stretch bg-[rgba(46,46,46,1)] min-h-[60px] text-base text-[rgba(237,255,140,1)] font-bold leading-[1.2] mt-[29px] px-4 py-[21px] rounded-[44px] max-md:max-w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Creating Account...' : 'Continue'}
      </button>

      <div className="self-center flex items-center text-sm text-[rgba(46,46,46,1)] font-normal leading-[1.2] mt-[11px]">
        <span className="self-stretch my-auto">Already have account?</span>
        <button 
          type="button" 
          onClick={() => navigate('/login')}
          disabled={isLoading}
          className="self-stretch my-auto font-bold ml-1 disabled:opacity-50"
        >
          Sign in
        </button>
      </div>

      <SocialLogin isLogin={false} />
    </form>
  );
};

export default RegisterForm;