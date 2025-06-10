import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../Common/Logo';
import { authService } from '../../services/authService';

export const OTPInput = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    // Get the email and userId from sessionStorage
    const pendingEmail = sessionStorage.getItem('pendingVerificationEmail');
    const pendingUserId = sessionStorage.getItem('pendingVerificationUserId');
    
    if (pendingEmail && pendingUserId) {
      setEmail(pendingEmail);
      setUserId(pendingUserId);
    } else {
      // If no pending verification data, redirect to register
      navigate('/register');
    }
  }, [navigate]);

  const handleChange = (value, index) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    // Handle backspace to focus previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Call the OTP verification API
      const response = await authService.verifyOTP({
        userId: userId,
        code: otpCode
      });

      console.log('OTP verification successful:', response);
      
      // Clear the pending verification data from sessionStorage
      sessionStorage.removeItem('pendingVerificationEmail');
      sessionStorage.removeItem('pendingVerificationUserId');
      
      // Redirect to login page after successful verification
      navigate('/login', { 
        state: { 
          message: 'Email verified successfully! Please sign in to continue.' 
        }
      });

    } catch (error) {
      console.error('OTP verification failed:', error);
      
      // Handle specific error cases
      if (error.message.includes('expired') || error.message.includes('Invalid or expired')) {
        setError('Your verification code has expired or is invalid. Please request a new one.');
      } else {
        setError(error.message || 'Invalid verification code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestAgain = async () => {
    if (!email) {
      setError('Unable to resend code. Please try registering again.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Call resend OTP API with email
      await authService.resendOTP(email);
      
      // Clear current OTP
      setOtp(['', '', '', '', '', '']);
      
      // Focus first input
      document.getElementById('otp-0')?.focus();
      
      // Show success message
      console.log('OTP resent successfully');

    } catch (error) {
      console.error('Failed to resend OTP:', error);
      
      if (error.message.includes('not found')) {
        setError('User not found. Please try registering again.');
      } else {
        setError(error.message || 'Failed to resend code. Please try again.');
      }
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
              <div className="flex items-center mb-8 md:mb-12">
                <h1 className="font-['Urbanist',Helvetica] font-bold text-black text-2xl md:text-3xl lg:text-[32px] leading-tight">
                  Verify Email
                </h1>
                <svg 
                  className="ml-4 w-6 h-6 md:w-8 md:h-8 lg:w-[30px] lg:h-[30px] text-green-500" 
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
                    To verify your email, simply enter the 6 digit code. <br />
                    We've sent a verification code to:
                  </p>
                  <p className="font-['Urbanist',Helvetica] font-semibold text-black text-base break-all">
                    {email}
                  </p>
                  <p className="font-['Urbanist',Helvetica] font-normal text-gray-500 text-sm mt-2">
                    Code expires in 10 minutes.
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

                {/* OTP Input Fields */}
                <div className="flex gap-2 md:gap-2.5 justify-start flex-wrap">
                  {Array(6)
                    .fill(0)
                    .map((_, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        value={otp[index]}
                        onChange={(e) => handleChange(e.target.value, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        disabled={isLoading}
                        className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-white shadow-[0px_4px_4px_#00000040] border border-gray-200 rounded-md text-center text-lg md:text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                        maxLength={1}
                      />
                    ))}
                </div>

                <p className="font-['Urbanist',Helvetica] font-normal text-black text-base leading-normal">
                  <span className="text-[#27272b]">Didn't get the code?</span>
                  <button
                    type="button"
                    onClick={handleRequestAgain}
                    disabled={isLoading}
                    className="font-bold text-[#2d2d2d] cursor-pointer hover:underline ml-1 disabled:opacity-50"
                  >
                    Request again
                  </button>
                </p>
              </form>

              {/* Continue Button - Always visible */}
              <div className="mt-8 md:mt-12 mb-8">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full max-w-lg bg-[#2d2d2d] h-12 md:h-14 lg:h-[60px] rounded-3xl md:rounded-[44px] font-['Urbanist',Helvetica] font-bold text-[#edff8c] text-base hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Verifying...' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Image Section - RIGHT SIDE */}
        <div className="w-6/12 ml-5 max-md:w-full max-md:ml-0 max-md:hidden">
          <img
            className="aspect-[0.58] object-contain w-full grow rounded-[0px_0px_0px_0px] max-md:max-w-full max-md:mt-10"
            alt="Fashion garment"
            src="https://c.animaapp.com/mbj1xmz6047TVI/img/mask-group.png"
          />
        </div>
      </div>
    </div>
  );
};

export default OTPInput;