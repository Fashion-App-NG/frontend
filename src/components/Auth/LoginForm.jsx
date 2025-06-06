import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PasswordInput } from './PasswordInput';

export const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check if there's a success message from OTP verification
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after showing it
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [location.state]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      email: formData.get('email'),
      password: formData.get('password')
    };
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col max-w-[564px]">
      <div className="flex flex-col items-stretch mt-[66px] max-md:ml-1 max-md:mt-10">
        <h1 className="text-black text-[32px] font-bold">
          Sign in
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

      <label className="text-[rgba(46,46,46,1)] text-sm font-normal leading-[1.2] mt-[42px] max-md:mt-10">
        Email Address
      </label>
      <input
        type="email"
        name="email"
        placeholder="Enter your email"
        className="self-stretch bg-[rgba(242,242,242,1)] border min-h-[61px] gap-[5px] text-base text-[rgba(180,180,180,1)] font-normal leading-[1.2] mt-4 px-4 py-[21px] rounded-[5px] border-[rgba(203,203,203,1)] border-solid"
      />

      <label className="text-[rgba(46,46,46,1)] text-sm font-normal leading-[1.2] mt-[9px]">
        Password
      </label>
      <PasswordInput 
        name="password"
        placeholder="Enter Password" 
        eyeIconUrl="https://cdn.builder.io/api/v1/image/assets/ea356ae0f1da43fbbc02727416114024/fa61a7ea2e8a3f0de0c22adc1913896bf9ccc751?placeholderIfAbsent=true" 
      />

      <div className="flex justify-end mt-2">
        <button 
          type="button" 
          className="text-[rgba(46,46,46,1)] text-sm font-normal underline hover:no-underline"
        >
          Forgot Password
        </button>
      </div>

      <button
        type="submit"
        className="self-stretch bg-[rgba(46,46,46,1)] min-h-[52px] text-base text-[rgba(237,255,140,1)] font-bold leading-[1.2] mt-[29px] px-4 py-[21px] rounded-[26px] max-md:max-w-full"
      >
        Sign in
      </button>

      <div className="self-center flex items-center text-sm text-[rgba(46,46,46,1)] font-normal leading-[1.2] mt-[11px]">
        <span className="self-stretch my-auto">New here?</span>
        <button 
          type="button" 
          onClick={() => navigate('/register')}
          className="self-stretch my-auto font-bold ml-1"
        >
          Sign up
        </button>
      </div>
    </form>
  );
};

export default LoginForm;