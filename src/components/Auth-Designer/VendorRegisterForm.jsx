import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PasswordInput } from './PasswordInput';
import { SocialLogin } from './SocialLogin';
import { authService } from '../../services/authService';

export const VendorRegisterForm = () => {
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
      storeName: formData.get('storeName'),
      password: formData.get('password'),
      repeatPassword: formData.get('repeatPassword'),
      terms: formData.get('terms')
    };

    // Client-side validation
    if (!data.email || !data.storeName || !data.password || !data.repeatPassword) {
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
      // Call the vendor registration API (to be implemented)
      const response = await authService.registerVendor({
        email: data.email,
        storeName: data.storeName,
        password: data.password,
        userType: 'vendor'
      });

      console.log('🔥 Vendor registration response:', response);

      const userId = response.extractedUserId;
      
      if (!userId) {
        setError('Registration successful but verification setup failed. Please try again.');
        setIsLoading(false);
        return;
      }

      setSuccess('Vendor registration successful! Please check your email for verification code.');
      
      // Store email and userId for OTP verification
      sessionStorage.setItem('pendingVerificationEmail', data.email);
      sessionStorage.setItem('pendingVerificationUserId', userId);
      sessionStorage.setItem('pendingUserType', 'vendor');
      
      // Redirect to OTP verification page
      setTimeout(() => {
        navigate('/verify-otp');
      }, 2000);

    } catch (error) {
      console.error('❌ Vendor registration error:', error);
      
      if (error.message.includes('already exists')) {
        setError('This email is already registered. Please use a different email or try logging in.');
      } else {
        setError(error.message || 'Registration failed. Please try again.');
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
        <span className="text-[rgba(46,46,46,0.6)] text-sm">Business Registration</span>
      </div>

      <div className="flex flex-col items-stretch mt-[32px] max-md:ml-1 max-md:mt-6">
        <h1 className="text-black text-[32px] font-bold">
          Create Vendor Account
        </h1>
        <p className="text-[rgba(46,46,46,1)] text-base font-normal leading-[1.2] mt-[5px]">
          Start selling on our platform today!
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

      {/* Repeat Password Field */}
      <label className="text-[rgba(46,46,46,1)] text-sm font-normal leading-[1.2] mt-[9px]">
        Repeat Password
      </label>
      <PasswordInput 
        name="repeatPassword"
        placeholder="Repeat Password" 
        disabled={isLoading}
      />

      {/* Terms and Conditions */}
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

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="self-stretch bg-[rgba(46,46,46,1)] min-h-[52px] text-base text-[rgba(237,255,140,1)] font-bold leading-[1.2] mt-[29px] px-4 py-[21px] rounded-[26px] max-md:max-w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Creating account...' : 'Create Vendor Account'}
      </button>

      {/* Navigation Link */}
      <div className="self-center flex items-center text-sm text-[rgba(46,46,46,1)] font-normal leading-[1.2] mt-[11px]">
        <span className="self-stretch my-auto">Already have an account?</span>
        <button 
          type="button"
          onClick={() => navigate('/login/vendor')}  // ✅ Fixed: Routes to vendor login
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

export default VendorRegisterForm;