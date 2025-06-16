import React, { useState } from 'react';

export const PasswordInput = ({ placeholder, name, disabled = false }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="bg-[rgba(242,242,242,1)] border flex min-h-[60px] items-center text-base text-[rgba(180,180,180,1)] font-normal leading-[19px] flex-wrap mt-[9px] px-4 py-[18px] rounded-[5px] border-[rgba(203,203,203,1)] border-solid max-md:max-w-full">
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        disabled={disabled}
        required
        className="grow shrink w-[103px] my-auto bg-transparent border-none outline-none disabled:opacity-50"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        disabled={disabled}
        tabIndex={-1}
        className="focus:outline-none disabled:opacity-50 hover:opacity-75 transition-opacity duration-200 p-1"
        aria-label={showPassword ? "Hide password" : "Show password"}
        title={showPassword ? "Hide password" : "Show password"} // ✅ Tooltip
      >
        {/* ✅ SVG icons for better control and consistency */}
        {showPassword ? (
          // Eye with slash (hide password)
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            className="w-6 h-6 text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <path 
              d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <line 
              x1="1" 
              y1="1" 
              x2="23" 
              y2="23" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          // Regular eye (show password)
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            className="w-6 h-6 text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <path 
              d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <circle 
              cx="12" 
              cy="12" 
              r="3" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
};

export default PasswordInput;