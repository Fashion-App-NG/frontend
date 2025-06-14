import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService'; // ✅ Default import (no curly braces)
import { Logo } from '../Common/Logo';

export const OTPInput = ({ onSubmit, isLoading: propIsLoading }) => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [userType, setUserType] = useState('shopper');
  const [isLoading, setIsLoading] = useState(false); // ✅ Internal loading state
  const [lastResendTime, setLastResendTime] = useState(0); // ✅ Rate limiting
  const inputRefs = useRef([]);

  // ✅ Combine prop loading with internal loading
  const isActuallyLoading = propIsLoading || isLoading;

  // ✅ Rate limiting for resend requests
  const canResend = () => {
    const now = Date.now();
    const timeSinceLastResend = now - lastResendTime;
    const cooldownPeriod = 30 * 1000; // 30 seconds
    return timeSinceLastResend > cooldownPeriod;
  };

  useEffect(() => {
    // Get user data from sessionStorage
    const pendingEmail = sessionStorage.getItem('pendingVerificationEmail');
    const pendingUserId = sessionStorage.getItem('pendingVerificationUserId');
    const pendingUserType = sessionStorage.getItem('pendingUserType') || 'shopper';
    
    if (pendingEmail && pendingUserId) {
      setEmail(pendingEmail);
      setUserId(pendingUserId);
      setUserType(pendingUserType);
    } else {
      // Redirect based on user type
      navigate(pendingUserType === 'vendor' ? '/register/vendor' : '/register/shopper');
    }
  }, [navigate]);

  // User type configurations
  const userConfig = {
    shopper: {
      badge: { bg: '#3b82f6', text: 'Shopping Experience' },
      context: 'Email Verification',
      title: 'Verify Email',
      iconColor: 'text-blue-500',
      inputBorder: 'border-blue-200',
      focusRing: 'focus:ring-blue-500',
      buttonBg: 'bg-[#3b82f6] hover:bg-blue-700',
      buttonText: 'text-white',
      requestAgainColor: 'text-blue-600',
      image: {
        src: 'https://c.animaapp.com/mbgdqa1w85bFXv/img/mask-group.png',
        alt: 'Fashion model for shoppers'
      },
      redirectPath: '/login',
      message: 'Email verified successfully! Please sign in to continue.',
      description: 'To verify your email, simply enter the 6 digit code.'
    },
    vendor: {
      badge: { bg: '#22c55e', text: 'Vendor Portal' },
      context: 'Business Verification',
      title: 'Verify Email',
      iconColor: 'text-green-500',
      inputBorder: 'border-green-200',
      focusRing: 'focus:ring-green-500',
      buttonBg: 'bg-[#22c55e] hover:bg-green-600',
      buttonText: 'text-white',
      requestAgainColor: 'text-green-600',
      image: {
        src: '/images/vendor-banner.jpg',
        alt: 'Colorful fabric rolls and textiles for fashion vendors'
      },
      redirectPath: '/login/vendor',
      message: 'Email verified successfully! Please sign in to your vendor portal.',
      description: 'To verify your business email, simply enter the 6 digit code.'
    }
  };

  const config = userConfig[userType];

  // ✅ Enhanced handleChange with better validation
  const handleChange = (value, index) => {
    // Only allow numeric input and single character
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

  // ✅ Enhanced paste handling
  const handlePaste = (e, index) => {
    e.preventDefault();
    
    // Get pasted text
    const pastedData = e.clipboardData.getData('text/plain');
    
    // Clean and validate the pasted data
    const cleanedData = pastedData.replace(/\D/g, ''); // Remove non-digits
    
    if (cleanedData.length === 0) {
      setError('Please paste a valid verification code containing only numbers.');
      return;
    }

    // Handle different paste scenarios
    if (cleanedData.length === 6) {
      // Perfect case: 6-digit code
      const newOtp = cleanedData.split('').slice(0, 6);
      setOtp(newOtp);
      
      // Focus the last field or submit button
      const lastInput = inputRefs.current[5];
      if (lastInput) {
        lastInput.focus();
        // Small delay to ensure the value is set before blur
        setTimeout(() => lastInput.blur(), 50);
      }
      
      // Clear any existing errors
      setError('');
      
    } else if (cleanedData.length > 6) {
      // Too many digits - take first 6
      const newOtp = cleanedData.split('').slice(0, 6);
      setOtp(newOtp);
      
      // Focus the last field
      const lastInput = inputRefs.current[5];
      if (lastInput) lastInput.focus();
      
      // Show helpful message
      setError('');
      
    } else {
      // Not enough digits - fill from current position
      const newOtp = [...otp];
      const availableSlots = 6 - index;
      const digitsToUse = Math.min(cleanedData.length, availableSlots);
      
      for (let i = 0; i < digitsToUse; i++) {
        if (index + i < 6) {
          newOtp[index + i] = cleanedData[i];
        }
      }
      
      setOtp(newOtp);
      
      // Focus next empty field or last filled field
      const nextFocusIndex = Math.min(index + digitsToUse, 5);
      const nextInput = inputRefs.current[nextFocusIndex];
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Handle backspace to focus previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = inputRefs.current[index - 1];
      if (prevInput) prevInput.focus();
    }
    
    // Handle arrow keys for navigation
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      const prevInput = inputRefs.current[index - 1];
      if (prevInput) prevInput.focus();
    }
    
    if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) nextInput.focus();
    }

    // Handle Enter key to submit if all fields are filled
    if (e.key === 'Enter') {
      e.preventDefault();
      const otpCode = otp.join('');
      if (otpCode.length === 6) {
        handleSubmit(e);
      }
    }
  };

  // ✅ Auto-submit when all 6 digits are entered
  useEffect(() => {
    const otpCode = otp.join('');
    if (otpCode.length === 6 && otpCode.match(/^\d{6}$/)) {
      // Small delay to ensure user sees the complete code
      const timer = setTimeout(() => {
        // Auto-submit if all fields are filled
        const form = document.querySelector('form');
        if (form) {
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
          form.dispatchEvent(submitEvent);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [otp]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const otpCode = otp.join('');
      
      if (otpCode.length !== 6) {
        setError('Please enter all 6 digits');
        setIsLoading(false);
        return;
      }

      const response = await authService.verifyOTP({ // ✅ Now uses default import
        userId: userId, // ✅ Use userId instead of email
        code: otpCode,
      });

      console.log('✅ OTP verification successful:', response);
      
      // Clear stored verification data
      sessionStorage.removeItem('pendingVerificationEmail');
      sessionStorage.removeItem('pendingVerificationUserId');
      sessionStorage.removeItem('pendingUserType');

      // Redirect to login page
      setTimeout(() => {
        navigate(userType === 'vendor' ? '/login/vendor' : '/login', {
          state: { message: 'Account verified successfully! Please sign in.' }
        });
      }, 2000);

    } catch (error) {
      console.error('❌ OTP verification failed:', error);
      
      // Handle new error codes
      if (error.status === 400) {
        setError('Invalid or expired verification code. Please try again.');
      } else if (error.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(error.message || 'Verification failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Enhanced request again with rate limiting
  const handleRequestAgain = async () => {
    if (!email) {
      setError('Unable to resend code. Please try registering again.');
      return;
    }

    // ✅ Rate limiting check
    if (!canResend()) {
      const remainingTime = Math.ceil((30 * 1000 - (Date.now() - lastResendTime)) / 1000);
      setError(`Please wait ${remainingTime} seconds before requesting another code.`);
      return;
    }

    setError('');
    setIsLoading(true);
    setLastResendTime(Date.now()); // ✅ Update last resend time
    
    try {
      const response = await authService.resendOTP(email); // ✅ Now uses default import
      
      // Clear current OTP inputs
      setOtp(['', '', '', '', '', '']);
      
      // Focus first input
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
      
      console.log(`✅ ${userType} OTP resent successfully:`, response);

      // ✅ Show success message in a more React-friendly way
      // We'll add a success state to show positive feedback
      
    } catch (error) {
      console.error('❌ Failed to resend OTP:', error);
      
      // ✅ Enhanced error handling
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('missing email') || errorMessage.includes('400')) {
        setError('Email address is required to resend the verification code.');
      } else if (errorMessage.includes('user not found') || errorMessage.includes('404')) {
        setError('Account not found. Please try registering again or contact support.');
      } else if (errorMessage.includes('failed to resend') || errorMessage.includes('500')) {
        setError('Unable to send verification code. Please try again in a few minutes.');
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
        setError('Too many requests. Please wait before requesting another code.');
      } else {
        setError(error.message || 'Failed to resend verification code. Please try again.');
      }
      
      // ✅ Reset rate limiting on error (allow immediate retry for real errors)
      setLastResendTime(0);
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[rgba(249,249,249,1)] overflow-hidden min-h-screen">
      <div className="gap-5 flex max-md:flex-col max-md:items-stretch">
        {/* Content Section - LEFT SIDE */}
        <div className="w-6/12 max-md:w-full max-md:ml-0">
          <div className="flex w-full flex-col items-stretch mt-16 max-md:max-w-full max-md:mt-10 px-20 max-md:px-5">
            {/* Header */}
            <Logo />

            {/* Main Content */}
            <div className="flex flex-col mt-16 max-md:mt-10">
              {/* Dynamic User Type Indicator */}
              <div className="flex items-center gap-2 mb-6">
                <div 
                  className="text-white px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: config.badge.bg }}
                >
                  {config.badge.text}
                </div>
                <span className="text-[rgba(46,46,46,0.6)] text-sm">{config.context}</span>
              </div>

              <div className="flex items-center mb-8 md:mb-12">
                <h1 className="font-['Urbanist',Helvetica] font-bold text-black text-2xl md:text-3xl lg:text-[32px] leading-tight">
                  {config.title}
                </h1>
                <svg 
                  className={`ml-4 w-6 h-6 md:w-8 md:h-8 lg:w-[30px] lg:h-[30px] ${config.iconColor}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8 md:space-y-12">
                <div>
                  <p className="font-['Urbanist',Helvetica] font-normal text-black text-base leading-normal mb-4">
                    {config.description} <br />
                    We've sent a verification code to:
                  </p>
                  <p className="font-['Urbanist',Helvetica] font-semibold text-black text-base break-all">
                    {email}
                  </p>
                  <p className="font-['Urbanist',Helvetica] font-normal text-gray-500 text-sm mt-2">
                    Code expires in 10 minutes. You can type or paste the code.
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p className="text-sm md:text-base">{error}</p>
                    {error.includes('expired') && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={handleRequestAgain}
                          disabled={isLoading}
                          className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                        >
                          Request New Code
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Enhanced OTP Input Fields */}
                <div className="flex gap-2 md:gap-2.5 justify-start flex-wrap">
                  {Array(6)
                    .fill(0)
                    .map((_, index) => (
                      <input
                        key={`verification-otp-${index}`}  // ✅ Descriptive and unique to this component
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*" // ✅ iOS numeric keyboard
                        value={otp[index]}
                        onChange={(e) => handleChange(e.target.value, index)}
                        onPaste={(e) => handlePaste(e, index)} // ✅ Paste handler
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        disabled={isLoading}
                        className={`w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-white shadow-[0px_4px_4px_#00000040] border ${config.inputBorder} rounded-md text-center text-lg md:text-xl font-semibold focus:outline-none focus:ring-2 ${config.focusRing} focus:border-transparent disabled:opacity-50 transition-all duration-200`}
                        maxLength={1}
                        autoComplete="one-time-code" // ✅ Browser autofill support
                        aria-label={`Digit ${index + 1} of verification code`} // ✅ Accessibility
                      />
                    ))}
                </div>

                <p className="font-['Urbanist',Helvetica] font-normal text-black text-base leading-normal">
                  <span className="text-[#27272b]">Didn't get the code?</span>
                  <button
                    type="button"
                    onClick={handleRequestAgain}
                    disabled={isLoading}
                    className={`font-bold ${config.requestAgainColor} cursor-pointer hover:underline ml-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
                  >
                    {isLoading ? 'Sending...' : 'Request again'} {/* ✅ Show loading state */}
                  </button>
                </p>

                {/* ✅ Enhanced Continue Button with loading state */}
                <div className="mt-8 md:mt-12 mb-8">
                  <button
                    type="submit"
                    disabled={isLoading || otp.join('').length !== 6}
                    className={`w-full max-w-lg ${config.buttonBg} ${config.buttonText} h-12 md:h-14 lg:h-[60px] rounded-3xl md:rounded-[44px] font-['Urbanist',Helvetica] font-bold text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Sending...
                      </span>
                    ) : 'Continue'}
                  </button>
                  <p className="text-center text-sm text-gray-500 mt-2">
                    {isLoading ? 'Please wait...' : 'Code will auto-submit when complete'}
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Dynamic Image Section - RIGHT SIDE */}
        <div className="w-6/12 ml-5 max-md:w-full max-md:ml-0 max-md:hidden">
          <img
            className="aspect-[0.58] object-contain w-full grow rounded-[0px_0px_0px_0px] max-md:max-w-full max-md:mt-10"
            alt={config.image.alt}
            src={config.image.src}
          />
        </div>
      </div>
    </div>
  );
};

export default OTPInput;