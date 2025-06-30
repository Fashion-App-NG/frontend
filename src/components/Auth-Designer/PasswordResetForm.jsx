import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { PasswordInput } from './PasswordInput';

export const PasswordResetForm = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('shopper'); // ✅ Track user type
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState('otp');
  const [lastResendTime, setLastResendTime] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Get email and user type from session storage
    const resetEmail = sessionStorage.getItem('passwordResetEmail');
    const resetUserType = sessionStorage.getItem('passwordResetUserType') || 'shopper';
    
    if (resetEmail) {
      setEmail(resetEmail);
      setUserType(resetUserType);
      console.log('🔍 Retrieved user type for password reset:', resetUserType);
    } else {
      // Redirect to forgot password if no email found
      navigate('/forgot-password');
    }
  }, [navigate]);

  // ✅ Enhanced navigation based on user type
  const getLoginPath = (userType) => {
    console.log('🎯 Determining login path for user type:', userType);
    switch (userType) {
      case 'vendor':
        return '/login/vendor';
      case 'admin':
        return '/admin/login';
      case 'shopper':
      default:
        return '/login';
    }
  };

  // Rate limiting for resend
  const canResend = () => {
    const now = Date.now();
    const timeSinceLastResend = now - lastResendTime;
    const cooldownPeriod = 30 * 1000; // 30 seconds
    return timeSinceLastResend > cooldownPeriod;
  };

  // ✅ FIXED: Use useCallback to memoize handleOtpSubmit
  const handleOtpSubmit = useCallback(async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setError('');
    setStep('password');
  }, [otp]); // ✅ Include otp as dependency since it's used inside

  const handleOtpChange = (value, index) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = inputRefs.current[index + 1];
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleOtpPaste = (e, index) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain');
    const cleanedData = pastedData.replace(/\D/g, '');
    
    if (cleanedData.length === 6) {
      const newOtp = cleanedData.split('').slice(0, 6);
      setOtp(newOtp);
      
      const lastInput = inputRefs.current[5];
      if (lastInput) lastInput.focus();
      setError('');
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = inputRefs.current[index - 1];
      if (prevInput) prevInput.focus();
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const otpCode = otp.join('');
      if (otpCode.length === 6) {
        handleOtpSubmit(); // ✅ This will work with useCallback
      }
    }
  };

  // ✅ FIXED: Now we can safely include handleOtpSubmit in dependencies
  useEffect(() => {
    const otpCode = otp.join('');
    if (otpCode.length === 6 && otpCode.match(/^\d{6}$/)) {
      const timer = setTimeout(() => {
        handleOtpSubmit(); // ✅ Safe to call with useCallback
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [otp, handleOtpSubmit]); // ✅ Include handleOtpSubmit in dependencies

  // ✅ Fixed password reset with proper navigation
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.target);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (!password || !confirmPassword) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.resetPassword({
        email: email,
        code: otp.join(''),
        password: password
      });

      console.log('✅ Password reset successful:', response);
      
      // Clear session data
      sessionStorage.removeItem('passwordResetEmail');
      sessionStorage.removeItem('passwordResetUserType');
      
      setSuccess(response.message || 'Password reset successfully.');
      
      // ✅ Navigate to appropriate login page based on user type
      const loginPath = getLoginPath(userType);
      console.log(`🎯 Redirecting ${userType} to ${loginPath}`);
      
      setTimeout(() => {
        navigate(loginPath, {
          state: { message: 'Password reset successful! Please sign in with your new password.' }
        });
      }, 2000);

    } catch (error) {
      console.error('❌ Password reset failed:', error);
      
      if (error.message.includes('Missing fields') || error.message.includes('400')) {
        setError('Invalid or expired reset code. Please try again.');
        setStep('otp');
      } else if (error.message.includes('User not found') || error.message.includes('404')) {
        setError('Account not found. Please try the forgot password process again.');
        navigate('/forgot-password');
      } else if (error.message.includes('500')) {
        setError('Unable to reset password at this time. Please try again later.');
      } else {
        setError(error.message || 'Password reset failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Also fix the "Remember your password?" link
  const handleBackToLogin = () => {
    const loginPath = getLoginPath(userType);
    navigate(loginPath);
  };

  const handleResendCode = async () => {
    if (!canResend()) {
      const remainingTime = Math.ceil((30 * 1000 - (Date.now() - lastResendTime)) / 1000);
      setError(`Please wait ${remainingTime} seconds before requesting another code.`);
      return;
    }

    setError('');
    setIsLoading(true);
    setLastResendTime(Date.now());
    
    try {
      const response = await authService.forgotPassword(email);
      setOtp(['', '', '', '', '', '']);
      
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
      
      console.log('✅ Reset code resent successfully:', response);
      
    } catch (error) {
      console.error('❌ Failed to resend reset code:', error);
      setError(error.message || 'Failed to resend reset code. Please try again.');
      setLastResendTime(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Password Reset Indicator with user type */}
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-[#3b82f6] text-white px-3 py-1 rounded-full text-xs font-semibold">
          Password Reset
        </div>
        <span className="text-[rgba(46,46,46,0.6)] text-sm">
          {step === 'otp' ? 'Verify Code' : 'Set New Password'} • {userType.charAt(0).toUpperCase() + userType.slice(1)}
        </span>
      </div>

      {step === 'otp' ? (
        // OTP Verification Step
        <div className="flex flex-col">
          <div className="flex flex-col items-stretch mt-[32px] max-md:ml-1 max-md:mt-6">
            <h1 className="text-black text-[32px] font-bold">
              Enter Reset Code
            </h1>
            <p className="text-[rgba(46,46,46,1)] text-base font-normal leading-[1.2] mt-[5px]">
              We've sent a 6-digit code to your email
            </p>
            <p className="text-[rgba(46,46,46,1)] text-base font-semibold leading-[1.2] mt-2 break-all">
              {email}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
              {error}
            </div>
          )}

          {/* OTP Input Fields */}
          <div className="flex gap-2 md:gap-2.5 justify-start flex-wrap mt-8">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  key={`password-reset-otp-${index}`}  // ✅ Descriptive and unique
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={otp[index]}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onPaste={(e) => handleOtpPaste(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  disabled={isLoading}
                  className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-white shadow-[0px_4px_4px_#00000040] border border-blue-200 rounded-md text-center text-lg md:text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-all duration-200"
                  maxLength={1}
                  autoComplete="one-time-code"
                  aria-label={`Digit ${index + 1} of reset code`}
                />
              ))}
          </div>

          <p className="font-['Urbanist',Helvetica] font-normal text-black text-base leading-normal mt-6">
            <span className="text-[#27272b]">Didn't get the code?</span>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isLoading}
              className="font-bold text-blue-600 cursor-pointer hover:underline ml-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? 'Sending...' : 'Request again'}
            </button>
          </p>

          <button
            type="button"
            onClick={handleOtpSubmit} // ✅ This will now work
            disabled={isLoading || otp.join('').length !== 6}
            className="self-stretch bg-[rgba(46,46,46,1)] min-h-[52px] text-base text-[rgba(237,255,140,1)] font-bold leading-[1.2] mt-[29px] px-4 py-[21px] rounded-[26px] max-md:max-w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      ) : (
        // Password Reset Step
        <form onSubmit={handlePasswordReset} className="flex flex-col">
          <div className="flex flex-col items-stretch mt-[32px] max-md:ml-1 max-md:mt-6">
            <h1 className="text-black text-[32px] font-bold">
              Set New Password
            </h1>
            <p className="text-[rgba(46,46,46,1)] text-base font-normal leading-[1.2] mt-[5px]">
              Create a strong password for your account
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

          {/* New Password Field */}
          <label className="text-[rgba(46,46,46,1)] text-sm font-normal leading-[1.2] mt-[42px] max-md:mt-10">
            New Password
          </label>
          <PasswordInput 
            name="password"
            placeholder="Enter new password" 
            disabled={isLoading}
          />

          {/* Confirm Password Field */}
          <label className="text-[rgba(46,46,46,1)] text-sm font-normal leading-[1.2] mt-[9px]">
            Confirm New Password
          </label>
          <PasswordInput 
            name="confirmPassword"
            placeholder="Confirm new password" 
            disabled={isLoading}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="self-stretch bg-[rgba(46,46,46,1)] min-h-[52px] text-base text-[rgba(237,255,140,1)] font-bold leading-[1.2] mt-[29px] px-4 py-[21px] rounded-[26px] max-md:max-w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
      )}

      {/* Navigation Links with proper routing */}
      <div className="self-center flex items-center text-sm text-[rgba(46,46,46,1)] font-normal leading-[1.2] mt-[11px]">
        <span className="self-stretch my-auto">Remember your password?</span>
        <button 
          type="button"
          onClick={handleBackToLogin}
          disabled={isLoading}
          className="self-stretch my-auto font-bold ml-1 disabled:opacity-50"
        >
          Sign in
        </button>
      </div>
    </div>
  );
};

export default PasswordResetForm;