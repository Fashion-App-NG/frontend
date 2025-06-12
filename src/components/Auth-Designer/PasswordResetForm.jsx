import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PasswordInput } from './PasswordInput';
import { authService } from '../../services/authService';

export const PasswordResetForm = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState('otp'); // 'otp' or 'password'
  const [lastResendTime, setLastResendTime] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Get email from session storage
    const resetEmail = sessionStorage.getItem('passwordResetEmail');
    
    if (resetEmail) {
      setEmail(resetEmail);
    } else {
      // Redirect to forgot password if no email found
      navigate('/forgot-password');
    }
  }, [navigate]);

  // Rate limiting for resend
  const canResend = () => {
    const now = Date.now();
    const timeSinceLastResend = now - lastResendTime;
    const cooldownPeriod = 30 * 1000; // 30 seconds
    return timeSinceLastResend > cooldownPeriod;
  };

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
        handleOtpSubmit();
      }
    }
  };

  const handleOtpSubmit = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setError('');
    setStep('password');
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.target);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    // Validation
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
      
      setSuccess(response.message || 'Password reset successfully.');
      
      // Redirect to login after success
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Password reset successful! Please sign in with your new password.' }
        });
      }, 2000);

    } catch (error) {
      console.error('❌ Password reset failed:', error);
      
      if (error.message.includes('Missing fields') || error.message.includes('400')) {
        setError('Invalid or expired reset code. Please try again.');
        setStep('otp'); // Go back to OTP step
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

  // Auto-submit OTP when complete
  useEffect(() => {
    const otpCode = otp.join('');
    if (otpCode.length === 6 && otpCode.match(/^\d{6}$/) && step === 'otp') {
      const timer = setTimeout(() => {
        handleOtpSubmit();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [otp, step]);

  return (
    <div className="flex flex-col">
      {/* Password Reset Indicator */}
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-[#3b82f6] text-white px-3 py-1 rounded-full text-xs font-semibold">
          Password Reset
        </div>
        <span className="text-[rgba(46,46,46,0.6)] text-sm">
          {step === 'otp' ? 'Verify Code' : 'Set New Password'}
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
                  key={index}
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
            onClick={handleOtpSubmit}
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
    </div>
  );
};

export default PasswordResetForm;